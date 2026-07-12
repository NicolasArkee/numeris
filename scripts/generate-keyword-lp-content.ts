/**
 * scripts/generate-keyword-lp-content.ts
 *
 * Remédiation LP des keyword_pages /ressources (disposition='enrich') :
 *   1. PASSE META (déterministe, 0 IA) : seo_overrides (title/desc/h1) via
 *      buildKeywordMeta pour toutes les pages enrich.
 *   2. PASSE GEN (Gemini) : sections éditoriales groundées sur les données
 *      réelles → page_sections + key_takeaways + page_meta (published).
 *
 * Tout est tagué generated_by_model='keyword-lp-v1' → migration Supabase
 * chirurgicale (migrate-skoria-supabase.ts) + rollback SQL trivial.
 *
 * Vagues (sur les pages enrich uniquement) :
 *   --wave 1  vol ≥ 1000 + toutes les géo-thème  (Gemini Pro)
 *   --wave 2  vol 100-999                         (Gemini Flash)
 *   --wave 3  vol < 100                           (Gemini Flash)
 *
 * Usage :
 *   npx tsx scripts/generate-keyword-lp-content.ts --meta-only --commit
 *   npx tsx scripts/generate-keyword-lp-content.ts --wave 1 [--limit N] [--slug X]
 *        [--model pro|flash] [--force] [--commit]     (dry-run par défaut)
 *
 * Reprise gratuite : les pages avec page_meta.pipeline_run_id LIKE 'keyword-lp-%'
 * sont sautées (sauf --force). Clé GEMINI_API_KEY : process.env ou
 * /Users/nicolas/ARKEE_ORG/.env (chemin canonique agence).
 */
import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";
import {
  buildKeywordMeta,
  classifyKeyword,
  hashVariant,
  resolveGeoKeywordSync,
  resolveTheme,
  slugTokens,
  type CityLite,
  type KeywordClass,
} from "../src/libs/ressources/keyword-lp-helpers";

// ─── Config ──────────────────────────────────────────────────────────────────
const DB_PATH = path.join(process.cwd(), "numeris.db");
const ARKEE_ENV_PATH = "/Users/nicolas/ARKEE_ORG/.env";
const MODEL_TAG = "keyword-lp-v1";

const MODELS = {
  pro: { primary: "gemini-3-pro-preview", fallback: "gemini-2.5-pro" },
  flash: { primary: "gemini-3-flash-preview", fallback: "gemini-2.5-flash" },
} as const;

const args = process.argv.slice(2);
const COMMIT = args.includes("--commit");
const META_ONLY = args.includes("--meta-only");
const FORCE = args.includes("--force");
const argVal = (name: string): string | undefined => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : undefined;
};
const WAVE = Number(argVal("--wave") ?? 0);
const LIMIT = Number(argVal("--limit") ?? 0);
const ONLY_SLUG = argVal("--slug");
const MODEL_OVERRIDE = argVal("--model") as "pro" | "flash" | undefined;
const CONCURRENCY = 3;

// ─── Types ───────────────────────────────────────────────────────────────────
interface KwRow {
  slug: string;
  cluster_slug: string;
  label: string;
  volume: number;
  intent: string | null;
  disposition: string | null;
}

interface GenSection {
  section_type: string;
  title: string;
  body: string;
  items?: unknown;
}

interface GenPayload {
  sections: GenSection[];
  key_takeaways?: string[];
}

// ─── Env / Gemini (pattern generate-fictional-testimonials.ts) ──────────────
function loadEnv(envPath: string): Record<string, string> {
  const out: Record<string, string> = {};
  if (!fs.existsSync(envPath)) return out;
  for (const line of fs.readFileSync(envPath, "utf-8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    let val = trimmed.slice(eq + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    out[trimmed.slice(0, eq).trim()] = val;
  }
  return out;
}

function getApiKey(): string {
  const fromProc = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (fromProc) return fromProc;
  const env = loadEnv(ARKEE_ENV_PATH);
  const key = env.GEMINI_API_KEY || env.GOOGLE_API_KEY;
  if (!key) throw new Error(`Missing GEMINI_API_KEY (process.env et ${ARKEE_ENV_PATH})`);
  return key;
}

function stripJsonFence(text: string): string {
  let t = text.trim();
  if (t.startsWith("```")) t = t.replace(/^```(?:json)?\s*/iu, "").replace(/```\s*$/iu, "");
  return t.trim();
}

async function callGemini(
  apiKey: string,
  model: string,
  prompt: string,
  temperature: number,
): Promise<{ ok: true; text: string } | { ok: false; status: number; body: string }> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: { temperature, topP: 0.95, responseMimeType: "application/json" },
    }),
  });
  if (!res.ok) return { ok: false, status: res.status, body: await res.text() };
  const json = (await res.json()) as { candidates?: { content?: { parts?: { text?: string }[] } }[] };
  const text = json.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
  if (!text) return { ok: false, status: 0, body: "Empty Gemini response" };
  return { ok: true, text: stripJsonFence(text) };
}

