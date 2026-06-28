# Directory Enrichment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the first source-backed directory enrichment layer for Skoria cabinet profiles, starting with manual/seeded enrichment and deterministic qualification.

**Architecture:** Add enrichment tables beside the existing directory tables, expose read methods through both SQLite and Supabase adapters, compute explainable qualification scores in a pure helper, then render sourced facts on profile and city pages. Automated crawling is intentionally kept out of this first implementation so the data model and SEO gates can be validated with controlled pilot data first.

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript, SQLite via `better-sqlite3`, Supabase/PostgREST, local validation scripts with `tsx` and `node:assert/strict`.

---

## File Structure

- Modify `src/libs/db/schema.ts`: add SQLite enrichment tables and indexes.
- Modify `src/libs/db/schema-supabase.sql`: add matching Postgres tables, indexes, RLS enable statements, and read policies matching the existing public-read style.
- Modify `src/libs/db/types.ts`: add enrichment row types, enriched city stats type, and `DbAdapter` methods.
- Modify `src/libs/db/sqlite.ts`: implement enrichment read methods.
- Modify `src/libs/db/supabase.ts`: implement enrichment read methods.
- Create `src/libs/directory/enrichment.ts`: pure scoring and fact grouping helpers.
- Create `src/components/directory/DirectoryEnrichmentPanel.tsx`: profile page rendering for sourced enrichment.
- Modify `src/components/directory/DirectoryProfileV2.tsx`: accept enrichment props, render panel, and enrich JSON-LD only with sourced facts.
- Modify `src/app/expert-comptable/[ville]/[cabinet]/page.tsx`: load enrichment data for the current establishment.
- Modify `src/components/directory/DirectoryCityPageV2.tsx`: show enriched/documented/candidate counts.
- Modify `src/app/expert-comptable/[ville]/page.tsx`: load city enrichment stats.
- Modify `src/app/sitemap.ts`: use enrichment source freshness for directory lastmod when available.
- Create `scripts/check-directory-enrichment-schema.ts`: local schema validation.
- Create `scripts/check-directory-enrichment-helpers.ts`: pure helper checks.
- Create `scripts/check-directory-enrichment-reads.ts`: SQLite adapter checks using seeded local rows.
- Create `scripts/check-directory-enrichment-page.tsx`: React static-render checks.
- Create `scripts/import-directory-enrichment.ts`: JSON pilot import for controlled enrichment.
- Create `data/directory-enrichment-pilot.sample.json`: documented sample import payload.

---

### Task 1: Schema And Types

**Files:**
- Modify: `src/libs/db/schema.ts`
- Modify: `src/libs/db/schema-supabase.sql`
- Modify: `src/libs/db/types.ts`
- Create: `scripts/check-directory-enrichment-schema.ts`

- [ ] **Step 1: Write the failing schema check**

Create `scripts/check-directory-enrichment-schema.ts`:

```ts
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
```

- [ ] **Step 2: Run the schema check to verify it fails**

Run:

```bash
npx tsx scripts/check-directory-enrichment-schema.ts
```

Expected: FAIL with `Missing table directory_enrichment_runs`.

- [ ] **Step 3: Add SQLite DDL**

Append this block in `src/libs/db/schema.ts` after `directory_source_events` and before the testimonials extension comments:

```ts
-- ─── DIRECTORY ENRICHMENT ───

CREATE TABLE IF NOT EXISTS directory_enrichment_runs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  run_key TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL CHECK(status IN ('running','completed','failed')),
  scope TEXT NOT NULL DEFAULT '{}',
  started_at TEXT NOT NULL DEFAULT (datetime('now')),
  finished_at TEXT,
  stats_json TEXT NOT NULL DEFAULT '{}',
  error_message TEXT
);
CREATE INDEX IF NOT EXISTS idx_directory_enrichment_runs_status ON directory_enrichment_runs(status, started_at);

CREATE TABLE IF NOT EXISTS directory_enrichment_sources (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  cabinet_id INTEGER NOT NULL REFERENCES directory_cabinets(id) ON DELETE CASCADE,
  establishment_id INTEGER REFERENCES directory_establishments(id) ON DELETE CASCADE,
  source_key TEXT NOT NULL,
  source_type TEXT NOT NULL CHECK(source_type IN ('api','official_website','registry','manual')),
  source_url TEXT,
  retrieved_at TEXT NOT NULL DEFAULT (datetime('now')),
  source_hash TEXT,
  parsed_ok INTEGER NOT NULL DEFAULT 1,
  robots_allowed INTEGER,
  legal_basis TEXT NOT NULL,
  raw_excerpt TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(cabinet_id, establishment_id, source_key, source_url)
);
CREATE INDEX IF NOT EXISTS idx_directory_enrichment_sources_establishment ON directory_enrichment_sources(establishment_id, source_type);
CREATE INDEX IF NOT EXISTS idx_directory_enrichment_sources_cabinet ON directory_enrichment_sources(cabinet_id, source_type);

CREATE TABLE IF NOT EXISTS directory_profile_facts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  cabinet_id INTEGER NOT NULL REFERENCES directory_cabinets(id) ON DELETE CASCADE,
  establishment_id INTEGER REFERENCES directory_establishments(id) ON DELETE CASCADE,
  fact_type TEXT NOT NULL CHECK(fact_type IN ('website','phone','email','contact_url','opening_hours','service','sector','software','team_signal','registry_status')),
  label TEXT NOT NULL,
  value TEXT NOT NULL,
  source_id INTEGER REFERENCES directory_enrichment_sources(id) ON DELETE SET NULL,
  confidence INTEGER NOT NULL DEFAULT 0,
  is_displayable INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(cabinet_id, establishment_id, fact_type, value)
);
CREATE INDEX IF NOT EXISTS idx_directory_profile_facts_establishment ON directory_profile_facts(establishment_id, is_displayable, fact_type);
CREATE INDEX IF NOT EXISTS idx_directory_profile_facts_cabinet ON directory_profile_facts(cabinet_id, is_displayable, fact_type);

CREATE TABLE IF NOT EXISTS directory_qualification_snapshots (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  cabinet_id INTEGER NOT NULL REFERENCES directory_cabinets(id) ON DELETE CASCADE,
  establishment_id INTEGER REFERENCES directory_establishments(id) ON DELETE CASCADE,
  score INTEGER NOT NULL DEFAULT 0,
  professional_status TEXT NOT NULL CHECK(professional_status IN ('unverified','verified','manual_verified','not_found','ambiguous','stale')),
  matched_website INTEGER NOT NULL DEFAULT 0,
  matched_registry INTEGER NOT NULL DEFAULT 0,
  matched_address INTEGER NOT NULL DEFAULT 0,
  matched_siren_or_siret INTEGER NOT NULL DEFAULT 0,
  has_useful_profile_facts INTEGER NOT NULL DEFAULT 0,
  blocking_reason TEXT,
  snapshot_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_directory_qualification_establishment ON directory_qualification_snapshots(establishment_id, created_at);
CREATE INDEX IF NOT EXISTS idx_directory_qualification_score ON directory_qualification_snapshots(score, professional_status);
```

