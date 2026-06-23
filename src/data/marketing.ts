// ─── Marketing content blocks generated per page type ───
// These provide the "meat" content for cluster pages

import { AppConfig } from "@/utils/AppConfig";

// ─── Service pages ───
export function getServiceMarketing(service: { slug: string; title: string }) {
  const t = service.title.toLowerCase();

  const benefitsMap: Record<string, { icon: string; title: string; description: string }[]> = {
    comptabilite: [
      { icon: "📊", title: "Tenue comptable complète", description: "Saisie, rapprochement bancaire, lettrage : votre comptabilité est à jour en permanence." },
      { icon: "📅", title: "Bilan & liasses fiscales", description: "Établissement du bilan annuel et des liasses fiscales dans les délais légaux." },
      { icon: "📈", title: "Tableaux de bord", description: "Suivi mensuel de vos indicateurs clés : trésorerie, rentabilité, charges." },
      { icon: "🔄", title: "Révision des comptes", description: "Contrôle régulier pour garantir la fiabilité de vos données financières." },
    ],
    "gestion-fiscale": [
      { icon: "📋", title: "Déclarations fiscales", description: "TVA, IS, IR, CFE, CVAE : toutes vos obligations déclaratives gérées." },
      { icon: "🎯", title: "Optimisation fiscale", description: "Identification des leviers légaux pour réduire votre charge fiscale." },
      { icon: "🛡️", title: "Contrôle fiscal", description: "Accompagnement et représentation en cas de vérification de l'administration." },
      { icon: "💡", title: "Veille réglementaire", description: "Anticipation des évolutions fiscales impactant votre activité." },
    ],
    "gestion-sociale": [
      { icon: "💰", title: "Bulletins de paie", description: "Édition des fiches de paie conformes, du premier au dernier salarié." },
      { icon: "📝", title: "Déclarations sociales", description: "DSN, URSSAF, caisses de retraite : toutes vos obligations sont couvertes." },
      { icon: "⚖️", title: "Droit du travail", description: "Conseil sur les contrats, les conventions collectives et les procédures." },
      { icon: "👥", title: "Gestion des entrées/sorties", description: "DPAE, solde de tout compte, attestations : chaque étape est gérée." },
    ],
  };

  const benefits = benefitsMap[service.slug] || [
    { icon: "✓", title: "Critères utiles", description: `Les points à comparer pour choisir un professionnel adapté en ${t}.` },
    { icon: "📞", title: "Orientation claire", description: "Une demande structurée pour préparer vos échanges sans promesse de mission." },
    { icon: "💻", title: "Ressources pratiques", description: "Documents à préparer, questions à poser et signaux à vérifier." },
    { icon: "🏛", title: "Sources lisibles", description: "Données publiques et limites éditoriales explicitées quand elles existent." },
  ];

  const steps = [
    { title: "Cadrage du besoin", description: `Identifier le contexte, les échéances et les sujets prioritaires en ${t}.` },
    { title: "Critères de comparaison", description: "Comparer le périmètre, les livrables, les outils, la localisation et le niveau d'accompagnement." },
    { title: "Préparation du rendez-vous", description: "Lister les documents et questions utiles avant de contacter un professionnel habilité." },
    { title: "Choix éclairé", description: "Conserver une trace claire des points à confirmer avant toute lettre de mission." },
  ];

  const stats = [
    { value: "100+", label: "Pages métiers" },
    { value: "30k+", label: "Fiches publiques" },
    { value: "0", label: "Avis inventé" },
  ];

  const checklist = [
    `Périmètre exact de la mission en ${t}`,
    `Déclarations et obligations à couvrir`,
    `Niveau de conseil attendu`,
    `Reporting et tableaux de bord utiles`,
    `Modalités d'échange et délais de réponse`,
    `Outils utilisés et accès aux données`,
  ];

  const alert = `Vous changez de professionnel comptable ? ${AppConfig.name} aide à préparer les questions, les documents et les critères à comparer avant tout engagement.`;

  const quote = {
    text: `Un bon choix commence par un périmètre clair : qui fait quoi, avec quels outils, à quel rythme et sur quelles obligations.`,
    author: "Méthode Skoria",
    role: "Comparateur indépendant",
  };

  return { benefits, steps, stats, checklist, alert, quote };
}

