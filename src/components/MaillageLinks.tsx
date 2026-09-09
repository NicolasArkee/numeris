import { RelatedPages } from "./RelatedPages";
import { db } from "@/libs/db";
import { AppConfig } from "@/utils/AppConfig";

/**
 * "Liens utiles" — internal maillage block (maillage-v3).
 *
 * Async server component: fetches contextual links for the page whose canonical
 * URL == `sourceUrl` from the universal `maillage_links` table, so it renders on
 * ANY page (taxonomy-rendered or DB-rendered) without touching its sections.
 * Returns null when there are no links (or the table is absent pre-migration).
 */
export async function MaillageLinks({ sourceUrl }: { sourceUrl: string }) {
  let links: Awaited<ReturnType<typeof db.getMaillageLinks>>;
  try {
    links = await db.getMaillageLinks(sourceUrl);
  } catch {
    links = [];
  }
  if (!links || links.length === 0) return null;

  const toHref = (url: string) =>
    url.startsWith(AppConfig.url) ? url.slice(AppConfig.url.length) || "/" : url;

  return (
    <RelatedPages
      title="Les sujets à explorer ensuite."
      eyebrow="Liens utiles"
      description="Retrouvez les pages associées pour approfondir un point, préciser votre besoin ou poursuivre votre comparaison."
      links={links.map((link) => ({ href: toHref(link.target_url), label: link.anchor }))}
    />
  );
}
