import assert from "node:assert/strict";
import Database from "better-sqlite3";
import path from "node:path";
import { SCHEMA } from "../src/libs/db/schema";

const dbPath = process.env.NUMERIS_DB ?? path.join(process.cwd(), "numeris.db");
const db = new Database(dbPath);
db.pragma("journal_mode = WAL");
db.exec(SCHEMA);

const expectedTables = [
  "directory_enrichment_runs",
  "directory_enrichment_sources",
  "directory_profile_facts",
  "directory_qualification_snapshots",
];

const tables = new Set(
  (db.prepare("SELECT name FROM sqlite_master WHERE type = 'table'").all() as { name: string }[])
    .map((row) => row.name),
);

for (const table of expectedTables) {
  assert.ok(tables.has(table), `Missing table ${table}`);
}

const factsColumns = new Set(
  (db.prepare("PRAGMA table_info(directory_profile_facts)").all() as { name: string }[])
    .map((row) => row.name),
);

for (const column of [
  "cabinet_id",
  "establishment_id",
  "fact_type",
  "label",
  "value",
  "source_id",
  "confidence",
  "is_displayable",
]) {
  assert.ok(factsColumns.has(column), `Missing directory_profile_facts.${column}`);
}

console.log("Directory enrichment schema OK");
