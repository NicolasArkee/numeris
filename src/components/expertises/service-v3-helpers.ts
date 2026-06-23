import type {
  Profession,
  ProfessionCategory,
  Secteur,
  Service,
} from "@/libs/db";
import type { DirectoryFaqItem } from "@/components/directory/profile-v2-helpers";

export type ServiceVisualAsset = {
  kind: "hero" | "sector" | "profession" | "offer" | "seo";
  src: string;
  alt: string;
};

export type ServiceAssetCard = {
  label: string;
  href: string;
  description: string;
  categoryLabel?: string;
  asset: ServiceVisualAsset;
};

export type ServiceSeoContentCard = {
  title: string;
  body: string;
};

export type ServiceSeoListBlock = {
  title: string;
  body: string;
  items: string[];
};

export type ServiceSeoDeliverable = {
  rhythm: string;
  title: string;
  body: string;
};

export type ServiceSeoInternalLink = {
  label: string;
  href: string;
  body: string;
};

export type ServiceSeoContentPack = {
  overviewTitle: string;
  overviewIntro: string;
  coverageTitle: string;
  coverageIntro: string;
  coverageCards: ServiceSeoContentCard[];
  obligationsTitle: string;
  obligationsIntro: string;
  obligationsBlocks: ServiceSeoListBlock[];
  documentsTitle: string;
  documentsIntro: string;
  documentBlocks: ServiceSeoListBlock[];
  triggersTitle: string;
  triggersIntro: string;
  triggerCards: ServiceSeoContentCard[];
  deliverablesTitle: string;
  deliverablesIntro: string;
  deliverables: ServiceSeoDeliverable[];
  internalLinksTitle: string;
  internalLinksIntro: string;
  internalLinks: ServiceSeoInternalLink[];
};

// Palette tokens Skoria — [ink (dark surface), accent (highlight line/dots), paper (light card bg)]
// 5 variantes pour préserver la variété des illustrations randomisées par hashSlug.
const PALETTES = [
  // Palette dominante : brand-ink + accent-500 + slate-100
  ["#04173F", "#FF6B35", "#F1F5F9"],
  // Variante chaude : brand-900 + accent-700 + accent-50
  ["#062462", "#C44818", "#FFF4EC"],
  // Variante mono bleue : brand-ink + brand-500 + brand-50
  ["#04173F", "#2C5DB8", "#EFF4FB"],
  // Variante douce : brand-900 + accent-300 + slate-100
  ["#062462", "#FFB388", "#F1F5F9"],
  // Variante secondaire : brand-ink + accent-500 + brand-50
  ["#04173F", "#FF6B35", "#EFF4FB"],
];

function hashSlug(value: string): number {
  return [...value].reduce((acc, char) => acc + char.charCodeAt(0), 0);
}

function escapeXml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll("\"", "&quot;");
}