- [ ] **Step 4: Add Postgres DDL**

Add the Postgres equivalents to `src/libs/db/schema-supabase.sql` after `directory_source_events`:

```sql
CREATE TABLE IF NOT EXISTS directory_enrichment_runs (
  id BIGSERIAL PRIMARY KEY,
  run_key TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL CHECK(status IN ('running','completed','failed')),
  scope TEXT NOT NULL DEFAULT '{}',
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  finished_at TIMESTAMPTZ,
  stats_json TEXT NOT NULL DEFAULT '{}',
  error_message TEXT
);
CREATE INDEX IF NOT EXISTS idx_directory_enrichment_runs_status ON directory_enrichment_runs(status, started_at);

CREATE TABLE IF NOT EXISTS directory_enrichment_sources (
  id BIGSERIAL PRIMARY KEY,
  cabinet_id BIGINT NOT NULL REFERENCES directory_cabinets(id) ON DELETE CASCADE,
  establishment_id BIGINT REFERENCES directory_establishments(id) ON DELETE CASCADE,
  source_key TEXT NOT NULL,
  source_type TEXT NOT NULL CHECK(source_type IN ('api','official_website','registry','manual')),
  source_url TEXT,
  retrieved_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  source_hash TEXT,
  parsed_ok BOOLEAN NOT NULL DEFAULT TRUE,
  robots_allowed BOOLEAN,
  legal_basis TEXT NOT NULL,
  raw_excerpt TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(cabinet_id, establishment_id, source_key, source_url)
);
CREATE INDEX IF NOT EXISTS idx_directory_enrichment_sources_establishment ON directory_enrichment_sources(establishment_id, source_type);
CREATE INDEX IF NOT EXISTS idx_directory_enrichment_sources_cabinet ON directory_enrichment_sources(cabinet_id, source_type);

CREATE TABLE IF NOT EXISTS directory_profile_facts (
  id BIGSERIAL PRIMARY KEY,
  cabinet_id BIGINT NOT NULL REFERENCES directory_cabinets(id) ON DELETE CASCADE,
  establishment_id BIGINT REFERENCES directory_establishments(id) ON DELETE CASCADE,
  fact_type TEXT NOT NULL CHECK(fact_type IN ('website','phone','email','contact_url','opening_hours','service','sector','software','team_signal','registry_status')),
  label TEXT NOT NULL,
  value TEXT NOT NULL,
  source_id BIGINT REFERENCES directory_enrichment_sources(id) ON DELETE SET NULL,
  confidence INTEGER NOT NULL DEFAULT 0,
  is_displayable BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(cabinet_id, establishment_id, fact_type, value)
);
CREATE INDEX IF NOT EXISTS idx_directory_profile_facts_establishment ON directory_profile_facts(establishment_id, is_displayable, fact_type);
CREATE INDEX IF NOT EXISTS idx_directory_profile_facts_cabinet ON directory_profile_facts(cabinet_id, is_displayable, fact_type);

CREATE TABLE IF NOT EXISTS directory_qualification_snapshots (
  id BIGSERIAL PRIMARY KEY,
  cabinet_id BIGINT NOT NULL REFERENCES directory_cabinets(id) ON DELETE CASCADE,
  establishment_id BIGINT REFERENCES directory_establishments(id) ON DELETE CASCADE,
  score INTEGER NOT NULL DEFAULT 0,
  professional_status TEXT NOT NULL CHECK(professional_status IN ('unverified','verified','manual_verified','not_found','ambiguous','stale')),
  matched_website BOOLEAN NOT NULL DEFAULT FALSE,
  matched_registry BOOLEAN NOT NULL DEFAULT FALSE,
  matched_address BOOLEAN NOT NULL DEFAULT FALSE,
  matched_siren_or_siret BOOLEAN NOT NULL DEFAULT FALSE,
  has_useful_profile_facts BOOLEAN NOT NULL DEFAULT FALSE,
  blocking_reason TEXT,
  snapshot_json TEXT NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_directory_qualification_establishment ON directory_qualification_snapshots(establishment_id, created_at);
CREATE INDEX IF NOT EXISTS idx_directory_qualification_score ON directory_qualification_snapshots(score, professional_status);
```

Add these RLS lines near the existing `ALTER TABLE ... ENABLE ROW LEVEL SECURITY` block:

```sql
ALTER TABLE directory_enrichment_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE directory_enrichment_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE directory_profile_facts ENABLE ROW LEVEL SECURITY;
ALTER TABLE directory_qualification_snapshots ENABLE ROW LEVEL SECURITY;
```

If the schema file already has public read policies for directory tables, add matching select policies for `directory_enrichment_sources`, `directory_profile_facts`, and `directory_qualification_snapshots`. Do not add a public select policy for `directory_enrichment_runs`.

- [ ] **Step 5: Add TypeScript types**

Add to `src/libs/db/types.ts` near the existing directory types:

