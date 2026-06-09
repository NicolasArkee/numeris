/**
 * scripts/generate-fictional-testimonials.ts
 *
 * Wave 2 / Phase P1c — Generate 30 fictional-but-consistent testimonials
 * (3 per profession × 10 professions) via Gemini Flash, then seed them into
 * the local `testimonials` table.
 *
 * Each generated row carries:
 *   - profession_slug = <slug>
 *   - _fictional      = 1   (internal audit flag, never exposed in UI)
 *
 * Idempotent: for each profession, all existing rows with the same
 * (profession_slug, _fictional=1) tuple are deleted before inserting the
 * fresh batch. The 3 real testimonials seeded by src/libs/db/seed.ts
 * (Laurent Petit / Marie Dupont / Thomas Martin) are preserved because
 * they carry _fictional=0.
 *
 * Run: npm run db:seed-testimonials-fictifs
 *
 * Requires GEMINI_API_KEY (or GOOGLE_API_KEY) in /Users/nicolas/ARKEE_ORG/.env
 * (canonical env path for the agency). Falls back to process.env if either
 * variable is already exported.
 */
import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";

// ─── Config ────────────────────────────────────────────────────────────────
const DB_PATH = path.join(process.cwd(), "numeris.db");
const ARKEE_ENV_PATH = "/Users/nicolas/ARKEE_ORG/.env";

// Per task spec: prefer 3-flash-preview, fallback to 2.5-flash on 404.
const PRIMARY_MODEL = "gemini-3-flash-preview";
const FALLBACK_MODEL = "gemini-2.5-flash";

// Top-volume professions confirmed in DB (cf SELECT ... ORDER BY volume DESC).
// All 10 verified present in `professions` table on 2026-06-01.
const TARGET_PROFESSIONS: { slug: string; label: string }[] = [
  { slug: "medecins", label: "médecins libéraux" },
  { slug: "avocats", label: "avocats" },
  { slug: "startups", label: "fondateurs de startups" },
  { slug: "e-commercants", label: "e-commerçants" },
  { slug: "loueurs-en-meuble-lmnp-lmp", label: "loueurs en meublé (LMNP / LMP)" },
  { slug: "restaurateurs-traditionnels", label: "restaurateurs traditionnels" },
  { slug: "infirmiers-liberaux", label: "infirmiers libéraux (IDEL)" },
  { slug: "boulangers", label: "artisans boulangers" },
  { slug: "developpeurs-web", label: "développeurs web freelance" },
  { slug: "agences-de-communication", label: "agences de communication" },
];

// ─── Types ─────────────────────────────────────────────────────────────────
interface TestimonialPayload {
  author_name: string;
  author_initials: string;
  author_role: string;
  location: string;
  body: string;
  stars: number;
}

interface GeminiResponse {
  testimonials: TestimonialPayload[];
}

// ─── Helpers ───────────────────────────────────────────────────────────────
function loadEnv(envPath: string): Record<string, string> {
  const out: Record<string, string> = {};
  if (!fs.existsSync(envPath)) return out;
  const content = fs.readFileSync(envPath, "utf-8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    out[key] = val;
  }
  return out;
}

function getApiKey(): string {
  const fromProc = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (fromProc) return fromProc;
  const env = loadEnv(ARKEE_ENV_PATH);
  const key = env.GEMINI_API_KEY || env.GOOGLE_API_KEY;
  if (!key) {
    throw new Error(
      `Missing GEMINI_API_KEY / GOOGLE_API_KEY (looked in process.env and ${ARKEE_ENV_PATH})`,
    );
  }
  return key;
}

