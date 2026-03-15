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
  population INTEGER DEFAULT 0
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
`;