async function callGeminiWithRetry(
  apiKey: string,
  tier: "pro" | "flash",
  prompt: string,
  temperature: number,
): Promise<{ model: string; text: string }> {
  const { primary, fallback } = MODELS[tier];
  let model = primary;
  for (let attempt = 0; attempt < 4; attempt++) {
    const r = await callGemini(apiKey, model, prompt, temperature);
    if (r.ok) return { model, text: r.text };
    if (r.status === 404 && model === primary) { model = fallback; continue; }
    if (r.status === 429 || r.status >= 500) {
      await new Promise((res) => setTimeout(res, 2000 * 2 ** attempt));
      continue;
    }
    throw new Error(`Gemini ${model} status=${r.status}: ${r.body.slice(0, 300)}`);
  }
  throw new Error(`Gemini ${model}: retries épuisés`);
}

// ─── Blueprints (variance structurelle anti-footprint) ──────────────────────
// Palette limitée aux section_types robustes de DynamicSection (shapes simples).
type BlockSpec = { type: string; hint: string };
const BLUEPRINTS: Record<KeywordClass, BlockSpec[][]> = {
  commercial: [
    [
      { type: "EditoIntro", hint: "cadrage éditorial du besoin, angle comparateur" },
      { type: "ContentSection", hint: "les critères de choix qui comptent vraiment (2-3 paragraphes)" },
      { type: "Checklist", hint: "checklist des points à vérifier avant de signer (5-7 items)" },
      { type: "ContentSection", hint: "budget et périmètre de mission : comment lire une offre" },
      { type: "Faq", hint: "3-4 questions concrètes que se posent les acheteurs" },
    ],
    [
      { type: "EditoIntro", hint: "cadrage éditorial, promesse de comparaison objective" },
      { type: "DefinitionBox", hint: "définition précise du service/terme" },
      { type: "ContentSection", hint: "panorama des options du marché (types d'offres, pas de marques inventées)" },
      { type: "NumberedSteps", hint: "démarche de comparaison en 4-5 étapes" },
      { type: "Faq", hint: "3-4 questions fréquentes" },
    ],
    [
      { type: "EditoIntro", hint: "mise en situation du lecteur" },
      { type: "ContentSection", hint: "ce que couvre la prestation, livrables concrets" },
      { type: "AlertBox", hint: "le piège classique à éviter (1 paragraphe)" },
      { type: "Checklist", hint: "questions à poser au professionnel (5-6 items)" },
      { type: "Faq", hint: "3-4 questions fréquentes" },
    ],
  ],
  informational: [
    [
      { type: "EditoIntro", hint: "réponse directe à la question en 2-3 phrases, puis annonce du plan" },
      { type: "DefinitionBox", hint: "définition/cadre du sujet" },
      { type: "ContentSection", hint: "développement principal avec les repères chiffrés du bloc FAITS uniquement" },
      { type: "NumberedSteps", hint: "étapes/parcours concret (4-6 étapes)" },
      { type: "Faq", hint: "3-4 questions voisines (People Also Ask)" },
    ],
    [
      { type: "EditoIntro", hint: "réponse directe puis nuances" },
      { type: "ContentSection", hint: "le point complet, structuré en 2-3 paragraphes" },
      { type: "ContentSection", hint: "cas particuliers et variantes" },
      { type: "Checklist", hint: "points-clés à retenir en pratique (5-6 items)" },
      { type: "Faq", hint: "3-4 questions voisines" },
    ],
    [
      { type: "EditoIntro", hint: "cadrage : pourquoi la question se pose" },
      { type: "ContentSection", hint: "développement principal" },
      { type: "AlertBox", hint: "erreur fréquente ou idée reçue à corriger" },
      { type: "NumberedSteps", hint: "méthode/démarche pas à pas" },
      { type: "Faq", hint: "3-4 questions voisines" },
    ],
  ],
  navigational: [
    [
      { type: "EditoIntro", hint: "présentation factuelle et neutre de l'offre/plateforme citée" },
      { type: "ContentSection", hint: "positionnement, périmètre, à qui ça s'adresse — strictement factuel, aucun dénigrement" },
      { type: "Checklist", hint: "critères pour comparer ce type d'offre à d'autres (5-6 items)" },
      { type: "Faq", hint: "3 questions fréquentes, réponses neutres" },
    ],
  ],
  "geo-theme": [
    [
      { type: "EditoIntro", hint: "cadrage local : trouver le bon accompagnement comptable dans cette ville, pour ce profil" },
      { type: "ContentSection", hint: "spécificités comptables/fiscales du thème (2-3 paragraphes) — PAS de statistiques locales inventées" },
      { type: "NumberedSteps", hint: "choisir son cabinet localement en 4-5 étapes" },
      { type: "Faq", hint: "2-3 questions complémentaires (ne PAS répéter coût/choix/distance, déjà traités sur la page)" },
    ],
  ],
  geo: [
    [
      { type: "EditoIntro", hint: "cadrage local" },
      { type: "ContentSection", hint: "conseils de choix localisés" },
      { type: "Faq", hint: "2-3 questions complémentaires" },
    ],
  ],
};

