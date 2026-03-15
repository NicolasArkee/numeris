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
}
