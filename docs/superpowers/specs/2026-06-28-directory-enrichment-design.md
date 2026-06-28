# Directory Enrichment Design

## Context

Skoria already has a Next.js directory layer for accounting firms:

- City pages: `/expert-comptable/[ville]`
- Cabinet pages: `/expert-comptable/[ville]/[cabinet]`
- Public-source candidate import from `recherche-entreprises.api.gouv.fr`
- Strong publication gates: active establishment, no active suppression request, `publish_status`, `confidence_score`, and professional status
- Candidate pages can render for users, but remain noindex until documented

The local database currently has about 27,304 `review/unverified` cabinets, 32,508 establishments, and only 3 `published/manual_verified` cabinets. The SEO opportunity is therefore not to generate more thin pages. The opportunity is to qualify and enrich high-potential profiles until they become useful, sourced, and indexable.

## Goal

Build a first enrichment system that turns priority directory candidates into source-backed profile pages with enough public evidence, useful comparison data, and quality controls to outperform generic local directory pages.

The first milestone should enrich and qualify a pilot batch, not the full database. Recommended pilot:

- Paris, Lyon, Marseille, Toulouse, Nice, Bordeaux
- 500 to 2,000 candidate cabinets
- Priority order: largest cities, active headquarters, complete address and geocode, clear accounting NAF code, high confidence potential

## Non-Goals

The first milestone will not:

- Scrape Google Maps, LinkedIn, Trustpilot, or other sources whose terms are likely incompatible with bulk extraction
- Invent reviews, notes, opening hours, biographies, team members, or specialties
- Index every candidate page
- Build a full claim portal
- Build a lead marketplace or paid ranking system

## Enrichment Sources

Allowed first-wave sources:

- Existing Sirene / Recherche Entreprises data already imported
- Official company websites discovered from public search or explicit site metadata
- Pages on the official website when crawlable and relevant: homepage, contact, services, mentions legales, equipe, expertise pages
- Public OEC or professional registry profile when available and reliably matched
- Manual verification events for pilot records

Each source must be recorded with:

- Source key
- URL
- Retrieved timestamp
- Source type
- Hash or normalized text fingerprint when useful
- Parsed fields
- Parse status
- Legal basis / usage note

## Data Model

Add focused enrichment tables instead of overloading `directory_cabinets`.

### `directory_enrichment_runs`

Tracks each batch run.

Fields:

- `id`
- `run_key`
- `status`: `running`, `completed`, `failed`
- `scope`
- `started_at`
- `finished_at`
- `stats_json`
- `error_message`

### `directory_enrichment_sources`

Stores fetched or manually provided source records.

Fields:

- `id`
- `cabinet_id`
- `establishment_id`
- `source_key`
- `source_type`: `api`, `official_website`, `registry`, `manual`
- `source_url`
- `retrieved_at`
- `source_hash`
- `parsed_ok`
- `robots_allowed`
- `legal_basis`
- `raw_excerpt`
- `created_at`

### `directory_profile_facts`

Stores displayable extracted facts.

Fields:

- `id`
- `cabinet_id`
- `establishment_id`
- `fact_type`: `website`, `phone`, `email`, `contact_url`, `opening_hours`, `service`, `sector`, `software`, `team_signal`, `registry_status`
- `label`
- `value`
- `source_id`
- `confidence`
- `is_displayable`
- `created_at`
- `updated_at`

### `directory_qualification_snapshots`

Stores the score calculation used to move a profile toward publication.

Fields:

- `id`
- `cabinet_id`
- `establishment_id`
- `score`
- `professional_status`
- `matched_website`
- `matched_registry`
- `matched_address`
- `matched_siren_or_siret`
- `has_useful_profile_facts`
- `blocking_reason`
- `snapshot_json`
- `created_at`

## Qualification Rules

Keep the current publication threshold concept, but make the score explainable.

Suggested scoring:

- +25: active Sirene establishment with accounting activity
- +20: professional registry or manual OEC verification matched
- +15: official website matched by name plus SIREN/SIRET or address
- +10: website contact page found
- +10: phone or contact URL found from official source
- +10: at least two services extracted from official website
- +5: city/address match between source and establishment
- +5: recent retrieval, less than 180 days

Blocking conditions:

- Active suppression request
- Inactive cabinet or establishment
- Website mismatch or ambiguous identity
- No professional verification when profile would be indexed as documented
- Low confidence below 85 for indexable publication

Candidate pages may remain accessible through listing flows but should stay noindex unless the public read gate passes.

## Page Experience

The enriched profile page should add sections only when real facts exist.

Recommended sections:

- Profile summary: public identity, city, activity, and verification status
- Verified contact block: official website, contact page, phone, source labels
- Services detected: accounting, payroll, tax, creation, audit, consulting, etc.
- Sectors or professions served: displayed only when found on the official website
- Public evidence: compact source table with source name, field, date retrieved
- Qualification explanation: why the fiche is documented or why it remains candidate
- Related profiles: same city and similar service tags

City pages should benefit from enrichment too:

- Count enriched/documented/candidate profiles separately
- Add filters or badges for website found, contact available, services detected
- Prioritize documented/enriched cards above raw candidates

## SEO Rules

Only index pages that are useful and sourced.

Indexable cabinet profile requirements:

- `publish_status = published`
- `confidence_score >= 85`
- `oec_status IN ('verified', 'manual_verified')` or equivalent documented professional status
- No active suppression request
- At least one establishment active
- At least one useful enrichment fact beyond Sirene data

Structured data:

- Continue using `AccountingService`
- Add `url`, `telephone`, `sameAs`, `openingHoursSpecification`, and richer `areaServed` only when sourced
- Keep identifier values for SIREN/SIRET/APE
- Do not add aggregate ratings unless ratings are real and legally usable

Freshness:

- Show retrieval dates for source-backed facts
- Use enriched source timestamps to improve `lastModified` on sitemap entries
- Re-run high-value cities regularly, lower-value cities less often

## Compliance And Safety

The system must keep the existing compliance posture:

- No fabricated reviews, ratings, staff, hours, or service claims
- Clear correction and suppression links
- Source provenance visible to users
- Candidate vs documented status explicit
- Crawl politely, respect robots where applicable, and rate-limit requests
- Prefer official sources and manual verification over broad scraping

## Testing

Test coverage should focus on:

- Scoring thresholds and blocking reasons
- Fact normalization and display gating
- Public read methods returning enriched facts only when displayable
- Profile rendering with and without enrichment
- Structured data only including sourced optional fields
- Candidate pages remaining noindex
- Sitemap including only public documented profiles

## Success Metrics

Pilot success means:

- At least 500 candidate cabinets processed
- At least 100 enriched profiles with official website or registry evidence
- At least 50 profiles eligible for publication after manual or registry verification
- Zero indexed candidate pages without professional documentation
- Profile pages contain unique, source-backed facts beyond Sirene data
- City pages communicate documented vs candidate counts clearly

## Implementation Phases

### Phase 1: Data Model And Read Layer

Add enrichment tables, shared types, adapter read methods, and helper functions.

### Phase 2: Qualification Engine

Implement deterministic score calculation and tests. Add a CLI to score existing records from available data.

### Phase 3: Manual/Seeded Pilot Enrichment

Add a CSV/JSON import path for known official websites and registry/manual verification events. This validates the data model before automated crawling.

### Phase 4: Profile Rendering

Render enriched facts on cabinet and city pages, with strict display gating and source labels.

### Phase 5: Automated Discovery And Crawl

Add polite website discovery and crawl only after the manual pilot path is working.

## Open Operational Checks

Before production rollout:

- Confirm the live domain and sitemap are reachable
- Confirm Supabase schema migration path for all new tables
- Confirm legal review for source usage and crawl policy
- Decide whether the first pilot writes to SQLite only, Supabase only, or both
