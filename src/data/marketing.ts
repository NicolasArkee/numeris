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
    { icon: "✓", title: "Expertise dédiée", description: `Notre pôle ${t} vous accompagne avec rigueur et réactivité.` },
    { icon: "📞", title: "Interlocuteur unique", description: "Un expert dédié qui connaît votre dossier et répond sous 24h." },
    { icon: "💻", title: "Outils digitaux", description: "Plateforme en ligne pour déposer vos documents et suivre vos indicateurs." },
    { icon: "🏛", title: "Conformité garantie", description: "Cabinet inscrit à l'Ordre des Experts-Comptables, assurance RC Pro." },
  ];

  const steps = [
    { title: "Diagnostic gratuit", description: `Analyse de vos besoins en ${t} lors d'un premier rendez-vous de 30 minutes.` },
    { title: "Proposition sur mesure", description: `Devis détaillé et lettre de mission adaptée à votre structure et votre volume d'activité.` },
    { title: "Mise en place", description: `Récupération de vos documents, paramétrage des outils et affectation de votre expert dédié.` },
    { title: "Suivi continu", description: `Accompagnement mensuel, alertes proactives et conseils personnalisés tout au long de l'année.` },
  ];

  const stats = [
    { value: "500+", label: "Entreprises accompagnées" },
    { value: "98%", label: "Taux de satisfaction" },
    { value: "24h", label: "Délai de réponse moyen" },
  ];

  const checklist = [
    `Tenue et révision de votre ${t}`,
    `Déclarations et obligations légales`,
    `Conseil et optimisation personnalisés`,
    `Reporting et tableaux de bord mensuels`,
    `Interlocuteur dédié et réactif`,
    `Outils digitaux et plateforme en ligne`,
  ];

  const alert = `Vous changez d'expert-comptable ? ${AppConfig.name} s'occupe de tout : récupération de vos dossiers, transfert des données et continuité de service, sans interruption.`;

  const quote = {
    text: `Depuis que nous travaillons avec ${AppConfig.name}, notre ${t} est parfaitement maîtrisée. L'équipe est réactive et les conseils toujours pertinents.`,
    author: "Directeur général",
    role: "PME – Île-de-France",
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
          `Le secteur ${s} présente des particularités comptables, fiscales et réglementaires que seul un cabinet expérimenté peut appréhender efficacement. Plans comptables sectoriels, obligations déclaratives spécifiques, régimes fiscaux dédiés : autant de sujets qui nécessitent une expertise pointue.`,
          `Chez ${AppConfig.name}, nos experts-comptables spécialisés en ${s} maîtrisent ces spécificités et vous garantissent une gestion optimisée, conforme et sereine.`,
        ],
      },
      {
        title: `Notre approche pour le ${s}`,
        paragraphs: [
          `Nous commençons par un diagnostic complet de votre situation comptable et fiscale. Chaque entreprise du ${s} a ses propres contraintes : nous adaptons notre accompagnement à votre réalité opérationnelle.`,
          `Notre équipe assure ensuite un suivi régulier, avec des points mensuels et des alertes proactives sur les échéances et les évolutions réglementaires de votre secteur.`,
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
      { value: "500+", label: "Clients accompagnés" },
      { value: "15+", label: "Secteurs maîtrisés" },
      { value: "4.9/5", label: "Satisfaction client" },
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
        title: `${service.title} à ${ville.name} : un accompagnement de proximité`,
        paragraphs: [
          `Vous êtes basé à ${ville.name} et recherchez un expert-comptable pour votre ${t} ? ${AppConfig.name} combine la réactivité d'un cabinet digital avec l'accompagnement personnalisé d'un cabinet de proximité.`,
          `Que vous soyez créateur d'entreprise, profession libérale ou dirigeant de PME à ${loc}, nous adaptons nos services à votre situation et à votre secteur d'activité.`,
        ],
      },
    ],
    benefits: [
      { icon: "📍", title: `Présence à ${ville.name}`, description: `Rendez-vous en présentiel ou en visio, selon vos préférences.` },
      { icon: "⚡", title: "Réactivité", description: "Réponse sous 24h et accès permanent à votre espace client en ligne." },
      { icon: "🎯", title: "Sur mesure", description: `Offre adaptée aux entreprises de ${loc}, de la création à la croissance.` },
    ],
    alert: `Premier rendez-vous gratuit à ${ville.name}. Prenez contact pour un diagnostic personnalisé de vos besoins en ${t}.`,
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
          `Les ${p} font face à des obligations comptables et fiscales qui leur sont propres. Régime fiscal spécifique, obligations déclaratives sectorielles, gestion des charges professionnelles : chaque aspect nécessite une expertise dédiée.`,
          `Chez ${AppConfig.name}, nos experts-comptables connaissent les réalités de votre métier. Nous vous accompagnons pour sécuriser votre gestion et optimiser votre situation fiscale.`,
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
      text: `En tant que ${profession.name.toLowerCase()}, j'avais besoin d'un expert-comptable qui comprenne mon métier. ${AppConfig.name} a su s'adapter à mes contraintes et m'apporter des conseils vraiment pertinents.`,
      author: profession.name,
      role: "Client depuis 2023",
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
      { icon: "⚖️", title: "Conformité garantie", description: `Respect de toutes les obligations réglementaires spécifiques.` },
      { icon: "📈", title: "Optimisation", description: `Leviers fiscaux et sociaux propres au ${s} activés pour vous.` },
      { icon: "🤝", title: "Accompagnement dédié", description: `Un expert qui parle votre langue et connaît votre métier.` },
    ],
    stats: [
      { value: "500+", label: "Entreprises accompagnées" },
      { value: "15+", label: "Années d'expertise" },
      { value: "100%", label: "Conformité assurée" },
    ],
  };
}

