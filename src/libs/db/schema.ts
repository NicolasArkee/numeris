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
`;
