// SQLite schema for local database
export const SCHEMA = `
CREATE TABLE IF NOT EXISTS services (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT '📊',
  order_index INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS team_members (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  initials TEXT NOT NULL,
  description TEXT NOT NULL,
  specialties TEXT NOT NULL DEFAULT '[]',
  badge TEXT,
  order_index INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS testimonials (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  author_name TEXT NOT NULL,
  author_initials TEXT NOT NULL,
  author_role TEXT NOT NULL,
  body TEXT NOT NULL,
  stars INTEGER NOT NULL DEFAULT 5,
  featured INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS pricing_plans (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT UNIQUE NOT NULL,
  tag TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  price TEXT NOT NULL,
  period TEXT NOT NULL DEFAULT '/mois',
  features TEXT NOT NULL DEFAULT '[]',
  featured INTEGER NOT NULL DEFAULT 0,
  cta_label TEXT NOT NULL DEFAULT 'Choisir',
  note TEXT,
  order_index INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS faq_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS pages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  meta_title TEXT NOT NULL,
  meta_description TEXT NOT NULL,
  h1 TEXT NOT NULL,
  content TEXT
);

-- ─── CLUSTERING / KG TABLES ───

CREATE TABLE IF NOT EXISTS silos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT UNIQUE NOT NULL,
  label TEXT NOT NULL,
  volume INTEGER NOT NULL DEFAULT 0,
  n_keywords INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS hubs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT UNIQUE NOT NULL,
  silo_slug TEXT NOT NULL,
  label TEXT NOT NULL,
  volume INTEGER NOT NULL DEFAULT 0,
  n_keywords INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS clusters (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT UNIQUE NOT NULL,
  hub_slug TEXT NOT NULL,
  label TEXT NOT NULL,
  volume INTEGER NOT NULL DEFAULT 0,
  n_keywords INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS keyword_pages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT UNIQUE NOT NULL,
  cluster_slug TEXT NOT NULL,
  label TEXT NOT NULL,
  volume INTEGER NOT NULL DEFAULT 0,
  intent TEXT,
  kd REAL,
  cpc REAL,
  serp_features TEXT,
  meta_title TEXT,
  meta_description TEXT,
  h1 TEXT
);

CREATE TABLE IF NOT EXISTS villes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  departement TEXT,
  region TEXT,
  population INTEGER DEFAULT 0,
  address TEXT,
  postal_code TEXT,
  phone TEXT,
  opening_hours TEXT,
  latitude REAL,
  longitude REAL,
  ape_code TEXT DEFAULT '6920Z',
  siret_etablissement TEXT
  -- TODO: replace siret_etablissement SIREN root with real SIREN from Patch D once provisioned
);

CREATE TABLE IF NOT EXISTS departements (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT UNIQUE NOT NULL,
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  region TEXT
);

CREATE TABLE IF NOT EXISTS secteurs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  volume INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS service_secteur (
  service_slug TEXT NOT NULL,
  secteur_slug TEXT NOT NULL,
  volume INTEGER DEFAULT 0,
  PRIMARY KEY (service_slug, secteur_slug)
);

CREATE TABLE IF NOT EXISTS service_ville (
  service_slug TEXT NOT NULL,
  ville_slug TEXT NOT NULL,
  volume INTEGER DEFAULT 0,
  PRIMARY KEY (service_slug, ville_slug)
);

CREATE TABLE IF NOT EXISTS profession_categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT DEFAULT '',
  order_index INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS professions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  category_slug TEXT NOT NULL,
  description TEXT,
  obligations TEXT,
  volume INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS service_profession (
  service_slug TEXT NOT NULL,
  profession_slug TEXT NOT NULL,
  volume INTEGER DEFAULT 0,
  PRIMARY KEY (service_slug, profession_slug)
);

CREATE TABLE IF NOT EXISTS kg_edges (
  source_slug TEXT NOT NULL,
  target_slug TEXT NOT NULL,
  edge_type TEXT NOT NULL CHECK(edge_type IN ('hierarchical','sibling','service_funnel','cross_silo')),
  weight REAL DEFAULT 1.0,
  PRIMARY KEY (source_slug, target_slug, edge_type)
);

-- ─── PAGE CONTENT TABLES (sections, SEO, meta) ───
-- Populated by the numeris_pipeline (teams/content/tools/numeris_pipeline)
-- Read at build time by route templates (src/app/[locale]/...)
-- Schema reference: teams/content/tools/numeris_pipeline/06_persist_db.py (DDL constant)
-- Detailed spec: ARKEE_ORG Vague 2.B brief

CREATE TABLE IF NOT EXISTS page_sections (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  route TEXT NOT NULL,           -- 'professions' | 'villes' | 'expertises' | 'ressources' | 'secteurs' | 'departements'
  slug TEXT NOT NULL,            -- page slug (ex: 'boulangers')
  section_type TEXT NOT NULL,    -- 'Hero' | 'ContentSection' | 'BenefitsGrid' | 'Checklist' | 'AlertBox' | 'Faq' | 'KeyTakeaways' | 'InternalLinks'
  section_order INTEGER NOT NULL DEFAULT 0,
  title TEXT,
  body TEXT,                     -- markdown or simple HTML
  items TEXT,                    -- JSON array (BenefitsGrid items, Checklist items, Faq pairs, etc.)
  citations TEXT,                -- JSON array [{text, url, source: 'legifrance'|'bofip'|'urssaf'|...}]
  generated_at TEXT NOT NULL DEFAULT (datetime('now')),
  generated_by_model TEXT,       -- 'gemini-2.5-pro' | ...
  UNIQUE(route, slug, section_order)
);
CREATE INDEX IF NOT EXISTS idx_page_sections_route_slug ON page_sections(route, slug);

-- Internal maillage (contextual links injected by maillage-v3). Rendered as a
-- "Liens utiles" block on the page whose canonical URL == source_url.
CREATE TABLE IF NOT EXISTS maillage_links (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  source_route TEXT,
  source_slug TEXT,
  source_url TEXT NOT NULL,
  source_path TEXT,              -- chemin normalisé (sans host, sans slash final) → match exact runtime
  target_url TEXT NOT NULL,
  anchor TEXT NOT NULL,
  family TEXT,
  priority REAL,
  wave TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  UNIQUE(source_url, target_url)
);
CREATE INDEX IF NOT EXISTS idx_maillage_links_source ON maillage_links(source_url);
CREATE INDEX IF NOT EXISTS idx_maillage_links_source_path ON maillage_links(source_path);

CREATE TABLE IF NOT EXISTS seo_overrides (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  route TEXT NOT NULL,
  slug TEXT NOT NULL,
  meta_title TEXT,
  meta_description TEXT,
  h1 TEXT,
  key_takeaways TEXT,            -- JSON array
  json_ld_extra TEXT,            -- JSON object — extra schemas (Article, ProfessionalService, ...)
  generated_at TEXT NOT NULL DEFAULT (datetime('now')),
  generated_by_model TEXT,
  UNIQUE(route, slug)
);
CREATE INDEX IF NOT EXISTS idx_seo_overrides_route_slug ON seo_overrides(route, slug);

CREATE TABLE IF NOT EXISTS page_meta (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  route TEXT NOT NULL,
  slug TEXT NOT NULL,
  author_persona_id TEXT NOT NULL DEFAULT 'helene-marchand',
  reviewed_at TEXT NOT NULL DEFAULT (datetime('now')),
  reviewed_by TEXT NOT NULL DEFAULT 'helene-marchand',
  content_hash TEXT,             -- SHA256 of sections JSON — change detection
  publish_status TEXT NOT NULL DEFAULT 'draft' CHECK(publish_status IN ('draft', 'review', 'published', 'archived')),
  published_at TEXT,
  pipeline_run_id TEXT,
  UNIQUE(route, slug)
);
CREATE INDEX IF NOT EXISTS idx_page_meta_route_slug ON page_meta(route, slug);
CREATE INDEX IF NOT EXISTS idx_page_meta_publish_status ON page_meta(publish_status);

-- ─── PRICING TIERS (P4a) ───
-- New table backing the V2 PricingTeaser component (3 tiers 59/99/159 EUR).
-- Distinct from legacy pricing_plans table (Home pricing block). Will be seeded in P4b.

CREATE TABLE IF NOT EXISTS pricing_tiers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT UNIQUE NOT NULL,        -- 'essential', 'pro', 'premium'
  name TEXT NOT NULL,                -- 'Essential', 'Pro', 'Premium'
  from_price TEXT NOT NULL,          -- 'À partir de 59€ HT/mois'
  price_value INTEGER NOT NULL,      -- 59, 99, 159
  features TEXT NOT NULL,            -- JSON array of strings
  highlighted INTEGER NOT NULL DEFAULT 0,  -- 1 = "Best value" badge
  cta_label TEXT NOT NULL DEFAULT 'Choisir',
  order_index INTEGER NOT NULL DEFAULT 0,
  description TEXT,
  target_audience TEXT               -- ex: 'TPE solo', 'PME 5-15 salariés'
);
CREATE INDEX IF NOT EXISTS idx_pricing_tiers_order ON pricing_tiers(order_index);

-- ─── DIRECTORY DATA INTEGRATION ───
-- Public-source annuaire layer. RNE/Sirene records are candidates only; public
-- SEO/indexable reads must gate on documented professional status, confidence
-- score, active status, and suppression requests. Listing reads may expose
-- review candidates only with explicit non-confirmation wording.

CREATE TABLE IF NOT EXISTS source_registry (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  source_key TEXT UNIQUE NOT NULL,
  source_name TEXT NOT NULL,
  source_url TEXT,
  source_type TEXT NOT NULL CHECK(source_type IN ('api','sftp','manual','authorized_export','claim')),
  license_label TEXT,
  legal_basis TEXT NOT NULL,
  allowed_fields TEXT NOT NULL DEFAULT '[]',
  refresh_frequency TEXT NOT NULL DEFAULT 'manual',
  requires_legal_review INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS cities_official (
  code_insee TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  postal_codes TEXT NOT NULL DEFAULT '[]',
  department_code TEXT,
  department_name TEXT,
  region_code TEXT,
  region_name TEXT,
  latitude REAL,
  longitude REAL,
  population INTEGER NOT NULL DEFAULT 0,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_cities_official_slug ON cities_official(slug);

CREATE TABLE IF NOT EXISTS directory_cabinets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  siren TEXT UNIQUE,
  legal_name TEXT NOT NULL,
  display_name TEXT,
  naf_code TEXT,
  legal_form TEXT,
  is_active INTEGER NOT NULL DEFAULT 1,
  oec_status TEXT NOT NULL DEFAULT 'unverified' CHECK(oec_status IN ('unverified','verified','manual_verified','not_found','ambiguous','stale')),
  oec_profile_url TEXT,
  oec_verified_at TEXT,
  confidence_score INTEGER NOT NULL DEFAULT 0,
  publish_status TEXT NOT NULL DEFAULT 'draft' CHECK(publish_status IN ('draft','review','published','archived','blocked')),
  source_summary TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_directory_cabinets_publish ON directory_cabinets(publish_status, confidence_score, oec_status);

CREATE TABLE IF NOT EXISTS directory_establishments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  cabinet_id INTEGER NOT NULL REFERENCES directory_cabinets(id) ON DELETE CASCADE,
  siret TEXT UNIQUE NOT NULL,
  is_headquarter INTEGER NOT NULL DEFAULT 0,
  is_active INTEGER NOT NULL DEFAULT 1,
  address_line1 TEXT,
  address_line2 TEXT,
  postal_code TEXT,
  city_name TEXT,
  city_code_insee TEXT REFERENCES cities_official(code_insee),
  department_code TEXT,
  region_code TEXT,
  latitude REAL,
  longitude REAL,
  geocode_score REAL,
  source_key TEXT REFERENCES source_registry(source_key),
  retrieved_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_directory_establishments_city ON directory_establishments(city_code_insee, is_active);

CREATE TABLE IF NOT EXISTS directory_experts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  cabinet_id INTEGER NOT NULL REFERENCES directory_cabinets(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  oec_status TEXT NOT NULL DEFAULT 'verified' CHECK(oec_status IN ('verified','manual_verified','unverified','stale')),
  source_url TEXT,
  source_retrieved_at TEXT,
  is_displayable INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_directory_experts_cabinet ON directory_experts(cabinet_id, is_displayable);

CREATE TABLE IF NOT EXISTS profile_claims (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  cabinet_id INTEGER NOT NULL REFERENCES directory_cabinets(id) ON DELETE CASCADE,
  claimant_email_hash TEXT NOT NULL,
  claimed_at TEXT NOT NULL DEFAULT (datetime('now')),
  verified_at TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','verified','rejected','expired')),
  consent_version TEXT NOT NULL DEFAULT 'annuaire-rgpd-v1'
);

CREATE TABLE IF NOT EXISTS privacy_suppression_requests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  siren TEXT,
  siret TEXT,
  requester_hash TEXT NOT NULL,
  reason TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active','resolved','rejected')),
  received_at TEXT NOT NULL DEFAULT (datetime('now')),
  resolved_at TEXT
);
CREATE INDEX IF NOT EXISTS idx_privacy_suppression_siret ON privacy_suppression_requests(siret, status);

CREATE TABLE IF NOT EXISTS directory_source_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  entity_type TEXT NOT NULL CHECK(entity_type IN ('cabinet','establishment','expert','city','claim','suppression')),
  entity_key TEXT NOT NULL,
  source_key TEXT NOT NULL REFERENCES source_registry(source_key),
  source_url TEXT,
  source_hash TEXT,
  retrieved_at TEXT NOT NULL DEFAULT (datetime('now')),
  parsed_ok INTEGER NOT NULL DEFAULT 1,
  legal_basis TEXT NOT NULL,
  old_value TEXT,
  new_value TEXT,
  change_reason TEXT
);
CREATE INDEX IF NOT EXISTS idx_directory_source_events_entity ON directory_source_events(entity_type, entity_key);

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
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_directory_enrichment_sources_unique ON directory_enrichment_sources(cabinet_id, COALESCE(establishment_id, -1), source_key, COALESCE(source_url, ''));
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
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_directory_profile_facts_unique ON directory_profile_facts(cabinet_id, COALESCE(establishment_id, -1), fact_type, value);
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

-- ─── TESTIMONIALS extension (P4a) ───
-- ALTERs are applied imperatively by scripts/migrate-pricing-testimonials.ts
-- (via PRAGMA table_info check) because CREATE TABLE IF NOT EXISTS does NOT
-- backfill columns on an existing table. Pattern mirrors seed-geo.ts.
-- Columns added (idempotently):
--   - profession_slug TEXT
--   - secteur_slug    TEXT
--   - ville_slug      TEXT
--   - _fictional      INTEGER NOT NULL DEFAULT 0  (internal audit flag, not exposed)
-- Index:
--   - idx_testimonials_profession ON testimonials(profession_slug)

-- ─── AFFILIATION / COMMERCIAL LAYER (couche comparateur indépendant) ───
-- Couche isolée : ne touche pas aux tables KG éditoriales (silos/hubs/clusters/
-- keyword_pages) ni à /ressources. Routes dédiées : /comparatifs, /avis,
-- /codes-parrainage. Données générées par ARKEE_ORG/CLIENTS/_standalone/numeris/
-- (build_affiliate_taxonomy.py + Workflow) → importées par scripts/import-affiliate-clustering.ts.
-- Le CONTENU (page_sections/seo_overrides/page_meta) reste produit par numeris_pipeline (Gemini).

-- Programmes d'affiliation (source: Affiliation_Secteur_Comptable.xlsx, 77 programmes).
CREATE TABLE IF NOT EXISTS affiliate_programs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  category_slug TEXT NOT NULL,
  program_type TEXT NOT NULL,             -- 'AFF' | 'PAR' | 'APP' (+ combos)
  has_affiliate INTEGER NOT NULL DEFAULT 0,
  has_referral INTEGER NOT NULL DEFAULT 0,
  has_apporteur INTEGER NOT NULL DEFAULT 0,
  commission_display TEXT,                 -- 'Rémunération affichée' verbatim
  recurrent INTEGER NOT NULL DEFAULT 0,
  recurrent_note TEXT,
  platform TEXT,                           -- 'Affilae' | 'Impact' | 'Interne' | ...
  target_audience TEXT,
  scale_public TEXT,                       -- 'Barème public': Oui/Partiel/Non
  source_url TEXT,                         -- page programme (PAS le lien tracké)
  affiliate_url TEXT,                      -- lien tracké/deeplink — NULL au seed
  notes TEXT,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_affiliate_programs_category ON affiliate_programs(category_slug, is_active);

-- Pages commerciales (334 topics : pillars/persona/subhub/tofu/avis/codes/alt/vs).
-- Table isolée qui porte le routing + le fil d'ariane (hub/cluster labels) + la méta.
CREATE TABLE IF NOT EXISTS commercial_pages (
  slug TEXT PRIMARY KEY,
  route TEXT NOT NULL,                      -- 'comparatifs' | 'avis' | 'codes-parrainage'
  url TEXT NOT NULL,
  archetype TEXT NOT NULL,                  -- pillar|persona|subhub|tofu|avis|code|alternatives|vs
  silo_label TEXT,
  hub_slug TEXT,
  hub_label TEXT,
  cluster_slug TEXT,
  cluster_label TEXT,
  label TEXT NOT NULL,
  intent TEXT,
  funnel_stage TEXT,
  primary_program TEXT,
  secondary_programs TEXT,                  -- 'a|b|c'
  target_query TEXT,
  est_volume INTEGER NOT NULL DEFAULT 0,
  priority_ice REAL NOT NULL DEFAULT 0,
  publish_wave INTEGER NOT NULL DEFAULT 0,
  brief_json TEXT,                          -- brief éditorial enrichi (input pipeline gen-IA / Gemini)
  publish_status TEXT NOT NULL DEFAULT 'draft' CHECK(publish_status IN ('draft','review','published','archived')),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_commercial_pages_route ON commercial_pages(route, publish_status);
CREATE INDEX IF NOT EXISTS idx_commercial_pages_cluster ON commercial_pages(cluster_slug);

-- Association page ⟷ programme (rendu de la ComparisonTable + CTA d'affiliation).
CREATE TABLE IF NOT EXISTS page_affiliate_programs (
  route TEXT NOT NULL,
  page_slug TEXT NOT NULL,
  program_slug TEXT NOT NULL,
  rank INTEGER NOT NULL DEFAULT 0,
  is_primary INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (route, page_slug, program_slug)
);
CREATE INDEX IF NOT EXISTS idx_page_affiliate_page ON page_affiliate_programs(route, page_slug);

-- Maillage interne de la couche commerciale (pillar↔avis, avis↔code, persona↔secteur…).
CREATE TABLE IF NOT EXISTS commercial_links (
  source_slug TEXT NOT NULL,
  source_route TEXT,
  target_slug TEXT NOT NULL,
  target_route TEXT,                        -- 'comparatifs'|'avis'|'codes-parrainage'|'secteurs' (page existante)
  edge_type TEXT NOT NULL,
  weight REAL NOT NULL DEFAULT 1.0,
  PRIMARY KEY (source_slug, target_slug, edge_type)
);
CREATE INDEX IF NOT EXISTS idx_commercial_links_source ON commercial_links(source_slug);
`;
