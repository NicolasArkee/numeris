import Database from "better-sqlite3";
import path from "node:path";
import { SCHEMA } from "./schema";
import type {
  Cluster,
  DbAdapter,
  DirectoryCabinetCard,
  DirectoryCity,
  DirectoryCityEnrichmentStats,
  DirectoryEnrichmentSource,
  DirectoryProfileFact,
  DirectoryQualificationSnapshot,
  Departement,
  FaqItem,
  Hub,
  KeywordPage,
  KgEdge,
  MaillageLink,
  Page,
  PageMeta,
  PageSection,
  PricingPlan,
  PricingTier,
  Profession,
  ProfessionCategory,
  Secteur,
  SeoOverride,
  Service,
  Silo,
  TeamMember,
  Testimonial,
  Ville,
} from "./types";

let _db: Database.Database | null = null;
let _dbPath: string | null = null;

function getDbPath(): string {
  return process.env.NUMERIS_DB ?? path.join(process.cwd(), "numeris.db");
}

function getDb(): Database.Database {
  const dbPath = getDbPath();
  if (!_db || _dbPath !== dbPath) {
    _db?.close();
    _db = new Database(dbPath);
    _dbPath = dbPath;
    _db.pragma("journal_mode = WAL");
    _db.exec(SCHEMA);
  }
  return _db;
}

function normalizeResourceText(value: string | null | undefined): string {
  return (value ?? "")
    .normalize("NFD")
    .replaceAll(/\p{Diacritic}/gu, "")
    .toLowerCase();
}

function isInstitutionalResource(...values: Array<string | null | undefined>): boolean {
  const text = values.map(normalizeResourceText).join(" ");
  return text.includes("ordre") || /\boec\b/u.test(text);
}

function isHiddenSilo(silo: Silo): boolean {
  return isInstitutionalResource(silo.slug, silo.label);
}

function isHiddenHub(hub: Hub): boolean {
  if (isInstitutionalResource(hub.slug, hub.silo_slug, hub.label)) {
    return true;
  }
  const silo = getDb()
    .prepare("SELECT * FROM silos WHERE slug = ?")
    .get(hub.silo_slug) as Silo | undefined;
  return silo ? isHiddenSilo(silo) : false;
}

function isHiddenCluster(cluster: Cluster): boolean {
  if (isInstitutionalResource(cluster.slug, cluster.hub_slug, cluster.label)) {
    return true;
  }
  const hub = getDb()
    .prepare("SELECT * FROM hubs WHERE slug = ?")
    .get(cluster.hub_slug) as Hub | undefined;
  return hub ? isHiddenHub(hub) : false;
}

function isHiddenKeyword(keyword: KeywordPage): boolean {
  if (isInstitutionalResource(keyword.slug, keyword.cluster_slug, keyword.label)) {
    return true;
  }
  const cluster = getDb()
    .prepare("SELECT * FROM clusters WHERE slug = ?")
    .get(keyword.cluster_slug) as Cluster | undefined;
  return cluster ? isHiddenCluster(cluster) : false;
}

type DirectoryJoinRow = {
  cabinet_id: number;
  siren: string | null;
  legal_name: string;
  display_name: string | null;
  naf_code: string | null;
  legal_form: string | null;
  cabinet_is_active: number;
  oec_status: DirectoryCabinetCard["cabinet"]["oec_status"];
  oec_profile_url: string | null;
  oec_verified_at: string | null;
  confidence_score: number;
  publish_status: DirectoryCabinetCard["cabinet"]["publish_status"];
  source_summary: string;
  cabinet_created_at: string;
  cabinet_updated_at: string;
  establishment_id: number;
  siret: string;
  is_headquarter: number;
  establishment_is_active: number;
  address_line1: string | null;
  address_line2: string | null;
  postal_code: string | null;
  city_name: string | null;
  city_code_insee: string | null;
  department_code: string | null;
  region_code: string | null;
  establishment_latitude: number | null;
  establishment_longitude: number | null;
  geocode_score: number | null;
  source_key: string | null;
  retrieved_at: string | null;
  establishment_created_at: string;
  establishment_updated_at: string;
  official_code_insee: string | null;
  official_name: string | null;
  official_slug: string | null;
  official_postal_codes: string | null;
  official_department_code: string | null;
  official_department_name: string | null;
  official_region_code: string | null;
  official_region_name: string | null;
  official_latitude: number | null;
  official_longitude: number | null;
  official_population: number;
  official_updated_at: string | null;
};

