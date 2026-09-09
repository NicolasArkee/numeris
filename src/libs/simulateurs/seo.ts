import toolContent from "@/data/skoria-v2/tools-seo.json";
import { AppConfig } from "@/utils/AppConfig";

export interface ToolSeoContent {
  title: string;
  h1: string;
  description: string;
  toolHeading: string;
  inputs: string[];
  outputs: string[];
  methodIntro: string;
  relatedSlugs: string[];
}

export function getToolSeo(slug: string): ToolSeoContent {
  const content = (toolContent as Record<string, ToolSeoContent>)[slug];
  if (!content) throw new Error(`Missing tool SEO content: ${slug}`);
  return content;
}

interface ToolSchemaInput {
  slug: string;
  name: string;
  pageTitle: string;
  description: string;
  image: string;
  features: string[];
  faqs: { question: string; answer: string }[];
}

/** The calculator is the page's primary entity. The visible FAQ remains a
 * separate, identified part of the page, never a second primary page.
 * No review, rating, software version or release date is inferred from the CMS.
 */
export function buildToolSchema(input: ToolSchemaInput) {
  const origin = AppConfig.url.replace(/\/$/, "");
  const url = `${origin}/simulateurs/${input.slug}`;
  const pageId = `${url}#webpage`;
  const appId = `${url}#outil`;
  const faqId = `${url}#faq`;
  const breadcrumbId = `${url}#breadcrumb`;
  const orgId = `${origin}/#organization`;
  const websiteId = `${origin}/#website`;
  const image = new URL(input.image, `${origin}/`).href;
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": orgId,
        name: AppConfig.name,
        url: origin,
      },
      {
        "@type": "WebSite",
        "@id": websiteId,
        name: AppConfig.name,
        url: origin,
        inLanguage: "fr-FR",
        publisher: { "@id": orgId },
      },
      {
        "@type": "WebPage",
        "@id": pageId,
        url,
        name: input.pageTitle,
        description: input.description,
        inLanguage: "fr-FR",
        isPartOf: { "@id": websiteId },
        publisher: { "@id": orgId },
        breadcrumb: { "@id": breadcrumbId },
        mainEntity: { "@id": appId },
        image,
        ...(input.faqs.length ? { hasPart: { "@id": faqId } } : {}),
      },
      {
        "@type": "WebApplication",
        "@id": appId,
        name: input.name,
        url: `${url}#outil`,
        description: input.description,
        applicationCategory: input.slug === "jours-ouvres" ? "UtilitiesApplication" : "FinanceApplication",
        applicationSubCategory: "Simulateur et calculateur en ligne",
        operatingSystem: "Any",
        browserRequirements: "JavaScript activé dans un navigateur moderne.",
        inLanguage: "fr-FR",
        isAccessibleForFree: true,
        offers: { "@type": "Offer", price: 0, priceCurrency: "EUR", url: `${url}#outil` },
        featureList: input.features,
        image,
        publisher: { "@id": orgId },
        mainEntityOfPage: { "@id": pageId },
      },
      {
        "@type": "BreadcrumbList",
        "@id": breadcrumbId,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Accueil", item: `${origin}/` },
          { "@type": "ListItem", position: 2, name: "Simulateurs", item: `${origin}/simulateurs` },
          { "@type": "ListItem", position: 3, name: input.name, item: url },
        ],
      },
      ...(input.faqs.length ? [{
        "@type": "FAQPage",
        "@id": faqId,
        url: `${url}#faq`,
        isPartOf: { "@id": pageId },
        inLanguage: "fr-FR",
        mainEntity: input.faqs.map((faq, index) => ({
          "@type": "Question",
          "@id": `${url}#question-${index + 1}`,
          name: faq.question,
          acceptedAnswer: { "@type": "Answer", text: faq.answer },
        })),
      }] : []),
    ],
  };
}

/** Avoid closing an inline script when any future CMS text contains HTML. */
export function serializeToolSchema(schema: ReturnType<typeof buildToolSchema>) {
  return JSON.stringify(schema).replace(/</g, "\\u003c");
}
