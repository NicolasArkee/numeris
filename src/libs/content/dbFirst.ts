// ─── Chemin DB-first partagé par les templates pSEO ───
// Factorise le boilerplate répété dans chaque page template :
// lecture page_sections + seo_overrides + page_meta et dérivés usuels.
// Référence du pattern : src/app/ressources/[theme]/page.tsx.

import { db } from "@/libs/db";
import type { PageSection, PageMeta, SeoOverride } from "@/libs/db";
import {
  dedupeFaqSections,
  hasInlineFaq,
} from "@/libs/skoria-v2/model";
import {
  diagnosePagePublication,
  type PublicationDiagnostic,
} from "@/libs/skoria-v2/publication";
import { normalizeDbMetaTitle } from "@/libs/content/meta-title";
import {
  sanitizeLegacyPublicJsonText,
  sanitizeLegacyPublicText,
} from "@/libs/skoria-v2/content-safety";

export interface DbPagePublication {
  publishedAt: string | undefined;
  reviewedAt: string;
  authorPersonaId: string;
  reviewedBy: string;
}

export interface DbPageBundle {
  sections: PageSection[];
  seo: SeoOverride | null;
  meta: PageMeta | null;
  /** Publication is fail-closed: missing metadata and every non-published
   *  status produce an empty public bundle. */
  isPublished: boolean;
  hasDbContent: boolean;
  /** Contract result used by the public gate. Legacy gaps are warnings;
   * newer V2 gaps are blockers. */
  publicationDiagnostic: PublicationDiagnostic;
  /** Exact publication provenance stored in page_meta. */
  publication: DbPagePublication | undefined;
  /** page_meta.reviewed_at (ISO 8601) — alimente LastUpdated + Article dates. */
  lastUpdatedDate: string | undefined;
  /** seo_overrides.key_takeaways (JSON string[]) parsé ; fallback : items de
   *  la première section KeyTakeaways (le shell les rend en haut de page). */
  keyTakeaways: string[] | undefined;
  /** true si une section Faq/FAQSection_PAA est rendue inline par
   *  DynamicSection — la FAQ built-in de ClusterPage doit alors être
   *  désactivée (pas de doublon). */
  inlineFaq: boolean;
  /** Première section Hero/ContentSection — source d'intro de secours. */
  heroSection: PageSection | undefined;
  /** Sections à rendre en children de ClusterPage : tout SAUF le premier
   *  Hero (déjà consommé par le bandeau h1/intro) et les KeyTakeaways
   *  (déjà rendus par le shell en haut de page). Les Hero suivants restent
   *  rendus (DynamicSection les traite en bloc intro highlighted). */
  renderableSections: PageSection[];
}

export function parseTakeaways(raw: string | null): string[] | undefined {
  if (!raw) return undefined;
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (Array.isArray(parsed)) {
      return parsed.filter((x): x is string => typeof x === "string");
    }
  } catch {
    // fall through
  }
  return undefined;
}

export function buildPublicDbPageBundle(
  rawSections: readonly PageSection[],
  rawSeo: SeoOverride | null,
  meta: PageMeta | null,
): DbPageBundle {
  // The public read path is deliberately fail-closed. Draft/review/archived
  // rows may exist in Supabase for editorial work, but cannot replace the
  // static fallback or leak their SEO metadata on a direct URL.
  const publicationDiagnostic = diagnosePagePublication({
    meta,
    sections: rawSections,
    seo: rawSeo,
  });
  const isPublished = publicationDiagnostic.isPublic;
  const sections = isPublished
    ? dedupeFaqSections(rawSections).map((section) => ({
        ...section,
        title: section.title ? sanitizeLegacyPublicText(section.title) : null,
        body: section.body ? sanitizeLegacyPublicText(section.body) : null,
        items: sanitizeLegacyPublicJsonText(section.items),
        citations: sanitizeLegacyPublicJsonText(section.citations),
      }))
    : [];
  const seo = isPublished && rawSeo
    ? { ...rawSeo, meta_title: normalizeDbMetaTitle(rawSeo.meta_title) }
    : null;
  const publication = isPublished && meta
    ? {
        publishedAt: meta.published_at ?? undefined,
        reviewedAt: meta.reviewed_at,
        authorPersonaId: meta.author_persona_id,
        reviewedBy: meta.reviewed_by,
      }
    : undefined;

  // Takeaways : seo_overrides prioritaire, sinon items de la première
  // section KeyTakeaways (string[] JSON-encodé).
  let keyTakeaways = parseTakeaways(seo?.key_takeaways ?? null);
  if (!keyTakeaways) {
    const ktSection = sections.find((s) => s.section_type === "KeyTakeaways");
    keyTakeaways = parseTakeaways(ktSection?.items ?? null);
  }

  const firstHeroId = sections.find((s) => s.section_type === "Hero")?.id;
  const renderableSections = sections.filter(
    (s) => s.id !== firstHeroId && s.section_type !== "KeyTakeaways",
  );

  return {
    sections,
    seo,
    meta,
    isPublished,
    hasDbContent: sections.length > 0,
    publicationDiagnostic,
    publication,
    lastUpdatedDate: publication?.reviewedAt,
    keyTakeaways,
    inlineFaq: hasInlineFaq(sections),
    heroSection: sections.find(
      (s) => s.section_type === "Hero" || s.section_type === "ContentSection",
    ),
    renderableSections,
  };
}

export async function getDbPageBundle(route: string, slug: string): Promise<DbPageBundle> {
  try {
    const [rawSections, rawSeo, meta] = await Promise.all([
      db.getPageSections(route, slug),
      db.getSeoOverride(route, slug),
      db.getPageMeta(route, slug),
    ]);
    return buildPublicDbPageBundle(rawSections, rawSeo, meta);
  } catch {
    // Les familles qui disposent d'un contenu de référence dans le dépôt
    // restent consultables pendant une indisponibilité du CMS. Aucun contenu
    // DB n'est alors supposé publié : le repli conserve donc le fail-closed.
    return buildPublicDbPageBundle([], null, null);
  }
}
