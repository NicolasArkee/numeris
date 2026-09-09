/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * ─── V2: Supabase adapter ───
 *
 * Migration steps:
 * 1. npm install @supabase/supabase-js
 * 2. Set SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL) and
 *    SUPABASE_SERVICE_ROLE_KEY (or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) in .env
 * 3. Run the SQL from schema.ts in Supabase SQL editor
 * 4. Run: npm run db:migrate:supabase  (exports SQLite → Supabase)
 * 5. Update src/libs/db/index.ts to import { supabaseAdapter } instead of sqliteAdapter
 */

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { normalizeDbMetaTitle, normalizeMetaDescription } from "@/libs/content/meta-title";
import { sanitizeLegacyPublicSeoText } from "@/libs/skoria-v2/content-safety";
import { isPublicPageMeta } from "@/libs/skoria-v2/model";
import { diagnosePagePublication } from "@/libs/skoria-v2/publication";
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

// ─── Client (lazy, single instance) ───────────────────────────────────────────

let _client: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient {
  if (_client) return _client;

  const url =
    process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    "";

  if (!url) {
    throw new Error(
      "Supabase adapter: missing SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL) env var.",
    );
  }
  if (!key) {
    throw new Error(
      "Supabase adapter: missing SUPABASE_SERVICE_ROLE_KEY (or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) env var.",
    );
  }

  _client = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return _client;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function normalizeResourceText(value: string | null | undefined): string {
  return (value ?? "")
    .normalize("NFD")
    .replaceAll(/\p{Diacritic}/gu, "")
    .toLowerCase();
}

function isUnavailableSupabaseEnrichmentError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;

  const candidate = error as {
    code?: unknown;
    message?: unknown;
    details?: unknown;
  };
  const code = typeof candidate.code === "string" ? candidate.code : "";
  const message = typeof candidate.message === "string" ? candidate.message : "";
  const details = typeof candidate.details === "string" ? candidate.details : "";
  const text = `${message} ${details}`.toLowerCase();

  return (
    code === "PGRST205"
    || code === "42P01"
    || code === "42501"
    || (
      text.includes("could not find the table")
      && text.includes("schema cache")
    )
    || text.includes("relation does not exist")
    || text.includes("permission denied")
  );
}

function isInstitutionalResource(
  ...values: Array<string | null | undefined>
): boolean {
  const text = values.map(normalizeResourceText).join(" ");
  return text.includes("ordre") || /\boec\b/u.test(text);
}

async function isHiddenSiloAsync(silo: Silo): Promise<boolean> {
  return isInstitutionalResource(silo.slug, silo.label);
}

async function isHiddenHubAsync(hub: Hub): Promise<boolean> {
  if (isInstitutionalResource(hub.slug, hub.silo_slug, hub.label)) return true;
  const { data: silo } = await getSupabaseClient()
    .from("silos")
    .select("*")
    .eq("slug", hub.silo_slug)
    .maybeSingle();
  return silo ? isHiddenSiloAsync(silo as Silo) : Promise.resolve(false);
}

async function isHiddenClusterAsync(cluster: Cluster): Promise<boolean> {
  if (isInstitutionalResource(cluster.slug, cluster.hub_slug, cluster.label)) {
    return true;
  }
  const { data: hub } = await getSupabaseClient()
    .from("hubs")
    .select("*")
    .eq("slug", cluster.hub_slug)
    .maybeSingle();
  return hub ? isHiddenHubAsync(hub as Hub) : Promise.resolve(false);
}

async function isHiddenKeywordAsync(keyword: KeywordPage): Promise<boolean> {
  if (
    isInstitutionalResource(keyword.slug, keyword.cluster_slug, keyword.label)
  ) {
    return true;
  }
  const { data: cluster } = await getSupabaseClient()
    .from("clusters")
    .select("*")
    .eq("slug", keyword.cluster_slug)
    .maybeSingle();
  return cluster
    ? isHiddenClusterAsync(cluster as Cluster)
    : Promise.resolve(false);
}

async function filterAsync<T>(
  items: T[],
  predicate: (item: T) => Promise<boolean>,
): Promise<T[]> {
  const flags = await Promise.all(items.map(predicate));
  return items.filter((_, idx) => !flags[idx]);
}

// ─── Directory join → DirectoryCabinetCard ────────────────────────────────────
// PostgREST resource-embedding shape. The FK names must exist in Supabase; if
// custom names are used, replace with `establishments:directory_establishments!fk_name(*)`.

const DIRECTORY_CABINET_EMBED =
  "*, establishments:directory_establishments(*, city:cities_official(*))";

// Listing-side filter as a PostgREST `.or()` expression.
const DIRECTORY_LISTING_OR_FILTER =
  "and(publish_status.eq.published,confidence_score.gte.85,oec_status.in.(verified,manual_verified))," +
  "and(publish_status.eq.review,confidence_score.gte.50,oec_status.in.(unverified,not_found,ambiguous))";

const SUPABASE_PAGE_SIZE = 1000;
const SUPABASE_IN_CHUNK_SIZE = 200;

const DIRECTORY_PROFILE_SERVICE_ORDER = [
  "comptabilite",
  "fiscalite",
  "social",
  "creation-entreprise",
  "conseil-gestion",
  "audit",
];

type CabinetWithRelations = {
  // DirectoryCabinet columns
  id: number;
  siren: string | null;
  legal_name: string;
  display_name: string | null;
  naf_code: string | null;
  legal_form: string | null;
  is_active: number;
  oec_status: DirectoryCabinetCard["cabinet"]["oec_status"];
  oec_profile_url: string | null;
  oec_verified_at: string | null;
  confidence_score: number;
  publish_status: DirectoryCabinetCard["cabinet"]["publish_status"];
  source_summary: string;
  created_at: string;
  updated_at: string;
  establishments: Array<
    {
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
      city: DirectoryCity | null;
    }
  >;
};

type DirectoryListingEstablishmentRef = {
  cabinetId: number;
  establishmentId: number;
  siret: string;
  // Champs du cabinet embarqués (via l'embed !inner) pour trier les cartes
  // AVANT hydratation, sans re-requêter.
  oecStatus: DirectoryCabinetCard["cabinet"]["oec_status"];
  confidenceScore: number;
  displayName: string | null;
  legalName: string;
};

type DirectoryCityEstablishmentRef = {
  cabinet_id: number;
  id: number;
  siret: string;
};

type DirectoryListingCabinetRef = {
  id: number;
  siren: string | null;
  is_active: boolean | number;
  oec_status: DirectoryCabinetCard["cabinet"]["oec_status"];
  confidence_score: number;
  publish_status: DirectoryCabinetCard["cabinet"]["publish_status"];
};

function isDirectoryListingCabinetRef(
  cabinet: DirectoryListingCabinetRef | undefined,
): cabinet is DirectoryListingCabinetRef {
  if (!cabinet || !cabinet.is_active) return false;
  return (
    (
      cabinet.publish_status === "published"
      && cabinet.confidence_score >= 85
      && ["verified", "manual_verified"].includes(cabinet.oec_status)
    )
    || (
      cabinet.publish_status === "review"
      && cabinet.confidence_score >= 50
      && ["unverified", "not_found", "ambiguous"].includes(cabinet.oec_status)
    )
  );
}