// ─── Prompt ──────────────────────────────────────────────────────────────────
function buildPrompt(
  kw: KwRow,
  cls: KeywordClass,
  blueprint: BlockSpec[],
  facts: string[],
  withTakeaways: boolean,
): string {
  const blocks = blueprint
    .map((b, i) => `${i + 1}. section_type="${b.type}" — ${b.hint}`)
    .join("\n");
  return `Tu es rédacteur SEO senior pour Skoria, comparateur indépendant d'experts-comptables en France (skoria.fr). Tu écris le corps d'une landing page pour la requête : "${kw.label}".

FAITS VÉRIFIÉS (seule source autorisée pour tout chiffre, nom propre ou fait précis) :
${facts.map((f) => `- ${f}`).join("\n")}

LONGUEUR : développe chaque section — vise 120 à 160 mots par section (hors FAQ), sans délayage.

RÈGLES ABSOLUES :
- N'énonce AUCUN chiffre, tarif, statistique ou nom de cabinet absent du bloc FAITS. Les montants € autorisés sont uniquement ceux du bloc FAITS ; les salaires se formulent en fourchettes prudentes explicitement indicatives.
- N'invente jamais d'avis clients, de notes, d'étoiles, de témoignages ni de classements.
- Skoria est un comparateur : ne promets jamais de prestation comptable directe ("nos experts", "notre cabinet" = interdit).
- Pas de liens, pas de markdown, pas de HTML : texte brut uniquement.
- Ton : professionnel, direct, concret, français impeccable. Pas de superlatifs creux ("véritable partenaire", "accompagnement personnalisé sur mesure").
- Chaque section apporte une information distincte : zéro redite entre sections.

STRUCTURE IMPOSÉE — génère exactement ces ${blueprint.length} sections, dans cet ordre :
${blocks}

FORMATS PAR TYPE :
- EditoIntro : {"section_type":"EditoIntro","title":"...","body":"2-3 phrases"}
- ContentSection : {"section_type":"ContentSection","title":"...","body":"2-3 paragraphes séparés par \\n\\n"}
- DefinitionBox : {"section_type":"DefinitionBox","title":"terme défini","body":"définition en 2-3 phrases"}
- NumberedSteps : {"section_type":"NumberedSteps","title":"...","body":"phrase d'intro","items":[{"title":"Étape courte","description":"1-2 phrases"}]}
- Checklist : {"section_type":"Checklist","title":"...","body":"phrase d'intro","items":["item 1","item 2"]}
- AlertBox : {"section_type":"AlertBox","title":"titre d'alerte","body":"1 paragraphe"}
- Faq : {"section_type":"Faq","title":"Questions fréquentes","body":"","items":[{"q":"question ?","a":"réponse 2-4 phrases"}]}

Output JSON strict (aucun texte hors JSON) :
{"sections":[...la structure imposée...]${withTakeaways ? `,"key_takeaways":["3-4 points clés d'une phrase chacun"]` : ""}}`;
}

