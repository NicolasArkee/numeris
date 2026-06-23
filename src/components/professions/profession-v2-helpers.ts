import type { LinkGroup, Profession, ProfessionCategory, Service } from "@/libs/db";

export type ProfessionMatrixInsight = {
  family: string;
  profession: string;
  specifics: string[];
  painPoints: string[];
  proposedAssets: string[];
  format: string;
  priority: string;
  urgency: number;
  complexity: number;
  leadPotential: number;
  score: number;
  offer: string;
  sources: { label: string; href: string }[];
};

export type ProfessionResourceLink = {
  label: string;
  href: string;
  description: string;
  tone?: "primary" | "default";
};

export type ProfessionSidebarData = {
  insight: ProfessionMatrixInsight;
  resourceLinks: ProfessionResourceLink[];
  missingData: string[];
  siblingLinks: { label: string; href: string }[];
};

const FAQ_SECTION_TYPES = new Set(["Faq", "FAQSection_PAA"]);

export function dedupeProfessionRenderableSections<T extends { section_type: string }>(
  sections: T[],
): T[] {
  let hasRenderedFaq = false;
  return sections.filter((section) => {
    if (!FAQ_SECTION_TYPES.has(section.section_type)) return true;
    if (hasRenderedFaq) return false;
    hasRenderedFaq = true;
    return true;
  });
}

const MATRIX_INSIGHTS: Record<string, ProfessionMatrixInsight> = {
  "epiceries-fines": {
    family: "Métiers de bouche",
    profession: "Épiceries fines",
    specifics: [
      "BIC commerce",
      "multi-taux TVA",
      "lots et DLC",
      "import éventuel",
      "stock premium à rotation lente",
      "caisse magasin/e-commerce",
    ],
    painPoints: [
      "BFR stock",
      "casse/DLC",
      "marge par fournisseur",
      "gestion coffrets",
      "TVA sur paniers composés",
    ],
    proposedAssets: [
      "Tableau d'âge de stock",
      "Calculateur marge coffret",
      "Article panier gourmand et TVA",
    ],
    format: "Tableau stock + article",
    priority: "P2",
    urgency: 4,
    complexity: 4,
    leadPotential: 3,
    score: 3.65,
    offer: "Comptabilité + conseil en gestion",
    sources: [
      {
        label: "BOFiP - taux de TVA produits alimentaires",
        href: "https://bofip.impots.gouv.fr/bofip/2033-PGP.html/identifiant=BOI-TVA-LIQ-30-10-10-20240207",
      },
      {
        label: "Service Public - franchise en base de TVA",
        href: "https://entreprendre.service-public.fr/vosdroits/F21746",
      },
    ],
  },
};

function splitSentences(value: string | null | undefined): string[] {
  if (!value) return [];
  return value
    .split(/[.;]/u)
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 6);
}

export function getProfessionMatrixInsight(
  profession: Profession,
  category?: ProfessionCategory,
): ProfessionMatrixInsight {
  const known = MATRIX_INSIGHTS[profession.slug];
  if (known) return known;

  const specifics = splitSentences(profession.obligations)
    .concat(splitSentences(profession.description))
    .slice(0, 6);

  return {
    family: category?.name ?? "Professions",
    profession: profession.name,
    specifics: specifics.length > 0 ? specifics : ["obligations comptables", "déclarations fiscales", "pilotage de trésorerie"],
    painPoints: [
      "échéances déclaratives",
      "suivi des charges",
      "marge et trésorerie",
      "organisation des justificatifs",
    ],
    proposedAssets: [
      "Diagnostic comptable métier",
      "Check-list des pièces à préparer",
      "Tableau de bord mensuel",
    ],
    format: "Diagnostic + check-list",
    priority: profession.volume >= 1000 ? "P1" : "P2",
    urgency: profession.volume >= 1000 ? 4 : 3,
    complexity: 3,
    leadPotential: profession.volume >= 1000 ? 4 : 3,
    score: profession.volume >= 1000 ? 4 : 3.25,
    offer: "Comptabilité + fiscalité + conseil en gestion",
    sources: [],
  };
}

function serviceBySlug(services: Service[], slug: string): Service | undefined {
  return services.find((service) => service.slug === slug);
}

