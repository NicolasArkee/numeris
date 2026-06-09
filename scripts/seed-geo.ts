import Database from "better-sqlite3";
import path from "node:path";
import { SCHEMA } from "../src/libs/db/schema";
import { legalEntity } from "../src/data/legal-entity";

const DB_PATH = path.join(process.cwd(), "numeris.db");
const db = new Database(DB_PATH);
db.pragma("journal_mode = WAL");
db.exec(SCHEMA);

// ─── MIGRATION: add new columns to villes if they don't exist yet ───
// (CREATE TABLE IF NOT EXISTS won't add columns to an existing table.)
const villesCols = db
  .prepare("PRAGMA table_info(villes)")
  .all() as { name: string }[];
const existingCols = new Set(villesCols.map((c) => c.name));

const newCols: { name: string; ddl: string }[] = [
  { name: "address", ddl: "ALTER TABLE villes ADD COLUMN address TEXT" },
  { name: "postal_code", ddl: "ALTER TABLE villes ADD COLUMN postal_code TEXT" },
  { name: "phone", ddl: "ALTER TABLE villes ADD COLUMN phone TEXT" },
  { name: "opening_hours", ddl: "ALTER TABLE villes ADD COLUMN opening_hours TEXT" },
  { name: "latitude", ddl: "ALTER TABLE villes ADD COLUMN latitude REAL" },
  { name: "longitude", ddl: "ALTER TABLE villes ADD COLUMN longitude REAL" },
  { name: "ape_code", ddl: "ALTER TABLE villes ADD COLUMN ape_code TEXT DEFAULT '6920Z'" },
  { name: "siret_etablissement", ddl: "ALTER TABLE villes ADD COLUMN siret_etablissement TEXT" },
];

for (const c of newCols) {
  if (!existingCols.has(c.name)) {
    db.exec(c.ddl);
    console.log(`  → added column villes.${c.name}`);
  }
}

// ─── DETERMINISTIC PSEUDO-RANDOM HELPERS (stable per slug) ───
function hashSlug(slug: string): number {
  let h = 2166136261;
  for (let i = 0; i < slug.length; i++) {
    h ^= slug.charCodeAt(i);
    h = (h * 16777619) >>> 0;
  }
  return h >>> 0;
}

function streetNumber(slug: string): number {
  // 5..99 inclusive
  return 5 + (hashSlug(slug) % 95);
}

function localPhone(slug: string, indicatif: string): string {
  // Pattern: 0X XX XX XX XX — last 8 digits derived deterministically from slug hash.
  const h = hashSlug(slug + "phone");
  const pad = (n: number, len: number) => String(n).padStart(len, "0");
  const a = pad(h % 100, 2);
  const b = pad(Math.floor(h / 100) % 100, 2);
  const c = pad(Math.floor(h / 10000) % 100, 2);
  const d = pad(Math.floor(h / 1000000) % 100, 2);
  return `${indicatif} ${a} ${b} ${c} ${d}`;
}

// SIREN sourced from legal-entity (single source of truth, Luhn-valid).
const SIREN = legalEntity.siren;

// NIC = 5 digits, unique per ville. Start at 00021 to avoid colliding with
// siège NIC (00008 → SIRET `${SIREN}00008` already used by legalEntity.siret).
// Plage 00021..00040 = 20 villes max, safe.
function buildNic(orderIndex: number): string {
  return String(orderIndex + 21).padStart(5, "0");
}

// ─── TOP 20 VILLES ───
const insertVille = db.prepare(
  `INSERT OR REPLACE INTO villes (
     slug, name, departement, region, population,
     address, postal_code, phone, opening_hours,
     latitude, longitude, ape_code, siret_etablissement
   ) VALUES (
     @slug, @name, @departement, @region, @population,
     @address, @postal_code, @phone, @opening_hours,
     @latitude, @longitude, @ape_code, @siret_etablissement
   )`,
);

// Local address dataset — voie typique centre-ville + coords Wikipedia centre-ville + indicatif fixe.
// Numéro de rue généré de façon déterministe (streetNumber) à partir du slug.
// Toutes les adresses sont fictives (entité Numeris déclinée) — pas de bureau existant ciblé.
type VilleSeed = {
  slug: string;
  name: string;
  departement: string;
  region: string;
  population: number;
  voie: string;
  postal_code: string;
  indicatif: string; // indicatif téléphonique fixe régional
  latitude: number;
  longitude: number;
};

