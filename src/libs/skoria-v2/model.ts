import type { PageMeta, PageSection, PublishStatus } from "@/libs/db";
import { diagnosePagePublication } from "./publication";

const FAQ_SECTION_TYPES = new Set(["Faq", "FAQSection_PAA"]);

/** Public content has one explicit state. Missing metadata is private by default. */
export function isPublishedStatus(
  status: PublishStatus | string | null | undefined,
): status is "published" {
  return status === "published";
}

export function isPublicPageMeta(meta: PageMeta | null | undefined): boolean {
  return diagnosePagePublication({ meta }).isPublic;
}

export function isPublicCommercialPage(page: {
  publish_status?: string | null;
} | null | undefined): boolean {
  return isPublishedStatus(page?.publish_status);
}

function cleanKeyPart(value: string): string {
  return value.trim().replace(/^\/+|\/+$/g, "");
}

export type ExpertiseDimension = "secteur" | "profession" | "ville";

/** Matches the composite key written by the expertise content pipelines. */
export function buildExpertiseContentKey(
  serviceSlug: string,
  dimension: ExpertiseDimension,
  dimensionSlug: string,
): string {
  return `${cleanKeyPart(serviceSlug)}__${dimension}__${cleanKeyPart(dimensionSlug)}`;
}

/** Matches `guides-<pillar>-<subhub>-<leaf>` keys stored in page content. */
export function buildGuideContentKey(segments: readonly string[]): string {
  const parts = segments.map(cleanKeyPart).filter(Boolean);
  return ["guides", ...parts].join("-");
}

/** A TOC item may arrive as `#section`; rendered hrefs require the bare id. */
export function normalizeAnchorId(value: string): string {
  return value
    .trim()
    .replace(/^#+/, "")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-zA-Z0-9\-_:.]/g, "")
    .replace(/^-+|-+$/g, "");
}

/**
 * Keep only one inline FAQ block. Historical imports emitted both `Faq` and
 * `FAQSection_PAA` for the same page, which caused duplicate copy and JSON-LD.
 */
export function dedupeFaqSections<T extends Pick<PageSection, "section_type">>(
  sections: readonly T[],
): T[] {
  let hasFaq = false;
  return sections.filter((section) => {
    if (!FAQ_SECTION_TYPES.has(section.section_type)) return true;
    if (hasFaq) return false;
    hasFaq = true;
    return true;
  });
}

export function hasInlineFaq(
  sections: readonly Pick<PageSection, "section_type">[],
): boolean {
  return sections.some((section) => FAQ_SECTION_TYPES.has(section.section_type));
}

export function expertiseContentKey(
  serviceSlug: string,
  dimensionType: ExpertiseDimension,
  dimensionSlug: string,
): string {
  return buildExpertiseContentKey(serviceSlug, dimensionType, dimensionSlug);
}

export function guideContentKey(segments: readonly string[]): string {
  return buildGuideContentKey(segments);
}

export function canonicalPath(path: string): string {
  const withoutQuery = path.split(/[?#]/, 1)[0] || "/";
  if (withoutQuery === "/") return "/";
  return `/${withoutQuery.split("/").filter(Boolean).join("/")}`;
}