function resourceDescriptionForService(slug: string): string {
  const descriptions: Record<string, string> = {
    comptabilite: "Fiabiliser la caisse, les achats, les stocks et les déclarations périodiques.",
    fiscalite: "Sécuriser les régimes, la TVA et les arbitrages fiscaux de l'activité.",
    social: "Cadrer la paie, les embauches et les obligations sociales du commerce.",
    "creation-entreprise": "Choisir le statut, le régime fiscal et le niveau de protection adapté.",
    "conseil-gestion": "Piloter marge, trésorerie, stock et rentabilité par famille de produits.",
    audit: "Contrôler les procédures, les flux et les zones de risque avant clôture.",
  };
  return descriptions[slug] ?? "Approfondir ce besoin avec une ressource dédiée.";
}

function buildOfferLinks(
  profession: Profession,
  services: Service[],
  insight: ProfessionMatrixInsight,
): ProfessionResourceLink[] {
  const offer = insight.offer.toLowerCase();
  const preferredSlugs = [
    offer.includes("compt") ? "comptabilite" : "",
    offer.includes("fiscal") ? "fiscalite" : "",
    offer.includes("social") ? "social" : "",
    offer.includes("création") || offer.includes("creation") ? "creation-entreprise" : "",
    offer.includes("gestion") ? "conseil-gestion" : "",
    offer.includes("audit") ? "audit" : "",
  ].filter(Boolean);

  return preferredSlugs
    .map((slug) => serviceBySlug(services, slug))
    .filter((service): service is Service => Boolean(service))
    .map((service, index) => ({
      label: `${service.title} pour ${profession.name}`,
      href: `/expertises/${service.slug}/${profession.slug}`,
      description: resourceDescriptionForService(service.slug),
      tone: index === 0 ? "primary" : "default",
    }));
}

export function buildProfessionSidebarData({
  profession,
  category,
  services,
  siblingProfessions,
  linkGroups,
}: {
  profession: Profession;
  category?: ProfessionCategory;
  services: Service[];
  siblingProfessions: Profession[];
  linkGroups: LinkGroup[];
}): ProfessionSidebarData {
  const insight = getProfessionMatrixInsight(profession, category);
  const offerLinks = buildOfferLinks(profession, services, insight);
  const fallbackService = serviceBySlug(services, "comptabilite");
  const resourceLinks: ProfessionResourceLink[] = [
    ...offerLinks,
    ...(offerLinks.length === 0 && fallbackService
        ? [{
          label: `${fallbackService.title} pour ${profession.name}`,
          href: `/expertises/${fallbackService.slug}/${profession.slug}`,
          description: resourceDescriptionForService(fallbackService.slug),
          tone: "primary" as const,
        }]
      : []),
    {
      label: `Diagnostic ${profession.name.toLowerCase()}`,
      href: `/contact?profession=${profession.slug}`,
      description: "Préparer le rendez-vous avec vos volumes, outils, échéances et points de blocage.",
      tone: "primary",
    },
    {
      label: "Simuler le bon statut",
      href: "/simulateurs/statuts",
      description: "Comparer micro, réel, société et impacts sociaux/fiscaux.",
    },
  ];

  const missingData = profession.slug === "epiceries-fines"
    ? [
        "Export caisse par taux de TVA",
        "Âge de stock par lot et date limite",
        "Marge brute par fournisseur",
        "Détail des coffrets et paniers composés",
        "Séparation ventes magasin / e-commerce",
      ]
    : [
        "Volume de pièces mensuel",
        "Régime fiscal et TVA",
        "Outils caisse/facturation",
        "Dernier bilan ou prévisionnel",
      ];

  const taxonomyLinks = linkGroups
    .flatMap((group) => group.links)
    .filter((link) => link.href.includes("/expertises/") || link.href.includes("/professions/"))
    .slice(0, 4)
    .map((link) => ({ label: link.label, href: link.href }));

  const siblingLinks = siblingProfessions
    .slice(0, 4)
    .map((item) => ({ label: item.name, href: `/professions/${item.slug}` }));

  return {
    insight,
    resourceLinks,
    missingData,
    siblingLinks: siblingLinks.length > 0 ? siblingLinks : taxonomyLinks,
  };
}