function buildPrompt(professionLabel: string): string {
  return `Tu es un copywriter français spécialisé en témoignages clients B2B de services experts-comptables.

Génère exactement 3 témoignages CLIENT pour un cabinet d'expertise-comptable (Numeris Expertise) qui accompagne des ${professionLabel}.

Chaque témoignage doit :
1. Avoir un auteur plausible (prénom + initiale nom de famille, ex: "Marie L.")
2. Inclure le rôle métier précis (ex: "Médecin généraliste libérale" pas juste "Médecin")
3. Mentionner une ville française réelle (varier entre les 3 — Paris, Lyon, Marseille, Bordeaux, Lille, Toulouse, Nantes, Strasbourg, Rennes, Montpellier, Nice…)
4. Faire 2-3 phrases (50-100 mots), authentique, factuel, sans superlatifs creux
5. Mentionner un bénéfice métier concret (TVA, BNC, CARMF pour médecins ; CARPA, BNC, CNBF pour avocats ; BIC, recettes-dépenses, FEC pour LMNP ; etc.)
6. Éviter : "véritable partenaire", "accompagnement personnalisé", "à l'écoute", "professionnel", "depuis X ans" comme accroche
7. Mentionner Hélène Marchand ou "l'équipe Numeris" dans 1 témoignage sur 3 max

Pour le champ "author_initials", utiliser uniquement les initiales du prénom + nom abrégé (ex: "ML" pour "Marie L.").
Pour le champ "stars", toujours 5.
Pour le champ "location", uniquement le nom de la ville (ex: "Lyon", pas "Lyon, France").

Output JSON strict (aucun texte hors JSON, pas de \`\`\`json fence) :
{
  "testimonials": [
    {"author_name": "...", "author_initials": "...", "author_role": "...", "location": "...", "body": "...", "stars": 5},
    {"author_name": "...", "author_initials": "...", "author_role": "...", "location": "...", "body": "...", "stars": 5},
    {"author_name": "...", "author_initials": "...", "author_role": "...", "location": "...", "body": "...", "stars": 5}
  ]
}`;
}

function stripJsonFence(text: string): string {
  // Sometimes Gemini still wraps in ```json ... ``` despite the instruction.
  let t = text.trim();
  if (t.startsWith("```")) {
    t = t.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "");
  }
  return t.trim();
}

async function callGemini(
  apiKey: string,
  model: string,
  prompt: string,
): Promise<{ ok: true; data: GeminiResponse } | { ok: false; status: number; body: string }> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  const payload = {
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.85,
      topP: 0.95,
      responseMimeType: "application/json",
    },
  };
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    return { ok: false, status: res.status, body: await res.text() };
  }
  const json = (await res.json()) as {
    candidates?: { content?: { parts?: { text?: string }[] } }[];
  };
  const text = json.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
  if (!text) {
    return { ok: false, status: 0, body: `Empty Gemini response: ${JSON.stringify(json).slice(0, 400)}` };
  }
  const cleaned = stripJsonFence(text);
  try {
    const parsed = JSON.parse(cleaned) as GeminiResponse;
    if (!parsed?.testimonials || !Array.isArray(parsed.testimonials)) {
      return { ok: false, status: 0, body: `Parsed JSON missing 'testimonials' array: ${cleaned.slice(0, 300)}` };
    }
    return { ok: true, data: parsed };
  } catch (err) {
    return { ok: false, status: 0, body: `JSON parse failed: ${(err as Error).message} | text: ${cleaned.slice(0, 400)}` };
  }
}

async function generateForProfession(
  apiKey: string,
  professionLabel: string,
): Promise<{ model: string; testimonials: TestimonialPayload[] }> {
  const prompt = buildPrompt(professionLabel);
  let result = await callGemini(apiKey, PRIMARY_MODEL, prompt);
  if (!result.ok && result.status === 404) {
    console.log(
      `  → ${PRIMARY_MODEL} returned 404, falling back to ${FALLBACK_MODEL}…`,
    );
    result = await callGemini(apiKey, FALLBACK_MODEL, prompt);
    if (result.ok) return { model: FALLBACK_MODEL, testimonials: result.data.testimonials };
  }
  if (!result.ok) {
    throw new Error(
      `Gemini call failed (status=${result.status}): ${result.body.slice(0, 500)}`,
    );
  }
  return { model: PRIMARY_MODEL, testimonials: result.data.testimonials };
}

