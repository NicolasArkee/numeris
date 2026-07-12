/**
 * scripts/triage-keyword-pages.ts
 *
 * Wave 0 de la remédiation des keyword_pages /ressources (thin content → LP) :
 * classe chacun des 530 keywords en disposition
 *   - hidden   : déjà masqué par le filtre institutionnel des adapters
 *                (slug/cluster/label contient "ordre" ou "oec") — aucune action
 *   - redirect : 301 vers la cible canonique (annuaire ville, secteur,
 *                profession, département, keeper de fusion, route produit)
 *   - noindex  : personnes physiques, cabinets locaux nommés, requêtes hors
 *                marché FR, bruit numérique — pas de contenu défendable
 *   - enrich   : reste = LP à enrichir (meta déterministes + gen Gemini)
 *
 * Écrit (en --commit) :
 *   - keyword_pages.disposition + redirect_to (colonnes ajoutées si absentes)
 *   - data/redirects-ressources.json  (consommé par next.config.ts)
 *   - data/triage-review.csv          (audit humain, toujours écrit)
 *   - réparation maillage_links       (retarget/purge des URLs redirigées)
 *
 * Usage : npx tsx scripts/triage-keyword-pages.ts [--commit]   (dry-run défaut)
 */
import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";
import {
  classifyKeyword,
  isGeoJunkRemainder,
  isNumericJunk,
  normalizeForDedup,
  resolveGeoKeywordSync,
  resolveTheme,
  slugTokens,
  type CityLite,
  type GeoParse,
  type KeywordClass,
} from "../src/libs/ressources/keyword-lp-helpers";

const COMMIT = process.argv.includes("--commit");
const DB_PATH = path.join(process.cwd(), "numeris.db");
const REDIRECTS_PATH = path.join(process.cwd(), "data", "redirects-ressources.json");
const REVIEW_CSV_PATH = path.join(process.cwd(), "data", "triage-review.csv");

interface KwRow {
  slug: string;
  cluster_slug: string;
  label: string;
  volume: number;
  intent: string | null;
}

interface Decision {
  slug: string;
  volume: number;
  intent: string;
  cls: KeywordClass | "";
  disposition: "hidden" | "redirect" | "noindex" | "enrich";
  redirectTo: string | null;
  reason: string;
  city: string;
  theme: string;
}

// ─── Listes curées (revues via data/triage-review.csv) ──────────────────────

/** Personnes physiques / cabinets locaux nommés : risque RGPD-diffamation,
 *  aucune donnée — noindex + hors sitemap. */
const NAMED_ENTITY_NOINDEX = new Set([
  "nicolas-sapin-expert-comptable",
  "sandrine-meffre-expert-comptable",
  "mohamed-kabbaj-expert-comptable",
  "blaise-petit-expert-comptable",
  "erwan-le-corre-expert-comptable",
  "dominique-perrier-expert-comptable",
  "claude-cazes-expert-comptable",
  "agnes-bricard-expert-comptable",
  "romain-froment-expert-comptable",
  "david-meyer-expert-comptable-marseille",
  "contacter-claire-vilain-expert-comptable-berre",
  "doisneau-expert-comptable-cgt-2017",
  "couturier-expert-comptable-limoges",
  "duguet-expert-comptable-chartres",
  "fidaquitaine-experts-comptables-et-conseils",
  "burkard-experts-comptables-sa",
  "abc-expert-comptable-perpignan",
  "avis-sur-terre-d-entrepreneurs-expert-comptable-arras",
  "ags-experts-comptables-epinal",
  "audexiel-expert-comptable-bordeaux",
  "bm-fiduciaire-expert-comptable-paris-10e",
  "carre-rg-expert-comptable-a-lyon-lyon",
  "avis-sur-cf-compagnie-fiduciaire-expert-comptable-toulouse",
  "cassr-expert-comptable",
  "devis-expert-comptable-socic",
  "diligentia-expert-comptable",
  "cerfrance-gironde-expert-comptable-bordeaux-metropole",
  "apl-expert-comptable-angers",
  "numbr-expert-comptable-a-bordeaux",
  "efficience-experts-comptables",
  "alliance-expert-comptable",
  "alliance-expert-comptable-34",
  "avis-expert-comptable-logiciel-quadra",
]);

