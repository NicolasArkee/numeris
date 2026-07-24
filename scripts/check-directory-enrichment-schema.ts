import assert from "node:assert/strict";
import Database from "better-sqlite3";
import path from "node:path";
import { SCHEMA, ensureDirectoryProfileFactTypeCompatibility } from "../src/libs/db/schema";

const dbPath = process.env.NUMERIS_DB ?? path.join(process.cwd(), "numeris.db");
const db = new Database(dbPath);
db.pragma("journal_mode = WAL");
db.exec(SCHEMA);
ensureDirectoryProfileFactTypeCompatibility(db);

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
  "metadata_json",
]) {
  assert.ok(factsColumns.has(column), `Missing directory_profile_facts.${column}`);
}

db.exec("BEGIN");
try {
  const cabinet = db
    .prepare("INSERT INTO directory_cabinets (legal_name) VALUES (?) RETURNING id")
    .get("Directory enrichment schema check") as { id: number };

  const insertSource = db.prepare(`
    INSERT INTO directory_enrichment_sources (
      cabinet_id,
      establishment_id,
      source_key,
      source_type,
      source_url,
      legal_basis
    ) VALUES (?, NULL, ?, 'manual', NULL, ?)
  `);

  insertSource.run(cabinet.id, "schema-check-source", "schema_check");
  assert.throws(
    () => insertSource.run(cabinet.id, "schema-check-source", "schema_check"),
    /UNIQUE constraint failed/,
    "Expected duplicate cabinet-level enrichment source to be rejected",
  );

  const insertFact = db.prepare(`
    INSERT INTO directory_profile_facts (
      cabinet_id,
      establishment_id,
      fact_type,
      label,
      value,
      metadata_json
    ) VALUES (?, NULL, 'source_preview_image', ?, ?, ?)
  `);

  insertFact.run(
    cabinet.id,
    "Apercu source",
    "/images/directory-previews/test.png",
    '{"displayMode":"sourced"}',
  );
  assert.throws(
    () =>
      insertFact.run(
        cabinet.id,
        "Apercu source",
        "/images/directory-previews/test.png",
        '{"displayMode":"sourced"}',
      ),
    /UNIQUE constraint failed/,
    "Expected duplicate cabinet-level profile fact to be rejected",
  );
} finally {
  db.exec("ROLLBACK");
}

console.log("Directory enrichment schema OK");