function svgDataUri(svg: string): string {
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

function buildAbstractSvg({
  kind,
  slug,
  label,
  width,
  height,
}: {
  kind: ServiceVisualAsset["kind"];
  slug: string;
  label: string;
  width: number;
  height: number;
}): string {
  const palette = PALETTES[hashSlug(slug) % PALETTES.length]!;
  const [ink, accent, paper] = palette;
  const safeLabel = escapeXml(label);
  const compact = safeLabel.length > 26 ? `${safeLabel.slice(0, 24)}...` : safeLabel;
  const mid = width / 2;
  const isHero = kind === "hero";

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="${safeLabel}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${paper}"/>
      <stop offset="1" stop-color="#ffffff"/>
    </linearGradient>
    <linearGradient id="ink" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${ink}"/>
      <stop offset="1" stop-color="#0B3D91"/>
    </linearGradient>
    <pattern id="grid" width="42" height="42" patternUnits="userSpaceOnUse">
      <path d="M42 0H0V42" fill="none" stroke="${ink}" stroke-opacity=".07"/>
    </pattern>
  </defs>
  <rect width="${width}" height="${height}" fill="url(#bg)"/>
  <rect width="${width}" height="${height}" fill="url(#grid)"/>
  <rect x="${width * 0.07}" y="${height * 0.12}" width="${width * 0.86}" height="${height * 0.72}" rx="0" fill="white" stroke="${ink}" stroke-opacity=".14"/>
  <rect x="${width * 0.11}" y="${height * 0.18}" width="${width * 0.34}" height="${height * 0.5}" fill="url(#ink)"/>
  <path d="M${width * 0.16} ${height * 0.58} L${width * 0.24} ${height * 0.43} L${width * 0.31} ${height * 0.5} L${width * 0.39} ${height * 0.31}" fill="none" stroke="${accent}" stroke-width="${isHero ? 10 : 6}" stroke-linecap="round" stroke-linejoin="round"/>
  <circle cx="${width * 0.24}" cy="${height * 0.43}" r="${isHero ? 13 : 8}" fill="${accent}"/>
  <circle cx="${width * 0.39}" cy="${height * 0.31}" r="${isHero ? 13 : 8}" fill="${accent}"/>
  <rect x="${width * 0.51}" y="${height * 0.21}" width="${width * 0.28}" height="${height * 0.045}" fill="${ink}" fill-opacity=".18"/>
  <rect x="${width * 0.51}" y="${height * 0.31}" width="${width * 0.34}" height="${height * 0.035}" fill="${ink}" fill-opacity=".11"/>
  <rect x="${width * 0.51}" y="${height * 0.39}" width="${width * 0.3}" height="${height * 0.035}" fill="${ink}" fill-opacity=".11"/>
  <rect x="${width * 0.51}" y="${height * 0.52}" width="${width * 0.15}" height="${height * 0.12}" fill="${accent}" fill-opacity=".85"/>
  <rect x="${width * 0.69}" y="${height * 0.47}" width="${width * 0.15}" height="${height * 0.17}" fill="${ink}" fill-opacity=".92"/>
  <path d="M${mid - 42} ${height * 0.78}H${mid + 42}" stroke="${accent}" stroke-width="3"/>
  <text x="${width * 0.08}" y="${height * 0.92}" fill="${ink}" font-family="Inter, Arial, sans-serif" font-size="${isHero ? 34 : 22}" font-weight="700" letter-spacing=".5">${compact}</text>
</svg>`;
}

export function buildVisualAsset(
  kind: ServiceVisualAsset["kind"],
  slug: string,
  label: string,
): ServiceVisualAsset {
  const isHero = kind === "hero";
  return {
    kind,
    src: svgDataUri(
      buildAbstractSvg({
        kind,
        slug,
        label,
        width: isHero ? 960 : 640,
        height: isHero ? 720 : 420,
      }),
    ),
    alt: `Illustration ${label}`,
  };
}

export function buildServiceHeroAsset(service: Service): ServiceVisualAsset {
  return buildVisualAsset("hero", service.slug, service.title);
}

function buildGenericSeoContentPack(service: Service): ServiceSeoContentPack {
  const serviceName = service.title.toLowerCase();

  return {
    overviewTitle: `Comprendre le périmètre ${serviceName}`,
    overviewIntro:
      "Une mission utile commence par un cadrage précis : objectifs, documents disponibles, risques, livrables attendus, calendrier et niveau de conseil. Cette base évite les prestations floues et transforme le rendez-vous en plan d'action.",
    coverageTitle: `Ce que couvre une mission de ${serviceName}`,
    coverageIntro:
      "Le contenu exact dépend de votre activité, de votre régime, de vos outils et de votre organisation interne. Les blocs ci-dessous aident à qualifier le besoin avant d'échanger avec un cabinet.",
    coverageCards: [
      {
        title: "Diagnostic initial",
        body:
          "Analyse de l'existant, des échéances, des flux, des accès outils et des irritants qui ralentissent la production.",
      },
      {
        title: "Organisation de la mission",
        body:
          "Définition des responsabilités, du rythme d'échange, des documents attendus et des points de validation avec le dirigeant.",
      },
      {
        title: "Production et contrôle",
        body:
          "Mise en place de livrables clairs, contrôles de cohérence et restitution orientée décision.",
      },
      {
        title: "Pilotage",
        body:
          "Lecture des chiffres, alertes utiles, calendrier d'échéances et priorités pour les prochaines actions.",
      },
    ],
    obligationsTitle: "Points à cadrer avant de déléguer",
    obligationsIntro:
      "Une mission d'expertise comptable doit être lisible pour le dirigeant : ce qui est inclus, ce qui reste à produire en interne et ce qui dépend du régime de l'entreprise.",
    obligationsBlocks: [
      {
        title: "Responsabilités",
        body:
          "La mission doit préciser qui prépare, qui valide et qui conserve les éléments transmis.",
        items: ["Périmètre de mission", "Rythme de transmission", "Validation des livrables"],
      },
      {
        title: "Échéances",
        body:
          "Le calendrier doit distinguer les urgences, les obligations récurrentes et les points de pilotage.",
        items: ["Dates déclaratives", "Clôture", "Rendez-vous de suivi"],
      },
      {
        title: "Outils",
        body:
          "Les accès, exports et automatisations doivent être cadrés dès le départ pour limiter les ressaisies.",
        items: ["Banque", "Facturation", "Paie", "Stockage documentaire"],
      },
    ],
    documentsTitle: "Documents à préparer",
    documentsIntro:
      "Un dossier fluide repose sur des pièces complètes, traçables et partagées dans un rythme connu.",
    documentBlocks: [
      {
        title: "Historique",
        body: "Éléments existants à récupérer avant le démarrage.",
        items: ["Derniers livrables", "Accès outils", "Contrats structurants"],
      },
      {
        title: "Flux",
        body: "Pièces nécessaires pour sécuriser les opérations courantes.",
        items: ["Banque", "Achats", "Ventes", "Notes de frais"],
      },
      {
        title: "Pilotage",
        body: "Données utiles pour rendre les chiffres actionnables.",
        items: ["Tableaux de bord", "Prévisionnel", "Objectifs de marge"],
      },
    ],
    triggersTitle: "Quand demander un accompagnement",
    triggersIntro:
      "Certains signaux rendent le cadrage prioritaire : croissance, retard, changement d'outil, création, reprise ou manque de visibilité.",
    triggerCards: [
      {
        title: "Création ou reprise",
        body: "Installer de bons processus dès le départ et éviter les rattrapages coûteux.",
      },
      {
        title: "Volume en hausse",
        body: "Structurer les échanges lorsque les flux et les justificatifs deviennent difficiles à suivre.",
      },
      {
        title: "Échéances sensibles",
        body: "Sécuriser les déclarations et les livrables qui ne peuvent pas être improvisés.",
      },
      {
        title: "Besoin de pilotage",
        body: "Passer d'une production administrative à une lecture utile pour décider.",
      },
    ],
    deliverablesTitle: "Livrables attendus",
    deliverablesIntro:
      "La bonne mission doit nommer les livrables, leur rythme et leur utilité pour le dirigeant.",
    deliverables: [
      {
        rhythm: "Départ",
        title: "Cadrage",
        body: "Périmètre, calendrier, accès, priorités et documents à récupérer.",
      },
      {
        rhythm: "Suivi",
        title: "Points d'avancement",
        body: "Liste des pièces manquantes, alertes, décisions attendues et prochaines échéances.",
      },
      {
        rhythm: "Restitution",
        title: "Synthèse dirigeant",
        body: "Lecture claire des chiffres, risques et actions à prioriser.",
      },
    ],
    internalLinksTitle: "Missions complémentaires",
    internalLinksIntro:
      "Le besoin principal se combine souvent avec d'autres sujets d'expertise comptable.",
    internalLinks: [
      {
        label: "Conseil fiscal",
        href: "/expertises/fiscalite",
        body: "TVA, impôt, options fiscales et cohérence déclarative.",
      },
      {
        label: "Gestion sociale",
        href: "/expertises/social",
        body: "Paie, DSN, contrats et impacts sociaux des décisions.",
      },
      {
        label: "Conseil en gestion",
        href: "/expertises/conseil-gestion",
        body: "Tableaux de bord, marge, trésorerie et prévisionnel.",
      },
    ],
  };
}

function buildSpecificSeoContentPack(service: Service): ServiceSeoContentPack | null {
  if (service.slug === "fiscalite") {
    return {
      overviewTitle: "Conseil fiscal : sécuriser les choix avant la déclaration",
      overviewIntro:
        "Le conseil fiscal ne consiste pas seulement à remplir une déclaration. Une mission utile relie la comptabilité, le régime d'imposition, la TVA, la rémunération du dirigeant, les investissements, les échéances et les risques de contrôle. L'objectif est de payer l'impôt juste, d'éviter les erreurs répétées et d'anticiper les conséquences fiscales avant de signer un bail, recruter, distribuer des dividendes ou changer de statut. Le dirigeant doit aussi comprendre ce qui relève d'une obligation, d'une option, d'un arbitrage patrimonial ou d'une simple organisation de calendrier fiscal.",
      coverageTitle: "Ce que couvre une mission de conseil fiscal",
      coverageIntro:
        "Les dirigeants cherchent souvent une réponse ponctuelle, mais la fiscalité devient performante quand elle est suivie dans la durée, avec un calendrier clair et des contrôles de cohérence.",
      coverageCards: [
        {
          title: "TVA et cadrage des flux",
          body:
            "Analyse des taux, exigibilité, opérations intracommunautaires, franchise, autoliquidation, ventes encaissées et cohérence entre facturation, banque et déclarations de TVA.",
        },
        {
          title: "Impôt sur les sociétés ou impôt sur le revenu",
          body:
            "Lecture du résultat, arbitrage IS/IR lorsque c'est possible, suivi des acomptes, reports déficitaires, crédits d'impôt et conséquences des décisions de fin d'exercice.",
        },
        {
          title: "Rémunération et dividendes",
          body:
            "Simulation de rémunération du dirigeant, dividendes, charges sociales, prélèvement à la source et impacts sur la trésorerie personnelle comme sur celle de l'entreprise.",
        },
        {
          title: "CFE, CVAE et taxes annexes",
          body:
            "Identification des taxes applicables selon l'activité, les locaux, les seuils, la valeur ajoutée, les implantations et les options déclaratives disponibles.",
        },
        {
          title: "Contrôle fiscal et examen de conformité",
          body:
            "Préparation des justificatifs, revue des points sensibles, cohérence des déclarations, échanges avec l'administration et cadrage d'un éventuel examen de conformité fiscale.",
        },
        {
          title: "Transmission et restructuration",
          body:
            "Anticipation des plus-values, apports, cessions, holding, reprise, transmission familiale ou changement de structure avant que les choix juridiques ne figent la fiscalité.",
        },
      ],
      obligationsTitle: "Points fiscaux à clarifier avant de déléguer",
      obligationsIntro:
        "La fiscalité dépend de votre statut, de votre régime réel ou simplifié, de votre activité, de vos seuils et de vos opérations exceptionnelles. La mission doit donc distinguer déclaration, conseil et assistance.",
      obligationsBlocks: [
        {
          title: "Déclarations incluses",
          body:
            "La proposition doit préciser les déclarations prises en charge et les impôts seulement surveillés.",
          items: ["TVA", "IS ou IR", "CFE", "CVAE", "Liasse fiscale", "Crédits d'impôt"],
        },
        {
          title: "Options et arbitrages",
          body:
            "Les décisions fiscales doivent être documentées avant l'échéance, pas corrigées dans l'urgence.",
          items: ["Choix IS/IR", "Régime de TVA", "Rémunération", "Distribution", "Amortissements"],
        },
        {
          title: "Traçabilité",
          body:
            "Les justificatifs et calculs doivent rester lisibles pour un contrôle ou une reprise de dossier.",
          items: ["Notes de calcul", "Courriers fiscaux", "Historique déclaratif", "Pièces justificatives"],
        },
      ],
      documentsTitle: "Documents à préparer pour un diagnostic fiscal",
      documentsIntro:
        "Un bon diagnostic fiscal part des déclarations déjà produites, des flux réels et des décisions à venir. Plus les pièces sont complètes, plus l'arbitrage est fiable.",
      documentBlocks: [
        {
          title: "Déclarations récentes",
          body:
            "Elles permettent de comprendre la continuité fiscale du dossier et les éventuels écarts.",
          items: ["TVA", "Liasse fiscale", "IS ou IR", "CFE", "Avis d'imposition"],
        },
        {
          title: "Comptabilité et résultat",
          body:
            "La fiscalité se lit à partir du résultat comptable, des retraitements et des écritures de clôture.",
          items: ["Balance", "Grand livre", "Bilan", "Compte de résultat"],
        },
        {
          title: "Flux sensibles",
          body:
            "Certains flux appellent un contrôle précis avant déclaration.",
          items: ["Export ventes", "Achats intracommunautaires", "Immobilisations", "Subventions"],
        },
        {
          title: "Situation du dirigeant",
          body:
            "La rémunération et les dividendes doivent être analysés avec les cotisations et l'impôt personnel.",
          items: ["Bulletins", "Dividendes", "Prélèvement à la source", "Statut social"],
        },
        {
          title: "Projets à venir",
          body:
            "Investir, recruter, céder ou changer de statut modifie souvent la fiscalité du prochain exercice.",
          items: ["Business plan", "Projet d'investissement", "Cession", "Holding"],
        },
        {
          title: "Échanges avec l'administration",
          body:
            "Tout courrier reçu doit être relu avant réponse pour éviter une position mal formulée.",
          items: ["Demandes d'information", "Mises en demeure", "Contrôles", "Rescrits"],
        },
      ],
      triggersTitle: "Quand demander un conseil fiscal",
      triggersIntro:
        "La fiscalité devient stratégique dès qu'un changement modifie le résultat, les flux, les seuils ou la rémunération du dirigeant.",
      triggerCards: [
        {
          title: "TVA complexe",
          body:
            "E-commerce, prestations internationales, autoliquidation, taux multiples ou franchise : les erreurs de TVA se répètent vite.",
        },
        {
          title: "Résultat en forte hausse",
          body:
            "Un bénéfice supérieur aux prévisions impose d'anticiper IS, rémunération, dividendes, acomptes et trésorerie.",
        },
        {
          title: "Contrôle ou courrier fiscal",
          body:
            "Un échange avec l'administration doit être traité avec une chronologie, des preuves et une réponse techniquement cadrée.",
        },
        {
          title: "Projet structurant",
          body:
            "Acquisition, cession, holding, SCI, recrutement ou changement de statut doivent être fiscalement simulés avant signature.",
        },
      ],
      deliverablesTitle: "Livrables attendus d'une mission fiscale",
      deliverablesIntro:
        "Une mission fiscale performante produit des arbitrages documentés, pas seulement des formulaires transmis.",
      deliverables: [
        {
          rhythm: "Diagnostic",
          title: "Cartographie fiscale",
          body:
            "Régime, échéances, déclarations, taxes applicables, options ouvertes et points de vigilance à traiter.",
        },
        {
          rhythm: "Mensuel",
          title: "Suivi TVA et flux sensibles",
          body:
            "Contrôles de cohérence, justificatifs manquants, opérations exceptionnelles et alertes avant déclaration.",
        },
        {
          rhythm: "Clôture",
          title: "Résultat fiscal et liasse",
          body:
            "Retraitements, crédits d'impôt, reports, acomptes et cohérence entre comptabilité et fiscalité.",
        },
        {
          rhythm: "Décision",
          title: "Note d'arbitrage",
          body:
            "Simulation IS/IR, rémunération, dividendes, investissement ou restructuration avec impacts et limites.",
        },
      ],
      internalLinksTitle: "Missions complémentaires à relier à la fiscalité",
      internalLinksIntro:
        "La fiscalité dépend de la qualité comptable, du social, de la création et du pilotage financier.",
      internalLinks: [
        { label: "Comptabilité générale", href: "/expertises/comptabilite", body: "Base fiable pour TVA, résultat fiscal, bilan et liasse." },
        { label: "Gestion sociale", href: "/expertises/social", body: "Rémunération, paie, charges et arbitrages dirigeant." },
        { label: "Création d'entreprise", href: "/expertises/creation-entreprise", body: "Choix du statut, IS/IR, TVA et premiers arbitrages." },
        { label: "Conseil en gestion", href: "/expertises/conseil-gestion", body: "Prévisionnel, trésorerie fiscale et scénarios de résultat." },
      ],
    };
  }

  if (service.slug === "social") {
    return {
      overviewTitle: "Gestion sociale : sécuriser la paie, les DSN et les décisions RH",
      overviewIntro:
        "La gestion sociale est un sujet de conformité, de confiance salarié et de pilotage. Une mission bien cadrée ne se limite pas à produire des bulletins : elle collecte les variables, applique la convention collective, télétransmet la DSN, suit les absences, prépare les entrées et sorties, puis alerte le dirigeant avant qu'une erreur de paie, un contrat imprécis ou une rupture mal préparée ne devienne un risque. Elle doit aussi rendre lisibles les coûts réels de l'emploi, les délais de validation et les documents que chaque salarié doit recevoir.",
      coverageTitle: "Ce que couvre une mission de gestion sociale",
      coverageIntro:
        "La SERP paie valorise les pages qui expliquent les flux réels : variables, bulletins, DSN, embauches, sorties et conseil RH. La page doit donc nommer ces briques clairement.",
      coverageCards: [
        {
          title: "Bulletins de paie",
          body:
            "Production des bulletins mensuels, intégration des primes, heures supplémentaires, absences, avantages en nature, titres restaurant, acomptes et retenues.",
        },
        {
          title: "DSN et déclarations sociales",
          body:
            "Télétransmission de la déclaration sociale nominative, suivi des cotisations URSSAF, retraite, prévoyance, mutuelle et prélèvement à la source.",
        },
        {
          title: "Entrées salariés",
          body:
            "DPAE, contrat de travail, période d'essai, affiliation mutuelle, collecte des informations salarié et paramétrage dans l'outil de paie.",
        },
        {
          title: "Sorties et ruptures",
          body:
            "Solde de tout compte, certificat de travail, attestation employeur, indemnités, congés restants et calendrier de rupture conventionnelle ou licenciement.",
        },
        {
          title: "Convention collective",
          body:
            "Lecture des minima, classifications, primes, temps de travail, congés, majorations et règles propres au secteur d'activité.",
        },
        {
          title: "Conseil RH et audit social",
          body:
            "Revue des contrats, processus de paie, absences, avantages, risques URSSAF et points de conformité avant croissance ou contrôle.",
        },
      ],
      obligationsTitle: "Points sociaux à cadrer avant de déléguer",
      obligationsIntro:
        "La paie dépend de données sensibles et mouvantes. La mission doit donc préciser qui collecte les variables, qui valide les bulletins et comment les événements salariés sont transmis.",
      obligationsBlocks: [
        {
          title: "Responsabilités",
          body:
            "Le dirigeant reste responsable des informations transmises, le cabinet sécurise le traitement et signale les incohérences.",
          items: ["Validation des variables", "Justificatifs d'absence", "Contrats", "Calendrier de paie"],
        },
        {
          title: "Déclarations",
          body:
            "La DSN et les déclarations événementielles doivent être incluses ou exclues explicitement.",
          items: ["DSN mensuelle", "Arrêt maladie", "Congé maternité", "Fin de contrat", "PAS"],
        },
        {
          title: "Cadre RH",
          body:
            "Le suivi social doit intégrer la convention collective, les accords internes et les pratiques réelles.",
          items: ["Convention collective", "Temps de travail", "Télétravail", "Primes", "Avantages"],
        },
      ],
      documentsTitle: "Documents à préparer pour un diagnostic social",
      documentsIntro:
        "Le diagnostic social devient utile quand le cabinet voit les contrats, la paie existante, la convention collective et les événements salariés à venir.",
      documentBlocks: [
        {
          title: "Dossier entreprise",
          body:
            "Les informations de base permettent de paramétrer correctement la paie et les organismes.",
          items: ["SIRET", "Convention collective", "Caisses", "Mutuelle", "Prévoyance"],
        },
        {
          title: "Dossiers salariés",
          body:
            "Chaque bulletin dépend d'informations personnelles et contractuelles précises.",
          items: ["Contrat", "RIB", "État civil", "Taux PAS", "Affiliation mutuelle"],
        },
        {
          title: "Variables mensuelles",
          body:
            "Le cabinet doit connaître les événements du mois avant production.",
          items: ["Heures", "Primes", "Absences", "Congés", "Notes de frais"],
        },
        {
          title: "Historique de paie",
          body:
            "La reprise d'un dossier exige les bulletins et DSN précédents pour éviter les ruptures de continuité.",
          items: ["Bulletins", "DSN", "Journal de paie", "Livre de paie"],
        },
        {
          title: "Entrées et sorties",
          body:
            "Les délais sont courts : les événements doivent être signalés avant la date d'effet.",
          items: ["DPAE", "Promesse d'embauche", "Rupture", "Solde de tout compte"],
        },
        {
          title: "Contrôles et litiges",
          body:
            "Les échanges avec l'URSSAF ou un salarié doivent être préparés avec preuves et chronologie.",
          items: ["Courriers URSSAF", "Mises en demeure", "Réclamations", "Accords écrits"],
        },
      ],
      triggersTitle: "Quand déléguer ou auditer la paie",
      triggersIntro:
        "La paie doit être reprise avant l'erreur répétée : embauche, croissance, changement de convention ou retard DSN sont des signaux forts.",
      triggerCards: [
        {
          title: "Première embauche",
          body:
            "Le premier salarié impose DPAE, contrat, mutuelle, paie, DSN et calendrier social sans improvisation.",
        },
        {
          title: "Croissance de l'équipe",
          body:
            "Plus il y a de salariés, plus les variables, absences et validations nécessitent un processus clair.",
        },
        {
          title: "Erreur ou retard de paie",
          body:
            "Un bulletin contesté, une DSN corrigée ou une absence mal traitée justifie une revue du processus.",
        },
        {
          title: "Rupture sensible",
          body:
            "Licenciement, rupture conventionnelle ou départ conflictuel exigent calendrier, calculs et documents de sortie fiables.",
        },
      ],
      deliverablesTitle: "Livrables attendus d'une mission sociale",
      deliverablesIntro:
        "La mission doit rendre visibles les échéances sociales, les validations et les documents remis au salarié.",
      deliverables: [
        {
          rhythm: "Mensuel",
          title: "Bulletins et DSN",
          body:
            "Bulletins, journal de paie, DSN, état des charges et liste des variables utilisées.",
        },
        {
          rhythm: "Événement",
          title: "Entrées et sorties",
          body:
            "DPAE, contrat, avenant, solde de tout compte, attestation employeur et certificat de travail.",
        },
        {
          rhythm: "Contrôle",
          title: "Revue de conformité",
          body:
            "Contrats, convention collective, minima, avantages, temps de travail et risques URSSAF.",
        },
        {
          rhythm: "Pilotage",
          title: "Synthèse sociale",
          body:
            "Masse salariale, charges, absences, effectifs, alertes et décisions RH à anticiper.",
        },
      ],
      internalLinksTitle: "Missions complémentaires à relier au social",
      internalLinksIntro:
        "Le social influence la comptabilité, la fiscalité, la création et le pilotage de marge.",
      internalLinks: [
        { label: "Comptabilité générale", href: "/expertises/comptabilite", body: "Charges de personnel, provisions, OD de paie et clôture." },
        { label: "Conseil fiscal", href: "/expertises/fiscalite", body: "Rémunération dirigeant, dividendes, PAS et arbitrages sociaux." },
        { label: "Création d'entreprise", href: "/expertises/creation-entreprise", body: "Premier salarié, statut social du dirigeant et premiers contrats." },
        { label: "Conseil en gestion", href: "/expertises/conseil-gestion", body: "Masse salariale, productivité, marge et budget RH." },
      ],
    };
  }

  if (service.slug === "creation-entreprise") {
    return {
      overviewTitle: "Création d'entreprise : poser les bons choix avant l'immatriculation",
      overviewIntro:
        "Créer une entreprise ne se résume pas à déposer des statuts. Les décisions prises au départ engagent la fiscalité, la protection sociale du dirigeant, la TVA, la rémunération, le besoin de financement, la facturation, la comptabilité et parfois l'entrée d'associés. Une page utile doit aider le porteur de projet à comprendre ce qui se décide maintenant, ce qui peut évoluer ensuite et ce qui doit être sécurisé avant le lancement. Elle doit également traduire le projet en chiffres : marge, charges fixes, trésorerie de départ, seuil de rentabilité, calendrier des premières déclarations et capacité à se rémunérer sans fragiliser l'activité.",
      coverageTitle: "Ce que couvre un accompagnement à la création",
      coverageIntro:
        "Les pages qui convertissent le mieux détaillent le parcours : statut, business plan, formalités, fiscalité, outils et premier calendrier comptable.",
      coverageCards: [
        {
          title: "Choix du statut juridique",
          body:
            "Comparaison micro-entreprise, entreprise individuelle, EURL, SARL, SASU, SAS ou SCI selon responsabilité, associés, régime fiscal, protection sociale et croissance prévue.",
        },
        {
          title: "Business plan et prévisionnel",
          body:
            "Construction du chiffre d'affaires prévisionnel, charges fixes, marge, besoin en fonds de roulement, trésorerie et seuil de rentabilité.",
        },
        {
          title: "Fiscalité de départ",
          body:
            "Arbitrage IS/IR, régime de TVA, option réelle ou simplifiée, CFE, traitement des frais de lancement et calendrier des premières déclarations.",
        },
        {
          title: "Rémunération du dirigeant",
          body:
            "Simulation salaire, dividendes, protection sociale, charges, trésorerie personnelle et équilibre avec le besoin de financement de l'entreprise.",
        },
        {
          title: "Formalités et statuts",
          body:
            "Rédaction ou relecture des statuts, dépôt de capital, annonce légale, guichet unique, bénéficiaires effectifs et obtention du Kbis.",
        },
        {
          title: "Mise en place comptable",
          body:
            "Organisation de la facturation, compte bancaire, logiciel, conservation des justificatifs, plan comptable et premier calendrier d'échéances.",
        },
      ],
      obligationsTitle: "Points à clarifier avant de créer",
      obligationsIntro:
        "La création doit éviter les choix irréversibles ou coûteux à corriger : mauvais statut, TVA mal anticipée, associés mal cadrés ou prévisionnel déconnecté.",
      obligationsBlocks: [
        {
          title: "Situation personnelle",
          body:
            "Le statut dépend aussi de la situation du créateur et de ses objectifs de rémunération.",
          items: ["ARE ou maintien d'emploi", "Protection sociale", "Patrimoine", "Associés", "Famille"],
        },
        {
          title: "Modèle économique",
          body:
            "Le prévisionnel doit tester les hypothèses, pas seulement produire un tableau pour la banque.",
          items: ["Marge", "Prix", "Charges fixes", "BFR", "Investissements"],
        },
        {
          title: "Cadre juridique",
          body:
            "Les statuts doivent prévoir la gouvernance et les événements probables.",
          items: ["Répartition du capital", "Pouvoirs", "Sortie d'associé", "Dividendes", "Objet social"],
        },
      ],
      documentsTitle: "Documents à préparer pour créer l'entreprise",
      documentsIntro:
        "Le premier rendez-vous doit permettre de valider le projet, les contraintes personnelles et les formalités à lancer.",
      documentBlocks: [
        {
          title: "Projet",
          body:
            "La description de l'activité permet de vérifier le statut, la TVA, les assurances et les obligations sectorielles.",
          items: ["Pitch", "Offres", "Prix", "Clients visés", "Secteur"],
        },
        {
          title: "Prévisionnel",
          body:
            "Les hypothèses financières servent à arbitrer financement et rémunération.",
          items: ["CA prévu", "Charges", "Investissements", "Trésorerie", "Financement"],
        },
        {
          title: "Créateur et associés",
          body:
            "Le statut social et les pouvoirs dépendent des personnes impliquées.",
          items: ["Pièces d'identité", "Situation sociale", "Parts", "Apports", "Mandats"],
        },
        {
          title: "Adresse et banque",
          body:
            "Le siège et le dépôt de capital conditionnent les formalités.",
          items: ["Domiciliation", "Bail", "Attestation", "Dépôt de capital"],
        },
        {
          title: "Contrats clés",
          body:
            "Certains engagements doivent être relus avant signature au nom de la future structure.",
          items: ["Bail commercial", "Contrat client", "Franchise", "Licence", "Assurance"],
        },
        {
          title: "Outils",
          body:
            "Installer les bons outils évite les rattrapages dès les premières factures.",
          items: ["Facturation", "Banque", "Caisse", "Paie", "Stockage documentaire"],
        },
      ],
      triggersTitle: "Quand se faire accompagner avant de lancer",
      triggersIntro:
        "Plus le projet engage de capital, de TVA, d'associés ou de salariés, plus l'accompagnement amont crée de valeur.",
      triggerCards: [
        {
          title: "Choix SASU ou EURL",
          body:
            "L'arbitrage influence charges sociales, protection, dividendes, rémunération et fiscalité personnelle.",
        },
        {
          title: "Recherche de financement",
          body:
            "Banque, prêt d'honneur ou investisseurs demandent un prévisionnel cohérent et défendable.",
        },
        {
          title: "Associés au capital",
          body:
            "Les statuts et pactes doivent prévoir décision, sortie, rémunération, blocage et répartition des rôles.",
        },
        {
          title: "TVA ou activité réglementée",
          body:
            "Certaines activités imposent des déclarations, assurances, autorisations ou règles de facturation dès le départ.",
        },
      ],
      deliverablesTitle: "Livrables attendus d'un accompagnement création",
      deliverablesIntro:
        "Le créateur doit repartir avec des décisions argumentées, pas seulement une immatriculation.",
      deliverables: [
        {
          rhythm: "Diagnostic",
          title: "Comparatif de statuts",
          body:
            "Synthèse des options, impacts fiscaux, sociaux, juridiques et points de vigilance.",
        },
        {
          rhythm: "Prévisionnel",
          title: "Business plan financier",
          body:
            "Compte de résultat, trésorerie, investissements, BFR, seuil de rentabilité et scénarios.",
        },
        {
          rhythm: "Formalités",
          title: "Dossier d'immatriculation",
          body:
            "Statuts, annonce légale, dépôt de capital, bénéficiaires effectifs et suivi guichet unique.",
        },
        {
          rhythm: "Démarrage",
          title: "Calendrier post-création",
          body:
            "TVA, comptabilité, paie, assurances, facturation, conservation des pièces et premiers rendez-vous.",
        },
      ],
      internalLinksTitle: "Missions complémentaires à relier à la création",
      internalLinksIntro:
        "Créer proprement prépare les prochaines missions comptables, fiscales et sociales.",
      internalLinks: [
        { label: "Comptabilité générale", href: "/expertises/comptabilite", body: "Organisation des factures, banque, justificatifs et clôture." },
        { label: "Conseil fiscal", href: "/expertises/fiscalite", body: "IS/IR, TVA, CFE, rémunération et premiers arbitrages." },
        { label: "Gestion sociale", href: "/expertises/social", body: "Statut du dirigeant, première embauche, paie et DSN." },
        { label: "Conseil en gestion", href: "/expertises/conseil-gestion", body: "Prévisionnel, marge, trésorerie et tableaux de bord." },
      ],
    };
  }

  if (service.slug === "conseil-gestion") {
    return {
      overviewTitle: "Conseil en gestion : transformer les chiffres en décisions",
      overviewIntro:
        "Le conseil en gestion aide le dirigeant à ne plus piloter uniquement avec le solde bancaire ou le bilan annuel. Une mission structurée met en place des tableaux de bord, suit la trésorerie, la marge, les coûts, le seuil de rentabilité et les écarts entre prévu et réalisé. Le but est simple : repérer plus tôt les tensions, arbitrer les investissements et décider avec des données fiables. Le dispositif doit rester actionnable : peu d'indicateurs, une source claire, une fréquence connue et des commentaires qui expliquent pourquoi l'écart existe et quoi faire ensuite.",
      coverageTitle: "Ce que couvre une mission de conseil en gestion",
      coverageIntro:
        "Les contenus concurrents insistent sur les indicateurs clés, le prévisionnel et la décision. La LP doit donc montrer comment Skoria passe du chiffre brut à l'action.",
      coverageCards: [
        {
          title: "Tableaux de bord dirigeants",
          body:
            "Sélection d'indicateurs utiles : chiffre d'affaires, marge, trésorerie, charges fixes, encours clients, BFR, résultat estimé et alertes.",
        },
        {
          title: "Prévisionnel financier",
          body:
            "Construction de scénarios de chiffre d'affaires, charges, recrutements, investissements, TVA, impôts et trésorerie mensuelle.",
        },
        {
          title: "Analyse de rentabilité",
          body:
            "Lecture des marges par activité, client, point de vente ou offre pour identifier ce qui finance réellement l'entreprise.",
        },
        {
          title: "Pilotage de trésorerie",
          body:
            "Suivi des encaissements, décaissements, échéances fiscales et sociales, besoin en fonds de roulement et tensions à anticiper.",
        },
        {
          title: "Budget et écarts",
          body:
            "Comparaison prévu/réalisé, explication des écarts, actions correctives et priorités du mois suivant.",
        },
        {
          title: "Décisions de croissance",
          body:
            "Simulation d'embauche, financement, hausse de prix, investissement, changement d'offre ou ouverture d'un nouveau site.",
        },
      ],
      obligationsTitle: "Points à cadrer avant de piloter",
      obligationsIntro:
        "Un tableau de bord inutile encombre. Un bon dispositif définit les décisions à prendre, la source des données, la fréquence de mise à jour et le niveau de fiabilité attendu.",
      obligationsBlocks: [
        {
          title: "Objectif de pilotage",
          body:
            "Les indicateurs doivent répondre à une question précise du dirigeant.",
          items: ["Trésorerie", "Marge", "Croissance", "Rentabilité", "Financement"],
        },
        {
          title: "Données sources",
          body:
            "Le reporting dépend de données comptables, bancaires, commerciales et sociales cohérentes.",
          items: ["Comptabilité", "Banque", "Facturation", "Paie", "CRM"],
        },
        {
          title: "Rythme de décision",
          body:
            "Le reporting doit arriver avant la décision, pas après la clôture annuelle.",
          items: ["Hebdomadaire", "Mensuel", "Trimestriel", "Comité de pilotage"],
        },
      ],
      documentsTitle: "Documents à préparer pour un diagnostic de gestion",
      documentsIntro:
        "Pour bâtir un pilotage utile, le cabinet doit comprendre l'activité, les marges, les échéances et les objectifs du dirigeant.",
      documentBlocks: [
        {
          title: "Comptabilité récente",
          body:
            "Elle sert de base pour reconstituer les charges, la marge et le résultat.",
          items: ["Balance", "Grand livre", "Compte de résultat", "Bilan"],
        },
        {
          title: "Banque et trésorerie",
          body:
            "Les flux bancaires révèlent les cycles d'encaissement et les tensions.",
          items: ["Relevés", "Échéancier prêts", "Découverts", "Placements"],
        },
        {
          title: "Ventes et marge",
          body:
            "Le pilotage dépend du détail commercial, pas seulement du chiffre d'affaires global.",
          items: ["CA par offre", "Marge", "Remises", "Panier moyen", "Stocks"],
        },
        {
          title: "Charges fixes",
          body:
            "Les coûts récurrents déterminent le seuil de rentabilité.",
          items: ["Loyer", "Salaires", "Abonnements", "Assurances", "Sous-traitance"],
        },
        {
          title: "Objectifs",
          body:
            "Les indicateurs doivent être reliés aux ambitions réelles du dirigeant.",
          items: ["Croissance", "Recrutement", "Investissement", "Cession", "Financement"],
        },
        {
          title: "Outils",
          body:
            "Les exports disponibles orientent l'automatisation du tableau de bord.",
          items: ["Facturation", "Caisse", "CRM", "Paie", "Banque"],
        },
      ],
      triggersTitle: "Quand installer un pilotage de gestion",
      triggersIntro:
        "La bonne alerte n'est pas toujours une perte : parfois, c'est une croissance trop rapide ou une marge qui se dégrade sans bruit.",
      triggerCards: [
        {
          title: "Trésorerie imprévisible",
          body:
            "Le compte bancaire varie fortement et le dirigeant ne sait pas quelles échéances pèsent sur les prochaines semaines.",
        },
        {
          title: "Marge floue",
          body:
            "Le chiffre d'affaires progresse mais le résultat ne suit pas, ou certaines offres semblent consommer trop de ressources.",
        },
        {
          title: "Décision d'embauche",
          body:
            "Un recrutement doit être simulé avec charges, productivité attendue, trésorerie et point mort.",
        },
        {
          title: "Demande bancaire",
          body:
            "Un financement exige un prévisionnel robuste, lisible et raccord avec les chiffres historiques.",
        },
      ],
      deliverablesTitle: "Livrables attendus d'une mission de pilotage",
      deliverablesIntro:
        "Le reporting doit produire une décision : continuer, corriger, investir, recruter, augmenter les prix ou sécuriser la trésorerie.",
      deliverables: [
        {
          rhythm: "Départ",
          title: "Diagnostic de performance",
          body:
            "Lecture des marges, charges, trésorerie, rentabilité et irritants de pilotage.",
        },
        {
          rhythm: "Mensuel",
          title: "Tableau de bord",
          body:
            "Indicateurs clés, écarts, alertes, commentaires et actions à prioriser.",
        },
        {
          rhythm: "Scénario",
          title: "Prévisionnel",
          body:
            "Projection de résultat, trésorerie, TVA, impôts, investissements et financement.",
        },
        {
          rhythm: "Décision",
          title: "Note dirigeant",
          body:
            "Synthèse courte pour arbitrer une embauche, un prix, un investissement ou un financement.",
        },
      ],
      internalLinksTitle: "Missions complémentaires à relier au pilotage",
      internalLinksIntro:
        "Le conseil en gestion s'appuie sur une comptabilité fiable et se connecte aux décisions fiscales et sociales.",
      internalLinks: [
        { label: "Comptabilité générale", href: "/expertises/comptabilite", body: "Données fiables pour alimenter les indicateurs." },
        { label: "Conseil fiscal", href: "/expertises/fiscalite", body: "Impact IS, TVA, CFE et arbitrages de résultat." },
        { label: "Gestion sociale", href: "/expertises/social", body: "Masse salariale, charges et simulations d'embauche." },
        { label: "Création d'entreprise", href: "/expertises/creation-entreprise", body: "Prévisionnel, financement et premiers tableaux de bord." },
      ],
    };
  }

  if (service.slug === "audit") {
    return {
      overviewTitle: "Audit & commissariat : fiabiliser les comptes et les procédures",
      overviewIntro:
        "L'audit et le commissariat aux comptes répondent à un besoin de confiance. Selon le contexte, il peut s'agir d'une mission légale de certification, d'un audit contractuel, d'une revue de procédures, d'une due diligence ou d'un contrôle ciblé avant financement, cession ou croissance externe. La page doit expliquer la différence entre obligation, assurance et diagnostic, sans laisser croire que toutes les entreprises ont le même besoin. Le dirigeant doit comprendre ce que l'auditeur teste, quelles preuves préparer, quels cycles sont sensibles et comment les recommandations deviennent un plan d'action concret.",
      coverageTitle: "Ce que couvre une mission d'audit",
      coverageIntro:
        "Les pages les plus utiles distinguent audit légal, audit contractuel, revue de comptes et contrôle interne. C'est ce niveau de clarté qui rassure les dirigeants.",
      coverageCards: [
        {
          title: "Audit légal",
          body:
            "Mission de commissariat aux comptes lorsque les seuils ou la forme juridique l'imposent, avec certification de la régularité, sincérité et image fidèle des comptes.",
        },
        {
          title: "Audit contractuel",
          body:
            "Contrôle volontaire demandé par l'entreprise, un associé, un financeur ou un repreneur pour sécuriser un point précis sans obligation légale.",
        },
        {
          title: "Revue des comptes annuels",
          body:
            "Analyse du bilan, compte de résultat, annexe, écritures sensibles, cut-off, provisions, immobilisations, stocks et comptes de tiers.",
        },
        {
          title: "Contrôle interne",
          body:
            "Revue des procédures de facturation, achats, paiements, caisse, habilitations, séparation des tâches et conservation documentaire.",
        },
        {
          title: "Due diligence",
          body:
            "Audit d'acquisition ou de cession : qualité du résultat, dette nette, BFR, risques fiscaux, sociaux, contrats et dépendances clients.",
        },
        {
          title: "Alerte et continuité",
          body:
            "Identification des faits susceptibles de compromettre la continuité d'exploitation et préparation d'une lecture transparente pour les parties prenantes.",
        },
      ],
      obligationsTitle: "Points d'audit à clarifier avant la mission",
      obligationsIntro:
        "L'audit exige indépendance, périmètre clair, calendrier et accès aux pièces. Il faut distinguer ce qui relève du commissaire aux comptes, de l'expert-comptable et d'une mission contractuelle.",
      obligationsBlocks: [
        {
          title: "Obligation ou choix volontaire",
          body:
            "La nomination d'un commissaire aux comptes dépend notamment de seuils et de la structure.",
          items: ["Total bilan", "Chiffre d'affaires", "Salariés", "Groupe", "Association"],
        },
        {
          title: "Indépendance",
          body:
            "Le professionnel qui audite ne doit pas se trouver dans une situation incompatible avec la mission.",
          items: ["CAC", "Expert-comptable", "Mission contractuelle", "Conflits d'intérêts"],
        },
        {
          title: "Périmètre",
          body:
            "L'audit doit nommer les cycles, comptes ou procédures testés.",
          items: ["Ventes", "Achats", "Paie", "Trésorerie", "Stocks", "Fiscalité"],
        },
      ],
      documentsTitle: "Documents à préparer pour une mission d'audit",
      documentsIntro:
        "Un audit efficace dépend de preuves accessibles, de soldes justifiés et d'un calendrier qui laisse le temps aux demandes complémentaires.",
      documentBlocks: [
        {
          title: "Comptes annuels",
          body:
            "Ils constituent le point de départ de la revue.",
          items: ["Bilan", "Compte de résultat", "Annexe", "Liasse fiscale"],
        },
        {
          title: "Journaux et balances",
          body:
            "Ils permettent de remonter des soldes aux écritures.",
          items: ["Balance générale", "Grand livre", "Journaux", "FEC"],
        },
        {
          title: "Justificatifs",
          body:
            "Les pièces probantes sécurisent les tests sur les cycles.",
          items: ["Factures", "Contrats", "Relevés bancaires", "Inventaires"],
        },
        {
          title: "Procédures",
          body:
            "Le contrôle interne repose sur la façon dont l'entreprise produit et valide l'information.",
          items: ["Process achats", "Process ventes", "Habilitations", "Validation paiements"],
        },
        {
          title: "Juridique",
          body:
            "Les décisions sociales et juridiques peuvent impacter les comptes.",
          items: ["PV d'assemblée", "Statuts", "Registres", "Contrats clés"],
        },
        {
          title: "Risques",
          body:
            "Les litiges ou engagements doivent être identifiés avant rapport.",
          items: ["Contentieux", "Garanties", "Engagements hors bilan", "Courriers"],
        },
      ],
      triggersTitle: "Quand lancer un audit",
      triggersIntro:
        "L'audit n'est pas seulement une obligation. Il devient utile quand une décision externe exige des comptes crédibles et des procédures lisibles.",
      triggerCards: [
        {
          title: "Seuils CAC franchis",
          body:
            "Bilan, chiffre d'affaires ou salariés peuvent rendre la nomination obligatoire selon la structure.",
        },
        {
          title: "Levée ou financement",
          body:
            "Banque, investisseur ou partenaire demandent une lecture indépendante des comptes et risques.",
        },
        {
          title: "Cession ou acquisition",
          body:
            "Une due diligence limite les mauvaises surprises sur marge, dette, contrats, fiscalité ou social.",
        },
        {
          title: "Procédures fragiles",
          body:
            "Paiements, stocks, caisse, facturation ou habilitations nécessitent une revue lorsque les contrôles internes sont faibles.",
        },
      ],
      deliverablesTitle: "Livrables attendus d'une mission d'audit",
      deliverablesIntro:
        "Le livrable dépend du cadre : certification, rapport contractuel, note de recommandations ou synthèse de risques.",
      deliverables: [
        {
          rhythm: "Cadrage",
          title: "Lettre de mission",
          body:
            "Objet, périmètre, calendrier, responsabilités, accès, honoraires et limites de la mission.",
        },
        {
          rhythm: "Tests",
          title: "Programme de travail",
          body:
            "Cycles audités, échantillons, demandes de pièces, contrôles et points ouverts.",
        },
        {
          rhythm: "Restitution",
          title: "Rapport ou synthèse",
          body:
            "Constats, réserves éventuelles, risques, recommandations et priorités de correction.",
        },
        {
          rhythm: "Suivi",
          title: "Plan d'action",
          body:
            "Corrections comptables, renforcement des procédures, calendrier et responsables internes.",
        },
      ],
      internalLinksTitle: "Missions complémentaires à relier à l'audit",
      internalLinksIntro:
        "Un audit solide dépend de la comptabilité, du social, de la fiscalité et du pilotage.",
      internalLinks: [
        { label: "Comptabilité générale", href: "/expertises/comptabilite", body: "Comptes, pièces, clôture et justification des soldes." },
        { label: "Conseil fiscal", href: "/expertises/fiscalite", body: "Risques fiscaux, TVA, IS, liasse et contrôles." },
        { label: "Gestion sociale", href: "/expertises/social", body: "Paie, charges, contrats et risques URSSAF." },
        { label: "Conseil en gestion", href: "/expertises/conseil-gestion", body: "Indicateurs, continuité, BFR et performance." },
      ],
    };
  }

  return null;
}

export function buildServiceSeoContentPack(
  service: Service,
): ServiceSeoContentPack {
  const specificPack = buildSpecificSeoContentPack(service);
  if (specificPack) {
    return specificPack;
  }

  if (service.slug !== "comptabilite") {
    return buildGenericSeoContentPack(service);
  }

  return {
    overviewTitle: "Comptabilité générale : ce que le dirigeant doit vraiment cadrer",
    overviewIntro:
      "La comptabilité générale ne se résume pas à une saisie de factures. Une mission solide organise la preuve comptable, fiabilise les écritures, prépare les déclarations, construit les comptes annuels et transforme la clôture en moment de pilotage. Pour une TPE, une PME, une SCI, un commerce ou une profession libérale, l'enjeu est le même : savoir ce qui est à jour, ce qui manque, ce qui doit être déclaré et ce que les chiffres disent de l'activité.",
    coverageTitle: "Ce que couvre une mission de comptabilité générale",
    coverageIntro:
      "Une page utile détaille le périmètre au lieu de promettre une simple prise en charge. Voici les briques à rendre explicites avant de choisir un cabinet comptable.",
    coverageCards: [
      {
        title: "Tenue comptable courante",
        body:
          "Enregistrement des achats, ventes, encaissements, décaissements, notes de frais, caisse et opérations bancaires. Chaque écriture doit pouvoir être rattachée à une pièce justificative exploitable.",
      },
      {
        title: "Rapprochement bancaire et lettrage",
        body:
          "Contrôle des flux entre relevés bancaires et comptabilité, lettrage clients/fournisseurs, suivi des comptes d'attente et relance des justificatifs manquants avant qu'ils ne bloquent la clôture.",
      },
      {
        title: "TVA et déclarations périodiques",
        body:
          "Préparation des déclarations de TVA, cadrage des taux, contrôle de cohérence avec les ventes et achats, puis suivi des autres taxes selon l'activité, le régime fiscal et les seuils applicables.",
      },
      {
        title: "Révision des comptes",
        body:
          "Contrôles de fin de période : cut-off, immobilisations, stocks, emprunts, charges constatées d'avance, provisions, comptes de tiers et cohérence globale de la balance.",
      },
      {
        title: "Bilan, compte de résultat et annexe",
        body:
          "Production des comptes annuels : bilan actif/passif, compte de résultat, annexe lorsque nécessaire, éléments utiles à l'approbation des comptes et au dépôt au greffe pour les sociétés concernées.",
      },
      {
        title: "Liasse fiscale",
        body:
          "Préparation des tableaux fiscaux, cohérence entre résultat comptable et résultat fiscal, suivi des reports, télétransmission et anticipation des points qui peuvent déclencher des demandes de correction.",
      },
    ],
    obligationsTitle: "Obligations comptables et limites à clarifier",
    obligationsIntro:
      "Un expert-comptable externe n'est pas obligatoire par principe pour tenir sa comptabilité ou déposer ses déclarations. En revanche, les obligations comptables de l'entreprise restent bien réelles et le recours à un professionnel doit être cadré par une lettre de mission.",
    obligationsBlocks: [
      {
        title: "Ce que l'entreprise doit maîtriser",
        body:
          "Selon le statut et le régime, une société commerciale doit gérer la facturation, la tenue comptable, les registres, les comptes annuels et la conservation des documents comptables.",
        items: [
          "Factures et mentions obligatoires",
          "Livre-journal, grand livre ou registres adaptés",
          "Comptes annuels : bilan, compte de résultat, annexe",
          "Conservation des pièces et justificatifs",
        ],
      },
      {
        title: "Ce que la lettre de mission doit préciser",
        body:
          "La lettre de mission évite les zones grises : elle définit les travaux confiés, les responsabilités, le calendrier, les honoraires et les conditions de restitution.",
        items: [
          "Tenue seule ou tenue + révision",
          "Déclarations incluses : TVA, IS, CFE, liasse fiscale",
          "Rythme de suivi et niveau de conseil",
          "Outils, accès et modalités de transmission",
        ],
      },
      {
        title: "Ce qui dépend de votre régime",
        body:
          "Le périmètre varie entre micro-entreprise, entreprise individuelle, SCI, SAS, SARL ou association, et entre régime réel simplifié ou réel normal.",
        items: [
          "Fréquence des déclarations de TVA",
          "Obligations de dépôt des comptes",
          "Volume de justificatifs à traiter",
          "Facturation électronique et e-reporting",
        ],
      },
    ],
    documentsTitle: "Documents à préparer avant le diagnostic comptable",
    documentsIntro:
      "Un rendez-vous utile se prépare avec des documents concrets. L'objectif n'est pas de tout avoir parfait dès le premier échange, mais de mesurer le volume, les risques et la qualité de l'historique.",
    documentBlocks: [
      {
        title: "Flux bancaires",
        body:
          "Les relevés bancaires et exports de comptes permettent de repérer les opérations manquantes, les virements internes, les emprunts et les flux non affectés.",
        items: ["Relevés bancaires", "Accès banque", "Mouvements de caisse", "Emprunts et leasings"],
      },
      {
        title: "Achats et ventes",
        body:
          "Les factures d'achat et de vente servent à vérifier la TVA, les dates d'exigibilité, les avoirs, les encaissements et le rattachement au bon exercice.",
        items: ["Factures clients", "Factures fournisseurs", "Avoirs", "Justificatifs de notes de frais"],
      },
      {
        title: "Paie et social",
        body:
          "Même sur une mission centrée comptabilité, la paie influence les charges, les provisions, les déclarations et la lecture de la marge.",
        items: ["Bulletins de paie", "DSN", "Contrats", "Charges sociales"],
      },
      {
        title: "Fiscalité",
        body:
          "Les dernières déclarations permettent de contrôler la continuité : TVA, IS ou IR, CFE, acomptes, crédits d'impôt et éventuels reports déficitaires.",
        items: ["Déclarations TVA", "Dernière liasse fiscale", "Avis d'imposition", "Courriers fiscaux"],
      },
      {
        title: "Immobilisations et stocks",
        body:
          "Les investissements, amortissements, stocks et inventaires pèsent directement sur le bilan et le résultat.",
        items: ["Tableau des immobilisations", "Inventaire", "Stocks", "Contrats d'assurance"],
      },
      {
        title: "Historique et outils",
        body:
          "La reprise est plus rapide si le cabinet peut accéder aux anciens livrables et comprendre les outils déjà en place.",
        items: ["Balance", "Grand livre", "Journaux", "Logiciel de facturation"],
      },
    ],
    triggersTitle: "Quand déléguer ou reprendre sa comptabilité",
    triggersIntro:
      "Beaucoup de dirigeants attendent la clôture pour agir. Les signaux ci-dessous indiquent qu'un cadrage comptable doit être lancé plus tôt.",
    triggerCards: [
      {
        title: "TVA difficile à fiabiliser",
        body:
          "Taux multiples, ventes encaissées, achats intracommunautaires, acomptes ou e-commerce : la TVA devient vite un sujet de contrôle permanent.",
      },
      {
        title: "Clôture annuelle en retard",
        body:
          "Lorsque bilan, compte de résultat, annexe ou liasse fiscale arrivent trop tard, le dirigeant pilote avec des chiffres qui ne racontent plus le présent.",
      },
      {
        title: "Justificatifs dispersés",
        body:
          "Factures dans les emails, notes de frais sur papier, exports bancaires incomplets : la production devient dépendante de relances et de rattrapages.",
      },
      {
        title: "Croissance ou changement de statut",
        body:
          "Création de société, passage au réel, embauche, nouveau point de vente ou levée de fonds : le niveau d'exigence comptable augmente.",
      },
    ],
    deliverablesTitle: "Livrables attendus d'une mission bien cadrée",
    deliverablesIntro:
      "Le bon cabinet ne vend pas seulement de la saisie. Il nomme les livrables, explique leur rythme et les rend compréhensibles pour décider.",
    deliverables: [
      {
        rhythm: "Mensuel",
        title: "Suivi des écritures et pièces manquantes",
        body:
          "Point sur les flux bancaires, rapprochement bancaire, lettrage, opérations à justifier et décisions attendues du dirigeant.",
      },
      {
        rhythm: "Périodique",
        title: "Déclarations et contrôles de cohérence",
        body:
          "TVA, acomptes, taxes selon activité, cadrage avec les ventes, achats et soldes comptables avant transmission.",
      },
      {
        rhythm: "Clôture",
        title: "Révision, bilan et comptes annuels",
        body:
          "Contrôle de la balance, écritures d'inventaire, bilan, compte de résultat, annexe et préparation des éléments d'approbation.",
      },
      {
        rhythm: "Annuel",
        title: "Liasse fiscale et restitution dirigeant",
        body:
          "Tableaux fiscaux, télétransmission, analyse du résultat, points de vigilance et pistes d'amélioration pour le prochain exercice.",
      },
    ],
    internalLinksTitle: "Missions complémentaires à relier à la comptabilité",
    internalLinksIntro:
      "La comptabilité générale est souvent le socle d'autres décisions. Ces pages prolongent le parcours quand le besoin dépasse la production des comptes.",
    internalLinks: [
      {
        label: "Conseil fiscal",
        href: "/expertises/fiscalite",
        body: "TVA, IS, IR, CFE, options fiscales et cohérence entre comptabilité et déclarations.",
      },
      {
        label: "Gestion sociale",
        href: "/expertises/social",
        body: "Paie, DSN, provisions sociales, embauche et impact des charges dans le compte de résultat.",
      },
      {
        label: "Création d'entreprise",
        href: "/expertises/creation-entreprise",
        body: "Choix du statut, régime fiscal, organisation de la facturation et premiers outils comptables.",
      },
      {
        label: "Conseil en gestion",
        href: "/expertises/conseil-gestion",
        body: "Tableaux de bord, trésorerie, marge, seuil de rentabilité et lecture dirigeant des chiffres.",
      },
      {
        label: "Audit & commissariat",
        href: "/expertises/audit",
        body: "Contrôles, revue de procédures, fiabilisation des comptes et missions d'assurance.",
      },
    ],
  };
}

export function buildServiceSectorCards(
  serviceSlug: string,
  secteurs: Secteur[],
  limit = 8,
): ServiceAssetCard[] {
  return [...secteurs]
    .sort((a, b) => b.volume - a.volume || a.name.localeCompare(b.name, "fr"))
    .slice(0, limit)
    .map((secteur) => ({
      label: secteur.name,
      href: `/expertises/${serviceSlug}/${secteur.slug}`,
      description: secteur.description ?? "Cadre comptable et fiscal adapte au secteur.",
      asset: buildVisualAsset("sector", secteur.slug, secteur.name),
    }));
}

export function buildServiceProfessionCards(
  serviceSlug: string,
  professions: Profession[],
  categories: ProfessionCategory[],
  limit = 10,
): ServiceAssetCard[] {
  const categoryMap = new Map(categories.map((category) => [category.slug, category]));

  return [...professions]
    .sort((a, b) => b.volume - a.volume || a.name.localeCompare(b.name, "fr"))
    .slice(0, limit)
    .map((profession) => {
      const category = categoryMap.get(profession.category_slug);
      return {
        label: profession.name,
        href: `/expertises/${serviceSlug}/${profession.slug}`,
        description:
          profession.description
          ?? "Points comptables, fiscaux et sociaux propres a ce metier.",
        categoryLabel: category?.name,
        asset: buildVisualAsset("profession", profession.slug, profession.name),
      };
    });
}

function buildSpecificFaqItems(service: Service): DirectoryFaqItem[] {
  if (service.slug === "fiscalite") {
    return [
      {
        question: "Que comprend une mission de conseil fiscal ?",
        answer:
          "Elle peut couvrir la TVA, l'impôt sur les sociétés ou l'impôt sur le revenu, la CFE, les crédits d'impôt, la liasse fiscale, les arbitrages de rémunération et l'assistance en cas de contrôle fiscal.",
      },
      {
        question: "Quand faut-il revoir son régime de TVA ?",
        answer:
          "Il faut le revoir lors d'un changement de seuil, d'une nouvelle activité, d'opérations internationales, d'e-commerce, de ventes avec taux multiples ou lorsque les déclarations TVA deviennent difficiles à fiabiliser.",
      },
      {
        question: "Le conseil fiscal sert-il seulement à réduire l'impôt ?",
        answer:
          "Non. Il sert surtout à sécuriser les déclarations, anticiper les conséquences d'une décision, documenter les arbitrages et éviter les erreurs qui pourraient coûter plus cher lors d'un contrôle.",
      },
      {
        question: "Quels documents préparer pour un rendez-vous fiscal ?",
        answer:
          "Préparez les dernières déclarations TVA, la liasse fiscale, le bilan, le compte de résultat, les avis d'imposition, les courriers fiscaux et les projets qui peuvent modifier votre résultat.",
      },
    ];
  }

  if (service.slug === "social") {
    return [
      {
        question: "Que comprend une mission de gestion sociale ?",
        answer:
          "Elle peut inclure les bulletins de paie, la DSN, les déclarations sociales, les DPAE, les contrats, les sorties de salariés, les documents de fin de contrat et le conseil RH.",
      },
      {
        question: "Quels éléments transmettre chaque mois pour la paie ?",
        answer:
          "Il faut transmettre les heures, primes, absences, congés, arrêts, notes de frais, acomptes, entrées ou sorties de salariés et tout événement qui impacte le bulletin.",
      },
      {
        question: "Pourquoi la convention collective est-elle importante ?",
        answer:
          "Elle peut modifier les minima de salaire, primes, congés, classifications, temps de travail, majorations et règles de rupture. Une paie fiable doit l'intégrer.",
      },
      {
        question: "Quand auditer sa paie ?",
        answer:
          "Un audit est utile après une erreur répétée, une croissance d'effectif, un changement de convention, un contrôle URSSAF, une rupture sensible ou une reprise de dossier.",
      },
    ];
  }

  if (service.slug === "creation-entreprise") {
    return [
      {
        question: "Pourquoi consulter avant l'immatriculation ?",
        answer:
          "Parce que le statut juridique, le régime fiscal, la TVA, la rémunération, les statuts et l'organisation comptable se décident avant le dépôt du dossier.",
      },
      {
        question: "Comment choisir entre SASU et EURL ?",
        answer:
          "Le choix dépend de la protection sociale, de la rémunération, des dividendes, de l'impôt, du coût des charges, des associés futurs et du projet de croissance.",
      },
      {
        question: "Un business plan est-il nécessaire ?",
        answer:
          "Il est très utile dès qu'il y a financement, investissement, recrutement ou besoin de valider la rentabilité. Il permet aussi de tester plusieurs scénarios de trésorerie.",
      },
      {
        question: "Quels documents préparer pour créer une société ?",
        answer:
          "Préparez la description du projet, les hypothèses de chiffre d'affaires, les charges, les apports, les informations des associés, l'adresse du siège et les contrats importants.",
      },
    ];
  }

  if (service.slug === "conseil-gestion") {
    return [
      {
        question: "À quoi sert un tableau de bord de gestion ?",
        answer:
          "Il transforme les chiffres en indicateurs suivis : trésorerie, marge, charges fixes, BFR, encours clients, résultat estimé et écarts avec le prévisionnel.",
      },
      {
        question: "Quels indicateurs suivre en priorité ?",
        answer:
          "Les indicateurs prioritaires dépendent du métier, mais la trésorerie, la marge, le seuil de rentabilité, les charges fixes et les retards d'encaissement sont souvent essentiels.",
      },
      {
        question: "Quand refaire un prévisionnel ?",
        answer:
          "Il faut le refaire avant une embauche, un investissement, un financement, une baisse de marge, une hausse de prix ou une croissance plus rapide que prévu.",
      },
      {
        question: "Le conseil en gestion remplace-t-il la comptabilité ?",
        answer:
          "Non. Il s'appuie sur une comptabilité fiable pour produire une lecture dirigeant et des scénarios d'action.",
      },
    ];
  }

  if (service.slug === "audit") {
    return [
      {
        question: "Quelle différence entre audit légal et audit contractuel ?",
        answer:
          "L'audit légal relève du commissariat aux comptes lorsqu'il est obligatoire ou nommé. L'audit contractuel est volontaire et cible un périmètre défini par l'entreprise.",
      },
      {
        question: "Quand un commissaire aux comptes devient-il obligatoire ?",
        answer:
          "La nomination dépend notamment de seuils de total bilan, chiffre d'affaires, salariés, de la forme juridique et parfois de l'appartenance à un groupe.",
      },
      {
        question: "Que prépare-t-on pour un audit ?",
        answer:
          "Préparez les comptes annuels, la balance, le grand livre, les journaux, le FEC, les contrats, les justificatifs, les procédures internes et les éléments juridiques.",
      },
      {
        question: "Un audit peut-il être utile sans obligation ?",
        answer:
          "Oui. Un audit contractuel peut sécuriser une acquisition, une cession, un financement, une levée de fonds, un contrôle interne ou une revue de procédures.",
      },
    ];
  }

  return [];
}

export function buildServiceLandingFaqItems(service: Service): DirectoryFaqItem[] {
  const serviceName = service.title.toLowerCase();
  const genericFaq = [
    {
      question: `Que contient le diagnostic ${serviceName} ?`,
      answer:
        "Le diagnostic sert a comprendre votre organisation actuelle, vos volumes, vos echeances, vos risques et les livrables attendus avant d'etablir une proposition de mission.",
    },
    {
      question: "Puis-je conserver mes outils actuels ?",
      answer:
        "Oui, lorsque c'est pertinent. Skoria peut cadrer la mission autour de vos outils existants ou proposer une organisation plus fluide si vos processus actuels ralentissent la production.",
    },
    {
      question: "Est-ce adapte a une creation ou une reprise de dossier ?",
      answer:
        "Oui. La page s'adresse autant aux createurs qu'aux dirigeants qui veulent reprendre un dossier existant, remettre les comptes en ordre ou mieux piloter l'activite.",
    },
    {
      question: "Comment se passe la mise en place ?",
      answer:
        "Apres le rendez-vous, Skoria liste les documents a recuperer, les acces a ouvrir, les echeances a securiser et les premiers livrables a produire.",
    },
  ];

  if (service.slug !== "comptabilite") {
    return [...genericFaq, ...buildSpecificFaqItems(service)];
  }

  return [
    ...genericFaq,
    {
      question: "Un expert-comptable est-il obligatoire pour tenir ma comptabilité ?",
      answer:
        "Non, un expert-comptable externe n'est pas obligatoire par principe. En revanche, l'entreprise reste responsable de ses obligations comptables et fiscales. Si la tenue est externalisée auprès d'un professionnel, la mission doit être cadrée clairement.",
    },
    {
      question: "Quelle différence entre tenue comptable et révision comptable ?",
      answer:
        "La tenue comptable consiste à enregistrer les opérations courantes. La révision vérifie ensuite la cohérence des comptes, les soldes, les justificatifs et les écritures de clôture avant les comptes annuels.",
    },
    {
      question: "Que comprend la liasse fiscale ?",
      answer:
        "La liasse fiscale regroupe les tableaux comptables et fiscaux transmis à l'administration. Elle s'appuie notamment sur le bilan, le compte de résultat et les annexes lorsque celles-ci sont requises.",
    },
    {
      question: "Quels documents envoyer pour démarrer une mission comptable ?",
      answer:
        "Préparez les relevés bancaires, factures d'achat et de vente, notes de frais, éléments de paie, dernières déclarations TVA, dernier bilan, grand livre, balance et accès aux outils de facturation ou de banque.",
    },
    {
      question: "À quelle fréquence faut-il rapprocher la banque ?",
      answer:
        "Un rapprochement bancaire régulier limite les erreurs de TVA, les doublons, les comptes d'attente et les justificatifs oubliés. Le bon rythme dépend du volume de flux, mais il doit être cadré dès le départ.",
    },
  ];
}
