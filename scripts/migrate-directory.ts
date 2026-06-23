import Database from "better-sqlite3";
import path from "node:path";
import { SCHEMA } from "../src/libs/db/schema";

const DB_PATH = process.env.NUMERIS_DB ?? path.join(process.cwd(), "numeris.db");
const db = new Database(DB_PATH);
db.pragma("journal_mode = WAL");
db.exec(SCHEMA);

const cityColumns = new Set(
  (db.prepare("PRAGMA table_info(cities_official)").all() as { name: string }[]).map(
    (row) => row.name,
  ),
);
if (!cityColumns.has("population")) {
  db.exec("ALTER TABLE cities_official ADD COLUMN population INTEGER NOT NULL DEFAULT 0");
}

const requiredTables = [
  "source_registry",
  "cities_official",
  "directory_cabinets",
  "directory_establishments",
  "directory_experts",
  "profile_claims",
  "privacy_suppression_requests",
  "directory_source_events",
];

const existing = new Set(
  (
    db
      .prepare("SELECT name FROM sqlite_master WHERE type='table'")
      .all() as { name: string }[]
  ).map((row) => row.name),
);

const missing = requiredTables.filter((table) => !existing.has(table));
if (missing.length > 0) {
  console.error(`Missing directory tables: ${missing.join(", ")}`);
  process.exit(1);
}

console.log(`Directory schema OK: ${requiredTables.length} tables`);
