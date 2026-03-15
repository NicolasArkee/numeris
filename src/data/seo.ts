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
    metaTitle: `${service.title} – Expert-Comptable | ${AppConfig.name}`,
    metaDescription: `${service.description} Faites confiance à ${AppConfig.name} pour votre ${service.title.toLowerCase()}. Devis gratuit.`,
    h1: `${service.title} : notre expertise à votre service`,
    intro: `Chez ${AppConfig.name}, notre pôle ${service.title.toLowerCase()} accompagne les entreprises de toute taille. ${service.description}`,
    faqs: [
      {
        question: `Pourquoi confier sa ${service.title.toLowerCase()} à un expert-comptable ?`,
        answer: `Un expert-comptable vous garantit la conformité réglementaire, optimise votre gestion et vous fait gagner un temps précieux sur les aspects ${service.title.toLowerCase()}.`,
      },
      {
        question: `Combien coûte un service de ${service.title.toLowerCase()} ?`,
        answer: `Nos tarifs dépendent de la taille de votre structure et de la complexité de vos besoins. Contactez-nous pour un devis personnalisé gratuit.`,
      },
      {
        question: `${AppConfig.name} est-il adapté aux petites entreprises ?`,
        answer: `Absolument. Nous accompagnons aussi bien les créateurs d'entreprise que les PME et les grandes structures, avec des offres adaptées à chaque profil.`,
      },
    ],
  };
}

// ─── Secteur pages ───
export function getSEOForSecteur(secteur: { slug: string; name: string; description: string | null }): SEOData {
  const desc = secteur.description || secteur.name;
  return {
    metaTitle: `Expert-Comptable ${secteur.name} | ${AppConfig.name}`,
    metaDescription: `Expert-comptable spécialisé ${secteur.name.toLowerCase()} : ${desc}. Accompagnement comptable, fiscal et social adapté à votre secteur.`,
    h1: `Expert-comptable spécialisé ${secteur.name}`,
    intro: `Le secteur ${secteur.name.toLowerCase()} a des besoins comptables spécifiques. ${AppConfig.name} vous accompagne avec une expertise dédiée : ${desc.toLowerCase()}.`,
    faqs: [
      {
        question: `Pourquoi choisir un expert-comptable spécialisé en ${secteur.name.toLowerCase()} ?`,
        answer: `Un expert-comptable spécialisé connaît les particularités fiscales, sociales et réglementaires de votre secteur, ce qui vous garantit une optimisation maximale.`,
      },
      {
        question: `Quels services proposez-vous pour le secteur ${secteur.name.toLowerCase()} ?`,
        answer: `Nous proposons la tenue comptable, les déclarations fiscales, la gestion sociale, le conseil en gestion et l'accompagnement à la création, adaptés aux spécificités du ${secteur.name.toLowerCase()}.`,
      },
    ],
  };
}

// ─── Ville pages ───
export function getSEOForVille(ville: { slug: string; name: string; departement: string | null; region: string | null }): SEOData {
  const loc = ville.region ? `${ville.name} (${ville.region})` : ville.name;
  return {
    metaTitle: `Expert-Comptable ${ville.name} | Cabinet ${AppConfig.name}`,
    metaDescription: `Cabinet d'expertise comptable à ${ville.name}. Comptabilité, fiscalité, conseil en gestion pour entreprises et professions libérales à ${loc}.`,
    h1: `Expert-comptable à ${ville.name}`,
    intro: `Vous recherchez un expert-comptable à ${ville.name} ? ${AppConfig.name} accompagne les entreprises de ${loc} dans leur gestion comptable, fiscale et sociale.`,
    faqs: [
      {
        question: `Comment choisir un expert-comptable à ${ville.name} ?`,
        answer: `Privilégiez un cabinet inscrit à l'Ordre, avec une expertise dans votre secteur d'activité. Chez ${AppConfig.name}, nous combinons proximité et expertise sectorielle.`,
      },
      {
        question: `Un expert-comptable en ligne peut-il remplacer un cabinet à ${ville.name} ?`,
        answer: `Nos outils digitaux vous offrent le meilleur des deux mondes : la réactivité d'un cabinet en ligne et l'accompagnement personnalisé d'un cabinet de proximité.`,
      },
    ],
  };
}

