/**
 * Migration script: SQLite (numeris.db) → Supabase (Postgres)
 *
 * Migrates ALL tables defined in src/libs/db/schema.ts to Supabase
 * using the service_role key (bypasses RLS).
 *
 * Usage:
 *   1. Ensure dependencies: @supabase/supabase-js, better-sqlite3, dotenv, tsx
 *   2. Set env vars in .env (or .env.local):
 *        NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
 *        SUPABASE_SERVICE_ROLE_KEY=eyJ...
 *   3. Run the schema DDL against Supabase first (Postgres-compatible variant)
 *   4. Run: npm run db:migrate:supabase
 *
 * Behaviour:
 *   - Walks tables in FK dependency order (parents → children)
 *   - Converts SQLite INTEGER 0/1 → Postgres boolean for known boolean columns
 *   - Upserts in chunks of 500 rows (onConflict per-table)
 *   - On error: logs and continues (does NOT abort the whole migration)
 *   - Skips missing tables with a warning
 *   - Prints a final summary report
 */

import dotenv from "dotenv";
import path from "node:path";
import Database from "better-sqlite3";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Load .env.local first (Next.js convention), fallback to .env.
dotenv.config({ path: path.join(process.cwd(), ".env.local") });
dotenv.config();

// ─── Config ────────────────────────────────────────────────────────────────

const DB_PATH = path.join(process.cwd(), "numeris.db");
const CHUNK_SIZE = 500;

// ─── Table descriptors ─────────────────────────────────────────────────────
// Ordered so parents come before children (FK-safe).
// `onConflict` is the unique column (or comma-joined composite) used for upsert.
// `booleanColumns` lists columns stored as INTEGER 0/1 in SQLite but typed
// boolean in Postgres — we coerce them client-side.

type TableSpec = {
  name: string;
  onConflict: string;
  booleanColumns?: string[];
};

const TABLES: TableSpec[] = [
  // ── Source registry (referenced by directory_* tables) ─────────────────
  {
    name: "source_registry",
    onConflict: "source_key",
    booleanColumns: ["requires_legal_review"],
  },

  // ── Core editorial / marketing tables ──────────────────────────────────
  { name: "services", onConflict: "slug" },
  { name: "team_members", onConflict: "slug" },
  { name: "pricing_plans", onConflict: "slug", booleanColumns: ["featured"] },
  {
    name: "pricing_tiers",
    onConflict: "slug",
    booleanColumns: ["highlighted"],
  },
  { name: "faq_items", onConflict: "id" },
  { name: "pages", onConflict: "slug" },

  // ── Clustering / KG (parents first) ────────────────────────────────────
  { name: "silos", onConflict: "slug" },
  { name: "hubs", onConflict: "slug" },
  { name: "clusters", onConflict: "slug" },
  { name: "keyword_pages", onConflict: "slug" },

  // ── Page content (sections, SEO, meta) ─────────────────────────────────
  { name: "page_sections", onConflict: "route,slug,section_order" },
  { name: "seo_overrides", onConflict: "route,slug" },
  { name: "page_meta", onConflict: "route,slug" },

  // ── Geo / taxonomy ─────────────────────────────────────────────────────
  // NB: local SQLite uses singular table names (villes/departements/secteurs).
  // Aliases below cover both naming variants so the script works if the
  // Postgres schema mirrors either convention.
  { name: "villes", onConflict: "slug" },
  { name: "departements", onConflict: "slug" },
  { name: "secteurs", onConflict: "slug" },
  { name: "profession_categories", onConflict: "slug" },
  { name: "professions", onConflict: "slug" },

  // ── KG edges ───────────────────────────────────────────────────────────
  { name: "kg_edges", onConflict: "source_slug,target_slug,edge_type" },

  // ── Testimonials (after team/services since some FKs may exist) ────────
  {
    name: "testimonials",
    onConflict: "id",
    booleanColumns: ["featured", "_fictional"],
  },

  // ── Join tables (depend on services + geo/professions) ─────────────────
  { name: "service_secteur", onConflict: "service_slug,secteur_slug" },
  { name: "service_ville", onConflict: "service_slug,ville_slug" },
  { name: "service_profession", onConflict: "service_slug,profession_slug" },

  // ── Directory layer (RNE / Sirene / OEC) ───────────────────────────────
  { name: "cities_official", onConflict: "code_insee" },
  {
    name: "directory_cabinets",
    onConflict: "id",
    booleanColumns: ["is_active"],
  },
  {
    name: "directory_establishments",
    onConflict: "id",
    booleanColumns: ["is_headquarter", "is_active"],
  },
  {
    name: "directory_experts",
    onConflict: "id",
    booleanColumns: ["is_displayable"],
  },
  {
    name: "directory_source_events",
    onConflict: "id",
    booleanColumns: ["parsed_ok"],
  },
  { name: "profile_claims", onConflict: "id" },
  { name: "privacy_suppression_requests", onConflict: "id" },

  // ── Affiliation / commercial layer ─────────────────────────────────────
  {
    name: "affiliate_programs",
    onConflict: "slug",
    booleanColumns: [
      "has_affiliate",
      "has_referral",
      "has_apporteur",
      "recurrent",
      "is_active",
    ],
  },
  { name: "commercial_pages", onConflict: "slug" },
  {
    name: "page_affiliate_programs",
    onConflict: "route,page_slug,program_slug",
    booleanColumns: ["is_primary"],
  },
  { name: "commercial_links", onConflict: "source_slug,target_slug,edge_type" },
];

// ─── Helpers ───────────────────────────────────────────────────────────────

