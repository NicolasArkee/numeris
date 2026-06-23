import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";
import { SCHEMA } from "../src/libs/db/schema";

// ─── Import de la couche commerciale / affiliation ───
// Source : ARKEE_ORG/CLIENTS/_standalone/numeris/outputs/content/ copié dans
// affiliate_clustering/data/ (master-topic-list.csv, affiliate-programs.seed.json,
// page-affiliate-map.csv, internal-link-map.csv).
// Remplit : commercial_pages, affiliate_programs, page_affiliate_programs, commercial_links.
// Toutes les pages en publish_status='draft' → rien en ligne tant que non publié.
// NE TOUCHE PAS aux tables KG éditoriales ni au contenu (page_sections = Gemini).

const DB_PATH = path.join(process.cwd(), "numeris.db");
const DATA_DIR = path.join(process.cwd(), "affiliate_clustering/data");

const db = new Database(DB_PATH);
db.pragma("journal_mode = WAL");
db.exec(SCHEMA);

// Idempotent : ajoute brief_json si la table commercial_pages préexistait sans la colonne.
const _cpCols = db.prepare("PRAGMA table_info(commercial_pages)").all() as { name: string }[];
if (!_cpCols.some((c) => c.name === "brief_json")) {
  db.exec("ALTER TABLE commercial_pages ADD COLUMN brief_json TEXT");
}

