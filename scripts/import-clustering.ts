import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";
import { SCHEMA } from "../src/libs/db/schema";

const DB_PATH = path.join(process.cwd(), "numeris.db");
const DATA_DIR = path.join(
  process.cwd(),
  "expert-comptable_clustering/output_live/expert-comptable/data",
);

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

// ─── SILOS L1 to exclude ───
const EXCLUDED_SILOS = new Set([
  "Cabinets & Annuaires",
  "Autre",
  "Fiscalité & Comptabilité",
]);

// ─── Load taxonomy_l1.json ───
const l1Data: Record<
  string,
  { n_kw: number; volume: number; topics: Record<string, { n: number; vol: number }> }
> = JSON.parse(fs.readFileSync(path.join(DATA_DIR, "taxonomy_l1.json"), "utf-8"));

// ─── Import Silos ───
const insertSilo = db.prepare(
  `INSERT OR REPLACE INTO silos (slug, label, volume, n_keywords) VALUES (@slug, @label, @volume, @n_keywords)`,
);

let siloCount = 0;
for (const [label, data] of Object.entries(l1Data)) {
  if (EXCLUDED_SILOS.has(label)) continue;
  insertSilo.run({
    slug: slugify(label),
    label,
    volume: data.volume,
    n_keywords: data.n_kw,
  });
  siloCount++;
}
console.log(`  Silos: ${siloCount}`);

// ─── Import Hubs (L2 topics from l1) ───
const insertHub = db.prepare(
  `INSERT OR REPLACE INTO hubs (slug, silo_slug, label, volume, n_keywords) VALUES (@slug, @silo_slug, @label, @volume, @n_keywords)`,
);

let hubCount = 0;
for (const [siloLabel, data] of Object.entries(l1Data)) {
  if (EXCLUDED_SILOS.has(siloLabel)) continue;
  const siloSlug = slugify(siloLabel);
  for (const [topicLabel, topicData] of Object.entries(data.topics)) {
    insertHub.run({
      slug: slugify(topicLabel),
      silo_slug: siloSlug,
      label: topicLabel,
      volume: topicData.vol,
      n_keywords: topicData.n,
    });
    hubCount++;
  }
}
console.log(`  Hubs: ${hubCount}`);

// ─── Load taxonomy_tree.json for L3/L4 ───
type TreeNode = {
  vol: number;
  n: number;
  children?: Record<string, TreeNode>;
};

const tree: Record<string, TreeNode> = JSON.parse(
  fs.readFileSync(path.join(DATA_DIR, "taxonomy_tree.json"), "utf-8"),
);

const insertCluster = db.prepare(
  `INSERT OR REPLACE INTO clusters (slug, hub_slug, label, volume, n_keywords) VALUES (@slug, @hub_slug, @label, @volume, @n_keywords)`,
);

const insertKw = db.prepare(
  `INSERT OR REPLACE INTO keyword_pages (slug, cluster_slug, label, volume) VALUES (@slug, @cluster_slug, @label, @volume)`,
);

let clusterCount = 0;
let kwCount = 0;

for (const [siloLabel, siloNode] of Object.entries(tree)) {
  if (EXCLUDED_SILOS.has(siloLabel)) continue;
  if (!siloNode.children) continue;

  for (const [hubLabel, hubNode] of Object.entries(siloNode.children)) {
    const hubSlug = slugify(hubLabel);
    if (!hubNode.children) continue;

    for (const [clusterLabel, clusterNode] of Object.entries(hubNode.children)) {
      const clusterSlug = slugify(clusterLabel);
      insertCluster.run({
        slug: clusterSlug,
        hub_slug: hubSlug,
        label: clusterLabel,
        volume: clusterNode.vol,
        n_keywords: clusterNode.n,
      });
      clusterCount++;

      // L4 keyword pages
      if (clusterNode.children) {
        for (const [kwLabel, kwNode] of Object.entries(clusterNode.children)) {
          const kwSlug = slugify(kwLabel);
          insertKw.run({
            slug: kwSlug,
            cluster_slug: clusterSlug,
            label: kwLabel,
            volume: kwNode.vol,
          });
          kwCount++;
        }
      }
    }
  }
}

console.log(`  Clusters (L3): ${clusterCount}`);
console.log(`  Keyword pages (L4): ${kwCount}`);
console.log(`✅ Clustering data imported`);
db.close();