const villesSeed: VilleSeed[] = [
  { slug: "paris", name: "Paris", departement: "75", region: "Île-de-France", population: 2161000,
    voie: "rue de Rivoli", postal_code: "75001", indicatif: "01", latitude: 48.8566, longitude: 2.3522 },
  { slug: "marseille", name: "Marseille", departement: "13", region: "Provence-Alpes-Côte d'Azur", population: 870731,
    voie: "rue Paradis", postal_code: "13001", indicatif: "04", latitude: 43.2965, longitude: 5.3698 },
  { slug: "lyon", name: "Lyon", departement: "69", region: "Auvergne-Rhône-Alpes", population: 522250,
    voie: "rue de la République", postal_code: "69002", indicatif: "04", latitude: 45.7640, longitude: 4.8357 },
  { slug: "toulouse", name: "Toulouse", departement: "31", region: "Occitanie", population: 498003,
    voie: "rue Alsace-Lorraine", postal_code: "31000", indicatif: "05", latitude: 43.6047, longitude: 1.4442 },
  { slug: "nice", name: "Nice", departement: "06", region: "Provence-Alpes-Côte d'Azur", population: 342669,
    voie: "avenue Jean Médecin", postal_code: "06000", indicatif: "04", latitude: 43.7102, longitude: 7.2620 },
  { slug: "nantes", name: "Nantes", departement: "44", region: "Pays de la Loire", population: 318808,
    voie: "rue Crébillon", postal_code: "44000", indicatif: "02", latitude: 47.2184, longitude: -1.5536 },
  { slug: "montpellier", name: "Montpellier", departement: "34", region: "Occitanie", population: 295542,
    voie: "rue de la Loge", postal_code: "34000", indicatif: "04", latitude: 43.6108, longitude: 3.8767 },
  { slug: "strasbourg", name: "Strasbourg", departement: "67", region: "Grand Est", population: 287228,
    voie: "rue du 22 Novembre", postal_code: "67000", indicatif: "03", latitude: 48.5734, longitude: 7.7521 },
  { slug: "bordeaux", name: "Bordeaux", departement: "33", region: "Nouvelle-Aquitaine", population: 259809,
    voie: "cours de l'Intendance", postal_code: "33000", indicatif: "05", latitude: 44.8378, longitude: -0.5792 },
  { slug: "lille", name: "Lille", departement: "59", region: "Hauts-de-France", population: 236234,
    voie: "rue Faidherbe", postal_code: "59000", indicatif: "03", latitude: 50.6292, longitude: 3.0573 },
  { slug: "rennes", name: "Rennes", departement: "35", region: "Bretagne", population: 222485,
    voie: "rue Le Bastard", postal_code: "35000", indicatif: "02", latitude: 48.1173, longitude: -1.6778 },
  { slug: "reims", name: "Reims", departement: "51", region: "Grand Est", population: 183042,
    voie: "rue de Vesle", postal_code: "51100", indicatif: "03", latitude: 49.2583, longitude: 4.0317 },
  { slug: "toulon", name: "Toulon", departement: "83", region: "Provence-Alpes-Côte d'Azur", population: 178745,
    voie: "rue d'Alger", postal_code: "83000", indicatif: "04", latitude: 43.1242, longitude: 5.9280 },
  { slug: "saint-etienne", name: "Saint-Étienne", departement: "42", region: "Auvergne-Rhône-Alpes", population: 174082,
    voie: "rue des Martyrs de Vingré", postal_code: "42000", indicatif: "04", latitude: 45.4397, longitude: 4.3872 },
  { slug: "le-havre", name: "Le Havre", departement: "76", region: "Normandie", population: 170147,
    voie: "rue de Paris", postal_code: "76600", indicatif: "02", latitude: 49.4944, longitude: 0.1079 },
  { slug: "grenoble", name: "Grenoble", departement: "38", region: "Auvergne-Rhône-Alpes", population: 158454,
    voie: "rue Félix Poulat", postal_code: "38000", indicatif: "04", latitude: 45.1885, longitude: 5.7245 },
  { slug: "dijon", name: "Dijon", departement: "21", region: "Bourgogne-Franche-Comté", population: 159346,
    voie: "rue de la Liberté", postal_code: "21000", indicatif: "03", latitude: 47.3220, longitude: 5.0415 },
  { slug: "angers", name: "Angers", departement: "49", region: "Pays de la Loire", population: 155850,
    voie: "rue Saint-Aubin", postal_code: "49100", indicatif: "02", latitude: 47.4784, longitude: -0.5632 },
  { slug: "nimes", name: "Nîmes", departement: "30", region: "Occitanie", population: 151001,
    voie: "boulevard Victor Hugo", postal_code: "30000", indicatif: "04", latitude: 43.8367, longitude: 4.3601 },
  { slug: "perpignan", name: "Perpignan", departement: "66", region: "Occitanie", population: 121875,
    voie: "rue de la Loge", postal_code: "66000", indicatif: "04", latitude: 42.6886, longitude: 2.8948 },
];

// Build NIC per ville based on alphabetical slug order (stable, deterministic).
const sortedSlugs = [...villesSeed.map((v) => v.slug)].sort();
const nicByslug = new Map<string, string>();
sortedSlugs.forEach((slug, i) => nicByslug.set(slug, buildNic(i)));

const OPENING_HOURS = "Mo-Fr 09:00-18:00";

for (const v of villesSeed) {
  const num = streetNumber(v.slug);
  const address = `${num} ${v.voie}`;
  const phone = localPhone(v.slug, v.indicatif);
  const nic = nicByslug.get(v.slug)!;
  const siret = `${SIREN}${nic}`;
  insertVille.run({
    slug: v.slug,
    name: v.name,
    departement: v.departement,
    region: v.region,
    population: v.population,
    address,
    postal_code: v.postal_code,
    phone,
    opening_hours: OPENING_HOURS,
    latitude: v.latitude,
    longitude: v.longitude,
    ape_code: "6920Z",
    siret_etablissement: siret,
  });
}

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
  for (const v of villesSeed.slice(0, 10)) {
    insertSV.run({ service_slug: svc, ville_slug: v.slug, volume: Math.round(v.population / 100) });
  }
}

console.log(`✅ Geo seeded: ${villesSeed.length} villes (with address/phone/coords/siret), ${departements.length} departements, ${secteurs.length} secteurs`);
db.close();
