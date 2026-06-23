import { AppConfig } from "@/utils/AppConfig";
import { legalEntity } from "@/data/legal-entity";
import type { LegalEntity } from "@/data/legal-entity";
import type { Ville } from "@/libs/db/types";

// ─── Shared internal helpers (re-used across Person / Article / ReviewedBy) ───

/** Stable @id for the Organization node (matches LocalBusiness root if/when emitted). */
function buildOrgId(): string {
  return `${AppConfig.url}/#organization`;
}

/** Stable @id for the persona Person node — drives schema.org cross-references. */
function buildPersonId(person: LegalEntity): string {
  const slug = person.presidentLinkedinSlug || "person";
  return `${AppConfig.url}/qui-sommes-nous#person-${slug}`;
}

/** Bare @id reference to the Organization node — for nesting in author/publisher slots. */
function buildOrgRef(): { "@id": string } {
  return { "@id": buildOrgId() };
}

/** Bare @id reference to the persona Person node — for nesting in author/reviewedBy slots. */
function buildPersonRef(person: LegalEntity): { "@id": string } {
  return { "@id": buildPersonId(person) };
}

/** Truncate a string to maxLen characters at a word boundary, appending "…" if cut. */
function truncate(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text;
  const slice = text.slice(0, maxLen);
  const lastSpace = slice.lastIndexOf(" ");
  const cut = lastSpace > 0 ? slice.slice(0, lastSpace) : slice;
  return `${cut}…`;
}

/** Build the editorial Person schema object used by Article author/reviewer slots. */
function buildPersonObject(
  person: LegalEntity,
  url: string,
): Record<string, unknown> {
  const sameAs: string[] = [];
  if (person.presidentLinkedinSlug) {
    sameAs.push(
      `https://www.linkedin.com/in/${person.presidentLinkedinSlug}`,
    );
  }

  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": buildPersonId(person),
    name: person.presidentName,
    givenName: person.presidentFirstName,
    familyName: person.presidentLastName,
    jobTitle: person.presidentTitle,
    ...(person.presidentPhotoUrl && { image: `${AppConfig.url}${person.presidentPhotoUrl}` }),
    url,
    sameAs,
    worksFor: buildOrgRef(),
    knowsAbout: person.presidentSpecialties,
    description: truncate(person.presidentBio, 200),
  };
}

// ─── Organization (publisher of the WebSite) ───
export function OrganizationJsonLd() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": buildOrgId(),
    name: AppConfig.name,
    legalName: legalEntity.companyName,
    url: AppConfig.url,
    telephone: legalEntity.phoneSiege,
    email: legalEntity.emailContact,
    address: {
      "@type": "PostalAddress",
      streetAddress: legalEntity.addressStreet,
      addressLocality: legalEntity.addressCity,
      postalCode: legalEntity.addressPostalCode,
      addressCountry: "FR",
    },
    foundingDate: String(legalEntity.creationYear),
    description: AppConfig.description,
    taxID: legalEntity.siren,
    vatID: legalEntity.tvaIntra,
    iso6523Code: `0009:${legalEntity.siret}`,
    areaServed: {
      "@type": "Country",
      name: "France",
    },
    sameAs: [],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// ─── WebSite + SearchAction (homepage, declares the search entrypoint) ───
// Helps Google surface the Sitelinks Search Box for branded queries.
export function WebSiteJsonLd({
  searchPath = "/annuaire/experts-comptables",
}: {
  searchPath?: string;
} = {}) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${AppConfig.url}/#website`,
    url: AppConfig.url,
    name: AppConfig.name,
    description: AppConfig.description,
    inLanguage: AppConfig.locale,
    publisher: buildOrgRef(),
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${AppConfig.url}${searchPath}?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// ─── ItemList (directory listings: annuaire, city directory, …) ───
// Drives rich snippets ("results in a list") for ranked directory pages.
interface ItemListEntry {
  name: string;
  url: string;
}

