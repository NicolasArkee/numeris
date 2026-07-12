import { AppConfig } from "@/utils/AppConfig";
import { db } from "@/libs/db";

// Sitemap dédié aux pages annuaire villes (/expert-comptable/{ville}) —
// alignées sur le gate robots : toutes les villes avec cabinets listables.
// Déclaré dans robots.ts ; régénéré au plus une fois par jour (ISR).
export const revalidate = 86400;

export async function GET(): Promise<Response> {
  const baseUrl = AppConfig.url;
  const lastmod = new Date().toISOString().split("T")[0];

  let cities: Awaited<ReturnType<typeof db.getDirectoryListingCities>> = [];
  try {
    cities = await db.getDirectoryListingCities();
  } catch {
    cities = [];
  }

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
