// ─── Shared types for both SQLite and Supabase ───

export interface Service {
  id: number;
  slug: string;
  title: string;
  description: string;
  icon: string;
  order_index: number;
}

export interface TeamMember {
  id: number;
  slug: string;
  name: string;
  role: string;
  initials: string;
  description: string;
  specialties: string; // JSON array as string
  badge: string | null;
  order_index: number;
}

export interface Testimonial {
  id: number;
  author_name: string;
  author_initials: string;
  author_role: string;
  body: string;
  stars: number;
  featured: boolean;
  // ─── P4a extension — profession/secteur/ville filtering for TestimonialSlider ───
  profession_slug: string | null;
  secteur_slug: string | null;
  ville_slug: string | null;
  /** Internal audit flag — fictional but consistent testimonial, never exposed in UI. */
  _fictional: number;
}

/**
 * P4a — Pricing tiers backing the V2 PricingTeaser component (3 tiers €59/€99/€159).
 * Distinct from legacy `PricingPlan` (Home pricing block).
 * `features` is a JSON-encoded string[] — callers must JSON.parse.
 */
export interface PricingTier {
  id: number;
  slug: string;
  name: string;
  from_price: string;
  price_value: number;
  features: string;  // JSON.parse → string[]
  highlighted: number;
  cta_label: string;
  order_index: number;
  description: string | null;
  target_audience: string | null;
}

export interface PricingPlan {
  id: number;
  slug: string;
  tag: string;
  name: string;
  description: string;
  price: string;
  period: string;
  features: string; // JSON array as string
  featured: boolean;
  cta_label: string;
  note: string | null;
  order_index: number;
}

export interface FaqItem {
  id: number;
  question: string;
  answer: string;
  order_index: number;
}

export interface Page {
  id: number;
  slug: string;
  title: string;
  meta_title: string;
  meta_description: string;
  h1: string;
  content: string | null;
}

// ─── Clustering / KG types ───

export interface Silo {
  id: number;
  slug: string;
  label: string;
  volume: number;
  n_keywords: number;
}

export interface Hub {
  id: number;
  slug: string;
  silo_slug: string;
  label: string;
  volume: number;
  n_keywords: number;
}

export interface Cluster {
  id: number;
  slug: string;
  hub_slug: string;
  label: string;
  volume: number;
  n_keywords: number;
}

export interface KeywordPage {
  id: number;
  slug: string;
  cluster_slug: string;
  label: string;
  volume: number;
  intent: string | null;
  kd: number | null;
  cpc: number | null;
  serp_features: string | null;
  meta_title: string | null;
  meta_description: string | null;
  h1: string | null;
  /** Triage remédiation LP (scripts/triage-keyword-pages.ts) :
   *  enrich | redirect | noindex | hidden. Null = non triée (traiter comme enrich). */
  disposition?: string | null;
  /** Cible du 301 quand disposition='redirect' (chemin relatif). */
  redirect_to?: string | null;
}

export interface Ville {
  id: number;
  slug: string;
  name: string;
  departement: string | null;
  region: string | null;
  population: number;
  address: string | null;
  postal_code: string | null;
  phone: string | null;
  opening_hours: string | null;
  latitude: number | null;
  longitude: number | null;
  ape_code: string | null;
  // SIRET = SIREN (9 digits) + NIC (5 digits). SIREN root is a placeholder until Patch D.
  // TODO: replace SIREN root with real Skoria SIREN from Patch D once provisioned
  siret_etablissement: string | null;
}

export interface Departement {
  id: number;
  slug: string;
  code: string;
  name: string;
  region: string | null;
}

export interface Secteur {
  id: number;
  slug: string;
  name: string;
  description: string | null;
  volume: number;
}

export interface ProfessionCategory {
  id: number;
  slug: string;
  name: string;
  description: string | null;
  icon: string;
  order_index: number;
}

export interface Profession {
  id: number;
  slug: string;
  name: string;
  category_slug: string;
  description: string | null;
  obligations: string | null;
  volume: number;
}

export interface KgEdge {
  source_slug: string;
  target_slug: string;
  edge_type: "hierarchical" | "sibling" | "service_funnel" | "cross_silo";
  weight: number;
}

export interface LinkGroup {
  title: string;
  links: { label: string; href: string }[];
}

// ─── Page content types (sections, SEO, meta) ───
// Populated by numeris_pipeline, consumed by route templates at build time.
// JSON-as-string columns must be JSON.parse'd by callers (same pattern as TeamMember.specialties).

export interface PageSection {
  id: number;
  route: string;
  slug: string;
  section_type: string;
  section_order: number;
  title: string | null;
  body: string | null;
  /** JSON-encoded array — shape depends on section_type (string[] | {q,a}[] | {label,value}[] | ...). */
  items: string | null;
  /** JSON-encoded array of {text, url, source}. */
  citations: string | null;
  generated_at: string;
  generated_by_model: string | null;
}