// ─── Service × Secteur ───
export function getServiceSecteurMarketing(
  service: { slug: string; title: string },
  secteur: { slug: string; name: string },
) {
  const t = service.title.toLowerCase();
  const s = secteur.name.toLowerCase();

  return {
    contentSections: [
      {
        title: `Pourquoi une ${t} spécialisée en ${s} ?`,
        paragraphs: [
          `Le secteur ${s} présente des particularités comptables, fiscales et réglementaires qu'il faut clarifier avant de choisir un professionnel. Plans comptables sectoriels, obligations déclaratives spécifiques, régimes fiscaux dédiés : autant de sujets qui doivent être explicités dans le périmètre de mission.`,
          `${AppConfig.name} vous aide à identifier les critères de comparaison utiles : expérience sectorielle, outils, livrables, rythme de suivi, documents attendus et limites de l'accompagnement.`,
        ],
      },
      {
        title: `Comparer les options pour le ${s}`,
        paragraphs: [
          `Chaque entreprise du ${s} a ses propres contraintes. Une bonne comparaison part du volume d'activité, du mode d'encaissement, des obligations déclaratives, des outils de caisse ou de facturation et du besoin réel de conseil.`,
          `Les contenus Skoria servent à préparer les questions à poser avant rendez-vous et à distinguer les prestations indispensables des options secondaires.`,
        ],
      },
    ],
    checklist: [
      `Connaissance approfondie des obligations du ${s}`,
      `Plan comptable adapté à votre secteur d'activité`,
      `Veille réglementaire spécifique ${s}`,
      `Optimisation fiscale sectorielle`,
      `Interlocuteur spécialisé dédié`,
      `Accompagnement lors des contrôles`,
    ],
    stats: [
      { value: "15+", label: "Secteurs couverts" },
      { value: "100+", label: "Professions documentées" },
      { value: "0", label: "Promesse inventée" },
    ],
  };
}

// ─── Service × Ville ───
export function getServiceVilleMarketing(
  service: { slug: string; title: string },
  ville: { slug: string; name: string; region: string | null },
) {
  const t = service.title.toLowerCase();
  const loc = ville.region ? `${ville.name} et en ${ville.region}` : ville.name;

  return {
    contentSections: [
      {
        title: `${service.title} à ${ville.name} : préparer une comparaison locale`,
        paragraphs: [
          `Vous êtes basé à ${ville.name} et recherchez un professionnel comptable pour votre ${t} ? ${AppConfig.name} vous aide à comparer les critères utiles : proximité, disponibilité, expérience métier, outils et périmètre de mission.`,
          `Que vous soyez créateur d'entreprise, profession libérale ou dirigeant de PME à ${loc}, l'objectif est de préparer un échange clair avant toute décision.`,
        ],
      },
    ],
    benefits: [
      { icon: "📍", title: `Critère local`, description: `Présentiel, visio, distance et disponibilité à comparer selon vos préférences.` },
      { icon: "⚡", title: "Réactivité", description: "Délais de réponse, urgence déclarative et rythme de suivi à clarifier." },
      { icon: "🎯", title: "Périmètre", description: `Missions à définir pour les entreprises de ${loc}, de la création à la croissance.` },
    ],
    alert: `Préparez votre demande à ${ville.name} : contexte, échéances, documents disponibles et points à comparer en ${t}.`,
  };
}

// ─── Service × Profession ───
export function getServiceProfessionMarketing(
  service: { slug: string; title: string },
  profession: { slug: string; name: string; obligations: string | null },
) {
  const t = service.title.toLowerCase();
  const p = profession.name.toLowerCase();

  return {
    contentSections: [
      {
        title: `${service.title} adaptée aux ${p}`,
        paragraphs: [
          `Les ${p} font face à des obligations comptables et fiscales qui leur sont propres. Régime fiscal spécifique, obligations déclaratives sectorielles, gestion des charges professionnelles : chaque aspect doit être clarifié avant de choisir un professionnel.`,
          `${AppConfig.name} transforme ces enjeux en critères de comparaison concrets : documents à préparer, questions à poser, livrables attendus et points à confirmer.`,
        ],
      },
    ],
    checklist: [
      `Maîtrise des obligations spécifiques aux ${p}`,
      `Optimisation du régime fiscal applicable`,
      `Gestion des charges et frais professionnels`,
      `Conseil en structuration juridique`,
      `Accompagnement déclaratif complet`,
      `Suivi de trésorerie adapté à votre activité`,
    ],
    quote: {
      text: `Pour les ${profession.name.toLowerCase()}, le bon échange commence par des données simples : volume d'activité, échéances, statut, outils et points de blocage.`,
      author: "Méthode Skoria",
      role: "Comparateur indépendant",
    },
  };
}

