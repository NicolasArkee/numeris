import { AppConfig } from "@/utils/AppConfig";
import { getSupabaseClient } from "@/libs/db/supabase";

// Sitemap dédié aux fiches cabinet ENRICHIES uniquement (/expert-comptable/
// {ville}/{cabinet}) : une fiche entre ici dès qu'elle porte un profile_summary
// displayable (politique d'indexation 2026-07-12 — les fiches nues restent
// noindex et hors sitemap). Requêtes bulk paginées (~35 requêtes pour 32k
// fiches), régénéré au plus une fois par jour (ISR).
export const revalidate = 86400;

const PAGE = 1000;

// Même normalisation que cabinetDirectorySlug / sitemap.ts.
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

export async function GET(): Promise<Response> {
  const baseUrl = AppConfig.url;
  const lastmod = new Date().toISOString().split("T")[0];
  const supa = getSupabaseClient();

  // 1. Tous les établissements porteurs d'un résumé enrichi (paginé).
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
    // Table/colonnes absentes → sitemap vide plutôt qu'une 500.
  }

  // 2. Slugs villes (chunks .in de 200 codes).
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
    // idem : dégradation silencieuse
  }

  const urls: string[] = [];
  for (const [siret, info] of bySiret) {
    const citySlug = citySlugByCode.get(info.cityCode);
    if (!citySlug) continue;
    urls.push(`${baseUrl}/expert-comptable/${citySlug}/${cabinetSlug(info.name, siret)}`);
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
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

  return new Response(xml, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
}