/** Requêtes hors marché FR (pays étrangers, zones) — noindex. */
const FOREIGN_TOKENS = new Set([
  "casablanca", "tunis", "tunisie", "monaco", "abidjan", "cameroun",
  "madagascar", "malgache", "algerie", "belgique", "suisse", "espagne",
  "cemac", "valencia",
]);

/** Bruit résiduel non capturé par isNumericJunk. */
const MISC_JUNK_NOINDEX = new Set([
  "https-controle-qualite-experts-comptables-org",
  "conseil-superieur-des-experts-comptable-emploi-drupal",
  "allintitle-devis-expert-comptable-en-ligne",
  "ecl-societe-com-expert-comptable-en-ligne-societe-com",
  "agent-commercial-free-lance-au-resultat-expert-comptable",
  "direccte-marseille-autorisation-de-travail-expert-comptable",
  "aga-vendee-expert-comptable-la-fidal-en-1980",
  "500e-anniversaire-experts-comptables",
  "echarpe-rouge-expert-comptable",
  "ebp-business-plan-ligne-expert-comptable",
  "comptabilite-franchise-valencia-expert",
]);

/** Slug → route riche existante (301 hors /ressources). Cibles validées
 *  contre la DB avant écriture. */
const ROUTE_MAP: Record<string, string> = {
  "expert-comptable": "/",
  "experts-comptables": "/",
  "expert-comptable-a-proximite": "/annuaire/experts-comptables",
  "annuaire-des-experts-comptables": "/annuaire/experts-comptables",
  "annuaire-expert-comptable": "/annuaire/experts-comptables",
  "liste-des-experts-comptables": "/annuaire/experts-comptables",
  "annuaire-experts-comptables-com": "/annuaire/experts-comptables",
  "annuaire-expert-comptable-nouvelle-aquitaine": "/annuaire/experts-comptables",
  "annuaire-expert-comptable-alsace": "/annuaire/experts-comptables",
  "expert-comptable-start-up": "/secteurs/start-up",
  "expert-comptable-restauration": "/secteurs/restauration",
  "expert-comptable-immobilier": "/secteurs/immobilier",
  "expert-comptable-profession-liberale": "/secteurs/profession-liberale",
  "expert-comptable-association": "/secteurs/association",
  "expert-comptable-transport": "/secteurs/transport",
  "expert-comptable-transport-de-marchandises": "/secteurs/transport",
  "expert-comptable-medecin": "/professions/medecins",
  "expert-comptable-e-commerce": "/professions/e-commercants",
  "expert-comptable-agricole": "/professions/agriculteurs",
  "expert-comptable-lmnp": "/professions/loueurs-en-meuble-lmnp-lmp",
  "expert-comptable-location-meublee": "/professions/loueurs-en-meuble-lmnp-lmp",
  "tarif-expert-comptable-lmnp": "/professions/loueurs-en-meuble-lmnp-lmp",
  "expert-comptable-bas-rhin": "/departements/67-bas-rhin",
};

/** Groupes thématiques consolidés vers un keeper unique (301 intra-ressources).
 *  Détection par token — complète la dédup par permutation. */
const EVENT_TOKENS = new Set(["congres", "salon"]);
const EVENT_EXTRA_SLUGS = new Set([
  "universite-d-ete-expert-comptable-2025",
  "challenge-voile-experts-comptable-2025",
]);
const EVENTS_KEEPER = "congres-expert-comptable";

const JOB_TOKENS = new Set(["emploi", "recrutement", "annonce"]);
const JOBS_KEEPER = "postes-expert-comptable";

/** Sous-thèmes CCN (maternité, préavis, 13e mois…) : 20+ micro-requêtes →
 *  un pilier unique. Exception : les grilles de salaire ont leur propre keeper. */
const CCN_KEEPER = "convention-collective-expert-comptable";
const SALARY_GRID_KEEPER = "grille-salaire-expert-comptable";
const DEONTO_KEEPER = "code-de-deontologie-expert-comptable";

