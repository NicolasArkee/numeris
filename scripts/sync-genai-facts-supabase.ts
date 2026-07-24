/**
 * scripts/sync-genai-facts-supabase.ts
 *
 * Push CIBLÉ vers Supabase prod des fiches enrichies par genAI, depuis la source
 * de vérité numeris.db (les JSON data/genai-fiches/*.json sont écrasés à chaque
 * passe → incomplets ; la DB locale contient l'ensemble).
 *
 * Portée stricte : uniquement les `directory_profile_facts` taggés genai-fiche-v1
 * (+ les `directory_enrichment_sources` qu'ils référencent). Upsert par CLÉ
 * NATURELLE (idempotent, aucun risque de collision d'id). NE touche PAS :
 * directory_cabinets, publish_status, qualification_snapshots, ni aucune autre
 * table. Rejouable sans dommage.
 *
 * Usage :
 *   npx tsx scripts/sync-genai-facts-supabase.ts --dry-run   # compte, n'écrit rien
 *   npx tsx scripts/sync-genai-facts-supabase.ts             # push réel
 *   npx tsx scripts/sync-genai-facts-supabase.ts --limit=50  # test borné
 *
 * SUPABASE_DB_URL requis (.env.local).
 */
import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";
import { Pool } from "pg";

// Concurrence des upserts : le pooler Supabase a ~0,3s de latence/requête ;
// séquentiel = ~1h pour ~14k requêtes. Borné pour ne pas saturer le pool.
const CONCURRENCY = 10;

async function mapWithConcurrency<T>(
  items: T[],
  concurrency: number,
  fn: (item: T, index: number) => Promise<void>,
): Promise<void> {
  let cursor = 0;
  async function worker(): Promise<void> {
    while (cursor < items.length) {
      const i = cursor++;
      await fn(items[i], i);
    }
  }
  await Promise.all(
    Array.from({ length: Math.min(concurrency, items.length) }, () => worker()),
  );
}

const GENERATOR_TAG = "genai-fiche-v1";
const DRY = process.argv.includes("--dry-run");
const LIMIT = Number(
  (process.argv.find((a) => a.startsWith("--limit=")) ?? "").split("=")[1] ?? 0,
);

function loadEnv(): string {
  const p = path.join(process.cwd(), ".env.local");
  const line = fs
    .readFileSync(p, "utf-8")
    .split("\n")
    .find((l) => l.startsWith("SUPABASE_DB_URL="));
  const url = line ? line.split("=").slice(1).join("=").trim() : "";
  if (!url) throw new Error("SUPABASE_DB_URL absent de .env.local");
  return url;
}

type SourceRow = {
  id: number;
  cabinet_id: number;
  establishment_id: number;
  source_key: string;
  source_type: string;
  source_url: string | null;
  retrieved_at: string;
  parsed_ok: number | null;
  robots_allowed: number | null;
  legal_basis: string | null;
  raw_excerpt: string | null;
};

type FactRow = {
  cabinet_id: number;
  establishment_id: number;
  fact_type: string;
  label: string;
  value: string;
  source_id: number | null;
  confidence: number;
  is_displayable: number;
  metadata_json: string | null;
};

// Upsert d'une source par clé naturelle (cabinet, établissement, source_key,
// source_url) — réplique scripts/import-directory-enrichment-supabase.ts.
async function upsertSource(pool: Pool, s: SourceRow): Promise<number> {
  const existing = await pool.query<{ id: number }>(
    `SELECT id FROM directory_enrichment_sources
     WHERE cabinet_id = $1 AND establishment_id = $2 AND source_key = $3
       AND COALESCE(source_url, '') = COALESCE($4::text, '') LIMIT 1`,
    [s.cabinet_id, s.establishment_id, s.source_key, s.source_url],
  );
  if (existing.rows[0]) {
    await pool.query(
      `UPDATE directory_enrichment_sources
       SET source_type = $1, source_url = $2, retrieved_at = $3,
           parsed_ok = $4, robots_allowed = $5, legal_basis = $6, raw_excerpt = $7
       WHERE id = $8`,
      [
        s.source_type, s.source_url, s.retrieved_at,
        s.parsed_ok == null ? null : Boolean(s.parsed_ok),
        s.robots_allowed == null ? null : Boolean(s.robots_allowed),
        s.legal_basis, s.raw_excerpt, existing.rows[0].id,
      ],
    );
    return existing.rows[0].id;
  }
  const inserted = await pool.query<{ id: number }>(
    `INSERT INTO directory_enrichment_sources
       (cabinet_id, establishment_id, source_key, source_type, source_url,
        retrieved_at, parsed_ok, robots_allowed, legal_basis, raw_excerpt)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING id`,
    [
      s.cabinet_id, s.establishment_id, s.source_key, s.source_type, s.source_url,
      s.retrieved_at,
      s.parsed_ok == null ? null : Boolean(s.parsed_ok),
      s.robots_allowed == null ? null : Boolean(s.robots_allowed),
      s.legal_basis, s.raw_excerpt,
    ],
  );
  return inserted.rows[0].id;
}

