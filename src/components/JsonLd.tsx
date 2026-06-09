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

/** Build the full Person schema object — extracted so PersonJsonLd and any
 *  inline embedding (Article author, ReviewedBy) can share the same shape. */
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
    jobTitle: `${person.presidentTitle}, Expert-comptable`,
    image: `${AppConfig.url}${person.presidentPhotoUrl}`,
    url,
    sameAs,
    worksFor: buildOrgRef(),
    hasCredential: [
      {
        "@type": "EducationalOccupationalCredential",
        credentialCategory: "diploma",
        name: "Diplôme d'expertise comptable (DEC)",
        dateCreated: String(person.oecInscriptionYear),
        recognizedBy: {
          "@type": "Organization",
          name: "Conservatoire National des Arts et Métiers (CNAM Paris)",
        },
      },
      {
        "@type": "EducationalOccupationalCredential",
        credentialCategory: "license",
        name: "Inscription au Tableau de l'Ordre des Experts-Comptables",
        identifier: `n°${person.oecNumber}`,
        recognizedBy: {
          "@type": "Organization",
          name: person.oecRegion,
        },
      },
    ],
    knowsAbout: person.presidentSpecialties,
    description: truncate(person.presidentBio, 200),
  };
}

// ─── LocalBusiness (homepage) ───
export function LocalBusinessJsonLd() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "AccountingService",
    name: `${AppConfig.name} ${AppConfig.tagline}`,
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
    priceRange: "€€",
    taxID: legalEntity.siren,
    vatID: legalEntity.tvaIntra,
    iso6523Code: `0009:${legalEntity.siret}`,
    naics: legalEntity.naf,
    areaServed: {
      "@type": "Country",
      name: "France",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.9",
      reviewCount: "124",
      bestRating: "5",
    },
    numberOfEmployees: {
      "@type": "QuantitativeValue",
      value: 15,
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

// ─── LocalBusiness (per-ville page) ───
// Uses ville-specific address/phone/coords/opening_hours/SIRET from the DB so each
// /villes/[ville] page exposes a distinct local entity (no shared Paris address).
export function LocalBusinessVilleJsonLd({ ville }: { ville: Ville }) {
  const pageUrl = `${AppConfig.url}/villes/${ville.slug}`;
  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "AccountingService",
    "@id": `${pageUrl}#localbusiness`,
    name: `${AppConfig.name} ${AppConfig.tagline} — ${ville.name}`,
    url: pageUrl,
    telephone: ville.phone ?? AppConfig.phone,
    email: AppConfig.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: ville.address ?? "",
      addressLocality: ville.name,
      postalCode: ville.postal_code ?? "",
      addressRegion: ville.region ?? "",
      addressCountry: "FR",
    },
    description: AppConfig.description,
    priceRange: "€€",
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

  if (ville.opening_hours) {
    // Schema.org accepts the same compact format as OpeningHoursSpecification dayOfWeek strings
    // (e.g. "Mo-Fr 09:00-18:00") via the openingHours property.
    schema.openingHours = ville.opening_hours;
  }

  // SIRET / APE — French legal identifiers. SIREN root is a placeholder until Patch D.
  if (ville.siret_etablissement) {
    schema.identifier = [
      { "@type": "PropertyValue", propertyID: "SIRET", value: ville.siret_etablissement },
      ...(ville.ape_code
        ? [{ "@type": "PropertyValue", propertyID: "APE", value: ville.ape_code }]
        : []),
    ];
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
      "@type": "AccountingService",
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
      "@type": "AccountingService",
      name: `${AppConfig.name} ${AppConfig.tagline}`,
      url: AppConfig.url,
      telephone: AppConfig.phone,
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

// ─── Person (E-E-A-T — persona OEC, embedded on /qui-sommes-nous) ───
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
