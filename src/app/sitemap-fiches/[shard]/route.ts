import { AppConfig } from "@/utils/AppConfig";
import {
  FICHES_PER_SHARD,
  getEnrichedFichePaths,
  renderUrlset,
} from "@/libs/sitemap-fiches-data";
import { withRetry } from "@/libs/db/withRetry";

// Shard n du sitemap fiches : /sitemap-fiches/{n}.xml — tranche stable de
// 10 000 fiches enrichies (tri SIRET). Référencé par l'index
// /sitemap-fiches.xml. Un shard vide (course avec la croissance de
// l'annuaire) rend un urlset vide valide. Route dynamique (segment [shard]) —
// pas de risque de figer un build vide, mais withRetry évite un 500
// transitoire (57014) sur une requête de crawler.
export const revalidate = 86400;

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ shard: string }> },
): Promise<Response> {
  const { shard } = await params;
  const n = Number.parseInt(shard.replace(/\.xml$/u, ""), 10);
  if (!Number.isInteger(n) || n < 1) {
    return new Response("Not found", { status: 404 });
  }

  const paths = await withRetry(() => getEnrichedFichePaths(), []);
  const slice = paths.slice((n - 1) * FICHES_PER_SHARD, n * FICHES_PER_SHARD);
  const lastmod = new Date().toISOString().split("T")[0];

  return new Response(
    renderUrlset(slice.map((p) => `${AppConfig.url}${p}`), lastmod),
    { headers: { "Content-Type": "application/xml; charset=utf-8" } },
  );
}
