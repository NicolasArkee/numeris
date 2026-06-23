import Database from "better-sqlite3";
import path from "node:path";
import { SCHEMA } from "../src/libs/db/schema";
import {
  buildCityTargets,
  pickCandidates,
  stripPostalCity,
  totalPages,
  type ApiCompany,
  type CityTarget,
  type GeoCommune,
  type ImportCandidate,
} from "./directory-import-helpers";

type ApiPayload = {
  results?: ApiCompany[];
  total_results?: number;
  page?: number;
  per_page?: number;
  erreur?: string;
};

type ImportOptions = {
  dbPath: string;
  limitCities: number;
  perPage: number;
  maxPagesPerCode: number | null;
  maxCandidatesPerCity: number | null;
  dryRun: boolean;
  sleepMs: number;
  requestedCities: string[] | null;
  resumeAfter: string | null;
  stopAfterCities: number | null;
};

const SOURCE_KEY = "api-recherche-entreprises";
const GEO_COMMUNES_URL =
  "https://geo.api.gouv.fr/communes?fields=nom,code,codesPostaux,population,centre,departement,region&format=json&geometry=centre";
const SEARCH_URL = "https://recherche-entreprises.api.gouv.fr/search";
const DEFAULT_CITY_LIMIT = 2000;
const DEFAULT_PER_PAGE = 25;
const DEFAULT_SLEEP_MS = 180;

