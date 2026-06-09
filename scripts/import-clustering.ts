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

const updateKwEnrichment = db.prepare(
  `UPDATE keyword_pages SET intent = @intent, kd = @kd, cpc = @cpc, serp_features = @serp_features WHERE slug = @slug`,
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

// ─── Enrich keyword_pages with intent/kd/cpc/serp_features from AO clustered CSV ───
const ENRICH_CSV = path.join(
  process.cwd(),
  "expert-comptable_clustering/output_live/expert-comptable/AO_expert_comptable_clustered.csv",
);

/**
 * Minimal CSV parser supporting double-quoted fields with embedded commas.
 * Returns an array of objects keyed by the header row.
 */
function parseCsv(content: string): Record<string, string>[] {
  const rows: string[][] = [];
  let field = "";
  let row: string[] = [];
  let inQuotes = false;

  for (let i = 0; i < content.length; i++) {
    const ch = content[i];
    if (inQuotes) {
      if (ch === '"') {
        if (content[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ",") {
        row.push(field);
        field = "";
      } else if (ch === "\n") {
        row.push(field);
        rows.push(row);
        row = [];
        field = "";
      } else if (ch === "\r") {
        // skip — handled by \n
      } else {
        field += ch;
      }
    }
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  if (rows.length === 0) return [];
  const headers = rows[0];
  const out: Record<string, string>[] = [];
  for (let r = 1; r < rows.length; r++) {
    const cur = rows[r];
    if (cur.length === 1 && cur[0] === "") continue;
    const obj: Record<string, string> = {};
    for (let c = 0; c < headers.length; c++) {
      obj[headers[c]] = cur[c] ?? "";
    }
    out.push(obj);
  }
  return out;
}

if (fs.existsSync(ENRICH_CSV)) {
  console.log(`\n  Enriching keyword_pages from ${path.basename(ENRICH_CSV)}…`);
  const csvText = fs.readFileSync(ENRICH_CSV, "utf-8");
  const records = parseCsv(csvText);
  console.log(`    CSV rows parsed: ${records.length}`);

  // Index by slug — keep highest-volume row when duplicates collide
  type EnrichRow = {
    intent: string | null;
    kd: number | null;
    cpc: number | null;
    serp_features: string | null;
    volume: number;
  };
  const bySlug = new Map<string, EnrichRow>();
  for (const rec of records) {
    const query = (rec["query"] || rec["normalized"] || "").trim();
    if (!query) continue;
    const slug = slugify(query);
    if (!slug) continue;
    const volume = Number(rec["Volume_Y"]) || 0;
    const existing = bySlug.get(slug);
    if (existing && existing.volume >= volume) continue;
    const kdRaw = rec["kd"];
    const cpcRaw = rec["cpc"];
    bySlug.set(slug, {
      intent: rec["intent"]?.trim() || null,
      kd: kdRaw && kdRaw.trim() !== "" ? Number(kdRaw) : null,
      cpc: cpcRaw && cpcRaw.trim() !== "" ? Number(cpcRaw) : null,
      serp_features: rec["serp_features"]?.trim() || null,
      volume,
    });
  }
  console.log(`    Unique slugs in CSV: ${bySlug.size}`);

  const allKwSlugs = db
    .prepare(`SELECT slug FROM keyword_pages`)
    .all() as { slug: string }[];

  const updateTxn = db.transaction((slugs: { slug: string }[]) => {
    let matched = 0;
    let unmatched = 0;
    for (const { slug } of slugs) {
      const enrich = bySlug.get(slug);
      if (!enrich) {
        unmatched++;
        continue;
      }
      updateKwEnrichment.run({
        slug,
        intent: enrich.intent,
        kd: enrich.kd,
        cpc: enrich.cpc,
        serp_features: enrich.serp_features,
      });
      matched++;
    }
    return { matched, unmatched };
  });

  const { matched, unmatched } = updateTxn(allKwSlugs) as {
    matched: number;
    unmatched: number;
  };
  const total = allKwSlugs.length;
  const pct = total > 0 ? ((matched / total) * 100).toFixed(1) : "0.0";
  console.log(`    Matched: ${matched}/${total} (${pct}%)`);
  console.log(`    Unmatched: ${unmatched}`);
} else {
  console.warn(`  ⚠️  Enrichment CSV not found: ${ENRICH_CSV}`);
}

console.log(`✅ Clustering data imported`);
db.close();
