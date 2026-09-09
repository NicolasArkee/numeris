// ─── Couche commerciale / affiliation — accès lecture adaptatif ───
import type { LinkGroup } from "@/libs/db";
import { isPublicCommercialPage } from "@/libs/skoria-v2/model";
import { commercialStore } from "./commercial-store";
import type {
  AffiliateProgram,
  CommercialPage,
  CommercialRoute,
  PageProgram,
} from "./commercial-types";

export type {
  AffiliateProgram,
  CommercialPage,
  CommercialRoute,
  PageProgram,
} from "./commercial-types";

/** generateStaticParams : segments des pages PUBLIÉES d'une route (gating SEO). */
export async function getCommercialSegments(
  route: CommercialRoute,
): Promise<string[]> {
  return commercialStore.getSegments(route);
}

/** Public route lookup. Direct URLs are fail-closed to published rows. */
export async function getCommercialPageBySegment(
  route: CommercialRoute,
  segment: string,
): Promise<CommercialPage | undefined> {
  const url = `/${route}/${segment}`;
  const page = await commercialStore.getPageByRouteUrl(route, url);
  return isPublicCommercialPage(page) ? page : undefined;
}

/** Public slug lookup. Draft/review/archived rows are never returned. */
export async function getCommercialPageBySlug(
  slug: string,
): Promise<CommercialPage | undefined> {
  const page = await commercialStore.getPageBySlug(slug);
  return isPublicCommercialPage(page) ? page : undefined;
}

/** Programmes mis en avant sur une page (ordonnés par rank), joints sur affiliate_programs. */
export async function getPagePrograms(
  route: string,
  pageSlug: string,
): Promise<PageProgram[]> {
  const now = Date.now();
  return (await commercialStore.getPagePrograms(route, pageSlug)).filter((program) => {
    if (!program.source_url || program.fact_status !== "verified" || !program.retrieved_at) return false;
    const retrievedAt = Date.parse(program.retrieved_at);
    if (!Number.isFinite(retrievedAt)) return false;
    const containsOfferFact = Boolean(program.commission_display || program.recurrent_note || program.affiliate_url);
    const maxAgeDays = containsOfferFact ? 30 : 90;
    return now - retrievedAt <= maxAgeDays * 86_400_000;
  });
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
  const edges = await commercialStore.getEdges(slug);
  if (edges.length === 0) return [];

  // Résout les pages cibles (non-secteur) en UNE requête (évite N+1).
  const pageSlugs = edges
    .filter((e) => e.target_route !== "secteurs")
    .map((e) => e.target_slug);
  const targetMap = new Map<string, { url: string; label: string }>();
  if (pageSlugs.length > 0) {
    const targets = await commercialStore.getPublishedTargets(pageSlugs);
    for (const t of targets) {
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
  return commercialStore.getPublishedPages();
}

export function formatProgramType(p: AffiliateProgram): string {
  const parts: string[] = [];
  if (p.has_affiliate) parts.push("Affiliation");
  if (p.has_referral) parts.push("Parrainage");
  if (p.has_apporteur) parts.push("Apporteur");
  return parts.join(" · ") || p.program_type;
}
