import Database from "better-sqlite3";
import path from "node:path";
import { SCHEMA } from "./schema";

const DB_PATH = path.join(process.cwd(), "numeris.db");
const db = new Database(DB_PATH);
db.pragma("journal_mode = WAL");
db.exec(SCHEMA);

// ─── SERVICES ───
const insertService = db.prepare(
  `INSERT OR REPLACE INTO services (slug, title, description, icon, order_index)
   VALUES (@slug, @title, @description, @icon, @order_index)`,
);

const services = [
  {
    slug: "comptabilite",
    title: "Comptabilité générale",
    description:
      "Tenue comptable complète, révision des comptes et établissement des états financiers conformes aux normes françaises.",
    icon: "📊",
    order_index: 1,
  },
  {
    slug: "fiscalite",
    title: "Conseil fiscal",
    description:
      "Optimisation fiscale, déclarations d'impôts, TVA et accompagnement lors de contrôles fiscaux.",
    icon: "📋",
    order_index: 2,
  },
  {
    slug: "social",
    title: "Gestion sociale",
    description:
      "Bulletins de paie, déclarations sociales, contrats de travail et conseil en droit social.",
    icon: "👥",
    order_index: 3,
  },
  {
    slug: "creation-entreprise",
    title: "Création d'entreprise",
    description:
      "Accompagnement dans le choix du statut juridique, rédaction des statuts et formalités de création.",
    icon: "🚀",
    order_index: 4,
  },
  {
    slug: "conseil-gestion",
    title: "Conseil en gestion",
    description:
      "Tableaux de bord, prévisionnel financier, analyse de rentabilité et pilotage de votre activité.",
    icon: "📈",
    order_index: 5,
  },
  {
    slug: "audit",
    title: "Audit & commissariat",
    description:
      "Missions d'audit légal et contractuel, commissariat aux comptes et attestations.",
    icon: "🔍",
    order_index: 6,
  },
];

for (const s of services) insertService.run(s);

// ─── TEAM MEMBERS ───
const insertTeam = db.prepare(
  `INSERT OR REPLACE INTO team_members (slug, name, role, initials, description, specialties, badge, order_index)
   VALUES (@slug, @name, @role, @initials, @description, @specialties, @badge, @order_index)`,
);

const team = [
  {
    slug: "equipe-editoriale",
    name: "Équipe éditoriale Skoria",
    role: "Éditeur du comparateur",
    initials: "N",
    description:
      "Méthodologie de comparaison, structuration des ressources et contrôle des données publiques.",
    specialties: JSON.stringify(["Comparaison", "Données publiques", "Méthode éditoriale"]),
    badge: "Comparateur indépendant",
    order_index: 1,
  },
  {
    slug: "controle-qualite",
    name: "Contrôle qualité",
    role: "Relecture éditoriale",
    initials: "CQ",
    description:
      "Vérification des libellés, des limites affichées et des liens vers les ressources utiles.",
    specialties: JSON.stringify(["Sources", "Corrections", "Cohérence"]),
    badge: null,
    order_index: 2,
  },
  {
    slug: "donnees-publiques",
    name: "Données publiques",
    role: "Référentiel annuaire",
    initials: "DP",
    description:
      "Structuration des fiches publiques et traitement des demandes de correction.",
    specialties: JSON.stringify(["Annuaire", "SIRET", "Correction"]),
    badge: null,
    order_index: 3,
  },
  {
    slug: "ressources",
    name: "Ressources",
    role: "Guides et simulateurs",
    initials: "R",
    description:
      "Production de guides pratiques pour préparer les questions à poser à un professionnel.",
    specialties: JSON.stringify(["Guides", "Simulateurs", "Questions"]),
    badge: null,
    order_index: 4,
  },
];

for (const t of team) insertTeam.run(t);

// ─── TESTIMONIALS ───
const insertTesti = db.prepare(
  `INSERT OR REPLACE INTO testimonials (id, author_name, author_initials, author_role, body, stars, featured)
   VALUES (@id, @author_name, @author_initials, @author_role, @body, @stars, @featured)`,
);

const testimonials = [
  {
    id: 1,
    author_name: "Méthode Skoria",
    author_initials: "N",
    author_role: "Comparateur indépendant",
    body: "Comparer un professionnel comptable suppose de clarifier le périmètre, les outils, les délais et les responsabilités avant tout engagement.",
    stars: 0,
    featured: 0,
  },
  {
    id: 2,
    author_name: "Méthode Skoria",
    author_initials: "N",
    author_role: "Comparateur indépendant",
    body: "Une page utile distingue les faits publics, les éléments à confirmer et les promesses que seule une lettre de mission peut encadrer.",
    stars: 0,
    featured: 1,
  },
  {
    id: 3,
    author_name: "Méthode Skoria",
    author_initials: "N",
    author_role: "Comparateur indépendant",
    body: "Les contenus Skoria préparent une comparaison. Ils ne remplacent pas l'analyse d'un professionnel habilité sur une situation particulière.",
    stars: 0,
    featured: 0,
  },
];

for (const t of testimonials) insertTesti.run(t);

// ─── PRICING PLANS ───
const insertPlan = db.prepare(
  `INSERT OR REPLACE INTO pricing_plans (slug, tag, name, description, price, period, features, featured, cta_label, note, order_index)
   VALUES (@slug, @tag, @name, @description, @price, @period, @features, @featured, @cta_label, @note, @order_index)`,
);

