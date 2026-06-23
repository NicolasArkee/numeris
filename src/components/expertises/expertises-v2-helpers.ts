import type {
  ProfessionCategory,
  Secteur,
  Service,
} from "@/libs/db";
import type { DirectoryFaqItem } from "@/components/directory/profile-v2-helpers";

export type ExpertisePageStats = {
  serviceCount: number;
  sectorCount: number;
  professionCategoryCount: number;
};

export type ExpertiseLink = {
  label: string;
  href: string;
  description: string;
};

const NEED_COPY: Record<string, { label: string; description: string }> = {
  comptabilite: {
    label: "Fiabiliser ma comptabilite",
    description: "Tenue, revision et lecture claire des comptes.",
  },
  fiscalite: {
    label: "Securiser mes declarations fiscales",
    description: "TVA, impots, arbitrages fiscaux et controle.",
  },
  social: {
    label: "Gerer paie et social",
    description: "Bulletins, declarations sociales et points RH recurrents.",
  },
  "creation-entreprise": {
    label: "Creer mon entreprise",
    description: "Choix du statut, previsionnel et formalites de depart.",
  },
  "conseil-gestion": {
    label: "Piloter ma rentabilite",
    description: "Tableaux de bord, marges, tresorerie et previsions.",
  },
  audit: {
    label: "Auditer ou certifier mes comptes",
    description: "Audit legal, audit contractuel et attestations.",
  },
};

export function buildExpertisePageStats(
  services: Service[],
  secteurs: Secteur[],
  categories: ProfessionCategory[],
): ExpertisePageStats {
  return {
    serviceCount: services.length,
    sectorCount: secteurs.length,
    professionCategoryCount: categories.length,
  };
}

export function buildExpertiseNeedLinks(services: Service[]): ExpertiseLink[] {
  return [...services]
    .sort((a, b) => a.order_index - b.order_index || a.title.localeCompare(b.title, "fr"))
    .map((service) => {
      const copy = NEED_COPY[service.slug] ?? {
        label: service.title,
        description: service.description,
      };
      return {
        label: copy.label,
        href: `/expertises/${service.slug}`,
        description: copy.description,
      };
    });
}

export function buildExpertiseSectorLinks(
  secteurs: Secteur[],
  limit = 8,
): ExpertiseLink[] {
  return [...secteurs]
    .sort((a, b) => b.volume - a.volume || a.name.localeCompare(b.name, "fr"))
    .slice(0, limit)
    .map((secteur) => ({
      label: secteur.name,
      href: `/secteurs/${secteur.slug}`,
      description: secteur.description ?? "Guides et points d'attention par secteur.",
    }));
}

export function buildExpertiseProfessionCategoryLinks(
  categories: ProfessionCategory[],
  limit = 8,
): ExpertiseLink[] {
  return [...categories]
    .sort((a, b) => a.order_index - b.order_index || a.name.localeCompare(b.name, "fr"))
    .slice(0, limit)
    .map((category) => ({
      label: category.name,
      href: `/professions#${category.slug}`,
      description: category.description ?? "Guides comptables par famille de metiers.",
    }));
}

export function buildExpertiseFaqItems(): DirectoryFaqItem[] {
  return [
    {
      question: "Quelle expertise comptable choisir en premier ?",
      answer:
        "Le point de depart depend de votre besoin immediat : creation, tenue comptable, fiscalite, paie, pilotage ou audit. Une premiere qualification permet de choisir la bonne page et les documents a preparer.",
    },
    {
      question: "Les expertises Skoria remplacent-elles un rendez-vous avec un expert-comptable ?",
      answer:
        "Non. Les pages d'expertises servent a comprendre les missions possibles et a preparer les questions. Le cadrage final depend de votre situation, de votre structure et des pieces disponibles.",
    },
    {
      question: "Puis-je combiner plusieurs expertises ?",
      answer:
        "Oui. Une entreprise peut avoir besoin simultanement de tenue comptable, fiscalite, social et pilotage. Le maillage par besoin aide a composer un accompagnement coherent.",
    },
    {
      question: "Comment comparer une expertise par secteur ou par profession ?",
      answer:
        "Les pages secteur et profession contextualisent les obligations, les rythmes declaratifs et les points de vigilance. Elles completent les pages d'expertises sans promettre une mission standardisee.",
    },
  ];
}
