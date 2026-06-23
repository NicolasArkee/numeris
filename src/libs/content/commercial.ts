// ─── Couche commerciale / affiliation — accès lecture ───
// Lit les tables isolées commercial_pages / affiliate_programs /
// page_affiliate_programs / commercial_links (remplies par
// scripts/import-affiliate-clustering.ts). Connexion readonly dédiée — ne touche
// pas à l'adaptateur DbAdapter éditorial. Référence pattern : scripts/generate-kg.ts.

import Database from "better-sqlite3";
import path from "node:path";
import type { LinkGroup } from "@/libs/db";

const DB_PATH = path.join(process.cwd(), "numeris.db");

let _cdb: Database.Database | null = null;
function cdb(): Database.Database {
  if (!_cdb) _cdb = new Database(DB_PATH, { readonly: true });
  return _cdb;
}

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
export function getCommercialSegments(route: CommercialRoute): string[] {
  const rows = cdb()
    .prepare(
      "SELECT url FROM commercial_pages WHERE route = ? AND publish_status = 'published'",
    )
    .all(route) as { url: string }[];
  return rows.map((r) => segmentOf(r.url));
}

export function getCommercialPageBySegment(
  route: CommercialRoute,
  segment: string,
): CommercialPage | undefined {
  const url = `/${route}/${segment}`;
  return cdb()
    .prepare("SELECT * FROM commercial_pages WHERE route = ? AND url = ?")
    .get(route, url) as CommercialPage | undefined;
}

export function getCommercialPageBySlug(slug: string): CommercialPage | undefined {
  return cdb()
    .prepare("SELECT * FROM commercial_pages WHERE slug = ?")
    .get(slug) as CommercialPage | undefined;
}

/** Programmes mis en avant sur une page (ordonnés), join sur affiliate_programs. */
export function getPagePrograms(route: string, pageSlug: string): PageProgram[] {
  return cdb()
    .prepare(
      `SELECT ap.*, pap.rank AS rank, pap.is_primary AS is_primary
       FROM page_affiliate_programs pap
       JOIN affiliate_programs ap ON ap.slug = pap.program_slug
       WHERE pap.route = ? AND pap.page_slug = ? AND ap.is_active = 1
       ORDER BY pap.rank ASC`,
    )
    .all(route, pageSlug) as PageProgram[];
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
export function getCommercialLinks(slug: string): LinkGroup[] {
  const edges = cdb()
    .prepare(
      "SELECT target_slug, target_route, edge_type FROM commercial_links WHERE source_slug = ?",
    )
    .all(slug) as { target_slug: string; target_route: string | null; edge_type: string }[];

  const groups = new Map<string, { label: string; href: string }[]>();
  for (const e of edges) {
    let href: string | null = null;
    let label: string | null = null;
    if (e.target_route === "secteurs") {
      href = `/secteurs/${e.target_slug}`;
      label = `Experts-comptables ${e.target_slug.replace(/-/g, " ")}`;
    } else {
      const target = getCommercialPageBySlug(e.target_slug);
      if (target) {
        href = target.url;
        label = target.label;
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
export function getPublishedCommercialPages(): { route: string; slug: string; url: string }[] {
  return cdb()
    .prepare(
      "SELECT route, slug, url FROM commercial_pages WHERE publish_status = 'published'",
    )
    .all() as { route: string; slug: string; url: string }[];
}

export function formatProgramType(p: AffiliateProgram): string {
  const parts: string[] = [];
  if (p.has_affiliate) parts.push("Affiliation");
  if (p.has_referral) parts.push("Parrainage");
  if (p.has_apporteur) parts.push("Apporteur");
  return parts.join(" · ") || p.program_type;
}