```ts
export type DirectoryEnrichmentSourceType =
  | "api"
  | "official_website"
  | "registry"
  | "manual";

export type DirectoryProfileFactType =
  | "website"
  | "phone"
  | "email"
  | "contact_url"
  | "opening_hours"
  | "service"
  | "sector"
  | "software"
  | "team_signal"
  | "registry_status";

export interface DirectoryEnrichmentSource {
  id: number;
  cabinet_id: number;
  establishment_id: number | null;
  source_key: string;
  source_type: DirectoryEnrichmentSourceType;
  source_url: string | null;
  retrieved_at: string;
  source_hash: string | null;
  parsed_ok: number | boolean;
  robots_allowed: number | boolean | null;
  legal_basis: string;
  raw_excerpt: string | null;
  created_at: string;
}

export interface DirectoryProfileFact {
  id: number;
  cabinet_id: number;
  establishment_id: number | null;
  fact_type: DirectoryProfileFactType;
  label: string;
  value: string;
  source_id: number | null;
  confidence: number;
  is_displayable: number | boolean;
  created_at: string;
  updated_at: string;
}

export interface DirectoryQualificationSnapshot {
  id: number;
  cabinet_id: number;
  establishment_id: number | null;
  score: number;
  professional_status:
    | "unverified"
    | "verified"
    | "manual_verified"
    | "not_found"
    | "ambiguous"
    | "stale";
  matched_website: number | boolean;
  matched_registry: number | boolean;
  matched_address: number | boolean;
  matched_siren_or_siret: number | boolean;
  has_useful_profile_facts: number | boolean;
  blocking_reason: string | null;
  snapshot_json: string;
  created_at: string;
}

export interface DirectoryCityEnrichmentStats {
  enrichedCount: number;
  documentedCount: number;
  candidateCount: number;
}
```

Extend `DbAdapter`:

```ts
getDirectoryProfileFactsByEstablishment(establishmentId: number): Promise<DirectoryProfileFact[]>;
getDirectoryEnrichmentSourcesByEstablishment(establishmentId: number): Promise<DirectoryEnrichmentSource[]>;
getLatestDirectoryQualificationSnapshot(
  cabinetId: number,
  establishmentId: number,
): Promise<DirectoryQualificationSnapshot | null>;
getDirectoryCityEnrichmentStats(codeInsee: string): Promise<DirectoryCityEnrichmentStats>;
getDirectoryLatestEnrichmentDateByEstablishment(establishmentId: number): Promise<string | null>;
```

Export the new types from `src/libs/db/index.ts`.

- [ ] **Step 6: Run the schema check to verify it passes**

Run:

```bash
npx tsx scripts/check-directory-enrichment-schema.ts
npx tsc --noEmit
```

Expected: schema check prints `Directory enrichment schema OK`; TypeScript passes.

- [ ] **Step 7: Commit**

```bash
git add src/libs/db/schema.ts src/libs/db/schema-supabase.sql src/libs/db/types.ts src/libs/db/index.ts scripts/check-directory-enrichment-schema.ts
git commit -m "feat(directory): add enrichment schema"
```

---

### Task 2: SQLite And Supabase Read Methods

**Files:**
- Modify: `src/libs/db/sqlite.ts`
- Modify: `src/libs/db/supabase.ts`
- Create: `scripts/check-directory-enrichment-reads.ts`

- [ ] **Step 1: Write the failing read check**

Create `scripts/check-directory-enrichment-reads.ts`:

```ts
import assert from "node:assert/strict";
import Database from "better-sqlite3";
import path from "node:path";
import { SCHEMA } from "../src/libs/db/schema";
import { sqliteAdapter } from "../src/libs/db/sqlite";

const dbPath = process.env.NUMERIS_DB ?? path.join(process.cwd(), "numeris.db");
const db = new Database(dbPath);
db.pragma("journal_mode = WAL");
db.exec(SCHEMA);

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
```

- [ ] **Step 2: Run the read check to verify it fails**

Run:

```bash
npx tsx scripts/check-directory-enrichment-reads.ts
```

Expected: FAIL with a TypeScript error or runtime error because adapter methods are not implemented.

- [ ] **Step 3: Implement SQLite methods**

Add the methods to `sqliteAdapter` in `src/libs/db/sqlite.ts`:

```ts
async getDirectoryProfileFactsByEstablishment(
  establishmentId: number,
): Promise<DirectoryProfileFact[]> {
  return getDb()
    .prepare(
      `SELECT *
       FROM directory_profile_facts
       WHERE establishment_id = ?
         AND is_displayable = 1
       ORDER BY
         CASE fact_type
           WHEN 'website' THEN 0
           WHEN 'contact_url' THEN 1
           WHEN 'phone' THEN 2
           WHEN 'opening_hours' THEN 3
           WHEN 'service' THEN 4
           WHEN 'sector' THEN 5
           WHEN 'software' THEN 6
           WHEN 'registry_status' THEN 7
           ELSE 8
         END,
         confidence DESC,
         label ASC`,
    )
    .all(establishmentId) as DirectoryProfileFact[];
},

async getDirectoryEnrichmentSourcesByEstablishment(
  establishmentId: number,
): Promise<DirectoryEnrichmentSource[]> {
  return getDb()
    .prepare(
      `SELECT *
       FROM directory_enrichment_sources
       WHERE establishment_id = ?
         AND parsed_ok = 1
       ORDER BY retrieved_at DESC, id DESC`,
    )
    .all(establishmentId) as DirectoryEnrichmentSource[];
},

async getLatestDirectoryQualificationSnapshot(
  cabinetId: number,
  establishmentId: number,
): Promise<DirectoryQualificationSnapshot | null> {
  const row = getDb()
    .prepare(
      `SELECT *
       FROM directory_qualification_snapshots
       WHERE cabinet_id = ?
         AND establishment_id = ?
       ORDER BY created_at DESC, id DESC
       LIMIT 1`,
    )
    .get(cabinetId, establishmentId) as DirectoryQualificationSnapshot | undefined;
  return row ?? null;
},

async getDirectoryCityEnrichmentStats(
  codeInsee: string,
): Promise<DirectoryCityEnrichmentStats> {
  const row = getDb()
    .prepare(
      `SELECT
         COUNT(DISTINCT CASE WHEN f.id IS NOT NULL THEN e.id END) AS enrichedCount,
         COUNT(DISTINCT CASE WHEN q.score >= 85 AND q.professional_status IN ('verified','manual_verified') THEN e.id END) AS documentedCount,
         COUNT(DISTINCT e.id) AS totalCount
       FROM directory_establishments e
       JOIN directory_cabinets d ON d.id = e.cabinet_id
       LEFT JOIN directory_profile_facts f
         ON f.establishment_id = e.id
        AND f.is_displayable = 1
       LEFT JOIN directory_qualification_snapshots q
         ON q.id = (
           SELECT q2.id
           FROM directory_qualification_snapshots q2
           WHERE q2.cabinet_id = d.id
             AND q2.establishment_id = e.id
           ORDER BY q2.created_at DESC, q2.id DESC
           LIMIT 1
         )
       WHERE e.city_code_insee = ?
         AND ${DIRECTORY_LISTING_WHERE}`,
    )
    .get(codeInsee) as {
      enrichedCount: number;
      documentedCount: number;
      totalCount: number;
    };

  return {
    enrichedCount: row.enrichedCount,
    documentedCount: row.documentedCount,
    candidateCount: Math.max(row.totalCount - row.documentedCount, 0),
  };
},

async getDirectoryLatestEnrichmentDateByEstablishment(
  establishmentId: number,
): Promise<string | null> {
  const row = getDb()
    .prepare(
      `SELECT MAX(retrieved_at) AS latest
       FROM directory_enrichment_sources
       WHERE establishment_id = ?
         AND parsed_ok = 1`,
    )
    .get(establishmentId) as { latest: string | null };
  return row.latest;
},
```

