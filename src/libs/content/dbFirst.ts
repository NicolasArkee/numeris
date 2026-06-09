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
  /** seo_overrides.key_takeaways (JSON string[]) parsé, sinon undefined. */
  keyTakeaways: string[] | undefined;
  /** true si une section Faq est rendue inline par DynamicSection — la FAQ
   *  built-in de ClusterPage doit alors être désactivée (pas de doublon). */
  inlineFaq: boolean;
  /** Première section Hero/ContentSection — source d'intro de secours. */
  heroSection: PageSection | undefined;
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

export function getDbPageBundle(route: string, slug: string): DbPageBundle {
  const sections = db.getPageSections(route, slug);
  const seo = db.getSeoOverride(route, slug);
  const meta = db.getPageMeta(route, slug);
  return {
    sections,
    seo,
    meta,
    hasDbContent: sections.length > 0,
    lastUpdatedDate: meta?.reviewed_at,
    keyTakeaways: parseTakeaways(seo?.key_takeaways ?? null),
    inlineFaq: sections.some((s) => s.section_type === "Faq"),
    heroSection: sections.find(
      (s) => s.section_type === "Hero" || s.section_type === "ContentSection",
    ),
  };
}
