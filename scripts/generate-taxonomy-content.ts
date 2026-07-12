/**
 * scripts/generate-taxonomy-content.ts
 *
 * Comble les pages taxonomiques /ressources encore en fallback « liste de
 * liens » : hubs et clusters visibles (hors filtre institutionnel ordre/oec)
 * sans page_sections. Génère via Gemini Flash un chapeau éditorial groundé
 * sur les ENFANTS RÉELS de la page (clusters du hub / keywords du cluster) :
 *   EditoIntro + ContentSection (guide de lecture du thème) + Faq (3-4).
 *
 * Tag generated_by_model='keyword-lp-v1' → même migration chirurgicale et
 * même rollback que la remédiation keyword. Reprise : pages avec sections
 * sont exclues de la sélection (relancer = ne refait rien).
 *
 * Usage : npx tsx scripts/generate-taxonomy-content.ts [--limit N] [--only slug] [--commit]
 */
import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";

const COMMIT = process.argv.includes("--commit");
const argVal = (name: string): string | undefined => {
  const i = process.argv.indexOf(name);
  return i >= 0 ? process.argv[i + 1] : undefined;
};
const LIMIT = Number(argVal("--limit") ?? 0);
const ONLY = argVal("--only");

const DB_PATH = path.join(process.cwd(), "numeris.db");
const ARKEE_ENV_PATH = "/Users/nicolas/ARKEE_ORG/.env";
const MODEL_TAG = "keyword-lp-v1";
const PRIMARY_MODEL = "gemini-3-flash-preview";
const FALLBACK_MODEL = "gemini-2.5-flash";
const CONCURRENCY = 3;

// ─── Gemini (pattern scripts existants) ─────────────────────────────────────
function loadEnv(p: string): Record<string, string> {
  const out: Record<string, string> = {};
  if (!fs.existsSync(p)) return out;
  for (const line of fs.readFileSync(p, "utf-8").split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const eq = t.indexOf("=");
    if (eq === -1) continue;
    let v = t.slice(eq + 1).trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
    out[t.slice(0, eq).trim()] = v;
  }
  return out;
}
const API_KEY =
  process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY
  || loadEnv(ARKEE_ENV_PATH).GEMINI_API_KEY || loadEnv(ARKEE_ENV_PATH).GOOGLE_API_KEY || "";

function stripFence(t: string): string {
  let s = t.trim();
  if (s.startsWith("```")) s = s.replace(/^```(?:json)?\s*/iu, "").replace(/```\s*$/iu, "");
  return s.trim();
}

async function callGemini(prompt: string): Promise<string> {
  let model = PRIMARY_MODEL;
  for (let attempt = 0; attempt < 4; attempt++) {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.8, topP: 0.95, responseMimeType: "application/json" },
        }),
      },
    );
    if (res.ok) {
      const json = (await res.json()) as { candidates?: { content?: { parts?: { text?: string }[] } }[] };
      const text = json.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
      if (text) return stripFence(text);
      throw new Error("Empty Gemini response");
    }
    if (res.status === 404 && model === PRIMARY_MODEL) { model = FALLBACK_MODEL; continue; }
    if (res.status === 429 || res.status >= 500) {
      await new Promise((r) => setTimeout(r, 2500 * 2 ** attempt));
      continue;
    }
    throw new Error(`Gemini status=${res.status}`);
  }
  throw new Error("Gemini retries épuisés");
}

// ─── Sélection ───────────────────────────────────────────────────────────────
interface TaxNode {
  kind: "hub" | "cluster";
  slug: string;
  label: string;
  parentLabel: string | null;
  children: string[];
}