// ─── Departement pages ───
export function getSEOForDepartement(dept: { slug: string; code: string; name: string; region: string | null }): SEOData {
  return {
    metaTitle: `Expert-Comptable ${dept.name} (${dept.code}) | ${AppConfig.name}`,
    metaDescription: `Expert-comptable dans le ${dept.name} (${dept.code}). Accompagnement comptable, fiscal et social pour entreprises et professions libérales.`,
    h1: `Expert-comptable dans le ${dept.name} (${dept.code})`,
    intro: `${AppConfig.name} accompagne les entreprises du département ${dept.name} (${dept.code})${dept.region ? `, en ${dept.region},` : ""} dans leur gestion comptable et fiscale.`,
    faqs: [
      {
        question: `Quels services comptables proposez-vous dans le ${dept.name} ?`,
        answer: `Nous proposons la tenue comptable, les déclarations fiscales, la gestion de la paie, le conseil en gestion et l'accompagnement à la création d'entreprise.`,
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
    metaTitle: `${service.title} ${secteur.name} – Expert-Comptable | ${AppConfig.name}`,
    metaDescription: `${service.title} spécialisée pour le secteur ${secteur.name.toLowerCase()}. Cabinet ${AppConfig.name}, expert-comptable dédié à votre activité.`,
    h1: `${service.title} pour le secteur ${secteur.name}`,
    intro: `Les professionnels du ${secteur.name.toLowerCase()} ont des besoins spécifiques en ${service.title.toLowerCase()}. Chez ${AppConfig.name}, nous adaptons nos services à votre réalité métier.`,
    faqs: [
      {
        question: `Quelles sont les spécificités de la ${service.title.toLowerCase()} en ${secteur.name.toLowerCase()} ?`,
        answer: `Le secteur ${secteur.name.toLowerCase()} implique des obligations comptables et fiscales particulières. Notre équipe maîtrise ces spécificités pour vous garantir conformité et optimisation.`,
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
    metaTitle: `${service.title} ${ville.name} – Expert-Comptable | ${AppConfig.name}`,
    metaDescription: `${service.title} à ${ville.name}. Cabinet d'expertise comptable ${AppConfig.name}, votre partenaire de confiance pour la ${service.title.toLowerCase()}.`,
    h1: `${service.title} à ${ville.name}`,
    intro: `Besoin d'un expert en ${service.title.toLowerCase()} à ${ville.name} ? ${AppConfig.name} vous accompagne avec des solutions adaptées à votre entreprise.`,
    faqs: [
      {
        question: `Proposez-vous la ${service.title.toLowerCase()} à ${ville.name} ?`,
        answer: `Oui, ${AppConfig.name} propose des services de ${service.title.toLowerCase()} à ${ville.name} et dans toute la France, en présentiel ou à distance.`,
      },
    ],
  };
}

// ─── Profession pages ───
export function getSEOForProfession(profession: { slug: string; name: string; description: string | null; obligations: string | null }): SEOData {
  const desc = profession.description || profession.name;
  return {
    metaTitle: `Expert-Comptable pour ${profession.name} | ${AppConfig.name}`,
    metaDescription: `Expert-comptable spécialisé pour les ${profession.name.toLowerCase()}. ${desc}. Accompagnement comptable, fiscal et social dédié.`,
    h1: `Expert-comptable pour ${profession.name}`,
    intro: `Les ${profession.name.toLowerCase()} ont des obligations comptables et fiscales spécifiques. ${AppConfig.name} vous accompagne avec une expertise dédiée à votre métier.`,
    faqs: [
      {
        question: `Pourquoi un expert-comptable spécialisé pour les ${profession.name.toLowerCase()} ?`,
        answer: profession.obligations
          ? `Votre activité implique des particularités : ${profession.obligations.toLowerCase()}. Un expert-comptable spécialisé maîtrise ces spécificités pour optimiser votre gestion.`
          : `Un expert-comptable spécialisé connaît les particularités de votre métier et vous garantit conformité réglementaire et optimisation fiscale.`,
      },
      {
        question: `Quels services comptables pour les ${profession.name.toLowerCase()} ?`,
        answer: `Nous proposons la tenue comptable, les déclarations fiscales, la gestion de la paie, le conseil en gestion et l'accompagnement à la création, adaptés aux ${profession.name.toLowerCase()}.`,
      },
      {
        question: `Combien coûte un expert-comptable pour ${profession.name.toLowerCase()} ?`,
        answer: `Nos tarifs dépendent du volume d'activité et de la complexité de vos obligations. Contactez-nous pour un devis personnalisé gratuit et sans engagement.`,
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
    metaTitle: `${service.title} pour ${profession.name} | ${AppConfig.name}`,
    metaDescription: `${service.title} adaptée aux ${profession.name.toLowerCase()}. Cabinet ${AppConfig.name}, expert-comptable spécialisé pour votre profession.`,
    h1: `${service.title} pour ${profession.name}`,
    intro: `Les ${profession.name.toLowerCase()} ont des besoins spécifiques en ${service.title.toLowerCase()}. Chez ${AppConfig.name}, nous adaptons nos services aux réalités de votre métier.`,
    faqs: [
      {
        question: `Quelles sont les spécificités de la ${service.title.toLowerCase()} pour les ${profession.name.toLowerCase()} ?`,
        answer: `Votre profession implique des obligations comptables et fiscales particulières. Notre équipe spécialisée maîtrise ces spécificités pour vous garantir conformité et optimisation.`,
      },
    ],
  };
}

// ─── Ressource / Theme pages (silos, hubs, clusters) ───
export function getSEOForRessource(node: { slug: string; label: string; volume: number }, type: "silo" | "hub" | "cluster"): SEOData {
  const typeLabel = type === "silo" ? "Guide complet" : type === "hub" ? "Tout savoir sur" : "";
  const prefix = typeLabel ? `${typeLabel} : ` : "";
  return {
    metaTitle: `${prefix}${node.label} | ${AppConfig.name}`,
    metaDescription: `${node.label} : guide complet par ${AppConfig.name}. Informations pratiques, conseils et ressources pour les professionnels et entreprises.`,
    h1: node.label,
    intro: `Découvrez notre guide complet sur ${node.label.toLowerCase()}. Informations à jour, conseils pratiques et ressources pour vous accompagner.`,
    faqs: [],
  };
}
