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
    slug: "philippe-durand",
    name: "Philippe Durand",
    role: "Expert-Comptable · Associé fondateur",
    initials: "PD",
    description:
      "30 ans d'expérience en expertise comptable. Spécialiste de l'accompagnement des PME et ETI.",
    specialties: JSON.stringify(["Fiscalité", "Audit", "Stratégie"]),
    badge: "Associé fondateur",
    order_index: 1,
  },
  {
    slug: "claire-moreau",
    name: "Claire Moreau",
    role: "Expert-Comptable · Associée",
    initials: "CM",
    description:
      "Diplômée HEC, spécialiste en restructuration et optimisation fiscale des groupes.",
    specialties: JSON.stringify(["International", "Consolidation", "M&A"]),
    badge: "DEC",
    order_index: 2,
  },
  {
    slug: "antoine-bernard",
    name: "Antoine Bernard",
    role: "Responsable social",
    initials: "AB",
    description:
      "Expert en droit social et gestion de la paie. Accompagne plus de 150 entreprises.",
    specialties: JSON.stringify(["Paie", "Droit social", "RH"]),
    badge: null,
    order_index: 3,
  },
  {
    slug: "sophie-lambert",
    name: "Sophie Lambert",
    role: "Directrice conseil",
    initials: "SL",
    description:
      "Consultante senior en gestion d'entreprise, business plans et levées de fonds.",
    specialties: JSON.stringify(["Gestion", "Création", "Financement"]),
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
    author_name: "Laurent Petit",
    author_initials: "LP",
    author_role: "Gérant · SAS Petit & Fils",
    body: "Un accompagnement irréprochable depuis 8 ans. L'équipe Numeris a su s'adapter à chaque étape de la croissance de notre entreprise.",
    stars: 5,
    featured: 0,
  },
  {
    id: 2,
    author_name: "Marie Dupont",
    author_initials: "MD",
    author_role: "Directrice · Agence Créative MD",
    body: "Grâce à Numeris, j'ai pu me concentrer sur mon cœur de métier en toute sérénité. Leur réactivité et leur expertise sont remarquables.",
    stars: 5,
    featured: 1,
  },
  {
    id: 3,
    author_name: "Thomas Martin",
    author_initials: "TM",
    author_role: "CEO · TechStart SAS",
    body: "Ils nous ont accompagnés de la création à notre première levée de fonds. Un vrai partenaire stratégique, pas juste un comptable.",
    stars: 5,
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
    tag: "Micro & Auto-entrepreneur",
    name: "Essentiel",
    description: "Le socle comptable pour démarrer sereinement.",
    price: "89 €",
    period: "/mois HT",
    features: JSON.stringify([
      { label: "Tenue comptable complète", included: true },
      { label: "Déclarations fiscales", included: true },
      { label: "Bilan & liasse fiscale", included: true },
      { label: "Conseil fiscal dédié", included: false },
      { label: "Gestion sociale", included: false },
    ]),
    featured: 0,
    cta_label: "Choisir Essentiel",
    note: "Sans engagement · Mise en place offerte",
    order_index: 1,
  },
  {
    slug: "professionnel",
    tag: "PME · Recommandé",
    name: "Professionnel",
    description: "L'offre complète pour piloter votre activité.",
    price: "249 €",
    period: "/mois HT",
    features: JSON.stringify([
      { label: "Tenue comptable complète", included: true },
      { label: "Déclarations fiscales", included: true },
      { label: "Bilan & liasse fiscale", included: true },
      { label: "Conseil fiscal dédié", included: true },
      { label: "Gestion sociale (jusqu'à 5 salariés)", included: true },
    ]),
    featured: 1,
    cta_label: "Choisir Professionnel",
    note: null,
    order_index: 2,
  },
  {
    slug: "premium",
    tag: "ETI & Groupes",
    name: "Premium",
    description: "Accompagnement stratégique sur-mesure.",
    price: "Sur devis",
    period: "",
    features: JSON.stringify([
      { label: "Tout le plan Professionnel", included: true },
      { label: "Consolidation & reporting", included: true },
      { label: "Audit interne", included: true },
      { label: "DAF externalisé", included: true },
      { label: "Gestion sociale illimitée", included: true },
    ]),
    featured: 0,
    cta_label: "Nous contacter",
    note: "Engagement annuel · Tarif dégressif",
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
    question: "Quels types d'entreprises accompagnez-vous ?",
    answer:
      "Nous accompagnons les <strong>auto-entrepreneurs, TPE, PME et ETI</strong> de tous secteurs. Notre approche s'adapte à la taille et aux besoins spécifiques de chaque structure.",
    order_index: 1,
  },
  {
    id: 2,
    question: "Comment se déroule la mise en place ?",
    answer:
      "Un rendez-vous initial permet de cerner vos besoins. Nous récupérons vos documents, paramétrons vos outils et vous attribuons un interlocuteur dédié. <strong>Comptez 48h</strong> pour être opérationnel.",
    order_index: 2,
  },
  {
    id: 3,
    question: "Proposez-vous un accompagnement à distance ?",
    answer:
      "Oui, nous travaillons avec des clients dans toute la France grâce à nos outils digitaux. Visioconférences, plateforme d'échange de documents sécurisée et signature électronique.",
    order_index: 3,
  },
  {
    id: 4,
    question: "Quels sont vos engagements en termes de délais ?",
    answer:
      "Nous garantissons le respect de tous les délais légaux. Les bilans sont livrés sous <strong>3 mois</strong> après la clôture, et les bulletins de paie avant le 25 du mois.",
    order_index: 4,
  },
  {
    id: 5,
    question: "Est-il possible de changer de formule en cours d'année ?",
    answer:
      "Absolument. Vous pouvez évoluer vers une formule supérieure à tout moment. Le passage à une formule inférieure est possible à chaque date anniversaire du contrat.",
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
      "Numeris Expertise Comptable à Paris | Cabinet comptable depuis 1996",
    meta_description:
      "Cabinet d'expertise comptable à Paris. Comptabilité, fiscalité, conseil en gestion et accompagnement des entreprises depuis 1996.",
    h1: "Votre partenaire comptable de confiance",
    content: null,
  },
  {
    slug: "nos-expertises",
    title: "Nos expertises",
    meta_title:
      "Nos expertises comptables | Numeris Expertise Comptable Paris",
    meta_description:
      "Découvrez nos services : comptabilité, fiscalité, gestion sociale, création d'entreprise, conseil en gestion et audit.",
    h1: "Nos domaines d'expertise",
    content: null,
  },
  {
    slug: "equipe",
    title: "L'équipe",
    meta_title:
      "Notre équipe d'experts-comptables | Numeris Expertise Comptable",
    meta_description:
      "Rencontrez l'équipe Numeris : experts-comptables, fiscalistes et conseillers dédiés à votre réussite.",
    h1: "Une équipe à votre écoute",
    content: null,
  },
  {
    slug: "formules",
    title: "Formules & tarifs",
    meta_title: "Tarifs expertise comptable | Numeris Expertise Comptable",
    meta_description:
      "Nos formules comptables adaptées à votre entreprise. À partir de 89 €/mois HT. Sans engagement.",
    h1: "Des formules claires, sans surprise",
    content: null,
  },
  {
    slug: "contact",
    title: "Contact",
    meta_title: "Contactez-nous | Numeris Expertise Comptable Paris",
    meta_description:
      "Prenez rendez-vous avec notre cabinet d'expertise comptable à Paris. Premier entretien gratuit et sans engagement.",
    h1: "Parlons de votre projet",
    content: null,
  },
];

for (const p of pages) insertPage.run(p);

console.log("✅ Database seeded successfully");
db.close();
