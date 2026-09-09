import Image from "next/image";
import Link from "next/link";
import type { ReactElement } from "react";
import type { Profession, ProfessionCategory } from "@/libs/db";

type EditorialProfile = {
  perspective: string;
  flowFocus: string[];
  documentFocus: string[];
  decisionFocus: string[];
};

type ProfessionFallbackProps = {
  profession: Profession;
  category?: ProfessionCategory | null;
};

const DEFAULT_PROFILE: EditorialProfile = {
  perspective:
    "Le périmètre dépend du mode d’exercice, de la structure, du volume d’opérations et des décisions que les comptes doivent éclairer. Le premier échange doit donc partir du fonctionnement réel, puis distinguer ce qui reste géré en interne de ce qui pourrait être confié au cabinet.",
  flowFocus: [
    "Origine des recettes et conditions de facturation",
    "Dépenses récurrentes, investissements et financements",
    "Personnes qui préparent, contrôlent et valident les données",
    "Échéances fiscales, sociales et de clôture déjà connues",
  ],
  documentFocus: [
    "Export des ventes ou relevé des recettes selon l’organisation",
    "Factures d’achat, frais et justificatifs représentatifs",
    "Emprunts, contrats et investissements en cours, le cas échéant",
    "Calendrier des échéances et changements prévus",
  ],
  decisionFocus: [
    "Niveau de détail attendu dans les restitutions",
    "Fréquence utile pour suivre l’activité",
    "Autonomie souhaitée sur les outils et validations",
  ],
};

