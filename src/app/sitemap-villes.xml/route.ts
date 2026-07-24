import { AppConfig } from "@/utils/AppConfig";
import { db } from "@/libs/db";
import { withRetry } from "@/libs/db/withRetry";

// Sitemap dédié aux pages annuaire villes (/expert-comptable/{ville}) —
// alignées sur le gate robots : toutes les villes avec cabinets listables.
// Déclaré dans robots.ts ; régénéré au plus une fois par heure (ISR).
// getDirectoryListingCities() est prérendue au build (route statique, pas de
// dynamic API) : un 57014 (statement timeout) transitoire côté Supabase au
// moment du build fige un sitemap VIDE pour toute la durée du revalidate —
// withRetry (3 tentatives, backoff) mitige ça ; revalidate court (1h, pas
// 24h) limite le dégât si les 3 tentatives échouent quand même.
export const revalidate = 3600;

export async function GET(): Promise<Response> {
  const baseUrl = AppConfig.url;
  const lastmod = new Date().toISOString().split("T")[0];

  const cities = await withRetry(() => db.getDirectoryListingCities(), []);

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${cities
  .map(
    (city) => `  <url>
    <loc>${baseUrl}/expert-comptable/${city.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>`,
  )
  .join("\n")}
</urlset>`;

  return new Response(xml, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
}
