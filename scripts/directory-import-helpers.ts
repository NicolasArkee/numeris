export type GeoCommune = {
  code?: string;
  nom?: string;
  population?: number;
  codesPostaux?: string[];
  centre?: { coordinates?: [number, number] };
  departement?: { code?: string; nom?: string };
  region?: { code?: string; nom?: string };
};

export type CityTarget = {
  codeInsee: string;
  name: string;
  slug: string;
  postalCodes: string[];
  departmentCode: string;
  departmentName: string;
  regionCode: string;
  regionName: string;
  latitude: number | null;
  longitude: number | null;
  population: number;
  searchCodes: string[];
};

export type ApiEstablishment = {
  activite_principale?: string | null;
  adresse?: string | null;
  code_postal?: string | null;
  commune?: string | null;
  departement?: string | null;
  est_siege?: boolean | null;
  etat_administratif?: string | null;
  latitude?: string | null;
  libelle_commune?: string | null;
  longitude?: string | null;
  region?: string | null;
  siret?: string | null;
};

export type ApiCompany = {
  siren?: string | null;
  nom_complet?: string | null;
  nom_raison_sociale?: string | null;
  activite_principale?: string | null;
  etat_administratif?: string | null;
  nature_juridique?: string | null;
  siege?: ApiEstablishment | null;
  matching_etablissements?: ApiEstablishment[] | null;
};

export type ImportCandidate = {
  company: ApiCompany;
  establishment: ApiEstablishment;
  city: CityTarget;
  sourceUrl: string;
};

const PLM_SEARCH_CODES: Record<string, string[]> = {
  "75056": Array.from({ length: 20 }, (_, index) => `751${String(index + 1).padStart(2, "0")}`),
  "13055": Array.from({ length: 16 }, (_, index) => `132${String(index + 1).padStart(2, "0")}`),
  "69123": Array.from({ length: 9 }, (_, index) => `6938${index + 1}`),
};

export function totalPages(totalResults: number, perPage: number): number {
  if (totalResults <= 0) return 0;
  return Math.ceil(totalResults / perPage);
}

export function slugifyCityName(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function searchCodesForCity(codeInsee: string): string[] {
  return PLM_SEARCH_CODES[codeInsee] ?? [codeInsee];
}

export function escapeRegExp(value: string): string {
  return value.replace(/[\\^$.*+?()[\]{}|\-]/g, "\\$&");
}

export function stripPostalCity(
  address: string,
  postalCode: string | null | undefined,
  cityName: string | null | undefined,
): string {
  if (!postalCode || !cityName) return address;
  const suffix = new RegExp(`\\s+${escapeRegExp(postalCode)}\\s+${escapeRegExp(cityName)}$`, "i");
  return address.replace(suffix, "").trim();
}

export function buildCityTargets(communes: GeoCommune[], limit = 2000): CityTarget[] {
  const selected = communes
    .filter((commune) => commune.code && commune.nom && typeof commune.population === "number")
    .sort((a, b) => (b.population ?? 0) - (a.population ?? 0))
    .slice(0, limit);

  const slugCounts = new Map<string, number>();
  for (const commune of selected) {
    const baseSlug = slugifyCityName(commune.nom ?? "");
    slugCounts.set(baseSlug, (slugCounts.get(baseSlug) ?? 0) + 1);
  }

  return selected.map((commune) => {
    const codeInsee = commune.code ?? "";
    const departmentCode = commune.departement?.code ?? null;
    const baseSlug = slugifyCityName(commune.nom ?? codeInsee);
    const slug = slugCounts.get(baseSlug)! > 1 && departmentCode
      ? `${baseSlug}-${departmentCode.toLowerCase()}`
      : baseSlug;
    const coordinates = commune.centre?.coordinates;

    return {
      codeInsee,
      name: commune.nom ?? codeInsee,
      slug,
      postalCodes: commune.codesPostaux ?? [],
      departmentCode: departmentCode ?? "",
      departmentName: commune.departement?.nom ?? "",
      regionCode: commune.region?.code ?? "",
      regionName: commune.region?.nom ?? "",
      latitude: coordinates ? coordinates[1] : null,
      longitude: coordinates ? coordinates[0] : null,
      population: commune.population ?? 0,
      searchCodes: searchCodesForCity(codeInsee),
    };
  });
}

function isRelevantCompany(company: ApiCompany): boolean {
  return (
    company.siren != null
    && company.etat_administratif === "A"
    && company.activite_principale === "69.20Z"
    && (company.nom_complet != null || company.nom_raison_sociale != null)
  );
}

function isRelevantEstablishment(establishment: ApiEstablishment, city: CityTarget): boolean {
  return (
    establishment.siret != null
    && establishment.etat_administratif === "A"
    && establishment.activite_principale === "69.20Z"
    && establishment.commune != null
    && city.searchCodes.includes(establishment.commune)
  );
}

export function pickCandidates(
  company: ApiCompany,
  city: CityTarget,
  sourceUrl: string,
): ImportCandidate[] {
  if (!isRelevantCompany(company)) return [];

  const matches = [
    ...(company.matching_etablissements ?? []),
    ...(company.siege ? [company.siege] : []),
  ];
  const seen = new Set<string>();

  return matches
    .filter((establishment) => isRelevantEstablishment(establishment, city))
    .filter((establishment) => {
      const siret = establishment.siret;
      if (!siret || seen.has(siret)) return false;
      seen.add(siret);
      return true;
    })
    .map((establishment) => ({ company, establishment, city, sourceUrl }));
}
