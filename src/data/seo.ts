// ─── SEO templates for all page types ───

import { AppConfig } from "@/utils/AppConfig";

interface SEOData {
  metaTitle: string;
  metaDescription: string;
  h1: string;
  intro: string;
  faqs: { question: string; answer: string }[];
}

// ─── Service pages ───
export function getSEOForService(service: { slug: string; title: string; description: string }): SEOData {
  return {
    metaTitle: `${service.title} : comparer les options`,
    metaDescription: `${service.description} ${AppConfig.name} aide à préparer vos critères de comparaison et vos questions avant de choisir un professionnel.`,
    h1: `${service.title} : comparer les professionnels`,
    intro: `${AppConfig.name} est un comparateur indépendant. Cette page aide à comprendre les enjeux de ${service.title.toLowerCase()}, les documents à préparer et les critères à vérifier avant tout engagement.`,
    faqs: [
      {
        question: `Pourquoi confier sa ${service.title.toLowerCase()} à un expert-comptable ?`,
        answer: `Un professionnel habilité peut sécuriser les obligations réglementaires et vous faire gagner du temps. Skoria aide à préparer les critères de choix, sans fournir de prestation individualisée.`,
      },
      {
        question: `Combien coûte un service de ${service.title.toLowerCase()} ?`,
        answer: `Le tarif dépend du volume d'activité, des obligations, des outils et du niveau de conseil. Comparez le périmètre exact avant de signer une lettre de mission.`,
      },
      {
        question: `${AppConfig.name} est-il adapté aux petites entreprises ?`,
        answer: `Oui. Le comparateur aide les créateurs, indépendants et PME à clarifier leurs besoins avant de contacter un professionnel.`,
      },
    ],
  };
}

// ─── Secteur pages ───
export function getSEOForSecteur(secteur: { slug: string; name: string; description: string | null }): SEOData {
  const desc = secteur.description || secteur.name;
  return {
    metaTitle: `Comparer un expert-comptable ${secteur.name}`,
    metaDescription: `Critères pour comparer un expert-comptable spécialisé ${secteur.name.toLowerCase()} : ${desc}. Points comptables, fiscaux et sociaux à vérifier.`,
    h1: `Comparer un expert-comptable spécialisé ${secteur.name}`,
    intro: `Le secteur ${secteur.name.toLowerCase()} a des besoins comptables spécifiques. ${AppConfig.name} aide à comparer les critères utiles : ${desc.toLowerCase()}.`,
    faqs: [
      {
        question: `Pourquoi choisir un expert-comptable spécialisé en ${secteur.name.toLowerCase()} ?`,
        answer: `Un expert-comptable spécialisé connaît les particularités fiscales, sociales et réglementaires de votre secteur. Comparez son expérience, ses livrables et les outils proposés.`,
      },
      {
        question: `Quels services proposez-vous pour le secteur ${secteur.name.toLowerCase()} ?`,
        answer: `${AppConfig.name} ne réalise pas ces prestations. La page aide à comparer les besoins possibles : tenue comptable, déclarations fiscales, paie, conseil en gestion ou création.`,
      },
    ],
  };
}

// ─── Ville pages ───
export function getSEOForVille(ville: { slug: string; name: string; departement: string | null; region: string | null }): SEOData {
  const loc = ville.region ? `${ville.name} (${ville.region})` : ville.name;
  return {
    metaTitle: `Comparer un expert-comptable à ${ville.name}`,
    metaDescription: `Comparez les professionnels comptables à ${ville.name}. Critères de choix, annuaire, données publiques et questions à préparer à ${loc}.`,
    h1: `Comparer un expert-comptable à ${ville.name}`,
    intro: `Vous recherchez un expert-comptable à ${ville.name} ? ${AppConfig.name} aide à comparer les professionnels de ${loc} à partir de critères lisibles et de données publiques disponibles.`,
    faqs: [
      {
        question: `Comment choisir un expert-comptable à ${ville.name} ?`,
        answer: `Vérifiez l'habilitation professionnelle, l'expérience dans votre secteur, le périmètre de mission, les outils, les délais et les modalités d'échange.`,
      },
      {
        question: `Un expert-comptable en ligne peut-il remplacer un cabinet à ${ville.name} ?`,
        answer: `Cela dépend de vos besoins : certains privilégient la proximité, d'autres les outils à distance. Skoria aide à comparer ces critères avant le choix.`,
      },
    ],
  };
}