// ─── Main ──────────────────────────────────────────────────────────────────
async function main(): Promise<void> {
  const apiKey = getApiKey();
  const db = new Database(DB_PATH);
  db.pragma("journal_mode = WAL");

  // Confirm the migration has been applied (idempotent check).
  const cols = db
    .prepare("PRAGMA table_info(testimonials)")
    .all() as { name: string }[];
  const colNames = new Set(cols.map((c) => c.name));
  for (const required of ["profession_slug", "_fictional"]) {
    if (!colNames.has(required)) {
      console.error(
        `[generate-fictional-testimonials] FATAL: missing column testimonials.${required}.\n  Run: npm run db:migrate-pricing-testimonials`,
      );
      db.close();
      process.exit(1);
    }
  }

  const deleteStmt = db.prepare(
    "DELETE FROM testimonials WHERE profession_slug = ? AND _fictional = 1",
  );
  const insertStmt = db.prepare(
    `INSERT INTO testimonials
       (author_name, author_initials, author_role, body, stars, featured,
        profession_slug, _fictional)
     VALUES
       (@author_name, @author_initials, @author_role, @body, @stars, 0,
        @profession_slug, 1)`,
  );

  let totalInserted = 0;
  let successfulCalls = 0;
  const issues: string[] = [];
  const modelsUsed = new Set<string>();

  for (const prof of TARGET_PROFESSIONS) {
    console.log(`[${prof.slug}] Generating 3 testimonials for "${prof.label}"…`);
    try {
      const { model, testimonials } = await generateForProfession(
        apiKey,
        prof.label,
      );
      modelsUsed.add(model);

      if (testimonials.length !== 3) {
        issues.push(
          `${prof.slug}: expected 3 testimonials, got ${testimonials.length} (kept anyway)`,
        );
      }

      // Idempotence: clear previous fictional rows for this profession.
      const delResult = deleteStmt.run(prof.slug);
      if (delResult.changes > 0) {
        console.log(
          `  → cleared ${delResult.changes} previous fictional row(s)`,
        );
      }

      // Insert fresh batch in a single transaction.
      const insertAll = db.transaction((rows: TestimonialPayload[]) => {
        for (const r of rows) {
          insertStmt.run({
            author_name: r.author_name,
            author_initials: r.author_initials,
            author_role: r.author_role,
            body: r.body,
            stars: r.stars ?? 5,
            profession_slug: prof.slug,
          });
        }
      });
      insertAll(testimonials);
      totalInserted += testimonials.length;
      successfulCalls += 1;
      console.log(
        `  ✓ inserted ${testimonials.length} row(s) via ${model} (first: ${testimonials[0]?.author_name} / ${testimonials[0]?.location})`,
      );
    } catch (err) {
      const msg = (err as Error).message;
      console.error(`  ✗ FAILED: ${msg}`);
      issues.push(`${prof.slug}: ${msg.slice(0, 200)}`);
    }
  }

  // ─── Post-run summary ────────────────────────────────────────────────────
  const totalRow = db
    .prepare(
      "SELECT COUNT(*) AS total, COALESCE(SUM(_fictional), 0) AS fictional FROM testimonials",
    )
    .get() as { total: number; fictional: number };

  console.log("");
  console.log(`[generate-fictional-testimonials] Summary`);
  console.log(`  Professions targeted:    ${TARGET_PROFESSIONS.length}`);
  console.log(`  Gemini calls successful: ${successfulCalls}`);
  console.log(`  Rows inserted this run:  ${totalInserted}`);
  console.log(`  Models used:             ${[...modelsUsed].join(", ") || "(none)"}`);
  console.log(
    `  DB testimonials total:   ${totalRow.total} (of which _fictional=1: ${totalRow.fictional})`,
  );
  if (issues.length) {
    console.log(`  Issues:`);
    for (const i of issues) console.log(`    - ${i}`);
  } else {
    console.log(`  Issues: (none)`);
  }

  db.close();

  if (successfulCalls === 0) process.exit(1);
}

main().catch((err) => {
  console.error("[generate-fictional-testimonials] FATAL", err);
  process.exit(1);
});
