import Image from "next/image";
import Link from "next/link";
import type { ReactElement } from "react";
import type { Secteur } from "@/libs/db";
import { BriefTrigger } from "@/components/journey/BriefTrigger";

type SectorFallbackProps = {
  secteur: Secteur;
};

type SectorScenario = {
  title: string;
  context: string;
  questions: string[];
};

type SectorProfile = {
  label: string;
  audience: string;
  perspective: string;
  flowFocus: string[];
  documentFocus: string[];
  decisionFocus: string[];
  scenarios: SectorScenario[];
};

const DEFAULT_PROFILE: SectorProfile = {
  label: "ce secteur",
  audience: "les entreprises de cette activité",
  perspective:
    "Les flux de vente, les achats, l’équipe, les investissements et les outils ne se combinent pas de la même façon dans toutes les entreprises. La comparaison doit partir du fonctionnement réel, puis relier chaque besoin à une tâche, un livrable et une responsabilité clairement décrits.",
  flowFocus: [
    "Origine des ventes ou des honoraires et rythme d’encaissement",
    "Achats, frais récurrents, sous-traitance et investissements",
    "Outils qui produisent les données comptables et personnes qui les valident",
    "Équipe, financements et événements qui modifient le dossier",
  ],
  documentFocus: [
    "Export de facturation ou relevé des recettes représentatif",
    "Relevés bancaires et justificatifs d’achats ou de frais",
    "Contrats, emprunts et investissements en cours, le cas échéant",
    "Calendrier des échéances et changements prévus dans l’activité",
  ],
  decisionFocus: [
    "Comprendre la trésorerie disponible et les engagements à venir",
    "Suivre l’activité avec un niveau de détail réellement alimenté par les données",
    "Préparer une création, un développement ou une transmission de dossier",
  ],
  scenarios: [
    {
      title: "Créer ou reprendre une activité",
      context:
        "Le dossier doit distinguer les hypothèses de départ, les contrats déjà signés, les investissements, les outils choisis et la date à laquelle les premiers flux seront produits.",
      questions: ["Quelles données faut-il organiser en premier ?", "Quel calendrier de mise en place est réaliste ?"],
    },
    {
      title: "Développer l’exploitation",
      context:
        "Une nouvelle offre, un établissement supplémentaire ou une équipe qui évolue peut modifier les volumes et les besoins de restitution. Le périmètre doit suivre ces changements sans supposer qu’ils sont déjà inclus.",
      questions: ["Quels flux nouveaux devront être rapprochés ?", "Quels indicateurs aideront réellement à décider ?"],
    },
    {
      title: "Changer de cabinet",
      context:
        "La reprise exige une liste des accès, exports, travaux en cours, pièces manquantes et prochaines échéances. Chaque point doit avoir un responsable et une date de traitement convenue.",
      questions: ["Qui récupère chaque donnée ?", "Comment sécuriser la continuité pendant la transition ?"],
    },
  ],
};