/** Fusions manuelles supplémentaires (même intent, tokens différents). */
const MANUAL_FUSION: Record<string, string> = {
  "meilleur-expert-comptable-en-ligne": "expert-comptable-en-ligne",
  "avis-expert-comptable-en-ligne": "expert-comptable-en-ligne",
  "quel-expert-comptable-en-ligne-choisir": "expert-comptable-en-ligne",
  "l-expert-comptable-com": "l-expert-comptable",
  "ecole-expert-comptable-lyon": "ecole-expert-comptable",
  "ecole-expert-comptable-bordeaux": "ecole-expert-comptable",
  "devis-expert-comptable-lyon": "devis-expert-comptable",
  "adopte-1-expert-comptable": "adopte-un-expert-comptable",
  "comment-devenir-expert-comptable": "devenir-expert-comptable",
  "bibliotique-memoire-expert-comptable": "bibliotique-expert-comptable",
  "ciel-devis-facture-export-relation-expert-comptable": "ciel-expert-comptable",
  "experte-comptable-salaire": "salaire-expert-comptable",
  "article-2-ordonnance-1945-expert-comptable": "ordonnance-1945-expert-comptable",
  "deontologie-expert-comptable": DEONTO_KEEPER,
  "exercice-professionnel-et-deontologie-expert-comptable": DEONTO_KEEPER,
  "code-des-devoirs-professionnels-expert-comptable": DEONTO_KEEPER,
  "code-de-conduite-expert-comptable": DEONTO_KEEPER,
  "dehontologie-expert-comptable-synthese": DEONTO_KEEPER,
};

// ─── Main ────────────────────────────────────────────────────────────────────

function normalizeResourceText(v: string | null | undefined): string {
  return (v ?? "").normalize("NFD").replace(/[̀-ͯ]/gu, "").toLowerCase();
}

function isInstitutional(kw: KwRow): boolean {
  const text = [kw.slug, kw.cluster_slug, kw.label].map(normalizeResourceText).join(" ");
  return text.includes("ordre") || /\boec\b/u.test(text);
}