export interface SeoOverride {
  id: number;
  route: string;
  slug: string;
  meta_title: string | null;
  meta_description: string | null;
  h1: string | null;
  /** JSON-encoded string[] of bullet takeaways. */
  key_takeaways: string | null;
  /** JSON-encoded object — extra @graph entries (Article, ProfessionalService, ...). */
  json_ld_extra: string | null;
  generated_at: string;
  generated_by_model: string | null;
}

export type PublishStatus = "draft" | "review" | "published" | "archived";

export interface PageMeta {
  id: number;
  route: string;
  slug: string;
  author_persona_id: string;
  reviewed_at: string;
  reviewed_by: string;
  content_hash: string | null;
  publish_status: PublishStatus;
  published_at: string | null;
  pipeline_run_id: string | null;
}

// ─── Internal maillage (contextual links injected by maillage-v3) ───
// Universal link table: rendered as a "Liens utiles" block on ANY page (taxonomy
// or DB-rendered) keyed by the page's canonical URL, without touching its sections.

export interface MaillageLink {
  id: number;
  source_route: string | null;
  source_slug: string | null;
  source_url: string;
  /** Normalized path (no host, no trailing slash) — runtime exact-match key. */
  source_path: string | null;
  target_url: string;
  anchor: string;
  family: string | null;
  priority: number | null;
  wave: string | null;
  created_at: string | null;
}

// ─── Directory data integration types ───

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
  | "profile_summary"
  | "source_preview_image"
  | "registry_status";

export interface DirectoryCabinet {
  id: number;
  siren: string | null;
  legal_name: string;
  display_name: string | null;
  naf_code: string | null;
  legal_form: string | null;
  is_active: number;
  oec_status:
    | "unverified"
    | "verified"
    | "manual_verified"
    | "not_found"
    | "ambiguous"
    | "stale";
  oec_profile_url: string | null;
  oec_verified_at: string | null;
  confidence_score: number;
  publish_status: "draft" | "review" | "published" | "archived" | "blocked";
  source_summary: string;
  created_at: string;
  updated_at: string;
}

export interface DirectoryEstablishment {
  id: number;
  cabinet_id: number;
  siret: string;
  is_headquarter: number;
  is_active: number;
  address_line1: string | null;
  address_line2: string | null;
  postal_code: string | null;
  city_name: string | null;
  city_code_insee: string | null;
  department_code: string | null;
  region_code: string | null;
  latitude: number | null;
  longitude: number | null;
  geocode_score: number | null;
  source_key: string | null;
  retrieved_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface DirectoryCity {
  code_insee: string;
  name: string;
  slug: string;
  postal_codes: string;
  department_code: string | null;
  department_name: string | null;
  region_code: string | null;
  region_name: string | null;
  latitude: number | null;
  longitude: number | null;
  population: number;
  updated_at: string;
}

export interface DirectoryCabinetCard {
  cabinet: DirectoryCabinet;
  establishment: DirectoryEstablishment;
  city: DirectoryCity | null;
  sourcePreviewImageUrl?: string | null;
}

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
  metadata_json?: string | null;
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

// ─── Database adapter interface ───
export interface DbAdapter {
  // Home page
  getServices(): Promise<Service[]>;
  getTeamMembers(): Promise<TeamMember[]>;
  getTestimonials(): Promise<Testimonial[]>;
  getPricingPlans(): Promise<PricingPlan[]>;
  getFaqItems(): Promise<FaqItem[]>;
  getPageBySlug(slug: string): Promise<Page | undefined>;
  getAllPages(): Promise<Page[]>;

  // Clustering / KG
  getSilos(): Promise<Silo[]>;
  getSiloBySlug(slug: string): Promise<Silo | undefined>;
  getHubsBySilo(siloSlug: string): Promise<Hub[]>;
  getHubBySlug(slug: string): Promise<Hub | undefined>;
  getClustersByHub(hubSlug: string): Promise<Cluster[]>;
  getClusterBySlug(slug: string): Promise<Cluster | undefined>;
  getKeywordsByCluster(clusterSlug: string): Promise<KeywordPage[]>;
  getKeywordBySlug(slug: string): Promise<KeywordPage | undefined>;
  getAllKeywords(): Promise<KeywordPage[]>;

  // Geo
  getVilles(): Promise<Ville[]>;
  getVilleBySlug(slug: string): Promise<Ville | undefined>;
  getDepartements(): Promise<Departement[]>;
  getDepartementBySlug(slug: string): Promise<Departement | undefined>;

  // Secteurs
  getSecteurs(): Promise<Secteur[]>;
  getSecteurBySlug(slug: string): Promise<Secteur | undefined>;

