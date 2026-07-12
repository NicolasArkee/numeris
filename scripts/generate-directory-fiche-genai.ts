/**
 * scripts/generate-directory-fiche-genai.ts
 *
 * Génération genAI du contenu des fiches annuaire (remédiation thin content :
 * les fiches partagent ~96 % de leur texte, et les profile_summary "inferred"
 * du pilote sont eux-mêmes templated).
 *
 * Deux pistes par établissement :
 *   A. site web connu (fact `website`) ou découvert (website-discovery WIP)
 *      → crawl réel (website-enrichment WIP, robots.txt respecté) → Gemini
 *      groundé sur les pages : résumé éditorial unique + classification
 *      services/logiciels validée contre le knowledge graph → facts sourcés.
 *   B. sans site → record inféré (inferred-enrichment WIP) dont le résumé
 *      templated est remplacé par un texte Gemini unique groundé sur les
 *      données administratives + contexte local. Ton "à confirmer" conservé.
 *   La piste A écrase B naturellement (confidence 88 > 58,
 *   findDirectoryProfileSummary prend le max).
 *
 * Sortie : data/genai-fiches/{cityCode}.json au format WebsiteEnrichmentRecord
 * — consommé par les importeurs EXISTANTS :
 *   scripts/import-directory-enrichment.ts          (SQLite canonique)
 *   scripts/import-directory-enrichment-supabase.ts (prod)
 * (chaînés automatiquement avec --import / --import-supabase).
 *
 * Reprise : un fact profile_summary dont metadata_json contient
 * "genai-fiche-v1" marque l'établissement comme déjà traité (skip sauf --force).
 *
 * Usage :
 *   npx tsx scripts/generate-directory-fiche-genai.ts --city-code=44109 [--limit=20]
 *        [--track=a|b|both] [--no-discovery] [--concurrency=4] [--force]
 *        [--import] [--import-supabase] [--model=flash|pro]
 *   npx tsx scripts/generate-directory-fiche-genai.ts --all-cities [--import --import-supabase]
 *
 * GEMINI_API_KEY : process.env ou /Users/nicolas/ARKEE_ORG/.env.
 */
import Database from "better-sqlite3";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { discoverDirectoryWebsite } from "../src/libs/directory/website-discovery";
import {
  buildDirectoryWebsiteEnrichment,
  type WebsiteEnrichmentFact,
  type WebsiteEnrichmentRecord,
} from "../src/libs/directory/website-enrichment";
import {
  buildDirectoryInferredEnrichmentRecord,
} from "../src/libs/directory/inferred-enrichment";
import {
  buildServiceFactMetadata,
  getDirectoryServiceKnowledgeGraph,
  metadataToJson,
  validateDirectoryAgentClassification,
  type DirectoryAgentClassification,
} from "../src/libs/directory/service-knowledge-graph";
import { captureWebsiteScreenshot, isScreenshotCapable } from "./lib-directory-screenshot";

// ─── CLI ─────────────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const flag = (name: string): string | undefined => {
  const withEq = args.find((a) => a.startsWith(`--${name}=`));
  if (withEq) return withEq.split("=").slice(1).join("=");
  const i = args.indexOf(`--${name}`);
  if (i >= 0 && args[i + 1] && !args[i + 1].startsWith("--")) return args[i + 1];
  return undefined;
};
const has = (name: string): boolean => args.some((a) => a === `--${name}` || a.startsWith(`--${name}=`));

const CITY_CODE = flag("city-code");
const ALL_CITIES = has("all-cities");
const NO_SCREENSHOTS = has("no-screenshots");
/** Cap global de fiches générées sur ce run (0 = illimité) — pilotage par vague. */
const MAX_FICHES = Number(flag("max-fiches") ?? 0);
const LIMIT = Number(flag("limit") ?? 0);
const TRACK = (flag("track") ?? "both") as "a" | "b" | "both";
const NO_DISCOVERY = has("no-discovery");
const CONCURRENCY = Number(flag("concurrency") ?? 4);
const FORCE = has("force");
const DO_IMPORT = has("import");
const DO_IMPORT_SUPABASE = has("import-supabase");
const MODEL_TIER = (flag("model") ?? "flash") as "flash" | "pro";

