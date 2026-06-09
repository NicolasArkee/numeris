/**
 * scripts/migrate-pricing-testimonials.ts
 *
 * Wave 1 / Phase P4a — DB migration for:
 *   1. New `pricing_tiers` table (V2 PricingTeaser — 3 tiers €59/€99/€159)
 *   2. ALTER `testimonials` — add profession_slug / secteur_slug / ville_slug
 *      + internal _fictional flag (audit trail for fictional-but-consistent
 *      testimonials, never exposed in UI).
 *   3. Index `idx_testimonials_profession` for profession filtering.
 *
 * Idempotent:
 *   - pricing_tiers DDL uses CREATE TABLE IF NOT EXISTS (in SCHEMA).
 *   - Each ALTER on `testimonials` is guarded by a PRAGMA table_info check
 *     (same pattern as scripts/seed-geo.ts lines 13-34).
 *
 * Run: npm run db:migrate-pricing-testimonials
 */
import Database from "better-sqlite3";
import path from "node:path";
import { SCHEMA } from "../src/libs/db/schema";

const DB_PATH = path.join(process.cwd(), "numeris.db");

const TESTIMONIALS_NEW_COLS: { name: string; ddl: string }[] = [
  {
    name: "profession_slug",
    ddl: "ALTER TABLE testimonials ADD COLUMN profession_slug TEXT",
  },
  {
    name: "secteur_slug",
    ddl: "ALTER TABLE testimonials ADD COLUMN secteur_slug TEXT",
  },
  {
    name: "ville_slug",
    ddl: "ALTER TABLE testimonials ADD COLUMN ville_slug TEXT",
  },
  {
    name: "_fictional",
    ddl: "ALTER TABLE testimonials ADD COLUMN _fictional INTEGER NOT NULL DEFAULT 0",
  },
];

function main(): void {
  const db = new Database(DB_PATH);
  db.pragma("journal_mode = WAL");

  console.log(`[migrate-pricing-testimonials] DB: ${DB_PATH}`);
  console.log(`[migrate-pricing-testimonials] Applying SCHEMA (idempotent)…`);
  db.exec(SCHEMA);

  // ─── 1. Verify pricing_tiers table exists ───
  const pricingExists = db
    .prepare(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='pricing_tiers'",
    )
    .get() as { name: string } | undefined;

  if (!pricingExists) {
    console.error(
      "[migrate-pricing-testimonials] FATAL: pricing_tiers table not created by SCHEMA",
    );
    db.close();
    process.exit(1);
  }
  console.log(`[migrate-pricing-testimonials]   pricing_tiers: OK`);

  // ─── 2. Idempotent ALTER testimonials ───
  // CREATE TABLE IF NOT EXISTS does NOT add columns to an existing table,
  // so we must check PRAGMA table_info before each ALTER (cf seed-geo.ts).
  const cols = db
    .prepare("PRAGMA table_info(testimonials)")
    .all() as { name: string }[];
  const existingCols = new Set(cols.map((c) => c.name));

  let addedCount = 0;
  for (const c of TESTIMONIALS_NEW_COLS) {
    if (!existingCols.has(c.name)) {
      db.exec(c.ddl);
      console.log(
        `[migrate-pricing-testimonials]   → added column testimonials.${c.name}`,
      );
      addedCount++;
    } else {
      console.log(
        `[migrate-pricing-testimonials]   = column testimonials.${c.name} already present (skip)`,
      );
    }
  }

  // ─── 3. Idempotent index ───
  db.exec(
    "CREATE INDEX IF NOT EXISTS idx_testimonials_profession ON testimonials(profession_slug)",
  );
  console.log(`[migrate-pricing-testimonials]   idx_testimonials_profession: OK`);

  // ─── 4. Post-migration counts ───
  const pricingCount = db
    .prepare("SELECT COUNT(*) AS n FROM pricing_tiers")
    .get() as { n: number };
  const testimonialsCount = db
    .prepare("SELECT COUNT(*) AS n FROM testimonials")
    .get() as { n: number };

  console.log(
    `[migrate-pricing-testimonials]   pricing_tiers: ${pricingCount.n} row(s)`,
  );
  console.log(
    `[migrate-pricing-testimonials]   testimonials: ${testimonialsCount.n} row(s)`,
  );

  db.close();
  console.log(
    `[migrate-pricing-testimonials] OK — migration complete (${addedCount} column(s) added).`,
  );
}

main();