function csvCell(v: string | number | null): string {
  const s = String(v ?? "");
  return /[",;\n]/u.test(s) ? `"${s.replace(/"/gu, '""')}"` : s;
}

function main(): void {
  const db = new Database(DB_PATH);
  db.pragma("journal_mode = WAL");

  // Colonnes disposition/redirect_to (idempotent).
  const cols = new Set(
    (db.prepare("PRAGMA table_info(keyword_pages)").all() as { name: string }[]).map((c) => c.name),
  );
  for (const [col, ddl] of [
    ["disposition", "ALTER TABLE keyword_pages ADD COLUMN disposition TEXT"],
    ["redirect_to", "ALTER TABLE keyword_pages ADD COLUMN redirect_to TEXT"],
  ] as const) {
    if (!cols.has(col)) {
      db.exec(ddl);
      console.log(`[schema] added keyword_pages.${col}`);
    }
  }

  const keywords = db
    .prepare("SELECT slug, cluster_slug, label, volume, COALESCE(intent,'') AS intent FROM keyword_pages ORDER BY volume DESC")
    .all() as KwRow[];

  // Résolveurs data (sync, better-sqlite3).
  const cityStmt = db.prepare(
    "SELECT slug, name, code_insee, population, department_code, department_name FROM cities_official WHERE slug = ? ORDER BY population DESC LIMIT 1",
  );
  const cityByPostalStmt = db.prepare(
    "SELECT slug, name, code_insee, population, department_code, department_name FROM cities_official WHERE postal_codes LIKE ? ORDER BY population DESC LIMIT 1",
  );
  const estabCountStmt = db.prepare(
    `SELECT COUNT(*) AS c FROM directory_establishments e
     JOIN directory_cabinets d ON d.id = e.cabinet_id
     WHERE e.city_code_insee = ? AND e.is_active = 1 AND d.is_active = 1`,
  );
  const getCity = (slug: string): CityLite | undefined => cityStmt.get(slug) as CityLite | undefined;
  const getCityByPostal = (cp: string): CityLite | undefined =>
    cityByPostalStmt.get(`%"${cp}"%`) as CityLite | undefined;
  const estabCount = (codeInsee: string): number =>
    (estabCountStmt.get(codeInsee) as { c: number }).c;

  // Validation des cibles ROUTE_MAP contre la DB.
  const secteurSlugs = new Set((db.prepare("SELECT slug FROM secteurs").all() as { slug: string }[]).map((r) => r.slug));
  const professionSlugs = new Set((db.prepare("SELECT slug FROM professions").all() as { slug: string }[]).map((r) => r.slug));
  const departementSlugs = new Set((db.prepare("SELECT slug FROM departements").all() as { slug: string }[]).map((r) => r.slug));
  const departementByCode = new Map(
    (db.prepare("SELECT slug, code FROM departements").all() as { slug: string; code: string }[]).map((r) => [r.code, r.slug]),
  );
  for (const [slug, target] of Object.entries(ROUTE_MAP)) {
    const m = target.match(/^\/(secteurs|professions|departements)\/(.+)$/u);
    if (!m) continue;
    const ok =
      (m[1] === "secteurs" && secteurSlugs.has(m[2])) ||
      (m[1] === "professions" && professionSlugs.has(m[2])) ||
      (m[1] === "departements" && departementSlugs.has(m[2]));
    if (!ok) throw new Error(`ROUTE_MAP invalide : ${slug} → ${target} (cible absente de la DB)`);
  }

  const allSlugs = new Set(keywords.map((k) => k.slug));
  const decisions = new Map<string, Decision>();
  const decide = (
    kw: KwRow,
    disposition: Decision["disposition"],
    redirectTo: string | null,
    reason: string,
    cls: KeywordClass | "" = "",
    city = "",
    theme = "",
  ) => {
    decisions.set(kw.slug, {
      slug: kw.slug, volume: kw.volume, intent: kw.intent ?? "",
      cls, disposition, redirectTo, reason, city, theme,
    });
  };

  // ─── Passe 1 : dispositions terminales (ordre des règles = priorité) ───
  const geoParses = new Map<string, GeoParse>();

  for (const kw of keywords) {
    if (isInstitutional(kw)) { decide(kw, "hidden", null, "filtre institutionnel (ordre/oec) déjà actif"); continue; }
    if (NAMED_ENTITY_NOINDEX.has(kw.slug)) { decide(kw, "noindex", null, "personne physique / cabinet nommé"); continue; }
    if (slugTokens(kw.slug).some((t) => FOREIGN_TOKENS.has(t))) { decide(kw, "noindex", null, "hors marché FR"); continue; }
    if (MANUAL_FUSION[kw.slug] && allSlugs.has(MANUAL_FUSION[kw.slug])) {
      decide(kw, "redirect", `/ressources/${MANUAL_FUSION[kw.slug]}`, "fusion manuelle (même intent)"); continue;
    }
    if (isNumericJunk(kw.slug) || MISC_JUNK_NOINDEX.has(kw.slug)) { decide(kw, "noindex", null, "bruit (numérique/URL/évènement daté)"); continue; }

    // Consolidations thématiques → keeper unique.
    const tokens = slugTokens(kw.slug);
    if (kw.slug !== EVENTS_KEEPER && (tokens.some((t) => EVENT_TOKENS.has(t)) || EVENT_EXTRA_SLUGS.has(kw.slug))) {
      decide(kw, "redirect", `/ressources/${EVENTS_KEEPER}`, "consolidation évènements profession"); continue;
    }
    if (kw.slug !== JOBS_KEEPER && tokens.some((t) => JOB_TOKENS.has(t))) {
      decide(kw, "redirect", `/ressources/${JOBS_KEEPER}`, "consolidation emploi/recrutement"); continue;
    }
    if (kw.slug !== SALARY_GRID_KEEPER && tokens.includes("grille") && tokens.includes("salaire")) {
      decide(kw, "redirect", `/ressources/${SALARY_GRID_KEEPER}`, "consolidation grilles de salaire CCN"); continue;
    }
    if (kw.slug !== CCN_KEEPER && (tokens.includes("convention") || tokens.includes("ccn"))) {
      decide(kw, "redirect", `/ressources/${CCN_KEEPER}`, "consolidation sous-thèmes CCN"); continue;
    }
    if (kw.slug !== DEONTO_KEEPER && (tokens.includes("deontologie") || tokens.includes("deontologique"))) {
      decide(kw, "redirect", `/ressources/${DEONTO_KEEPER}`, "consolidation code de déontologie"); continue;
    }

    if (ROUTE_MAP[kw.slug]) { decide(kw, "redirect", ROUTE_MAP[kw.slug], "intent porté par une route riche existante"); continue; }

    // Géo : fenêtres ancrées longest-match, tokens numériques pré-strippés
    // (codes postaux 4-5 chiffres, codes département 2 chiffres).
    const numTokens = tokens.filter((t) => /^\d{2,5}$/u.test(t));
    const slugSansNum = tokens.filter((t) => !/^\d{2,5}$/u.test(t)).join("-");
    let geo = resolveGeoKeywordSync(slugSansNum, getCity);
    // `expert-comptable-75017` : pas de token ville, résolution par CP.
    if (!geo && numTokens.length === 1 && /^\d{5}$/u.test(numTokens[0])) {
      const city = getCityByPostal(numTokens[0]);
      if (city) geo = { city, themeTokens: [], form: "prefix" };
    }
    // `expert-comptable-77` : code département → page département.
    if (!geo && numTokens.length === 1 && /^\d{2}$/u.test(numTokens[0])) {
      const deptSlug = departementByCode.get(numTokens[0]);
      if (deptSlug) { decide(kw, "redirect", `/departements/${deptSlug}`, "code département → page département"); continue; }
    }

    if (geo) {
      geoParses.set(kw.slug, geo);
      const theme = resolveTheme(geo.themeTokens);
      const junkOnly = isGeoJunkRemainder([...geo.themeTokens, ...numTokens.filter((t) => t.length >= 4)]);
      if (!theme && junkOnly) {
        const n = estabCount(geo.city.code_insee);
        if (n > 0) {
          decide(kw, "redirect", `/expert-comptable/${geo.city.slug}`, `géo pur → annuaire ville (${n} étabs)`, "geo", geo.city.name);
          continue;
        }
        decide(kw, "enrich", null, "géo pur mais 0 établissement → LP locale", "geo-theme", geo.city.name);
        continue;
      }
      decide(kw, "enrich", null, theme ? "ville × thème différencié" : "géo + reliquat non résolu",
        "geo-theme", geo.city.name, theme?.label ?? geo.themeTokens.join("-"));
      continue;
    }

    // Reste : enrich, classé pour la génération.
    const cls = classifyKeyword({ slug: kw.slug, intent: kw.intent }, null);
    decide(kw, "enrich", null, "LP à enrichir", cls);
  }

  // ─── Passe 2 : dédup par permutation parmi les enrich ───
  const groups = new Map<string, KwRow[]>();
  for (const kw of keywords) {
    if (decisions.get(kw.slug)?.disposition !== "enrich") continue;
    const key = normalizeForDedup(kw.slug);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(kw);
  }
  for (const members of groups.values()) {
    if (members.length < 2) continue;
    const maxVol = Math.max(...members.map((m) => m.volume));
    // Keeper : plus fort volume, mais un slug sans millésime est préféré
    // dès qu'il pèse ≥ 25 % du max (évite les keepers `-2025` périssables).
    const yearFree = members.filter((m) => !slugTokens(m.slug).some((t) => /^(19|20)\d{2}$/u.test(t)));
    const pool = yearFree.some((m) => m.volume >= maxVol * 0.25) ? yearFree : members;
    const keeper = pool.reduce((a, b) => (b.volume > a.volume ? b : a));
    for (const m of members) {
      if (m.slug === keeper.slug) continue;
      const prev = decisions.get(m.slug)!;
      decide(m, "redirect", `/ressources/${keeper.slug}`, `doublon de permutation → ${keeper.slug}`, prev.cls, prev.city, prev.theme);
    }
  }

  // ─── Passe 3 : aplatissement des chaînes de redirects ───
  const finalTarget = (slug: string, depth = 0): string | null => {
    const d = decisions.get(slug);
    if (!d || d.disposition !== "redirect" || !d.redirectTo || depth > 5) return null;
    const m = d.redirectTo.match(/^\/ressources\/(.+)$/u);
    if (m) {
      const next = finalTarget(m[1], depth + 1);
      if (next) return next;
      const nextDecision = decisions.get(m[1]);
      if (nextDecision && nextDecision.disposition !== "enrich" && nextDecision.disposition !== "hidden") {
        // keeper lui-même noindex/redirect sans cible → replier sur l'annuaire
        return "/annuaire/experts-comptables";
      }
    }
    return d.redirectTo;
  };
  for (const d of decisions.values()) {
    if (d.disposition !== "redirect") continue;
    const flat = finalTarget(d.slug);
    if (flat && flat !== d.redirectTo) d.redirectTo = flat;
    if (d.redirectTo === `/ressources/${d.slug}`) { d.disposition = "enrich"; d.redirectTo = null; d.reason += " (boucle → enrich)"; }
  }

  // ─── Sorties ───
  const all = [...decisions.values()].sort((a, b) => b.volume - a.volume);
  const byDisp = (disp: Decision["disposition"]) => all.filter((d) => d.disposition === disp);

  fs.mkdirSync(path.dirname(REVIEW_CSV_PATH), { recursive: true });
  const csv = [
    "slug;volume;intent;class;disposition;redirect_to;reason;city;theme",
    ...all.map((d) =>
      [d.slug, d.volume, d.intent, d.cls, d.disposition, d.redirectTo ?? "", d.reason, d.city, d.theme]
        .map(csvCell).join(";"),
    ),
  ].join("\n");
  fs.writeFileSync(REVIEW_CSV_PATH, csv, "utf-8");

  const redirects = byDisp("redirect").map((d) => ({
    source: `/ressources/${d.slug}`,
    destination: d.redirectTo!,
    permanent: true,
  }));
  fs.writeFileSync(REDIRECTS_PATH, `${JSON.stringify(redirects, null, 2)}\n`, "utf-8");

  console.log(`\n[triage] ${all.length} keywords :`);
  for (const disp of ["enrich", "redirect", "noindex", "hidden"] as const) {
    const rows = byDisp(disp);
    const vol = rows.reduce((s, d) => s + d.volume, 0);
    console.log(`  ${disp.padEnd(8)} ${String(rows.length).padStart(3)} pages  (${vol.toLocaleString("fr-FR")} vol/mois)`);
  }
  console.log(`\n  CSV revue   : ${REVIEW_CSV_PATH}`);
  console.log(`  Redirects   : ${REDIRECTS_PATH} (${redirects.length} règles)`);

  // ─── Écriture DB + réparation maillage ───
  if (!COMMIT) {
    console.log("\nDRY-RUN — keyword_pages et maillage_links non modifiés. Relancer avec --commit.");
    db.close();
    return;
  }

  const upd = db.prepare("UPDATE keyword_pages SET disposition = @disposition, redirect_to = @redirectTo WHERE slug = @slug");
  const tx = db.transaction((rows: Decision[]) => {
    for (const d of rows) upd.run({ slug: d.slug, disposition: d.disposition, redirectTo: d.redirectTo });
  });
  tx(all);
  console.log(`\n[commit] keyword_pages.disposition écrit (${all.length} rows)`);

  // maillage_links : URLs stockées en ABSOLU (https://www.skoria.fr/…).
  // Pages redirigées : purge des liens sortants, retarget des entrants vers la
  // destination du 301 (purge si doublon/self-link). Pages noindex/hidden :
  // purge des liens entrants (equity gaspillée / lien cassé) et sortants.
  const BASE = "https://www.skoria.fr";
  const abs = (p: string): string => (p.startsWith("http") ? p : p === "/" ? BASE : `${BASE}${p}`);
  const delSource = db.prepare("DELETE FROM maillage_links WHERE source_url IN (?, ?)");
  const delTarget = db.prepare("DELETE FROM maillage_links WHERE target_url IN (?, ?)");
  const selIncoming = db.prepare("SELECT id, source_url FROM maillage_links WHERE target_url IN (?, ?)");
  const updTarget = db.prepare("UPDATE maillage_links SET target_url = ? WHERE id = ?");
  const delRow = db.prepare("DELETE FROM maillage_links WHERE id = ?");
  const dupCheck = db.prepare("SELECT COUNT(*) AS c FROM maillage_links WHERE source_url = ? AND target_url = ?");
  let purgedOut = 0; let retargeted = 0; let purgedDup = 0; let purgedDead = 0;
  const txMaillage = db.transaction(() => {
    for (const d of byDisp("redirect")) {
      const rel = `/ressources/${d.slug}`;
      const dest = abs(d.redirectTo!);
      purgedOut += delSource.run(rel, abs(rel)).changes;
      for (const row of selIncoming.all(rel, abs(rel)) as { id: number; source_url: string }[]) {
        const isDup = (dupCheck.get(row.source_url, dest) as { c: number }).c > 0;
        if (isDup || row.source_url === dest) { delRow.run(row.id); purgedDup++; }
        else { updTarget.run(dest, row.id); retargeted++; }
      }
    }
    for (const d of [...byDisp("noindex"), ...byDisp("hidden")]) {
      const rel = `/ressources/${d.slug}`;
      purgedDead += delSource.run(rel, abs(rel)).changes;
      purgedDead += delTarget.run(rel, abs(rel)).changes;
    }
  });
  txMaillage();
  console.log(`[commit] maillage_links : ${purgedOut} sortants purgés, ${retargeted} entrants re-ciblés, ${purgedDup} doublons purgés, ${purgedDead} liens vers noindex/hidden purgés`);
  db.close();
}

main();