const SECTOR_PROFILES: Record<string, SectorProfile> = {
  restauration: {
    label: "la restauration",
    audience: "les restaurants, traiteurs, food trucks et activités d’hôtellerie-restauration",
    perspective:
      "Un restaurant, un traiteur, un food truck et un établissement hôtelier ne produisent pas les mêmes flux. Commandes sur place ou à emporter, réservations, plateformes, caisse, achats, équipe et saisonnalité peuvent se croiser. Un cabinet crédible commence par cartographier ces circuits avant de proposer un rythme de collecte ou des tableaux de suivi.",
    flowFocus: [
      "Ventes, commandes ou réservations selon les canaux réellement utilisés",
      "Encaissements, caisse, paiements en ligne, plateformes et rapprochements bancaires",
      "Achats de matières, fournisseurs, frais d’exploitation et inventaire lorsqu’il est suivi",
      "Équipe, saisonnalité, équipements et financements liés à l’exploitation",
    ],
    documentFocus: [
      "Exports de caisse, de commande ou de réservation disponibles",
      "Relevés des moyens de paiement, plateformes et comptes bancaires concernés",
      "Factures des principaux fournisseurs et méthode d’inventaire utilisée",
      "Éléments de paie, contrats d’équipement et échéanciers de financement utiles",
    ],
    decisionFocus: [
      "Rapprocher les ventes et les encaissements sans perdre la lecture par canal",
      "Observer les achats, l’inventaire et les frais avec le niveau de détail disponible",
      "Anticiper les périodes fortes, les besoins de trésorerie et les investissements",
    ],
    scenarios: [
      {
        title: "Ouvrir ou reprendre un établissement",
        context:
          "Le brief doit séparer les hypothèses du projet des données déjà disponibles : date d’ouverture ou de reprise, équipements, contrats, modes de vente, outils de caisse et organisation de l’équipe. Le professionnel peut alors préciser la mise en place et les inconnues à lever.",
        questions: ["Quels outils devront échanger des données ?", "Quels éléments du dossier existant faut-il reprendre ?"],
      },
      {
        title: "Ajouter un canal de vente",
        context:
          "Livraison, vente à emporter, événementiel, réservation ou nouvel établissement créent souvent un circuit supplémentaire. La proposition doit expliquer comment les ventes, commissions, remboursements et encaissements seront rapprochés avec la banque.",
        questions: ["Quel export servira de référence ?", "Comment isoler les écarts et les opérations non rapprochées ?"],
      },
      {
        title: "Changer de cabinet en pleine saison",
        context:
          "La transition doit rendre visibles les accès, les exports, l’inventaire disponible, les travaux en cours et les prochaines échéances. Demandez un ordre de reprise compatible avec la charge opérationnelle de l’établissement.",
        questions: ["Qui contacte le précédent cabinet ?", "Quels contrôles précèdent la première production ?"],
      },
    ],
  },
  immobilier: {
    label: "l’immobilier",
    audience: "les structures immobilières, loueurs, marchands de biens et agences",
    perspective:
      "Biens, lots, loyers, honoraires, charges, travaux, dépôts et financements peuvent relever de circuits distincts. Le cadrage doit partir de la structure, de l’activité effectivement exercée et des comptes utilisés, puis préciser le niveau de suivi attendu par bien ou par opération.",
    flowFocus: [
      "Loyers, honoraires ou ventes selon l’activité réellement exercée",
      "Charges, travaux, financements et dépôts concernés",
      "Flux gérés pour compte de tiers lorsqu’ils existent dans l’organisation",
      "Suivi par bien, lot, mandat ou opération si les données le permettent",
    ],
    documentFocus: [
      "Liste des biens, lots, mandats ou opérations concernés",
      "Relevés des loyers, honoraires ou ventes selon le modèle",
      "Factures de charges et travaux, emprunts et échéanciers disponibles",
      "Comptes bancaires dédiés et rapprochements déjà réalisés",
    ],
    decisionFocus: [
      "Séparer les entités, biens ou opérations sans doubles saisies",
      "Rendre visibles les financements, travaux et engagements à venir",
      "Produire une restitution adaptée aux décisions immobilières",
    ],
    scenarios: DEFAULT_PROFILE.scenarios,
  },
  "start-up": {
    label: "le secteur des start-up et des entreprises technologiques",
    audience: "les start-up, SaaS, e-commerçants et entreprises du numérique",
    perspective:
      "Abonnements, prestations, paiements en ligne, commissions, dépenses logicielles, sous-traitance et financements peuvent coexister. La comparaison doit vérifier comment chaque source sera rapprochée, qui contrôle les écarts et quelles données resteront accessibles à l’entreprise.",
    flowFocus: [
      "Facturation ponctuelle ou récurrente, avoirs et remboursements",
      "Paiements en ligne, commissions et délais de versement",
      "Dépenses logicielles, sous-traitance, équipe et frais internationaux éventuels",
      "Financements, investissements et rythme de consommation de trésorerie",
    ],
    documentFocus: [
      "Exports de facturation et de paiement réellement disponibles",
      "Contrats d’abonnement, de prestation et de sous-traitance",
      "Factures logicielles et justificatifs représentatifs des achats",
      "Éléments de financement et tableau de suivi déjà utilisé",
    ],
    decisionFocus: [
      "Distinguer le revenu récurrent des opérations ponctuelles",
      "Suivre la trésorerie à partir de données rapprochées",
      "Conserver des exports exploitables lors d’un changement d’outil ou de cabinet",
    ],
    scenarios: DEFAULT_PROFILE.scenarios,
  },
  "profession-liberale": {
    label: "le secteur des professions libérales",
    audience: "les médecins, avocats, architectes, consultants et autres professions libérales",
    perspective:
      "Honoraires, dépenses du cabinet, cotisations du dirigeant, investissements et éventuelle équipe doivent être reliés au mode d’exercice. Le premier échange doit protéger les informations sensibles et limiter les accès à ce qui est nécessaire pour définir puis réaliser la mission.",
    flowFocus: [
      "Honoraires, recettes et éventuels remboursements ou frais refacturés",
      "Dépenses du cabinet, déplacements et investissements professionnels",
      "Cotisations du dirigeant et éléments sociaux lorsqu’une équipe existe",
      "Dossiers ou missions suivis sans transmettre de données métier inutiles",
    ],
    documentFocus: [
      "Relevé des recettes ou factures d’honoraires représentatives",
      "Relevés bancaires et justificatifs des dépenses du cabinet",
      "Tableau des investissements, emprunts ou contrats de financement",
      "Éléments sociaux utiles et calendrier des changements prévus",
    ],
    decisionFocus: [
      "Adapter la collecte au temps administratif disponible",
      "Proportionner les accès à la sensibilité des informations",
      "Obtenir une restitution lisible sur le fonctionnement du cabinet",
    ],
    scenarios: DEFAULT_PROFILE.scenarios,
  },
  btp: {
    label: "le secteur du BTP et de l’artisanat",
    audience: "les entreprises de construction, rénovation et artisanat du bâtiment",
    perspective:
      "Devis, acomptes, achats, sous-traitance, situations de travaux, matériel et frais de chantier peuvent se répartir sur plusieurs dossiers. La comparaison devient concrète lorsque le professionnel décrit comment ces opérations circulent du terrain jusqu’à la clôture.",
    flowFocus: [
      "Devis, acomptes, factures et encaissements liés aux dossiers",
      "Matériaux, sous-traitance et autres frais de chantier",
      "Matériel détenu, loué ou financé et coûts associés",
      "Avancement, reste à facturer et trésorerie par activité si les données existent",
    ],
    documentFocus: [
      "Liste des chantiers ou dossiers en cours avec leur état",
      "Devis, situations, factures clients et principaux acomptes",
      "Factures de matériaux et de sous-traitance représentatives",
      "Contrats de location, emprunts et état du matériel",
    ],
    decisionFocus: [
      "Suivre les dossiers en cours avec des données disponibles",
      "Collecter les pièces depuis le terrain sans rupture",
      "Rendre visibles la trésorerie et les engagements futurs",
    ],
    scenarios: DEFAULT_PROFILE.scenarios,
  },
  commerce: {
    label: "le commerce",
    audience: "les commerces de détail, e-commerçants et réseaux de franchise",
    perspective:
      "Magasin, site marchand, marketplace, retours, promotions, commissions et stocks peuvent produire des données différentes pour une même vente. Le cabinet doit décrire le rapprochement retenu, les contrôles possibles et les limites des exports réellement fournis par les outils.",
    flowFocus: [
      "Commandes, ventes, avoirs et retours par canal",
      "Encaissements, commissions et délais de versement des plateformes",
      "Achats, fournisseurs, inventaire et mouvements de stock disponibles",
      "Établissements, franchises ou ventes hors de France lorsqu’ils existent",
    ],
    documentFocus: [
      "Exports de commandes, ventes, avoirs et retours",
      "Relevés des plateformes, paiements et comptes bancaires",
      "Factures fournisseurs et dernier inventaire disponible",
      "Liste des canaux, établissements et moyens de paiement utilisés",
    ],
    decisionFocus: [
      "Rapprocher la commande, le paiement et la banque",
      "Identifier les retours, commissions et écarts de versement",
      "Suivre l’activité par canal avec un niveau de détail fiable",
    ],
    scenarios: DEFAULT_PROFILE.scenarios,
  },
  transport: {
    label: "le secteur du transport et de la logistique",
    audience: "les transporteurs, VTC et entreprises de logistique",
    perspective:
      "Courses, tournées, carburant, péages, véhicules, plateformes, sous-traitants et équipes peuvent créer de nombreux flux. Le cadrage doit montrer comment les justificatifs sont collectés, comment les versements sont rapprochés et quels coûts peuvent être suivis avec fiabilité.",
    flowFocus: [
      "Prestations, courses ou tournées facturées",
      "Carburant, péages, entretien et autres frais de route",
      "Véhicules détenus, loués ou financés",
      "Plateformes, sous-traitants et personnel selon l’organisation",
    ],
    documentFocus: [
      "Exports de facturation ou relevés des plateformes utilisées",
      "Factures de carburant, péages et entretien représentatives",
      "Contrats de location, financement et assurance des véhicules",
      "Éléments de paie ou de sous-traitance lorsqu’ils existent",
    ],
    decisionFocus: [
      "Simplifier la collecte des frais d’exploitation",
      "Lire les coûts par véhicule ou activité si les données le permettent",
      "Traiter les écarts entre plateformes, facturation et banque",
    ],
    scenarios: DEFAULT_PROFILE.scenarios,
  },
  association: {
    label: "le secteur associatif",
    audience: "les associations, fondations et organisations non gouvernementales",
    perspective:
      "Cotisations, dons, subventions, activités, dépenses par projet, bénévolat et salariat peuvent demander des suivis distincts. Le périmètre doit partir des ressources réellement reçues, des engagements pris et des restitutions attendues par les organes de gouvernance ou les financeurs.",
    flowFocus: [
      "Cotisations, dons, financements et recettes d’activité",
      "Dépenses courantes et coûts rattachés aux projets",
      "Affectations, engagements et justificatifs demandés par les financeurs",
      "Bénévoles, salariés et instances qui valident les opérations",
    ],
    documentFocus: [
      "Budget, suivi des projets et derniers comptes disponibles",
      "Conventions de financement et conditions de restitution associées",
      "Relevés bancaires, reçus et factures représentatives",
      "Procès-verbaux ou décisions utiles à la compréhension des opérations",
    ],
    decisionFocus: [
      "Suivre l’utilisation des ressources par projet",
      "Préparer des restitutions compréhensibles pour la gouvernance",
      "Conserver une traçabilité adaptée aux engagements documentés",
    ],
    scenarios: DEFAULT_PROFILE.scenarios,
  },
};

