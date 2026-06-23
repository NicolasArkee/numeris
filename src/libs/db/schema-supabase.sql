-- Skoria Postgres schema (generated from SQLite via Skoria pipeline)
-- Apply in Supabase SQL Editor: paste, run.

-- ─── CORE EDITORIAL TABLES ───

CREATE TABLE IF NOT EXISTS services (
  id BIGSERIAL PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT '📊',
  order_index INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS team_members (
  id BIGSERIAL PRIMARY KEY,
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
  id BIGSERIAL PRIMARY KEY,
  author_name TEXT NOT NULL,
  author_initials TEXT NOT NULL,
  author_role TEXT NOT NULL,
  body TEXT NOT NULL,
  stars INTEGER NOT NULL DEFAULT 5,
  featured BOOLEAN NOT NULL DEFAULT FALSE,
  profession_slug TEXT,
  secteur_slug TEXT,
  ville_slug TEXT,
  _fictional BOOLEAN NOT NULL DEFAULT FALSE
);
CREATE INDEX IF NOT EXISTS idx_testimonials_profession ON testimonials(profession_slug);

CREATE TABLE IF NOT EXISTS pricing_plans (
  id BIGSERIAL PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  tag TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  price TEXT NOT NULL,
  period TEXT NOT NULL DEFAULT '/mois',
  features TEXT NOT NULL DEFAULT '[]',
  featured BOOLEAN NOT NULL DEFAULT FALSE,
  cta_label TEXT NOT NULL DEFAULT 'Choisir',
  note TEXT,
  order_index INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS faq_items (
  id BIGSERIAL PRIMARY KEY,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS pages (
  id BIGSERIAL PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  meta_title TEXT NOT NULL,
  meta_description TEXT NOT NULL,
  h1 TEXT NOT NULL,
  content TEXT
);

-- ─── CLUSTERING / KG TABLES ───

CREATE TABLE IF NOT EXISTS silos (
  id BIGSERIAL PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  label TEXT NOT NULL,
  volume INTEGER NOT NULL DEFAULT 0,
  n_keywords INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS hubs (
  id BIGSERIAL PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  silo_slug TEXT NOT NULL,
  label TEXT NOT NULL,
  volume INTEGER NOT NULL DEFAULT 0,
  n_keywords INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS clusters (
  id BIGSERIAL PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  hub_slug TEXT NOT NULL,
  label TEXT NOT NULL,
  volume INTEGER NOT NULL DEFAULT 0,
  n_keywords INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS keyword_pages (
  id BIGSERIAL PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  cluster_slug TEXT NOT NULL,
  label TEXT NOT NULL,
  volume INTEGER NOT NULL DEFAULT 0,
  intent TEXT,
  kd DOUBLE PRECISION,
  cpc DOUBLE PRECISION,
  serp_features TEXT,
  meta_title TEXT,
  meta_description TEXT,
  h1 TEXT
);

CREATE TABLE IF NOT EXISTS villes (
  id BIGSERIAL PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  departement TEXT,
  region TEXT,
  population INTEGER DEFAULT 0,
  address TEXT,
  postal_code TEXT,
  phone TEXT,
  opening_hours TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  ape_code TEXT DEFAULT '6920Z',
  siret_etablissement TEXT
);

CREATE TABLE IF NOT EXISTS departements (
  id BIGSERIAL PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  region TEXT
);

CREATE TABLE IF NOT EXISTS secteurs (
  id BIGSERIAL PRIMARY KEY,
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
  id BIGSERIAL PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT DEFAULT '',
  order_index INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS professions (
  id BIGSERIAL PRIMARY KEY,
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
  weight DOUBLE PRECISION DEFAULT 1.0,
  PRIMARY KEY (source_slug, target_slug, edge_type)
);

-- ─── PAGE CONTENT TABLES (sections, SEO, meta) ───

CREATE TABLE IF NOT EXISTS page_sections (
  id BIGSERIAL PRIMARY KEY,
  route TEXT NOT NULL,
  slug TEXT NOT NULL,
  section_type TEXT NOT NULL,
  section_order INTEGER NOT NULL DEFAULT 0,
  title TEXT,
  body TEXT,
  items TEXT,
  citations TEXT,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  generated_by_model TEXT,
  UNIQUE(route, slug, section_order)
);
CREATE INDEX IF NOT EXISTS idx_page_sections_route_slug ON page_sections(route, slug);

CREATE TABLE IF NOT EXISTS seo_overrides (
  id BIGSERIAL PRIMARY KEY,
  route TEXT NOT NULL,
  slug TEXT NOT NULL,
  meta_title TEXT,
  meta_description TEXT,
  h1 TEXT,
  key_takeaways TEXT,
  json_ld_extra TEXT,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  generated_by_model TEXT,
  UNIQUE(route, slug)
);
CREATE INDEX IF NOT EXISTS idx_seo_overrides_route_slug ON seo_overrides(route, slug);

CREATE TABLE IF NOT EXISTS page_meta (
  id BIGSERIAL PRIMARY KEY,
  route TEXT NOT NULL,
  slug TEXT NOT NULL,
  author_persona_id TEXT NOT NULL DEFAULT 'helene-marchand',
  reviewed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  reviewed_by TEXT NOT NULL DEFAULT 'helene-marchand',
  content_hash TEXT,
  publish_status TEXT NOT NULL DEFAULT 'draft' CHECK(publish_status IN ('draft', 'review', 'published', 'archived')),
  published_at TIMESTAMPTZ,
  pipeline_run_id TEXT,
  UNIQUE(route, slug)
);
CREATE INDEX IF NOT EXISTS idx_page_meta_route_slug ON page_meta(route, slug);
CREATE INDEX IF NOT EXISTS idx_page_meta_publish_status ON page_meta(publish_status);

-- ─── PRICING TIERS (P4a) ───

CREATE TABLE IF NOT EXISTS pricing_tiers (
  id BIGSERIAL PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  from_price TEXT NOT NULL,
  price_value INTEGER NOT NULL,
  features TEXT NOT NULL,
  highlighted BOOLEAN NOT NULL DEFAULT FALSE,
  cta_label TEXT NOT NULL DEFAULT 'Choisir',
  order_index INTEGER NOT NULL DEFAULT 0,
  description TEXT,
  target_audience TEXT
);
CREATE INDEX IF NOT EXISTS idx_pricing_tiers_order ON pricing_tiers(order_index);

-- ─── DIRECTORY DATA INTEGRATION ───

CREATE TABLE IF NOT EXISTS source_registry (
  id BIGSERIAL PRIMARY KEY,
  source_key TEXT UNIQUE NOT NULL,
  source_name TEXT NOT NULL,
  source_url TEXT,
  source_type TEXT NOT NULL CHECK(source_type IN ('api','sftp','manual','authorized_export','claim')),
  license_label TEXT,
  legal_basis TEXT NOT NULL,
  allowed_fields TEXT NOT NULL DEFAULT '[]',
  refresh_frequency TEXT NOT NULL DEFAULT 'manual',
  requires_legal_review BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
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
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  population INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_cities_official_slug ON cities_official(slug);

CREATE TABLE IF NOT EXISTS directory_cabinets (
  id BIGSERIAL PRIMARY KEY,
  siren TEXT UNIQUE,
  legal_name TEXT NOT NULL,
  display_name TEXT,
  naf_code TEXT,
  legal_form TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  oec_status TEXT NOT NULL DEFAULT 'unverified' CHECK(oec_status IN ('unverified','verified','manual_verified','not_found','ambiguous','stale')),
  oec_profile_url TEXT,
  oec_verified_at TIMESTAMPTZ,
  confidence_score INTEGER NOT NULL DEFAULT 0,
  publish_status TEXT NOT NULL DEFAULT 'draft' CHECK(publish_status IN ('draft','review','published','archived','blocked')),
  source_summary TEXT NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_directory_cabinets_publish ON directory_cabinets(publish_status, confidence_score, oec_status);

CREATE TABLE IF NOT EXISTS directory_establishments (
  id BIGSERIAL PRIMARY KEY,
  cabinet_id BIGINT NOT NULL REFERENCES directory_cabinets(id) ON DELETE CASCADE,
  siret TEXT UNIQUE NOT NULL,
  is_headquarter BOOLEAN NOT NULL DEFAULT FALSE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  address_line1 TEXT,
  address_line2 TEXT,
  postal_code TEXT,
  city_name TEXT,
  city_code_insee TEXT REFERENCES cities_official(code_insee),
  department_code TEXT,
  region_code TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  geocode_score DOUBLE PRECISION,
  source_key TEXT REFERENCES source_registry(source_key),
  retrieved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_directory_establishments_city ON directory_establishments(city_code_insee, is_active);

CREATE TABLE IF NOT EXISTS directory_experts (
  id BIGSERIAL PRIMARY KEY,
  cabinet_id BIGINT NOT NULL REFERENCES directory_cabinets(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  oec_status TEXT NOT NULL DEFAULT 'verified' CHECK(oec_status IN ('verified','manual_verified','unverified','stale')),
  source_url TEXT,
  source_retrieved_at TIMESTAMPTZ,
  is_displayable BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_directory_experts_cabinet ON directory_experts(cabinet_id, is_displayable);

CREATE TABLE IF NOT EXISTS profile_claims (
  id BIGSERIAL PRIMARY KEY,
  cabinet_id BIGINT NOT NULL REFERENCES directory_cabinets(id) ON DELETE CASCADE,
  claimant_email_hash TEXT NOT NULL,
  claimed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  verified_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','verified','rejected','expired')),
  consent_version TEXT NOT NULL DEFAULT 'annuaire-rgpd-v1'
);

CREATE TABLE IF NOT EXISTS privacy_suppression_requests (
  id BIGSERIAL PRIMARY KEY,
  siren TEXT,
  siret TEXT,
  requester_hash TEXT NOT NULL,
  reason TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active','resolved','rejected')),
  received_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_privacy_suppression_siret ON privacy_suppression_requests(siret, status);

CREATE TABLE IF NOT EXISTS directory_source_events (
  id BIGSERIAL PRIMARY KEY,
  entity_type TEXT NOT NULL CHECK(entity_type IN ('cabinet','establishment','expert','city','claim','suppression')),
  entity_key TEXT NOT NULL,
  source_key TEXT NOT NULL REFERENCES source_registry(source_key),
  source_url TEXT,
  source_hash TEXT,
  retrieved_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  parsed_ok BOOLEAN NOT NULL DEFAULT TRUE,
  legal_basis TEXT NOT NULL,
  old_value TEXT,
  new_value TEXT,
  change_reason TEXT
);
CREATE INDEX IF NOT EXISTS idx_directory_source_events_entity ON directory_source_events(entity_type, entity_key);

-- ─── AFFILIATION / COMMERCIAL LAYER ───

CREATE TABLE IF NOT EXISTS affiliate_programs (
  id BIGSERIAL PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  category_slug TEXT NOT NULL,
  program_type TEXT NOT NULL,
  has_affiliate BOOLEAN NOT NULL DEFAULT FALSE,
  has_referral BOOLEAN NOT NULL DEFAULT FALSE,
  has_apporteur BOOLEAN NOT NULL DEFAULT FALSE,
  commission_display TEXT,
  recurrent BOOLEAN NOT NULL DEFAULT FALSE,
  recurrent_note TEXT,
  platform TEXT,
  target_audience TEXT,
  scale_public TEXT,
  source_url TEXT,
  affiliate_url TEXT,
  notes TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_affiliate_programs_category ON affiliate_programs(category_slug, is_active);

CREATE TABLE IF NOT EXISTS commercial_pages (
  slug TEXT PRIMARY KEY,
  route TEXT NOT NULL,
  url TEXT NOT NULL,
  archetype TEXT NOT NULL,
  silo_label TEXT,
  hub_slug TEXT,
  hub_label TEXT,
  cluster_slug TEXT,
  cluster_label TEXT,
  label TEXT NOT NULL,
  intent TEXT,
  funnel_stage TEXT,
  primary_program TEXT,
  secondary_programs TEXT,
  target_query TEXT,
  est_volume INTEGER NOT NULL DEFAULT 0,
  priority_ice DOUBLE PRECISION NOT NULL DEFAULT 0,
  publish_wave INTEGER NOT NULL DEFAULT 0,
  brief_json TEXT,
  publish_status TEXT NOT NULL DEFAULT 'draft' CHECK(publish_status IN ('draft','review','published','archived')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_commercial_pages_route ON commercial_pages(route, publish_status);
CREATE INDEX IF NOT EXISTS idx_commercial_pages_cluster ON commercial_pages(cluster_slug);

CREATE TABLE IF NOT EXISTS page_affiliate_programs (
  route TEXT NOT NULL,
  page_slug TEXT NOT NULL,
  program_slug TEXT NOT NULL,
  rank INTEGER NOT NULL DEFAULT 0,
  is_primary BOOLEAN NOT NULL DEFAULT FALSE,
  PRIMARY KEY (route, page_slug, program_slug)
);
CREATE INDEX IF NOT EXISTS idx_page_affiliate_page ON page_affiliate_programs(route, page_slug);

CREATE TABLE IF NOT EXISTS commercial_links (
  source_slug TEXT NOT NULL,
  source_route TEXT,
  target_slug TEXT NOT NULL,
  target_route TEXT,
  edge_type TEXT NOT NULL,
  weight DOUBLE PRECISION NOT NULL DEFAULT 1.0,
  PRIMARY KEY (source_slug, target_slug, edge_type)
);
CREATE INDEX IF NOT EXISTS idx_commercial_links_source ON commercial_links(source_slug);

-- ─── ROW LEVEL SECURITY ───
-- Enable RLS and grant public read access (anon + authenticated) via SELECT-only policies.
-- Writes are performed by the service_role key, which bypasses RLS.

ALTER TABLE services ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read_services" ON services FOR SELECT TO anon, authenticated USING (true);

ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read_team_members" ON team_members FOR SELECT TO anon, authenticated USING (true);

ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read_testimonials" ON testimonials FOR SELECT TO anon, authenticated USING (true);

ALTER TABLE pricing_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read_pricing_plans" ON pricing_plans FOR SELECT TO anon, authenticated USING (true);

ALTER TABLE faq_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read_faq_items" ON faq_items FOR SELECT TO anon, authenticated USING (true);

ALTER TABLE pages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read_pages" ON pages FOR SELECT TO anon, authenticated USING (true);

ALTER TABLE silos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read_silos" ON silos FOR SELECT TO anon, authenticated USING (true);

ALTER TABLE hubs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read_hubs" ON hubs FOR SELECT TO anon, authenticated USING (true);

ALTER TABLE clusters ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read_clusters" ON clusters FOR SELECT TO anon, authenticated USING (true);

ALTER TABLE keyword_pages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read_keyword_pages" ON keyword_pages FOR SELECT TO anon, authenticated USING (true);

ALTER TABLE villes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read_villes" ON villes FOR SELECT TO anon, authenticated USING (true);

ALTER TABLE departements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read_departements" ON departements FOR SELECT TO anon, authenticated USING (true);

ALTER TABLE secteurs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read_secteurs" ON secteurs FOR SELECT TO anon, authenticated USING (true);

ALTER TABLE service_secteur ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read_service_secteur" ON service_secteur FOR SELECT TO anon, authenticated USING (true);

ALTER TABLE service_ville ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read_service_ville" ON service_ville FOR SELECT TO anon, authenticated USING (true);

ALTER TABLE profession_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read_profession_categories" ON profession_categories FOR SELECT TO anon, authenticated USING (true);

ALTER TABLE professions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read_professions" ON professions FOR SELECT TO anon, authenticated USING (true);

ALTER TABLE service_profession ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read_service_profession" ON service_profession FOR SELECT TO anon, authenticated USING (true);

ALTER TABLE kg_edges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read_kg_edges" ON kg_edges FOR SELECT TO anon, authenticated USING (true);

ALTER TABLE page_sections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read_page_sections" ON page_sections FOR SELECT TO anon, authenticated USING (true);

ALTER TABLE seo_overrides ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read_seo_overrides" ON seo_overrides FOR SELECT TO anon, authenticated USING (true);

ALTER TABLE page_meta ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read_page_meta" ON page_meta FOR SELECT TO anon, authenticated USING (true);

ALTER TABLE pricing_tiers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read_pricing_tiers" ON pricing_tiers FOR SELECT TO anon, authenticated USING (true);

ALTER TABLE source_registry ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read_source_registry" ON source_registry FOR SELECT TO anon, authenticated USING (true);

ALTER TABLE cities_official ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read_cities_official" ON cities_official FOR SELECT TO anon, authenticated USING (true);

ALTER TABLE directory_cabinets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read_directory_cabinets" ON directory_cabinets FOR SELECT TO anon, authenticated USING (true);

ALTER TABLE directory_establishments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read_directory_establishments" ON directory_establishments FOR SELECT TO anon, authenticated USING (true);

ALTER TABLE directory_experts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read_directory_experts" ON directory_experts FOR SELECT TO anon, authenticated USING (true);

ALTER TABLE profile_claims ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read_profile_claims" ON profile_claims FOR SELECT TO anon, authenticated USING (true);

ALTER TABLE privacy_suppression_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read_privacy_suppression_requests" ON privacy_suppression_requests FOR SELECT TO anon, authenticated USING (true);

ALTER TABLE directory_source_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read_directory_source_events" ON directory_source_events FOR SELECT TO anon, authenticated USING (true);

ALTER TABLE affiliate_programs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read_affiliate_programs" ON affiliate_programs FOR SELECT TO anon, authenticated USING (true);

ALTER TABLE commercial_pages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read_commercial_pages" ON commercial_pages FOR SELECT TO anon, authenticated USING (true);

ALTER TABLE page_affiliate_programs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read_page_affiliate_programs" ON page_affiliate_programs FOR SELECT TO anon, authenticated USING (true);

ALTER TABLE commercial_links ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read_commercial_links" ON commercial_links FOR SELECT TO anon, authenticated USING (true);
