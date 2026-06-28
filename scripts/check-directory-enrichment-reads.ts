import assert from "node:assert/strict";
import Database from "better-sqlite3";
import path from "node:path";
import { SCHEMA } from "../src/libs/db/schema";
import { sqliteAdapter } from "../src/libs/db/sqlite";

const dbPath = process.env.NUMERIS_DB ?? path.join(process.cwd(), "numeris.db");
const db = new Database(dbPath);
db.pragma("journal_mode = WAL");
db.exec(SCHEMA);

async function main(): Promise<void> {
  const card = await sqliteAdapter.getDirectoryListingCabinetBySiret("44110142500037");
  assert.ok(card, "Expected sample cabinet 44110142500037 to exist");

  db.prepare("DELETE FROM directory_profile_facts WHERE value = ?").run("https://example-cabinet.test");
  db.prepare("DELETE FROM directory_enrichment_sources WHERE source_key = ?").run("check-directory-enrichment");
  db.prepare("DELETE FROM directory_qualification_snapshots WHERE establishment_id = ?").run(card.establishment.id);

  const source = db.prepare(
    `INSERT INTO directory_enrichment_sources
       (cabinet_id, establishment_id, source_key, source_type, source_url, retrieved_at, parsed_ok, robots_allowed, legal_basis, raw_excerpt)
     VALUES
       (?, ?, 'check-directory-enrichment', 'official_website', 'https://example-cabinet.test', '2026-06-28T08:00:00.000Z', 1, 1, 'Test source', 'Site officiel test')
     RETURNING id`,
  ).get(card.cabinet.id, card.establishment.id) as { id: number };

  db.prepare(
    `INSERT INTO directory_profile_facts
       (cabinet_id, establishment_id, fact_type, label, value, source_id, confidence, is_displayable)
     VALUES
       (?, ?, 'website', 'Site officiel', 'https://example-cabinet.test', ?, 95, 1)`,
  ).run(card.cabinet.id, card.establishment.id, source.id);

  db.prepare(
    `INSERT INTO directory_qualification_snapshots
       (cabinet_id, establishment_id, score, professional_status, matched_website, matched_registry, matched_address, matched_siren_or_siret, has_useful_profile_facts, blocking_reason, snapshot_json, created_at)
     VALUES
       (?, ?, 90, 'manual_verified', 1, 1, 1, 1, 1, NULL, '{"reason":"test"}', '2026-06-28T08:01:00.000Z')`,
  ).run(card.cabinet.id, card.establishment.id);

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

  const stats = await sqliteAdapter.getDirectoryCityEnrichmentStats(card.city!.code_insee);
  assert.ok(stats.enrichedCount >= 1);
  assert.ok(stats.documentedCount >= 0);
  assert.ok(stats.candidateCount >= 0);

  const latest = await sqliteAdapter.getDirectoryLatestEnrichmentDateByEstablishment(card.establishment.id);
  assert.equal(latest, "2026-06-28T08:00:00.000Z");

  db.prepare("DELETE FROM directory_profile_facts WHERE value = ?").run("https://example-cabinet.test");
  db.prepare("DELETE FROM directory_enrichment_sources WHERE source_key = ?").run("check-directory-enrichment");
  db.prepare("DELETE FROM directory_qualification_snapshots WHERE establishment_id = ?").run(card.establishment.id);

  console.log("Directory enrichment reads OK");
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