export function ItemListJsonLd({
  name,
  description,
  items,
  numberOfItems,
  url,
  ordered = false,
}: {
  name: string;
  description?: string;
  items: ItemListEntry[];
  /** Total count when the list is paginated/truncated (defaults to items.length). */
  numberOfItems?: number;
  url?: string;
  /** Set true when the position reflects a real ranking (score-based). */
  ordered?: boolean;
}) {
  if (items.length === 0) return null;
  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name,
    numberOfItems: numberOfItems ?? items.length,
    itemListOrder: ordered
      ? "https://schema.org/ItemListOrderDescending"
      : "https://schema.org/ItemListUnordered",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      url: item.url.startsWith("http") ? item.url : `${AppConfig.url}${item.url}`,
    })),
  };
  if (description) schema.description = description;
  if (url) {
    schema.url = url.startsWith("http") ? url : `${AppConfig.url}${url}`;
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// ─── City comparison page ───
export function LocalBusinessVilleJsonLd({ ville }: { ville: Ville }) {
  const pageUrl = `${AppConfig.url}/villes/${ville.slug}`;
  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${pageUrl}#collection`,
    name: `Comparateur de professionnels comptables à ${ville.name}`,
    url: pageUrl,
    description: AppConfig.description,
    publisher: buildOrgRef(),
    areaServed: {
      "@type": "City",
      name: ville.name,
    },
  };

  if (ville.latitude != null && ville.longitude != null) {
    schema.geo = {
      "@type": "GeoCoordinates",
      latitude: ville.latitude,
      longitude: ville.longitude,
    };
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// ─── Breadcrumbs ───
export function BreadcrumbJsonLd({
  items,
}: {
  items: { name: string; url: string }[];
}) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: `${AppConfig.url}${item.url}`,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// ─── FAQ ───
// Supports two shapes for backward compat:
//   - legacy: { question, answer }[]   (used by app/page.tsx + ClusterPage.tsx)
//   - new   : { q, a }[]               (spec P2b)
// Optional `id` lets multiple FAQ blocks coexist on the same page via @id suffix.
type FaqLegacyItem = { question: string; answer: string };
type FaqShortItem = { q: string; a: string };
type FaqItem = FaqLegacyItem | FaqShortItem;

interface FaqJsonLdProps {
  items: FaqItem[];
  id?: string;
}

function normalizeFaqItem(item: FaqItem): { name: string; text: string } {
  if ("question" in item) {
    return { name: item.question, text: item.answer };
  }
  return { name: item.q, text: item.a };
}

export function FaqJsonLd({ items, id }: FaqJsonLdProps) {
  if (items.length === 0) return null;
  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => {
      const normalized = normalizeFaqItem(item);
      return {
        "@type": "Question",
        name: normalized.name,
        acceptedAnswer: {
          "@type": "Answer",
          text: normalized.text,
        },
      };
    }),
  };

  if (id) {
    schema["@id"] = `${AppConfig.url}#faq-${id}`;
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// ─── Service (for /expertises/[service] pages) ───
export function ServiceJsonLd({
  name,
  description,
  url,
  category,
}: {
  name: string;
  description: string;
  url: string;
  category?: string;
}) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name,
    description,
    url: `${AppConfig.url}${url}`,
    provider: {
      "@type": "Organization",
      name: `${AppConfig.name} ${AppConfig.tagline}`,
      url: AppConfig.url,
    },
    areaServed: {
      "@type": "Country",
      name: "France",
    },
    ...(category && { category }),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// ─── ProfessionalService (for cross-dimension pages) ───
export function ProfessionalServiceJsonLd({
  name,
  description,
  url,
  serviceType,
  audience,
  areaServed,
}: {
  name: string;
  description: string;
  url: string;
  serviceType: string;
  audience?: string;
  areaServed?: string;
}) {
  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name,
    description,
    url: `${AppConfig.url}${url}`,
    provider: {
      "@type": "Organization",
      name: `${AppConfig.name} ${AppConfig.tagline}`,
      url: AppConfig.url,
    },
    serviceType,
  };

  if (audience) {
    schema.audience = {
      "@type": "Audience",
      audienceType: audience,
    };
  }

  if (areaServed) {
    schema.areaServed = { "@type": "City", name: areaServed };
  } else {
    schema.areaServed = { "@type": "Country", name: "France" };
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// ─── HowTo (for process steps / guides) ───
export function HowToJsonLd({
  name,
  description,
  steps,
}: {
  name: string;
  description: string;
  steps: { name: string; text: string }[];
}) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name,
    description,
    step: steps.map((step, i) => ({
      "@type": "HowToStep",
      position: i + 1,
      name: step.name,
      text: step.text,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// ─── WebPage with speakable (for featured snippets) ───
export function WebPageJsonLd({
  name,
  description,
  url,
  dateModified,
}: {
  name: string;
  description: string;
  url: string;
  dateModified?: string;
}) {
  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name,
    description,
    url: `${AppConfig.url}${url}`,
    isPartOf: {
      "@type": "WebSite",
      name: `${AppConfig.name} ${AppConfig.tagline}`,
      url: AppConfig.url,
    },
    speakable: {
      "@type": "SpeakableSpecification",
      cssSelector: ["h1", "[data-speakable]"],
    },
    ...(dateModified && { dateModified }),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// ─── Editorial person ───
interface PersonJsonLdProps {
  person?: LegalEntity;
  url?: string;
}

export function PersonJsonLd({
  person = legalEntity,
  url,
}: PersonJsonLdProps) {
  const personUrl = url ?? `${AppConfig.url}/qui-sommes-nous`;
  const schema = buildPersonObject(person, personUrl);

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// ─── Article (for wired DB pages with author + reviewedBy) ───
interface ArticleJsonLdProps {
  headline: string;
  datePublished: string;
  dateModified: string;
  mainEntityOfPage: string;
  description?: string;
  author?: LegalEntity;
  reviewedBy?: LegalEntity;
  image?: string;
  articleSection?: string;
}

export function ArticleJsonLd({
  headline,
  datePublished,
  dateModified,
  mainEntityOfPage,
  description,
  author = legalEntity,
  reviewedBy = legalEntity,
  image,
  articleSection,
}: ArticleJsonLdProps) {
  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline,
    datePublished,
    dateModified,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": mainEntityOfPage,
    },
    author: buildPersonRef(author),
    reviewedBy: buildPersonRef(reviewedBy),
    publisher: buildOrgRef(),
  };

  if (description) schema.description = description;
  if (image) schema.image = image;
  if (articleSection) schema.articleSection = articleSection;

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// ─── ReviewedBy (standalone Person node — for non-Article pages that need a
// reviewer reference, e.g. ProfessionalService / LocalBusiness ville pages). ───
// Emits the full Person schema (with @id) so other inline schemas on the same
// page can simply reference { "@id": buildPersonId(...) } via reviewedBy.
interface ReviewedByJsonLdProps {
  reviewer?: LegalEntity;
}

export function ReviewedByJsonLd({
  reviewer = legalEntity,
}: ReviewedByJsonLdProps) {
  const reviewerUrl = `${AppConfig.url}/qui-sommes-nous`;
  const schema = buildPersonObject(reviewer, reviewerUrl);

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// ─── OfferCatalog (for pricing pages) ───
export function OfferCatalogJsonLd({
  name,
  description,
  offers,
}: {
  name: string;
  description: string;
  offers: { name: string; price: string; description: string }[];
}) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "OfferCatalog",
    name,
    description,
    itemListElement: offers.map((offer) => ({
      "@type": "Offer",
      name: offer.name,
      description: offer.description,
      price: offer.price,
      priceCurrency: "EUR",
      priceSpecification: {
        "@type": "UnitPriceSpecification",
        price: offer.price,
        priceCurrency: "EUR",
        billingDuration: "P1M",
        unitText: "MON",
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
