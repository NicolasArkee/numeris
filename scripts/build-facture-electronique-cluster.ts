/**
 * scripts/build-facture-electronique-cluster.ts
 *
 * Cluster « Facturation électronique 2026-2027 » (/ressources) :
 *   1. crée le cluster `facturation-electronique` (hub expert-comptable-general)
 *   2. y rapatrie facture-electronique-expert-comptable (déjà générée)
 *   3. crée 17 nouvelles keyword pages (pillar facture-electronique + réforme,
 *      calendrier, PDP/PPF, formats, e-reporting, mentions, sanctions,
 *      audiences auto-entrepreneur/TPE-PME, PAA) en disposition=enrich
 *   4. recalcule volume/n_keywords des clusters touchés
 *
 * Faits réglementaires validés le 2026-07-12 sur service-public.gouv.fr :
 * réception TOUTES entreprises 01/09/2026 ; émission GE+ETI 01/09/2026,
 * PME/micro 01/09/2027. Le grounding de génération vit dans
 * generate-keyword-lp-content.ts (CLUSTER_FACTS).
 *
 * Idempotent. Dry-run par défaut, --commit pour écrire.
 */
import Database from "better-sqlite3";
import path from "node:path";

const COMMIT = process.argv.includes("--commit");
const DB_PATH = path.join(process.cwd(), "numeris.db");

const CLUSTER_SLUG = "facturation-electronique";
const HUB_SLUG = "expert-comptable-general";
const CLUSTER_LABEL = "Facturation électronique 2026-2027";

const MOVE_SLUGS = ["facture-electronique-expert-comptable"];

const NEW_KEYWORDS: { slug: string; label: string; volume: number; intent: string }[] = [
  { slug: "facture-electronique", label: "Facture électronique", volume: 33000, intent: "Informational" },
  { slug: "calendrier-facturation-electronique", label: "Calendrier de la facturation électronique", volume: 8000, intent: "Informational" },
  { slug: "facture-electronique-obligatoire", label: "Facture électronique obligatoire", volume: 6500, intent: "Informational" },
  { slug: "facture-electronique-auto-entrepreneur", label: "Facture électronique pour auto-entrepreneur", volume: 5400, intent: "Informational" },
  { slug: "pdp-plateforme-dematerialisation-partenaire", label: "PDP : plateforme de dématérialisation partenaire", volume: 4400, intent: "Informational" },
  { slug: "ppf-portail-public-facturation", label: "PPF : portail public de facturation", volume: 3600, intent: "Informational" },
  { slug: "reforme-facturation-electronique", label: "Réforme de la facturation électronique", volume: 2900, intent: "Informational" },
  { slug: "factur-x", label: "Factur-X", volume: 2400, intent: "Informational" },
  { slug: "liste-pdp-immatriculees", label: "Liste des PDP immatriculées", volume: 1900, intent: "Commercial" },
  { slug: "e-reporting", label: "E-reporting", volume: 1900, intent: "Informational" },
  { slug: "mentions-obligatoires-facture-electronique", label: "Mentions obligatoires d'une facture électronique", volume: 1600, intent: "Informational" },
  { slug: "sanctions-facturation-electronique", label: "Sanctions de la facturation électronique", volume: 880, intent: "Informational" },
  { slug: "choisir-sa-pdp", label: "Choisir sa PDP", volume: 720, intent: "Commercial" },
  { slug: "facture-pdf-facture-electronique", label: "Facture PDF et facture électronique", volume: 720, intent: "Informational" },
  { slug: "facture-electronique-tpe-pme", label: "Facture électronique pour TPE et PME", volume: 590, intent: "Informational" },
  { slug: "annuaire-facturation-electronique", label: "Annuaire de la facturation électronique", volume: 590, intent: "Informational" },
  { slug: "od-vs-pdp", label: "OD vs PDP", volume: 320, intent: "Informational" },
];

function main(): void {
  const db = new Database(DB_PATH);
  db.pragma("journal_mode = WAL");

  const exists = db.prepare("SELECT slug FROM clusters WHERE slug = ?").get(CLUSTER_SLUG);
  const movable = (db
    .prepare(`SELECT slug, cluster_slug FROM keyword_pages WHERE slug IN (${MOVE_SLUGS.map(() => "?").join(",")})`)
    .all(...MOVE_SLUGS) as { slug: string; cluster_slug: string }[]);
  const affectedOld = [...new Set(movable.map((m) => m.cluster_slug))];
  const newToInsert = NEW_KEYWORDS.filter(
    (k) => !db.prepare("SELECT 1 FROM keyword_pages WHERE slug = ?").get(k.slug),
  );

  console.log(`[cluster] ${CLUSTER_SLUG} ${exists ? "(existe)" : "(à créer)"} sous ${HUB_SLUG}`);
  console.log(`[moves]   ${movable.length} kw depuis : ${affectedOld.join(", ") || "—"}`);
  console.log(`[créa]    ${newToInsert.length} nouvelles pages`);

  if (!COMMIT) { console.log("\nDRY-RUN — relancer avec --commit."); db.close(); return; }

  const tx = db.transaction(() => {
    if (!exists) {
      db.prepare("INSERT INTO clusters (slug, hub_slug, label, volume, n_keywords) VALUES (?, ?, ?, 0, 0)")
        .run(CLUSTER_SLUG, HUB_SLUG, CLUSTER_LABEL);
    }
    db.prepare(`UPDATE keyword_pages SET cluster_slug = ? WHERE slug IN (${MOVE_SLUGS.map(() => "?").join(",")})`)
      .run(CLUSTER_SLUG, ...MOVE_SLUGS);
    const ins = db.prepare(`
      INSERT OR IGNORE INTO keyword_pages
        (slug, cluster_slug, label, volume, intent, kd, cpc, serp_features, meta_title, meta_description, h1, disposition, redirect_to)
      VALUES (?, ?, ?, ?, ?, NULL, NULL, NULL, NULL, NULL, NULL, 'enrich', NULL)`);
    for (const k of NEW_KEYWORDS) ins.run(k.slug, CLUSTER_SLUG, k.label, k.volume, k.intent);
    const recompute = db.prepare(`
      UPDATE clusters SET
        volume = COALESCE((SELECT SUM(volume) FROM keyword_pages k WHERE k.cluster_slug = clusters.slug), 0),
        n_keywords = (SELECT COUNT(*) FROM keyword_pages k WHERE k.cluster_slug = clusters.slug)
      WHERE slug = ?`);
    for (const slug of [CLUSTER_SLUG, ...affectedOld]) recompute.run(slug);
  });
  tx();

  const s = db.prepare("SELECT slug, volume, n_keywords FROM clusters WHERE slug = ?").get(CLUSTER_SLUG) as
    { slug: string; volume: number; n_keywords: number };
  console.log(`\n[commit] ${s.slug} : ${s.n_keywords} keywords, volume cumulé ${s.volume.toLocaleString("fr-FR")}`);
  db.close();
}

main();