const CATEGORY_PROFILES: Record<string, EditorialProfile> = {
  "sante-bien-etre": {
    perspective:
      "Le mode d’exercice peut réunir recettes professionnelles, dépenses du cabinet, investissements, cotisations du dirigeant et, selon l’activité, salariés ou ventes annexes. La comparaison doit séparer ces circuits et tenir compte du temps réellement disponible pour préparer les informations.",
    flowFocus: [
      "Recettes professionnelles et éventuels flux de tiers payant",
      "Dépenses du cabinet, déplacements et remboursements de frais",
      "Matériel, financement et autres investissements professionnels",
      "Cotisations du dirigeant et paie lorsqu’une équipe est concernée",
    ],
    documentFocus: [
      "Relevé des recettes et des encaissements professionnels",
      "Relevés bancaires et justificatifs des dépenses du cabinet",
      "Tableau des immobilisations, emprunts ou contrats de financement",
      "Éléments sociaux du dirigeant et, le cas échéant, de l’équipe",
    ],
    decisionFocus: [
      "Accès proportionnés à la sensibilité des informations",
      "Traitement explicite du mode d’exercice et des cotisations",
      "Restitution lisible malgré un temps administratif contraint",
    ],
  },
  "batiment-travaux-publics": {
    perspective:
      "Devis, acomptes, achats, sous-traitance, situations de travaux et équipements peuvent se croiser sur plusieurs dossiers. La comparaison devient utile lorsque le professionnel explique comment il suit les mêmes opérations du document commercial jusqu’à la clôture.",
    flowFocus: [
      "Devis, acomptes, factures et retenues liés aux dossiers",
      "Achats de matériaux, sous-traitance et frais de chantier",
      "Matériel détenu, loué ou financé",
      "Avancement, reste à facturer et trésorerie par dossier",
    ],
    documentFocus: [
      "Liste des dossiers ou chantiers en cours avec leur état",
      "Devis, situations, factures clients et principaux acomptes",
      "Factures de matériaux et de sous-traitance représentatives",
      "Contrats de location, emprunts et état du matériel",
    ],
    decisionFocus: [
      "Lecture des dossiers en cours et des écarts",
      "Traitement des pièces reçues depuis le terrain",
      "Visibilité sur la trésorerie et les engagements",
    ],
  },
  "metiers-de-bouche": {
    perspective:
      "Achats, transformation, ventes, pertes et inventaire forment un même circuit économique. La proposition doit montrer comment les données disponibles permettent de rapprocher les ventes des consommations et de préparer l’inventaire sans promettre un niveau de détail que les outils ne produisent pas.",
    flowFocus: [
      "Ventes et moyens d’encaissement par canal disponible",
      "Achats de matières, fournisseurs et frais de production",
      "Inventaire, pertes et écarts documentés selon l’activité",
      "Saisonnalité, équipe et investissements de production",
    ],
    documentFocus: [
      "Exports de ventes ou de caisse et rapprochements disponibles",
      "Factures des principaux fournisseurs et frais de production",
      "Dernier inventaire et méthode de suivi utilisée",
      "Contrats d’équipement et éléments de paie, le cas échéant",
    ],
    decisionFocus: [
      "Qualité du rapprochement entre ventes, banque et caisse",
      "Méthode d’inventaire compatible avec le terrain",
      "Indicateurs compréhensibles par l’équipe dirigeante",
    ],
  },
  "restauration-tourisme": {
    perspective:
      "Les réservations ou commandes, les encaissements, les achats et la saisonnalité peuvent faire varier fortement la charge administrative. Le cadrage doit décrire les canaux utilisés et les périodes sensibles avant de discuter du rythme de production ou de restitution.",
    flowFocus: [
      "Réservations, commandes ou ventes selon le modèle d’activité",
      "Encaissements, plateformes et rapprochements bancaires",
      "Achats, frais variables et éventuel inventaire",
      "Saisonnalité, équipe et investissements d’exploitation",
    ],
    documentFocus: [
      "Exports des outils de vente, réservation ou caisse utilisés",
      "Relevés des plateformes et des comptes bancaires concernés",
      "Factures fournisseurs et dernier inventaire lorsqu’il existe",
      "Calendrier saisonnier et éléments sociaux de l’équipe",
    ],
    decisionFocus: [
      "Rapprochement des différents canaux d’encaissement",
      "Organisation adaptée aux périodes de forte activité",
      "Restitution utile pour préparer la saison suivante",
    ],
  },
  "commerce-ecommerce": {
    perspective:
      "Les canaux de vente, moyens de paiement, retours, commissions et stocks peuvent produire des données différentes pour une même commande. Le cabinet doit pouvoir décrire le rapprochement retenu et les limites des exports disponibles.",
    flowFocus: [
      "Commandes, avoirs et retours par canal de vente",
      "Encaissements, commissions et délais des plateformes",
      "Achats, fournisseurs, inventaire et mouvements de stock",
      "Ventes hors de France lorsque l’activité en comporte",
    ],
    documentFocus: [
      "Exports de commandes, paiements, avoirs et retours",
      "Relevés des plateformes et rapprochements bancaires",
      "Factures fournisseurs et dernier inventaire disponible",
      "Liste des canaux, pays et moyens de paiement utilisés",
    ],
    decisionFocus: [
      "Rapprochement démontrable de la commande à la banque",
      "Traitement explicite des retours et commissions",
      "Données récupérables en cas de changement d’outil",
    ],
  },
  "conseil-services-entreprises": {
    perspective:
      "Les missions clients, honoraires, frais refacturés, sous-traitants et temps passés donnent des lectures différentes de l’activité. La comparaison doit préciser quelles données existent réellement et lesquelles devront être organisées avant de promettre un pilotage par projet.",
    flowFocus: [
      "Devis, contrats, factures et échéanciers clients",
      "Frais refacturés et dépenses engagées pour les missions",
      "Sous-traitance, temps ou ressources suivis par projet",
      "Revenus récurrents et travaux ponctuels, lorsqu’ils coexistent",
    ],
    documentFocus: [
      "Contrats et factures d’un échantillon de missions",
      "Suivi des encaissements et factures restant à régler",
      "Frais refacturés et principaux contrats de sous-traitance",
      "Tableau de suivi des projets s’il est déjà utilisé",
    ],
    decisionFocus: [
      "Lecture de la rentabilité sans données artificiellement précises",
      "Traitement des frais et de la sous-traitance",
      "Restitution adaptée au rythme des missions",
    ],
  },
  "tech-digital-data": {
    perspective:
      "Abonnements, plateformes, prestations, dépenses logicielles et flux internationaux peuvent coexister. Une proposition crédible explique comment les exports seront rapprochés et quelles données resteront sous le contrôle de l’entreprise.",
    flowFocus: [
      "Facturation ponctuelle ou récurrente et avoirs",
      "Paiements en ligne, commissions et remboursements",
      "Dépenses logicielles, sous-traitance et équipes",
      "Flux internationaux et financements, lorsqu’ils existent",
    ],
    documentFocus: [
      "Exports de facturation et de paiement réellement disponibles",
      "Contrats d’abonnement, de prestation et de sous-traitance",
      "Dépenses logicielles et justificatifs internationaux",
      "Éléments de financement et tableau de suivi existant",
    ],
    decisionFocus: [
      "Rapprochement des outils sans dépendance opaque",
      "Traitement lisible du récurrent et du ponctuel",
      "Accès durable aux données et aux exports",
    ],
  },
  "droit-chiffre": {
    perspective:
      "Honoraires, débours, actes, dossiers et éventuels fonds de tiers ne suivent pas toujours le même circuit. La mission doit distinguer les flux applicables au mode d’exercice et préciser les contrôles sans mélanger la gestion de l’office ou du cabinet avec celle des clients.",
    flowFocus: [
      "Honoraires, provisions, débours et frais refacturés",
      "Dossiers ou actes à relier aux pièces comptables",
      "Flux de tiers ou comptes dédiés lorsque le métier en comporte",
      "Rémunération des associés et organisation de l’équipe",
    ],
    documentFocus: [
      "Factures d’honoraires, provisions et frais représentatifs",
      "Relevés bancaires des comptes professionnels concernés",
      "État des dossiers en cours utile au rapprochement",
      "Flux de tiers strictement nécessaires, selon le cadre applicable",
    ],
    decisionFocus: [
      "Séparation claire des circuits et des accès",
      "Organisation compatible avec les règles de confidentialité",
      "Interlocuteur capable d’expliquer les anomalies",
    ],
  },
  immobilier: {
    perspective:
      "Biens, opérations, loyers, charges, mandats et financements peuvent demander des suivis séparés. Le cadrage doit partir de la structure juridique et des flux réellement gérés, puis identifier les rapprochements et restitutions nécessaires.",
    flowFocus: [
      "Loyers, honoraires ou ventes selon l’activité exercée",
      "Charges, travaux, financements et dépôts concernés",
      "Flux gérés pour compte de tiers lorsqu’ils existent",
      "Suivi par bien, mandat ou opération si les données le permettent",
    ],
    documentFocus: [
      "Liste des biens, mandats ou opérations concernés",
      "Relevés des loyers, honoraires ou ventes selon l’activité",
      "Charges, travaux, emprunts et échéanciers disponibles",
      "Comptes dédiés et rapprochements lorsque le cadre l’exige",
    ],
    decisionFocus: [
      "Séparation des entités, biens ou mandats",
      "Traçabilité des mouvements et justificatifs",
      "Restitution adaptée aux décisions immobilières",
    ],
  },
  "transport-logistique": {
    perspective:
      "Courses ou tournées, carburant, péages, véhicules, plateformes et équipes peuvent créer de nombreux flux de faible montant. La comparaison doit porter sur leur collecte, leur contrôle et la visibilité obtenue sur l’exploitation.",
    flowFocus: [
      "Prestations, courses ou tournées facturées",
      "Carburant, péages, entretien et autres frais de route",
      "Véhicules détenus, loués ou financés",
      "Plateformes, sous-traitants et personnel, selon l’organisation",
    ],
    documentFocus: [
      "Exports de facturation ou relevés des plateformes utilisées",
      "Factures de carburant, péages et entretien représentatives",
      "Contrats de location, financement et assurance des véhicules",
      "Éléments de paie ou de sous-traitance, le cas échéant",
    ],
    decisionFocus: [
      "Collecte simple des nombreux frais d’exploitation",
      "Lecture des coûts par véhicule ou activité si disponible",
      "Traitement des écarts entre plateformes et banque",
    ],
  },
  "industrie-artisanat": {
    perspective:
      "Commandes, achats de matières, production, stocks, machines et temps de travail s’inscrivent dans des cycles différents. Le niveau de suivi doit rester proportionné aux données produites par l’atelier et aux décisions à prendre.",
    flowFocus: [
      "Commandes, acomptes, facturation et encaissements",
      "Matières, sous-traitance et autres coûts de production",
      "Inventaire, en-cours et écarts documentés",
      "Machines, entretien, location et financement",
    ],
    documentFocus: [
      "Commandes et factures d’un échantillon de productions",
      "Achats de matières et contrats de sous-traitance",
      "Dernier inventaire et suivi des en-cours disponible",
      "Registre des équipements et contrats de financement",
    ],
    decisionFocus: [
      "Méthode réaliste de suivi des en-cours",
      "Lien entre achats, production et facturation",
      "Visibilité sur les investissements et leur financement",
    ],
  },
  "culture-loisirs-education": {
    perspective:
      "Billetterie, inscriptions, prestations, financements, droits et rémunérations peuvent suivre plusieurs calendriers. Le cadrage doit distinguer les flux réellement présents et les périodes où l’équipe administrative est la plus sollicitée.",
    flowFocus: [
      "Billetterie, inscriptions ou prestations selon l’activité",
      "Acomptes, annulations et remboursements",
      "Financements, partenariats ou droits lorsqu’ils existent",
      "Intervenants, salariés et dépenses par projet",
    ],
    documentFocus: [
      "Exports de billetterie, d’inscription ou de facturation",
      "Contrats avec clients, intervenants et partenaires",
      "Conventions de financement ou de droits applicables",
      "Calendrier des événements, sessions ou projets",
    ],
    decisionFocus: [
      "Organisation adaptée aux pics d’activité",
      "Suivi distinct des projets ou ressources si nécessaire",
      "Traitement explicite des annulations et acomptes",
    ],
  },
  "agriculture-environnement": {
    perspective:
      "Cycles de production, ventes, aides éventuelles, stocks et équipements peuvent se dérouler sur des périodes différentes. Le professionnel doit expliquer comment il reprend les données disponibles et comment il restitue les effets de la saisonnalité.",
    flowFocus: [
      "Ventes, contrats et encaissements selon les productions",
      "Achats, intrants, sous-traitance et frais d’exploitation",
      "Stocks, en-cours ou immobilisations biologiques si concernés",
      "Équipements, financements et aides éventuelles",
    ],
    documentFocus: [
      "Relevé des ventes et contrats de production disponibles",
      "Principaux achats et frais liés à l’exploitation",
      "Dernier inventaire ou état des en-cours lorsqu’il existe",
      "Échéanciers des équipements et pièces relatives aux aides",
    ],
    decisionFocus: [
      "Lecture cohérente avec le cycle de production",
      "Traitement documenté des stocks et investissements",
      "Calendrier adapté aux périodes de forte activité",
    ],
  },
  "secteur-non-marchand": {
    perspective:
      "Cotisations, dons, subventions, activités et budgets affectés peuvent répondre à des règles et décisions différentes. La mission doit montrer comment les ressources sont suivies et comment les informations seront présentées aux instances de gouvernance.",
    flowFocus: [
      "Cotisations, dons, subventions et recettes d’activité",
      "Dépenses courantes et ressources affectées à un projet",
      "Salariés, bénévoles et remboursements de frais",
      "Budgets ou fonds distincts lorsque l’organisation en comporte",
    ],
    documentFocus: [
      "Statuts, budgets et dernières décisions de gouvernance utiles",
      "Conventions de subvention et suivi des ressources affectées",
      "Relevés des cotisations, dons ou recettes d’activité",
      "Frais, paie et remboursements représentatifs",
    ],
    decisionFocus: [
      "Restitution compréhensible par la gouvernance",
      "Traçabilité des ressources affectées",
      "Calendrier coordonné avec assemblées et financeurs",
    ],
  },
};

