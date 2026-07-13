/**
 * scripts/backfill-fiche-screenshots.ts
 *
 * Backfill des captures d'écran des fiches genAI de la vague 1 : le bucket
 * Storage avait été créé en PNG-only avant le passage aux uploads JPEG →
 * 100 % des captures du batch ont été rejetées silencieusement (fact
 * source_preview_image absent de ~918 records). Le bucket accepte désormais
 * png+jpeg.
 *
 * Pour chaque record des fichiers data/genai-fiches/*.json sans preview :
 *   capture (Chrome headless, sémaphore interne) → upload Storage → INSERT du
 *   fact source_preview_image dans SQLite ET Supabase (ids résolus par
 *   siret + source_key dans chaque base). Reprise : skip si le fact existe.
 *
 * ⚠️ À lancer APRÈS tout import-directory-enrichment-supabase en cours
 * (l'importeur remplace les facts d'une source et écraserait les previews).
 *
 * Usage : npx tsx scripts/backfill-fiche-screenshots.ts [--limit N] [--commit]
 */
import Database from "better-sqlite3";
import dotenv from "dotenv";
import fs from "node:fs";
import path from "node:path";
import { Client } from "pg";
import { captureWebsiteScreenshot, isScreenshotCapable } from "./lib-directory-screenshot";

dotenv.config({ path: path.join(process.cwd(), ".env.local") });
dotenv.config();

const COMMIT = process.argv.includes("--commit");
const argVal = (n: string) => { const i = process.argv.indexOf(n); return i >= 0 ? process.argv[i + 1] : undefined; };
const LIMIT = Number(argVal("--limit") ?? 0);

const DB_PATH = path.join(process.cwd(), "numeris.db");
const OUT_DIR = path.join(process.cwd(), "data", "genai-fiches");
const GENERATOR_TAG = "genai-fiche-v1";
const CONCURRENCY = 3;

interface Target { siret: string; websiteUrl: string }

async function main(): Promise<void> {
  if (!isScreenshotCapable()) throw new Error("Chrome ou env Supabase manquant");
  const db = new Database(DB_PATH);
  db.pragma("journal_mode = WAL");

  // Cibles : records piste A sans preview, dédupliqués par siret.
  const targets = new Map<string, Target>();
  for (const file of fs.readdirSync(OUT_DIR)) {
    if (!file.endsWith(".json") || file.includes("miss")) continue;
    const records = JSON.parse(fs.readFileSync(path.join(OUT_DIR, file), "utf-8")) as
      { siret: string; source: { source_url: string; source_type: string }; facts: { fact_type: string }[] }[];
    for (const r of records) {
      if (r.source.source_type !== "official_website") continue;
      if (r.facts.some((f) => f.fact_type === "source_preview_image")) continue;
      targets.set(r.siret, { siret: r.siret, websiteUrl: r.source.source_url });
    }
  }

  const estabStmt = db.prepare(`
    SELECT e.id AS establishment_id, e.cabinet_id FROM directory_establishments e WHERE e.siret = ?`);
  const sourceStmt = db.prepare(`
    SELECT id FROM directory_enrichment_sources WHERE source_key = ? ORDER BY id DESC LIMIT 1`);
  const existsStmt = db.prepare(`
    SELECT 1 FROM directory_profile_facts WHERE establishment_id = ? AND fact_type = 'source_preview_image'`);
  const insStmt = db.prepare(`
    INSERT INTO directory_profile_facts
      (cabinet_id, establishment_id, fact_type, label, value, source_id, confidence, is_displayable, metadata_json)
    VALUES (@cabinet_id, @establishment_id, 'source_preview_image', 'Aperçu du site officiel', @value, @source_id, 80, 1, @meta)`);

  let todo = [...targets.values()].filter((t) => {
    const est = estabStmt.get(t.siret) as { establishment_id: number } | undefined;
    return est && !existsStmt.get(est.establishment_id);
  });
  if (LIMIT > 0) todo = todo.slice(0, LIMIT);
  console.log(`[backfill] ${todo.length} fiches sans screenshot ${COMMIT ? "(COMMIT)" : "(DRY-RUN: captures non lancées)"}`);
  if (!COMMIT || todo.length === 0) { db.close(); return; }

  const pg = process.env.SUPABASE_DB_URL
    ? new Client({ connectionString: process.env.SUPABASE_DB_URL, ssl: { rejectUnauthorized: false } })
    : null;
  if (pg) await pg.connect();

  let ok = 0; let miss = 0;
  const processOne = async (t: Target): Promise<void> => {
    const url = await captureWebsiteScreenshot(t.websiteUrl, t.siret);
    if (!url) { miss++; return; }
    const meta = JSON.stringify({ generator: GENERATOR_TAG, track: "website", backfill: true });
    const est = estabStmt.get(t.siret) as { establishment_id: number; cabinet_id: number } | undefined;
    if (est) {
      const src = sourceStmt.get(`website-crawl-${t.siret}`) as { id: number } | undefined;
      insStmt.run({
        cabinet_id: est.cabinet_id, establishment_id: est.establishment_id,
        value: url, source_id: src?.id ?? null, meta,
      });
    }
    if (pg) {
      await pg.query(
        `INSERT INTO directory_profile_facts
           (cabinet_id, establishment_id, fact_type, label, value, source_id, confidence, is_displayable, metadata_json)
         SELECT e.cabinet_id, e.id, 'source_preview_image', 'Aperçu du site officiel', $1,
                (SELECT s.id FROM directory_enrichment_sources s WHERE s.source_key = $2 ORDER BY s.id DESC LIMIT 1),
                80, TRUE, $3
         FROM directory_establishments e
         WHERE e.siret = $4
           AND NOT EXISTS (
             SELECT 1 FROM directory_profile_facts f
             WHERE f.establishment_id = e.id AND f.fact_type = 'source_preview_image')`,
        [url, `website-crawl-${t.siret}`, meta, t.siret],
      ).catch(() => { /* tolérant : la fiche restera sans preview */ });
    }
    ok++;
    if (ok % 50 === 0) console.log(`  … ${ok}/${todo.length} captures OK (échecs: ${miss})`);
  };

  for (let i = 0; i < todo.length; i += CONCURRENCY) {
    await Promise.all(todo.slice(i, i + CONCURRENCY).map(processOne));
  }

  console.log(`[backfill] terminé : ${ok} captures uploadées, ${miss} sites incapturables`);
  if (pg) await pg.end();
  db.close();
}

main().catch((e) => { console.error("[backfill-fiche-screenshots] FATAL", e); process.exit(1); });