function buildPrompt(node: TaxNode): string {
  return `Tu écris le chapeau éditorial d'une page THÉMATIQUE de Skoria, comparateur indépendant d'experts-comptables (skoria.fr). La page "${node.label}" regroupe des articles et guides sur ce thème${node.parentLabel ? ` (rubrique parente : ${node.parentLabel})` : ""}.

SOUS-PAGES RÉELLES de ce thème (la page liste déjà ces liens — ton texte les met en perspective, sans les répéter mot à mot) :
${node.children.slice(0, 15).map((c) => `- ${c}`).join("\n")}

RÈGLES ABSOLUES :
- N'invente aucun chiffre, tarif, note, avis ou nom propre. Les seuls montants € autorisés : aucun.
- Skoria est un comparateur indépendant : pas de "nos experts", pas de promesse de prestation.
- Texte brut, pas de liens, pas de markdown, pas de listes dans les body.
- Français impeccable, direct, informatif. Zéro remplissage.

STRUCTURE (exactement 3 sections) :
1. {"section_type":"EditoIntro","title":"...","body":"2-3 phrases : à qui sert ce thème et ce qu'on y trouve"}
2. {"section_type":"ContentSection","title":"...","body":"2 paragraphes séparés par \\n\\n : comment aborder ce thème, dans quel ordre lire, les pièges classiques"}
3. {"section_type":"Faq","title":"Questions fréquentes","body":"","items":[{"q":"…?","a":"2-3 phrases"},{"q":"…?","a":"…"},{"q":"…?","a":"…"}]}

Output JSON strict : {"sections":[...]}`;
}

interface GenSection { section_type: string; title: string; body: string; items?: unknown }

function qc(sections: GenSection[]): string | null {
  if (!Array.isArray(sections) || sections.length !== 3) return "structure ≠ 3 sections";
  const types = sections.map((s) => s.section_type).join(",");
  if (types !== "EditoIntro,ContentSection,Faq") return `types inattendus: ${types}`;
  const words = sections.reduce((n, s) => {
    let t = `${s.title ?? ""} ${s.body ?? ""}`;
    if (Array.isArray(s.items)) for (const it of s.items) t += ` ${Object.values(it as object).join(" ")}`;
    return n + t.split(/\s+/u).filter(Boolean).length;
  }, 0);
  if (words < 180) return `${words} mots < 180`;
  if (/\d+\s?€|not[ée] \d|étoile|avis client/iu.test(JSON.stringify(sections))) return "blacklist";
  const faq = sections[2];
  if (!Array.isArray(faq.items) || (faq.items as unknown[]).length < 2) return "Faq invalide";
  return null;
}