const DIRECTORY_ACTIVE_WHERE = `
  e.is_active = 1
  AND d.is_active = 1
  AND NOT EXISTS (
    SELECT 1
    FROM privacy_suppression_requests psr
    WHERE psr.status = 'active'
      AND (
        (psr.siret IS NOT NULL AND psr.siret = e.siret)
        OR (psr.siren IS NOT NULL AND psr.siren = d.siren)
      )
  )
`;

const DIRECTORY_PUBLIC_WHERE = `
  ${DIRECTORY_ACTIVE_WHERE}
  AND d.publish_status = 'published'
  AND d.confidence_score >= 85
  AND d.oec_status IN ('verified','manual_verified')
`;

const DIRECTORY_LISTING_WHERE = `
  ${DIRECTORY_ACTIVE_WHERE}
  AND (
    (
      d.publish_status = 'published'
      AND d.confidence_score >= 85
      AND d.oec_status IN ('verified','manual_verified')
    )
    OR (
      d.publish_status = 'review'
      AND d.confidence_score >= 50
      AND d.oec_status IN ('unverified','not_found','ambiguous')
    )
  )
`;

const DIRECTORY_PROFILE_SERVICE_ORDER = [
  "comptabilite",
  "fiscalite",
  "social",
  "creation-entreprise",
  "conseil-gestion",
  "audit",
];

function mapDirectoryRow(row: DirectoryJoinRow): DirectoryCabinetCard {
  return {
    cabinet: {
      id: row.cabinet_id,
      siren: row.siren,
      legal_name: row.legal_name,
      display_name: row.display_name,
      naf_code: row.naf_code,
      legal_form: row.legal_form,
      is_active: row.cabinet_is_active,
      oec_status: row.oec_status,
      oec_profile_url: row.oec_profile_url,
      oec_verified_at: row.oec_verified_at,
      confidence_score: row.confidence_score,
      publish_status: row.publish_status,
      source_summary: row.source_summary,
      created_at: row.cabinet_created_at,
      updated_at: row.cabinet_updated_at,
    },
    establishment: {
      id: row.establishment_id,
      cabinet_id: row.cabinet_id,
      siret: row.siret,
      is_headquarter: row.is_headquarter,
      is_active: row.establishment_is_active,
      address_line1: row.address_line1,
      address_line2: row.address_line2,
      postal_code: row.postal_code,
      city_name: row.city_name,
      city_code_insee: row.city_code_insee,
      department_code: row.department_code,
      region_code: row.region_code,
      latitude: row.establishment_latitude,
      longitude: row.establishment_longitude,
      geocode_score: row.geocode_score,
      source_key: row.source_key,
      retrieved_at: row.retrieved_at,
      created_at: row.establishment_created_at,
      updated_at: row.establishment_updated_at,
    },
    city: row.official_code_insee
      ? {
          code_insee: row.official_code_insee,
          name: row.official_name ?? "",
          slug: row.official_slug ?? "",
          postal_codes: row.official_postal_codes ?? "[]",
          department_code: row.official_department_code,
          department_name: row.official_department_name,
          region_code: row.official_region_code,
          region_name: row.official_region_name,
          latitude: row.official_latitude,
          longitude: row.official_longitude,
          population: row.official_population,
          updated_at: row.official_updated_at ?? "",
        }
      : null,
  };
}