Add the new imported types at the top of `src/libs/db/sqlite.ts`.

- [ ] **Step 4: Implement Supabase methods**

Add equivalent methods to `src/libs/db/supabase.ts`:

```ts
async getDirectoryProfileFactsByEstablishment(
  establishmentId: number,
): Promise<DirectoryProfileFact[]> {
  const { data, error } = await getSupabaseClient()
    .from("directory_profile_facts")
    .select("*")
    .eq("establishment_id", establishmentId)
    .eq("is_displayable", true)
    .order("confidence", { ascending: false })
    .order("label", { ascending: true });
  if (error) throw error;
  const order = new Map<DirectoryProfileFact["fact_type"], number>([
    ["website", 0],
    ["contact_url", 1],
    ["phone", 2],
    ["opening_hours", 3],
    ["service", 4],
    ["sector", 5],
    ["software", 6],
    ["registry_status", 7],
  ]);
  return ((data ?? []) as DirectoryProfileFact[]).sort(
    (a, b) =>
      (order.get(a.fact_type) ?? 8) - (order.get(b.fact_type) ?? 8)
      || b.confidence - a.confidence
      || a.label.localeCompare(b.label, "fr"),
  );
},

async getDirectoryEnrichmentSourcesByEstablishment(
  establishmentId: number,
): Promise<DirectoryEnrichmentSource[]> {
  const { data, error } = await getSupabaseClient()
    .from("directory_enrichment_sources")
    .select("*")
    .eq("establishment_id", establishmentId)
    .eq("parsed_ok", true)
    .order("retrieved_at", { ascending: false })
    .order("id", { ascending: false });
  if (error) throw error;
  return (data ?? []) as DirectoryEnrichmentSource[];
},

async getLatestDirectoryQualificationSnapshot(
  cabinetId: number,
  establishmentId: number,
): Promise<DirectoryQualificationSnapshot | null> {
  const { data, error } = await getSupabaseClient()
    .from("directory_qualification_snapshots")
    .select("*")
    .eq("cabinet_id", cabinetId)
    .eq("establishment_id", establishmentId)
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return (data ?? null) as DirectoryQualificationSnapshot | null;
},

async getDirectoryCityEnrichmentStats(
  codeInsee: string,
): Promise<DirectoryCityEnrichmentStats> {
  const cards = await this.getDirectoryListingCabinetsByCity(codeInsee, 500);
  if (cards.length === 0) {
    return { enrichedCount: 0, documentedCount: 0, candidateCount: 0 };
  }

  const establishmentIds = cards.map((card) => card.establishment.id);
  const { data: facts, error: factsError } = await getSupabaseClient()
    .from("directory_profile_facts")
    .select("establishment_id")
    .in("establishment_id", establishmentIds)
    .eq("is_displayable", true);
  if (factsError) throw factsError;

  const { data: snapshots, error: snapshotsError } = await getSupabaseClient()
    .from("directory_qualification_snapshots")
    .select("*")
    .in("establishment_id", establishmentIds)
    .order("created_at", { ascending: false })
    .order("id", { ascending: false });
  if (snapshotsError) throw snapshotsError;

  const enriched = new Set((facts ?? []).map((row: any) => row.establishment_id));
  const latestByEstablishment = new Map<number, DirectoryQualificationSnapshot>();
  for (const snapshot of (snapshots ?? []) as DirectoryQualificationSnapshot[]) {
    if (snapshot.establishment_id == null) continue;
    if (!latestByEstablishment.has(snapshot.establishment_id)) {
      latestByEstablishment.set(snapshot.establishment_id, snapshot);
    }
  }

  const documentedCount = Array.from(latestByEstablishment.values()).filter(
    (snapshot) =>
      snapshot.score >= 85
      && ["verified", "manual_verified"].includes(snapshot.professional_status),
  ).length;

  return {
    enrichedCount: enriched.size,
    documentedCount,
    candidateCount: Math.max(cards.length - documentedCount, 0),
  };
},

async getDirectoryLatestEnrichmentDateByEstablishment(
  establishmentId: number,
): Promise<string | null> {
  const { data, error } = await getSupabaseClient()
    .from("directory_enrichment_sources")
    .select("retrieved_at")
    .eq("establishment_id", establishmentId)
    .eq("parsed_ok", true)
    .order("retrieved_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data?.retrieved_at ?? null;
},
```

Add the new imported types at the top of `src/libs/db/supabase.ts`.

- [ ] **Step 5: Run read and type checks**

Run:

```bash
npx tsx scripts/check-directory-enrichment-reads.ts
npx tsc --noEmit
```

Expected: read script prints `Directory enrichment reads OK`; TypeScript passes.

- [ ] **Step 6: Commit**

```bash
git add src/libs/db/sqlite.ts src/libs/db/supabase.ts scripts/check-directory-enrichment-reads.ts
git commit -m "feat(directory): read enrichment data"
```

---

### Task 3: Qualification Helper

**Files:**
- Create: `src/libs/directory/enrichment.ts`
- Create: `scripts/check-directory-enrichment-helpers.ts`

- [ ] **Step 1: Write the failing helper check**

Create `scripts/check-directory-enrichment-helpers.ts`:

