/**
 * Surgical SQLite → Supabase migration for the Skoria LMNP + keyword-LP work ONLY.
 *
 * Unlike `migrate-supabase.ts` (full-table sync), this pushes only the rows that
 * belong to the Skoria cluster so it does NOT touch unrelated WIP rows that also
 * live in the shared content tables (avis / codes-parrainage / comparatifs …).
 *
 *   keyword_pages  : whole table (disposition/redirect_to du triage LP + purge
 *                    des meta legacy) — REPLACE-SYNC des colonnes via upsert(slug)
 *   maillage_links : whole table (maillage-v3 + réparations triage) — REPLACE
 *                    (delete-all + insert : le triage a PURGÉ des rows en SQLite,
 *                    un simple upsert laisserait les liens morts côté Supabase)
 *   page_sections  : route='guides'  OR generated_by_model IN ('maillage-v3','ressources-hub-v1','keyword-lp-v1')
 *   seo_overrides  : route='guides'  OR generated_by_model IN ('ressources-hub-v1','keyword-lp-v1')
 *   page_meta      : route='guides'  OR pipeline_run_id LIKE 'keyword-lp-%'
 *
 * `id` is stripped → Supabase assigns BIGSERIAL; upsert keys on the natural
 * onConflict tuple (update if present, insert otherwise) → no PK collision.
 *
 * Prérequis keyword-LP : colonnes disposition/redirect_to côté Supabase
 * (npm run db:apply-supabase-schema — ALTER idempotents dans schema-supabase.sql).
 *
 * Usage:  npx tsx scripts/migrate-skoria-supabase.ts [--commit]   (dry-run by default)
 */
import dotenv from "dotenv";
import path from "node:path";
import Database from "better-sqlite3";
import { createClient } from "@supabase/supabase-js";

dotenv.config({ path: path.join(process.cwd(), ".env.local") });
dotenv.config();

const COMMIT = process.argv.includes("--commit");
const DB_PATH = path.join(process.cwd(), "numeris.db");
const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const CHUNK = 500;

interface Job {
  table: string;
  onConflict: string;
  where: string;
  /** Strip the SQLite id and let BIGSERIAL assign (only safe when the target is
   *  empty / sequence fresh — e.g. the new maillage_links table). For shared
   *  tables we KEEP the SQLite id: skoria rows have ids > current Supabase max
   *  → collision-free, and it preserves SQLite↔Supabase id parity. */
  stripId: boolean;
  /** DELETE ALL target rows before insert (tables dont SQLite est l'unique
   *  source de vérité et où des rows ont pu être PURGÉES localement). */
  replace?: boolean;
}
const JOBS: Job[] = [
  { table: "keyword_pages", onConflict: "slug", where: "1=1", stripId: false },
  {
    table: "maillage_links",
    onConflict: "source_url,target_url",
    where: "1=1",
    stripId: true,
    replace: true,
  },
  {
    table: "page_sections",
    onConflict: "route,slug,section_order",
    where:
      "route='guides' OR generated_by_model IN ('maillage-v3','ressources-hub-v1','keyword-lp-v1')",
    stripId: false,
  },
  {
    table: "seo_overrides",
    onConflict: "route,slug",
    where: "route='guides' OR generated_by_model IN ('ressources-hub-v1','keyword-lp-v1')",
    stripId: false,
  },
  {
    table: "page_meta",
    onConflict: "route,slug",
    where: "route='guides' OR pipeline_run_id LIKE 'keyword-lp-%'",
    stripId: false,
  },
];

// Optional positional args (not starting with `--`) restrict which tables run.
const ONLY = process.argv.slice(2).filter((a) => !a.startsWith("--"));
const ACTIVE_JOBS = ONLY.length ? JOBS.filter((j) => ONLY.includes(j.table)) : JOBS;

function chunk<T>(a: T[], n: number): T[][] {
  const o: T[][] = [];
  for (let i = 0; i < a.length; i += n) o.push(a.slice(i, i + n));
  return o;
}

async function main() {
  if (!URL || !KEY) {
    console.error(
      "Missing env. Required: NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY",
    );
    process.exit(1);
  }
  const db = new Database(DB_PATH, { readonly: true });
  const supa = createClient(URL, KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  console.log(
    `Mode   : ${COMMIT ? "COMMIT (writes Supabase)" : "DRY-RUN (no write)"}`,
  );
  console.log(`Source : SQLite @ ${DB_PATH}`);
  console.log(`Target : Supabase @ ${URL}\n`);

  let totalRows = 0;
  let totalWritten = 0;
  let failed = false;

  for (const j of ACTIVE_JOBS) {
    const rows = db
      .prepare(`SELECT * FROM ${j.table} WHERE ${j.where}`)
      .all() as Record<string, unknown>[];
    const clean = j.stripId
      ? rows.map((r) => {
          const { id: _id, ...rest } = r;
          return rest;
        })
      : rows;
    totalRows += clean.length;
    console.log(`[${j.table}] skoria rows: ${clean.length}  (where: ${j.where})`);

    // Probe target table is reachable (catches "table absent" before writing).
    const { error: probe, count } = await supa
      .from(j.table)
      .select("*", { count: "exact", head: true });
    if (probe) {
      console.error(`  ✗ target probe error: ${probe.message}`);
      failed = true;
      continue;
    }
    console.log(`  target currently holds: ${count ?? "?"} rows`);

    if (!COMMIT) {
      console.log(`  (dry-run — not written${j.replace ? ", REPLACE: delete-all préalable" : ""})\n`);
      continue;
    }

    if (j.replace) {
      const { error: delErr, count: delCount } = await supa
        .from(j.table)
        .delete({ count: "exact" })
        .gte("id", 0);
      if (delErr) {
        console.error(`  ✗ replace delete error: ${delErr.message}`);
        failed = true;
        continue;
      }
      console.log(`  replace: ${delCount ?? "?"} rows supprimées avant insert`);
    }

    let written = 0;
    let errors = 0;
    let firstErr = "";
    for (const b of chunk(clean, CHUNK)) {
      const { data, error } = await supa
        .from(j.table)
        .upsert(b, { onConflict: j.onConflict })
        .select(j.onConflict.split(",")[0].trim());
      if (error) {
        errors++;
        if (!firstErr) firstErr = error.message;
      } else {
        written += data?.length ?? b.length;
      }
    }
    totalWritten += written;
    if (errors > 0) failed = true;
    console.log(
      `  → written=${written} errors=${errors}${firstErr ? ` firstErr="${firstErr}"` : ""}\n`,
    );
  }

  db.close();
  console.log("─".repeat(60));
  console.log(
    COMMIT
      ? `COMMIT done. rows targeted=${totalRows} written=${totalWritten}`
      : `DRY-RUN done. rows that WOULD migrate=${totalRows}. Re-run with --commit.`,
  );
  if (failed) process.exit(2);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
