import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";
import { SCHEMA } from "../src/libs/db/schema";
import type {
  DirectoryProfileFact,
  DirectoryProfileFactType,
  DirectoryQualificationSnapshot,
} from "../src/libs/db";
import { computeDirectoryQualification } from "../src/libs/directory/enrichment";

type PilotFact = {
  fact_type: DirectoryProfileFactType;
  label: string;
  value: string;
  confidence: number;
  is_displayable: boolean;
};

type PilotRecord = {
  siret: string;
  source: {
    source_key: string;
    source_type: "official_website" | "registry" | "manual";
    source_url: string | null;
    retrieved_at: string;
    legal_basis: string;
    raw_excerpt?: string | null;
  };
  matches: {
    professional_status: DirectoryQualificationSnapshot["professional_status"];
    matched_registry: boolean;
    matched_website: boolean;
    matched_address: boolean;
    matched_siren_or_siret: boolean;
    has_website_contact_page: boolean;
  };
  facts: PilotFact[];
};

function parseArgs() {
  const args = new Map<string, string>();
  for (const arg of process.argv.slice(2)) {
    const [key, value = "true"] = arg.replace(/^--/, "").split("=");
    args.set(key, value);
  }
  return {
    file: args.get("file") ?? "data/directory-enrichment-pilot.sample.json",
    dbPath: args.get("db") ?? process.env.NUMERIS_DB ?? path.join(process.cwd(), "numeris.db"),
    applyPublication: args.get("apply-publication") === "true",
  };
}

function boolToInt(value: boolean): number {
  return value ? 1 : 0;
}

const options = parseArgs();
const payloadPath = path.resolve(process.cwd(), options.file);
const records = JSON.parse(fs.readFileSync(payloadPath, "utf8")) as PilotRecord[];

const db = new Database(options.dbPath);
db.pragma("journal_mode = WAL");
db.exec(SCHEMA);

const importRecord = db.transaction((record: PilotRecord) => {
  const row = db.prepare(
    `SELECT
       d.id AS cabinet_id,
       d.naf_code,
       d.is_active AS cabinet_is_active,
       e.id AS establishment_id,
       e.is_active AS establishment_is_active
     FROM directory_establishments e
     JOIN directory_cabinets d ON d.id = e.cabinet_id
     WHERE e.siret = ?`,
  ).get(record.siret) as {
    cabinet_id: number;
    naf_code: string | null;
    cabinet_is_active: number;
    establishment_id: number;
    establishment_is_active: number;
  } | undefined;

  if (!row) {
    throw new Error(`Unknown SIRET ${record.siret}`);
  }

  const source = db.prepare(
    `INSERT INTO directory_enrichment_sources
       (cabinet_id, establishment_id, source_key, source_type, source_url, retrieved_at, parsed_ok, robots_allowed, legal_basis, raw_excerpt)
     VALUES
       (@cabinet_id, @establishment_id, @source_key, @source_type, @source_url, @retrieved_at, 1, NULL, @legal_basis, @raw_excerpt)
     ON CONFLICT DO UPDATE SET
       retrieved_at = excluded.retrieved_at,
       parsed_ok = excluded.parsed_ok,
       legal_basis = excluded.legal_basis,
       raw_excerpt = excluded.raw_excerpt
     RETURNING id`,
  ).get({
    cabinet_id: row.cabinet_id,
    establishment_id: row.establishment_id,
    source_key: record.source.source_key,
    source_type: record.source.source_type,
    source_url: record.source.source_url,
    retrieved_at: record.source.retrieved_at,
    legal_basis: record.source.legal_basis,
    raw_excerpt: record.source.raw_excerpt ?? null,
  }) as { id: number };

  db.prepare(
    `DELETE FROM directory_profile_facts
     WHERE cabinet_id = ?
       AND establishment_id = ?
       AND source_id = ?`,
  ).run(row.cabinet_id, row.establishment_id, source.id);

  for (const fact of record.facts) {
    db.prepare(
      `INSERT INTO directory_profile_facts
         (cabinet_id, establishment_id, fact_type, label, value, source_id, confidence, is_displayable)
       VALUES
         (@cabinet_id, @establishment_id, @fact_type, @label, @value, @source_id, @confidence, @is_displayable)
       ON CONFLICT DO UPDATE SET
         label = excluded.label,
         source_id = excluded.source_id,
         confidence = excluded.confidence,
         is_displayable = excluded.is_displayable,
         updated_at = datetime('now')`,
    ).run({
      cabinet_id: row.cabinet_id,
      establishment_id: row.establishment_id,
      fact_type: fact.fact_type,
      label: fact.label,
      value: fact.value,
      source_id: source.id,
      confidence: fact.confidence,
      is_displayable: boolToInt(fact.is_displayable),
    });
  }

  const storedFacts = db.prepare(
    `SELECT *
     FROM directory_profile_facts
     WHERE establishment_id = ?
       AND is_displayable = 1`,
  ).all(row.establishment_id) as DirectoryProfileFact[];

  const qualification = computeDirectoryQualification({
    isActive: row.cabinet_is_active === 1 && row.establishment_is_active === 1,
    nafCode: row.naf_code,
    professionalStatus: record.matches.professional_status,
    matchedRegistry: record.matches.matched_registry,
    matchedWebsite: record.matches.matched_website,
    matchedAddress: record.matches.matched_address,
    matchedSirenOrSiret: record.matches.matched_siren_or_siret,
    hasWebsiteContactPage: record.matches.has_website_contact_page,
    retrievedAt: record.source.retrieved_at,
    facts: storedFacts,
    hasActiveSuppression: false,
  });

  db.prepare(
    `INSERT INTO directory_qualification_snapshots
       (cabinet_id, establishment_id, score, professional_status, matched_website, matched_registry, matched_address, matched_siren_or_siret, has_useful_profile_facts, blocking_reason, snapshot_json)
     VALUES
       (@cabinet_id, @establishment_id, @score, @professional_status, @matched_website, @matched_registry, @matched_address, @matched_siren_or_siret, @has_useful_profile_facts, @blocking_reason, @snapshot_json)`,
  ).run({
    cabinet_id: row.cabinet_id,
    establishment_id: row.establishment_id,
    score: qualification.score,
    professional_status: qualification.professionalStatus,
    matched_website: boolToInt(qualification.matchedWebsite),
    matched_registry: boolToInt(qualification.matchedRegistry),
    matched_address: boolToInt(qualification.matchedAddress),
    matched_siren_or_siret: boolToInt(qualification.matchedSirenOrSiret),
    has_useful_profile_facts: boolToInt(qualification.hasUsefulProfileFacts),
    blocking_reason: qualification.blockingReason,
    snapshot_json: JSON.stringify(qualification.snapshot),
  });

  if (options.applyPublication && qualification.canPublish) {
    db.prepare(
      `UPDATE directory_cabinets
       SET confidence_score = MAX(confidence_score, ?),
           oec_status = ?,
           publish_status = 'published',
           updated_at = datetime('now')
       WHERE id = ?`,
    ).run(qualification.score, qualification.professionalStatus, row.cabinet_id);
  }

  return { siret: record.siret, score: qualification.score, canPublish: qualification.canPublish };
});

const results = records.map((record) => importRecord(record));
console.log(JSON.stringify({ imported: results.length, results }, null, 2));