const RESPONSIBILITY_ROWS = [
  [
    "Cartographie des flux",
    "L’entreprise décrit ses canaux, ses outils, ses comptes, ses établissements et les personnes qui interviennent dans chaque circuit.",
    "Le professionnel retenu reformule le périmètre, indique les données nécessaires et signale les zones qu’il doit encore vérifier.",
  ],
  [
    "Pièces et informations",
    "L’entreprise transmet les éléments dans le format et au rythme convenus, puis explique les opérations inhabituelles ou incomplètes.",
    "Le professionnel précise ses contrôles, la procédure appliquée lorsqu’une pièce manque et les travaux qui sortent du périmètre courant.",
  ],
  [
    "Validations et décisions",
    "Le dirigeant désigne les personnes habilitées à répondre, valider une information ou prendre une décision pour l’entreprise.",
    "Le professionnel distingue ce qu’il prépare, ce qu’il contrôle et ce qui exige une validation explicite avant de poursuivre.",
  ],
  [
    "Échéances et alertes",
    "L’entreprise respecte le calendrier de transmission convenu et prévient lorsqu’un événement modifie les données ou le délai disponible.",
    "Le professionnel confirme les productions comprises, les dates de travail et la manière dont une information manquante ou tardive est signalée.",
  ],
  [
    "Accès et sortie",
    "L’entreprise garde la maîtrise de ses accès essentiels et met à jour les habilitations lorsque les interlocuteurs changent.",
    "Le professionnel décrit les outils utilisés, les formats d’export et les conditions de restitution des données à la fin de la mission.",
  ],
];