```ts
import assert from "node:assert/strict";
import type { DirectoryProfileFact } from "../src/libs/db";
import {
  computeDirectoryQualification,
  groupDirectoryProfileFacts,
  hasUsefulDirectoryProfileFacts,
} from "../src/libs/directory/enrichment";

const facts: DirectoryProfileFact[] = [
  {
    id: 1,
    cabinet_id: 1,
    establishment_id: 10,
    fact_type: "website",
    label: "Site officiel",
    value: "https://cabinet.example",
    source_id: 1,
    confidence: 95,
    is_displayable: 1,
    created_at: "2026-06-28T08:00:00.000Z",
    updated_at: "2026-06-28T08:00:00.000Z",
  },
  {
    id: 2,
    cabinet_id: 1,
    establishment_id: 10,
    fact_type: "service",
    label: "Service",
    value: "Paie",
    source_id: 1,
    confidence: 90,
    is_displayable: 1,
    created_at: "2026-06-28T08:00:00.000Z",
    updated_at: "2026-06-28T08:00:00.000Z",
  },
  {
    id: 3,
    cabinet_id: 1,
    establishment_id: 10,
    fact_type: "service",
    label: "Service",
    value: "Fiscalite",
    source_id: 1,
    confidence: 90,
    is_displayable: 1,
    created_at: "2026-06-28T08:00:00.000Z",
    updated_at: "2026-06-28T08:00:00.000Z",
  },
];

assert.equal(hasUsefulDirectoryProfileFacts(facts), true);
assert.deepEqual(groupDirectoryProfileFacts(facts).services.map((fact) => fact.value), [
  "Paie",
  "Fiscalite",
]);

const qualified = computeDirectoryQualification({
  isActive: true,
  nafCode: "69.20Z",
  professionalStatus: "manual_verified",
  matchedRegistry: true,
  matchedWebsite: true,
  matchedAddress: true,
  matchedSirenOrSiret: true,
  hasWebsiteContactPage: true,
  retrievedAt: "2026-06-28T08:00:00.000Z",
  now: new Date("2026-07-01T08:00:00.000Z"),
  facts,
  hasActiveSuppression: false,
});
assert.equal(qualified.score, 100);
assert.equal(qualified.blockingReason, null);
assert.equal(qualified.canPublish, true);

const suppressed = computeDirectoryQualification({
  isActive: true,
  nafCode: "69.20Z",
  professionalStatus: "manual_verified",
  matchedRegistry: true,
  matchedWebsite: true,
  matchedAddress: true,
  matchedSirenOrSiret: true,
  hasWebsiteContactPage: true,
  retrievedAt: "2026-06-28T08:00:00.000Z",
  now: new Date("2026-07-01T08:00:00.000Z"),
  facts,
  hasActiveSuppression: true,
});
assert.equal(suppressed.canPublish, false);
assert.equal(suppressed.blockingReason, "active_suppression_request");

console.log("Directory enrichment helpers OK");
```

- [ ] **Step 2: Run helper check to verify it fails**

Run:

```bash
npx tsx scripts/check-directory-enrichment-helpers.ts
```

Expected: FAIL because `src/libs/directory/enrichment.ts` does not exist.

- [ ] **Step 3: Implement helper**

Create `src/libs/directory/enrichment.ts`:

```ts
import type {
  DirectoryProfileFact,
  DirectoryProfileFactType,
  DirectoryQualificationSnapshot,
} from "@/libs/db";

export type DirectoryQualificationInput = {
  isActive: boolean;
  nafCode: string | null;
  professionalStatus: DirectoryQualificationSnapshot["professional_status"];
  matchedRegistry: boolean;
  matchedWebsite: boolean;
  matchedAddress: boolean;
  matchedSirenOrSiret: boolean;
  hasWebsiteContactPage: boolean;
  retrievedAt: string | null;
  now?: Date;
  facts: DirectoryProfileFact[];
  hasActiveSuppression: boolean;
};

export type DirectoryQualificationResult = {
  score: number;
  professionalStatus: DirectoryQualificationSnapshot["professional_status"];
  matchedWebsite: boolean;
  matchedRegistry: boolean;
  matchedAddress: boolean;
  matchedSirenOrSiret: boolean;
  hasUsefulProfileFacts: boolean;
  blockingReason: string | null;
  canPublish: boolean;
  snapshot: Record<string, unknown>;
};

export type GroupedDirectoryProfileFacts = {
  contact: DirectoryProfileFact[];
  services: DirectoryProfileFact[];
  sectors: DirectoryProfileFact[];
  software: DirectoryProfileFact[];
  evidence: DirectoryProfileFact[];
};

const USEFUL_FACT_TYPES = new Set<DirectoryProfileFactType>([
  "website",
  "phone",
  "contact_url",
  "opening_hours",
  "service",
  "sector",
  "software",
  "registry_status",
]);

function bool(value: number | boolean | null | undefined): boolean {
  return value === true || value === 1;
}

function displayableFacts(facts: DirectoryProfileFact[]): DirectoryProfileFact[] {
  return facts.filter((fact) => bool(fact.is_displayable));
}

export function hasUsefulDirectoryProfileFacts(
  facts: DirectoryProfileFact[],
): boolean {
  return displayableFacts(facts).some((fact) => USEFUL_FACT_TYPES.has(fact.fact_type));
}

export function groupDirectoryProfileFacts(
  facts: DirectoryProfileFact[],
): GroupedDirectoryProfileFacts {
  const shown = displayableFacts(facts);
  return {
    contact: shown.filter((fact) =>
      ["website", "phone", "email", "contact_url", "opening_hours"].includes(fact.fact_type),
    ),
    services: shown.filter((fact) => fact.fact_type === "service"),
    sectors: shown.filter((fact) => fact.fact_type === "sector"),
    software: shown.filter((fact) => fact.fact_type === "software"),
    evidence: shown.filter((fact) => fact.fact_type === "registry_status"),
  };
}

function isRecent(value: string | null, now: Date): boolean {
  if (!value) return false;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return false;
  const ageMs = now.getTime() - date.getTime();
  return ageMs >= 0 && ageMs <= 180 * 24 * 60 * 60 * 1000;
}

export function computeDirectoryQualification(
  input: DirectoryQualificationInput,
): DirectoryQualificationResult {
  const now = input.now ?? new Date();
  const facts = displayableFacts(input.facts);
  const serviceCount = facts.filter((fact) => fact.fact_type === "service").length;
  const usefulFacts = hasUsefulDirectoryProfileFacts(facts);

  let score = 0;
  if (input.isActive && input.nafCode === "69.20Z") score += 25;
  if (input.matchedRegistry || input.professionalStatus === "manual_verified") score += 20;
  if (input.matchedWebsite) score += 15;
  if (input.hasWebsiteContactPage) score += 10;
  if (facts.some((fact) => ["phone", "contact_url"].includes(fact.fact_type))) score += 10;
  if (serviceCount >= 2) score += 10;
  if (input.matchedAddress) score += 5;
  if (isRecent(input.retrievedAt, now)) score += 5;
  score = Math.min(score, 100);

  let blockingReason: string | null = null;
  if (input.hasActiveSuppression) {
    blockingReason = "active_suppression_request";
  } else if (!input.isActive) {
    blockingReason = "inactive_establishment";
  } else if (!input.matchedRegistry && input.professionalStatus === "unverified") {
    blockingReason = "professional_status_unverified";
  } else if (!usefulFacts) {
    blockingReason = "missing_useful_profile_facts";
  } else if (score < 85) {
    blockingReason = "score_below_publication_threshold";
  }

  const canPublish = blockingReason === null && score >= 85;

  return {
    score,
    professionalStatus: input.professionalStatus,
    matchedWebsite: input.matchedWebsite,
    matchedRegistry: input.matchedRegistry,
    matchedAddress: input.matchedAddress,
    matchedSirenOrSiret: input.matchedSirenOrSiret,
    hasUsefulProfileFacts: usefulFacts,
    blockingReason,
    canPublish,
    snapshot: {
      rules_version: "directory-enrichment-v1",
      service_count: serviceCount,
      useful_fact_count: facts.length,
      retrieved_at: input.retrievedAt,
    },
  };
}
```