function professionLabel(profession: Profession): string {
  return profession.name.toLocaleLowerCase("fr-FR");
}

function splitFacts(value: string | null): string[] {
  if (!value) return [];
  return [...new Set(value.split(/[,.;]/u).map((item) => item.trim()).filter(Boolean))].slice(0, 8);
}

function profileFor(profession: Profession): EditorialProfile {
  return CATEGORY_PROFILES[profession.category_slug] ?? DEFAULT_PROFILE;
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

function ContextSection({ profession, category }: ProfessionFallbackProps) {
  const profile = profileFor(profession);
  const facts = splitFacts(profession.obligations);
  const label = professionLabel(profession);

  return (
    <div id="fonctionnement" className="scroll-mt-36" data-profession-fallback-section="context">
      <div className="grid gap-10 lg:grid-cols-[.86fr_1.14fr] lg:items-start">
        <div className="lg:sticky lg:top-36">
          <SectionHeading
            eyebrow="01 · Votre activité"
            title={`Partir du fonctionnement réel des ${label}`}
            body={`${profession.description ? `${profession.description}. ` : ""}${profile.perspective}`}
          />
          <figure className="relative mt-8 aspect-[3/2] overflow-hidden rounded-[1.35rem] bg-lilac">
            <Image
              src="/images/skoria-v2/editorial/accounting-flow.webp"
              alt="Documents comptables organisés en étapes avec registre et calculatrice"
              fill
              sizes="(max-width: 1024px) 100vw, 38vw"
              className="object-cover"
            />
          </figure>
        </div>

        <div className="space-y-5">
          <article className="rounded-[1.25rem] border border-ink/10 bg-white p-6 lg:p-8">
            <p className="sk-eyebrow text-blue">Repères déjà présents dans la fiche</p>
            <h3 className="mt-4 text-[1.15rem] font-bold text-ink">Des sujets à vérifier, pas un diagnostic automatique</h3>
            <p className="mt-4 text-[.84rem] leading-7 text-ink-muted">
              {facts.length > 0
                ? "Les mentions ci-dessous viennent de la fiche métier existante. Elles servent à préparer les questions ; le professionnel retenu doit confirmer leur portée selon le statut, les options et les opérations réelles."
                : "La fiche ne contient pas de liste réglementaire détaillée. Commencez par le statut, le régime fiscal, les flux et les échéances, puis faites confirmer les règles qui s’appliquent réellement."}
            </p>
            {facts.length > 0 && (
              <ul className="mt-6 flex flex-wrap gap-2">
                {facts.map((fact) => (
                  <li key={fact} className="rounded-full border border-ink/12 bg-paper px-4 py-2 text-[.74rem] font-semibold text-ink">
                    {fact}
                  </li>
                ))}
              </ul>
            )}
          </article>

          <article className="overflow-hidden rounded-[1.25rem] bg-navy p-6 text-white lg:p-8">
            <p className="sk-eyebrow text-orange">Les flux à montrer</p>
            <ul className="mt-6 grid gap-px overflow-hidden rounded-xl bg-white/14 sm:grid-cols-2">
              {profile.flowFocus.map((item, index) => (
                <li key={item} className="bg-navy p-5">
                  <span className="font-display font-semibold text-[1.8rem] text-orange">0{index + 1}</span>
                  <p className="mt-3 text-[.8rem] leading-6 text-white/72">{item}</p>
                </li>
              ))}
            </ul>
          </article>

          <nav aria-label="Accès aux critères de comparaison" className="flex flex-wrap gap-2">
            {[
              ["#responsabilites-metier", "Responsabilités"],
              ["#documents-metier", "Documents"],
              ["#calendrier-metier", "Calendrier"],
              ["#honoraires-metier", "Honoraires"],
              ["#questions-metier", "Questions"],
            ].map(([href, text]) => (
              <a key={href} href={href} className="rounded-full border border-ink/15 bg-white px-4 py-2 text-[.72rem] font-bold text-ink hover:border-blue hover:text-blue">
                {text}
              </a>
            ))}
          </nav>
          {category?.name && <p className="text-[.7rem] leading-5 text-ink-muted">Famille de navigation : {category.name}.</p>}
        </div>
      </div>
    </div>
  );
}

function ScopeSection({ profession }: ProfessionFallbackProps) {
  const label = professionLabel(profession);
  const cards = [
    {
      title: "Production comptable",
      body: "Demandez quelles pièces sont collectées, qui les classe, quels contrôles sont réalisés et quels documents sont produits. Faites distinguer la saisie, la révision, la clôture et l’explication des comptes.",
    },
    {
      title: "Fiscalité",
      body: "Listez les déclarations et options à étudier, puis faites préciser les données attendues, les validations et les alertes. Le devis doit séparer les travaux récurrents des analyses ponctuelles.",
    },
    {
      title: "Social et dirigeant",
      body: "Si une équipe est concernée, décrivez les effectifs, événements et échéances de paie. Ajoutez les sujets liés au dirigeant sans supposer qu’ils figurent automatiquement dans la mission comptable.",
    },
    {
      title: "Pilotage",
      body: "Nommez les décisions à préparer avant de demander un tableau de bord. Indicateurs, fréquence, données sources et temps de restitution doivent apparaître ensemble pour être comparables.",
    },
  ];

  return (
    <div id="perimetre-metier" className="scroll-mt-36" data-profession-fallback-section="scope">
      <SectionHeading
        eyebrow="02 · Périmètre"
        title="Transformer le métier en tâches observables"
        body={`Une proposition destinée aux ${label} ne devient précise que lorsqu’elle nomme les opérations, les contrôles, les livrables et les limites de la mission. Tous les blocs ci-dessous ne sont pas forcément nécessaires : utilisez-les pour composer un périmètre adapté.`}
      />
      <div className="mt-10 grid gap-4 md:grid-cols-2">
        {cards.map((card, index) => (
          <article key={card.title} className={`rounded-[1.25rem] p-6 lg:p-8 ${index === 0 ? "bg-blue text-white" : "border border-ink/10 bg-white text-ink"}`}>
            <span className={`font-mono text-[.66rem] font-bold ${index === 0 ? "text-orange" : "text-blue"}`}>0{index + 1}</span>
            <h3 className="mt-5 text-[1.15rem] font-bold">{card.title}</h3>
            <p className={`mt-4 text-[.84rem] leading-7 ${index === 0 ? "text-white/74" : "text-ink-muted"}`}>{card.body}</p>
          </article>
        ))}
      </div>
      <p className="mt-6 max-w-4xl text-[.8rem] leading-7 text-ink-muted">
        Le professionnel peut proposer un autre découpage. Pour comparer correctement, demandez-lui de rattacher chaque ligne du devis à une tâche, un livrable, une fréquence et une responsabilité clairement identifiables.
      </p>
    </div>
  );
}

const RESPONSIBILITY_ROWS = [
  [
    "Informations et pièces",
    "L’entreprise décrit les flux, transmet les pièces dans les formats convenus et signale les événements qui changent le dossier.",
    "Le cabinet retenu précise les données attendues, les contrôles inclus et la procédure suivie lorsqu’une information manque.",
  ],
  [
    "Classement et validation",
    "L’entreprise nomme les personnes autorisées à valider un paiement, une déclaration, une écriture sensible ou une option.",
    "Le cabinet explique ce qu’il prépare, ce qu’il contrôle et ce qui attend une décision explicite de l’entreprise.",
  ],
  [
    "Déclarations et échéances",
    "L’entreprise respecte le calendrier de transmission et répond aux demandes dans le délai convenu.",
    "Le cabinet confirme les déclarations comprises, les dates de travail et les conséquences prévues en cas de retard documentaire.",
  ],
  [
    "Restitution et décisions",
    "Le dirigeant reste responsable des décisions prises à partir des informations présentées.",
    "Le cabinet décrit les livrables, leurs limites et le temps d’échange prévu lorsque l’analyse figure dans la mission.",
  ],
  [
    "Accès et sortie",
    "L’entreprise tient à jour les habilitations et conserve la maîtrise de ses accès essentiels.",
    "Le cabinet précise les règles de sécurité, les formats d’export et les conditions de restitution des données en fin de mission.",
  ],
];

function ResponsibilitiesSection({ profession }: ProfessionFallbackProps) {
  const label = professionLabel(profession);
  return (
    <div id="responsabilites-metier" className="scroll-mt-36" data-profession-fallback-section="responsibilities">
      <SectionHeading
        eyebrow="03 · Responsabilités"
        title="Écrire qui fait quoi avant la première échéance"
        body={`Pour les ${label}, une bonne connaissance du métier ne remplace pas une répartition claire des rôles. Cette matrice sert de support de discussion ; seule la lettre de mission du professionnel choisi fixe les engagements réels.`}
      />
      <div className="mt-10 overflow-hidden rounded-[1.25rem] border border-ink/12 bg-white">
        <div className="hidden grid-cols-[.55fr_1fr_1fr] gap-px bg-ink/12 text-[.67rem] font-bold uppercase tracking-[.12em] md:grid">
          <p className="bg-navy p-5 text-white">Sujet</p>
          <p className="bg-navy p-5 text-white">Entreprise</p>
          <p className="bg-navy p-5 text-white">Cabinet retenu</p>
        </div>
        {RESPONSIBILITY_ROWS.map(([topic, company, firm]) => (
          <article key={topic} className="grid gap-4 border-t border-ink/10 p-5 first:border-t-0 md:grid-cols-[.55fr_1fr_1fr] md:gap-7 lg:p-6">
            <h3 className="text-[.9rem] font-bold text-blue">{topic}</h3>
            <p className="text-[.8rem] leading-6 text-ink-muted"><span className="font-bold text-ink md:hidden">Entreprise — </span>{company}</p>
            <p className="text-[.8rem] leading-6 text-ink-muted"><span className="font-bold text-ink md:hidden">Cabinet — </span>{firm}</p>
          </article>
        ))}
      </div>
    </div>
  );
}

function DocumentsSection({ profession }: ProfessionFallbackProps) {
  const profile = profileFor(profession);
  const label = professionLabel(profession);
  const groups = [
    {
      title: "Cadre actuel",
      body: "Pour comprendre la structure et éviter de comparer sur une hypothèse erronée.",
      items: ["Statut et mode d’exercice", "Régime fiscal et options déjà connues", "Lettre de mission actuelle en cas de changement", "Coordonnées des interlocuteurs et accès à reprendre"],
    },
    {
      title: "Historique comptable",
      body: "Pour mesurer la qualité de la reprise et rendre les prochaines échéances visibles.",
      items: ["Derniers comptes ou déclarations disponibles", "Balance, grand livre ou export récupérable", "Liste des points en attente et pièces manquantes", "Calendrier de clôture et déclarations proches"],
    },
    {
      title: "Flux du métier",
      body: "Sélectionnez uniquement les pièces qui correspondent au fonctionnement réel.",
      items: profile.documentFocus,
    },
    {
      title: "Échantillon de travail",
      body: "Quelques cas représentatifs permettent de tester la méthode sans transmettre tout le dossier au premier échange.",
      items: ["Une vente ou recette avec son encaissement", "Un achat ou frais avec son justificatif", "Une opération inhabituelle à expliquer", "Un livrable que vous utilisez déjà pour décider"],
    },
  ];

  return (
    <div id="documents-metier" className="scroll-mt-36" data-profession-fallback-section="documents">
      <SectionHeading
        eyebrow="04 · Documents"
        title="Préparer un dossier lisible sans tout envoyer"
        body={`Le premier échange pour les ${label} doit permettre d’évaluer le périmètre et la reprise. Rassemblez les familles de documents, masquez les données inutiles à ce stade et demandez un canal sécurisé avant toute transmission sensible.`}
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

function CalendarSection({ profession }: ProfessionFallbackProps) {
  const label = professionLabel(profession);
  const steps = [
    ["Avant le devis", "Présenter le statut, les flux, les outils, l’historique et la prochaine échéance. Le cabinet peut alors signaler les inconnues qui empêchent de chiffrer le périmètre."],
    ["Pendant la reprise", "Lister les accès, exports, soldes, déclarations en cours et pièces manquantes. Chaque blocage doit avoir un responsable et une date de résolution adaptée au dossier."],
    ["Au fil de l’activité", "Fixer les dates de transmission, les validations attendues, la procédure en cas d’anomalie et le rythme des restitutions réellement utiles."],
    ["Avant la clôture", "Préparer les inventaires, confirmations, arbitrages et travaux particuliers assez tôt pour éviter qu’une décision importante soit découverte au dernier moment."],
  ];

  return (
    <div id="calendrier-metier" className="scroll-mt-36 rounded-[1.5rem] bg-navy p-6 text-white sm:p-8 lg:p-10" data-profession-fallback-section="calendar">
      <SectionHeading
        inverse
        eyebrow="05 · Calendrier"
        title="Construire le rythme à partir de la prochaine échéance"
        body={`Le calendrier des ${label} dépend du statut, des régimes et des événements du dossier. Il ne se résume pas à une liste de dates : chaque échéance doit être reliée à des informations, une validation et un livrable.`}
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
      <p className="mt-6 max-w-4xl text-[.76rem] leading-6 text-white/58">
        Les dates réglementaires doivent être confirmées à partir de la situation réelle et des sources officielles à jour. Cette trame sert à organiser les dépendances du travail, pas à remplacer ce contrôle.
      </p>
    </div>
  );
}

function CriteriaSection({ profession }: ProfessionFallbackProps) {
  const profile = profileFor(profession);
  const label = professionLabel(profession);
  const criteria = [
    ["Expérience vérifiable", `Demandez comment le cabinet traite un dossier de ${label} sans solliciter d’information confidentielle sur ses autres clients.`],
    ["Périmètre explicite", "Faites relier les tâches incluses aux livrables, fréquences, responsabilités et éventuels travaux hors mission."],
    ["Méthode de reprise", "Vérifiez l’état des données demandé, le traitement des anomalies et la continuité des échéances pendant la transition."],
    ["Interlocuteurs", "Identifiez la personne qui suit le dossier, celle qui valide les sujets techniques et les canaux prévus pour les urgences."],
    ["Outils et données", "Testez la collecte, les contrôles, les habilitations, les exports et la récupération des données en cas de départ."],
    ["Restitution utile", `Choisissez un rythme qui éclaire vos décisions : ${profile.decisionFocus.join(" ; ").toLocaleLowerCase("fr-FR")}.`],
  ];

  return (
    <div id="criteres-metier" className="scroll-mt-36" data-profession-fallback-section="criteria">
      <SectionHeading
        eyebrow="06 · Sélection"
        title="Évaluer la spécialisation à partir d’exemples concrets"
        body="Une mention de spécialisation ne suffit pas. Demandez au professionnel de décrire son processus sur un cas représentatif, puis comparez sa réponse avec les mêmes critères pour chaque cabinet."
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

function FeesSection({ profession }: ProfessionFallbackProps) {
  const label = professionLabel(profession);
  const drivers = [
    "Volume et diversité des opérations",
    "État de l’historique et travail de reprise",
    "Nombre d’entités, d’établissements ou d’interlocuteurs",
    "Fréquence des productions et restitutions",
    "Niveau d’autonomie sur la collecte et les validations",
    "Travaux ponctuels, urgences et conseil hors cycle",
  ];
  const quoteParts = [
    ["Socle récurrent", "Tâches, livrables, fréquence et interlocuteurs compris dans la mission courante."],
    ["Mise en place", "Reprise, paramétrage, nettoyage ou migration décrits séparément lorsqu’ils sont nécessaires."],
    ["Options", "Paie, pilotage, juridique ou autres travaux identifiés sans supposer qu’ils sont inclus."],
    ["Conditions", "Révision des honoraires, travaux supplémentaires, durée, sortie et restitution des données."],
  ];

  return (
    <div id="honoraires-metier" className="scroll-mt-36" data-profession-fallback-section="fees">
      <div className="grid gap-10 lg:grid-cols-[.8fr_1.2fr]">
        <div>
          <SectionHeading
            eyebrow="07 · Honoraires"
            title="Comparer le prix du même périmètre"
            body={`Il n’existe pas de montant fiable pour les ${label} sans connaître le dossier. Chaque professionnel fixe ses honoraires après analyse ; Skoria ne présente donc ici ni tarif standard, ni remise, ni promesse de prix.`}
          />
          <Link href="/simulateurs/honoraires" className="mt-7 inline-flex min-h-11 items-center rounded-full border border-ink/20 bg-white px-5 text-[.76rem] font-bold text-ink hover:border-blue hover:text-blue">
            Tester des hypothèses d’honoraires&nbsp; ↗
          </Link>
        </div>
        <div className="space-y-5">
          <article className="rounded-[1.25rem] border border-ink/10 bg-white p-6 lg:p-8">
            <h3 className="text-[1.05rem] font-bold text-ink">Ce qui peut faire varier une proposition</h3>
            <ul className="mt-5 grid gap-3 sm:grid-cols-2">
              {drivers.map((driver) => (
                <li key={driver} className="flex gap-3 rounded-xl bg-paper p-4 text-[.8rem] leading-6 text-ink">
                  <span aria-hidden className="text-orange">●</span>{driver}
                </li>
              ))}
            </ul>
          </article>
          <article className="overflow-hidden rounded-[1.25rem] border border-ink/10 bg-white">
            {quoteParts.map(([title, body]) => (
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

function QuestionsSection({ profession }: ProfessionFallbackProps) {
  const facts = splitFacts(profession.obligations);
  const label = professionLabel(profession);
  const questions = [
    `Quel exemple concret montre votre façon d’organiser un dossier de ${label} ?`,
    "Quelles tâches sont incluses, lesquelles restent à notre charge et lesquelles feront l’objet d’un devis séparé ?",
    "Quels documents attendez-vous, à quelle date, dans quel format et par quel canal sécurisé ?",
    "Quels contrôles réalisez-vous avant une déclaration ou une clôture, et quelles validations nous demandez-vous ?",
    "Quels livrables recevrons-nous, à quelle fréquence et avec quel temps d’explication ?",
    "Qui suivra le dossier au quotidien et qui répondra lorsqu’un sujet demande une expertise plus technique ?",
    "Comment se déroule la reprise, puis la restitution des données si nous changeons de cabinet ?",
    "Quelles situations déclenchent des honoraires complémentaires et comment sommes-nous informés avant le travail ?",
    ...facts.slice(0, 2).map((fact) => `Comment vérifiez-vous le point « ${fact.toLocaleLowerCase("fr-FR")} » dans notre situation précise ?`),
  ];

  return (
    <div id="questions-metier" className="scroll-mt-36" data-profession-fallback-section="questions">
      <SectionHeading
        eyebrow="08 · Entretien"
        title="Poser les mêmes questions à chaque cabinet"
        body="Notez les réponses avec leurs conditions et leurs limites. Une comparaison devient exploitable lorsqu’elle conserve les différences de méthode, de responsabilité et de périmètre au lieu de réduire la proposition à un montant."
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
          <p className="mt-3 max-w-3xl text-[.8rem] leading-6 text-white/68">Ajoutez vos volumes, vos outils, la prochaine échéance et les points encore inconnus dans le brief. Vous pourrez ensuite confronter les réponses sans envoyer automatiquement vos informations.</p>
        </div>
        <Link href="/annuaire/experts-comptables" className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-full bg-orange px-5 text-[.76rem] font-bold text-navy">
          Ouvrir l’annuaire&nbsp; ↗
        </Link>
      </div>
    </div>
  );
}

export function getProfessionFallbackTakeaways(profession: Profession): string[] {
  const facts = splitFacts(profession.obligations);
  return [
    facts.length > 0
      ? `La fiche identifie notamment : ${facts.slice(0, 3).join(", ")}. Ces points restent à confirmer selon votre situation.`
      : "Le statut, le régime fiscal, les flux et les échéances doivent être confirmés avant de définir la mission.",
    "La lettre de mission doit relier les tâches, les responsabilités, les livrables et le calendrier.",
    "Les honoraires se comparent à périmètre équivalent, avec la reprise, les options et les travaux supplémentaires clairement séparés.",
  ];
}

export function getProfessionFallbackFaqs(profession: Profession): { question: string; answer: string }[] {
  const label = professionLabel(profession);
  const facts = splitFacts(profession.obligations);
  const existingContext = facts.length > 0
    ? `La fiche métier mentionne ${facts.slice(0, 4).join(", ")}. Ces éléments servent de départ et doivent être vérifiés selon le statut et les opérations réelles.`
    : "Commencez par décrire le statut, les flux, les outils et les échéances. Le professionnel pourra alors confirmer les règles applicables.";

  return [
    {
      question: `Pourquoi comparer l’expérience d’un expert-comptable avec les ${label} ?`,
      answer: `Une expérience proche peut faciliter la collecte, les contrôles et les échanges. Demandez toutefois un exemple de processus concret : une étiquette de spécialisation ne garantit ni le périmètre, ni la disponibilité, ni la qualité de la restitution.`,
    },
    {
      question: `Quels points comptables ou fiscaux préparer pour les ${label} ?`,
      answer: existingContext,
    },
    {
      question: "Quels documents apporter au premier échange ?",
      answer: "Préparez le statut, les derniers comptes ou déclarations disponibles, un aperçu des flux, les outils utilisés, les échéances proches et quelques pièces représentatives. Demandez un canal sécurisé avant de transmettre des données sensibles.",
    },
    {
      question: "Comment répartir les responsabilités avec le cabinet ?",
      answer: "Faites écrire qui collecte, contrôle, valide, dépose et répond lorsqu’une information manque. La lettre de mission doit aussi nommer les livrables, les dates de transmission et les limites de l’intervention.",
    },
    {
      question: `Combien coûte un expert-comptable pour les ${label} ?`,
      answer: "Les honoraires dépendent notamment du volume, de la variété des opérations, de l’état du dossier, du rythme de restitution et des travaux ponctuels. Comparez un socle, des options et des conditions clairement décrits plutôt qu’un montant isolé.",
    },
    {
      question: "Cabinet local, hybride ou à distance : que comparer ?",
      answer: "Comparez la disponibilité réelle, les interlocuteurs, les canaux d’échange, le circuit documentaire, les outils et l’accès à vos données. Le bon mode dépend de votre autonomie et des moments où un échange direct est nécessaire.",
    },
    {
      question: "Quel est le rôle de Skoria dans cette démarche ?",
      answer: "Skoria fournit des repères de comparaison, un brief et un annuaire. La plateforme ne réalise pas la prestation comptable et n’envoie pas automatiquement les informations saisies ; chaque professionnel confirme directement sa capacité, ses honoraires et ses engagements.",
    },
  ];
}

export function buildProfessionFallbackSections(props: ProfessionFallbackProps): ReactElement[] {
  return [
    <ContextSection key="profession-context" {...props} />,
    <ScopeSection key="profession-scope" {...props} />,
    <ResponsibilitiesSection key="profession-responsibilities" {...props} />,
    <DocumentsSection key="profession-documents" {...props} />,
    <CalendarSection key="profession-calendar" {...props} />,
    <CriteriaSection key="profession-criteria" {...props} />,
    <FeesSection key="profession-fees" {...props} />,
    <QuestionsSection key="profession-questions" {...props} />,
  ];
}
