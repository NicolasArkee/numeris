// ─── Couche commerciale / affiliation — accès lecture (Supabase) ───
// Migré de better-sqlite3 (numeris.db local) → adapter Supabase pour être
// serverless-safe : permet le rendu on-demand (dynamicParams) + ISR sur Vercel,
// où aucun fichier sqlite local n'existe au runtime. Tables :
// commercial_pages / affiliate_programs / page_affiliate_programs / commercial_links
// (remplies par scripts/import-affiliate-clustering.ts puis migrées vers Supabase).

import { getSupabaseClient } from "@/libs/db/supabase";
import type { LinkGroup } from "@/libs/db";

export type CommercialRoute = "comparatifs" | "avis" | "codes-parrainage";

export interface CommercialPage {
  slug: string;
  route: string;
  url: string;
  archetype: string;
  silo_label: string | null;
  hub_slug: string | null;
  hub_label: string | null;
  cluster_slug: string | null;
  cluster_label: string | null;
  label: string;
  intent: string | null;
  funnel_stage: string | null;
  primary_program: string | null;
  secondary_programs: string | null;
  target_query: string | null;
  est_volume: number;
  priority_ice: number;
  publish_wave: number;
  publish_status: "draft" | "review" | "published" | "archived";
}

export interface AffiliateProgram {
  slug: string;
  name: string;
  category_slug: string;
  program_type: string;
  has_affiliate: number;
  has_referral: number;
  has_apporteur: number;
  commission_display: string | null;
  recurrent: number;
  recurrent_note: string | null;
  platform: string | null;
  target_audience: string | null;
  scale_public: string | null;
  source_url: string | null;
  affiliate_url: string | null;
  notes: string | null;
}

export interface PageProgram extends AffiliateProgram {
  rank: number;
  is_primary: number;
}

/** Dernier segment de l'URL (= param dynamique de la route). */
function segmentOf(url: string): string {
  const parts = url.split("/").filter(Boolean);
  return parts[parts.length - 1] ?? "";
}

/** generateStaticParams : segments des pages PUBLIÉES d'une route (gating SEO). */
export async function getCommercialSegments(
  route: CommercialRoute,
): Promise<string[]> {
  const { data, error } = await getSupabaseClient()
    .from("commercial_pages")
    .select("url")
    .eq("route", route)
    .eq("publish_status", "published");
  if (error || !data) return [];
  return data.map((r) => segmentOf((r as { url: string }).url));
}

export async function getCommercialPageBySegment(
  route: CommercialRoute,
  segment: string,
): Promise<CommercialPage | undefined> {
  const url = `/${route}/${segment}`;
  const { data } = await getSupabaseClient()
    .from("commercial_pages")
    .select("*")
    .eq("route", route)
    .eq("url", url)
    .maybeSingle();
  return (data ?? undefined) as CommercialPage | undefined;
}

export async function getCommercialPageBySlug(
  slug: string,
): Promise<CommercialPage | undefined> {
  const { data } = await getSupabaseClient()
    .from("commercial_pages")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  return (data ?? undefined) as CommercialPage | undefined;
}

/** Programmes mis en avant sur une page (ordonnés par rank), joints sur affiliate_programs. */
export async function getPagePrograms(
  route: string,
  pageSlug: string,
): Promise<PageProgram[]> {
  const supa = getSupabaseClient();
  const { data: paps } = await supa
    .from("page_affiliate_programs")
    .select("program_slug, rank, is_primary")
    .eq("route", route)
    .eq("page_slug", pageSlug)
    .order("rank", { ascending: true });
  if (!paps || paps.length === 0) return [];
  const slugs = paps.map((p) => (p as { program_slug: string }).program_slug);
  const { data: progs } = await supa
    .from("affiliate_programs")
    .select("*")
    .in("slug", slugs)
    .eq("is_active", 1);
  const bySlug = new Map(
    (progs ?? []).map((p) => [(p as AffiliateProgram).slug, p as AffiliateProgram]),
  );
  // Préserve l'ordre `rank` ; ignore les programmes inactifs/absents.
  return (paps as { program_slug: string; rank: number; is_primary: number }[])
    .filter((p) => bySlug.has(p.program_slug))
    .map((p) => ({
      ...(bySlug.get(p.program_slug) as AffiliateProgram),
      rank: p.rank,
      is_primary: p.is_primary,
    }));
}

