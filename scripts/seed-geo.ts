import Database from "better-sqlite3";
import path from "node:path";
import { SCHEMA } from "../src/libs/db/schema";

const DB_PATH = path.join(process.cwd(), "numeris.db");
const db = new Database(DB_PATH);
db.pragma("journal_mode = WAL");
db.exec(SCHEMA);

// ─── TOP 20 VILLES ───
const insertVille = db.prepare(
  `INSERT OR REPLACE INTO villes (slug, name, departement, region, population)
   VALUES (@slug, @name, @departement, @region, @population)`,
);

const villes = [
  { slug: "paris", name: "Paris", departement: "75", region: "Île-de-France", population: 2161000 },
  { slug: "marseille", name: "Marseille", departement: "13", region: "Provence-Alpes-Côte d'Azur", population: 870731 },
  { slug: "lyon", name: "Lyon", departement: "69", region: "Auvergne-Rhône-Alpes", population: 522250 },
  { slug: "toulouse", name: "Toulouse", departement: "31", region: "Occitanie", population: 498003 },
  { slug: "nice", name: "Nice", departement: "06", region: "Provence-Alpes-Côte d'Azur", population: 342669 },
  { slug: "nantes", name: "Nantes", departement: "44", region: "Pays de la Loire", population: 318808 },
  { slug: "montpellier", name: "Montpellier", departement: "34", region: "Occitanie", population: 295542 },
  { slug: "strasbourg", name: "Strasbourg", departement: "67", region: "Grand Est", population: 287228 },
  { slug: "bordeaux", name: "Bordeaux", departement: "33", region: "Nouvelle-Aquitaine", population: 259809 },
  { slug: "lille", name: "Lille", departement: "59", region: "Hauts-de-France", population: 236234 },
  { slug: "rennes", name: "Rennes", departement: "35", region: "Bretagne", population: 222485 },
  { slug: "reims", name: "Reims", departement: "51", region: "Grand Est", population: 183042 },
  { slug: "toulon", name: "Toulon", departement: "83", region: "Provence-Alpes-Côte d'Azur", population: 178745 },
  { slug: "saint-etienne", name: "Saint-Étienne", departement: "42", region: "Auvergne-Rhône-Alpes", population: 174082 },
  { slug: "le-havre", name: "Le Havre", departement: "76", region: "Normandie", population: 170147 },
  { slug: "grenoble", name: "Grenoble", departement: "38", region: "Auvergne-Rhône-Alpes", population: 158454 },
  { slug: "dijon", name: "Dijon", departement: "21", region: "Bourgogne-Franche-Comté", population: 159346 },
  { slug: "angers", name: "Angers", departement: "49", region: "Pays de la Loire", population: 155850 },
  { slug: "nimes", name: "Nîmes", departement: "30", region: "Occitanie", population: 151001 },
  { slug: "perpignan", name: "Perpignan", departement: "66", region: "Occitanie", population: 121875 },
];

for (const v of villes) insertVille.run(v);

// ─── DEPARTEMENTS ───
const insertDept = db.prepare(
  `INSERT OR REPLACE INTO departements (slug, code, name, region)
   VALUES (@slug, @code, @name, @region)`,
);

