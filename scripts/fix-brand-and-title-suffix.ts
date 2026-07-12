/**
 * scripts/fix-brand-and-title-suffix.ts
 *
 * Hygiène de marque post-rebranding (constat live 2026-07-13) :
 *   1. « Numeris » traîne encore dans les contenus stockés (213 seo_overrides,
 *      177 page_sections, 10 testimonials) → remplacé par « Skoria »
 *      ("Numeris Expertise" d'abord, puis "Numeris").
 *   2. 170 meta_title stockés embarquent le suffixe marque (« … | Skoria »,
 *      « … | Numeris ») alors que le layout applique déjà le template
 *      `%s | Skoria` → titles doublés en live. Suffixe strippé.
 *
 * Applique les MÊMES transformations sur SQLite (canonique) et Supabase
 * (SQL direct via pg / SUPABASE_DB_URL) — pas de dépendance aux ids.
 *
 * NB : le swap de marque ne corrige PAS la voix « cabinet » de certains vieux
 * contenus professions (« Skoria assure la tenue comptable ») — régénération
 * éditoriale à prévoir (backlog), mais mieux qu'une marque morte en ligne.
 *
 * Dry-run par défaut, --commit pour écrire.
 */
import Database from "better-sqlite3";
import dotenv from "dotenv";
import path from "node:path";
import { Client } from "pg";

dotenv.config({ path: path.join(process.cwd(), ".env.local") });
dotenv.config();

const COMMIT = process.argv.includes("--commit");
const DB_PATH = path.join(process.cwd(), "numeris.db");

const SUFFIX_RE = /\s*[|\-–—]\s*(Skoria|Numeris)\s*$/u;

function swapBrand(value: string): string {
  return value.replace(/Numeris Expertise/gu, "Skoria").replace(/Numeris/gu, "Skoria");
}

interface ColSpec { table: string; cols: string[]; titleCol?: string }
const SPECS: ColSpec[] = [
  { table: "seo_overrides", cols: ["meta_title", "meta_description", "h1", "key_takeaways"], titleCol: "meta_title" },
  { table: "page_sections", cols: ["title", "body", "items"] },
  { table: "testimonials", cols: ["body", "author_role"] },
];

function fixSqlite(): { scanned: number; changed: number } {
  const db = new Database(DB_PATH);
  db.pragma("journal_mode = WAL");
  let scanned = 0; let changed = 0;

  for (const spec of SPECS) {
    const where = spec.cols.map((c) => `${c} LIKE '%Numeris%'`).join(" OR ")
      + (spec.titleCol ? ` OR ${spec.titleCol} LIKE '%| Skoria' OR ${spec.titleCol} LIKE '%|Skoria' OR ${spec.titleCol} LIKE '%- Skoria' OR ${spec.titleCol} LIKE '%| Numeris' OR ${spec.titleCol} LIKE '%- Numeris'` : "");
    const rows = db.prepare(`SELECT id, ${spec.cols.join(", ")} FROM ${spec.table} WHERE ${where}`)
      .all() as ({ id: number } & Record<string, string | null>)[];
    scanned += rows.length;

    const upd = db.prepare(
      `UPDATE ${spec.table} SET ${spec.cols.map((c) => `${c} = @${c}`).join(", ")} WHERE id = @id`,
    );
    const tx = db.transaction(() => {
      for (const row of rows) {
        const next: Record<string, string | null> = {};
        let dirty = false;
        for (const col of spec.cols) {
          const v = row[col];
          if (v == null) { next[col] = null; continue; }
          let out = swapBrand(v);
          if (col === spec.titleCol) out = out.replace(SUFFIX_RE, "");
          next[col] = out;
          if (out !== v) dirty = true;
        }
        if (dirty && COMMIT) { upd.run({ id: row.id, ...next }); changed++; }
        else if (dirty) changed++;
      }
    });
    tx();
    console.log(`  [sqlite] ${spec.table}: ${rows.length} rows scannées`);
  }
  db.close();
  return { scanned, changed };
}

async function fixSupabase(): Promise<void> {
  const url = process.env.SUPABASE_DB_URL;
  if (!url) { console.log("  [supabase] SUPABASE_DB_URL absent — skip"); return; }
  const client = new Client({ connectionString: url, ssl: { rejectUnauthorized: false } });
  await client.connect();

  const statements: string[] = [];
  for (const spec of SPECS) {
    for (const col of spec.cols) {
      statements.push(
        `UPDATE ${spec.table} SET ${col} = REPLACE(REPLACE(${col}, 'Numeris Expertise', 'Skoria'), 'Numeris', 'Skoria') WHERE ${col} LIKE '%Numeris%'`,
      );
    }
    if (spec.titleCol) {
      statements.push(
        `UPDATE ${spec.table} SET ${spec.titleCol} = regexp_replace(${spec.titleCol}, '\\s*[|–—-]\\s*(Skoria|Numeris)\\s*$', '') WHERE ${spec.titleCol} ~ '\\s*[|–—-]\\s*(Skoria|Numeris)\\s*$'`,
      );
    }
  }

  for (const sql of statements) {
    if (!COMMIT) { console.log(`  [supabase dry] ${sql.slice(0, 110)}…`); continue; }
    const res = await client.query(sql);
    console.log(`  [supabase] ${res.rowCount} rows — ${sql.slice(7, 60)}…`);
  }
  await client.end();
}

async function main(): Promise<void> {
  console.log(`Mode : ${COMMIT ? "COMMIT" : "DRY-RUN"}`);
  const { scanned, changed } = fixSqlite();
  console.log(`[sqlite] ${scanned} rows scannées, ${changed} à corriger${COMMIT ? " (écrites)" : ""}`);
  await fixSupabase();
}

main().catch((e) => { console.error(e); process.exit(1); });