function profileFor(secteur: Secteur): SectorProfile {
  return SECTOR_PROFILES[secteur.slug] ?? {
    ...DEFAULT_PROFILE,
    label: `le secteur d’activité « ${secteur.name} »`,
    audience: secteur.description?.toLocaleLowerCase("fr-FR") ?? DEFAULT_PROFILE.audience,
  };
}

function withDe(label: string): string {
  if (label.startsWith("le ")) return `du ${label.slice(3)}`;
  if (label.startsWith("les ")) return `des ${label.slice(4)}`;
  return `de ${label}`;
}

function withA(label: string): string {
  if (label.startsWith("le ")) return `au ${label.slice(3)}`;
  if (label.startsWith("les ")) return `aux ${label.slice(4)}`;
  return `à ${label}`;
}

function mediaFor(secteur: Secteur): { src: string; alt: string; position?: string; disclosure?: boolean } {
  const media: Record<string, { src: string; alt: string; position?: string; disclosure?: boolean }> = {
    restauration: {
      src: "/images/skoria-v2/editorial/restaurant.webp",
      alt: "Restaurateur organisant son activité au comptoir",
      position: "35% center",
      disclosure: true,
    },
    immobilier: {
      src: "/images/skoria-v2/editorial/apartment.webp",
      alt: "Appartement meublé avec documents de suivi sur une table",
    },
    "profession-liberale": {
      src: "/images/skoria-v2/editorial/workspace.webp",
      alt: "Espace de travail avec ordinateur et documents professionnels",
    },
    btp: {
      src: "/images/skoria-v2/editorial/atelier.webp",
      alt: "Atelier avec maquette et documents de travail",
      position: "62% center",
      disclosure: true,
    },
    transport: {
      src: "/images/skoria-v2/editorial/cityscape.webp",
      alt: "Composition urbaine utilisée comme repère de parcours",
    },
  };
  return media[secteur.slug] ?? {
    src: "/images/skoria-v2/editorial/accounting-flow.webp",
    alt: "Documents comptables organisés en étapes avec registre et calculatrice",
  };
}

function SectionHeading({
  eyebrow,
  title,
  body,
  inverse = false,
}: {
  eyebrow: string;
  title: string;
  body: string;
  inverse?: boolean;
}) {
  return (
    <div className="max-w-3xl">
      <p className={`sk-eyebrow ${inverse ? "text-orange" : "text-blue"}`}>{eyebrow}</p>
      <h2 className={`mt-4 sk-section-title ${inverse ? "text-white" : "text-ink"}`}>{title}</h2>
      <p className={`mt-5 text-[.95rem] leading-8 ${inverse ? "text-white/72" : "text-ink-muted"}`}>{body}</p>
    </div>
  );
}