  // Professions
  getProfessionCategories(): Promise<ProfessionCategory[]>;
  getProfessionCategoryBySlug(slug: string): Promise<ProfessionCategory | undefined>;
  getProfessionsByCategory(categorySlug: string): Promise<Profession[]>;
  getProfessions(): Promise<Profession[]>;
  getProfessionBySlug(slug: string): Promise<Profession | undefined>;

  // Cross-dimensions
  getServiceSecteurs(serviceSlug: string): Promise<{ secteur_slug: string; volume: number }[]>;
  getServiceVilles(serviceSlug: string): Promise<{ ville_slug: string; volume: number }[]>;
  getServiceProfessions(serviceSlug: string): Promise<{ profession_slug: string; volume: number }[]>;

  // KG edges
  getEdgesFrom(slug: string): Promise<KgEdge[]>;
  getEdgesTo(slug: string): Promise<KgEdge[]>;

  // ─── Pricing tiers (P4a) ───
  getPricingTiers(): Promise<PricingTier[]>;

  // ─── Testimonials filtering (P4a) ───
  getTestimonialsByProfession(slug: string, limit?: number): Promise<Testimonial[]>;
  getTestimonialsBySecteur(slug: string, limit?: number): Promise<Testimonial[]>;
  getTestimonialsByVille(slug: string, limit?: number): Promise<Testimonial[]>;

  // ─── Page content (sections, SEO, meta) ───
  // READ
  getPageSections(route: string, slug: string): Promise<PageSection[]>;
  /** Public read: returns null unless the matching page_meta row is published. */
  getSeoOverride(route: string, slug: string): Promise<SeoOverride | null>;
  getPageMeta(route: string, slug: string): Promise<PageMeta | null>;
  /** P4a — needed by sitemap.ts for real lastmod from page_meta.reviewed_at. */
  getAllPageMeta(): Promise<PageMeta[]>;

  // WRITE — used by pipeline import scripts + future admin API
  upsertPageSection(section: Omit<PageSection, "id" | "generated_at">): Promise<void>;
  upsertSeoOverride(override: Omit<SeoOverride, "id" | "generated_at">): Promise<void>;
  upsertPageMeta(meta: Omit<PageMeta, "id" | "reviewed_at">): Promise<void>;
  /** Delete every row for (route, slug) — used when regenerating a page in full. */
  deletePageSections(route: string, slug: string): Promise<void>;

  // ─── Internal maillage ───
  /** Contextual links to render on the page whose canonical URL == sourceUrl. Returns [] if the table is absent. */
  getMaillageLinks(sourceUrl: string, limit?: number): Promise<MaillageLink[]>;

  // ─── Directory public reads ───
  getDirectoryCities(): Promise<DirectoryCity[]>;
  getDirectoryCityBySlug(slug: string): Promise<DirectoryCity | null>;
  getDirectoryCabinetsByCity(codeInsee: string, limit?: number): Promise<DirectoryCabinetCard[]>;
  getDirectoryCabinetBySiret(siret: string): Promise<DirectoryCabinetCard | null>;
  getDirectoryCabinetCountByCity(codeInsee: string): Promise<number>;
  getPublishedDirectoryCabinetCount(): Promise<number>;
  getDirectoryListingCities(): Promise<DirectoryCity[]>;
  getDirectoryListingCabinetsByCity(codeInsee: string, limit?: number): Promise<DirectoryCabinetCard[]>;
  getDirectoryListingCabinetBySiret(siret: string): Promise<DirectoryCabinetCard | null>;
  getDirectoryListingCabinetCountByCity(codeInsee: string): Promise<number>;
  getDirectoryListingCabinetCount(): Promise<number>;
  /** Top published cabinets nationally, ordered by confidence_score DESC. Powers the homepage Hero TOP X. */
  getTopDirectoryListingCabinets(limit?: number): Promise<DirectoryCabinetCard[]>;
  getDirectoryRelatedListingCabinetsByCity(codeInsee: string, excludeSiret: string, limit?: number): Promise<DirectoryCabinetCard[]>;
  getDirectoryProfileFactsByEstablishment(establishmentId: number): Promise<DirectoryProfileFact[]>;
  getDirectoryEnrichmentSourcesByEstablishment(establishmentId: number): Promise<DirectoryEnrichmentSource[]>;
  getLatestDirectoryQualificationSnapshot(
    cabinetId: number,
    establishmentId: number,
  ): Promise<DirectoryQualificationSnapshot | null>;
  getDirectoryCityEnrichmentStats(codeInsee: string): Promise<DirectoryCityEnrichmentStats>;
  getDirectoryLatestEnrichmentDateByEstablishment(establishmentId: number): Promise<string | null>;
  getDirectoryProfileServices(): Promise<Service[]>;
  getDirectoryProfileProfessions(limit?: number): Promise<Profession[]>;
}
