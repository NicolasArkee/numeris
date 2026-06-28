import assert from "node:assert/strict";
import Database from "better-sqlite3";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

async function copyDatabase(sourcePath: string, destinationPath: string): Promise<void> {
  const source = new Database(sourcePath, { readonly: true, fileMustExist: true });
  try {
    await source.backup(destinationPath);
  } finally {
    source.close();
  }
}

async function main(): Promise<void> {
  const sourceDbPath = process.env.NUMERIS_DB ?? path.join(process.cwd(), "numeris.db");
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "numeris-enrichment-reads-"));
  const tempDbPath = path.join(tempDir, "numeris.db");
  let db: Database.Database | null = null;
  let sourceId: number | null = null;
  let factId: number | null = null;
  let snapshotId: number | null = null;

  try {
    await copyDatabase(sourceDbPath, tempDbPath);
    process.env.NUMERIS_DB = tempDbPath;

    const [{ SCHEMA }, { sqliteAdapter }] = await Promise.all([
      import("../src/libs/db/schema"),
      import("../src/libs/db/sqlite"),
    ]);

    db = new Database(tempDbPath);
    db.pragma("journal_mode = WAL");
    db.exec(SCHEMA);

    const card = await sqliteAdapter.getDirectoryListingCabinetBySiret("44110142500037");
    assert.ok(card, "Expected sample cabinet 44110142500037 to exist");

    const source = db.prepare(
      `INSERT INTO directory_enrichment_sources
         (cabinet_id, establishment_id, source_key, source_type, source_url, retrieved_at, parsed_ok, robots_allowed, legal_basis, raw_excerpt)
       VALUES
         (?, ?, 'check-directory-enrichment', 'official_website', 'https://example-cabinet.test', '2026-06-28T08:00:00.000Z', 1, 1, 'Test source', 'Site officiel test')
       RETURNING id`,
    ).get(card.cabinet.id, card.establishment.id) as { id: number };
    sourceId = source.id;

    const fact = db.prepare(
      `INSERT INTO directory_profile_facts
         (cabinet_id, establishment_id, fact_type, label, value, source_id, confidence, is_displayable)
       VALUES
         (?, ?, 'website', 'Site officiel', 'https://example-cabinet.test', ?, 95, 1)
       RETURNING id`,
    ).get(card.cabinet.id, card.establishment.id, source.id) as { id: number };
    factId = fact.id;

    const insertedSnapshot = db.prepare(
      `INSERT INTO directory_qualification_snapshots
         (cabinet_id, establishment_id, score, professional_status, matched_website, matched_registry, matched_address, matched_siren_or_siret, has_useful_profile_facts, blocking_reason, snapshot_json, created_at)
       VALUES
         (?, ?, 90, 'manual_verified', 1, 1, 1, 1, 1, NULL, '{"reason":"test"}', '2026-06-28T08:01:00.000Z')
       RETURNING id`,
    ).get(card.cabinet.id, card.establishment.id) as { id: number };
    snapshotId = insertedSnapshot.id;

    const facts = await sqliteAdapter.getDirectoryProfileFactsByEstablishment(card.establishment.id);
    assert.equal(facts.length, 1);
    assert.equal(facts[0]!.fact_type, "website");
    assert.equal(facts[0]!.value, "https://example-cabinet.test");

    const sources = await sqliteAdapter.getDirectoryEnrichmentSourcesByEstablishment(card.establishment.id);
    assert.equal(sources.length, 1);
    assert.equal(sources[0]!.source_key, "check-directory-enrichment");

    const snapshot = await sqliteAdapter.getLatestDirectoryQualificationSnapshot(
      card.cabinet.id,
      card.establishment.id,
    );
    assert.ok(snapshot);
    assert.equal(snapshot.score, 90);

    assert.ok(card.city, "Expected sample cabinet to have a city");
    const stats = await sqliteAdapter.getDirectoryCityEnrichmentStats(card.city.code_insee);
    assert.ok(stats.enrichedCount >= 1);
    assert.ok(stats.documentedCount >= 0);
    assert.ok(stats.candidateCount >= 0);

    const latest = await sqliteAdapter.getDirectoryLatestEnrichmentDateByEstablishment(card.establishment.id);
    assert.equal(latest, "2026-06-28T08:00:00.000Z");

    console.log("Directory enrichment reads OK");
  } finally {
    if (db) {
      if (factId != null) {
        db.prepare("DELETE FROM directory_profile_facts WHERE id = ?").run(factId);
      }
      if (sourceId != null) {
        db.prepare("DELETE FROM directory_enrichment_sources WHERE id = ?").run(sourceId);
      }
      if (snapshotId != null) {
        db.prepare("DELETE FROM directory_qualification_snapshots WHERE id = ?").run(snapshotId);
      }
      db.close();
    }
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