async function main(): Promise<void> {
  if (!API_KEY) throw new Error("GEMINI_API_KEY manquante");
  const db = new Database(DB_PATH);
  db.pragma("journal_mode = WAL");

  const hidden = (s: string) => /ordre|(^|[^a-z])oec([^a-z]|$)/iu.test(s);
  const hubs = (db.prepare(`
    SELECT h.slug, h.label, s.label AS parent
    FROM hubs h LEFT JOIN silos s ON s.slug = h.silo_slug
    WHERE NOT EXISTS (SELECT 1 FROM page_sections ps WHERE ps.route='ressources' AND ps.slug=h.slug)
  `).all() as { slug: string; label: string; parent: string | null }[])
    .filter((h) => !hidden(`${h.slug} ${h.label}`));
  const clusters = (db.prepare(`
    SELECT c.slug, c.label, h.label AS parent
    FROM clusters c LEFT JOIN hubs h ON h.slug = c.hub_slug
    WHERE NOT EXISTS (SELECT 1 FROM page_sections ps WHERE ps.route='ressources' AND ps.slug=c.slug)
  `).all() as { slug: string; label: string; parent: string | null }[])
    .filter((c) => !hidden(`${c.slug} ${c.label}`));

  const childrenOfHub = db.prepare("SELECT label FROM clusters WHERE hub_slug = ? ORDER BY volume DESC");
  const childrenOfCluster = db.prepare("SELECT label FROM keyword_pages WHERE cluster_slug = ? AND COALESCE(disposition,'enrich')='enrich' ORDER BY volume DESC");

  let nodes: TaxNode[] = [
    ...hubs.map((h) => ({
      kind: "hub" as const, slug: h.slug, label: h.label, parentLabel: h.parent,
      children: (childrenOfHub.all(h.slug) as { label: string }[]).map((r) => r.label),
    })),
    ...clusters.map((c) => ({
      kind: "cluster" as const, slug: c.slug, label: c.label, parentLabel: c.parent,
      children: (childrenOfCluster.all(c.slug) as { label: string }[]).map((r) => r.label),
    })),
  ].filter((n) => n.children.length > 0 || n.kind === "hub");
  if (ONLY) nodes = nodes.filter((n) => n.slug === ONLY);
  if (LIMIT > 0) nodes = nodes.slice(0, LIMIT);

  console.log(`[taxonomy] ${nodes.length} pages à combler (${nodes.filter((n) => n.kind === "hub").length} hubs, ${nodes.filter((n) => n.kind === "cluster").length} clusters) ${COMMIT ? "COMMIT" : "DRY-RUN"}`);
  if (!COMMIT || nodes.length === 0) { db.close(); return; }

  const insSection = db.prepare(`
    INSERT INTO page_sections (route, slug, section_type, section_order, title, body, items, citations, generated_at, generated_by_model)
    VALUES ('ressources', @slug, @type, @ord, @title, @body, @items, NULL, datetime('now'), '${MODEL_TAG}')
    ON CONFLICT(route, slug, section_order) DO UPDATE SET
      section_type = excluded.section_type, title = excluded.title, body = excluded.body,
      items = excluded.items, generated_at = excluded.generated_at, generated_by_model = excluded.generated_by_model`);
  const upsertMeta = db.prepare(`
    INSERT INTO page_meta (route, slug, publish_status, published_at, pipeline_run_id, reviewed_at)
    VALUES ('ressources', @slug, 'published', datetime('now'), 'keyword-lp-taxonomy', datetime('now'))
    ON CONFLICT(route, slug) DO UPDATE SET
      publish_status = 'published', published_at = excluded.published_at,
      pipeline_run_id = excluded.pipeline_run_id, reviewed_at = excluded.reviewed_at`);

  let ok = 0; let failed = 0;
  const issues: string[] = [];

  const processOne = async (node: TaxNode): Promise<void> => {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const raw = await callGemini(buildPrompt(node) + (attempt ? "\n\nReformule avec un angle différent." : ""));
        const parsed = JSON.parse(raw) as { sections?: GenSection[] };
        const err = qc(parsed.sections ?? []);
        if (err) { if (attempt === 0) continue; throw new Error(`QC ${err}`); }
        const tx = db.transaction(() => {
          parsed.sections!.forEach((s, i) => {
            insSection.run({
              slug: node.slug, type: s.section_type, ord: i + 1,
              title: s.title ?? null, body: s.body ?? null,
              items: s.items != null ? JSON.stringify(s.items) : null,
            });
          });
          upsertMeta.run({ slug: node.slug });
        });
        tx();
        ok++;
        return;
      } catch (e) {
        if (attempt === 0) continue;
        failed++;
        if (issues.length < 25) issues.push(`${node.slug}: ${(e as Error).message.slice(0, 120)}`);
      }
    }
  };

  for (let i = 0; i < nodes.length; i += CONCURRENCY) {
    await Promise.all(nodes.slice(i, i + CONCURRENCY).map(processOne));
    if (i % 30 < CONCURRENCY) console.log(`  … ${Math.min(i + CONCURRENCY, nodes.length)}/${nodes.length} (ok=${ok})`);
  }

  console.log(`\n[taxonomy] terminé : ok=${ok} failed=${failed}`);
  for (const s of issues) console.log(`   - ${s}`);
  db.close();
  if (ok === 0 && nodes.length > 0) process.exit(1);
}

main().catch((e) => { console.error("[generate-taxonomy-content] FATAL", e); process.exit(1); });
