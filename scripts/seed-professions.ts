import Database from "better-sqlite3";
import path from "node:path";
import { SCHEMA } from "../src/libs/db/schema";

const DB_PATH = path.join(process.cwd(), "numeris.db");
const db = new Database(DB_PATH);
db.pragma("journal_mode = WAL");
db.exec(SCHEMA);

function slugify(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

// ─── Categories ───
const insertCat = db.prepare(
  `INSERT OR REPLACE INTO profession_categories (slug, name, description, icon, order_index)
   VALUES (@slug, @name, @description, @icon, @order_index)`,
);

const categories = [
  { slug: "metiers-de-bouche", name: "Métiers de bouche", description: "Boulangers, pâtissiers, bouchers, traiteurs et artisans de l'alimentation", icon: "🍞", order_index: 1 },
  { slug: "restauration-tourisme", name: "Restauration & Tourisme", description: "Restaurateurs, hôteliers, gîtes, campings et professionnels du tourisme", icon: "🍽️", order_index: 2 },
  { slug: "batiment-travaux-publics", name: "Bâtiment & Travaux Publics", description: "Maçons, électriciens, plombiers, architectes et corps de métier du BTP", icon: "🏗️", order_index: 3 },
  { slug: "sante-bien-etre", name: "Santé & Bien-être", description: "Médecins, dentistes, infirmiers, kinés et professionnels du bien-être", icon: "🏥", order_index: 4 },
  { slug: "droit-chiffre", name: "Droit & Chiffre", description: "Avocats, notaires, huissiers et professionnels du droit", icon: "⚖️", order_index: 5 },
  { slug: "conseil-services-entreprises", name: "Conseil & Services aux entreprises", description: "Consultants, formateurs, agences de communication et prestataires de services", icon: "💼", order_index: 6 },
  { slug: "tech-digital-data", name: "Tech, Digital & Data", description: "Développeurs, agences SEO, éditeurs SaaS, startups et freelances tech", icon: "💻", order_index: 7 },
  { slug: "commerce-ecommerce", name: "Commerce & E-commerce", description: "Boutiques, concept stores, e-commerçants et franchisés", icon: "🛍️", order_index: 8 },
  { slug: "immobilier", name: "Immobilier", description: "Agents immobiliers, syndics, marchands de biens, SCI et LMNP", icon: "🏠", order_index: 9 },
  { slug: "transport-logistique", name: "Transport & Logistique", description: "Transporteurs, VTC, taxis, coursiers et déménageurs", icon: "🚚", order_index: 10 },
  { slug: "industrie-artisanat", name: "Industrie & Artisanat de production", description: "Ébénistes, bijoutiers, imprimeurs, brasseurs et artisans de production", icon: "🔧", order_index: 11 },
  { slug: "culture-loisirs-education", name: "Culture, Loisirs & Éducation", description: "Écoles privées, galeries d'art, événementiel et organismes de formation", icon: "🎓", order_index: 12 },
  { slug: "agriculture-environnement", name: "Agriculture & Environnement", description: "Agriculteurs, viticulteurs, paysagistes et entreprises environnementales", icon: "🌿", order_index: 13 },
  { slug: "secteur-non-marchand", name: "Secteur Non-Marchand", description: "Associations, fondations, CSE et syndicats professionnels", icon: "🤝", order_index: 14 },
];

for (const c of categories) insertCat.run(c);

// ─── Professions ───
const insertProf = db.prepare(
  `INSERT OR REPLACE INTO professions (slug, name, category_slug, description, obligations, volume)
   VALUES (@slug, @name, @category_slug, @description, @obligations, @volume)`,
);

interface ProfData {
  name: string;
  description: string;
  obligations: string;
  volume: number;
}

const professionsByCategory: Record<string, ProfData[]> = {
  "metiers-de-bouche": [
    { name: "Boulangers", description: "Artisans boulangers et boulangeries-pâtisseries", obligations: "Gestion de stocks matières premières, TVA réduite 5.5%, registre sanitaire", volume: 720 },
    { name: "Pâtissiers", description: "Pâtissiers artisanaux et industriels", obligations: "Suivi des marges, amortissement matériel spécialisé, normes HACCP", volume: 480 },
    { name: "Bouchers", description: "Bouchers et charcutiers artisanaux", obligations: "Gestion de stocks périssables, traçabilité, marges spécifiques", volume: 390 },
    { name: "Charcutiers", description: "Charcutiers-traiteurs et artisans", obligations: "Double activité vente/fabrication, TVA mixte, normes sanitaires", volume: 260 },
    { name: "Poissonniers", description: "Poissonniers et mareyeurs", obligations: "Gestion des pertes, traçabilité maritime, TVA 5.5%", volume: 210 },
    { name: "Traiteurs", description: "Traiteurs événementiels et de proximité", obligations: "Comptabilité événementielle, TVA restauration 10%, stocks périssables", volume: 590 },
    { name: "Chocolatiers", description: "Chocolatiers et confiseurs artisanaux", obligations: "Saisonnalité forte, gestion des stocks cacao, amortissement tempéreuses", volume: 320 },
    { name: "Glaciers", description: "Glaciers artisanaux et industriels", obligations: "Saisonnalité, chaîne du froid, TVA vente à emporter", volume: 170 },
    { name: "Épiceries fines", description: "Épiceries fines et commerces de bouche haut de gamme", obligations: "Gestion multi-fournisseurs, TVA mixte, marges variables", volume: 280 },
    { name: "Cavistes", description: "Cavistes indépendants et chaînes", obligations: "Droits d'accise, gestion de cave, traçabilité alcool", volume: 390 },
  ],
  "restauration-tourisme": [
    { name: "Restaurateurs traditionnels", description: "Restaurants gastronomiques et traditionnels", obligations: "TVA sur place 10%, pourboires, titre-restaurant, ratios food cost", volume: 1200 },
    { name: "Restauration rapide", description: "Fast-food, snacks et restauration à emporter", obligations: "TVA emporter 5.5% vs sur place 10%, gestion forte rotation", volume: 880 },
    { name: "Bars et brasseries", description: "Gérants de bars, cafés et brasseries", obligations: "Licence débit de boissons, TVA boissons alcoolisées 20%, caisse certifiée", volume: 590 },
    { name: "Hôteliers", description: "Hôtels indépendants et chaînes", obligations: "TVA hébergement 10%, taxe de séjour, amortissement immobilier", volume: 720 },
    { name: "Gîtes et chambres d'hôtes", description: "Propriétaires de gîtes, meublés de tourisme et chambres d'hôtes", obligations: "Régime micro-BIC ou réel, taxe de séjour, classement tourisme", volume: 880 },
    { name: "Campings", description: "Gérants de campings et aires de loisirs", obligations: "TVA réduite hébergement plein air, saisonnalité, amortissement mobil-homes", volume: 320 },
    { name: "Agences de voyages", description: "Agences de voyages et tour-opérateurs", obligations: "Régime de marge TVA, garantie financière APST, assurance RC Pro", volume: 480 },
    { name: "Guides touristiques", description: "Sociétés de guidage et excursions", obligations: "TVA prestation de services, facturation internationale, saisonnalité", volume: 170 },
  ],
  "batiment-travaux-publics": [
    { name: "Maçons", description: "Entreprises de maçonnerie et gros œuvre", obligations: "Autoliquidation TVA sous-traitance, garantie décennale, RGE", volume: 590 },
    { name: "Électriciens", description: "Électriciens du bâtiment et industriels", obligations: "TVA travaux 10%, qualification Qualifelec, garantie décennale", volume: 720 },
    { name: "Plombiers", description: "Plombiers et installateurs sanitaires", obligations: "TVA rénovation 10%, garantie décennale, certification RGE", volume: 880 },
    { name: "Chauffagistes", description: "Installateurs de chauffage et climatisation", obligations: "TVA réduite rénovation énergétique, certification RGE, MaPrimeRénov'", volume: 590 },
    { name: "Peintres en bâtiment", description: "Peintres décorateurs du bâtiment", obligations: "TVA travaux 10%, gestion matériaux, garantie décennale", volume: 480 },
    { name: "Menuisiers", description: "Menuisiers et poseurs de fermetures", obligations: "TVA 10% rénovation, amortissement machines-outils, stocks bois", volume: 480 },
    { name: "Couvreurs", description: "Couvreurs et zingueurs", obligations: "Garantie décennale, saisonnalité, TVA travaux 10%", volume: 390 },
    { name: "Charpentiers", description: "Charpentiers et constructeurs bois", obligations: "Stocks bois, amortissement matériel lourd, garantie décennale", volume: 320 },
    { name: "Carreleurs", description: "Carreleurs et mosaïstes", obligations: "TVA rénovation 10%, garantie décennale, gestion chantiers", volume: 260 },
    { name: "Terrassiers", description: "Entreprises de terrassement et VRD", obligations: "Amortissement engins, location financière, marchés publics", volume: 210 },
    { name: "Architectes", description: "Cabinets d'architecture et d'urbanisme", obligations: "BNC ou société, Ordre des architectes, assurance obligatoire", volume: 720 },
    { name: "Maîtres d'œuvre", description: "Maîtres d'œuvre et coordinateurs de chantier", obligations: "Assurance décennale, gestion multi-intervenants, marchés publics", volume: 390 },
  ],
  "sante-bien-etre": [
    { name: "Médecins", description: "Médecins généralistes et spécialistes en libéral", obligations: "BNC, URSSAF spécifique, CARMF, comptabilité de trésorerie", volume: 1500 },
    { name: "Dentistes", description: "Chirurgiens-dentistes en cabinet libéral", obligations: "BNC, prothèses et matériel amortissable, CARCDSF", volume: 880 },
    { name: "Infirmiers libéraux", description: "Infirmiers et infirmières en exercice libéral", obligations: "BNC, remplacements, CARPIMKO, frais de déplacement", volume: 1200 },
    { name: "Kinésithérapeutes", description: "Masseurs-kinésithérapeutes libéraux", obligations: "BNC, CARPIMKO, matériel médical amortissable", volume: 720 },
    { name: "Ostéopathes", description: "Ostéopathes en cabinet libéral", obligations: "BNC, non conventionné, TVA exonérée soins, CIPAV", volume: 590 },
    { name: "Psychologues", description: "Psychologues et psychothérapeutes libéraux", obligations: "BNC, CIPAV, exonération TVA soins, AGA recommandée", volume: 480 },
    { name: "Vétérinaires", description: "Vétérinaires en clinique libérale ou société", obligations: "BNC ou IS, stocks médicaments, Ordre des vétérinaires", volume: 590 },
    { name: "Pharmaciens", description: "Pharmaciens titulaires d'officine", obligations: "BIC, gestion de stocks médicaments, marge réglementée, tiers payant", volume: 720 },
    { name: "Opticiens", description: "Opticiens-lunetiers indépendants et franchisés", obligations: "BIC, gestion de stocks montures/verres, tiers payant mutuelle", volume: 390 },
    { name: "Coiffeurs", description: "Salons de coiffure indépendants et franchisés", obligations: "BIC, TVA 20%, convention collective coiffure, gestion du personnel", volume: 880 },
    { name: "Esthéticiennes", description: "Instituts de beauté et esthéticiennes à domicile", obligations: "BIC, TVA 20%, vente de produits, convention collective esthétique", volume: 590 },
    { name: "Salles de sport", description: "Gérants de salles de fitness et clubs sportifs", obligations: "TVA 20%, abonnements récurrents, amortissement équipements", volume: 480 },
  ],
  "droit-chiffre": [
    { name: "Avocats", description: "Cabinets d'avocats et avocats indépendants", obligations: "BNC, CNBF, compte CARPA, TVA sur honoraires, secret professionnel", volume: 1500 },
    { name: "Notaires", description: "Études notariales et notaires associés", obligations: "BNC ou SCP, comptabilité clients/office, CDC, caisse des dépôts", volume: 720 },
    { name: "Huissiers de justice", description: "Commissaires de justice (huissiers)", obligations: "BNC ou société, comptabilité des actes, tarification réglementée", volume: 390 },
    { name: "Mandataires judiciaires", description: "Mandataires et administrateurs judiciaires", obligations: "Comptabilité des mandats, fonds clients séparés, CDC", volume: 210 },
    { name: "Commissaires-priseurs", description: "Maisons de ventes et commissaires-priseurs", obligations: "Comptabilité des ventes aux enchères, TVA sur marge, séquestre", volume: 170 },
    { name: "Généalogistes successoraux", description: "Cabinets de généalogie successorale", obligations: "BNC, honoraires de résultat, TVA sur prestations", volume: 110 },
  ],
  "conseil-services-entreprises": [
    { name: "Consultants en stratégie", description: "Cabinets et consultants indépendants en stratégie", obligations: "BNC ou IS, TVA sur honoraires, crédit d'impôt recherche possible", volume: 720 },
    { name: "Formateurs indépendants", description: "Formateurs et organismes de formation", obligations: "Exonération TVA formation, déclaration d'activité Dreets, Qualiopi", volume: 590 },
    { name: "Agences de communication", description: "Agences de communication et relations publiques", obligations: "TVA sur prestations, refacturation frais, comptabilité d'agence", volume: 880 },
    { name: "Agences de publicité", description: "Agences de publicité et média", obligations: "TVA sur honoraires et commissions, comptabilité mandataire", volume: 480 },
    { name: "Apporteurs d'affaires", description: "Courtiers et apporteurs d'affaires", obligations: "BNC ou BIC selon statut, commissions, TVA sur honoraires", volume: 320 },
    { name: "Agents de sécurité", description: "Sociétés de sécurité et gardiennage", obligations: "Convention collective prévention-sécurité, CNAPS, gestion du personnel", volume: 390 },
    { name: "Entreprises de nettoyage", description: "Sociétés de nettoyage et propreté", obligations: "Convention collective propreté, sous-traitance, gestion multi-sites", volume: 590 },
    { name: "Agences d'intérim", description: "Agences de travail temporaire", obligations: "Comptabilité intérimaires, garantie financière, convention collective", volume: 480 },
  ],
  "tech-digital-data": [
    { name: "Développeurs web", description: "Développeurs et agences de développement web", obligations: "BNC freelance ou IS société, CIR/CII, TVA sur prestations", volume: 1200 },
    { name: "Data scientists", description: "Data scientists et consultants data", obligations: "BNC ou portage salarial, CIR, TVA sur prestations intellectuelles", volume: 480 },
    { name: "Graphistes", description: "Graphistes et directeurs artistiques freelance", obligations: "BNC, droits d'auteur possibles, Agessa/MDA, TVA sur prestations", volume: 590 },
    { name: "Community managers", description: "Community managers et social media managers", obligations: "BNC freelance, TVA sur prestations, facturation récurrente", volume: 390 },
    { name: "Agences SEO", description: "Agences de référencement et marketing digital", obligations: "IS ou BNC, TVA sur prestations, facturation récurrente", volume: 720 },
    { name: "Éditeurs de logiciels SaaS", description: "Éditeurs de logiciels en mode SaaS", obligations: "IS, revenus récurrents (MRR/ARR), CIR/CII, TVA numérique", volume: 880 },
    { name: "Startups", description: "Startups tech et entreprises innovantes", obligations: "IS, levée de fonds, CIR/JEI, stock-options/BSPCE, burn rate", volume: 1500 },
    { name: "Influenceurs", description: "Influenceurs et créateurs de contenu en société", obligations: "TVA sur prestations, revenus publicitaires, avantages en nature", volume: 590 },
    { name: "Podcasteurs professionnels", description: "Podcasteurs et producteurs de contenu audio", obligations: "BNC ou IS, revenus sponsoring, droits d'auteur", volume: 170 },
    { name: "E-sportifs", description: "Structures e-sport et joueurs professionnels", obligations: "IS pour structures, droit à l'image, cashprize, sponsoring", volume: 210 },
  ],
  "commerce-ecommerce": [
    { name: "Boutiques de vêtements", description: "Commerces de prêt-à-porter et accessoires", obligations: "BIC, gestion de stocks, soldes réglementés, inventaire annuel", volume: 590 },
    { name: "Concept stores", description: "Concept stores et boutiques multimarques", obligations: "BIC, multi-fournisseurs, dépôt-vente, TVA mixte", volume: 280 },
    { name: "Antiquaires", description: "Antiquaires et brocanteurs professionnels", obligations: "TVA sur marge, registre de police, expertise objets", volume: 260 },
    { name: "Fleuristes", description: "Fleuristes indépendants et franchisés", obligations: "TVA 10% fleurs, gestion de stocks périssables, saisonnalité", volume: 480 },
    { name: "Buralistes", description: "Bureaux de tabac et presse", obligations: "Comptabilité spécifique tabac, commissions, remise État", volume: 320 },
    { name: "E-commerçants", description: "Boutiques en ligne, dropshipping et vente sur marketplaces", obligations: "TVA intracommunautaire/OSS, gestion des retours, frais de plateforme", volume: 1500 },
    { name: "Franchisés", description: "Franchisés toutes enseignes", obligations: "Redevances franchise, droit d'entrée amortissable, normes enseigne", volume: 880 },
  ],
  "immobilier": [
    { name: "Agents immobiliers", description: "Agences immobilières et mandataires", obligations: "BIC/IS, carte T, séquestre, comptabilité mandant, loi Hoguet", volume: 1200 },
    { name: "Administrateurs de biens", description: "Gestionnaires d'immeubles et syndics", obligations: "Carte G, comptabilité copropriété, fonds mandants séparés", volume: 590 },
    { name: "Syndics de copropriété", description: "Syndics professionnels de copropriété", obligations: "Comptabilité copropriété loi ALUR, compte séparé, fonds travaux", volume: 480 },
    { name: "Marchands de biens", description: "Achat-revente immobilière professionnelle", obligations: "TVA immobilière, marge sur opération, IS, plus-values spécifiques", volume: 720 },
    { name: "Loueurs en meublé LMNP/LMP", description: "Loueurs en meublé non professionnel et professionnel", obligations: "Amortissement immobilier, liasse fiscale, régime micro ou réel", volume: 1500 },
    { name: "Gestionnaires de SCI", description: "Sociétés civiles immobilières", obligations: "IR ou IS, assemblée annuelle, déclaration 2072, comptes courants", volume: 1200 },
  ],
  "transport-logistique": [
    { name: "Transporteurs routiers", description: "Entreprises de transport routier de marchandises", obligations: "Licence de transport, capacité financière, gasoil déductible, chronotachygraphe", volume: 590 },
    { name: "Taxis", description: "Artisans taxis et sociétés de taxi", obligations: "BIC, licence/autorisation, TVA réduite, amortissement véhicule", volume: 480 },
    { name: "VTC", description: "Chauffeurs VTC en société", obligations: "BIC/IS, carte VTC, TVA sur prestations, amortissement véhicule", volume: 880 },
    { name: "Loueurs de véhicules", description: "Sociétés de location de voitures et utilitaires", obligations: "Amortissement flotte, TVA sur locations, assurance flotte", volume: 390 },
    { name: "Coursiers", description: "Coursiers et entreprises de livraison rapide", obligations: "TVA sur prestations, frais de déplacement, gestion livreurs", volume: 320 },
    { name: "Déménageurs", description: "Entreprises de déménagement", obligations: "Inscription registre transports, assurance marchandises, TVA 20%", volume: 390 },
    { name: "Gestionnaires de flotte", description: "Gestionnaires de flotte automobile et logistique", obligations: "Amortissement parc, TCO, avantages en nature véhicules", volume: 210 },
  ],
  "industrie-artisanat": [
    { name: "Usineurs et plasturgie", description: "Petites usines d'usinage et plasturgie", obligations: "Amortissement machines, stocks matières, CIR possible, normes ISO", volume: 280 },
    { name: "Bijoutiers", description: "Créateurs et artisans bijoutiers", obligations: "Garantie poinçon, stocks métaux précieux, TVA sur marge possible", volume: 320 },
    { name: "Ébénistes", description: "Ébénistes et artisans du bois", obligations: "Amortissement machines, stocks bois, TVA 20%, Chambre des métiers", volume: 280 },
    { name: "Couturiers", description: "Couturiers et créateurs de mode", obligations: "BIC ou BNC selon activité, stocks tissus, droits d'auteur design", volume: 210 },
    { name: "Imprimeurs", description: "Imprimeries et reprographie professionnelle", obligations: "Amortissement matériel lourd, stocks papier/encre, éco-contribution", volume: 320 },
    { name: "Brasseurs artisanaux", description: "Microbrasseries et brasseries artisanales", obligations: "Droits d'accise, gestion de stocks, licence de vente d'alcool", volume: 480 },
    { name: "Savonniers", description: "Savonneries artisanales et cosmétiques", obligations: "Réglementation cosmétique, DIP, TVA 20%, stocks matières", volume: 170 },
  ],
  "culture-loisirs-education": [
    { name: "Écoles privées", description: "Écoles privées et établissements d'enseignement", obligations: "Exonération TVA enseignement, contrats avec l'État, comptabilité analytique", volume: 480 },
    { name: "Centres de formation", description: "Organismes de formation professionnelle", obligations: "Exonération TVA formation, BPF, Qualiopi obligatoire, OPCO", volume: 720 },
    { name: "Galeries d'art", description: "Galeries d'art et marchands d'art", obligations: "TVA sur marge ou régime général, droit de suite, registre de police", volume: 260 },
    { name: "Organisateurs d'événements", description: "Agences événementielles et organisateurs de salons", obligations: "TVA sur prestations, acomptes, facturation internationale, SACEM", volume: 590 },
    { name: "Intermittents du spectacle", description: "Structures employant des intermittents du spectacle", obligations: "Pôle emploi spectacle, GUSO, cachets, cotisations spécifiques", volume: 480 },
    { name: "Discothèques", description: "Gérants de discothèques et clubs", obligations: "Licence IV, SACEM/SPRE, TVA boissons, horaires réglementés", volume: 210 },
    { name: "Cinémas indépendants", description: "Exploitants de salles de cinéma indépendantes", obligations: "TSA, CNC, TVA 5.5% billets, amortissement équipement projection", volume: 170 },
  ],
  "agriculture-environnement": [
    { name: "Agriculteurs", description: "Exploitants agricoles en société ou individuel", obligations: "BA (bénéfice agricole), MSA, TVA agricole, PAC, amortissement matériel", volume: 880 },
    { name: "Viticulteurs", description: "Viticulteurs et domaines viticoles", obligations: "BA, droits d'accise, stocks en cours, DRM, TVA sur ventes", volume: 590 },
    { name: "Maraîchers", description: "Maraîchers et producteurs de légumes", obligations: "BA, TVA réduite 5.5%, vente directe, circuits courts", volume: 320 },
    { name: "Horticulteurs", description: "Horticulteurs et pépiniéristes", obligations: "BA, TVA 10% végétaux, saisonnalité, gestion serres", volume: 210 },
    { name: "Paysagistes", description: "Entreprises de paysagisme et espaces verts", obligations: "BIC, TVA 20% ou 10% rénovation, amortissement matériel", volume: 480 },
    { name: "Entreprises d'élagage", description: "Élagueurs et arboristes professionnels", obligations: "BIC, certification CS élagage, assurance spécifique", volume: 210 },
    { name: "Exploitants forestiers", description: "Exploitants forestiers et scieries", obligations: "BA ou BIC, amortissement matériel, stocks bois, certif PEFC/FSC", volume: 170 },
    { name: "Sociétés de recyclage", description: "Entreprises de collecte et recyclage des déchets", obligations: "BIC/IS, ICPE, éco-contribution, traçabilité déchets, REP", volume: 320 },
  ],
  "secteur-non-marchand": [
    { name: "Associations sportives", description: "Clubs sportifs et associations de loisirs", obligations: "Plan comptable associatif, exonération IS si non lucratif, CER", volume: 590 },
    { name: "Associations culturelles", description: "Associations culturelles et artistiques", obligations: "Plan comptable associatif, subventions, mécénat, rescrit fiscal", volume: 390 },
    { name: "Associations caritatives", description: "ONG, associations humanitaires et caritatives", obligations: "Commissaire aux comptes si subventions > seuil, dons et reçus fiscaux", volume: 480 },
    { name: "Fondations", description: "Fondations reconnues d'utilité publique et fondations d'entreprise", obligations: "Comptabilité spécifique, commissaire aux comptes obligatoire, rapport annuel", volume: 260 },
    { name: "CSE", description: "Comités sociaux et économiques d'entreprise", obligations: "Budget fonctionnement + ASC, commissaire aux comptes si seuils, bilan annuel", volume: 720 },
    { name: "Syndicats professionnels", description: "Syndicats patronaux et de salariés", obligations: "Plan comptable syndicats, certification des comptes, transparence financière", volume: 170 },
  ],
};

let totalCount = 0;
for (const [catSlug, profs] of Object.entries(professionsByCategory)) {
  for (const prof of profs) {
    insertProf.run({
      slug: slugify(prof.name),
      name: prof.name,
      category_slug: catSlug,
      description: prof.description,
      obligations: prof.obligations,
      volume: prof.volume,
    });
    totalCount++;
  }
}

// ─── Cross-dimension : service × profession ───
const insertSP = db.prepare(
  `INSERT OR REPLACE INTO service_profession (service_slug, profession_slug, volume)
   VALUES (@service_slug, @profession_slug, @volume)`,
);

const serviceList = ["comptabilite", "fiscalite", "social", "creation-entreprise", "conseil-gestion", "audit"];

for (const svc of serviceList) {
  for (const [, profs] of Object.entries(professionsByCategory)) {
    for (const prof of profs) {
      insertSP.run({
        service_slug: svc,
        profession_slug: slugify(prof.name),
        volume: Math.round(prof.volume * 0.25),
      });
    }
  }
}

console.log(`✅ Professions seeded: ${categories.length} categories, ${totalCount} professions`);
console.log(`   Cross-dimensions: ${serviceList.length} services × ${totalCount} professions = ${serviceList.length * totalCount} entries`);
db.close();