// ─── Departement pages ───
export function getSEOForDepartement(dept: { slug: string; code: string; name: string; region: string | null }): SEOData {
  return {
    metaTitle: `Comparer un expert-comptable ${dept.name} (${dept.code})`,
    metaDescription: `Critères pour comparer un expert-comptable dans le ${dept.name} (${dept.code}) : localisation, métier, périmètre et données disponibles.`,
    h1: `Comparer un expert-comptable dans le ${dept.name} (${dept.code})`,
    intro: `${AppConfig.name} aide à comparer les professionnels comptables du département ${dept.name} (${dept.code})${dept.region ? `, en ${dept.region},` : ""} avec des critères lisibles.`,
    faqs: [
      {
        question: `Quels services comptables proposez-vous dans le ${dept.name} ?`,
        answer: `Les besoins à comparer peuvent inclure la tenue comptable, les déclarations fiscales, la paie, le conseil en gestion et l'accompagnement à la création.`,
      },
    ],
  };
}

// ─── Cross : Service × Secteur ───
export function getSEOForServiceSecteur(
  service: { slug: string; title: string },
  secteur: { slug: string; name: string },
): SEOData {
  return {
    metaTitle: `${service.title} ${secteur.name} : comparer`,
    metaDescription: `${service.title} pour le secteur ${secteur.name.toLowerCase()} : critères de comparaison, obligations à vérifier et questions à préparer.`,
    h1: `${service.title} pour le secteur ${secteur.name}`,
    intro: `Les professionnels du ${secteur.name.toLowerCase()} ont des besoins spécifiques en ${service.title.toLowerCase()}. ${AppConfig.name} aide à préparer les critères de comparaison adaptés à cette réalité métier.`,
    faqs: [
      {
        question: `Quelles sont les spécificités de la ${service.title.toLowerCase()} en ${secteur.name.toLowerCase()} ?`,
        answer: `Le secteur ${secteur.name.toLowerCase()} implique des obligations comptables et fiscales particulières. Comparez l'expérience sectorielle, les livrables et les points de contrôle proposés.`,
      },
    ],
  };
}

// ─── Cross : Service × Ville ───
export function getSEOForServiceVille(
  service: { slug: string; title: string },
  ville: { slug: string; name: string },
): SEOData {
  return {
    metaTitle: `${service.title} ${ville.name} : comparer`,
    metaDescription: `${service.title} à ${ville.name}. Critères pour comparer les professionnels et préparer votre demande de ${service.title.toLowerCase()}.`,
    h1: `${service.title} à ${ville.name}`,
    intro: `Besoin d'un expert en ${service.title.toLowerCase()} à ${ville.name} ? ${AppConfig.name} aide à clarifier les critères et questions à comparer avant rendez-vous.`,
    faqs: [
      {
        question: `Proposez-vous la ${service.title.toLowerCase()} à ${ville.name} ?`,
        answer: `${AppConfig.name} ne réalise pas la prestation : la page aide à comparer les options locales ou à distance pour ${service.title.toLowerCase()}.`,
      },
    ],
  };
}