const DB_PATH = flag("db") ?? path.join(process.cwd(), "numeris.db");
const OUT_DIR = flag("out-dir") ?? path.join(process.cwd(), "data", "genai-fiches");
const ARKEE_ENV_PATH = "/Users/nicolas/ARKEE_ORG/.env";
const GENERATOR_TAG = "genai-fiche-v1";

const MODELS = {
  flash: { primary: "gemini-3-flash-preview", fallback: "gemini-2.5-flash" },
  pro: { primary: "gemini-3-pro-preview", fallback: "gemini-2.5-pro" },
} as const;

// ─── Sémaphore DISCOVERY ─────────────────────────────────────────────────────
// La découverte lance ~12 candidats en parallèle PAR cabinet avec un timeout
// de 5 s armé AVANT le fetch. Deux pièges symétriques déjà rencontrés :
//   - fetch nu à concurrence 16 → ~192 sockets/DNS simultanés → saturation
//     (Paris 3/5368 au lieu de ~11 %) ;
//   - gate par-fetch → les fetchs queuent pendant que leur timeout expire →
//     0 hit partout.
// Solution : borner le nombre d'appels discoverDirectoryWebsite SIMULTANÉS
// (chacun garde ses 12 fetchs sans file d'attente interne) : 4 × 12 = 48
// sockets max, aucun timeout consommé en file.
const DISCOVERY_MAX = 4;
let activeDiscovery = 0;
const discoveryWaiters: (() => void)[] = [];
async function acquireDiscoverySlot(): Promise<void> {
  if (activeDiscovery < DISCOVERY_MAX) { activeDiscovery++; return; }
  await new Promise<void>((resolve) => discoveryWaiters.push(resolve));
  activeDiscovery++;
}
function releaseDiscoverySlot(): void {
  activeDiscovery--;
  discoveryWaiters.shift()?.();
}

// ─── Gemini (pattern scripts existants) ─────────────────────────────────────
function loadEnv(envPath: string): Record<string, string> {
  const out: Record<string, string> = {};
  if (!fs.existsSync(envPath)) return out;
  for (const line of fs.readFileSync(envPath, "utf-8").split("\n")) {
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
function getApiKey(): string {
  const k = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY
    || loadEnv(ARKEE_ENV_PATH).GEMINI_API_KEY || loadEnv(ARKEE_ENV_PATH).GOOGLE_API_KEY;
  if (!k) throw new Error(`Missing GEMINI_API_KEY (process.env et ${ARKEE_ENV_PATH})`);
  return k;
}
function stripJsonFence(text: string): string {
  let t = text.trim();
  if (t.startsWith("```")) t = t.replace(/^```(?:json)?\s*/iu, "").replace(/```\s*$/iu, "");
  return t.trim();
}
async function callGemini(apiKey: string, prompt: string, temperature: number): Promise<string> {
  const { primary, fallback } = MODELS[MODEL_TIER];
  let model = primary;
  for (let attempt = 0; attempt < 4; attempt++) {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: { temperature, topP: 0.95, responseMimeType: "application/json" },
        }),
      },
    );
    if (res.ok) {
      const json = (await res.json()) as { candidates?: { content?: { parts?: { text?: string }[] } }[] };
      const text = json.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
      if (text) return stripJsonFence(text);
      throw new Error("Empty Gemini response");
    }
    if (res.status === 404 && model === primary) { model = fallback; continue; }
    if (res.status === 429 || res.status >= 500) {
      await new Promise((r) => setTimeout(r, 2500 * 2 ** attempt));
      continue;
    }
    throw new Error(`Gemini ${model} status=${res.status}: ${(await res.text()).slice(0, 200)}`);
  }
  throw new Error("Gemini: retries épuisés");
}