// ─── Secteur pages ───
export function getSecteurMarketing(secteur: { slug: string; name: string; description: string | null }) {
  const s = secteur.name.toLowerCase();

  return {
    contentSections: [
      {
        title: `Les enjeux comptables du ${s}`,
        paragraphs: [
          `Le secteur ${s} est soumis à des réglementations comptables et fiscales spécifiques. Plans comptables sectoriels, taux de TVA particuliers, obligations sociales dédiées : la gestion comptable de votre activité ne s'improvise pas.`,
          `Faire appel à un expert-comptable spécialisé en ${s}, c'est s'assurer que chaque spécificité est maîtrisée et que votre entreprise reste en conformité tout en optimisant sa fiscalité.`,
        ],
      },
    ],
    benefits: [
      { icon: "🏛", title: "Expertise sectorielle", description: `Connaissance approfondie des normes comptables du ${s}.` },
      { icon: "⚖️", title: "Points à vérifier", description: `Obligations réglementaires spécifiques à confirmer avec le professionnel choisi.` },
      { icon: "📈", title: "Pilotage", description: `Leviers fiscaux, sociaux et de gestion à comparer selon votre situation.` },
      { icon: "🤝", title: "Choix éclairé", description: `Critères pour identifier un professionnel habitué à votre métier.` },
    ],
    stats: [
      { value: "100+", label: "Métiers couverts" },
      { value: "15+", label: "Secteurs documentés" },
      { value: "0", label: "Garantie inventée" },
    ],
  };
}

// ─── Ville pages ───
export function getVilleMarketing(ville: { slug: string; name: string; region: string | null; departement: string | null }) {
  return {
    contentSections: [
      {
        title: `Comparer les professionnels comptables à ${ville.name}`,
        paragraphs: [
          `${AppConfig.name} aide les entreprises de ${ville.name}${ville.region ? ` et de ${ville.region}` : ""} à préparer leur comparaison : localisation, périmètre de mission, outils utilisés, spécialisation métier et données publiques disponibles.`,
          `Que vous soyez en création, en développement ou en restructuration, la page sert à formuler les bons critères avant de contacter un professionnel habilité.`,
        ],
      },
    ],
    benefits: [
      { icon: "📍", title: "Proximité", description: `Présentiel, visio ou à distance : un critère à pondérer à ${ville.name}.` },
      { icon: "💻", title: "Outils", description: "Logiciels, portail documentaire et accès aux données à comparer." },
      { icon: "👤", title: "Spécialisation", description: "Expérience métier, taille de clientèle et disponibilité à vérifier." },
      { icon: "📞", title: "Contact", description: "Délais de réponse et mode d'échange à clarifier avant engagement." },
    ],
    quote: {
      text: `Comparer ne consiste pas à promettre le meilleur cabinet : il s'agit de rendre les critères visibles avant le premier échange.`,
      author: "Méthode Skoria",
      role: ville.name,
    },
  };
}

// ─── Profession pages ───
export function getProfessionMarketing(profession: { slug: string; name: string; obligations: string | null }) {
  const p = profession.name.toLowerCase();

  return {
    contentSections: [
      {
        title: `Comparer un professionnel comptable pour les ${p}`,
        paragraphs: [
          `En tant que ${p.replace(/^les /, "")}, vous devez vous concentrer sur votre coeur de métier. La gestion comptable, fiscale et sociale demande pourtant un temps considérable et une expertise technique pointue.`,
          `Avant de confier ces missions, il est utile de comparer les professionnels sur leur expérience métier, leurs outils, leurs livrables, leurs délais et leur capacité à expliquer les choix fiscaux et sociaux.`,
        ],
      },
    ],
    benefits: [
      { icon: "🎯", title: "Spécialisation métier", description: `Expertise dédiée aux spécificités des ${p}.` },
      { icon: "📋", title: "Obligations à couvrir", description: "Les sujets comptables et fiscaux à intégrer dans le périmètre." },
      { icon: "💡", title: "Questions à poser", description: "Points de pilotage, régime fiscal, TVA, paie et outils à clarifier." },
      { icon: "⏱", title: "Préparation", description: "Documents et échéances à rassembler avant le premier échange." },
    ],
    stats: [
      { value: "100+", label: "Professions documentées" },
      { value: "6", label: "Axes de comparaison" },
      { value: "0", label: "Avis fictif" },
    ],
  };
}