const DIRECTORY_SELECT = `
  SELECT
    d.id AS cabinet_id,
    d.siren,
    d.legal_name,
    d.display_name,
    d.naf_code,
    d.legal_form,
    d.is_active AS cabinet_is_active,
    d.oec_status,
    d.oec_profile_url,
    d.oec_verified_at,
    d.confidence_score,
    d.publish_status,
    d.source_summary,
    d.created_at AS cabinet_created_at,
    d.updated_at AS cabinet_updated_at,
    e.id AS establishment_id,
    e.siret,
    e.is_headquarter,
    e.is_active AS establishment_is_active,
    e.address_line1,
    e.address_line2,
    e.postal_code,
    e.city_name,
    e.city_code_insee,
    e.department_code,
    e.region_code,
    e.latitude AS establishment_latitude,
    e.longitude AS establishment_longitude,
    e.geocode_score,
    e.source_key,
    e.retrieved_at,
    e.created_at AS establishment_created_at,
    e.updated_at AS establishment_updated_at,
    c.code_insee AS official_code_insee,
    c.name AS official_name,
    c.slug AS official_slug,
    c.postal_codes AS official_postal_codes,
    c.department_code AS official_department_code,
    c.department_name AS official_department_name,
    c.region_code AS official_region_code,
    c.region_name AS official_region_name,
    c.latitude AS official_latitude,
    c.longitude AS official_longitude,
    c.population AS official_population,
    c.updated_at AS official_updated_at
  FROM directory_cabinets d
  JOIN directory_establishments e ON e.cabinet_id = d.id
  LEFT JOIN cities_official c ON c.code_insee = e.city_code_insee
`;