const plans = [
  {
    slug: "essentiel",
    tag: "Repère",
    name: "Besoin simple",
    description: "Repères à comparer pour une activité avec peu de flux.",
    price: "À cadrer",
    period: "",
    features: JSON.stringify([
      { label: "Volume de factures", included: true },
      { label: "Déclarations concernées", included: true },
      { label: "Bilan et clôture à confirmer", included: true },
      { label: "Conseil fiscal dédié à comparer", included: false },
      { label: "Paie et social à comparer", included: false },
    ]),
    featured: 0,
    cta_label: "Préparer ma demande",
    note: "Repère indicatif, sans offre Skoria",
    order_index: 1,
  },
  {
    slug: "professionnel",
    tag: "Repère",
    name: "Besoin complet",
    description: "Critères à comparer pour une activité avec suivi régulier.",
    price: "À comparer",
    period: "",
    features: JSON.stringify([
      { label: "Tenue comptable à cadrer", included: true },
      { label: "Déclarations fiscales à couvrir", included: true },
      { label: "Bilan & liasse fiscale à confirmer", included: true },
      { label: "Conseil fiscal à comparer", included: true },
      { label: "Gestion sociale selon effectif", included: true },
    ]),
    featured: 1,
    cta_label: "Comparer les critères",
    note: null,
    order_index: 2,
  },
  {
    slug: "premium",
    tag: "Repère",
    name: "Besoin avancé",
    description: "Points de comparaison pour une structure multi-sujets.",
    price: "Sur mission",
    period: "",
    features: JSON.stringify([
      { label: "Reporting et consolidation à cadrer", included: true },
      { label: "Audit contractuel à comparer", included: true },
      { label: "Pilotage financier à préciser", included: true },
      { label: "Interlocuteurs et responsabilités à valider", included: true },
      { label: "Périmètre social selon effectif", included: true },
    ]),
    featured: 0,
    cta_label: "Demander une orientation",
    note: "Mission à confirmer avec le professionnel choisi",
    order_index: 3,
  },
];

for (const p of plans) insertPlan.run(p);

// ─── FAQ ───
const insertFaq = db.prepare(
  `INSERT OR REPLACE INTO faq_items (id, question, answer, order_index)
   VALUES (@id, @question, @answer, @order_index)`,
);

const faqs = [
  {
    id: 1,
    question: "Quels types d'entreprises peuvent utiliser Skoria ?",
    answer:
      "Skoria s'adresse aux <strong>auto-entrepreneurs, TPE, PME et dirigeants</strong> qui veulent clarifier leurs critères avant de choisir un professionnel comptable.",
    order_index: 1,
  },
  {
    id: 2,
    question: "Comment préparer une comparaison ?",
    answer:
      "Commencez par lister votre activité, vos échéances, vos outils, votre volume de pièces et les sujets à confirmer : TVA, paie, clôture, conseil ou création.",
    order_index: 2,
  },
  {
    id: 3,
    question: "Skoria réalise-t-il des prestations comptables ?",
    answer:
      "Non. Skoria est un comparateur indépendant et une plateforme d'information. Les prestations comptables, fiscales ou sociales doivent être confirmées directement avec un professionnel habilité.",
    order_index: 3,
  },
  {
    id: 4,
    question: "Les informations de l'annuaire sont-elles garanties ?",
    answer:
      "Les fiches s'appuient sur des données publiques ou documentées quand elles existent. Les informations qui ne sont pas confirmées doivent être vérifiées auprès du professionnel concerné.",
    order_index: 4,
  },
  {
    id: 5,
    question: "Skoria recommande-t-il un professionnel précis ?",
    answer:
      "Non. Skoria aide à comparer des critères et à préparer des questions. Le choix final dépend de votre situation, de vos vérifications et de la lettre de mission proposée.",
    order_index: 5,
  },
];

for (const f of faqs) insertFaq.run(f);

// ─── PAGES ───
const insertPage = db.prepare(
  `INSERT OR REPLACE INTO pages (slug, title, meta_title, meta_description, h1, content)
   VALUES (@slug, @title, @meta_title, @meta_description, @h1, @content)`,
);

const pages = [
  {
    slug: "accueil",
    title: "Accueil",
    meta_title:
      "Skoria | Comparateur indépendant de professionnels comptables",
    meta_description:
      "Comparateur indépendant pour comprendre, comparer et préparer le choix d'un professionnel comptable adapté à votre activité.",
    h1: "Comparer avant de choisir",
    content: null,
  },
  {
    slug: "nos-expertises",
    title: "Expertises",
    meta_title:
      "Expertises comptables à comparer | Skoria",
    meta_description:
      "Comprendre les missions à comparer : comptabilité, fiscalité, social, création d'entreprise, conseil en gestion et audit.",
    h1: "Expertises à comparer",
    content: null,
  },
  {
    slug: "equipe",
    title: "Méthode",
    meta_title:
      "Méthode éditoriale | Skoria",
    meta_description:
      "Découvrez la méthode Skoria : sources publiques, limites éditoriales et critères de comparaison.",
    h1: "Une méthode de comparaison",
    content: null,
  },
  {
    slug: "formules",
    title: "Formules & tarifs",
    meta_title: "Repères de budget comptable | Skoria",
    meta_description:
      "Repères pour comparer les honoraires, le périmètre de mission et les livrables comptables.",
    h1: "Comparer les budgets",
    content: null,
  },
  {
    slug: "contact",
    title: "Contact",
    meta_title: "Demande d'orientation | Skoria",
    meta_description:
      "Décrivez votre besoin pour préparer une comparaison comptable, fiscale ou sociale.",
    h1: "Préparer votre demande",
    content: null,
  },
];

for (const p of pages) insertPage.run(p);

console.log("✅ Database seeded successfully");
db.close();