// ─── Profession pages ───
export function getSEOForProfession(profession: { slug: string; name: string; description: string | null; obligations: string | null }): SEOData {
  const desc = profession.description || profession.name;
  return {
    metaTitle: `Comparer un expert-comptable pour ${profession.name}`,
    metaDescription: `Critères pour comparer un expert-comptable spécialisé pour les ${profession.name.toLowerCase()}. ${desc}. Points comptables, fiscaux et sociaux à préparer.`,
    h1: `Comparer un expert-comptable pour ${profession.name}`,
    intro: `Les ${profession.name.toLowerCase()} ont des obligations comptables et fiscales spécifiques. ${AppConfig.name} aide à préparer les critères de comparaison adaptés à votre métier.`,
    faqs: [
      {
        question: `Pourquoi un expert-comptable spécialisé pour les ${profession.name.toLowerCase()} ?`,
        answer: profession.obligations
          ? `Votre activité implique des particularités : ${profession.obligations.toLowerCase()}. Comparez l'expérience métier, les outils et les livrables proposés.`
          : `Un expert-comptable spécialisé connaît les particularités de votre métier. Comparez son expérience, son périmètre de mission et ses modalités d'échange.`,
      },
      {
        question: `Quels services comptables pour les ${profession.name.toLowerCase()} ?`,
        answer: `Les besoins à comparer peuvent inclure la tenue comptable, les déclarations fiscales, la paie, le conseil en gestion et l'accompagnement à la création.`,
      },
      {
        question: `Combien coûte un expert-comptable pour ${profession.name.toLowerCase()} ?`,
        answer: `Les honoraires dépendent du volume d'activité, des obligations et du niveau de conseil. Comparez le périmètre exact avant de vous engager.`,
      },
    ],
  };
}

// ─── Cross : Service × Profession ───
export function getSEOForServiceProfession(
  service: { slug: string; title: string },
  profession: { slug: string; name: string },
): SEOData {
  return {
    metaTitle: `${service.title} pour ${profession.name}`,
    metaDescription: `${service.title} adaptée aux ${profession.name.toLowerCase()}. Critères pour comparer un professionnel comptable spécialisé.`,
    h1: `${service.title} pour ${profession.name}`,
    intro: `Les ${profession.name.toLowerCase()} ont des besoins spécifiques en ${service.title.toLowerCase()}. ${AppConfig.name} aide à comparer les critères liés aux réalités de votre métier.`,
    faqs: [
      {
        question: `Quelles sont les spécificités de la ${service.title.toLowerCase()} pour les ${profession.name.toLowerCase()} ?`,
        answer: `Votre profession implique des obligations comptables et fiscales particulières. Comparez les livrables, les outils, l'expérience métier et les points de vigilance couverts.`,
      },
    ],
  };
}

// ─── Ressource / Theme pages (silos, hubs, clusters, keywords) ───
export function getSEOForRessource(
  node: { slug: string; label: string; volume: number },
  type: "silo" | "hub" | "cluster" | "keyword",
): SEOData {
  if (type === "keyword") {
    // NB : jamais de volume de recherche dans un texte rendu (donnée interne).
    return {
      metaTitle: `${node.label} : guide & conseils`,
      metaDescription: `${node.label} — l'essentiel par ${AppConfig.name}, comparateur indépendant. Définitions, démarches et repères pratiques pour les professionnels et entreprises.`,
      h1: node.label,
      intro: `Comprendre ${node.label.toLowerCase()} : définition, enjeux et démarches expliqués par l'équipe ${AppConfig.name}. Retrouvez ci-dessous nos conseils et les ressources liées.`,
      faqs: [],
    };
  }

  const typeLabel = type === "silo" ? "Guide complet" : type === "hub" ? "Tout savoir sur" : "";
  const prefix = typeLabel ? `${typeLabel} : ` : "";
  return {
    metaTitle: `${prefix}${node.label}`,
    metaDescription: `${node.label} : guide complet par ${AppConfig.name}. Informations pratiques, repères de comparaison et ressources pour les professionnels et entreprises.`,
    h1: node.label,
    intro: `Découvrez le guide Skoria sur ${node.label.toLowerCase()}. Informations à jour, repères pratiques et ressources pour préparer vos décisions.`,
    faqs: [],
  };
}
