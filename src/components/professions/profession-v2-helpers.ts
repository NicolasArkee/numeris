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
    .split(/[,.;]/u)
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 6);
}

function contextualPainPoints(profession: Profession): string[] {
  const context = `${profession.name} ${profession.description ?? ""} ${profession.obligations ?? ""}`.toLowerCase();
  const points = [
    "échéances et informations à transmettre",
    "répartition des responsabilités",
    "organisation des justificatifs",
  ];

  if (/stock|inventaire|mati[eè]re|marchandise|m[ée]dicament|cave|bois/u.test(context)) {
    points.push("inventaire et valorisation des stocks");
  } else if (/chantier|travaux|sous-trait|march[ée] public/u.test(context)) {
    points.push("suivi des dossiers et chantiers");
  } else if (/honoraire|bnc|lib[ée]ral|cabinet|consultant/u.test(context)) {
    points.push("suivi des encaissements et dépenses professionnels");
  } else if (/subvention|don|association|fondation|syndicat|cse/u.test(context)) {
    points.push("traçabilité des ressources et de leur affectation");
  } else {
    points.push("lecture de la trésorerie et des charges");
  }

  return points;
}

function contextualAssets(profession: Profession): string[] {
  const context = `${profession.name} ${profession.description ?? ""} ${profession.obligations ?? ""}`.toLowerCase();
  const assets = ["Grille de périmètre", "Check-list des pièces à préparer", "Calendrier partagé des échéances"];

  if (/stock|inventaire|mati[eè]re|marchandise|m[ée]dicament|cave|bois/u.test(context)) {
    assets[2] = "État d’inventaire à rapprocher des comptes";
  } else if (/chantier|travaux|sous-trait|march[ée] public/u.test(context)) {
    assets[2] = "Suivi des dossiers ou chantiers en cours";
  } else if (/honoraire|bnc|lib[ée]ral|cabinet|consultant/u.test(context)) {
    assets[2] = "Suivi des recettes et dépenses professionnelles";
  } else if (/subvention|don|association|fondation|syndicat|cse/u.test(context)) {
    assets[2] = "Tableau de suivi des ressources affectées";
  }

  return assets;
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
    painPoints: contextualPainPoints(profession),
    proposedAssets: contextualAssets(profession),
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
    comptabilite: "Comparer la collecte, la révision, les comptes annuels et les restitutions prévues.",
    fiscalite: "Clarifier les déclarations, les options à étudier et les validations attendues.",
    social: "Cadrer la paie, les informations à transmettre et le calendrier social lorsqu'une équipe est concernée.",
    "creation-entreprise": "Comparer le cadrage du statut, du régime fiscal et des formalités de création.",
    "conseil-gestion": "Vérifier les indicateurs, leur fréquence et le temps d'échange associé.",
    audit: "Faire préciser l'objet, le référentiel, les pièces, les constats et la restitution de la mission.",
  };
  return descriptions[slug] ?? "Approfondir ce besoin avec une ressource dédiée.";
}

function contextualMissingData(profession: Profession): string[] {
  const context = `${profession.name} ${profession.description ?? ""} ${profession.obligations ?? ""}`.toLowerCase();
  const items = [
    "Statut, régime fiscal et options connues",
    "Derniers comptes ou déclarations disponibles",
    "Prochaines échéances et changements prévus",
  ];

  if (/caisse|vente|commerce|boutique|restaurant|bar|boulanger|marchandise/u.test(context)) {
    items.unshift("Exports de ventes ou de caisse par canal");
  } else if (/honoraire|bnc|lib[ée]ral|cabinet|m[ée]decin|dentiste|avocat/u.test(context)) {
    items.unshift("Relevé des recettes et dépenses professionnelles");
  } else if (/chantier|travaux|sous-trait|architecte/u.test(context)) {
    items.unshift("Liste des dossiers ou chantiers en cours");
  } else if (/subvention|don|association|fondation|syndicat|cse/u.test(context)) {
    items.unshift("Subventions, dons ou ressources affectées, selon le cas");
  } else {
    items.unshift("Volume et origine des opérations à traiter");
  }

  if (/stock|inventaire|mati[eè]re|marchandise|m[ée]dicament|cave|bois/u.test(context)) {
    items.splice(2, 0, "Dernier inventaire et méthode de suivi utilisée");
  }

  if (/salari|personnel|paie|convention collective|int[ée]rimaire/u.test(context)) {
    items.splice(2, 0, "Effectif, contrats et calendrier de paie");
  }

  return [...new Set(items)].slice(0, 5);
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
    : contextualMissingData(profession);

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