function slugify(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

// TOFU est documenté route='ressources' en phase 1 ; en phase 2 on consolide les
// guides sous /comparatifs (3 namespaces). Les cibles 'secteurs' (pages existantes) restent.
function remapRoute(r: string): string {
  return r === "ressources" ? "comparatifs" : r;
}
function remapUrl(url: string): string {
  return url.replace(/^\/ressources\//, "/comparatifs/");
}

function parseCsv(content: string): Record<string, string>[] {
  const rows: string[][] = [];
  let field = "";
  let row: string[] = [];
  let inQuotes = false;
  for (let i = 0; i < content.length; i++) {
    const ch = content[i];
    if (inQuotes) {
      if (ch === '"') {
        if (content[i + 1] === '"') { field += '"'; i++; } else { inQuotes = false; }
      } else { field += ch; }
    } else if (ch === '"') { inQuotes = true; }
    else if (ch === ",") { row.push(field); field = ""; }
    else if (ch === "\n") { row.push(field); rows.push(row); row = []; field = ""; }
    else if (ch === "\r") { /* skip */ }
    else { field += ch; }
  }
  if (field.length > 0 || row.length > 0) { row.push(field); rows.push(row); }
  if (rows.length === 0) return [];
  const headers = rows[0];
  const out: Record<string, string>[] = [];
  for (let r = 1; r < rows.length; r++) {
    const cur = rows[r];
    if (cur.length === 1 && cur[0] === "") continue;
    const obj: Record<string, string> = {};
    headers.forEach((h, c) => (obj[h] = cur[c] ?? ""));
    out.push(obj);
  }
  return out;
}

// ─── 1. commercial_pages (depuis master-topic-list.csv) ───
const master = parseCsv(fs.readFileSync(path.join(DATA_DIR, "master-topic-list.csv"), "utf-8"));
const labelBySlug = new Map<string, string>();
for (const r of master) labelBySlug.set(r.slug, r.label);

const BRIEFS_DIR = path.join(DATA_DIR, "briefs");
function readBriefJson(slug: string): string | null {
  const p = path.join(BRIEFS_DIR, `${slug}.brief.json`);
  if (!fs.existsSync(p)) return null;
  try {
    return JSON.stringify(JSON.parse(fs.readFileSync(p, "utf-8"))); // re-serialize (validate + compact)
  } catch {
    return null;
  }
}

const insertPage = db.prepare(`INSERT OR REPLACE INTO commercial_pages
  (slug, route, url, archetype, silo_label, hub_slug, hub_label, cluster_slug, cluster_label,
   label, intent, funnel_stage, primary_program, secondary_programs, target_query,
   est_volume, priority_ice, publish_wave, brief_json, publish_status)
  VALUES (@slug, @route, @url, @archetype, @silo_label, @hub_slug, @hub_label, @cluster_slug,
   @cluster_label, @label, @intent, @funnel_stage, @primary_program, @secondary_programs,
   @target_query, @est_volume, @priority_ice, @publish_wave, @brief_json, 'draft')`);

const pagesTx = db.transaction(() => {
  for (const r of master) {
    insertPage.run({
      slug: r.slug,
      route: remapRoute(r.route),
      url: remapUrl(r.url),
      archetype: r.archetype,
      silo_label: r.silo || null,
      hub_slug: r.hub ? slugify(r.hub) : null,
      hub_label: r.hub || null,
      cluster_slug: r.cluster || null,
      cluster_label: labelBySlug.get(r.cluster) || r.cluster || null,
      label: r.label,
      intent: r.intent || null,
      funnel_stage: r.funnel_stage || null,
      primary_program: r.primary_program || null,
      secondary_programs: r.secondary_programs || null,
      target_query: r.target_query || null,
      est_volume: Number(r.est_volume) || 0,
      priority_ice: Number(r.priority_ice) || 0,
      publish_wave: Number(r.publish_wave) || 0,
      brief_json: readBriefJson(r.slug),
    });
  }
});
pagesTx();
console.log(`  commercial_pages: ${master.length}`);

// ─── 2. affiliate_programs (depuis affiliate-programs.seed.json) ───
const programs: Record<string, unknown>[] = JSON.parse(
  fs.readFileSync(path.join(DATA_DIR, "affiliate-programs.seed.json"), "utf-8"),
);
const insertProg = db.prepare(`INSERT OR REPLACE INTO affiliate_programs
  (slug, name, category_slug, program_type, has_affiliate, has_referral, has_apporteur,
   commission_display, recurrent, recurrent_note, platform, target_audience, scale_public,
   source_url, affiliate_url, notes, is_active, updated_at)
  VALUES (@slug, @name, @category_slug, @program_type, @has_affiliate, @has_referral,
   @has_apporteur, @commission_display, @recurrent, @recurrent_note, @platform,
   @target_audience, @scale_public, @source_url, @affiliate_url, @notes, 1, datetime('now'))`);
const progTx = db.transaction(() => {
  for (const p of programs) {
    insertProg.run({
      slug: p.slug, name: p.name, category_slug: p.category_slug,
      program_type: p.program_type,
      has_affiliate: p.has_affiliate ? 1 : 0,
      has_referral: p.has_referral ? 1 : 0,
      has_apporteur: p.has_apporteur ? 1 : 0,
      commission_display: p.commission_display ?? null,
      recurrent: p.recurrent ? 1 : 0,
      recurrent_note: p.recurrent_note || null,
      platform: p.platform ?? null,
      target_audience: p.target_audience ?? null,
      scale_public: p.scale_public ?? null,
      source_url: p.source_url ?? null,
      affiliate_url: (p.affiliate_url as string) ?? null,
      notes: p.notes ?? null,
    });
  }
});
progTx();
console.log(`  affiliate_programs: ${programs.length}`);

// ─── 3. page_affiliate_programs (depuis page-affiliate-map.csv) ───
const pam = parseCsv(fs.readFileSync(path.join(DATA_DIR, "page-affiliate-map.csv"), "utf-8"));
const insertPap = db.prepare(`INSERT OR REPLACE INTO page_affiliate_programs
  (route, page_slug, program_slug, rank, is_primary)
  VALUES (@route, @page_slug, @program_slug, @rank, @is_primary)`);
const papTx = db.transaction(() => {
  for (const r of pam) {
    insertPap.run({
      route: remapRoute(r.route), page_slug: r.page_slug, program_slug: r.program_slug,
      rank: Number(r.rank) || 0, is_primary: Number(r.is_primary) || 0,
    });
  }
});
papTx();
console.log(`  page_affiliate_programs: ${pam.length}`);

// ─── 4. commercial_links (depuis internal-link-map.csv) ───
const links = parseCsv(fs.readFileSync(path.join(DATA_DIR, "internal-link-map.csv"), "utf-8"));
const insertLink = db.prepare(`INSERT OR REPLACE INTO commercial_links
  (source_slug, source_route, target_slug, target_route, edge_type, weight)
  VALUES (@source_slug, @source_route, @target_slug, @target_route, @edge_type, @weight)`);
let linkCount = 0;
const linkTx = db.transaction(() => {
  for (const r of links) {
    // remap routes affiliées ressources→comparatifs ; conserver 'secteurs' (pages existantes)
    insertLink.run({
      source_slug: r.source_slug,
      source_route: r.source_route ? remapRoute(r.source_route) : null,
      target_slug: r.target_slug,
      target_route: r.target_route ? remapRoute(r.target_route) : null,
      edge_type: r.edge_type, weight: Number(r.weight) || 1.0,
    });
    linkCount++;
  }
});
linkTx();
console.log(`  commercial_links: ${linkCount}`);

// ─── Récap ───
const counts = {
  pages: (db.prepare("SELECT COUNT(*) c FROM commercial_pages").get() as { c: number }).c,
  by_route: db.prepare("SELECT route, COUNT(*) c FROM commercial_pages GROUP BY route").all(),
  programs: (db.prepare("SELECT COUNT(*) c FROM affiliate_programs").get() as { c: number }).c,
  pap: (db.prepare("SELECT COUNT(*) c FROM page_affiliate_programs").get() as { c: number }).c,
  links: (db.prepare("SELECT COUNT(*) c FROM commercial_links").get() as { c: number }).c,
  published: (db.prepare("SELECT COUNT(*) c FROM commercial_pages WHERE publish_status='published'").get() as { c: number }).c,
};
console.log("✅ Affiliate layer imported:", JSON.stringify(counts));
db.close();
