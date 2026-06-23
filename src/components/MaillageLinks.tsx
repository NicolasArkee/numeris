import Link from "next/link";
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
    <section className="mt-16 border-t border-border-soft pt-8" aria-label="Liens utiles">
      <h2 className="mb-5 font-display text-[1.3rem] font-medium text-ink">Liens utiles</h2>
      <ul className="grid gap-2.5 md:grid-cols-2">
        {links.map((l) => (
          <li key={l.target_url}>
            <Link
              href={toHref(l.target_url)}
              className="group inline-flex items-center gap-2 text-[0.85rem] text-ink-muted transition-colors hover:text-accent-700"
            >
              <span className="h-1 w-1 flex-shrink-0 bg-border-soft transition-colors group-hover:bg-accent-500" />
              {l.anchor}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
