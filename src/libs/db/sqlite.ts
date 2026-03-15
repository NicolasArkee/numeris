import Database from "better-sqlite3";
import path from "node:path";
import { SCHEMA } from "./schema";
import type {
  Cluster,
  DbAdapter,
  Departement,
  FaqItem,
  Hub,
  KeywordPage,
  KgEdge,
  Page,
  PricingPlan,
  Profession,
  ProfessionCategory,
  Secteur,
  Service,
  Silo,
  TeamMember,
  Testimonial,
  Ville,
} from "./types";

const DB_PATH = path.join(process.cwd(), "numeris.db");

let _db: Database.Database | null = null;

function getDb(): Database.Database {
  if (!_db) {
    _db = new Database(DB_PATH);
    _db.pragma("journal_mode = WAL");
    _db.exec(SCHEMA);
  }
  return _db;
}

export const sqliteAdapter: DbAdapter = {
  getServices(): Service[] {
    return getDb()
      .prepare("SELECT * FROM services ORDER BY order_index")
      .all() as Service[];
  },

  getTeamMembers(): TeamMember[] {
    return getDb()
      .prepare("SELECT * FROM team_members ORDER BY order_index")
      .all() as TeamMember[];
  },

  getTestimonials(): Testimonial[] {
    return getDb()
      .prepare("SELECT * FROM testimonials ORDER BY id")
      .all() as Testimonial[];
  },

  getPricingPlans(): PricingPlan[] {
    return getDb()
      .prepare("SELECT * FROM pricing_plans ORDER BY order_index")
      .all() as PricingPlan[];
  },

  getFaqItems(): FaqItem[] {
    return getDb()
      .prepare("SELECT * FROM faq_items ORDER BY order_index")
      .all() as FaqItem[];
  },

  getPageBySlug(slug: string): Page | undefined {
    return getDb()
      .prepare("SELECT * FROM pages WHERE slug = ?")
      .get(slug) as Page | undefined;
  },

  getAllPages(): Page[] {
    return getDb().prepare("SELECT * FROM pages").all() as Page[];
  },

  // ─── Clustering / KG ───

  getSilos(): Silo[] {
    return getDb().prepare("SELECT * FROM silos ORDER BY volume DESC").all() as Silo[];
  },
  getSiloBySlug(slug: string): Silo | undefined {
    return getDb().prepare("SELECT * FROM silos WHERE slug = ?").get(slug) as Silo | undefined;
  },
  getHubsBySilo(siloSlug: string): Hub[] {
    return getDb().prepare("SELECT * FROM hubs WHERE silo_slug = ? ORDER BY volume DESC").all(siloSlug) as Hub[];
  },
  getHubBySlug(slug: string): Hub | undefined {
    return getDb().prepare("SELECT * FROM hubs WHERE slug = ?").get(slug) as Hub | undefined;
  },
  getClustersByHub(hubSlug: string): Cluster[] {
    return getDb().prepare("SELECT * FROM clusters WHERE hub_slug = ? ORDER BY volume DESC").all(hubSlug) as Cluster[];
  },
  getClusterBySlug(slug: string): Cluster | undefined {
    return getDb().prepare("SELECT * FROM clusters WHERE slug = ?").get(slug) as Cluster | undefined;
  },
  getKeywordsByCluster(clusterSlug: string): KeywordPage[] {
    return getDb().prepare("SELECT * FROM keyword_pages WHERE cluster_slug = ? ORDER BY volume DESC").all(clusterSlug) as KeywordPage[];
  },
  getKeywordBySlug(slug: string): KeywordPage | undefined {
    return getDb().prepare("SELECT * FROM keyword_pages WHERE slug = ?").get(slug) as KeywordPage | undefined;
  },

  // ─── Geo ───

  getVilles(): Ville[] {
    return getDb().prepare("SELECT * FROM villes ORDER BY population DESC").all() as Ville[];
  },
  getVilleBySlug(slug: string): Ville | undefined {
    return getDb().prepare("SELECT * FROM villes WHERE slug = ?").get(slug) as Ville | undefined;
  },
  getDepartements(): Departement[] {
    return getDb().prepare("SELECT * FROM departements ORDER BY code").all() as Departement[];
  },
  getDepartementBySlug(slug: string): Departement | undefined {
    return getDb().prepare("SELECT * FROM departements WHERE slug = ?").get(slug) as Departement | undefined;
  },

  // ─── Secteurs ───

  getSecteurs(): Secteur[] {
    return getDb().prepare("SELECT * FROM secteurs ORDER BY volume DESC").all() as Secteur[];
  },
  getSecteurBySlug(slug: string): Secteur | undefined {
    return getDb().prepare("SELECT * FROM secteurs WHERE slug = ?").get(slug) as Secteur | undefined;
  },

  // ─── Cross-dimensions ───

  getServiceSecteurs(serviceSlug: string) {
    return getDb()
      .prepare("SELECT secteur_slug, volume FROM service_secteur WHERE service_slug = ? ORDER BY volume DESC")
      .all(serviceSlug) as { secteur_slug: string; volume: number }[];
  },
  getServiceVilles(serviceSlug: string) {
    return getDb()
      .prepare("SELECT ville_slug, volume FROM service_ville WHERE service_slug = ? ORDER BY volume DESC")
      .all(serviceSlug) as { ville_slug: string; volume: number }[];
  },
  getServiceProfessions(serviceSlug: string) {
    return getDb()
      .prepare("SELECT profession_slug, volume FROM service_profession WHERE service_slug = ? ORDER BY volume DESC")
      .all(serviceSlug) as { profession_slug: string; volume: number }[];
  },

  // ─── Professions ───

  getProfessionCategories(): ProfessionCategory[] {
    return getDb().prepare("SELECT * FROM profession_categories ORDER BY order_index").all() as ProfessionCategory[];
  },
  getProfessionCategoryBySlug(slug: string): ProfessionCategory | undefined {
    return getDb().prepare("SELECT * FROM profession_categories WHERE slug = ?").get(slug) as ProfessionCategory | undefined;
  },
  getProfessionsByCategory(categorySlug: string): Profession[] {
    return getDb().prepare("SELECT * FROM professions WHERE category_slug = ? ORDER BY name").all(categorySlug) as Profession[];
  },
  getProfessions(): Profession[] {
    return getDb().prepare("SELECT * FROM professions ORDER BY name").all() as Profession[];
  },
  getProfessionBySlug(slug: string): Profession | undefined {
    return getDb().prepare("SELECT * FROM professions WHERE slug = ?").get(slug) as Profession | undefined;
  },

  // ─── KG Edges ───

  getEdgesFrom(slug: string): KgEdge[] {
    return getDb()
      .prepare("SELECT * FROM kg_edges WHERE source_slug = ? ORDER BY weight DESC")
      .all(slug) as KgEdge[];
  },
  getEdgesTo(slug: string): KgEdge[] {
    return getDb()
      .prepare("SELECT * FROM kg_edges WHERE target_slug = ? ORDER BY weight DESC")
      .all(slug) as KgEdge[];
  },
};