// ─── QC ──────────────────────────────────────────────────────────────────────
// Vise les FAUX signaux d'avis (revendiquer des avis/notes que Skoria n'a pas),
// pas la mention générique du concept d'avis (légitime sur les pages "avis ...").
const BLACKLIST = [
  /nos avis/iu, /avis (vérifiés|certifiés|clients de skoria)/iu,
  /not[ée] \d/iu, /étoile/iu, /témoignage/iu,
  /notre cabinet/iu, /nos experts?-comptables/iu, /\bhttps?:/iu, /\]\(/u,
];

function sectionWords(s: GenSection): number {
  let text = `${s.title ?? ""} ${s.body ?? ""}`;
  if (Array.isArray(s.items)) {
    for (const it of s.items) {
      if (typeof it === "string") text += ` ${it}`;
      else if (it && typeof it === "object") text += ` ${Object.values(it).join(" ")}`;
    }
  }
  return text.split(/\s+/u).filter(Boolean).length;
}

function qcPayload(
  payload: GenPayload,
  blueprint: BlockSpec[],
  minWords: number,
): string | null {
  if (!payload?.sections || !Array.isArray(payload.sections)) return "sections manquantes";
  if (payload.sections.length !== blueprint.length) {
    return `attendu ${blueprint.length} sections, reçu ${payload.sections.length}`;
  }
  for (let i = 0; i < blueprint.length; i++) {
    if (payload.sections[i].section_type !== blueprint[i].type) {
      return `section ${i + 1} : type ${payload.sections[i].section_type} ≠ ${blueprint[i].type}`;
    }
  }
  const total = payload.sections.reduce((s, x) => s + sectionWords(x), 0);
  if (total < minWords) return `${total} mots < ${minWords}`;
  const fullText = JSON.stringify(payload);
  for (const re of BLACKLIST) {
    if (re.test(fullText)) return `blacklist : ${re}`;
  }
  const faq = payload.sections.find((s) => s.section_type === "Faq");
  if (faq && (!Array.isArray(faq.items) || (faq.items as unknown[]).length < 2)) {
    return "Faq sans items";
  }
  return null;
}

/** Jaccard 5-grams sur l'intro — dédup intra-lot. */
function fiveGrams(text: string): Set<string> {
  const words = text.toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, "").split(/\s+/u).filter(Boolean);
  const grams = new Set<string>();
  for (let i = 0; i + 5 <= words.length; i++) grams.add(words.slice(i, i + 5).join(" "));
  return grams;
}
function jaccard(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 || b.size === 0) return 0;
  let inter = 0;
  for (const g of a) if (b.has(g)) inter++;
  return inter / (a.size + b.size - inter);
}