const EDGE_TITLES: Record<string, string> = {
  pillar_to_review: "Avis détaillés",
  review_sibling: "Autres avis à comparer",
  review_to_pillar: "Comparatif complet",
  persona_to_pillar: "Comparatif complet",
  review_to_code: "Offre & code parrainage",
  code_to_review: "Notre avis détaillé",
  review_to_alternatives: "Alternatives",
  alt_to_review: "Avis des alternatives",
  vs_to_review: "Avis détaillés",
  review_to_vs: "Face-à-face",
  persona_to_secteur: "Pour votre secteur",
  hierarchical_up: "Catégorie",
};

/** Liens internes (LinkGroup[]) pour une page : maillage commercial + secteurs existants. */
export async function getCommercialLinks(slug: string): Promise<LinkGroup[]> {
  const supa = getSupabaseClient();
  const { data: edgesRaw } = await supa
    .from("commercial_links")
    .select("target_slug, target_route, edge_type")
    .eq("source_slug", slug);
  const edges = (edgesRaw ?? []) as {
    target_slug: string;
    target_route: string | null;
    edge_type: string;
  }[];
  if (edges.length === 0) return [];

  // Résout les pages cibles (non-secteur) en UNE requête (évite N+1).
  const pageSlugs = edges
    .filter((e) => e.target_route !== "secteurs")
    .map((e) => e.target_slug);
  const targetMap = new Map<string, { url: string; label: string }>();
  if (pageSlugs.length > 0) {
    const { data: targets } = await supa
      .from("commercial_pages")
      .select("slug, url, label")
      .in("slug", pageSlugs);
    for (const t of (targets ?? []) as { slug: string; url: string; label: string }[]) {
      targetMap.set(t.slug, { url: t.url, label: t.label });
    }
  }

  const groups = new Map<string, { label: string; href: string }[]>();
  for (const e of edges) {
    let href: string | null = null;
    let label: string | null = null;
    if (e.target_route === "secteurs") {
      href = `/secteurs/${e.target_slug}`;
      label = `Experts-comptables ${e.target_slug.replace(/-/g, " ")}`;
    } else {
      const t = targetMap.get(e.target_slug);
      if (t) {
        href = t.url;
        label = t.label;
      }
    }
    if (!href || !label) continue; // ignore cibles non résolues (jamais de lien cassé)
    const title = EDGE_TITLES[e.edge_type] ?? "Pages liées";
    if (!groups.has(title)) groups.set(title, []);
    const arr = groups.get(title)!;
    if (arr.length < 8 && !arr.some((l) => l.href === href)) arr.push({ label, href });
  }
  return [...groups.entries()].map(([title, links]) => ({ title, links }));
}

/** Pages commerciales PUBLIÉES — pour sitemap.ts (gating SEO : draft exclu). */
export async function getPublishedCommercialPages(): Promise<
  { route: string; slug: string; url: string }[]
> {
  const { data } = await getSupabaseClient()
    .from("commercial_pages")
    .select("route, slug, url")
    .eq("publish_status", "published");
  return (data ?? []) as { route: string; slug: string; url: string }[];
}

export function formatProgramType(p: AffiliateProgram): string {
  const parts: string[] = [];
  if (p.has_affiliate) parts.push("Affiliation");
  if (p.has_referral) parts.push("Parrainage");
  if (p.has_apporteur) parts.push("Apporteur");
  return parts.join(" · ") || p.program_type;
}