- [ ] **Step 4: Run helper and type checks**

Run:

```bash
npx tsx scripts/check-directory-enrichment-helpers.ts
npx tsc --noEmit
```

Expected: helper check prints `Directory enrichment helpers OK`; TypeScript passes.

- [ ] **Step 5: Commit**

```bash
git add src/libs/directory/enrichment.ts scripts/check-directory-enrichment-helpers.ts
git commit -m "feat(directory): score enrichment quality"
```

---

### Task 4: Seeded Pilot Import

**Files:**
- Create: `data/directory-enrichment-pilot.sample.json`
- Create: `scripts/import-directory-enrichment.ts`

- [ ] **Step 1: Add sample payload**

Create `data/directory-enrichment-pilot.sample.json`:

```json
[
  {
    "siret": "44110142500037",
    "source": {
      "source_key": "manual-pilot-example",
      "source_type": "manual",
      "source_url": "https://example-cabinet.test",
      "retrieved_at": "2026-06-28T08:00:00.000Z",
      "legal_basis": "Manual pilot enrichment from public official website.",
      "raw_excerpt": "Official website and services verified for pilot import."
    },
    "matches": {
      "professional_status": "manual_verified",
      "matched_registry": true,
      "matched_website": true,
      "matched_address": true,
      "matched_siren_or_siret": true,
      "has_website_contact_page": true
    },
    "facts": [
      {
        "fact_type": "website",
        "label": "Site officiel",
        "value": "https://example-cabinet.test",
        "confidence": 95,
        "is_displayable": true
      },
      {
        "fact_type": "contact_url",
        "label": "Page contact",
        "value": "https://example-cabinet.test/contact",
        "confidence": 90,
        "is_displayable": true
      },
      {
        "fact_type": "service",
        "label": "Service detecte",
        "value": "Paie",
        "confidence": 90,
        "is_displayable": true
      },
      {
        "fact_type": "service",
        "label": "Service detecte",
        "value": "Fiscalite",
        "confidence": 90,
        "is_displayable": true
      }
    ]
  }
]
```

- [ ] **Step 2: Write importer**

Create `scripts/import-directory-enrichment.ts`:

```ts
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
```

- [ ] **Step 3: Run importer without publication**

Run:

```bash
npx tsx scripts/import-directory-enrichment.ts --file=data/directory-enrichment-pilot.sample.json
npx tsx scripts/check-directory-enrichment-reads.ts
```

Expected: importer prints JSON with one imported record; read check passes.

- [ ] **Step 4: Commit**

```bash
git add data/directory-enrichment-pilot.sample.json scripts/import-directory-enrichment.ts
git commit -m "feat(directory): import pilot enrichment"
```

---

### Task 5: Profile Page Rendering

**Files:**
- Create: `src/components/directory/DirectoryEnrichmentPanel.tsx`
- Modify: `src/components/directory/DirectoryProfileV2.tsx`
- Modify: `src/app/expert-comptable/[ville]/[cabinet]/page.tsx`
- Create: `scripts/check-directory-enrichment-page.tsx`

- [ ] **Step 1: Write failing render check**

Create `scripts/check-directory-enrichment-page.tsx`:

```tsx
import assert from "node:assert/strict";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import type {
  DirectoryEnrichmentSource,
  DirectoryProfileFact,
  DirectoryQualificationSnapshot,
} from "../src/libs/db";
import { sqliteAdapter } from "../src/libs/db/sqlite";
import { DirectoryProfileV2 } from "../src/components/directory/DirectoryProfileV2";

const card = await sqliteAdapter.getDirectoryListingCabinetBySiret("44110142500037");
assert.ok(card, "Expected sample cabinet to exist");

const facts: DirectoryProfileFact[] = [
  {
    id: 1,
    cabinet_id: card.cabinet.id,
    establishment_id: card.establishment.id,
    fact_type: "website",
    label: "Site officiel",
    value: "https://example-cabinet.test",
    source_id: 1,
    confidence: 95,
    is_displayable: 1,
    created_at: "2026-06-28T08:00:00.000Z",
    updated_at: "2026-06-28T08:00:00.000Z",
  },
  {
    id: 2,
    cabinet_id: card.cabinet.id,
    establishment_id: card.establishment.id,
    fact_type: "service",
    label: "Service detecte",
    value: "Paie",
    source_id: 1,
    confidence: 90,
    is_displayable: 1,
    created_at: "2026-06-28T08:00:00.000Z",
    updated_at: "2026-06-28T08:00:00.000Z",
  },
];

const sources: DirectoryEnrichmentSource[] = [
  {
    id: 1,
    cabinet_id: card.cabinet.id,
    establishment_id: card.establishment.id,
    source_key: "manual-pilot-example",
    source_type: "manual",
    source_url: "https://example-cabinet.test",
    retrieved_at: "2026-06-28T08:00:00.000Z",
    source_hash: null,
    parsed_ok: 1,
    robots_allowed: null,
    legal_basis: "Manual pilot source",
    raw_excerpt: "Official source checked",
    created_at: "2026-06-28T08:00:00.000Z",
  },
];

const snapshot: DirectoryQualificationSnapshot = {
  id: 1,
  cabinet_id: card.cabinet.id,
  establishment_id: card.establishment.id,
  score: 90,
  professional_status: "manual_verified",
  matched_website: 1,
  matched_registry: 1,
  matched_address: 1,
  matched_siren_or_siret: 1,
  has_useful_profile_facts: 1,
  blocking_reason: null,
  snapshot_json: "{}",
  created_at: "2026-06-28T08:00:00.000Z",
};

const cityCode = card.city?.code_insee ?? card.establishment.city_code_insee;
assert.ok(cityCode, "Expected city code");

const html = renderToStaticMarkup(
  <DirectoryProfileV2
    card={card}
    relatedCabinets={await sqliteAdapter.getDirectoryRelatedListingCabinetsByCity(
      cityCode,
      card.establishment.siret,
      3,
    )}
    services={await sqliteAdapter.getDirectoryProfileServices()}
    professions={await sqliteAdapter.getDirectoryProfileProfessions(8)}
    enrichmentFacts={facts}
    enrichmentSources={sources}
    qualificationSnapshot={snapshot}
  />,
);

assert.match(html, /Profil enrichi/);
assert.match(html, /Site officiel/);
assert.match(html, /https:\/\/example-cabinet\.test/);
assert.match(html, /Service detecte/);
assert.match(html, /Paie/);
assert.match(html, /Score de qualification/);
assert.doesNotMatch(html, /note moyenne|avis client|etoiles/i);

console.log("Directory enrichment page OK");
```

- [ ] **Step 2: Run render check to verify it fails**

Run:

```bash
npx tsx scripts/check-directory-enrichment-page.tsx
```

Expected: FAIL because `DirectoryProfileV2` does not accept enrichment props.

- [ ] **Step 3: Create enrichment panel component**

Create `src/components/directory/DirectoryEnrichmentPanel.tsx`:

```tsx
import React from "react";
import type {
  DirectoryEnrichmentSource,
  DirectoryProfileFact,
  DirectoryQualificationSnapshot,
} from "@/libs/db";
import {
  groupDirectoryProfileFacts,
} from "@/libs/directory/enrichment";
import { formatDirectoryDate } from "./profile-v2-helpers";

function sourceById(sources: DirectoryEnrichmentSource[]) {
  return new Map(sources.map((source) => [source.id, source]));
}

function FactList({
  title,
  facts,
  sources,
}: {
  title: string;
  facts: DirectoryProfileFact[];
  sources: Map<number, DirectoryEnrichmentSource>;
}) {
  if (facts.length === 0) return null;
  return (
    <section className="rounded-xl border border-border bg-surface p-6 shadow-sm">
      <h3 className="font-display text-[1.125rem] font-semibold text-ink">
        {title}
      </h3>
      <ul className="mt-4 grid gap-3">
        {facts.map((fact) => {
          const source = fact.source_id ? sources.get(fact.source_id) : null;
          return (
            <li key={`${fact.fact_type}-${fact.value}`} className="text-[0.9375rem] leading-6 text-ink-muted">
              <span className="font-display font-semibold text-ink">{fact.label}</span>
              {": "}
              {fact.value.startsWith("http") ? (
                <a href={fact.value} className="text-brand-700 hover:text-brand-500" rel="nofollow noopener noreferrer">
                  {fact.value}
                </a>
              ) : (
                fact.value
              )}
              {source?.retrieved_at && (
                <span className="ml-2 font-mono text-[0.75rem] text-ink-soft">
                  Source {formatDirectoryDate(source.retrieved_at)}
                </span>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export function DirectoryEnrichmentPanel({
  facts,
  sources,
  snapshot,
}: {
  facts: DirectoryProfileFact[];
  sources: DirectoryEnrichmentSource[];
  snapshot: DirectoryQualificationSnapshot | null;
}) {
  if (facts.length === 0 && !snapshot) return null;

  const grouped = groupDirectoryProfileFacts(facts);
  const sourcesById = sourceById(sources);

  return (
    <section>
      <div className="mb-5">
        <h2 className="font-display text-[1.5rem] font-bold text-ink">
          Profil enrichi
        </h2>
        <p className="mt-2 max-w-3xl text-[0.9375rem] leading-7 text-ink-muted">
          Ces informations proviennent de sources identifiees et ne sont affichees
          que lorsqu'elles sont suffisamment documentees.
        </p>
      </div>
      <div className="grid gap-5 md:grid-cols-2">
        <FactList title="Coordonnees verifiees" facts={grouped.contact} sources={sourcesById} />
        <FactList title="Services detectes" facts={grouped.services} sources={sourcesById} />
        <FactList title="Secteurs mentionnes" facts={grouped.sectors} sources={sourcesById} />
        <FactList title="Signaux publics" facts={[...grouped.software, ...grouped.evidence]} sources={sourcesById} />
        {snapshot && (
          <section className="rounded-xl border border-border bg-bg-muted p-6 md:col-span-2">
            <h3 className="font-display text-[1.125rem] font-semibold text-ink">
              Score de qualification
            </h3>
            <p className="mt-3 text-[0.9375rem] leading-7 text-ink-muted">
              Score actuel: <span className="font-mono font-semibold text-ink">{snapshot.score}/100</span>.
              {snapshot.blocking_reason
                ? ` Blocage: ${snapshot.blocking_reason}.`
                : " Aucun blocage de qualification enregistre."}
            </p>
          </section>
        )}
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Wire profile page props and JSON-LD**

Modify `DirectoryProfileV2` props:

```ts
enrichmentFacts?: DirectoryProfileFact[];
enrichmentSources?: DirectoryEnrichmentSource[];
qualificationSnapshot?: DirectoryQualificationSnapshot | null;
```

Default them to empty arrays/null in the function signature. Render:

```tsx
<DirectoryEnrichmentPanel
  facts={enrichmentFacts}
  sources={enrichmentSources}
  snapshot={qualificationSnapshot}
