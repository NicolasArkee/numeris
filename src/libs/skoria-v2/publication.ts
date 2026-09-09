import contentPolicy from "@/data/skoria-v2/content-policy.json";
import type { PageMeta, PageSection, SeoOverride } from "@/libs/db";
import { parseExtraJsonLd } from "@/libs/content/extra-json-ld";

export type ContentGeneration = "legacy" | "v2" | "unknown";

export interface PublicationDiagnostic {
  generation: ContentGeneration;
  isPublishedStatus: boolean;
  isPublic: boolean;
  blockers: string[];
  warnings: string[];
}

export interface PagePublicationInput {
  meta: PageMeta | null | undefined;
  sections?: readonly PageSection[];
  seo?: SeoOverride | null;
}

const LEGACY_PIPELINE_PATTERN = /^keyword-lp(?:-|$)/iu;
const requiredMetaFields = contentPolicy.databaseContract.page_meta.requiredForPublish;
const requiredSeoFields = contentPolicy.databaseContract.seo_overrides.requiredForPublish;

function hasValue(value: unknown): boolean {
  return typeof value === "string" ? value.trim().length > 0 : value !== null && value !== undefined;
}

export function classifyContentGeneration(meta: PageMeta | null | undefined): ContentGeneration {
  const pipeline = meta?.pipeline_run_id?.trim();
  if (!pipeline) return "unknown";
  return LEGACY_PIPELINE_PATTERN.test(pipeline) ? "legacy" : "v2";
}

function validatePublishedContract({ meta, sections, seo }: PagePublicationInput): string[] {
  if (!meta) return ["page_meta absent"];
  const issues: string[] = [];

  for (const field of requiredMetaFields) {
    if (!hasValue(meta[field as keyof PageMeta])) issues.push(`page_meta.${field} manquant`);
  }

  if (seo === null) {
    issues.push("seo_overrides absent");
  } else if (seo !== undefined) {
    for (const field of requiredSeoFields) {
      if (!hasValue(seo[field as keyof SeoOverride])) issues.push(`seo_overrides.${field} manquant`);
    }
    const jsonLd = parseExtraJsonLd(seo.json_ld_extra);
    if (seo.json_ld_extra && jsonLd.issues.length > 0) {
      issues.push(...jsonLd.issues.map((issue) => `seo_overrides.json_ld_extra ${issue}`));
    }
  }

  if (sections) {
    const orders = new Set<number>();
    let faqCount = 0;
    sections.forEach((section, index) => {
      const prefix = `page_sections[${index}]`;
      if (section.route !== meta.route || section.slug !== meta.slug) {
        issues.push(`${prefix} ne correspond pas à page_meta`);
      }
      if (!section.section_type.trim()) issues.push(`${prefix}.section_type manquant`);
      if (orders.has(section.section_order)) issues.push(`${prefix}.section_order dupliqué`);
      orders.add(section.section_order);
      if (section.section_type === "Faq" || section.section_type === "FAQSection_PAA") faqCount += 1;
      for (const field of ["items", "citations"] as const) {
        const raw = section[field];
        if (!raw) continue;
        try {
          JSON.parse(raw);
        } catch {
          issues.push(`${prefix}.${field} illisible`);
        }
      }
    });
    if (faqCount > 1) issues.push("plus d’une section FAQ est configurée");
  }

  return issues;
}

/**
 * Publication gate shared by the public rendering path.
 *
 * The 369 historical `keyword-lp-*` pages predate content hashes. Their gaps
 * remain visible as warnings while their explicit published state is honored.
 * Every newer pipeline is treated as V2 and must satisfy the current contract.
 */
export function diagnosePagePublication(input: PagePublicationInput): PublicationDiagnostic {
  const { meta } = input;
  const generation = classifyContentGeneration(meta);
  const isPublishedStatus = meta?.publish_status === contentPolicy.publication.publicStatus;
  if (!isPublishedStatus) {
    return {
      generation,
      isPublishedStatus: false,
      isPublic: false,
      blockers: [meta ? `publish_status=${meta.publish_status}` : "page_meta absent"],
      warnings: [],
    };
  }

  const contractIssues = validatePublishedContract(input);
  if (generation === "legacy") {
    return {
      generation,
      isPublishedStatus: true,
      isPublic: true,
      blockers: [],
      warnings: contractIssues,
    };
  }

  return {
    generation,
    isPublishedStatus: true,
    isPublic: contractIssues.length === 0,
    blockers: contractIssues,
    warnings: [],
  };
}