type TableStats = {
  table: string;
  rows_read: number;
  rows_written: number;
  errors: number;
  status: "ok" | "partial" | "failed" | "skipped" | "missing";
  firstError?: string;
};

function tableExists(db: Database.Database, table: string): boolean {
  const row = db
    .prepare(
      `SELECT name FROM sqlite_master WHERE type='table' AND name = ?`,
    )
    .get(table) as { name?: string } | undefined;
  return Boolean(row?.name);
}

function coerceBooleans(
  rows: Record<string, unknown>[],
  booleanColumns: string[] | undefined,
): Record<string, unknown>[] {
  if (!booleanColumns || booleanColumns.length === 0) return rows;
  return rows.map((row) => {
    const out: Record<string, unknown> = { ...row };
    for (const col of booleanColumns) {
      if (col in out && out[col] !== null && out[col] !== undefined) {
        const v = out[col];
        if (typeof v === "number") out[col] = v !== 0;
        else if (typeof v === "string") out[col] = v === "1" || v === "true";
        else if (typeof v === "boolean") out[col] = v;
      }
    }
    return out;
  });
}

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

async function migrateTable(
  db: Database.Database,
  supabase: SupabaseClient,
  spec: TableSpec,
): Promise<TableStats> {
  const stats: TableStats = {
    table: spec.name,
    rows_read: 0,
    rows_written: 0,
    errors: 0,
    status: "ok",
  };

  if (!tableExists(db, spec.name)) {
    console.warn(`  [skip] ${spec.name}: table not found in SQLite`);
    stats.status = "missing";
    return stats;
  }

  let rows: Record<string, unknown>[];
  try {
    rows = db
      .prepare(`SELECT * FROM ${spec.name}`)
      .all() as Record<string, unknown>[];
  } catch (err) {
    stats.status = "failed";
    stats.errors = 1;
    stats.firstError = (err as Error).message;
    console.error(`  [error] ${spec.name}: SELECT failed →`, stats.firstError);
    return stats;
  }

  stats.rows_read = rows.length;
  if (rows.length === 0) {
    console.log(`  [empty] ${spec.name}: 0 rows`);
    return stats;
  }

  const coerced = coerceBooleans(rows, spec.booleanColumns);
  const batches = chunk(coerced, CHUNK_SIZE);

  console.log(
    `  → ${spec.name}: ${rows.length} rows in ${batches.length} batch(es)…`,
  );

  for (let i = 0; i < batches.length; i++) {
    const batch = batches[i];
    const { error, data } = await supabase
      .from(spec.name)
      .upsert(batch, { onConflict: spec.onConflict })
      .select(spec.onConflict.split(",")[0].trim());

    if (error) {
      stats.errors += 1;
      if (!stats.firstError) stats.firstError = error.message;
      console.error(
        `    [error] ${spec.name} batch ${i + 1}/${batches.length} (${batch.length} rows): ${error.message}`,
      );
      stats.status = stats.rows_written > 0 ? "partial" : "failed";
    } else {
      stats.rows_written += data?.length ?? batch.length;
    }
  }

  if (stats.errors === 0) stats.status = "ok";
  else if (stats.rows_written > 0) stats.status = "partial";
  else stats.status = "failed";

  return stats;
}

function printSummary(allStats: TableStats[]) {
  console.log("\n" + "═".repeat(80));
  console.log("MIGRATION SUMMARY");
  console.log("═".repeat(80));

  const pad = (s: string, n: number) => s.padEnd(n, " ");
  console.log(
    pad("Table", 38) +
      pad("Read", 8) +
      pad("Written", 10) +
      pad("Errors", 8) +
      "Status",
  );
  console.log("-".repeat(80));

  let totalRead = 0;
  let totalWritten = 0;
  let totalErrors = 0;

  for (const s of allStats) {
    totalRead += s.rows_read;
    totalWritten += s.rows_written;
    totalErrors += s.errors;
    console.log(
      pad(s.table, 38) +
        pad(String(s.rows_read), 8) +
        pad(String(s.rows_written), 10) +
        pad(String(s.errors), 8) +
        s.status,
    );
  }

  console.log("-".repeat(80));
  console.log(
    pad("TOTAL", 38) +
      pad(String(totalRead), 8) +
      pad(String(totalWritten), 10) +
      pad(String(totalErrors), 8),
  );
  console.log("═".repeat(80));

  const failed = allStats.filter(
    (s) => s.status === "failed" || s.status === "partial",
  );
  if (failed.length > 0) {
    console.log("\nFailures (first error per table):");
    for (const s of failed) {
      console.log(`  - ${s.table}: ${s.firstError ?? "(no message)"}`);
    }
  }
}

// ─── Main ──────────────────────────────────────────────────────────────────

async function migrate() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    console.error(
      "Missing env vars. Required: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY",
    );
    process.exit(1);
  }

  console.log(`Source : SQLite @ ${DB_PATH}`);
  console.log(`Target : Supabase @ ${url}`);
  console.log(`Tables : ${TABLES.length}\n`);

  const db = new Database(DB_PATH, { readonly: true });

  const supabase = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const allStats: TableStats[] = [];

  for (const spec of TABLES) {
    const stats = await migrateTable(db, supabase, spec);
    allStats.push(stats);
  }

  db.close();

  printSummary(allStats);

  const anyFailed = allStats.some(
    (s) => s.status === "failed" || s.status === "partial",
  );
  if (anyFailed) {
    console.log(
      "\nMigration finished with errors. Review the summary above.",
    );
    process.exit(2);
  }

  console.log("\nMigration complete.");
}

migrate().catch((err) => {
  console.error("Fatal migration error:", err);
  process.exit(1);
});