function ContextSection({ secteur }: SectorFallbackProps) {
  const profile = profileFor(secteur);
  const media = mediaFor(secteur);

  return (
    <div id="fonctionnement-secteur" className="scroll-mt-36" data-sector-fallback-section="context">
      <div className="grid gap-10 lg:grid-cols-[.88fr_1.12fr] lg:items-start">
        <div className="lg:sticky lg:top-36">
          <SectionHeading
            eyebrow="01 · Modèle d’activité"
            title={`Comprendre les flux ${withDe(profile.label)}`}
            body={`${secteur.description ? `${secteur.description}. ` : ""}${profile.perspective}`}
          />
          <figure className="relative mt-8 aspect-[3/2] overflow-hidden rounded-[1.35rem] bg-lilac">
            <Image
              src={media.src}
              alt={media.alt}
              fill
              sizes="(max-width: 1024px) 100vw, 38vw"
              className="object-cover"
              style={{ objectPosition: media.position ?? "center" }}
              data-asset-kind="sector-context"
            />
            {media.disclosure && (
              <figcaption className="absolute inset-x-4 bottom-4 rounded-full bg-navy/80 px-4 py-2 text-center text-[.65rem] text-white/75 backdrop-blur-sm">
                Illustration générée par IA — personne fictive.
              </figcaption>
            )}
          </figure>
        </div>

        <div className="space-y-5">
          <article className="rounded-[1.25rem] border border-ink/10 bg-white p-6 lg:p-8">
            <p className="sk-eyebrow text-blue">Périmètre de la page</p>
            <h3 className="mt-4 text-[1.15rem] font-bold text-ink">Des exemples pour cadrer, pas un diagnostic automatique</h3>
            <p className="mt-4 text-[.84rem] leading-7 text-ink-muted">
              Cette page couvre notamment {profile.audience}. Ces exemples n’impliquent pas que chaque sujet concerne votre structure. Décrivez vos opérations, votre statut, vos outils et les événements en cours, puis demandez au professionnel de confirmer les règles et travaux réellement applicables.
            </p>
          </article>

          <article className="overflow-hidden rounded-[1.25rem] bg-navy p-6 text-white lg:p-8">
            <p className="sk-eyebrow text-orange">Les flux à cartographier</p>
            <ul className="mt-6 grid gap-px overflow-hidden rounded-xl bg-white/14 sm:grid-cols-2">
              {profile.flowFocus.map((item, index) => (
                <li key={item} className="bg-navy p-5">
                  <span className="font-display font-semibold text-[1.8rem] text-orange">0{index + 1}</span>
                  <p className="mt-3 text-[.8rem] leading-6 text-white/72">{item}</p>
                </li>
              ))}
            </ul>
          </article>

          <nav aria-label="Accès aux critères sectoriels" className="flex flex-wrap gap-2">
            {[
              ["#scenarios-secteur", "Scénarios"],
              ["#responsabilites-secteur", "Responsabilités"],
              ["#documents-secteur", "Documents"],
              ["#rythme-secteur", "Rythme"],
              ["#questions-secteur", "Questions"],
            ].map(([href, label]) => (
              <a key={href} href={href} className="rounded-full border border-ink/15 bg-white px-4 py-2 text-[.72rem] font-bold text-ink hover:border-blue hover:text-blue">
                {label}
              </a>
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
}

function ScenariosSection({ secteur }: SectorFallbackProps) {
  const profile = profileFor(secteur);
  return (
    <div id="scenarios-secteur" className="scroll-mt-36" data-sector-fallback-section="scenarios">
      <SectionHeading
        eyebrow="02 · Scénarios"
        title="Commencer par le changement à gérer"
        body={`Une entreprise ${withDe(profile.label)} ne formule pas le même besoin lors d’une création, d’un développement ou d’une reprise de dossier. Choisissez le scénario le plus proche, puis ajoutez vos volumes, vos outils et la prochaine échéance afin de comparer des propositions construites sur la même situation.`}
      />
      <div className="mt-10 grid gap-5 lg:grid-cols-3">
        {profile.scenarios.map((scenario, index) => (
          <article key={scenario.title} className={`rounded-[1.3rem] p-6 lg:p-8 ${index === 1 ? "bg-blue text-white" : "border border-ink/10 bg-white text-ink"}`}>
            <span className={`font-display font-semibold text-[2.2rem] ${index === 1 ? "text-orange" : "text-blue"}`}>0{index + 1}</span>
            <h3 className="mt-5 text-[1.1rem] font-bold">{scenario.title}</h3>
            <p className={`mt-4 text-[.82rem] leading-7 ${index === 1 ? "text-white/72" : "text-ink-muted"}`}>{scenario.context}</p>
            <ul className={`mt-5 space-y-3 border-t pt-5 text-[.78rem] leading-6 ${index === 1 ? "border-white/18 text-white/82" : "border-ink/10 text-ink"}`}>
              {scenario.questions.map((question) => <li key={question}>→ {question}</li>)}
            </ul>
          </article>
        ))}
      </div>
      <div className="mt-7 flex flex-col gap-5 rounded-[1.2rem] bg-navy p-6 text-white sm:flex-row sm:items-center sm:justify-between lg:px-8">
        <p className="max-w-3xl text-[.82rem] leading-7 text-white/72">Sélectionnez votre situation et la mission prioritaire dans le brief. Les informations restent un support de préparation : le professionnel choisi confirme sa capacité d’intervention et son calendrier.</p>
        <BriefTrigger prefill={{ profession: secteur.name, notes: `Secteur : ${secteur.name}` }} className="inline-flex min-h-12 shrink-0 items-center justify-center rounded-full bg-orange px-6 text-[.8rem] font-bold text-navy">
          Préparer mon brief&nbsp; ↗
        </BriefTrigger>
      </div>
    </div>
  );
}

function ResponsibilitiesSection({ secteur }: SectorFallbackProps) {
  const profile = profileFor(secteur);
  return (
    <div id="responsabilites-secteur" className="scroll-mt-36" data-sector-fallback-section="responsibilities">
      <SectionHeading
        eyebrow="03 · Responsabilités"
        title="Écrire qui collecte, contrôle et valide"
        body={`Une expérience ${withDe(profile.label)} ne remplace pas une répartition explicite des rôles. Utilisez cette matrice pour interroger chaque cabinet. La lettre de mission du professionnel retenu reste le document qui fixe le périmètre, les engagements et les limites réels.`}
      />
      <div className="mt-10 overflow-hidden rounded-[1.25rem] border border-ink/12 bg-white">
        <div className="hidden grid-cols-[.55fr_1fr_1fr] gap-px bg-ink/12 text-[.67rem] font-bold uppercase tracking-[.12em] md:grid">
          <p className="bg-navy p-5 text-white">Sujet</p>
          <p className="bg-navy p-5 text-white">Entreprise</p>
          <p className="bg-navy p-5 text-white">Professionnel retenu</p>
        </div>
        {RESPONSIBILITY_ROWS.map(([topic, company, professional]) => (
          <article key={topic} className="grid gap-4 border-t border-ink/10 p-5 first:border-t-0 md:grid-cols-[.55fr_1fr_1fr] md:gap-7 lg:p-6">
            <h3 className="text-[.9rem] font-bold text-blue">{topic}</h3>
            <p className="text-[.8rem] leading-6 text-ink-muted"><span className="font-bold text-ink md:hidden">Entreprise — </span>{company}</p>
            <p className="text-[.8rem] leading-6 text-ink-muted"><span className="font-bold text-ink md:hidden">Professionnel — </span>{professional}</p>
          </article>
        ))}
      </div>
    </div>
  );
}

function DocumentsSection({ secteur }: SectorFallbackProps) {
  const profile = profileFor(secteur);
  const groups = [
    {
      title: "Cadre de l’entreprise",
      body: "Pour comprendre la structure sans partir d’une hypothèse erronée.",
      items: ["Statut, activités et établissements concernés", "Organisation de l’équipe et interlocuteurs", "Outils de vente, facturation, banque et gestion", "Prochaine échéance ou changement déjà prévu"],
    },
    {
      title: "Historique du dossier",
      body: "Pour mesurer la reprise, les inconnues et le travail déjà accompli.",
      items: ["Derniers comptes ou déclarations disponibles", "Balance, grand livre ou export récupérable", "Liste des pièces et réponses encore attendues", "Lettre de mission actuelle en cas de changement"],
    },
    {
      title: `Flux ${withDe(profile.label)}`,
      body: "Pour tester la méthode sur les circuits qui structurent réellement l’activité.",
      items: profile.documentFocus,
    },
    {
      title: "Échantillon de travail",
      body: "Pour expliquer quelques cas représentatifs sans envoyer tout le dossier.",
      items: ["Une vente ou recette avec son encaissement", "Un achat ou frais avec son justificatif", "Une opération inhabituelle à expliquer", "Un livrable déjà utilisé pour décider"],
    },
  ];

  return (
    <div id="documents-secteur" className="scroll-mt-36" data-sector-fallback-section="documents">
      <SectionHeading
        eyebrow="04 · Documents"
        title="Préparer le diagnostic sans transmettre tout le dossier"
        body={`Le premier échange sur ${profile.label} doit permettre d’évaluer le périmètre, l’état des données et la reprise. Rassemblez les familles de documents utiles, masquez les informations sans rapport avec le cadrage et demandez un canal sécurisé avant toute transmission sensible.`}
      />
      <div className="mt-10 grid gap-5 md:grid-cols-2">
        {groups.map((group, index) => (
          <article key={group.title} className="rounded-[1.25rem] border border-ink/10 bg-white p-6 lg:p-8">
            <div className="flex items-baseline justify-between gap-4">
              <h3 className="text-[1.05rem] font-bold text-ink">{group.title}</h3>
              <span className="font-display font-semibold text-[1.7rem] text-orange">0{index + 1}</span>
            </div>
            <p className="mt-3 text-[.79rem] leading-6 text-ink-muted">{group.body}</p>
            <ul className="mt-5 space-y-3">
              {group.items.map((item) => (
                <li key={item} className="grid grid-cols-[.55rem_1fr] gap-3 text-[.8rem] leading-6 text-ink">
                  <span aria-hidden className="mt-2 h-2 w-2 rounded-full bg-orange" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </div>
  );
}

function RhythmSection({ secteur }: SectorFallbackProps) {
  const profile = profileFor(secteur);
  const steps = [
    ["Au fil des opérations", "Définir qui dépose les pièces, quels exports sont produits et comment une opération inhabituelle est signalée. La collecte doit suivre le terrain sans créer une seconde organisation parallèle."],
    ["À intervalles convenus", "Rapprocher les sources, traiter les éléments manquants et valider ce qui attend une décision de l’entreprise. La fréquence se choisit selon les volumes et l’usage attendu des données."],
    ["Avant une production", "Lister les informations attendues, la date de transmission interne et la personne qui valide. Le cabinet précise alors ses contrôles et le livrable compris dans la mission."],
    ["Lors d’un changement", "Revoir les accès, les interlocuteurs, les contrats, les financements et le calendrier. Un nouvel outil, un établissement ou une activité supplémentaire peut justifier un nouveau cadrage."],
  ];

  return (
    <div id="rythme-secteur" className="scroll-mt-36 rounded-[1.5rem] bg-navy p-6 text-white sm:p-8 lg:p-10" data-sector-fallback-section="rhythm">
      <SectionHeading
        inverse
        eyebrow="05 · Rythme de travail"
        title="Relier chaque échéance aux données qui la rendent possible"
        body={`Le calendrier ${withDe(profile.label)} dépend de la structure, des régimes, du volume et des événements du dossier. Cette trame organise le travail sans annoncer de date réglementaire : les échéances applicables doivent être confirmées à partir de la situation réelle et de sources officielles à jour.`}
      />
      <ol className="mt-10 grid gap-px overflow-hidden rounded-[1.25rem] bg-white/16 lg:grid-cols-4">
        {steps.map(([title, body], index) => (
          <li key={title} className="bg-navy p-6 lg:p-7">
            <span className="font-display font-semibold text-[2.2rem] text-orange">0{index + 1}</span>
            <h3 className="mt-5 text-[1rem] font-bold text-white">{title}</h3>
            <p className="mt-3 text-[.8rem] leading-6 text-white/68">{body}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}

function CriteriaSection({ secteur }: SectorFallbackProps) {
  const profile = profileFor(secteur);
  const criteria = [
    ["Expérience vérifiable", `Demandez un exemple de processus adapté ${withA(profile.label)}, sans solliciter d’information confidentielle sur un autre client.`],
    ["Périmètre explicite", "Reliez chaque tâche aux données attendues, au contrôle réalisé, au livrable, à la fréquence et à la personne responsable."],
    ["Méthode de reprise", "Faites préciser l’ordre de récupération des données, le traitement des anomalies et la continuité pendant la transition."],
    ["Interlocuteurs", "Identifiez la personne qui suit le dossier, celle qui valide les sujets techniques et les canaux utilisés selon la situation."],
    ["Outils et réversibilité", "Vérifiez les accès, les exports, les habilitations, les intégrations annoncées et la récupération des données en fin de mission."],
    ["Restitution utile", `Demandez comment les données aideront à ${profile.decisionFocus.join(" ; ").toLocaleLowerCase("fr-FR")}.`],
  ];

  return (
    <div id="criteres-secteur" className="scroll-mt-36" data-sector-fallback-section="criteria">
      <SectionHeading
        eyebrow="06 · Comparaison"
        title="Tester la spécialisation avec des réponses observables"
        body={`Une étiquette « spécialisé ${secteur.name} » ne décrit ni le périmètre ni la qualité du suivi. Posez les mêmes questions à chaque cabinet, demandez un exemple de fonctionnement et conservez les conditions qui accompagnent chaque réponse.`}
      />
      <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {criteria.map(([title, body], index) => (
          <article key={title} className={`rounded-[1.2rem] p-6 ${index === 4 ? "bg-blue text-white" : "border border-ink/10 bg-white text-ink"}`}>
            <span className={`font-mono text-[.65rem] font-bold ${index === 4 ? "text-orange" : "text-blue"}`}>CRITÈRE {String(index + 1).padStart(2, "0")}</span>
            <h3 className="mt-5 text-[1rem] font-bold">{title}</h3>
            <p className={`mt-3 text-[.8rem] leading-6 ${index === 4 ? "text-white/72" : "text-ink-muted"}`}>{body}</p>
          </article>
        ))}
      </div>
    </div>
  );
}

function ProposalSection({ secteur }: SectorFallbackProps) {
  const profile = profileFor(secteur);
  const drivers = [
    "Volume et variété des opérations",
    "État de l’historique et travail de reprise",
    "Nombre d’outils, de comptes ou d’établissements",
    "Fréquence des productions et restitutions",
    "Autonomie de l’équipe sur la collecte et les validations",
    "Travaux ponctuels et sujets hors cycle courant",
  ];
  const parts = [
    ["Socle récurrent", "Tâches, livrables, rythme et interlocuteurs compris dans la mission courante."],
    ["Mise en place", "Reprise, paramétrage, nettoyage ou migration décrits séparément lorsqu’ils sont nécessaires."],
    ["Options", "Paie, pilotage, accompagnement à un projet ou autres travaux identifiés sans supposer qu’ils sont inclus."],
    ["Conditions", "Évolution du périmètre, travaux supplémentaires, durée, sortie et restitution des données."],
  ];

  return (
    <div id="propositions-secteur" className="scroll-mt-36" data-sector-fallback-section="proposals">
      <div className="grid gap-10 lg:grid-cols-[.78fr_1.22fr]">
        <SectionHeading
          eyebrow="07 · Propositions"
          title="Comparer le même périmètre, ligne par ligne"
          body={`Aucun montant isolé ne permet d’évaluer une mission pour ${profile.label}. Les honoraires sont fixés par chaque professionnel après analyse du dossier. Comparez donc les tâches, les responsabilités, les fréquences, les options et les conditions qui accompagnent la proposition.`}
        />
        <div className="space-y-5">
          <article className="rounded-[1.25rem] border border-ink/10 bg-white p-6 lg:p-8">
            <h3 className="text-[1.05rem] font-bold text-ink">Ce qui peut faire varier le périmètre</h3>
            <ul className="mt-5 grid gap-3 sm:grid-cols-2">
              {drivers.map((driver) => (
                <li key={driver} className="flex gap-3 rounded-xl bg-paper p-4 text-[.8rem] leading-6 text-ink"><span aria-hidden className="text-orange">●</span>{driver}</li>
              ))}
            </ul>
          </article>
          <article className="overflow-hidden rounded-[1.25rem] border border-ink/10 bg-white">
            {parts.map(([title, body]) => (
              <div key={title} className="grid gap-2 border-t border-ink/10 p-5 first:border-t-0 sm:grid-cols-[9rem_1fr] sm:gap-6">
                <h3 className="text-[.84rem] font-bold text-blue">{title}</h3>
                <p className="text-[.78rem] leading-6 text-ink-muted">{body}</p>
              </div>
            ))}
          </article>
        </div>
      </div>
    </div>
  );
}

function QuestionsSection({ secteur }: SectorFallbackProps) {
  const profile = profileFor(secteur);
  const questions = [
    `Quel exemple concret montre votre méthode avec une entreprise ${withDe(profile.label)} ?`,
    "Quelles tâches sont incluses et lesquelles restent à notre charge ?",
    "Quels documents attendez-vous, dans quel format et par quel canal sécurisé ?",
    "Quels contrôles réalisez-vous avant une production ou une restitution ?",
    "Quels livrables recevrons-nous et quelles décisions doivent-ils éclairer ?",
    "Qui suivra le dossier au quotidien et qui valide les sujets techniques ?",
    "Comment traitez-vous un export incomplet ou un écart entre deux outils ?",
    "Comment se déroule la reprise et comment récupérons-nous nos données à la sortie ?",
    "Quels changements de volume ou d’activité imposent de revoir la mission ?",
    "Comment les travaux supplémentaires sont-ils identifiés avant leur réalisation ?",
  ];

  return (
    <div id="questions-secteur" className="scroll-mt-36" data-sector-fallback-section="questions">
      <SectionHeading
        eyebrow="08 · Entretien"
        title="Poser les mêmes questions à chaque cabinet"
        body="Notez les réponses avec leurs conditions et leurs limites. La comparaison devient utile lorsqu’elle conserve les différences de méthode, d’outils, de responsabilité et de restitution au lieu de réduire la proposition à une impression générale."
      />
      <ol className="mt-10 grid gap-4 md:grid-cols-2">
        {questions.map((question, index) => (
          <li key={question} className="grid grid-cols-[2.6rem_1fr] gap-4 rounded-[1.15rem] border border-ink/10 bg-white p-5 lg:p-6">
            <span className="font-display font-semibold text-[1.55rem] text-orange">{String(index + 1).padStart(2, "0")}</span>
            <p className="text-[.84rem] leading-7 text-ink">{question}</p>
          </li>
        ))}
      </ol>
      <div className="mt-8 flex flex-col gap-5 rounded-[1.25rem] bg-navy p-6 text-white sm:flex-row sm:items-center sm:justify-between lg:p-8">
        <div>
          <h3 className="text-[1.1rem] font-bold">Conserver une grille commune</h3>
          <p className="mt-3 max-w-3xl text-[.8rem] leading-6 text-white/68">Ajoutez votre situation, vos outils, vos volumes et la prochaine échéance dans le brief. Vous pourrez ensuite rechercher des professionnels et confronter leurs réponses sur la même base.</p>
        </div>
        <Link href="/annuaire/experts-comptables" className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-full bg-orange px-5 text-[.76rem] font-bold text-navy">
          Ouvrir l’annuaire&nbsp; ↗
        </Link>
      </div>
    </div>
  );
}

export function getSectorFallbackTakeaways(secteur: Secteur): string[] {
  const profile = profileFor(secteur);
  return [
    `Cartographier les ventes, encaissements, achats, outils et événements propres ${withA(profile.label)}.`,
    "Comparer les tâches, contrôles, livrables, responsabilités et fréquences sur un périmètre identique.",
    "Faire confirmer les règles applicables, la méthode de reprise et les conditions de restitution par le professionnel retenu.",
  ];
}

export function getSectorFallbackFaqs(secteur: Secteur): { question: string; answer: string }[] {
  const profile = profileFor(secteur);
  return [
    {
      question: `Pourquoi chercher un expert-comptable qui connaît ${profile.label} ?`,
      answer: `Une expérience proche peut faciliter la compréhension des flux et des outils. Demandez cependant un exemple de processus concret : une mention de spécialisation ne garantit ni le périmètre, ni les interlocuteurs, ni le niveau de restitution prévu dans votre mission.`,
    },
    {
      question: `Quels sujets préparer pour un premier échange sur ${profile.label} ?`,
      answer: `Présentez l’activité, la structure, les canaux de vente ou de facturation, les moyens d’encaissement, les achats, l’équipe, les outils et la prochaine échéance connue. Le professionnel pourra ensuite confirmer les règles et travaux applicables à votre situation.`,
    },
    {
      question: "Quels documents apporter sans transmettre tout le dossier ?",
      answer: `Préparez quelques éléments représentatifs : ${profile.documentFocus.join(" ; ").toLocaleLowerCase("fr-FR")}. Masquez les données inutiles au cadrage et demandez un canal sécurisé avant tout envoi sensible.`,
    },
    {
      question: "Comment comparer deux propositions comptables ?",
      answer: "Utilisez un périmètre commun et reliez chaque ligne aux tâches, contrôles, livrables, fréquences, responsabilités et limites. Séparez le socle récurrent, la reprise, les options et les travaux ponctuels afin de comprendre ce que couvre réellement chaque proposition.",
    },
    {
      question: "Cabinet local, hybride ou à distance : quel modèle choisir ?",
      answer: "Comparez la disponibilité réelle, les interlocuteurs, les canaux d’échange, le circuit documentaire, les outils et l’accès à vos données. Le mode pertinent dépend de votre autonomie, de votre organisation et des moments où un échange direct est nécessaire.",
    },
    {
      question: "Comment préparer un changement d’expert-comptable ?",
      answer: "Listez les accès, exports, dernières productions, travaux en cours, pièces manquantes et échéances proches. Demandez au nouveau cabinet d’expliquer l’ordre de reprise, les contrôles prévus, les responsabilités pendant la transition et les données qu’il pourra restituer.",
    },
    {
      question: "Comment répartir les responsabilités avec le cabinet ?",
      answer: "Faites écrire qui collecte, contrôle, valide, produit et répond lorsqu’une information manque. La lettre de mission doit aussi préciser les livrables, le calendrier de transmission, les interlocuteurs et les limites de l’intervention retenue.",
    },
    {
      question: "Quel est le rôle de Skoria dans cette démarche ?",
      answer: "Skoria fournit des repères de comparaison, un brief et un annuaire. La plateforme ne réalise pas la prestation comptable ; chaque professionnel confirme directement sa capacité d’intervention, ses honoraires, son calendrier et ses engagements.",
    },
  ];
}

export function buildSectorFallbackSections(props: SectorFallbackProps): ReactElement[] {
  return [
    <ContextSection key="sector-context" {...props} />,
    <ScenariosSection key="sector-scenarios" {...props} />,
    <ResponsibilitiesSection key="sector-responsibilities" {...props} />,
    <DocumentsSection key="sector-documents" {...props} />,
    <RhythmSection key="sector-rhythm" {...props} />,
    <CriteriaSection key="sector-criteria" {...props} />,
    <ProposalSection key="sector-proposals" {...props} />,
    <QuestionsSection key="sector-questions" {...props} />,
  ];
}
