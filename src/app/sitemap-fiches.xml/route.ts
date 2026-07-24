import { AppConfig } from "@/utils/AppConfig";
import {
  FICHES_PER_SHARD,
  getEnrichedFichePaths,
} from "@/libs/sitemap-fiches-data";
import { withRetry } from "@/libs/db/withRetry";

// SITEMAP INDEX des fiches cabinet enrichies — pointe vers des shards de
// 10 000 URLs (/sitemap-fiches/{n}.xml). L'URL /sitemap-fiches.xml reste
// celle déclarée dans robots.ts / soumise à GSC : elle est passée de urlset
// à sitemapindex quand le volume a dépassé le mono-fichier (2026-07-13).
// Route statique prérendue au build : withRetry mitige un 57014 (statement
// timeout) transitoire côté Supabase pendant la pagination (~35 requêtes) ;
// revalidate court (1h) limite le dégât si les tentatives échouent quand même.
export const revalidate = 3600;

export async function GET(): Promise<Response> {
  const paths = await withRetry(() => getEnrichedFichePaths(), []);
  const shardCount = Math.max(1, Math.ceil(paths.length / FICHES_PER_SHARD));
  const lastmod = new Date().toISOString().split("T")[0];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${Array.from({ length: shardCount }, (_, i) => `  <sitemap>
    <loc>${AppConfig.url}/sitemap-fiches/${i + 1}.xml</loc>
    <lastmod>${lastmod}</lastmod>
  </sitemap>`).join("\n")}
</sitemapindex>`;

  return new Response(xml, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
}
