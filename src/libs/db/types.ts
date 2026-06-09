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
  // TODO: replace SIREN root with real Numeris SIREN from Patch D once provisioned
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

// ─── Database adapter interface ───
export interface DbAdapter {
  // Home page
  getServices(): Service[];
  getTeamMembers(): TeamMember[];
  getTestimonials(): Testimonial[];
  getPricingPlans(): PricingPlan[];
  getFaqItems(): FaqItem[];
  getPageBySlug(slug: string): Page | undefined;
  getAllPages(): Page[];

  // Clustering / KG
  getSilos(): Silo[];
  getSiloBySlug(slug: string): Silo | undefined;
  getHubsBySilo(siloSlug: string): Hub[];
  getHubBySlug(slug: string): Hub | undefined;
  getClustersByHub(hubSlug: string): Cluster[];
  getClusterBySlug(slug: string): Cluster | undefined;
  getKeywordsByCluster(clusterSlug: string): KeywordPage[];
  getKeywordBySlug(slug: string): KeywordPage | undefined;
  getAllKeywords(): KeywordPage[];

  // Geo
  getVilles(): Ville[];
  getVilleBySlug(slug: string): Ville | undefined;
  getDepartements(): Departement[];
  getDepartementBySlug(slug: string): Departement | undefined;

  // Secteurs
  getSecteurs(): Secteur[];
  getSecteurBySlug(slug: string): Secteur | undefined;

  // Professions
  getProfessionCategories(): ProfessionCategory[];
  getProfessionCategoryBySlug(slug: string): ProfessionCategory | undefined;
  getProfessionsByCategory(categorySlug: string): Profession[];
  getProfessions(): Profession[];
  getProfessionBySlug(slug: string): Profession | undefined;

  // Cross-dimensions
  getServiceSecteurs(serviceSlug: string): { secteur_slug: string; volume: number }[];
  getServiceVilles(serviceSlug: string): { ville_slug: string; volume: number }[];
  getServiceProfessions(serviceSlug: string): { profession_slug: string; volume: number }[];

  // KG edges
  getEdgesFrom(slug: string): KgEdge[];
  getEdgesTo(slug: string): KgEdge[];

  // ─── Pricing tiers (P4a) ───
  getPricingTiers(): PricingTier[];

  // ─── Testimonials filtering (P4a) ───
  getTestimonialsByProfession(slug: string, limit?: number): Testimonial[];
  getTestimonialsBySecteur(slug: string, limit?: number): Testimonial[];
  getTestimonialsByVille(slug: string, limit?: number): Testimonial[];

  // ─── Page content (sections, SEO, meta) ───
  // READ
  getPageSections(route: string, slug: string): PageSection[];
  getSeoOverride(route: string, slug: string): SeoOverride | null;
  getPageMeta(route: string, slug: string): PageMeta | null;
  /** P4a — needed by sitemap.ts for real lastmod from page_meta.reviewed_at. */
  getAllPageMeta(): PageMeta[];

  // WRITE — used by pipeline import scripts + future admin API
  upsertPageSection(section: Omit<PageSection, "id" | "generated_at">): void;
  upsertSeoOverride(override: Omit<SeoOverride, "id" | "generated_at">): void;
  upsertPageMeta(meta: Omit<PageMeta, "id" | "reviewed_at">): void;
  /** Delete every row for (route, slug) — used when regenerating a page in full. */
  deletePageSections(route: string, slug: string): void;
}
