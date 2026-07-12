/**
 * scripts/check-keyword-lp-helpers.ts
 *
 * Sanity-check du parsing/classification keyword-lp (aucune écriture) :
 *   - parse les 530 slugs de keyword_pages, répartition par classe
 *   - vérifie les pièges connus (longest-match, postal, faux positifs ville)
 *   - liste toutes les détections géo pour revue humaine
 *
 * Run : npx tsx scripts/check-keyword-lp-helpers.ts
 */
import Database from "better-sqlite3";
import path from "node:path";
import {
  cityWindowCandidates,
  classifyKeyword,
  isGeoJunkRemainder,
  resolveGeoKeywordSync,
  resolveTheme,
  slugTokens,
  buildKeywordMeta,
  type CityLite,
} from "../src/libs/ressources/keyword-lp-helpers";

const DB_PATH = path.join(process.cwd(), "numeris.db");

function main(): void {
  const db = new Database(DB_PATH, { readonly: true });
  const cityStmt = db.prepare(
    "SELECT slug, name, code_insee, population, department_code, department_name FROM cities_official WHERE slug = ? ORDER BY population DESC LIMIT 1",
  );
  const getCity = (slug: string): CityLite | undefined => cityStmt.get(slug) as CityLite | undefined;

  const keywords = db
    .prepare("SELECT slug, label, volume, COALESCE(intent,'') AS intent FROM keyword_pages ORDER BY volume DESC")
    .all() as { slug: string; label: string; volume: number; intent: string }[];

  let failures = 0;
  const assert = (cond: boolean, msg: string) => {
    if (cond) { console.log(`  ✓ ${msg}`); } else { console.error(`  ✗ FAIL: ${msg}`); failures++; }
  };

  // ─── Assertions pièges connus ───
  console.log("[assertions]");
  const obernai = getCity("obernai");
  assert(obernai?.code_insee === "67348", `obernai → INSEE 67348 (got ${obernai?.code_insee})`);

  const cf = cityWindowCandidates("expert-comptable-clermont-ferrand");
  assert(cf[0]?.citySlug === "clermont-ferrand", `longest-match : clermont-ferrand testé avant clermont (got ${cf[0]?.citySlug})`);

  const enLigne = resolveGeoKeywordSync("expert-comptable-en-ligne", getCity);
  assert(!enLigne, `expert-comptable-en-ligne ne matche aucune ville (got ${enLigne?.city.name ?? "none"})`);

  const salaire = resolveGeoKeywordSync("salaire-expert-comptable", getCity);
  assert(!salaire, `salaire-expert-comptable ne matche aucune ville (got ${salaire?.city.name ?? "none"})`);

  const paris = resolveGeoKeywordSync("paris-expert-comptable", getCity);
  assert(paris?.city.slug === "paris", "paris-expert-comptable (forme suffixe) → paris");

  const rouen = resolveGeoKeywordSync("expert-comptable-immoblier-rouen", getCity);
  assert(rouen?.city.slug === "rouen", `forme thème-ville : immoblier-rouen → rouen (got ${rouen?.city.slug ?? "none"})`);

  const carcassonne = resolveGeoKeywordSync("expert-comptable-creation-entreprise-carcassonne", getCity);
  assert(carcassonne?.city.slug === "carcassonne", `forme thème-ville : creation-entreprise-carcassonne (got ${carcassonne?.city.slug ?? "none"})`);

  const obTheme = resolveTheme(["agriculture"]);
  assert(obTheme?.key === "agriculture", "thème agriculture résolu");
  assert(isGeoJunkRemainder(["13012"]), "reliquat 13012 = junk géo");
  assert(!isGeoJunkRemainder(["agriculture"]), "reliquat agriculture ≠ junk géo");

  const meta = buildKeywordMeta(
    { slug: "expert-comptable-obernai-agriculture", label: "expert comptable obernai agriculture" },
    "geo-theme",
    { cityName: "Obernai", cabinetCount: 13, departmentName: "Bas-Rhin", themeLabel: "l'agriculture" },
  );
  assert(meta.h1 === "Expert-comptable à Obernai pour l'agriculture", `h1 géo-thème (got "${meta.h1}")`);
  assert(meta.title.length <= 75, `title ≤ 75c (got ${meta.title.length})`);

  // ─── Répartition + détections géo ───
  const counts = new Map<string, number>();
  const geoRows: string[] = [];
  for (const kw of keywords) {
    const tokens = slugTokens(kw.slug).filter((t) => !/^\d{2,5}$/u.test(t));
    const geo = resolveGeoKeywordSync(tokens.join("-"), getCity);
    const cls = classifyKeyword({ slug: kw.slug, intent: kw.intent }, geo);
    counts.set(cls, (counts.get(cls) ?? 0) + 1);
    if (geo) {
      geoRows.push(
        `    ${kw.slug}  →  ${geo.city.name} (${geo.city.code_insee}, pop ${geo.city.population})${geo.themeTokens.length ? `  reste=[${geo.themeTokens.join(",")}]` : ""}`,
      );
    }
  }

  console.log(`\n[répartition ${keywords.length} keywords]`);
  for (const [cls, n] of [...counts.entries()].sort((a, b) => b[1] - a[1])) {
    console.log(`  ${cls.padEnd(14)} ${n}`);
  }

  console.log(`\n[détections géo — ${geoRows.length} slugs, à relire]`);
  for (const row of geoRows) console.log(row);

  db.close();
  console.log(`\n${failures === 0 ? "OK — 0 échec" : `ÉCHECS : ${failures}`}`);
  if (failures > 0) process.exit(1);
}

main();