// ─── Prompts ─────────────────────────────────────────────────────────────────
const kg = getDirectoryServiceKnowledgeGraph();
const SERVICE_IDS = kg.serviceFamilies.map((s) => s.id);
const SOFTWARE_IDS = kg.specificities.software;

interface EstabRow {
  establishment_id: number;
  cabinet_id: number;
  siret: string;
  name: string;
  address_line1: string | null;
  postal_code: string | null;
  city_name: string;
  naf_code: string | null;
  legal_form: string | null;
}

interface CityContext {
  name: string;
  department_name: string | null;
  population: number;
  activeCount: number;
}

const COMMON_RULES = `RÈGLES ABSOLUES (fiche d'une entreprise réelle — prudence maximale) :
- Ton strictement FACTUEL et NEUTRE : aucune évaluation ("excellent", "réputé", "meilleur"), aucun classement, aucune note, aucun avis, aucun témoignage.
- N'invente RIEN : pas de téléphone, email, site, nom de personne, tarif, effectif, date de création, clientèle ou spécialité non présents dans les données fournies.
- Pas de promesse au nom du cabinet. Skoria est un comparateur indépendant tiers.
- Texte brut uniquement : pas de liens, pas de markdown, pas de listes.
- Français impeccable, phrases variées — le texte doit être UNIQUE, pas une formule générique réutilisable telle quelle pour un autre cabinet.`;

function buildPromptTrackA(
  row: EstabRow,
  ctx: CityContext,
  pages: { url: string; role: string; title: string | null; text: string }[],
): string {
  const corpus = pages
    .map((p) => `[${p.role}] ${p.title ?? ""}\n${p.text.slice(0, 2200)}`)
    .join("\n\n---\n\n")
    .slice(0, 9000);
  return `Tu rédiges la présentation éditoriale d'une fiche annuaire Skoria (comparateur indépendant d'experts-comptables) pour le cabinet "${row.name}" à ${ctx.name}${ctx.department_name ? ` (${ctx.department_name})` : ""}.

DONNÉES ADMINISTRATIVES (source publique) : SIRET ${row.siret}${row.address_line1 ? `, adresse ${row.address_line1}, ${row.postal_code ?? ""} ${row.city_name}` : ""}${row.naf_code ? `, code NAF ${row.naf_code}` : ""}.

CONTENU DU SITE OFFICIEL DU CABINET (seule source autorisée pour toute affirmation sur ses services, son équipe, son positionnement) :
${corpus}

${COMMON_RULES}
- Chaque affirmation sur le cabinet doit être DIRECTEMENT appuyée par le contenu du site ci-dessus. Si le site ne dit rien sur un sujet, ne rien affirmer.
- Résumé de 110 à 170 mots, 2 paragraphes maximum, qui aide un dirigeant à comprendre ce que ce cabinet propose et à qui il s'adresse.

CLASSIFICATION (uniquement si le contenu du site l'appuie explicitement) :
- serviceIds parmi : ${JSON.stringify(SERVICE_IDS)}
- softwareIds parmi : ${JSON.stringify(SOFTWARE_IDS)} (uniquement si l'outil est cité sur le site)

Output JSON strict :
{"summary":"...","serviceIds":[],"softwareIds":[],"evidence":{"<serviceId>":"citation courte du site qui justifie ce service"}}`;
}