export const sqliteAdapter: DbAdapter = {
  async getServices(): Promise<Service[]> {
    return getDb()
      .prepare("SELECT * FROM services ORDER BY order_index")
      .all() as Service[];
  },

  async getTeamMembers(): Promise<TeamMember[]> {
    return getDb()
      .prepare("SELECT * FROM team_members ORDER BY order_index")
      .all() as TeamMember[];
  },

  async getTestimonials(): Promise<Testimonial[]> {
    return getDb()
      .prepare("SELECT * FROM testimonials ORDER BY id")
      .all() as Testimonial[];
  },

  async getPricingPlans(): Promise<PricingPlan[]> {
    return getDb()
      .prepare("SELECT * FROM pricing_plans ORDER BY order_index")
      .all() as PricingPlan[];
  },

  async getFaqItems(): Promise<FaqItem[]> {
    return getDb()
      .prepare("SELECT * FROM faq_items ORDER BY order_index")
      .all() as FaqItem[];
  },

  async getPageBySlug(slug: string): Promise<Page | undefined> {
    return getDb()
      .prepare("SELECT * FROM pages WHERE slug = ?")
      .get(slug) as Page | undefined;
  },

  async getAllPages(): Promise<Page[]> {
    return getDb().prepare("SELECT * FROM pages").all() as Page[];
  },

  // ─── Clustering / KG ───

  async getSilos(): Promise<Silo[]> {
    return (getDb().prepare("SELECT * FROM silos ORDER BY volume DESC").all() as Silo[])
      .filter((silo) => !isHiddenSilo(silo));
  },
  async getSiloBySlug(slug: string): Promise<Silo | undefined> {
    const silo = getDb().prepare("SELECT * FROM silos WHERE slug = ?").get(slug) as Silo | undefined;
    return silo && !isHiddenSilo(silo) ? silo : undefined;
  },
  async getHubsBySilo(siloSlug: string): Promise<Hub[]> {
    if (isInstitutionalResource(siloSlug)) return [];
    return (getDb().prepare("SELECT * FROM hubs WHERE silo_slug = ? ORDER BY volume DESC").all(siloSlug) as Hub[])
      .filter((hub) => !isHiddenHub(hub));
  },
  async getHubBySlug(slug: string): Promise<Hub | undefined> {
    const hub = getDb().prepare("SELECT * FROM hubs WHERE slug = ?").get(slug) as Hub | undefined;
    return hub && !isHiddenHub(hub) ? hub : undefined;
  },
  async getClustersByHub(hubSlug: string): Promise<Cluster[]> {
    const hub = getDb().prepare("SELECT * FROM hubs WHERE slug = ?").get(hubSlug) as Hub | undefined;
    if (!hub || isHiddenHub(hub)) return [];
    return (getDb().prepare("SELECT * FROM clusters WHERE hub_slug = ? ORDER BY volume DESC").all(hubSlug) as Cluster[])
      .filter((cluster) => !isHiddenCluster(cluster));
  },
  async getClusterBySlug(slug: string): Promise<Cluster | undefined> {
    const cluster = getDb().prepare("SELECT * FROM clusters WHERE slug = ?").get(slug) as Cluster | undefined;
    return cluster && !isHiddenCluster(cluster) ? cluster : undefined;
  },
  async getKeywordsByCluster(clusterSlug: string): Promise<KeywordPage[]> {
    const cluster = getDb().prepare("SELECT * FROM clusters WHERE slug = ?").get(clusterSlug) as Cluster | undefined;
    if (!cluster || isHiddenCluster(cluster)) return [];
    return (getDb().prepare("SELECT * FROM keyword_pages WHERE cluster_slug = ? ORDER BY volume DESC").all(clusterSlug) as KeywordPage[])
      .filter((keyword) => !isHiddenKeyword(keyword));
  },
  async getKeywordBySlug(slug: string): Promise<KeywordPage | undefined> {
    const keyword = getDb().prepare("SELECT * FROM keyword_pages WHERE slug = ?").get(slug) as KeywordPage | undefined;
    return keyword && !isHiddenKeyword(keyword) ? keyword : undefined;
  },
  async getAllKeywords(): Promise<KeywordPage[]> {
    return (getDb().prepare("SELECT * FROM keyword_pages ORDER BY volume DESC").all() as KeywordPage[])
      .filter((keyword) => !isHiddenKeyword(keyword));
  },

  // ─── Geo ───

  async getVilles(): Promise<Ville[]> {
    return getDb().prepare("SELECT * FROM villes ORDER BY population DESC").all() as Ville[];
  },
  async getVilleBySlug(slug: string): Promise<Ville | undefined> {
    return getDb().prepare("SELECT * FROM villes WHERE slug = ?").get(slug) as Ville | undefined;
  },
  async getDepartements(): Promise<Departement[]> {
    return getDb().prepare("SELECT * FROM departements ORDER BY code").all() as Departement[];
  },
  async getDepartementBySlug(slug: string): Promise<Departement | undefined> {
    return getDb().prepare("SELECT * FROM departements WHERE slug = ?").get(slug) as Departement | undefined;
  },

  // ─── Secteurs ───

  async getSecteurs(): Promise<Secteur[]> {
    return getDb().prepare("SELECT * FROM secteurs ORDER BY volume DESC").all() as Secteur[];
  },
  async getSecteurBySlug(slug: string): Promise<Secteur | undefined> {
    return getDb().prepare("SELECT * FROM secteurs WHERE slug = ?").get(slug) as Secteur | undefined;
  },

  // ─── Cross-dimensions ───

  async getServiceSecteurs(serviceSlug: string): Promise<{ secteur_slug: string; volume: number }[]> {
    return getDb()
      .prepare("SELECT secteur_slug, volume FROM service_secteur WHERE service_slug = ? ORDER BY volume DESC")
      .all(serviceSlug) as { secteur_slug: string; volume: number }[];
  },
  async getServiceVilles(serviceSlug: string): Promise<{ ville_slug: string; volume: number }[]> {
    return getDb()
      .prepare("SELECT ville_slug, volume FROM service_ville WHERE service_slug = ? ORDER BY volume DESC")
      .all(serviceSlug) as { ville_slug: string; volume: number }[];
  },
  async getServiceProfessions(serviceSlug: string): Promise<{ profession_slug: string; volume: number }[]> {
    return getDb()
      .prepare("SELECT profession_slug, volume FROM service_profession WHERE service_slug = ? ORDER BY volume DESC")
      .all(serviceSlug) as { profession_slug: string; volume: number }[];
  },

  // ─── Professions ───

  async getProfessionCategories(): Promise<ProfessionCategory[]> {
    return getDb().prepare("SELECT * FROM profession_categories ORDER BY order_index").all() as ProfessionCategory[];
  },
  async getProfessionCategoryBySlug(slug: string): Promise<ProfessionCategory | undefined> {
    return getDb().prepare("SELECT * FROM profession_categories WHERE slug = ?").get(slug) as ProfessionCategory | undefined;
  },
  async getProfessionsByCategory(categorySlug: string): Promise<Profession[]> {
    return getDb().prepare("SELECT * FROM professions WHERE category_slug = ? ORDER BY name").all(categorySlug) as Profession[];
  },
  async getProfessions(): Promise<Profession[]> {
    return getDb().prepare("SELECT * FROM professions ORDER BY name").all() as Profession[];
  },
  async getProfessionBySlug(slug: string): Promise<Profession | undefined> {
    return getDb().prepare("SELECT * FROM professions WHERE slug = ?").get(slug) as Profession | undefined;
  },

  // ─── KG Edges ───

  async getEdgesFrom(slug: string): Promise<KgEdge[]> {
    const edges = getDb()
      .prepare("SELECT * FROM kg_edges WHERE source_slug = ? ORDER BY weight DESC")
      .all(slug) as KgEdge[];
    return edges.filter((edge) => !isInstitutionalResource(edge.source_slug, edge.target_slug));
  },
  async getEdgesTo(slug: string): Promise<KgEdge[]> {
    const edges = getDb()
      .prepare("SELECT * FROM kg_edges WHERE target_slug = ? ORDER BY weight DESC")
      .all(slug) as KgEdge[];
    return edges.filter((edge) => !isInstitutionalResource(edge.source_slug, edge.target_slug));
  },

  // ─── Pricing tiers (P4a) ───

  async getPricingTiers(): Promise<PricingTier[]> {
    return getDb()
      .prepare("SELECT * FROM pricing_tiers ORDER BY order_index ASC")
      .all() as PricingTier[];
  },

  // ─── Testimonials filtering (P4a) ───

  async getTestimonialsByProfession(slug: string, limit = 3): Promise<Testimonial[]> {
    return getDb()
      .prepare(
        "SELECT * FROM testimonials WHERE profession_slug = ? ORDER BY RANDOM() LIMIT ?",
      )
      .all(slug, limit) as Testimonial[];
  },

  async getTestimonialsBySecteur(slug: string, limit = 3): Promise<Testimonial[]> {
    return getDb()
      .prepare(
        "SELECT * FROM testimonials WHERE secteur_slug = ? ORDER BY RANDOM() LIMIT ?",
      )
      .all(slug, limit) as Testimonial[];
  },

  async getTestimonialsByVille(slug: string, limit = 3): Promise<Testimonial[]> {
    return getDb()
      .prepare(
        "SELECT * FROM testimonials WHERE ville_slug = ? ORDER BY RANDOM() LIMIT ?",
      )
      .all(slug, limit) as Testimonial[];
  },

  // ─── Page content (sections, SEO, meta) ───

  async getPageSections(route: string, slug: string): Promise<PageSection[]> {
    return getDb()
      .prepare(
        "SELECT * FROM page_sections WHERE route = ? AND slug = ? ORDER BY section_order ASC",
      )
      .all(route, slug) as PageSection[];
  },

  async getSeoOverride(route: string, slug: string): Promise<SeoOverride | null> {
    const row = getDb()
      .prepare("SELECT * FROM seo_overrides WHERE route = ? AND slug = ?")
      .get(route, slug) as SeoOverride | undefined;
    return row ?? null;
  },

  async getPageMeta(route: string, slug: string): Promise<PageMeta | null> {
    const row = getDb()
      .prepare("SELECT * FROM page_meta WHERE route = ? AND slug = ?")
      .get(route, slug) as PageMeta | undefined;
    return row ?? null;
  },

  async getAllPageMeta(): Promise<PageMeta[]> {
    return getDb().prepare("SELECT * FROM page_meta").all() as PageMeta[];
  },

  async upsertPageSection(section: Omit<PageSection, "id" | "generated_at">): Promise<void> {
    getDb()
      .prepare(
        `INSERT INTO page_sections
           (route, slug, section_type, section_order, title, body, items, citations, generated_by_model)
         VALUES
           (@route, @slug, @section_type, @section_order, @title, @body, @items, @citations, @generated_by_model)
         ON CONFLICT(route, slug, section_order) DO UPDATE SET
           section_type       = excluded.section_type,
           title              = excluded.title,
           body               = excluded.body,
           items              = excluded.items,
           citations          = excluded.citations,
           generated_by_model = excluded.generated_by_model,
           generated_at       = datetime('now')`,
      )
      .run(section);
  },

  async upsertSeoOverride(override: Omit<SeoOverride, "id" | "generated_at">): Promise<void> {
    getDb()
      .prepare(
        `INSERT INTO seo_overrides
           (route, slug, meta_title, meta_description, h1, key_takeaways, json_ld_extra, generated_by_model)
         VALUES
           (@route, @slug, @meta_title, @meta_description, @h1, @key_takeaways, @json_ld_extra, @generated_by_model)
         ON CONFLICT(route, slug) DO UPDATE SET
           meta_title         = excluded.meta_title,
           meta_description   = excluded.meta_description,
           h1                 = excluded.h1,
           key_takeaways      = excluded.key_takeaways,
           json_ld_extra      = excluded.json_ld_extra,
           generated_by_model = excluded.generated_by_model,
           generated_at       = datetime('now')`,
      )
      .run(override);
  },

  async upsertPageMeta(meta: Omit<PageMeta, "id" | "reviewed_at">): Promise<void> {
    getDb()
      .prepare(
        `INSERT INTO page_meta
           (route, slug, author_persona_id, reviewed_by, content_hash, publish_status, published_at, pipeline_run_id)
         VALUES
           (@route, @slug, @author_persona_id, @reviewed_by, @content_hash, @publish_status, @published_at, @pipeline_run_id)
         ON CONFLICT(route, slug) DO UPDATE SET
           author_persona_id = excluded.author_persona_id,
           reviewed_by       = excluded.reviewed_by,
           content_hash      = excluded.content_hash,
           publish_status    = excluded.publish_status,
           published_at      = excluded.published_at,
           pipeline_run_id   = excluded.pipeline_run_id,
           reviewed_at       = datetime('now')`,
      )
      .run(meta);
  },

  async deletePageSections(route: string, slug: string): Promise<void> {
    getDb()
      .prepare("DELETE FROM page_sections WHERE route = ? AND slug = ?")
      .run(route, slug);
  },

  async getDirectoryCities(): Promise<DirectoryCity[]> {
    return getDb()
      .prepare(
        `SELECT c.*
         FROM cities_official c
         WHERE EXISTS (
           SELECT 1
           FROM directory_establishments e
           JOIN directory_cabinets d ON d.id = e.cabinet_id
           WHERE e.city_code_insee = c.code_insee
             AND ${DIRECTORY_PUBLIC_WHERE}
         )
         ORDER BY c.name ASC`,
      )
      .all() as DirectoryCity[];
  },

  async getDirectoryCityBySlug(slug: string): Promise<DirectoryCity | null> {
    const row = getDb()
      .prepare("SELECT * FROM cities_official WHERE slug = ?")
      .get(slug) as DirectoryCity | undefined;
    return row ?? null;
  },

  async getDirectoryCabinetsByCity(codeInsee: string, limit = 50): Promise<DirectoryCabinetCard[]> {
    return getDb()
      .prepare(
        `${DIRECTORY_SELECT}
         WHERE e.city_code_insee = ?
           AND ${DIRECTORY_PUBLIC_WHERE}
         ORDER BY COALESCE(d.display_name, d.legal_name) ASC
         LIMIT ?`,
      )
      .all(codeInsee, limit)
      .map((row) => mapDirectoryRow(row as DirectoryJoinRow));
  },

  async getDirectoryCabinetBySiret(siret: string): Promise<DirectoryCabinetCard | null> {
    const row = getDb()
      .prepare(
        `${DIRECTORY_SELECT}
         WHERE e.siret = ?
           AND ${DIRECTORY_PUBLIC_WHERE}`,
      )
      .get(siret) as DirectoryJoinRow | undefined;
    return row ? mapDirectoryRow(row) : null;
  },

  async getDirectoryCabinetCountByCity(codeInsee: string): Promise<number> {
    const row = getDb()
      .prepare(
        `SELECT COUNT(*) AS count
         FROM directory_cabinets d
         JOIN directory_establishments e ON e.cabinet_id = d.id
         WHERE e.city_code_insee = ?
           AND ${DIRECTORY_PUBLIC_WHERE}`,
      )
      .get(codeInsee) as { count: number };
    return row.count;
  },

  async getPublishedDirectoryCabinetCount(): Promise<number> {
    const row = getDb()
      .prepare(
        `SELECT COUNT(DISTINCT d.id) AS count
         FROM directory_cabinets d
         JOIN directory_establishments e ON e.cabinet_id = d.id
         WHERE ${DIRECTORY_PUBLIC_WHERE}`,
      )
      .get() as { count: number };
    return row.count;
  },

  async getDirectoryListingCities(): Promise<DirectoryCity[]> {
    return getDb()
      .prepare(
        `SELECT c.*
         FROM cities_official c
         WHERE EXISTS (
           SELECT 1
           FROM directory_establishments e
           JOIN directory_cabinets d ON d.id = e.cabinet_id
           WHERE e.city_code_insee = c.code_insee
             AND ${DIRECTORY_LISTING_WHERE}
         )
         ORDER BY c.name ASC`,
      )
      .all() as DirectoryCity[];
  },

  async getDirectoryListingCabinetsByCity(codeInsee: string, limit = 50): Promise<DirectoryCabinetCard[]> {
    return getDb()
      .prepare(
        `${DIRECTORY_SELECT}
         WHERE e.city_code_insee = ?
           AND ${DIRECTORY_LISTING_WHERE}
         ORDER BY
           CASE WHEN d.oec_status IN ('verified','manual_verified') THEN 0 ELSE 1 END ASC,
           d.confidence_score DESC,
           COALESCE(d.display_name, d.legal_name) ASC
         LIMIT ?`,
      )
      .all(codeInsee, limit)
      .map((row) => mapDirectoryRow(row as DirectoryJoinRow));
  },

  async getDirectoryListingCabinetBySiret(siret: string): Promise<DirectoryCabinetCard | null> {
    const row = getDb()
      .prepare(
        `${DIRECTORY_SELECT}
         WHERE e.siret = ?
           AND ${DIRECTORY_LISTING_WHERE}`,
      )
      .get(siret) as DirectoryJoinRow | undefined;
    return row ? mapDirectoryRow(row) : null;
  },

  async getDirectoryListingCabinetCountByCity(codeInsee: string): Promise<number> {
    const row = getDb()
      .prepare(
        `SELECT COUNT(DISTINCT d.id) AS count
         FROM directory_cabinets d
         JOIN directory_establishments e ON e.cabinet_id = d.id
         WHERE e.city_code_insee = ?
           AND ${DIRECTORY_LISTING_WHERE}`,
      )
      .get(codeInsee) as { count: number };
    return row.count;
  },

  async getDirectoryListingCabinetCount(): Promise<number> {
    const row = getDb()
      .prepare(
        `SELECT COUNT(DISTINCT d.id) AS count
         FROM directory_cabinets d
         JOIN directory_establishments e ON e.cabinet_id = d.id
         WHERE ${DIRECTORY_LISTING_WHERE}`,
      )
      .get() as { count: number };
    return row.count;
  },

  async getTopDirectoryListingCabinets(limit = 3): Promise<DirectoryCabinetCard[]> {
    return getDb()
      .prepare(
        `${DIRECTORY_SELECT}
         WHERE ${DIRECTORY_PUBLIC_WHERE}
           AND e.is_headquarter = 1
         ORDER BY d.confidence_score DESC,
                  COALESCE(d.display_name, d.legal_name) ASC
         LIMIT ?`,
      )
      .all(limit)
      .map((row) => mapDirectoryRow(row as DirectoryJoinRow));
  },

  async getDirectoryRelatedListingCabinetsByCity(
    codeInsee: string,
    excludeSiret: string,
    limit = 3,
  ): Promise<DirectoryCabinetCard[]> {
    return getDb()
      .prepare(
        `${DIRECTORY_SELECT}
         WHERE e.city_code_insee = ?
           AND e.siret != ?
           AND ${DIRECTORY_LISTING_WHERE}
         ORDER BY
           CASE WHEN d.oec_status IN ('verified','manual_verified') THEN 0 ELSE 1 END ASC,
           d.confidence_score DESC,
           COALESCE(d.display_name, d.legal_name) ASC
         LIMIT ?`,
      )
      .all(codeInsee, excludeSiret, limit)
      .map((row) => mapDirectoryRow(row as DirectoryJoinRow));
  },

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
           COUNT(DISTINCT CASE WHEN src.id IS NOT NULL THEN e.id END) AS enrichedCount,
           COUNT(DISTINCT CASE WHEN q.score >= 85 AND q.professional_status IN ('verified','manual_verified') THEN e.id END) AS documentedCount,
           COUNT(DISTINCT e.id) AS totalCount
         FROM directory_establishments e
         JOIN directory_cabinets d ON d.id = e.cabinet_id
         LEFT JOIN directory_profile_facts f
           ON f.establishment_id = e.id
          AND f.is_displayable = 1
         LEFT JOIN directory_enrichment_sources src
           ON src.id = f.source_id
          AND src.parsed_ok = 1
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

  async getDirectoryProfileServices(): Promise<Service[]> {
    const placeholders = DIRECTORY_PROFILE_SERVICE_ORDER.map(() => "?").join(",");
    const rows = getDb()
      .prepare(`SELECT * FROM services WHERE slug IN (${placeholders})`)
      .all(...DIRECTORY_PROFILE_SERVICE_ORDER) as Service[];
    const bySlug = new Map(rows.map((service) => [service.slug, service]));
    return DIRECTORY_PROFILE_SERVICE_ORDER.flatMap((slug) => {
      const service = bySlug.get(slug);
      return service ? [service] : [];
    });
  },

  async getDirectoryProfileProfessions(limit = 8): Promise<Profession[]> {
    return getDb()
      .prepare(
        `SELECT *
         FROM professions
         ORDER BY volume DESC, name ASC
         LIMIT ?`,
      )
      .all(limit) as Profession[];
  },

  async getMaillageLinks(sourceUrl: string, limit = 8): Promise<MaillageLink[]> {
    // Exact match on the normalized path (host stripped, no trailing slash):
    // domain-agnostic (crawl=skoria.fr, runtime canonical may differ) AND free of
    // the suffix-collision risk of a LIKE match.
    const path = sourceUrl.replace(/^https?:\/\/[^/]+/, "").replace(/\/+$/, "");
    if (!path) return [];
    try {
      return getDb()
        .prepare(
          "SELECT * FROM maillage_links WHERE source_path = ? ORDER BY priority DESC LIMIT ?",
        )
        .all(path, limit) as MaillageLink[];
    } catch {
      // Table absent (not yet migrated) — degrade gracefully.
      return [];
    }
  },
};
