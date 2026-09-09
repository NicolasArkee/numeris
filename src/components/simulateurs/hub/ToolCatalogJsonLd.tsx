import { AppConfig } from "@/utils/AppConfig";

interface ToolCatalogSchemaInput {
  name: string;
  description: string;
  image: string;
  items: { name: string; url: string }[];
  breadcrumbs: { name: string; url: string }[];
  faqs: { question: string; answer: string }[];
}

/** Positions follow the visible catalogue. They do not rank tool quality. */
export function buildToolCatalogSchema(input: ToolCatalogSchemaInput) {
  const origin = AppConfig.url.replace(/\/$/, "");
  const url = `${origin}/simulateurs`;
  const pageId = `${url}#webpage`;
  const listId = `${url}#catalogue`;
  const breadcrumbId = `${url}#breadcrumb`;
  const faqId = `${url}#questions`;
  const orgId = `${origin}/#organization`;
  const websiteId = `${origin}/#website`;
  const absoluteUrl = (path: string) => new URL(path, `${origin}/`).href;

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
        "@type": "CollectionPage",
        "@id": pageId,
        url,
        name: input.name,
        description: input.description,
        inLanguage: "fr-FR",
        isPartOf: { "@id": websiteId },
        publisher: { "@id": orgId },
        breadcrumb: { "@id": breadcrumbId },
        mainEntity: { "@id": listId },
        image: absoluteUrl(input.image),
        ...(input.faqs.length ? { hasPart: { "@id": faqId } } : {}),
      },
      {
        "@type": "ItemList",
        "@id": listId,
        url: `${url}#catalogue`,
        name: "Catalogue des simulateurs et calculateurs Skoria",
        numberOfItems: input.items.length,
        itemListOrder: "https://schema.org/ItemListUnordered",
        mainEntityOfPage: { "@id": pageId },
        itemListElement: input.items.map((item, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: item.name,
          item: absoluteUrl(item.url),
        })),
      },
      {
        "@type": "BreadcrumbList",
        "@id": breadcrumbId,
        itemListElement: input.breadcrumbs.map((item, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: item.name,
          item: absoluteUrl(item.url),
        })),
      },
      ...(input.faqs.length ? [{
        "@type": "FAQPage",
        "@id": faqId,
        url: `${url}#questions`,
        inLanguage: "fr-FR",
        isPartOf: { "@id": pageId },
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

export function ToolCatalogJsonLd(input: ToolCatalogSchemaInput) {
  const json = JSON.stringify(buildToolCatalogSchema(input)).replace(/</g, "\\u003c");
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}
