/**
 * scripts/migrate-page-content.ts
 *
 * Vague 2.B — DB migration for the numeris_pipeline persistence layer.
 *
 * Creates the page_sections / seo_overrides / page_meta tables (idempotent,
 * via CREATE TABLE IF NOT EXISTS in src/libs/db/schema.ts) on the local
 * numeris.db, then logs which target tables now exist + row counts.
 *
 * Run: npm run db:migrate-page-content
 */
import Database from "better-sqlite3";
import path from "node:path";
import { SCHEMA } from "../src/libs/db/schema";

const DB_PATH = path.join(process.cwd(), "numeris.db");
const TARGET_TABLES = ["page_sections", "seo_overrides", "page_meta"] as const;

function main(): void {
  const db = new Database(DB_PATH);
  db.pragma("journal_mode = WAL");

  console.log(`[migrate-page-content] DB: ${DB_PATH}`);
  console.log(`[migrate-page-content] Applying SCHEMA (idempotent)…`);
  db.exec(SCHEMA);

  const present = db
    .prepare(
      `SELECT name FROM sqlite_master
       WHERE type = 'table' AND name IN (${TARGET_TABLES.map(() => "?").join(",")})
       ORDER BY name`,
    )
    .all(...TARGET_TABLES) as { name: string }[];

  const presentNames = new Set(present.map((r) => r.name));
  const missing = TARGET_TABLES.filter((t) => !presentNames.has(t));

  console.log(
    `[migrate-page-content] Tables present: ${present.length}/${TARGET_TABLES.length} → ${[...presentNames].join(", ") || "(none)"}`,
  );
  if (missing.length > 0) {
    console.error(
      `[migrate-page-content] MISSING tables after migration: ${missing.join(", ")}`,
    );
    db.close();
    process.exit(1);
  }

  for (const t of TARGET_TABLES) {
    const row = db.prepare(`SELECT COUNT(*) AS n FROM ${t}`).get() as {
      n: number;
    };
    console.log(`[migrate-page-content]   ${t}: ${row.n} row(s)`);
  }

  db.close();
  console.log(`[migrate-page-content] OK — migration complete.`);
}

main();
