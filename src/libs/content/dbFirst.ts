// ─── Chemin DB-first partagé par les templates pSEO ───
// Factorise le boilerplate répété dans chaque page template :
// lecture page_sections + seo_overrides + page_meta et dérivés usuels.
// Référence du pattern : src/app/ressources/[theme]/page.tsx.

import { db } from "@/libs/db";
import type { PageSection, PageMeta, SeoOverride } from "@/libs/db";

export interface DbPageBundle {
  sections: PageSection[];
  seo: SeoOverride | null;
  meta: PageMeta | null;
  hasDbContent: boolean;
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

const FAQ_TYPES = new Set(["Faq", "FAQSection_PAA"]);

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

export function getDbPageBundle(route: string, slug: string): DbPageBundle {
  const sections = db.getPageSections(route, slug);
  const seo = db.getSeoOverride(route, slug);
  const meta = db.getPageMeta(route, slug);

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
    hasDbContent: sections.length > 0,
    lastUpdatedDate: meta?.reviewed_at,
    keyTakeaways,
    inlineFaq: sections.some((s) => FAQ_TYPES.has(s.section_type)),
    heroSection: sections.find(
      (s) => s.section_type === "Hero" || s.section_type === "ContentSection",
    ),
    renderableSections,
  };
}