// ─── Main ────────────────────────────────────────────────────────────────────
async function main(): Promise<void> {
  const db = new Database(DB_PATH);
  db.pragma("journal_mode = WAL");

  const cityStmt = db.prepare(
    "SELECT slug, name, code_insee, population, department_code, department_name FROM cities_official WHERE slug = ? ORDER BY population DESC LIMIT 1",
  );
  const getCity = (slug: string): CityLite | undefined => cityStmt.get(slug) as CityLite | undefined;
  const professionStmt = db.prepare("SELECT name, description, obligations FROM professions WHERE slug = ?");
  const secteurStmt = db.prepare("SELECT name, description FROM secteurs WHERE slug = ?");
  const tiersRows = db.prepare("SELECT name, from_price, target_audience FROM pricing_tiers ORDER BY id").all() as
    { name: string; from_price: string; target_audience: string | null }[];

  const keywords = (db
    .prepare("SELECT slug, cluster_slug, label, volume, intent, disposition FROM keyword_pages WHERE disposition = 'enrich' ORDER BY volume DESC")
    .all() as KwRow[])
    .filter((kw) => !ONLY_SLUG || kw.slug === ONLY_SLUG);

  // Contexte par keyword (parse géo + classe + thème).
  const contexts = keywords.map((kw) => {
    const tokens = slugTokens(kw.slug).filter((t) => !/^\d{2,5}$/u.test(t));
    const geo = resolveGeoKeywordSync(tokens.join("-"), getCity);
    const cls = classifyKeyword(kw, geo);
    const theme = geo ? resolveTheme(geo.themeTokens) : null;
    return { kw, geo, cls, theme };
  });

  // ─── PASSE META (déterministe, toutes les pages enrich) ───
  const upsertSeo = db.prepare(`
    INSERT INTO seo_overrides (route, slug, meta_title, meta_description, h1, key_takeaways, generated_at, generated_by_model)
    VALUES ('ressources', @slug, @title, @description, @h1, @takeaways, datetime('now'), '${MODEL_TAG}')
    ON CONFLICT(route, slug) DO UPDATE SET
      meta_title = excluded.meta_title,
      meta_description = excluded.meta_description,
      h1 = excluded.h1,
      key_takeaways = COALESCE(excluded.key_takeaways, seo_overrides.key_takeaways),
      generated_at = excluded.generated_at,
      generated_by_model = excluded.generated_by_model
  `);

  let metaWritten = 0;
  const metaTx = db.transaction(() => {
    for (const { kw, geo, cls, theme } of contexts) {
      // Pas de count de cabinets dans les meta STOCKÉES : le count live
      // (Supabase) peut différer — le fallback runtime l'affiche, pas l'override.
      const meta = buildKeywordMeta(kw, cls, {
        ...(geo && { cityName: geo.city.name, departmentName: geo.city.department_name }),
        ...(theme && { themeLabel: theme.label }),
      });
      if (COMMIT) {
        upsertSeo.run({ slug: kw.slug, title: meta.title, description: meta.description, h1: meta.h1, takeaways: null });
      }
      metaWritten++;
    }
  });
  metaTx();
  console.log(`[meta] ${metaWritten} seo_overrides ${COMMIT ? "écrits" : "calculés (dry-run)"}`);
  if (META_ONLY) { db.close(); return; }

  // ─── Sélection de la vague ───
  if (![1, 2, 3].includes(WAVE) && !ONLY_SLUG) {
    console.log("Préciser --wave 1|2|3 (ou --slug) pour la génération. Passe meta seule : --meta-only.");
    db.close();
    return;
  }
  const inWave = (c: (typeof contexts)[number]): boolean => {
    if (ONLY_SLUG) return true;
    if (WAVE === 1) return c.kw.volume >= 1000 || c.cls === "geo-theme" || c.cls === "geo";
    if (WAVE === 2) return c.kw.volume >= 100 && c.kw.volume < 1000 && c.cls !== "geo-theme" && c.cls !== "geo";
    return c.kw.volume < 100 && c.cls !== "geo-theme" && c.cls !== "geo";
  };

  const doneStmt = db.prepare(
    "SELECT COUNT(*) AS c FROM page_meta WHERE route='ressources' AND slug = ? AND pipeline_run_id LIKE 'keyword-lp-%'",
  );
  let batch = contexts.filter(inWave);
  if (!FORCE) {
    batch = batch.filter((c) => (doneStmt.get(c.kw.slug) as { c: number }).c === 0);
  }
  if (LIMIT > 0) batch = batch.slice(0, LIMIT);

  const tier: "pro" | "flash" = MODEL_OVERRIDE ?? (WAVE === 1 ? "pro" : "flash");
  // Seuil proportionnel au blueprint (les recettes navigational/géo font 4
  // sections, pas 5) : ~110 mots/section en W1, ~80 ensuite.
  const wordsPerSection = WAVE === 1 ? 110 : 80;
  console.log(`[gen] wave=${WAVE || "slug"} tier=${tier} pages=${batch.length} mots/section=${wordsPerSection} ${COMMIT ? "COMMIT" : "DRY-RUN"}`);
  if (batch.length === 0) { db.close(); return; }
  const apiKey = getApiKey();

  // Statements d'écriture.
  const delSections = db.prepare(
    `DELETE FROM page_sections WHERE route='ressources' AND slug = ? AND generated_by_model = '${MODEL_TAG}'`,
  );
  const insSection = db.prepare(`
    INSERT INTO page_sections (route, slug, section_type, section_order, title, body, items, citations, generated_at, generated_by_model)
    VALUES ('ressources', @slug, @type, @ord, @title, @body, @items, NULL, datetime('now'), '${MODEL_TAG}')
    ON CONFLICT(route, slug, section_order) DO UPDATE SET
      section_type = excluded.section_type, title = excluded.title, body = excluded.body,
      items = excluded.items, generated_at = excluded.generated_at, generated_by_model = excluded.generated_by_model
  `);
  const upsertMeta = db.prepare(`
    INSERT INTO page_meta (route, slug, publish_status, published_at, pipeline_run_id, reviewed_at)
    VALUES ('ressources', @slug, 'published', datetime('now'), @runId, datetime('now'))
    ON CONFLICT(route, slug) DO UPDATE SET
      publish_status = 'published', published_at = excluded.published_at,
      pipeline_run_id = excluded.pipeline_run_id, reviewed_at = excluded.reviewed_at
  `);

  // Faits réglementaires par cluster (vérifiés sur les sources officielles au
  // moment de l'ajout — re-vérifier avant toute régénération massive).
  const CLUSTER_FACTS: Record<string, string[]> = {
    "facturation-electronique": [
      "Réforme de la facturation électronique (validé le 2026-07-12 sur service-public.gouv.fr) : obligation de RÉCEPTION pour TOUTES les entreprises assujetties à la TVA au 1er septembre 2026 ; obligation d'ÉMISSION au 1er septembre 2026 pour les grandes entreprises et les ETI, au 1er septembre 2027 pour les PME, TPE et micro-entreprises.",
      "Chaque entreprise doit choisir une plateforme agréée (PDP — plateforme de dématérialisation partenaire) pour émettre/recevoir ses factures ; la liste officielle des PDP immatriculées est publiée et mise à jour sur impots.gouv.fr (immatriculation « sous réserve » avant les tests finaux).",
      "Le PPF (portail public de facturation) a été recentré fin 2024 : il n'offre plus de service gratuit d'échange de factures et devient l'annuaire central des destinataires + le concentrateur des données pour l'administration. Chorus Pro reste la plateforme du B2G (facturation au secteur public).",
      "Formats socle de la facture électronique : Factur-X (mixte PDF + XML), UBL et CII. Un PDF simple envoyé par e-mail n'est PAS une facture électronique au sens de la réforme.",
      "Le e-reporting (transmission des données de transaction — B2C, international — et des données de paiement) suit le même calendrier que la facturation électronique et concerne les assujettis à la TVA établis en France.",
      "Sanctions prévues : 15 € par facture non émise au format électronique (plafond 15 000 € par an) et 250 € par transmission e-reporting manquante (plafond 15 000 € par an) — formuler comme « prévues par la loi de finances », sans conseil individualisé.",
      "L'expert-comptable joue un rôle central : choix de la plateforme, mise en conformité des mentions, raccordement des outils — c'est un critère de comparaison des cabinets en 2026.",
    ],
  };

  // Grounding facts par page.
  const buildFacts = (c: (typeof contexts)[number]): string[] => {
    const facts: string[] = [
      "Skoria est un comparateur indépendant et gratuit d'experts-comptables, fondé sur des sources administratives publiques.",
      `Grille tarifaire indicative des offres comparées : ${tiersRows.map((t) => `${t.name} ${t.from_price}${t.target_audience ? ` (${t.target_audience})` : ""}`).join(" · ")}.`,
      "Un expert-comptable inscrit est le seul habilité à tenir la comptabilité de tiers ; la profession est réglementée (ordonnance de 1945, tutelle du ministère de l'Économie).",
    ];
    if (c.geo) {
      facts.push(
        `Ville : ${c.geo.city.name}${c.geo.city.department_name ? ` (${c.geo.city.department_name})` : ""}, ${c.geo.city.population.toLocaleString("fr-FR")} habitants. Ne cite AUCUN nombre de cabinets : la page l'affiche dynamiquement.`,
      );
    }
    if (c.theme?.href) {
      const m = c.theme.href.match(/^\/(professions|secteurs)\/(.+)$/u);
      if (m) {
        const row = m[1] === "professions"
          ? (professionStmt.get(m[2]) as { name: string; description: string | null; obligations: string | null } | undefined)
          : (secteurStmt.get(m[2]) as { name: string; description: string | null } | undefined);
        if (row?.description) facts.push(`Profil visé (${row.name}) : ${row.description}`);
        if (row && "obligations" in row && row.obligations) facts.push(`Obligations connues du profil : ${row.obligations}`);
      }
    }
    if (c.cls === "informational") {
      facts.push(
        "Cursus expert-comptable : DCG (bac+3), DSCG (bac+5), stage professionnel de 3 ans, puis DEC (diplôme d'expertise comptable).",
        "Convention collective des cabinets d'experts-comptables et de commissaires aux comptes : IDCC 787.",
        "Les salaires de la profession varient fortement selon l'expérience, la région et la taille du cabinet — toujours les présenter en fourchettes indicatives, jamais en montant précis.",
      );
    }
    const clusterFacts = CLUSTER_FACTS[c.kw.cluster_slug];
    if (clusterFacts) facts.push(...clusterFacts);
    return facts;
  };

  // Génération avec pool de concurrence.
  const acceptedIntros: Set<string>[] = [];
  let ok = 0; let failed = 0;
  const issues: string[] = [];
  const modelsUsed = new Set<string>();

  const processOne = async (c: (typeof contexts)[number]): Promise<void> => {
    const variants = BLUEPRINTS[c.cls] ?? BLUEPRINTS.commercial;
    const blueprint = variants[hashVariant(c.kw.slug, variants.length)];
    const withTakeaways = hashVariant(c.kw.slug, 3) > 0;
    const facts = buildFacts(c);
    const minWords = Math.max(350, blueprint.length * wordsPerSection);

    for (let attempt = 0; attempt < 2; attempt++) {
      const prompt =
        buildPrompt(c.kw, c.cls, blueprint, facts, withTakeaways) +
        (attempt > 0 ? "\n\nIMPORTANT : reformule avec un angle et un vocabulaire sensiblement différents." : "");
      const temperature = 0.8 + attempt * 0.1;
      try {
        const { model, text } = await callGeminiWithRetry(apiKey, tier, prompt, temperature);
        modelsUsed.add(model);
        const payload = JSON.parse(text) as GenPayload;
        const qcError = qcPayload(payload, blueprint, minWords);
        if (qcError) {
          if (attempt === 0) continue;
          failed++; issues.push(`${c.kw.slug}: QC ${qcError}`);
          return;
        }
        // Dédup intra-lot sur l'intro.
        const introGrams = fiveGrams(payload.sections[0].body ?? "");
        const dup = acceptedIntros.some((g) => jaccard(g, introGrams) > 0.55);
        if (dup && attempt === 0) continue;
        acceptedIntros.push(introGrams);

        if (COMMIT) {
          const tx = db.transaction(() => {
            delSections.run(c.kw.slug);
            payload.sections.forEach((s, i) => {
              insSection.run({
                slug: c.kw.slug,
                type: s.section_type,
                ord: i + 1,
                title: s.title ?? null,
                body: s.body ?? null,
                items: s.items != null ? JSON.stringify(s.items) : null,
              });
            });
            if (withTakeaways && Array.isArray(payload.key_takeaways) && payload.key_takeaways.length > 0) {
              const meta = buildKeywordMeta(c.kw, c.cls, {
                ...(c.geo && { cityName: c.geo.city.name, departmentName: c.geo.city.department_name }),
                ...(c.theme && { themeLabel: c.theme.label }),
              });
              upsertSeo.run({
                slug: c.kw.slug, title: meta.title, description: meta.description, h1: meta.h1,
                takeaways: JSON.stringify(payload.key_takeaways.slice(0, 4)),
              });
            }
            upsertMeta.run({ slug: c.kw.slug, runId: `keyword-lp-w${WAVE || 0}` });
          });
          tx();
        }
        ok++;
        console.log(`  ✓ ${c.kw.slug} (${c.cls}, ${payload.sections.length} sections, ${payload.sections.reduce((s, x) => s + sectionWords(x), 0)} mots, ${model})`);
        return;
      } catch (err) {
        if (attempt === 0) continue;
        failed++; issues.push(`${c.kw.slug}: ${(err as Error).message.slice(0, 160)}`);
        return;
      }
    }
  };

  // Pool séquentiel par tranches de CONCURRENCY.
  for (let i = 0; i < batch.length; i += CONCURRENCY) {
    await Promise.all(batch.slice(i, i + CONCURRENCY).map(processOne));
  }

  console.log(`\n[gen] terminé : ok=${ok} failed=${failed} models=${[...modelsUsed].join(",")}`);
  if (issues.length) { console.log("  Issues:"); for (const s of issues) console.log(`   - ${s}`); }
  db.close();
  if (ok === 0 && batch.length > 0) process.exit(1);
}

main().catch((err) => {
  console.error("[generate-keyword-lp-content] FATAL", err);
  process.exit(1);
});
