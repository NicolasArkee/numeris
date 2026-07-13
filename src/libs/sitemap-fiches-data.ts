import { getSupabaseClient } from "@/libs/db/supabase";

// Données partagées des sitemaps fiches (index + shards) : URLs des fiches
// cabinet ENRICHIES uniquement (profile_summary displayable), dédupliquées
// par SIRET (une fiche peut porter un résumé « inferred » ET un résumé
// « website »), triées par SIRET pour une pagination stable entre shards.

const PAGE = 1000;
export const FICHES_PER_SHARD = 10_000;

function cabinetSlug(name: string, siret: string): string {
  return `${name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")}-${siret}`;
}

type FactRow = {
  establishment: {
    id: number;
    siret: string;
    is_active: boolean;
    city_code_insee: string | null;
    cabinet: {
      display_name: string | null;
      legal_name: string;
      is_active: boolean;
    } | null;
  } | null;
};

/** Chemins relatifs (/expert-comptable/{ville}/{cabinet}) des fiches enrichies,
 *  dédupliqués et triés. ~35 requêtes paginées pour 32k facts. */
export async function getEnrichedFichePaths(): Promise<string[]> {
  const supa = getSupabaseClient();

  const bySiret = new Map<string, { name: string; cityCode: string }>();
  try {
    for (let from = 0; ; from += PAGE) {
      const { data, error } = await supa
        .from("directory_profile_facts")
        .select(
          "establishment:directory_establishments(id, siret, is_active, city_code_insee, cabinet:directory_cabinets(display_name, legal_name, is_active))",
        )
        .eq("fact_type", "profile_summary")
        .eq("is_displayable", true)
        .range(from, from + PAGE - 1);
      if (error) throw error;
      const rows = (data ?? []) as unknown as FactRow[];
      for (const row of rows) {
        const est = row.establishment;
        if (!est?.is_active || !est.cabinet?.is_active || !est.city_code_insee) continue;
        bySiret.set(est.siret, {
          name: est.cabinet.display_name ?? est.cabinet.legal_name,
          cityCode: est.city_code_insee,
        });
      }
      if (rows.length < PAGE) break;
    }
  } catch {
    return [];
  }

  const codes = [...new Set([...bySiret.values()].map((v) => v.cityCode))];
  const citySlugByCode = new Map<string, string>();
  try {
    for (let i = 0; i < codes.length; i += 200) {
      const { data, error } = await supa
        .from("cities_official")
        .select("code_insee, slug")
        .in("code_insee", codes.slice(i, i + 200));
      if (error) throw error;
      for (const c of (data ?? []) as { code_insee: string; slug: string }[]) {
        citySlugByCode.set(c.code_insee, c.slug);
      }
    }
  } catch {
    return [];
  }

  const paths: string[] = [];
  for (const [siret, info] of [...bySiret.entries()].sort(([a], [b]) => a.localeCompare(b))) {
    const citySlug = citySlugByCode.get(info.cityCode);
    if (!citySlug) continue;
    paths.push(`/expert-comptable/${citySlug}/${cabinetSlug(info.name, siret)}`);
  }
  return paths;
}

export function renderUrlset(urls: string[], lastmod: string): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (loc) => `  <url>
    <loc>${loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>`,
  )
  .join("\n")}
</urlset>`;
}