/>
```

Place it after the legal/administrative information section and before localization.

In `DirectoryVerifiedAccountingServiceJsonLd`, add optional fields from displayable facts:

```ts
const website = enrichmentFacts.find((fact) => fact.fact_type === "website")?.value;
const phone = enrichmentFacts.find((fact) => fact.fact_type === "phone")?.value;
if (website) schema.sameAs = [website];
if (phone) schema.telephone = phone;
```

Pass `enrichmentFacts` into that component from the page.

- [ ] **Step 5: Load enrichment on cabinet route**

In `src/app/expert-comptable/[ville]/[cabinet]/page.tsx`, after `card` is loaded:

```ts
const enrichmentFacts = await db.getDirectoryProfileFactsByEstablishment(card.establishment.id);
const enrichmentSources = await db.getDirectoryEnrichmentSourcesByEstablishment(card.establishment.id);
const qualificationSnapshot = await db.getLatestDirectoryQualificationSnapshot(
  card.cabinet.id,
  card.establishment.id,
);
```

Pass all three into `DirectoryVerifiedAccountingServiceJsonLd` and `DirectoryProfileV2`.

- [ ] **Step 6: Run render checks**

Run:

```bash
npx tsx scripts/check-directory-enrichment-page.tsx
npx tsc --noEmit
```

Expected: render check prints `Directory enrichment page OK`; TypeScript passes.

- [ ] **Step 7: Commit**

```bash
git add src/components/directory/DirectoryEnrichmentPanel.tsx src/components/directory/DirectoryProfileV2.tsx 'src/app/expert-comptable/[ville]/[cabinet]/page.tsx' scripts/check-directory-enrichment-page.tsx
git commit -m "feat(directory): render enriched profile facts"
```

---

### Task 6: City Listing Signals

**Files:**
- Modify: `src/components/directory/DirectoryCityCabinetList.tsx`
- Modify: `src/components/directory/DirectoryCityPageV2.tsx`
- Modify: `src/app/expert-comptable/[ville]/page.tsx`

- [ ] **Step 1: Extend city page props**

Add `enrichmentStats` to `DirectoryCityPageV2` props:

```ts
enrichmentStats: DirectoryCityEnrichmentStats;
```

In `src/app/expert-comptable/[ville]/page.tsx`, load:

```ts
const enrichmentStats = await db.getDirectoryCityEnrichmentStats(city.code_insee);
```

Pass it to `DirectoryCityPageV2`.

- [ ] **Step 2: Render city enrichment counts**

In `CitySummaryPanel`, add rows:

```ts
{ label: "Profils enrichis", value: formatNumber(enrichmentStats.enrichedCount) },
{ label: "Qualifies", value: formatNumber(enrichmentStats.documentedCount) },
```

In the hero copy, add one sentence:

```tsx
{enrichmentStats.enrichedCount > 0 && (
  <>
    {" "}
    <span className="font-mono font-semibold text-surface">
      {formatNumber(enrichmentStats.enrichedCount)}
    </span>{" "}
    profil{enrichmentStats.enrichedCount > 1 ? "s" : ""} dispose
    {enrichmentStats.enrichedCount > 1 ? "nt" : ""} deja de donnees enrichies sourcees.
  </>
)}
```

- [ ] **Step 3: Keep card badges simple**

Do not run one query per card. For this iteration, cards keep the current documented/candidate badge. Add city-level enrichment counts only. Per-card badges should wait until listing queries return enrichment summaries in one batch.

- [ ] **Step 4: Run checks**

Run:

```bash
npx tsc --noEmit
npm run build
```

Expected: TypeScript and production build pass.

- [ ] **Step 5: Commit**

```bash
git add src/components/directory/DirectoryCityPageV2.tsx 'src/app/expert-comptable/[ville]/page.tsx'
git commit -m "feat(directory): show city enrichment counts"
```

---

### Task 7: Sitemap Freshness

**Files:**
- Modify: `src/app/sitemap.ts`

- [ ] **Step 1: Use enrichment source freshness for cabinet URLs**

Inside the existing loop over `db.getDirectoryCabinetsByCity`, compute:

```ts
const enrichmentDate = await db.getDirectoryLatestEnrichmentDateByEstablishment(
  card.establishment.id,
);
```

Then use:

```ts
lastModified: enrichmentDate ? parsePageMetaDate(enrichmentDate, buildDate) : buildDate,
```

for the cabinet entry.

- [ ] **Step 2: Run checks**

Run:

```bash
npx tsc --noEmit
npm run build
```

Expected: TypeScript and production build pass.

- [ ] **Step 3: Commit**

```bash
git add src/app/sitemap.ts
git commit -m "feat(directory): use enrichment freshness in sitemap"
```

---

### Task 8: Final Verification

**Files:**
- No code files expected.

- [ ] **Step 1: Run all targeted checks**

Run:

```bash
npx tsx scripts/check-directory-enrichment-schema.ts
npx tsx scripts/check-directory-enrichment-helpers.ts
npx tsx scripts/import-directory-enrichment.ts --file=data/directory-enrichment-pilot.sample.json
npx tsx scripts/check-directory-enrichment-reads.ts
npx tsx scripts/check-directory-enrichment-page.tsx
npx tsc --noEmit
npm run build
```

Expected: all scripts pass, TypeScript passes, build passes.

- [ ] **Step 2: Inspect routes locally**

Run:

```bash
npm run dev
```

Open:

```text
http://localhost:3000/annuaire/experts-comptables
http://localhost:3000/expert-comptable/paris
http://localhost:3000/expert-comptable/paris/01-experts-associes-44110142500037
```

Expected:

- Directory index still renders.
- Paris city page shows enriched profile counts after the sample import.
- Cabinet profile shows `Profil enrichi`, source-backed facts, and qualification score.
- Candidate/non-candidate wording remains explicit.
- No invented reviews, ratings, or opening hours appear.

- [ ] **Step 3: Commit verification docs if any were added**

If no files changed during verification, do not commit.

---

## Self-Review

- Spec coverage: data model covered by Task 1, read layer by Task 2, qualification by Task 3, seeded pilot import by Task 4, profile rendering by Task 5, city-level SEO signals by Task 6, sitemap freshness by Task 7, verification by Task 8.
- Scope check: automated discovery/crawl is intentionally excluded from this plan because the spec puts it after the manual pilot path.
- Red-flag scan: the plan contains no unfinished markers and no unnamed future code path.
- Type consistency: type names and adapter method names are introduced in Task 1 and reused consistently in later tasks.