const departements = [
  { slug: "75-paris", code: "75", name: "Paris", region: "Île-de-France" },
  { slug: "92-hauts-de-seine", code: "92", name: "Hauts-de-Seine", region: "Île-de-France" },
  { slug: "93-seine-saint-denis", code: "93", name: "Seine-Saint-Denis", region: "Île-de-France" },
  { slug: "94-val-de-marne", code: "94", name: "Val-de-Marne", region: "Île-de-France" },
  { slug: "78-yvelines", code: "78", name: "Yvelines", region: "Île-de-France" },
  { slug: "91-essonne", code: "91", name: "Essonne", region: "Île-de-France" },
  { slug: "95-val-d-oise", code: "95", name: "Val-d'Oise", region: "Île-de-France" },
  { slug: "77-seine-et-marne", code: "77", name: "Seine-et-Marne", region: "Île-de-France" },
  { slug: "69-rhone", code: "69", name: "Rhône", region: "Auvergne-Rhône-Alpes" },
  { slug: "13-bouches-du-rhone", code: "13", name: "Bouches-du-Rhône", region: "Provence-Alpes-Côte d'Azur" },
  { slug: "31-haute-garonne", code: "31", name: "Haute-Garonne", region: "Occitanie" },
  { slug: "33-gironde", code: "33", name: "Gironde", region: "Nouvelle-Aquitaine" },
  { slug: "44-loire-atlantique", code: "44", name: "Loire-Atlantique", region: "Pays de la Loire" },
  { slug: "59-nord", code: "59", name: "Nord", region: "Hauts-de-France" },
  { slug: "06-alpes-maritimes", code: "06", name: "Alpes-Maritimes", region: "Provence-Alpes-Côte d'Azur" },
  { slug: "34-herault", code: "34", name: "Hérault", region: "Occitanie" },
  { slug: "67-bas-rhin", code: "67", name: "Bas-Rhin", region: "Grand Est" },
  { slug: "35-ille-et-vilaine", code: "35", name: "Ille-et-Vilaine", region: "Bretagne" },
  { slug: "38-isere", code: "38", name: "Isère", region: "Auvergne-Rhône-Alpes" },
  { slug: "76-seine-maritime", code: "76", name: "Seine-Maritime", region: "Normandie" },
];

for (const d of departements) insertDept.run(d);

// ─── SECTEURS D'ACTIVITE ───
const insertSecteur = db.prepare(
  `INSERT OR REPLACE INTO secteurs (slug, name, description, volume)
   VALUES (@slug, @name, @description, @volume)`,
);

const secteurs = [
  { slug: "immobilier", name: "Immobilier", description: "SCI, LMNP, marchands de biens, agences immobilières", volume: 5680 },
  { slug: "restauration", name: "Restauration", description: "Restaurants, traiteurs, food trucks, hôtellerie", volume: 4640 },
  { slug: "profession-liberale", name: "Profession libérale", description: "Médecins, avocats, architectes, consultants", volume: 2370 },
  { slug: "start-up", name: "Start-up & Tech", description: "Startups, SaaS, e-commerce, freelances tech", volume: 4670 },
  { slug: "btp", name: "BTP & Artisanat", description: "Construction, rénovation, artisans du bâtiment", volume: 1200 },
  { slug: "commerce", name: "Commerce", description: "Commerces de détail, e-commerce, franchises", volume: 1100 },
  { slug: "transport", name: "Transport", description: "Transport de marchandises, VTC, logistique", volume: 800 },
  { slug: "association", name: "Associations", description: "Associations loi 1901, fondations, ONG", volume: 600 },
];

for (const s of secteurs) insertSecteur.run(s);

// ─── CROSS-DIMENSIONS : service × secteur ───
const insertSS = db.prepare(
  `INSERT OR REPLACE INTO service_secteur (service_slug, secteur_slug, volume)
   VALUES (@service_slug, @secteur_slug, @volume)`,
);

const serviceList = ["comptabilite", "fiscalite", "social", "creation-entreprise", "conseil-gestion", "audit"];

for (const svc of serviceList) {
  for (const sec of secteurs) {
    insertSS.run({ service_slug: svc, secteur_slug: sec.slug, volume: Math.round(sec.volume * 0.3) });
  }
}

// ─── CROSS-DIMENSIONS : service × ville ───
const insertSV = db.prepare(
  `INSERT OR REPLACE INTO service_ville (service_slug, ville_slug, volume)
   VALUES (@service_slug, @ville_slug, @volume)`,
);

for (const svc of serviceList) {
  for (const v of villes.slice(0, 10)) {
    insertSV.run({ service_slug: svc, ville_slug: v.slug, volume: Math.round(v.population / 100) });
  }
}

console.log(`✅ Geo seeded: ${villes.length} villes, ${departements.length} departements, ${secteurs.length} secteurs`);
db.close();