function buildPromptTrackB(row: EstabRow, ctx: CityContext, variant: number): string {
  const angles = [
    "Commence par situer le cabinet dans sa ville, puis explique ce qu'un dirigeant peut vérifier sur cette fiche.",
    "Commence par la donnée administrative (activité, implantation), puis ce que la fiche permet de préparer avant un premier contact.",
    "Commence par le besoin type d'un dirigeant local, puis présente la fiche et ses limites de vérification.",
  ];
  return `Tu rédiges la présentation d'une fiche annuaire Skoria (comparateur indépendant d'experts-comptables) pour "${row.name}", établissement d'expertise comptable recensé à ${ctx.name}${ctx.department_name ? ` (${ctx.department_name})` : ""} à partir de SOURCES ADMINISTRATIVES PUBLIQUES UNIQUEMENT (pas de site web connu pour ce cabinet).

DONNÉES DISPONIBLES (seule source autorisée) :
- Nom : ${row.name}
- SIRET : ${row.siret}${row.legal_form && !/^\d+$/u.test(row.legal_form) ? `\n- Forme juridique : ${row.legal_form}` : ""}
- Adresse : ${row.address_line1 ?? "non précisée"}, ${row.postal_code ?? ""} ${row.city_name}
- Activité : expertise comptable (NAF ${row.naf_code ?? "69.20Z"})
- Contexte local : ${ctx.name} compte ${ctx.population.toLocaleString("fr-FR")} habitants${ctx.department_name ? ` dans le département ${ctx.department_name}` : ""} et ${ctx.activeCount} établissement${ctx.activeCount > 1 ? "s" : ""} d'expertise comptable recensé${ctx.activeCount > 1 ? "s" : ""}.

${COMMON_RULES}
- Le texte DOIT rappeler que les informations proviennent de sources administratives publiques et restent à confirmer directement auprès du cabinet (statut professionnel non vérifié par Skoria à ce stade).
- Ne liste PAS de services comme acquis : tu peux évoquer les besoins fréquents (tenue comptable, fiscalité, paie, création) uniquement comme des points à confirmer avec le cabinet.
- ${angles[variant % angles.length]}
- Résumé de 90 à 140 mots, 1 à 2 paragraphes.

Output JSON strict : {"summary":"..."}`;
}

// ─── QC ──────────────────────────────────────────────────────────────────────
const BLACKLIST = [
  /meilleur/iu, /n°\s?1/iu, /leader/iu, /réputé/iu, /excellent/iu,
  /avis client/iu, /not[ée] \d/iu, /étoile/iu, /témoignage/iu,
  /\d+\s?€/u, /\bhttps?:/iu, /nos experts/iu, /notre équipe/iu,
];

function qcSummary(summary: string, min: number, max: number): string | null {
  const words = summary.split(/\s+/u).filter(Boolean).length;
  if (words < min) return `${words} mots < ${min}`;
  if (words > max + 60) return `${words} mots > ${max + 60}`;
  for (const re of BLACKLIST) if (re.test(summary)) return `blacklist ${re}`;
  return null;
}

function fiveGrams(text: string): Set<string> {
  const w = text.toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, "").split(/\s+/u).filter(Boolean);
  const g = new Set<string>();
  for (let i = 0; i + 5 <= w.length; i++) g.add(w.slice(i, i + 5).join(" "));
  return g;
}
function jaccard(a: Set<string>, b: Set<string>): number {
  if (!a.size || !b.size) return 0;
  let inter = 0;
  for (const x of a) if (b.has(x)) inter++;
  return inter / (a.size + b.size - inter);
}

