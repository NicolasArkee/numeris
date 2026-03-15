import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";

const DB_PATH = path.join(process.cwd(), "numeris.db");
const OUTPUT = path.join(process.cwd(), "src/data/kg/numeris-kg.json");

const db = new Database(DB_PATH, { readonly: true });

interface KGNode {
  id: string;
  type: "service" | "pillar" | "hub" | "cluster" | "keyword_page";
  silo: string;
  label: string;
  volume: number;
  parent: string | null;
  url: string;
}

interface KGEdge {
  source: string;
  target: string;
  type: "hierarchical" | "sibling" | "service_funnel" | "cross_silo";
  weight: number;
}

const nodes: KGNode[] = [];
const edges: KGEdge[] = [];

// Reopen as writable for edge insertion
db.close();
const dbW = new Database(DB_PATH);
dbW.pragma("journal_mode = WAL");

// ─── Services as top-level nodes ───
const services = dbW.prepare("SELECT * FROM services").all() as { slug: string; title: string }[];
for (const svc of services) {
  nodes.push({
    id: `svc-${svc.slug}`,
    type: "service",
    silo: "services",
    label: svc.title,
    volume: 0,
    parent: null,
    url: `/expertises/${svc.slug}`,
  });
}

// ─── Silos as pillar nodes ───
const silos = dbW.prepare("SELECT * FROM silos").all() as { slug: string; label: string; volume: number }[];
for (const silo of silos) {
  nodes.push({
    id: `silo-${silo.slug}`,
    type: "pillar",
    silo: silo.slug,
    label: silo.label,
    volume: silo.volume,
    parent: null,
    url: `/ressources/${silo.slug}`,
  });
}

// ─── Hubs ───
const hubs = dbW.prepare("SELECT * FROM hubs").all() as { slug: string; silo_slug: string; label: string; volume: number }[];
for (const hub of hubs) {
  nodes.push({
    id: `hub-${hub.slug}`,
    type: "hub",
    silo: hub.silo_slug,
    label: hub.label,
    volume: hub.volume,
    parent: `silo-${hub.silo_slug}`,
    url: `/ressources/${hub.slug}`,
  });

  // Hierarchical edge: silo → hub
  edges.push({
    source: `silo-${hub.silo_slug}`,
    target: `hub-${hub.slug}`,
    type: "hierarchical",
    weight: hub.volume,
  });
}

// ─── Clusters ───
const clusters = dbW.prepare("SELECT * FROM clusters").all() as { slug: string; hub_slug: string; label: string; volume: number }[];
for (const cluster of clusters) {
  nodes.push({
    id: `cl-${cluster.slug}`,
    type: "cluster",
    silo: "",
    label: cluster.label,
    volume: cluster.volume,
    parent: `hub-${cluster.hub_slug}`,
    url: `/ressources/${cluster.slug}`,
  });

  // Hierarchical edge: hub → cluster
  edges.push({
    source: `hub-${cluster.hub_slug}`,
    target: `cl-${cluster.slug}`,
    type: "hierarchical",
    weight: cluster.volume,
  });
}

// ─── Keyword pages ───
const kws = dbW.prepare("SELECT * FROM keyword_pages").all() as { slug: string; cluster_slug: string; label: string; volume: number }[];
for (const kw of kws) {
  nodes.push({
    id: `kw-${kw.slug}`,
    type: "keyword_page",
    silo: "",
    label: kw.label,
    volume: kw.volume,
    parent: `cl-${kw.cluster_slug}`,
    url: `/ressources/${kw.slug}`,
  });

  // Hierarchical edge: cluster → keyword
  edges.push({
    source: `cl-${kw.cluster_slug}`,
    target: `kw-${kw.slug}`,
    type: "hierarchical",
    weight: kw.volume,
  });
}

// ─── Sibling edges (within same hub) ───
const hubClusterMap = new Map<string, string[]>();
for (const c of clusters) {
  if (!hubClusterMap.has(c.hub_slug)) hubClusterMap.set(c.hub_slug, []);
  hubClusterMap.get(c.hub_slug)!.push(c.slug);
}

for (const siblings of hubClusterMap.values()) {
  for (let i = 0; i < siblings.length; i++) {
    for (let j = i + 1; j < siblings.length; j++) {
      edges.push({
        source: `cl-${siblings[i]}`,
        target: `cl-${siblings[j]}`,
        type: "sibling",
        weight: 1,
      });
    }
  }
}

// ─── Service funnel edges (silos → services) ───
const siloServiceMap: Record<string, string[]> = {
  "metier-formation": ["comptabilite", "audit"],
  "ordre-reglementation": ["comptabilite", "audit"],
  "tarifs-devis": ["comptabilite", "fiscalite", "social"],
  "salaires-remuneration": ["social"],
  "services-specialites": ["comptabilite", "fiscalite", "conseil-gestion", "creation-entreprise"],
  "secteurs-d-activite": ["comptabilite", "fiscalite"],
  "geolocalisation": ["comptabilite"],
};

for (const [siloSlug, serviceList] of Object.entries(siloServiceMap)) {
  for (const svcSlug of serviceList) {
    edges.push({
      source: `silo-${siloSlug}`,
      target: `svc-${svcSlug}`,
      type: "service_funnel",
      weight: 1,
    });
  }
}

// ─── Cross-silo edges ───
const siloSlugs = silos.map((s) => s.slug);
for (let i = 0; i < siloSlugs.length; i++) {
  for (let j = i + 1; j < siloSlugs.length; j++) {
    edges.push({
      source: `silo-${siloSlugs[i]}`,
      target: `silo-${siloSlugs[j]}`,
      type: "cross_silo",
      weight: 0.5,
    });
  }
}

// ─── Write KG edges to DB ───
const insertEdgeStmt = dbW.prepare(
  `INSERT OR REPLACE INTO kg_edges (source_slug, target_slug, edge_type, weight) VALUES (?, ?, ?, ?)`,
);
const edgeTx = dbW.transaction(() => {
  for (const e of edges) {
    insertEdgeStmt.run(e.source, e.target, e.type, e.weight);
  }
});
edgeTx();

// ─── Write JSON ───
const kg = {
  metadata: {
    generated: new Date().toISOString(),
    stats: {
      total_nodes: nodes.length,
      total_edges: edges.length,
      nodes_by_type: {
        service: nodes.filter((n) => n.type === "service").length,
        pillar: nodes.filter((n) => n.type === "pillar").length,
        hub: nodes.filter((n) => n.type === "hub").length,
        cluster: nodes.filter((n) => n.type === "cluster").length,
        keyword_page: nodes.filter((n) => n.type === "keyword_page").length,
      },
      edges_by_type: {
        hierarchical: edges.filter((e) => e.type === "hierarchical").length,
        sibling: edges.filter((e) => e.type === "sibling").length,
        service_funnel: edges.filter((e) => e.type === "service_funnel").length,
        cross_silo: edges.filter((e) => e.type === "cross_silo").length,
      },
    },
  },
  silo_service_map: siloServiceMap,
  nodes,
  edges,
};

fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });
fs.writeFileSync(OUTPUT, JSON.stringify(kg, null, 2));

console.log(`✅ KG generated: ${nodes.length} nodes, ${edges.length} edges`);
console.log(`   Nodes: ${JSON.stringify(kg.metadata.stats.nodes_by_type)}`);
console.log(`   Edges: ${JSON.stringify(kg.metadata.stats.edges_by_type)}`);
console.log(`   Output: ${OUTPUT}`);

dbW.close();