function mapCabinetRow(
  row: CabinetWithRelations,
  pickEstablishment?: (
    establishments: CabinetWithRelations["establishments"],
  ) => CabinetWithRelations["establishments"][number] | undefined,
): DirectoryCabinetCard | null {
  const establishment = pickEstablishment
    ? pickEstablishment(row.establishments)
    : row.establishments?.[0];
  if (!establishment) return null;

  return {
    cabinet: {
      id: row.id,
      siren: row.siren,
      legal_name: row.legal_name,
      display_name: row.display_name,
      naf_code: row.naf_code,
      legal_form: row.legal_form,
      is_active: row.is_active,
      oec_status: row.oec_status,
      oec_profile_url: row.oec_profile_url,
      oec_verified_at: row.oec_verified_at,
      confidence_score: row.confidence_score,
      publish_status: row.publish_status,
      source_summary: row.source_summary,
      created_at: row.created_at,
      updated_at: row.updated_at,
    },
    establishment: {
      id: establishment.id,
      cabinet_id: establishment.cabinet_id,
      siret: establishment.siret,
      is_headquarter: establishment.is_headquarter,
      is_active: establishment.is_active,
      address_line1: establishment.address_line1,
      address_line2: establishment.address_line2,
      postal_code: establishment.postal_code,
      city_name: establishment.city_name,
      city_code_insee: establishment.city_code_insee,
      department_code: establishment.department_code,
      region_code: establishment.region_code,
      latitude: establishment.latitude,
      longitude: establishment.longitude,
      geocode_score: establishment.geocode_score,
      source_key: establishment.source_key,
      retrieved_at: establishment.retrieved_at,
      created_at: establishment.created_at,
      updated_at: establishment.updated_at,
    },
    city: establishment.city ?? null,
  };
}

/**
 * Active-clause filter (matches DIRECTORY_ACTIVE_WHERE).
 * Note: the privacy_suppression_requests sub-query cannot be expressed in
 * pure PostgREST select syntax — applied as a post-filter in TypeScript.
 */
async function filterActiveCabinets(
  rows: CabinetWithRelations[],
): Promise<CabinetWithRelations[]> {
  if (rows.length === 0) return rows;

  // Collect candidate (siren, siret) tuples.
  const sirens = Array.from(
    new Set(rows.map((r) => r.siren).filter((v): v is string => Boolean(v))),
  );
  const sirets = Array.from(
    new Set(
      rows.flatMap((r) =>
        (r.establishments ?? []).map((e) => e.siret).filter(Boolean),
      ),
    ),
  );

  const { data: suppressions } = await getSupabaseClient()
    .from("privacy_suppression_requests")
    .select("siren, siret, status")
    .eq("status", "active")
    .or(
      [
        sirens.length ? `siren.in.(${sirens.join(",")})` : "",
        sirets.length ? `siret.in.(${sirets.join(",")})` : "",
      ]
        .filter(Boolean)
        .join(","),
    );

  const suppressedSirens = new Set(
    (suppressions ?? [])
      .map((s: any) => s.siren)
      .filter((v: string | null): v is string => Boolean(v)),
  );
  const suppressedSirets = new Set(
    (suppressions ?? [])
      .map((s: any) => s.siret)
      .filter((v: string | null): v is string => Boolean(v)),
  );

  return rows
    .filter((r) => r.is_active as unknown as boolean)
    .filter((r) => !(r.siren && suppressedSirens.has(r.siren)))
    .map((r) => ({
      ...r,
      establishments: (r.establishments ?? []).filter(
        (e) => e.is_active as unknown as boolean && !suppressedSirets.has(e.siret),
      ),
    }))
    .filter((r) => r.establishments.length > 0);
}

function chunkArray<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
}

// Concurrence bornée des lectures paginées « toute la base » (liste des villes) :
// le build prérend ~30k pages en parallèle et sature déjà Supabase (57014 /
// connect timeouts). On parallélise les pages MAIS de façon plafonnée pour ne
// pas aggraver la contention.
const SUPABASE_FETCH_CONCURRENCY = 6;

async function mapWithConcurrency<T, R>(
  items: T[],
  concurrency: number,
  fn: (item: T) => Promise<R>,
): Promise<R[]> {
  const results = new Array<R>(items.length);
  let cursor = 0;
  async function worker(): Promise<void> {
    while (cursor < items.length) {
      const index = cursor++;
      results[index] = await fn(items[index]);
    }
  }
  const workers = Array.from(
    { length: Math.min(Math.max(1, concurrency), items.length) },
    () => worker(),
  );
  await Promise.all(workers);
  return results;
}

/**
 * Toutes les suppressions RGPD actives (siren + siret), lues en un seul balayage
 * paginé. Sert aux scans « toute la base » (liste des villes) où construire un
 * `.or(siren.in.(...),siret.in.(...))` avec des milliers d'identifiants
 * exploserait la limite d'URL PostgREST. La table reste petite (opt-out).
 */
async function fetchActiveSuppressions(): Promise<{
  suppressedSirens: Set<string>;
  suppressedSirets: Set<string>;
}> {
  const suppressedSirens = new Set<string>();
  const suppressedSirets = new Set<string>();

  for (let from = 0; ; from += SUPABASE_PAGE_SIZE) {
    const { data, error } = await getSupabaseClient()
      .from("privacy_suppression_requests")
      .select("siren, siret")
      .eq("status", "active")
      .order("id", { ascending: true })
      .range(from, from + SUPABASE_PAGE_SIZE - 1);
    if (error) throw error;

    const page = (data ?? []) as Array<{
      siren: string | null;
      siret: string | null;
    }>;
    for (const row of page) {
      if (row.siren) suppressedSirens.add(row.siren);
      if (row.siret) suppressedSirets.add(row.siret);
    }

    if (page.length < SUPABASE_PAGE_SIZE) break;
  }

  return { suppressedSirens, suppressedSirets };
}

async function fetchDirectoryListingEstablishmentRefsByCity(
  codeInsee: string,
): Promise<DirectoryListingEstablishmentRef[]> {
  // Gate poussée dans PostgREST via un embed !inner sur le cabinet : PostgREST
  // ne renvoie que les établissements dont le cabinet passe le filtre listing
  // (publish_status/confidence/oec) ET est actif. Une requête paginée (souvent
  // 1 page, même Marseille ~930) remplace l'ancien scan établissements + N
  // chunks d'hydratation cabinets — bien plus léger au build.
  type Row = {
    id: number;
    cabinet_id: number;
    siret: string;
    cabinet: {
      siren: string | null;
      oec_status: DirectoryCabinetCard["cabinet"]["oec_status"];
      confidence_score: number;
      display_name: string | null;
      legal_name: string;
    } | null;
  };
  const rows: Row[] = [];

  for (let from = 0; ; from += SUPABASE_PAGE_SIZE) {
    const { data, error } = await getSupabaseClient()
      .from("directory_establishments")
      .select(
        "id, cabinet_id, siret, cabinet:directory_cabinets!inner(siren, oec_status, confidence_score, display_name, legal_name)",
      )
      .eq("city_code_insee", codeInsee)
      .eq("is_active", true)
      .eq("cabinet.is_active", true)
      .or(DIRECTORY_LISTING_OR_FILTER, { referencedTable: "cabinet" })
      .order("id", { ascending: true })
      .range(from, from + SUPABASE_PAGE_SIZE - 1);
    if (error) throw error;

    const page = (data ?? []) as unknown as Row[];
    rows.push(...page);

    if (page.length < SUPABASE_PAGE_SIZE) break;
  }

  if (rows.length === 0) return [];

  const { suppressedSirens, suppressedSirets } = await fetchActiveSuppressions();

  return rows
    .filter((row) => {
      if (suppressedSirets.has(row.siret)) return false;
      const siren = row.cabinet?.siren ?? null;
      return !(siren && suppressedSirens.has(siren));
    })
    .map((row) => ({
      cabinetId: row.cabinet_id,
      establishmentId: row.id,
      siret: row.siret,
      oecStatus: row.cabinet?.oec_status ?? "unverified",
      confidenceScore: row.cabinet?.confidence_score ?? 0,
      displayName: row.cabinet?.display_name ?? null,
      legalName: row.cabinet?.legal_name ?? "",
    }));
}