function parseArgs(): ImportOptions {
  const args = new Map<string, string>();
  for (const arg of process.argv.slice(2)) {
    const [key, value = "true"] = arg.replace(/^--/, "").split("=");
    args.set(key, value);
  }

  const perCityArg = args.get("per-city");
  return {
    dbPath: args.get("db") ?? process.env.NUMERIS_DB ?? path.join(process.cwd(), "numeris.db"),
    limitCities: Math.max(1, Number(args.get("limit-cities") ?? DEFAULT_CITY_LIMIT)),
    perPage: Math.min(DEFAULT_PER_PAGE, Math.max(1, Number(args.get("per-page") ?? DEFAULT_PER_PAGE))),
    maxPagesPerCode: args.has("max-pages-per-code")
      ? Math.max(1, Number(args.get("max-pages-per-code")))
      : null,
    maxCandidatesPerCity: perCityArg ? Math.max(1, Number(perCityArg)) : null,
    dryRun: args.has("dry-run"),
    sleepMs: Math.max(0, Number(args.get("sleep-ms") ?? DEFAULT_SLEEP_MS)),
    requestedCities: args.get("cities")?.split(",").map((value) => value.trim()).filter(Boolean) ?? null,
    resumeAfter: args.get("resume-after") ?? null,
    stopAfterCities: args.has("stop-after-cities")
      ? Math.max(1, Number(args.get("stop-after-cities")))
      : null,
  };
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function normalizeFilter(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function toNumber(value: string | null | undefined): number | null {
  if (!value) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function ensureDirectoryRuntimeColumns(db: Database.Database) {
  const cityColumns = new Set(
    (db.prepare("PRAGMA table_info(cities_official)").all() as { name: string }[]).map(
      (row) => row.name,
    ),
  );
  if (!cityColumns.has("population")) {
    db.exec("ALTER TABLE cities_official ADD COLUMN population INTEGER NOT NULL DEFAULT 0");
  }
}

async function fetchJsonWithRetry(url: URL, sleepMs: number, attempt = 1): Promise<ApiPayload> {
  const response = await fetch(url, {
    headers: {
      accept: "application/json",
      "user-agent": "NumerisDirectoryBulkImport/1.0 contact:dev@local",
    },
  });

  if (response.status === 429 && attempt <= 5) {
    const retryAfter = Number(response.headers.get("retry-after") ?? 1);
    await sleep(Math.max(sleepMs, retryAfter * 1000));
    return fetchJsonWithRetry(url, sleepMs, attempt + 1);
  }

  if (!response.ok) {
    throw new Error(`API request failed (${response.status}) for ${url.toString()}`);
  }

  return (await response.json()) as ApiPayload;
}

async function fetchCityTargets(options: ImportOptions): Promise<CityTarget[]> {
  const response = await fetch(GEO_COMMUNES_URL, {
    headers: { accept: "application/json" },
  });
  if (!response.ok) {
    throw new Error(`Geo API failed: ${response.status}`);
  }

  const communes = (await response.json()) as GeoCommune[];
  let cities = buildCityTargets(communes, options.limitCities);

  if (options.requestedCities) {
    const filters = new Set(options.requestedCities.map(normalizeFilter));
    cities = cities.filter((city) => {
      const values = [
        city.codeInsee,
        city.slug,
        normalizeFilter(city.name),
        ...city.searchCodes,
      ];
      return values.some((value) => filters.has(value));
    });
  }

  if (options.resumeAfter) {
    const resumeIndex = cities.findIndex(
      (city) => city.slug === options.resumeAfter || city.codeInsee === options.resumeAfter,
    );
    if (resumeIndex >= 0) {
      cities = cities.slice(resumeIndex + 1);
    }
  }

  if (options.stopAfterCities) {
    cities = cities.slice(0, options.stopAfterCities);
  }

  if (cities.length === 0) {
    throw new Error("No matching cities for import.");
  }

  return cities;
}

function buildSearchUrl(searchCode: string, page: number, perPage: number): URL {
  const url = new URL(SEARCH_URL);
  url.searchParams.set("activite_principale", "69.20Z");
  url.searchParams.set("etat_administratif", "A");
  url.searchParams.set("code_commune", searchCode);
  url.searchParams.set("page", String(page));
  url.searchParams.set("per_page", String(perPage));
  url.searchParams.set("limite_matching_etablissements", "100");
  url.searchParams.set("minimal", "true");
  url.searchParams.set("include", "matching_etablissements,siege");
  return url;
}

async function fetchCandidatesForCity(
  city: CityTarget,
  options: ImportOptions,
): Promise<{ candidates: ImportCandidate[]; requests: number; units: number }> {
  const seenSirets = new Set<string>();
  const candidates: ImportCandidate[] = [];
  let requests = 0;
  let units = 0;

  for (const searchCode of city.searchCodes) {
    let page = 1;
    let pageLimit: number | null = null;

    while (pageLimit == null || page <= pageLimit) {
      const url = buildSearchUrl(searchCode, page, options.perPage);
      const payload = await fetchJsonWithRetry(url, options.sleepMs);
      requests += 1;

      const results = payload.results ?? [];
      units += results.length;

      const total = payload.total_results ?? results.length;
      const computedPages = totalPages(total, options.perPage);
      pageLimit = options.maxPagesPerCode
        ? Math.min(options.maxPagesPerCode, computedPages || options.maxPagesPerCode)
        : computedPages;

      for (const company of results) {
        for (const candidate of pickCandidates(company, city, url.toString())) {
          const siret = candidate.establishment.siret;
          if (!siret || seenSirets.has(siret)) continue;
          seenSirets.add(siret);
          candidates.push(candidate);
          if (
            options.maxCandidatesPerCity != null
            && candidates.length >= options.maxCandidatesPerCity
          ) {
            return { candidates, requests, units };
          }
        }
      }

      const shouldStop = results.length === 0 || pageLimit === 0 || page >= pageLimit;
      if (options.sleepMs > 0) await sleep(options.sleepMs);
      if (shouldStop) break;
      page += 1;
    }
  }

  return { candidates, requests, units };
}

function upsertSource(db: Database.Database) {
  db.prepare(
    `INSERT INTO source_registry
       (source_key, source_name, source_url, source_type, license_label, legal_basis, allowed_fields, refresh_frequency, requires_legal_review)
     VALUES
       (@source_key, @source_name, @source_url, @source_type, @license_label, @legal_basis, @allowed_fields, @refresh_frequency, @requires_legal_review)
     ON CONFLICT(source_key) DO UPDATE SET
       source_name = excluded.source_name,
       source_url = excluded.source_url,
       license_label = excluded.license_label,
       legal_basis = excluded.legal_basis,
       allowed_fields = excluded.allowed_fields,
       refresh_frequency = excluded.refresh_frequency,
       requires_legal_review = excluded.requires_legal_review,
       updated_at = datetime('now')`,
  ).run({
    source_key: SOURCE_KEY,
    source_name: "API Recherche d'entreprises",
    source_url: SEARCH_URL,
    source_type: "api",
    license_label: "MIT License / donnees publiques diffusibles",
    legal_basis: "Source administrative publique; candidats non verifies Ordre.",
    allowed_fields: JSON.stringify([
      "siren",
      "siret",
      "nom_complet",
      "activite_principale",
      "adresse",
      "commune",
      "code_postal",
      "latitude",
      "longitude",
    ]),
    refresh_frequency: "manual",
    requires_legal_review: 0,
  });
}

function upsertCity(db: Database.Database, city: CityTarget) {
  db.prepare(
    `INSERT INTO cities_official
       (code_insee, name, slug, postal_codes, department_code, department_name, region_code, region_name, latitude, longitude, population)
     VALUES
       (@code_insee, @name, @slug, @postal_codes, @department_code, @department_name, @region_code, @region_name, @latitude, @longitude, @population)
     ON CONFLICT(code_insee) DO UPDATE SET
       name = excluded.name,
       slug = excluded.slug,
       postal_codes = excluded.postal_codes,
       department_code = excluded.department_code,
       department_name = excluded.department_name,
       region_code = excluded.region_code,
       region_name = excluded.region_name,
       latitude = excluded.latitude,
       longitude = excluded.longitude,
       population = excluded.population,
       updated_at = datetime('now')`,
  ).run({
    code_insee: city.codeInsee,
    name: city.name,
    slug: city.slug,
    postal_codes: JSON.stringify(city.postalCodes),
    department_code: city.departmentCode,
    department_name: city.departmentName,
    region_code: city.regionCode,
    region_name: city.regionName,
    latitude: city.latitude,
    longitude: city.longitude,
    population: city.population,
  });
}

function upsertCandidate(db: Database.Database, candidate: ImportCandidate, retrievedAt: string) {
  const { company, establishment, city, sourceUrl } = candidate;
  const legalName = company.nom_complet ?? company.nom_raison_sociale;
  if (!company.siren || !legalName || !establishment.siret) return;

  const sourceSummary = JSON.stringify({
    administrative_source: "API Recherche d'entreprises",
    source_url: sourceUrl,
    source_city_code: establishment.commune,
    canonical_city_code: city.codeInsee,
    retrieved_at: retrievedAt,
    notice: "Candidat administratif actif 69.20Z; inscription Ordre non verifiee.",
  });

  const cabinet = db.prepare(
    `INSERT INTO directory_cabinets
       (siren, legal_name, display_name, naf_code, legal_form, is_active, oec_status, oec_profile_url, oec_verified_at, confidence_score, publish_status, source_summary)
     VALUES
       (@siren, @legal_name, @display_name, @naf_code, @legal_form, 1, 'unverified', NULL, NULL, 65, 'review', @source_summary)
     ON CONFLICT(siren) DO UPDATE SET
       legal_name = excluded.legal_name,
       display_name = excluded.display_name,
       naf_code = excluded.naf_code,
       legal_form = excluded.legal_form,
       is_active = 1,
       source_summary = excluded.source_summary,
       updated_at = datetime('now')
     RETURNING id`,
  ).get({
    siren: company.siren,
    legal_name: legalName,
    display_name: null,
    naf_code: company.activite_principale ?? "69.20Z",
    legal_form: company.nature_juridique ?? null,
    source_summary: sourceSummary,
  }) as { id: number } | undefined;

  const cabinetId = cabinet?.id
    ?? (db.prepare("SELECT id FROM directory_cabinets WHERE siren = ?").get(company.siren) as { id: number }).id;

  const addressLine1 = stripPostalCity(
    establishment.adresse ?? "",
    establishment.code_postal,
    establishment.libelle_commune,
  ) || establishment.adresse;

  db.prepare(
    `INSERT INTO directory_establishments
       (cabinet_id, siret, is_headquarter, is_active, address_line1, address_line2, postal_code, city_name, city_code_insee, department_code, region_code, latitude, longitude, geocode_score, source_key, retrieved_at)
     VALUES
       (@cabinet_id, @siret, @is_headquarter, 1, @address_line1, NULL, @postal_code, @city_name, @city_code_insee, @department_code, @region_code, @latitude, @longitude, @geocode_score, @source_key, @retrieved_at)
     ON CONFLICT(siret) DO UPDATE SET
       cabinet_id = excluded.cabinet_id,
       is_headquarter = excluded.is_headquarter,
       is_active = 1,
       address_line1 = excluded.address_line1,
       postal_code = excluded.postal_code,
       city_name = excluded.city_name,
       city_code_insee = excluded.city_code_insee,
       department_code = excluded.department_code,
       region_code = excluded.region_code,
       latitude = excluded.latitude,
       longitude = excluded.longitude,
       geocode_score = excluded.geocode_score,
       source_key = excluded.source_key,
       retrieved_at = excluded.retrieved_at,
       updated_at = datetime('now')`,
  ).run({
    cabinet_id: cabinetId,
    siret: establishment.siret,
    is_headquarter: establishment.est_siege ? 1 : 0,
    address_line1: addressLine1,
    postal_code: establishment.code_postal ?? null,
    city_name: city.name,
    city_code_insee: city.codeInsee,
    department_code: establishment.departement ?? city.departmentCode,
    region_code: establishment.region ?? city.regionCode,
    latitude: toNumber(establishment.latitude),
    longitude: toNumber(establishment.longitude),
    geocode_score: establishment.latitude && establishment.longitude ? 0.8 : null,
    source_key: SOURCE_KEY,
    retrieved_at: retrievedAt,
  });

  db.prepare(
    `INSERT INTO directory_source_events
       (entity_type, entity_key, source_key, source_url, retrieved_at, parsed_ok, legal_basis, old_value, new_value, change_reason)
     VALUES
       ('establishment', @entity_key, @source_key, @source_url, @retrieved_at, 1, @legal_basis, NULL, @new_value, @change_reason)`,
  ).run({
    entity_key: establishment.siret,
    source_key: SOURCE_KEY,
    source_url: sourceUrl,
    retrieved_at: retrievedAt,
    legal_basis: "Source administrative publique; candidat non verifie Ordre.",
    new_value: sourceSummary,
    change_reason: "directory-bulk-candidate-import",
  });
}

async function main() {
  const options = parseArgs();
  const db = new Database(options.dbPath);
  db.pragma("journal_mode = WAL");
  db.exec(SCHEMA);
  ensureDirectoryRuntimeColumns(db);

  const cities = await fetchCityTargets(options);
  const retrievedAt = new Date().toISOString();

  if (!options.dryRun) {
    const writeCities = db.transaction((targets: CityTarget[]) => {
      upsertSource(db);
      for (const city of targets) upsertCity(db, city);
    });
    writeCities(cities);
  }

  let totalCandidates = 0;
  let totalRequests = 0;
  let totalUnits = 0;
  let importedCities = 0;

  const writeCandidates = db.transaction((candidates: ImportCandidate[]) => {
    for (const candidate of candidates) upsertCandidate(db, candidate, retrievedAt);
  });

  for (const [index, city] of cities.entries()) {
    const { candidates, requests, units } = await fetchCandidatesForCity(city, options);
    totalRequests += requests;
    totalUnits += units;
    totalCandidates += candidates.length;
    importedCities += 1;

    if (!options.dryRun) {
      writeCandidates(candidates);
    }

    console.log(
      `${index + 1}/${cities.length} ${city.name} (${city.codeInsee}): ${candidates.length} candidates, ${units} units, ${requests} requests`,
    );
  }

  const mode = options.dryRun ? "Dry run" : "Directory bulk import";
  console.log(
    `${mode} complete: ${cities.length} cities, ${importedCities} scanned, ${totalCandidates} candidates, ${totalUnits} units, ${totalRequests} requests`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