// Upsert d'un fact par clé naturelle (cabinet, établissement, fact_type, value).
async function upsertFact(
  pool: Pool, f: FactRow, sourceId: number | null,
): Promise<"insert" | "update"> {
  const existing = await pool.query<{ id: number }>(
    `SELECT id FROM directory_profile_facts
     WHERE cabinet_id = $1 AND establishment_id = $2 AND fact_type = $3 AND value = $4 LIMIT 1`,
    [f.cabinet_id, f.establishment_id, f.fact_type, f.value],
  );
  if (existing.rows[0]) {
    await pool.query(
      `UPDATE directory_profile_facts
       SET label = $1, source_id = $2, confidence = $3, is_displayable = $4,
           metadata_json = $5, updated_at = now() WHERE id = $6`,
      [f.label, sourceId, f.confidence, Boolean(f.is_displayable), f.metadata_json, existing.rows[0].id],
    );
    return "update";
  }
  await pool.query(
    `INSERT INTO directory_profile_facts
       (cabinet_id, establishment_id, fact_type, label, value, source_id, confidence, is_displayable, metadata_json)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
    [f.cabinet_id, f.establishment_id, f.fact_type, f.label, f.value, sourceId, f.confidence, Boolean(f.is_displayable), f.metadata_json],
  );
  return "insert";
}

async function main(): Promise<void> {
  const db = new Database(path.join(process.cwd(), "numeris.db"), { readonly: true });

  let facts = db
    .prepare(
      `SELECT cabinet_id, establishment_id, fact_type, label, value, source_id,
              confidence, is_displayable, metadata_json
       FROM directory_profile_facts
       WHERE COALESCE(metadata_json,'') LIKE '%${GENERATOR_TAG}%'
       ORDER BY establishment_id, id`,
    )
    .all() as FactRow[];
  if (LIMIT > 0) facts = facts.slice(0, LIMIT);

  const sourceIds = [...new Set(facts.map((f) => f.source_id).filter((v): v is number => v != null))];
  const sources = sourceIds.length
    ? (db
        .prepare(
          `SELECT id, cabinet_id, establishment_id, source_key, source_type, source_url,
                  retrieved_at, parsed_ok, robots_allowed, legal_basis, raw_excerpt
           FROM directory_enrichment_sources WHERE id IN (${sourceIds.map(() => "?").join(",")})`,
        )
        .all(...sourceIds) as SourceRow[])
    : [];

  console.log(
    `[sync-genai] ${facts.length} facts genai (${new Set(facts.map((f) => f.establishment_id)).size} établissements) + ${sources.length} sources à ${DRY ? "SIMULER" : "pousser"}.`,
  );
  const byType = facts.reduce<Record<string, number>>((a, f) => ((a[f.fact_type] = (a[f.fact_type] ?? 0) + 1), a), {});
  console.log("  par fact_type:", JSON.stringify(byType));
  if (DRY) {
    console.log("[sync-genai] --dry-run : aucune écriture. Retirer --dry-run pour pousser.");
    db.close();
    return;
  }

  const pool = new Pool({ connectionString: loadEnv(), max: CONCURRENCY + 2 });

  // 1) Sources d'abord (les facts référencent leur id Supabase mappé). Distinctes
  //    par clé naturelle → parallélisation sûre.
  const srcMap = new Map<number, number>();
  let si = 0;
  await mapWithConcurrency(sources, CONCURRENCY, async (s) => {
    const id = await upsertSource(pool, s);
    srcMap.set(s.id, id);
    if (++si % 500 === 0) console.log(`  sources ${si}/${sources.length}`);
  });

  // 2) Facts.
  let ins = 0, upd = 0, fi = 0;
  await mapWithConcurrency(facts, CONCURRENCY, async (f) => {
    const supSourceId = f.source_id != null ? (srcMap.get(f.source_id) ?? null) : null;
    const r = await upsertFact(pool, f, supSourceId);
    r === "insert" ? ins++ : upd++;
    if (++fi % 500 === 0) console.log(`  facts ${fi}/${facts.length} (ins=${ins} upd=${upd})`);
  });

  await pool.end();
  db.close();
  console.log(`[sync-genai] terminé : ${sources.length} sources, facts insert=${ins} update=${upd}.`);
}

main().catch((e) => { console.error("[sync-genai] FAIL:", e); process.exit(1); });