async function fetchDisplayableFactEstablishmentIds(
  establishmentIds: number[],
): Promise<Set<number>> {
  const enriched = new Set<number>();
  const factRows: Array<{
    establishment_id: number | null;
    source_id: number | null;
  }> = [];
  const sourceIds = new Set<number>();

  for (const idChunk of chunkArray(establishmentIds, SUPABASE_IN_CHUNK_SIZE)) {
    for (let from = 0; ; from += SUPABASE_PAGE_SIZE) {
      const { data, error } = await getSupabaseClient()
        .from("directory_profile_facts")
        .select("establishment_id, source_id")
        .in("establishment_id", idChunk)
        .eq("is_displayable", true)
        .not("source_id", "is", null)
        .order("id", { ascending: true })
        .range(from, from + SUPABASE_PAGE_SIZE - 1);
      if (error) throw error;

      for (const row of (data ?? []) as Array<{
        establishment_id: number | null;
        source_id: number | null;
      }>) {
        factRows.push(row);
        if (row.source_id != null) {
          sourceIds.add(row.source_id);
        }
      }

      if ((data ?? []).length < SUPABASE_PAGE_SIZE) break;
    }
  }

  const parsedSourceIds = new Set<number>();
  for (const idChunk of chunkArray(Array.from(sourceIds), SUPABASE_IN_CHUNK_SIZE)) {
    const { data, error } = await getSupabaseClient()
      .from("directory_enrichment_sources")
      .select("id")
      .in("id", idChunk)
      .eq("parsed_ok", true);
    if (error) throw error;

    for (const row of (data ?? []) as Array<{ id: number }>) {
      parsedSourceIds.add(row.id);
    }
  }

  for (const row of factRows) {
    if (
      row.establishment_id != null
      && row.source_id != null
      && parsedSourceIds.has(row.source_id)
    ) {
      enriched.add(row.establishment_id);
    }
  }

  return enriched;
}

async function fetchSourcePreviewImagesByEstablishmentIds(
  establishmentIds: number[],
): Promise<Map<number, string>> {
  const previews = new Map<number, string>();
  const factRows: Array<{
    establishment_id: number | null;
    source_id: number | null;
    value: string;
  }> = [];
  const sourceIds = new Set<number>();

  for (const idChunk of chunkArray(establishmentIds, SUPABASE_IN_CHUNK_SIZE)) {
    const { data, error } = await getSupabaseClient()
      .from("directory_profile_facts")
      .select("establishment_id, source_id, value")
      .in("establishment_id", idChunk)
      .eq("fact_type", "source_preview_image")
      .eq("is_displayable", true)
      .order("confidence", { ascending: false })
      .order("id", { ascending: false });
    if (error) {
      if (isUnavailableSupabaseEnrichmentError(error)) return previews;
      throw error;
    }

    for (const row of (data ?? []) as Array<{
      establishment_id: number | null;
      source_id: number | null;
      value: string;
    }>) {
      factRows.push(row);
      if (row.source_id != null) sourceIds.add(row.source_id);
    }
  }

  const parsedSourceIds = new Set<number>();
  for (const idChunk of chunkArray(Array.from(sourceIds), SUPABASE_IN_CHUNK_SIZE)) {
    const { data, error } = await getSupabaseClient()
      .from("directory_enrichment_sources")
      .select("id")
      .in("id", idChunk)
      .eq("parsed_ok", true);
    if (error) {
      if (isUnavailableSupabaseEnrichmentError(error)) return previews;
      throw error;
    }

    for (const row of (data ?? []) as Array<{ id: number }>) {
      parsedSourceIds.add(row.id);
    }
  }

  for (const row of factRows) {
    if (row.establishment_id == null) continue;
    if (row.source_id != null && !parsedSourceIds.has(row.source_id)) continue;
    if (!previews.has(row.establishment_id)) {
      previews.set(row.establishment_id, row.value);
    }
  }

  return previews;
}

function isNewerDirectoryQualificationSnapshot(
  candidate: DirectoryQualificationSnapshot,
  current: DirectoryQualificationSnapshot,
): boolean {
  const candidateTime = Date.parse(candidate.created_at);
  const currentTime = Date.parse(current.created_at);
  if (candidateTime !== currentTime) {
    return candidateTime > currentTime;
  }
  return candidate.id > current.id;
}

async function fetchLatestDirectoryQualificationSnapshotsByEstablishmentIds(
  establishmentIds: number[],
): Promise<Map<number, DirectoryQualificationSnapshot>> {
  const latestByEstablishment = new Map<number, DirectoryQualificationSnapshot>();

  for (const idChunk of chunkArray(establishmentIds, SUPABASE_IN_CHUNK_SIZE)) {
    for (let from = 0; ; from += SUPABASE_PAGE_SIZE) {
      const { data, error } = await getSupabaseClient()
        .from("directory_qualification_snapshots")
        .select("*")
        .in("establishment_id", idChunk)
        .order("created_at", { ascending: false })
        .order("id", { ascending: false })
        .range(from, from + SUPABASE_PAGE_SIZE - 1);
      if (error) throw error;

      for (const snapshot of (data ?? []) as DirectoryQualificationSnapshot[]) {
        if (snapshot.establishment_id == null) continue;
        const current = latestByEstablishment.get(snapshot.establishment_id);
        if (!current || isNewerDirectoryQualificationSnapshot(snapshot, current)) {
          latestByEstablishment.set(snapshot.establishment_id, snapshot);
        }
      }

      if ((data ?? []).length < SUPABASE_PAGE_SIZE) break;
    }
  }

  return latestByEstablishment;
}

function isDocumentedDirectoryQualificationSnapshot(
  snapshot: DirectoryQualificationSnapshot,
): boolean {
  return (
    snapshot.score >= 85
    && ["verified", "manual_verified"].includes(snapshot.professional_status)
  );
}

// ─── Adapter implementation ───────────────────────────────────────────────────