// ─── Ville pages ───
export function getVilleMarketing(ville: { slug: string; name: string; region: string | null; departement: string | null }) {
  return {
    contentSections: [
      {
        title: `Pourquoi choisir ${AppConfig.name} à ${ville.name} ?`,
        paragraphs: [
          `${AppConfig.name} accompagne les entreprises de ${ville.name}${ville.region ? ` et de ${ville.region}` : ""} avec une approche qui combine expertise comptable et outils digitaux modernes. Notre cabinet est inscrit à l'Ordre des Experts-Comptables et dispose d'une assurance RC professionnelle.`,
          `Que vous soyez en création, en développement ou en restructuration, nous adaptons notre accompagnement à votre stade de maturité et à votre secteur d'activité.`,
        ],
      },
    ],
    benefits: [
      { icon: "📍", title: "Proximité", description: `Cabinet accessible à ${ville.name}, rendez-vous en présentiel ou en visio.` },
      { icon: "💻", title: "100% digital", description: "Plateforme en ligne pour déposer vos documents et suivre vos indicateurs en temps réel." },
      { icon: "👤", title: "Expert dédié", description: "Un interlocuteur unique qui connaît votre dossier et votre activité." },
      { icon: "📞", title: "Disponibilité", description: "Réponse sous 24h, disponibilité permanente par téléphone et par email." },
    ],
    quote: {
      text: `Nous avons choisi ${AppConfig.name} pour leur réactivité et leur expertise. Un vrai partenaire pour notre entreprise à ${ville.name}.`,
      author: "Dirigeant de PME",
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
        title: `L'expert-comptable, partenaire clé des ${p}`,
        paragraphs: [
          `En tant que ${p.replace(/^les /, "")}, vous devez vous concentrer sur votre coeur de métier. La gestion comptable, fiscale et sociale demande pourtant un temps considérable et une expertise technique pointue.`,
          `Confier ces missions à un expert-comptable spécialisé, c'est gagner en sérénité, en conformité et en performance. ${AppConfig.name} vous accompagne au quotidien avec des solutions adaptées à votre profession.`,
        ],
      },
    ],
    benefits: [
      { icon: "🎯", title: "Spécialisation métier", description: `Expertise dédiée aux spécificités des ${p}.` },
      { icon: "📋", title: "Obligations maîtrisées", description: "Toutes vos obligations comptables et fiscales sont gérées." },
      { icon: "💡", title: "Conseil proactif", description: "Recommandations personnalisées pour optimiser votre situation." },
      { icon: "⏱", title: "Gain de temps", description: "Vous vous concentrez sur votre métier, nous gérons le reste." },
    ],
    stats: [
      { value: "500+", label: "Professionnels accompagnés" },
      { value: "4.9/5", label: "Satisfaction client" },
      { value: "24h", label: "Délai de réponse" },
    ],
  };
}
