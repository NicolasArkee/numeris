import { AppConfig } from "@/utils/AppConfig";

// ─── LocalBusiness (homepage) ───
export function LocalBusinessJsonLd() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "AccountingService",
    name: `${AppConfig.name} ${AppConfig.tagline}`,
    url: AppConfig.url,
    telephone: AppConfig.phone,
    email: AppConfig.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: "12 rue de Rivoli",
      addressLocality: "Paris",
      postalCode: "75001",
      addressCountry: "FR",
    },
    foundingDate: String(AppConfig.foundedYear),
    description: AppConfig.description,
    priceRange: "€€",
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
export function FaqJsonLd({
  items,
}: {
  items: { question: string; answer: string }[];
}) {
  if (items.length === 0) return null;
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
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