// ─── Main ────────────────────────────────────────────────────────────────────
async function main(): Promise<void> {
  const db = new Database(DB_PATH, { readonly: true });
  const apiKey = getApiKey();
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const cityRows = ALL_CITIES
    ? (db.prepare(`
        SELECT e.city_code_insee AS code, COUNT(*) AS n FROM directory_establishments e
        JOIN directory_cabinets c ON c.id = e.cabinet_id
        WHERE e.is_active = 1 AND c.is_active = 1 AND e.city_code_insee IS NOT NULL
        GROUP BY 1 ORDER BY n DESC`).all() as { code: string; n: number }[])
    : CITY_CODE
      ? [{ code: CITY_CODE, n: 0 }]
      : [];
  if (cityRows.length === 0) {
    console.log("Préciser --city-code=<INSEE> ou --all-cities.");
    db.close();
    return;
  }

  const estabStmt = db.prepare(`
    SELECT e.id AS establishment_id, c.id AS cabinet_id, e.siret,
           COALESCE(c.display_name, c.legal_name) AS name,
           e.address_line1, e.postal_code, e.city_name,
           c.naf_code, c.legal_form
    FROM directory_establishments e
    JOIN directory_cabinets c ON c.id = e.cabinet_id
    WHERE e.is_active = 1 AND c.is_active = 1 AND e.city_code_insee = ?
    ORDER BY e.siret`);
  const cityStmt = db.prepare(
    "SELECT name, department_name, population FROM cities_official WHERE code_insee = ?",
  );
  const websiteFactStmt = db.prepare(`
    SELECT value FROM directory_profile_facts
    WHERE establishment_id = ? AND fact_type = 'website' AND is_displayable = 1
    ORDER BY confidence DESC LIMIT 1`);
  // Marqueur de reprise PAR PISTE : une passe --track=a doit pouvoir upgrader
  // une fiche déjà couverte en piste B (le summary "website" remplace
  // l'"inferred"), mais jamais refaire une fiche déjà sourcée site web.
  const doneStmt = TRACK === "a"
    ? db.prepare(`
        SELECT COUNT(*) AS c FROM directory_profile_facts
        WHERE establishment_id = ? AND fact_type = 'profile_summary'
          AND COALESCE(metadata_json, '') LIKE '%${GENERATOR_TAG}%'
          AND COALESCE(metadata_json, '') LIKE '%"track":"website"%'`)
    : db.prepare(`
        SELECT COUNT(*) AS c FROM directory_profile_facts
        WHERE establishment_id = ? AND fact_type = 'profile_summary'
          AND COALESCE(metadata_json, '') LIKE '%${GENERATOR_TAG}%'`);

  let totalOk = 0; let totalFail = 0; let totalSkip = 0; let trackACount = 0;
  const globalIssues: string[] = [];

  // Cache des découvertes infructueuses : évite de re-scanner (~12 fetches)
  // les cabinets sans site à chaque reprise du batch. Flush par ville.
  const missCachePath = path.join(OUT_DIR, "discovery-miss.json");
  const discoveryMiss = new Set<string>(
    fs.existsSync(missCachePath)
      ? (JSON.parse(fs.readFileSync(missCachePath, "utf-8")) as string[])
      : [],
  );
  const flushMissCache = () =>
    fs.writeFileSync(missCachePath, JSON.stringify([...discoveryMiss]), "utf-8");

  for (const city of cityRows) {
    if (MAX_FICHES > 0 && totalOk >= MAX_FICHES) {
      console.log(`\n[genai-fiches] cap --max-fiches=${MAX_FICHES} atteint — arrêt.`);
      break;
    }
    const cityInfo = cityStmt.get(city.code) as { name: string; department_name: string | null; population: number } | undefined;
    let estabs = estabStmt.all(city.code) as EstabRow[];
    if (!FORCE) {
      estabs = estabs.filter((e) => (doneStmt.get(e.establishment_id) as { c: number }).c === 0);
    }
    if (LIMIT > 0) estabs = estabs.slice(0, LIMIT);
    if (estabs.length === 0) continue;

    const ctx: CityContext = {
      name: cityInfo?.name ?? estabs[0].city_name,
      department_name: cityInfo?.department_name ?? null,
      population: cityInfo?.population ?? 0,
      activeCount: (estabStmt.all(city.code) as EstabRow[]).length,
    };
    console.log(`\n[${city.code}] ${ctx.name} — ${estabs.length} fiche(s) à générer`);

    const records: (WebsiteEnrichmentRecord | ReturnType<typeof buildDirectoryInferredEnrichmentRecord>)[] = [];
    const acceptedGrams: Set<string>[] = [];
    let cityOk = 0; let cityFail = 0;

    const processOne = async (row: EstabRow, idx: number): Promise<void> => {
      if (MAX_FICHES > 0 && totalOk >= MAX_FICHES) return;
      try {
        // ─── Résolution site web (piste A) ───
        let websiteUrl: string | null = null;
        if (TRACK !== "b") {
          websiteUrl = (websiteFactStmt.get(row.establishment_id) as { value: string } | undefined)?.value ?? null;
          if (!websiteUrl && !NO_DISCOVERY && !discoveryMiss.has(row.siret)) {
            await acquireDiscoverySlot();
            let discovery;
            try {
              discovery = await discoverDirectoryWebsite(
                { siret: row.siret, cabinetName: row.name, cityName: ctx.name,
                  addressLine1: row.address_line1 ?? undefined, postalCode: row.postal_code ?? undefined },
              );
            } finally {
              releaseDiscoverySlot();
            }
            if (discovery.accepted) websiteUrl = discovery.accepted.url;
            else discoveryMiss.add(row.siret);
          }
        }

        // ─── Piste A : crawl + genAI sourcé ───
        if (websiteUrl && TRACK !== "b") {
          let pages: { url: string; role: string; title: string | null; text: string }[] = [];
          const record = await buildDirectoryWebsiteEnrichment(
            { siret: row.siret, cabinetName: row.name, cityName: ctx.name, websiteUrl },
            { onPages: (p) => { pages = p; } },
          );
          if (pages.length > 0) {
            const raw = await callGemini(apiKey, buildPromptTrackA(row, ctx, pages), 0.75);
            const parsed = JSON.parse(raw) as {
              summary?: string; serviceIds?: string[]; softwareIds?: string[];
              evidence?: Record<string, string>;
            };
            const qc = qcSummary(parsed.summary ?? "", 90, 190);
            if (qc) throw new Error(`QC A: ${qc}`);
            // Classification filtrée sur les IDs connus puis validée.
            const classification: DirectoryAgentClassification = {
              serviceIds: (parsed.serviceIds ?? []).filter((s) => SERVICE_IDS.includes(s)),
              softwareIds: (parsed.softwareIds ?? []).filter((s) => SOFTWARE_IDS.includes(s)),
            };
            validateDirectoryAgentClassification(classification);
            // Remplace le résumé templated par le texte genAI.
            const facts = record.facts.filter((f) => f.fact_type !== "profile_summary");
            facts.push({
              fact_type: "profile_summary",
              label: "Présentation éditoriale",
              value: parsed.summary!.trim(),
              confidence: 88,
              is_displayable: true,
              metadata_json: JSON.stringify({ generator: GENERATOR_TAG, track: "website" }),
            });
            // Facts service issus de la classification LLM absents du crawl regex.
            for (const sid of classification.serviceIds ?? []) {
              const family = kg.serviceFamilies.find((f) => f.id === sid)!;
              if (facts.some((f) => f.fact_type === "service" && f.value === family.factValue)) continue;
              facts.push({
                fact_type: "service",
                label: "Service identifié sur le site",
                value: family.factValue,
                confidence: 82,
                is_displayable: true,
                metadata_json: metadataToJson(buildServiceFactMetadata({
                  service: family,
                  displayMode: "sourced",
                  evidenceSnippets: parsed.evidence?.[sid] ? [parsed.evidence[sid].slice(0, 240)] : [],
                  sourcePageUrls: [record.source.source_url],
                  confidenceReason: `${GENERATOR_TAG}: classification LLM appuyée par le contenu du site`,
                })),
              });
            }
            for (const soft of classification.softwareIds ?? []) {
              if (facts.some((f) => f.fact_type === "software" && f.value === soft)) continue;
              facts.push({
                fact_type: "software", label: "Outil cité sur le site", value: soft,
                confidence: 78, is_displayable: true,
                metadata_json: JSON.stringify({ generator: GENERATOR_TAG }),
              });
            }
            // Capture d'écran du site → Supabase Storage → fact preview.
            if (!NO_SCREENSHOTS && isScreenshotCapable()
              && !facts.some((f) => f.fact_type === "source_preview_image")) {
              const previewUrl = await captureWebsiteScreenshot(record.source.source_url, row.siret);
              if (previewUrl) {
                facts.push({
                  fact_type: "source_preview_image",
                  label: "Aperçu du site officiel",
                  value: previewUrl,
                  confidence: 80,
                  is_displayable: true,
                  metadata_json: JSON.stringify({ generator: GENERATOR_TAG }),
                });
              }
            }
            record.facts = facts as WebsiteEnrichmentFact[];
            records.push(record);
            trackACount++; cityOk++; totalOk++;
            console.log(`  ✓ A ${row.siret} ${row.name.slice(0, 40)} (${websiteUrl})`);
            return;
          }
          // site découvert mais 0 page crawlable (robots/inaccessible) → piste B.
        }

        // ─── Piste B : inféré + genAI local ───
        if (TRACK === "a") { totalSkip++; return; }
        const record = buildDirectoryInferredEnrichmentRecord({
          siret: row.siret, cabinetName: row.name, cityName: ctx.name,
          addressLine1: row.address_line1, postalCode: row.postal_code,
        });
        for (let attempt = 0; attempt < 2; attempt++) {
          const raw = await callGemini(apiKey, buildPromptTrackB(row, ctx, idx + attempt), 0.85 + attempt * 0.05);
          const parsed = JSON.parse(raw) as { summary?: string };
          const summary = (parsed.summary ?? "").trim();
          const qc = qcSummary(summary, 70, 160);
          if (qc) { if (attempt === 0) continue; throw new Error(`QC B: ${qc}`); }
          const grams = fiveGrams(summary);
          if (acceptedGrams.some((g) => jaccard(g, grams) > 0.5) && attempt === 0) continue;
          acceptedGrams.push(grams);
          record.facts = record.facts.filter((f) => f.fact_type !== "profile_summary");
          record.facts.push({
            fact_type: "profile_summary",
            label: "Présentation éditoriale",
            value: summary,
            confidence: 58,
            is_displayable: true,
            metadata_json: JSON.stringify({ generator: GENERATOR_TAG, track: "inferred" }),
          });
          records.push(record);
          cityOk++; totalOk++;
          return;
        }
      } catch (err) {
        cityFail++; totalFail++;
        if (globalIssues.length < 40) globalIssues.push(`${row.siret}: ${(err as Error).message.slice(0, 140)}`);
      }
    };

    for (let i = 0; i < estabs.length; i += CONCURRENCY) {
      if (MAX_FICHES > 0 && totalOk >= MAX_FICHES) break;
      await Promise.all(estabs.slice(i, i + CONCURRENCY).map((row, j) => processOne(row, i + j)));
      if ((i + CONCURRENCY) % 40 < CONCURRENCY) {
        console.log(`  … ${Math.min(i + CONCURRENCY, estabs.length)}/${estabs.length} (ok=${cityOk} fail=${cityFail})`);
      }
    }

    flushMissCache();
    if (records.length > 0) {
      const outFile = path.join(OUT_DIR, `${city.code}.json`);
      fs.writeFileSync(outFile, JSON.stringify(records, null, 1), "utf-8");
      console.log(`  → ${records.length} record(s) → ${outFile}`);
      if (DO_IMPORT) {
        execFileSync("npx", ["tsx", "scripts/import-directory-enrichment.ts", `--file=${outFile}`], { stdio: "inherit" });
      }
      if (DO_IMPORT_SUPABASE) {
        execFileSync("npx", ["tsx", "scripts/import-directory-enrichment-supabase.ts", `--file=${outFile}`], { stdio: "inherit" });
      }
    }
  }

  console.log(`\n[genai-fiches] terminé : ok=${totalOk} (dont piste A=${trackACount}) fail=${totalFail} skip=${totalSkip}`);
  if (globalIssues.length) { console.log("  Issues:"); for (const s of globalIssues) console.log(`   - ${s}`); }
  db.close();
  if (totalOk === 0 && totalFail > 0) process.exit(1);
}

main().catch((err) => {
  console.error("[generate-directory-fiche-genai] FATAL", err);
  process.exit(1);
});
