/**
 * scripts/build-logiciels-cluster.ts
 *
 * Cluster « Logiciels de comptabilité » (/ressources) :
 *   1. crée le cluster `logiciels-comptables` (hub expert-comptable-general)
 *   2. y regroupe les keyword pages logiciels existantes (pillar
 *      logiciel-expert-comptable + marques/outils dispersés dans 7 clusters)
 *   3. crée 9 nouvelles keyword pages logiciels (Sage, Cegid, Silae, Dext,
 *      Inqom, MyUnisoft, ACD, Isacompta, Quadratus) en disposition=enrich
 *   4. recalcule volume/n_keywords des clusters touchés
 *
 * Les URLs existantes ne bougent pas (seul cluster_slug change → breadcrumbs
 * et liens frères). Idempotent. Dry-run par défaut, --commit pour écrire.
 * Après coup : générer les 9 pages + la page cluster (generate-keyword-lp-content
 * --slug / --taxonomy), puis migrate-skoria-supabase --commit.
 */
import Database from "better-sqlite3";
import path from "node:path";

const COMMIT = process.argv.includes("--commit");
const DB_PATH = path.join(process.cwd(), "numeris.db");

const CLUSTER_SLUG = "logiciels-comptables";
const HUB_SLUG = "expert-comptable-general";
const CLUSTER_LABEL = "Logiciels de comptabilité";

/** Keywords logiciels existants à rapatrier dans le cluster. */
const MOVE_SLUGS = [
  "logiciel-expert-comptable",       // pillar (4 760)
  "tiime-expert-comptable",
  "odoo-expert-comptable",
  "ciel-expert-comptable",
  "crm-expert-comptable",
  "expert-comptable-pennylane",
  "indy-expert-comptable",
  "jedeclare-com-expert-comptable",
  "dougs-expert-comptable",
  "cloud-expert-comptable",
  "facture-electronique-expert-comptable",
];

/** Nouvelles pages logiciels (volumes estimés prudents, intent navigational —
 *  rendu LP avec disclaimer d'indépendance + bloc alternatives). */
const NEW_KEYWORDS: { slug: string; label: string; volume: number }[] = [
  { slug: "sage-expert-comptable", label: "Sage expert-comptable", volume: 1300 },
  { slug: "cegid-expert-comptable", label: "Cegid expert-comptable", volume: 1600 },
  { slug: "silae-expert-comptable", label: "Silae expert-comptable", volume: 2400 },
  { slug: "dext-expert-comptable", label: "Dext expert-comptable", volume: 590 },
  { slug: "inqom-expert-comptable", label: "Inqom expert-comptable", volume: 390 },
  { slug: "myunisoft-expert-comptable", label: "MyUnisoft expert-comptable", volume: 480 },
  { slug: "acd-expert-comptable", label: "ACD expert-comptable", volume: 590 },
  { slug: "isacompta-expert-comptable", label: "Isacompta expert-comptable", volume: 480 },
  { slug: "quadratus-expert-comptable", label: "Quadratus expert-comptable", volume: 720 },
];

function main(): void {
  const db = new Database(DB_PATH);
  db.pragma("journal_mode = WAL");

  const existingCluster = db.prepare("SELECT slug FROM clusters WHERE slug = ?").get(CLUSTER_SLUG);
  const movable = (db
    .prepare(`SELECT slug, cluster_slug FROM keyword_pages WHERE slug IN (${MOVE_SLUGS.map(() => "?").join(",")})`)
    .all(...MOVE_SLUGS) as { slug: string; cluster_slug: string }[]);
  const affectedOldClusters = [...new Set(movable.map((m) => m.cluster_slug))];
  const newToInsert = NEW_KEYWORDS.filter(
    (k) => !db.prepare("SELECT 1 FROM keyword_pages WHERE slug = ?").get(k.slug),
  );

  console.log(`[cluster] ${CLUSTER_SLUG} ${existingCluster ? "(existe déjà)" : "(à créer)"} sous hub ${HUB_SLUG}`);
  console.log(`[moves]   ${movable.length} keywords à rapatrier depuis ${affectedOldClusters.length} clusters : ${affectedOldClusters.join(", ")}`);
  console.log(`[créa]    ${newToInsert.length} nouvelles pages logiciels : ${newToInsert.map((k) => k.slug).join(", ")}`);

  if (!COMMIT) {
    console.log("\nDRY-RUN — relancer avec --commit.");
    db.close();
    return;
  }

  const tx = db.transaction(() => {
    if (!existingCluster) {
      db.prepare(
        "INSERT INTO clusters (slug, hub_slug, label, volume, n_keywords) VALUES (?, ?, ?, 0, 0)",
      ).run(CLUSTER_SLUG, HUB_SLUG, CLUSTER_LABEL);
    }
    db.prepare(
      `UPDATE keyword_pages SET cluster_slug = ? WHERE slug IN (${MOVE_SLUGS.map(() => "?").join(",")})`,
    ).run(CLUSTER_SLUG, ...MOVE_SLUGS);
    const insKw = db.prepare(`
      INSERT OR IGNORE INTO keyword_pages
        (slug, cluster_slug, label, volume, intent, kd, cpc, serp_features, meta_title, meta_description, h1, disposition, redirect_to)
      VALUES (?, ?, ?, ?, 'Navigational', NULL, NULL, NULL, NULL, NULL, NULL, 'enrich', NULL)`);
    for (const k of NEW_KEYWORDS) insKw.run(k.slug, CLUSTER_SLUG, k.label, k.volume);

    // Recalcule volume / n_keywords des clusters touchés (nouveau + anciens).
    const recompute = db.prepare(`
      UPDATE clusters SET
        volume = COALESCE((SELECT SUM(volume) FROM keyword_pages k WHERE k.cluster_slug = clusters.slug), 0),
        n_keywords = (SELECT COUNT(*) FROM keyword_pages k WHERE k.cluster_slug = clusters.slug)
      WHERE slug = ?`);
    for (const slug of [CLUSTER_SLUG, ...affectedOldClusters]) recompute.run(slug);
  });
  tx();

  const summary = db
    .prepare("SELECT slug, volume, n_keywords FROM clusters WHERE slug = ?")
    .get(CLUSTER_SLUG) as { slug: string; volume: number; n_keywords: number };
  console.log(`\n[commit] cluster ${summary.slug} : ${summary.n_keywords} keywords, volume cumulé ${summary.volume.toLocaleString("fr-FR")}`);
  db.close();
}

main();