const adapter: DbAdapter = {
  // ─── Home page ──────────────────────────────────────────────────────────────

  async getServices(): Promise<Service[]> {
    const { data, error } = await getSupabaseClient()
      .from("services")
      .select("*")
      .order("order_index", { ascending: true });
    if (error) throw error;
    return (data ?? []) as Service[];
  },

  async getTeamMembers(): Promise<TeamMember[]> {
    const { data, error } = await getSupabaseClient()
      .from("team_members")
      .select("*")
      .order("order_index", { ascending: true });
    if (error) throw error;
    return (data ?? []) as TeamMember[];
  },

  async getTestimonials(): Promise<Testimonial[]> {
    const { data, error } = await getSupabaseClient()
      .from("testimonials")
      .select("*")
      .order("id", { ascending: true });
    if (error) throw error;
    return (data ?? []) as Testimonial[];
  },

  async getPricingPlans(): Promise<PricingPlan[]> {
    const { data, error } = await getSupabaseClient()
      .from("pricing_plans")
      .select("*")
      .order("order_index", { ascending: true });
    if (error) throw error;
    return (data ?? []) as PricingPlan[];
  },

  async getFaqItems(): Promise<FaqItem[]> {
    const { data, error } = await getSupabaseClient()
      .from("faq_items")
      .select("*")
      .order("order_index", { ascending: true });
    if (error) throw error;
    return (data ?? []) as FaqItem[];
  },

  async getPageBySlug(slug: string): Promise<Page | undefined> {
    const { data, error } = await getSupabaseClient()
      .from("pages")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();
    if (error) throw error;
    return (data ?? undefined) as Page | undefined;
  },

  async getAllPages(): Promise<Page[]> {
    const { data, error } = await getSupabaseClient().from("pages").select("*");
    if (error) throw error;
    return (data ?? []) as Page[];
  },

  // ─── Clustering / KG ────────────────────────────────────────────────────────

  async getSilos(): Promise<Silo[]> {
    const { data, error } = await getSupabaseClient()
      .from("silos")
      .select("*")
      .order("volume", { ascending: false });
    if (error) throw error;
    return filterAsync((data ?? []) as Silo[], isHiddenSiloAsync);
  },

  async getSiloBySlug(slug: string): Promise<Silo | undefined> {
    const { data, error } = await getSupabaseClient()
      .from("silos")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();
    if (error) throw error;
    const silo = (data ?? undefined) as Silo | undefined;
    if (!silo) return undefined;
    return (await isHiddenSiloAsync(silo)) ? undefined : silo;
  },

  async getHubsBySilo(siloSlug: string): Promise<Hub[]> {
    if (isInstitutionalResource(siloSlug)) return [];
    const { data, error } = await getSupabaseClient()
      .from("hubs")
      .select("*")
      .eq("silo_slug", siloSlug)
      .order("volume", { ascending: false });
    if (error) throw error;
    return filterAsync((data ?? []) as Hub[], isHiddenHubAsync);
  },

  async getHubBySlug(slug: string): Promise<Hub | undefined> {
    const { data, error } = await getSupabaseClient()
      .from("hubs")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();
    if (error) throw error;
    const hub = (data ?? undefined) as Hub | undefined;
    if (!hub) return undefined;
    return (await isHiddenHubAsync(hub)) ? undefined : hub;
  },

  async getClustersByHub(hubSlug: string): Promise<Cluster[]> {
    const { data: hub, error: hubErr } = await getSupabaseClient()
      .from("hubs")
      .select("*")
      .eq("slug", hubSlug)
      .maybeSingle();
    if (hubErr) throw hubErr;
    if (!hub || (await isHiddenHubAsync(hub as Hub))) return [];

    const { data, error } = await getSupabaseClient()
      .from("clusters")
      .select("*")
      .eq("hub_slug", hubSlug)
      .order("volume", { ascending: false });
    if (error) throw error;
    return filterAsync((data ?? []) as Cluster[], isHiddenClusterAsync);
  },

  async getClusterBySlug(slug: string): Promise<Cluster | undefined> {
    const { data, error } = await getSupabaseClient()
      .from("clusters")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();
    if (error) throw error;
    const cluster = (data ?? undefined) as Cluster | undefined;
    if (!cluster) return undefined;
    return (await isHiddenClusterAsync(cluster)) ? undefined : cluster;
  },

  async getKeywordsByCluster(clusterSlug: string): Promise<KeywordPage[]> {
    const { data: cluster, error: clusterErr } = await getSupabaseClient()
      .from("clusters")
      .select("*")
      .eq("slug", clusterSlug)
      .maybeSingle();
    if (clusterErr) throw clusterErr;
    if (!cluster || (await isHiddenClusterAsync(cluster as Cluster))) return [];

    const { data, error } = await getSupabaseClient()
      .from("keyword_pages")
      .select("*")
      .eq("cluster_slug", clusterSlug)
      .order("volume", { ascending: false });
    if (error) throw error;
    return filterAsync((data ?? []) as KeywordPage[], isHiddenKeywordAsync);
  },

  async getKeywordBySlug(slug: string): Promise<KeywordPage | undefined> {
    const { data, error } = await getSupabaseClient()
      .from("keyword_pages")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();
    if (error) throw error;
    const keyword = (data ?? undefined) as KeywordPage | undefined;
    if (!keyword) return undefined;
    return (await isHiddenKeywordAsync(keyword)) ? undefined : keyword;
  },

  async getAllKeywords(): Promise<KeywordPage[]> {
    const { data, error } = await getSupabaseClient()
      .from("keyword_pages")
      .select("*")
      .order("volume", { ascending: false });
    if (error) throw error;
    return filterAsync((data ?? []) as KeywordPage[], isHiddenKeywordAsync);
  },

  // ─── Geo ────────────────────────────────────────────────────────────────────

  async getVilles(): Promise<Ville[]> {
    const { data, error } = await getSupabaseClient()
      .from("villes")
      .select("*")
      .order("population", { ascending: false });
    if (error) throw error;
    return (data ?? []) as Ville[];
  },

  async getVilleBySlug(slug: string): Promise<Ville | undefined> {
    const { data, error } = await getSupabaseClient()
      .from("villes")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();
    if (error) throw error;
    return (data ?? undefined) as Ville | undefined;
  },

  async getDepartements(): Promise<Departement[]> {
    const { data, error } = await getSupabaseClient()
      .from("departements")
      .select("*")
      .order("code", { ascending: true });
    if (error) throw error;
    return (data ?? []) as Departement[];
  },

  async getDepartementBySlug(slug: string): Promise<Departement | undefined> {
    const { data, error } = await getSupabaseClient()
      .from("departements")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();
    if (error) throw error;
    return (data ?? undefined) as Departement | undefined;
  },

  // ─── Secteurs ───────────────────────────────────────────────────────────────

  async getSecteurs(): Promise<Secteur[]> {
    const { data, error } = await getSupabaseClient()
      .from("secteurs")
      .select("*")
      .order("volume", { ascending: false });
    if (error) throw error;
    return (data ?? []) as Secteur[];
  },

  async getSecteurBySlug(slug: string): Promise<Secteur | undefined> {
    const { data, error } = await getSupabaseClient()
      .from("secteurs")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();
    if (error) throw error;
    return (data ?? undefined) as Secteur | undefined;
  },

  // ─── Cross-dimensions ───────────────────────────────────────────────────────

  async getServiceSecteurs(
    serviceSlug: string,
  ): Promise<{ secteur_slug: string; volume: number }[]> {
    const { data, error } = await getSupabaseClient()
      .from("service_secteur")
      .select("secteur_slug, volume")
      .eq("service_slug", serviceSlug)
      .order("volume", { ascending: false });
    if (error) throw error;
    return (data ?? []) as { secteur_slug: string; volume: number }[];
  },

  async getServiceVilles(
    serviceSlug: string,
  ): Promise<{ ville_slug: string; volume: number }[]> {
    const { data, error } = await getSupabaseClient()
      .from("service_ville")
      .select("ville_slug, volume")
      .eq("service_slug", serviceSlug)
      .order("volume", { ascending: false });
    if (error) throw error;
    return (data ?? []) as { ville_slug: string; volume: number }[];
  },

  async getServiceProfessions(
    serviceSlug: string,
  ): Promise<{ profession_slug: string; volume: number }[]> {
    const { data, error } = await getSupabaseClient()
      .from("service_profession")
      .select("profession_slug, volume")
      .eq("service_slug", serviceSlug)
      .order("volume", { ascending: false });
    if (error) throw error;
    return (data ?? []) as { profession_slug: string; volume: number }[];
  },

  // ─── Professions ────────────────────────────────────────────────────────────

  async getProfessionCategories(): Promise<ProfessionCategory[]> {
    const { data, error } = await getSupabaseClient()
      .from("profession_categories")
      .select("*")
      .order("order_index", { ascending: true });
    if (error) throw error;
    return (data ?? []) as ProfessionCategory[];
  },

  async getProfessionCategoryBySlug(
    slug: string,
  ): Promise<ProfessionCategory | undefined> {
    const { data, error } = await getSupabaseClient()
      .from("profession_categories")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();
    if (error) throw error;
    return (data ?? undefined) as ProfessionCategory | undefined;
  },

  async getProfessionsByCategory(
    categorySlug: string,
  ): Promise<Profession[]> {
    const { data, error } = await getSupabaseClient()
      .from("professions")
      .select("*")
      .eq("category_slug", categorySlug)
      .order("name", { ascending: true });
    if (error) throw error;
    return (data ?? []) as Profession[];
  },

  async getProfessions(): Promise<Profession[]> {
    const { data, error } = await getSupabaseClient()
      .from("professions")
      .select("*")
      .order("name", { ascending: true });
    if (error) throw error;
    return (data ?? []) as Profession[];
  },

  async getProfessionBySlug(slug: string): Promise<Profession | undefined> {
    const { data, error } = await getSupabaseClient()
      .from("professions")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();
    if (error) throw error;
    return (data ?? undefined) as Profession | undefined;
  },

  // ─── KG Edges ───────────────────────────────────────────────────────────────

  async getEdgesFrom(slug: string): Promise<KgEdge[]> {
    const { data, error } = await getSupabaseClient()
      .from("kg_edges")
      .select("*")
      .eq("source_slug", slug)
      .order("weight", { ascending: false });
    if (error) throw error;
    return ((data ?? []) as KgEdge[]).filter(
      (edge) => !isInstitutionalResource(edge.source_slug, edge.target_slug),
    );
  },

  async getEdgesTo(slug: string): Promise<KgEdge[]> {
    const { data, error } = await getSupabaseClient()
      .from("kg_edges")
      .select("*")
      .eq("target_slug", slug)
      .order("weight", { ascending: false });
    if (error) throw error;
    return ((data ?? []) as KgEdge[]).filter(
      (edge) => !isInstitutionalResource(edge.source_slug, edge.target_slug),
    );
  },

  // ─── Pricing tiers (P4a) ────────────────────────────────────────────────────

  async getPricingTiers(): Promise<PricingTier[]> {
    const { data, error } = await getSupabaseClient()
      .from("pricing_tiers")
      .select("*")
      .order("order_index", { ascending: true });
    if (error) throw error;
    return (data ?? []) as PricingTier[];
  },

  // ─── Testimonials filtering (P4a) ───────────────────────────────────────────
  // SQLite uses `ORDER BY RANDOM() LIMIT ?`. PostgREST has no built-in RANDOM(),
  // so we fetch matching rows then shuffle + slice client-side.

  async getTestimonialsByProfession(
    slug: string,
    limit = 3,
  ): Promise<Testimonial[]> {
    const { data, error } = await getSupabaseClient()
      .from("testimonials")
      .select("*")
      .eq("profession_slug", slug);
    if (error) throw error;
    return shuffleSlice((data ?? []) as Testimonial[], limit);
  },

  async getTestimonialsBySecteur(
    slug: string,
    limit = 3,
  ): Promise<Testimonial[]> {
    const { data, error } = await getSupabaseClient()
      .from("testimonials")
      .select("*")
      .eq("secteur_slug", slug);
    if (error) throw error;
    return shuffleSlice((data ?? []) as Testimonial[], limit);
  },

  async getTestimonialsByVille(
    slug: string,
    limit = 3,
  ): Promise<Testimonial[]> {
    const { data, error } = await getSupabaseClient()
      .from("testimonials")
      .select("*")
      .eq("ville_slug", slug);
    if (error) throw error;
    return shuffleSlice((data ?? []) as Testimonial[], limit);
  },

  // ─── Page content (sections, SEO, meta) ─────────────────────────────────────

  async getPageSections(route: string, slug: string): Promise<PageSection[]> {
    const { data, error } = await getSupabaseClient()
      .from("page_sections")
      .select("*")
      .eq("route", route)
      .eq("slug", slug)
      .order("section_order", { ascending: true });
    if (error) throw error;
    return (data ?? []) as PageSection[];
  },

  async getSeoOverride(
    route: string,
    slug: string,
  ): Promise<SeoOverride | null> {
    const client = getSupabaseClient();
    const { data: meta, error: metaError } = await client
      .from("page_meta")
      .select("*")
      .eq("route", route)
      .eq("slug", slug)
      .maybeSingle();
    if (metaError) throw metaError;
    if (!isPublicPageMeta((meta ?? null) as PageMeta | null)) {
      return null;
    }

    const { data, error } = await client
      .from("seo_overrides")
      .select("*")
      .eq("route", route)
      .eq("slug", slug)
      .maybeSingle();
    if (error) throw error;
    const row = (data ?? null) as SeoOverride | null;
    if (!diagnosePagePublication({ meta: (meta ?? null) as PageMeta | null, seo: row }).isPublic) {
      return null;
    }
    return row ? {
      ...row,
      meta_title: normalizeDbMetaTitle(row.meta_title ? sanitizeLegacyPublicSeoText(row.meta_title) : null),
      meta_description: row.meta_description
        ? normalizeMetaDescription(sanitizeLegacyPublicSeoText(row.meta_description))
        : null,
      h1: row.h1 ? sanitizeLegacyPublicSeoText(row.h1) : null,
    } : null;
  },

  async getPageMeta(route: string, slug: string): Promise<PageMeta | null> {
    const { data, error } = await getSupabaseClient()
      .from("page_meta")
      .select("*")
      .eq("route", route)
      .eq("slug", slug)
      .maybeSingle();
    if (error) throw error;
    return (data ?? null) as PageMeta | null;
  },

  async getAllPageMeta(): Promise<PageMeta[]> {
    const { data, error } = await getSupabaseClient()
      .from("page_meta")
      .select("*");
    if (error) throw error;
    return (data ?? []) as PageMeta[];
  },

  async upsertPageSection(
    section: Omit<PageSection, "id" | "generated_at">,
  ): Promise<void> {
    const { error } = await getSupabaseClient()
      .from("page_sections")
      .upsert(
        {
          ...section,
          generated_at: new Date().toISOString(),
        },
        { onConflict: "route,slug,section_order" },
      );
    if (error) throw error;
  },

  async upsertSeoOverride(
    override: Omit<SeoOverride, "id" | "generated_at">,
  ): Promise<void> {
    const { error } = await getSupabaseClient()
      .from("seo_overrides")
      .upsert(
        {
          ...override,
          generated_at: new Date().toISOString(),
        },
        { onConflict: "route,slug" },
      );
    if (error) throw error;
  },

  async upsertPageMeta(
    meta: Omit<PageMeta, "id" | "reviewed_at">,
  ): Promise<void> {
    const { error } = await getSupabaseClient()
      .from("page_meta")
      .upsert(
        {
          ...meta,
          reviewed_at: new Date().toISOString(),
        },
        { onConflict: "route,slug" },
      );
    if (error) throw error;
  },

  async deletePageSections(route: string, slug: string): Promise<void> {
    const { error } = await getSupabaseClient()
      .from("page_sections")
      .delete()
      .eq("route", route)
      .eq("slug", slug);
    if (error) throw error;
  },

  // ─── Directory public reads ────────────────────────────────────────────────

  async getDirectoryCities(): Promise<DirectoryCity[]> {
    // SQLite: cities_official WHERE EXISTS(... DIRECTORY_PUBLIC_WHERE ...)
    // We fetch matching cabinets+establishments, collect distinct city_code_insee,
    // then load the city rows.
    const { data: cabinets, error: cabErr } = await getSupabaseClient()
      .from("directory_cabinets")
      .select(
        "is_active, publish_status, confidence_score, oec_status, siren, establishments:directory_establishments(siret, is_active, city_code_insee)",
      )
      .eq("publish_status", "published")
      .gte("confidence_score", 85)
      .in("oec_status", ["verified", "manual_verified"]);
    if (cabErr) throw cabErr;

    const active = await filterActiveCabinets(
      (cabinets ?? []) as unknown as CabinetWithRelations[],
    );

    const codes = Array.from(
      new Set(
        active.flatMap((r) =>
          r.establishments
            .map((e) => e.city_code_insee)
            .filter((v): v is string => Boolean(v)),
        ),
      ),
    );

    if (codes.length === 0) return [];

    const { data, error } = await getSupabaseClient()
      .from("cities_official")
      .select("*")
      .in("code_insee", codes)
      .order("name", { ascending: true });
    if (error) throw error;
    return (data ?? []) as DirectoryCity[];
  },

  async getDirectoryCityBySlug(slug: string): Promise<DirectoryCity | null> {
    const { data, error } = await getSupabaseClient()
      .from("cities_official")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();
    if (error) throw error;
    return (data ?? null) as DirectoryCity | null;
  },

  async getDirectoryCabinetsByCity(
    codeInsee: string,
    limit = 50,
  ): Promise<DirectoryCabinetCard[]> {
    const { data, error } = await getSupabaseClient()
      .from("directory_cabinets")
      .select(DIRECTORY_CABINET_EMBED)
      .eq("publish_status", "published")
      .gte("confidence_score", 85)
      .in("oec_status", ["verified", "manual_verified"])
      .eq("establishments.city_code_insee", codeInsee);
    if (error) throw error;

    const filtered = await filterActiveCabinets(
      (data ?? []) as unknown as CabinetWithRelations[],
    );

    return filtered
      .map((row) =>
        mapCabinetRow(row, (ests) =>
          ests.find((e) => e.city_code_insee === codeInsee),
        ),
      )
      .filter((card): card is DirectoryCabinetCard => card !== null)
      .sort((a, b) => {
        const an = (a.cabinet.display_name ?? a.cabinet.legal_name).toLowerCase();
        const bn = (b.cabinet.display_name ?? b.cabinet.legal_name).toLowerCase();
        return an.localeCompare(bn);
      })
      .slice(0, limit);
  },

  async getDirectoryCabinetBySiret(
    siret: string,
  ): Promise<DirectoryCabinetCard | null> {
    const { data, error } = await getSupabaseClient()
      .from("directory_cabinets")
      .select(DIRECTORY_CABINET_EMBED)
      .eq("publish_status", "published")
      .gte("confidence_score", 85)
      .in("oec_status", ["verified", "manual_verified"])
      .eq("establishments.siret", siret);
    if (error) throw error;

    const filtered = await filterActiveCabinets(
      (data ?? []) as unknown as CabinetWithRelations[],
    );
    if (filtered.length === 0) return null;

    return mapCabinetRow(filtered[0], (ests) =>
      ests.find((e) => e.siret === siret),
    );
  },

  async getDirectoryCabinetCountByCity(codeInsee: string): Promise<number> {
    const { data, error } = await getSupabaseClient()
      .from("directory_cabinets")
      .select(
        "id, is_active, siren, establishments:directory_establishments(siret, is_active, city_code_insee)",
      )
      .eq("publish_status", "published")
      .gte("confidence_score", 85)
      .in("oec_status", ["verified", "manual_verified"])
      .eq("establishments.city_code_insee", codeInsee);
    if (error) throw error;
    const filtered = await filterActiveCabinets(
      (data ?? []) as unknown as CabinetWithRelations[],
    );
    // SQLite query is COUNT(*) over the JOIN — counts each matching establishment.
    return filtered.reduce(
      (sum, r) =>
        sum +
        r.establishments.filter((e) => e.city_code_insee === codeInsee).length,
      0,
    );
  },

  async getPublishedDirectoryCabinetCount(): Promise<number> {
    const { data, error } = await getSupabaseClient()
      .from("directory_cabinets")
      .select(
        "id, is_active, siren, establishments:directory_establishments(siret, is_active)",
      )
      .eq("publish_status", "published")
      .gte("confidence_score", 85)
      .in("oec_status", ["verified", "manual_verified"]);
    if (error) throw error;
    const filtered = await filterActiveCabinets(
      (data ?? []) as unknown as CabinetWithRelations[],
    );
    // COUNT(DISTINCT d.id) — one count per cabinet.
    return filtered.length;
  },

  async getDirectoryListingCities(): Promise<DirectoryCity[]> {
    // Sans .range(), PostgREST plafonnait à 1000 cabinets → ~108 villes au lieu
    // des ~1800 réellement listables. On balaye les établissements listables
    // (gate poussée en DB via embed !inner sur le cabinet, sans embed lourd
    // établissements→cabinet qui faisait sauter le 57014), PAGINÉ ET PARALLÉLISÉ
    // (concurrence bornée) pour tenir sous le timeout de génération statique.
    const client = getSupabaseClient();

    const { count, error: countError } = await client
      .from("directory_establishments")
      .select("id, cabinet:directory_cabinets!inner(id)", {
        count: "exact",
        head: true,
      })
      .eq("is_active", true)
      .eq("cabinet.is_active", true)
      .or(DIRECTORY_LISTING_OR_FILTER, { referencedTable: "cabinet" });
    if (countError) throw countError;

    const total = count ?? 0;
    if (total === 0) return [];

    const offsets = Array.from(
      { length: Math.ceil(total / SUPABASE_PAGE_SIZE) },
      (_, i) => i * SUPABASE_PAGE_SIZE,
    );

    const { suppressedSirens, suppressedSirets } = await fetchActiveSuppressions();

    type Row = {
      siret: string;
      city_code_insee: string | null;
      cabinet: { siren: string | null } | null;
    };
    const pages = await mapWithConcurrency(
      offsets,
      SUPABASE_FETCH_CONCURRENCY,
      async (from) => {
        const { data, error } = await client
          .from("directory_establishments")
          .select(
            "siret, city_code_insee, cabinet:directory_cabinets!inner(siren)",
          )
          .eq("is_active", true)
          .eq("cabinet.is_active", true)
          .or(DIRECTORY_LISTING_OR_FILTER, { referencedTable: "cabinet" })
          .order("id", { ascending: true })
          .range(from, from + SUPABASE_PAGE_SIZE - 1);
        if (error) throw error;
        return (data ?? []) as unknown as Row[];
      },
    );

    const codeSet = new Set<string>();
    for (const page of pages) {
      for (const row of page) {
        if (!row.city_code_insee) continue;
        if (suppressedSirets.has(row.siret)) continue;
        const siren = row.cabinet?.siren ?? null;
        if (siren && suppressedSirens.has(siren)) continue;
        codeSet.add(row.city_code_insee);
      }
    }
    if (codeSet.size === 0) return [];

    // .in() sur ~1800 codes dépasserait la limite d'URL PostgREST → chunké
    // (en parallèle borné).
    const cityPages = await mapWithConcurrency(
      chunkArray(Array.from(codeSet), SUPABASE_IN_CHUNK_SIZE),
      SUPABASE_FETCH_CONCURRENCY,
      async (codeChunk) => {
        const { data, error } = await client
          .from("cities_official")
          .select("*")
          .in("code_insee", codeChunk);
        if (error) throw error;
        return (data ?? []) as DirectoryCity[];
      },
    );

    const cities = cityPages.flat();
    cities.sort((a, b) => a.name.localeCompare(b.name));
    return cities;
  },

  async getDirectoryListingCabinetsByCity(
    codeInsee: string,
    limit = 50,
  ): Promise<DirectoryCabinetCard[]> {
    // Establishment-first : le filtre embarqué `establishments.city_code_insee`
    // sans !inner ne restreignait PAS les cabinets parents → PostgREST renvoyait
    // une fenêtre arbitraire de 1000 cabinets et 0 correspondance pour toute
    // ville hors de cette fenêtre (404 + noindex sur ~1685 villes listables).
    // Le helper renvoie déjà les champs de tri du cabinet : on TRIE et TRONQUE
    // les refs AVANT d'hydrater → on ne charge que les <=limit cabinets affichés
    // (Marseille : hydratation de 100, pas de ~900).
    const refs = await fetchDirectoryListingEstablishmentRefsByCity(codeInsee);
    if (refs.length === 0) return [];

    const verifiedSet = new Set(["verified", "manual_verified"]);
    const firstRefByCabinet = new Map<number, DirectoryListingEstablishmentRef>();
    for (const ref of refs) {
      if (!firstRefByCabinet.has(ref.cabinetId)) {
        firstRefByCabinet.set(ref.cabinetId, ref);
      }
    }

    const topRefs = Array.from(firstRefByCabinet.values())
      .sort((a, b) => {
        const av = verifiedSet.has(a.oecStatus) ? 0 : 1;
        const bv = verifiedSet.has(b.oecStatus) ? 0 : 1;
        if (av !== bv) return av - bv;
        if (a.confidenceScore !== b.confidenceScore) {
          return b.confidenceScore - a.confidenceScore;
        }
        const an = (a.displayName ?? a.legalName).toLowerCase();
        const bn = (b.displayName ?? b.legalName).toLowerCase();
        return an.localeCompare(bn);
      })
      .slice(0, limit);

    const rowsByCabinetId = new Map<number, CabinetWithRelations>();
    for (const idChunk of chunkArray(
      topRefs.map((ref) => ref.cabinetId),
      SUPABASE_IN_CHUNK_SIZE,
    )) {
      const { data, error } = await getSupabaseClient()
        .from("directory_cabinets")
        .select(DIRECTORY_CABINET_EMBED)
        .in("id", idChunk);
      if (error) throw error;

      for (const row of (data ?? []) as unknown as CabinetWithRelations[]) {
        rowsByCabinetId.set(row.id, row);
      }
    }

    return topRefs
      .map((ref) => {
        const row = rowsByCabinetId.get(ref.cabinetId);
        if (!row) return null;
        return mapCabinetRow(row, (ests) =>
          ests.find(
            (e) => e.id === ref.establishmentId || e.siret === ref.siret,
          ),
        );
      })
      .filter((card): card is DirectoryCabinetCard => card !== null);
  },

  async getDirectoryListingCabinetBySiret(
    siret: string,
  ): Promise<DirectoryCabinetCard | null> {
    const { data: establishment, error: establishmentError } = await getSupabaseClient()
      .from("directory_establishments")
      .select("id, cabinet_id, siret, is_active")
      .eq("siret", siret)
      .eq("is_active", true)
      .maybeSingle();
    if (establishmentError) throw establishmentError;
    if (!establishment) return null;

    const { data, error } = await getSupabaseClient()
      .from("directory_cabinets")
      .select(DIRECTORY_CABINET_EMBED)
      .eq("id", (establishment as DirectoryCityEstablishmentRef).cabinet_id)
      .maybeSingle();
    if (error) throw error;
    if (!data) return null;

    if (!isDirectoryListingCabinetRef(data as unknown as DirectoryListingCabinetRef)) {
      return null;
    }

    const filtered = await filterActiveCabinets(
      [data] as unknown as CabinetWithRelations[],
    );
    if (filtered.length === 0) return null;

    return mapCabinetRow(filtered[0], (ests) =>
      ests.find((e) => e.siret === siret),
    );
  },

  async getDirectoryListingCabinetCountByCity(
    codeInsee: string,
  ): Promise<number> {
    // Même bug que getDirectoryListingCabinetsByCity : le filtre embarqué sans
    // !inner ne restreignait pas les parents (fenêtre 1000 → gate robots faux
    // pour les villes hors fenêtre). Compte establishment-first des cabinets
    // listables distincts de la ville.
    const refs = await fetchDirectoryListingEstablishmentRefsByCity(codeInsee);
    return new Set(refs.map((ref) => ref.cabinetId)).size;
  },

  async getDirectoryListingCabinetCount(): Promise<number> {
    const { count, error } = await getSupabaseClient()
      .from("directory_cabinets")
      .select(
        "id, establishments:directory_establishments!inner(id)",
        { count: "exact", head: true },
      )
      .eq("is_active", true)
      .eq("establishments.is_active", true)
      .or(DIRECTORY_LISTING_OR_FILTER);
    if (error) throw error;
    return count ?? 0;
  },

  async getTopDirectoryListingCabinets(
    limit = 3,
  ): Promise<DirectoryCabinetCard[]> {
    const { data, error } = await getSupabaseClient()
      .from("directory_cabinets")
      .select(DIRECTORY_CABINET_EMBED)
      .eq("publish_status", "published")
      .gte("confidence_score", 85)
      .in("oec_status", ["verified", "manual_verified"])
      .eq("establishments.is_headquarter", true);
    if (error) throw error;

    const filtered = await filterActiveCabinets(
      (data ?? []) as unknown as CabinetWithRelations[],
    );

    return filtered
      .map((row) =>
        mapCabinetRow(row, (ests) => ests.find((e) => e.is_headquarter as unknown as boolean)),
      )
      .filter((card): card is DirectoryCabinetCard => card !== null)
      .sort((a, b) => {
        if (a.cabinet.confidence_score !== b.cabinet.confidence_score) {
          return b.cabinet.confidence_score - a.cabinet.confidence_score;
        }
        const an = (a.cabinet.display_name ?? a.cabinet.legal_name).toLowerCase();
        const bn = (b.cabinet.display_name ?? b.cabinet.legal_name).toLowerCase();
        return an.localeCompare(bn);
      })
      .slice(0, limit);
  },

  async getDirectoryRelatedListingCabinetsByCity(
    codeInsee: string,
    excludeSiret: string,
    limit = 3,
  ): Promise<DirectoryCabinetCard[]> {
    const refs = (await fetchDirectoryListingEstablishmentRefsByCity(codeInsee))
      .filter((ref) => ref.siret !== excludeSiret);
    if (refs.length === 0) return [];

    const rowsByCabinetId = new Map<number, CabinetWithRelations>();
    const cabinetIds = Array.from(new Set(refs.map((ref) => ref.cabinetId)));
    for (const idChunk of chunkArray(cabinetIds, SUPABASE_IN_CHUNK_SIZE)) {
      const { data, error } = await getSupabaseClient()
        .from("directory_cabinets")
        .select(DIRECTORY_CABINET_EMBED)
        .in("id", idChunk);
      if (error) throw error;

      for (const row of (data ?? []) as unknown as CabinetWithRelations[]) {
        rowsByCabinetId.set(row.id, row);
      }
    }

    const candidates = refs
      .map((ref) => {
        const row = rowsByCabinetId.get(ref.cabinetId);
        if (!row) return null;
        return mapCabinetRow(row, (ests) =>
          ests.find((establishment) =>
            establishment.id === ref.establishmentId
            || establishment.siret === ref.siret,
          ),
        );
      })
      .filter((card): card is DirectoryCabinetCard => card !== null);

    const previews = await fetchSourcePreviewImagesByEstablishmentIds(
      candidates.map((card) => card.establishment.id),
    );
    const verifiedSet = new Set(["verified", "manual_verified"]);

    return candidates
      .sort((a, b) => {
        const ap = previews.has(a.establishment.id) ? 0 : 1;
        const bp = previews.has(b.establishment.id) ? 0 : 1;
        if (ap !== bp) return ap - bp;
        const av = verifiedSet.has(a.cabinet.oec_status) ? 0 : 1;
        const bv = verifiedSet.has(b.cabinet.oec_status) ? 0 : 1;
        if (av !== bv) return av - bv;
        if (a.cabinet.confidence_score !== b.cabinet.confidence_score) {
          return b.cabinet.confidence_score - a.cabinet.confidence_score;
        }
        const an = (a.cabinet.display_name ?? a.cabinet.legal_name).toLowerCase();
        const bn = (b.cabinet.display_name ?? b.cabinet.legal_name).toLowerCase();
        return an.localeCompare(bn);
      })
      .slice(0, limit)
      .map((card) => ({
        ...card,
        sourcePreviewImageUrl: previews.get(card.establishment.id) ?? null,
      }));
  },

  async getDirectoryProfileFactsByEstablishment(
    establishmentId: number,
  ): Promise<DirectoryProfileFact[]> {
    const { data, error } = await getSupabaseClient()
      .from("directory_profile_facts")
      .select("*")
      .eq("establishment_id", establishmentId)
      .eq("is_displayable", true)
      .order("confidence", { ascending: false })
      .order("label", { ascending: true });
    if (error) {
      if (isUnavailableSupabaseEnrichmentError(error)) return [];
      throw error;
    }
    const order = new Map<DirectoryProfileFact["fact_type"], number>([
      ["website", 0],
      ["contact_url", 1],
      ["email", 2],
      ["phone", 3],
      ["opening_hours", 4],
      ["profile_summary", 5],
      ["source_preview_image", 6],
      ["service", 7],
      ["sector", 8],
      ["software", 9],
      ["team_signal", 10],
      ["registry_status", 11],
    ]);
    return ((data ?? []) as DirectoryProfileFact[]).sort(
      (a, b) =>
        (order.get(a.fact_type) ?? 12) - (order.get(b.fact_type) ?? 12)
        || b.confidence - a.confidence
        || a.label.localeCompare(b.label, "fr"),
    );
  },

  async getDirectoryEnrichmentSourcesByEstablishment(
    establishmentId: number,
  ): Promise<DirectoryEnrichmentSource[]> {
    const { data, error } = await getSupabaseClient()
      .from("directory_enrichment_sources")
      .select("*")
      .eq("establishment_id", establishmentId)
      .eq("parsed_ok", true)
      .order("retrieved_at", { ascending: false })
      .order("id", { ascending: false });
    if (error) {
      if (isUnavailableSupabaseEnrichmentError(error)) return [];
      throw error;
    }
    return (data ?? []) as DirectoryEnrichmentSource[];
  },

  async getLatestDirectoryQualificationSnapshot(
    cabinetId: number,
    establishmentId: number,
  ): Promise<DirectoryQualificationSnapshot | null> {
    const { data, error } = await getSupabaseClient()
      .from("directory_qualification_snapshots")
      .select("*")
      .eq("cabinet_id", cabinetId)
      .eq("establishment_id", establishmentId)
      .order("created_at", { ascending: false })
      .order("id", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) {
      if (isUnavailableSupabaseEnrichmentError(error)) return null;
      throw error;
    }
    return (data ?? null) as DirectoryQualificationSnapshot | null;
  },

  async getDirectoryCityEnrichmentStats(
    codeInsee: string,
  ): Promise<DirectoryCityEnrichmentStats> {
    const listingEstablishments =
      await fetchDirectoryListingEstablishmentRefsByCity(codeInsee);
    if (listingEstablishments.length === 0) {
      return { enrichedCount: 0, documentedCount: 0, candidateCount: 0 };
    }

    const establishmentIds = listingEstablishments.map(
      (establishment) => establishment.establishmentId,
    );
    let enriched: Set<number>;
    let latestByEstablishment: Map<number, DirectoryQualificationSnapshot>;
    try {
      [enriched, latestByEstablishment] = await Promise.all([
        fetchDisplayableFactEstablishmentIds(establishmentIds),
        fetchLatestDirectoryQualificationSnapshotsByEstablishmentIds(establishmentIds),
      ]);
    } catch (error) {
      if (isUnavailableSupabaseEnrichmentError(error)) {
        return { enrichedCount: 0, documentedCount: 0, candidateCount: 0 };
      }
      throw error;
    }

    const documentedCount = listingEstablishments.filter((establishment) => {
      const snapshot = latestByEstablishment.get(establishment.establishmentId);
      return snapshot ? isDocumentedDirectoryQualificationSnapshot(snapshot) : false;
    }).length;

    return {
      enrichedCount: enriched.size,
      documentedCount,
      candidateCount: Math.max(listingEstablishments.length - documentedCount, 0),
    };
  },

  async getDirectoryLatestEnrichmentDateByEstablishment(
    establishmentId: number,
  ): Promise<string | null> {
    const { data, error } = await getSupabaseClient()
      .from("directory_enrichment_sources")
      .select("retrieved_at")
      .eq("establishment_id", establishmentId)
      .eq("parsed_ok", true)
      .order("retrieved_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) {
      if (isUnavailableSupabaseEnrichmentError(error)) return null;
      throw error;
    }
    return data?.retrieved_at ?? null;
  },

  async getDirectoryProfileServices(): Promise<Service[]> {
    const { data, error } = await getSupabaseClient()
      .from("services")
      .select("*")
      .in("slug", DIRECTORY_PROFILE_SERVICE_ORDER);
    if (error) throw error;
    const bySlug = new Map(
      ((data ?? []) as Service[]).map((service) => [service.slug, service]),
    );
    return DIRECTORY_PROFILE_SERVICE_ORDER.flatMap((slug) => {
      const service = bySlug.get(slug);
      return service ? [service] : [];
    });
  },

  async getDirectoryProfileProfessions(limit = 8): Promise<Profession[]> {
    const { data, error } = await getSupabaseClient()
      .from("professions")
      .select("*")
      .order("volume", { ascending: false })
      .order("name", { ascending: true })
      .limit(limit);
    if (error) throw error;
    return (data ?? []) as Profession[];
  },

  async getMaillageLinks(sourceUrl: string, limit = 8): Promise<MaillageLink[]> {
    // Exact match on the normalized path (host stripped, no trailing slash):
    // domain-agnostic + no suffix-collision risk.
    const path = sourceUrl.replace(/^https?:\/\/[^/]+/, "").replace(/\/+$/, "");
    if (!path) return [];
    const { data, error } = await getSupabaseClient()
      .from("maillage_links")
      .select("*")
      .eq("source_path", path)
      .order("priority", { ascending: false })
      .limit(limit);
    // Table may not exist yet (pre-migration) — degrade gracefully instead of 500.
    if (error) return [];
    return (data ?? []) as MaillageLink[];
  },
};

// ─── Local utils ──────────────────────────────────────────────────────────────

function shuffleSlice<T>(rows: T[], limit: number): T[] {
  // Fisher-Yates shuffle (mirrors SQLite's `ORDER BY RANDOM() LIMIT ?`).
  const arr = [...rows];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.slice(0, limit);
}

export const supabaseAdapter: DbAdapter = adapter;
