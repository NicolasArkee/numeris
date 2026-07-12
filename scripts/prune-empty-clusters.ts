/**
 * scripts/prune-empty-clusters.ts
 *
 * Clusters /ressources « orphelins » : visibles (hors filtre ordre/oec), sans
 * page_sections ET sans keyword enrichissable (tous 301/noindex/déplacés).
 * Plus rien à afficher → 301 vers le hub parent, fusion dans
 * data/redirects-ressources.json (consommé par next.config + filtre sitemap).
 *
 * Idempotent. Dry-run par défaut, --commit pour écrire le JSON.
 */
import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";

const COMMIT = process.argv.includes("--commit");
const DB_PATH = path.join(process.cwd(), "numeris.db");
const REDIRECTS_PATH = path.join(process.cwd(), "data", "redirects-ressources.json");

function main(): void {
  const db = new Database(DB_PATH, { readonly: true });
  const orphans = (db.prepare(`
    SELECT c.slug, c.hub_slug, c.label FROM clusters c
    WHERE lower(c.slug || ' ' || c.label) NOT LIKE '%ordre%'
      AND lower(c.slug || ' ' || c.label) NOT LIKE '%oec%'
      AND NOT EXISTS (SELECT 1 FROM page_sections s WHERE s.route='ressources' AND s.slug=c.slug)
      AND NOT EXISTS (
        SELECT 1 FROM keyword_pages k
        WHERE k.cluster_slug = c.slug AND COALESCE(k.disposition,'enrich') = 'enrich')
  `).all() as { slug: string; hub_slug: string; label: string }[]);
  db.close();

  console.log(`[prune] ${orphans.length} clusters orphelins → 301 vers leur hub`);
  for (const o of orphans.slice(0, 10)) console.log(`  ${o.slug} → /ressources/${o.hub_slug}`);
  if (orphans.length > 10) console.log(`  … +${orphans.length - 10}`);

  if (!COMMIT) { console.log("\nDRY-RUN — relancer avec --commit."); return; }

  const existing = JSON.parse(fs.readFileSync(REDIRECTS_PATH, "utf-8")) as
    { source: string; destination: string; permanent: boolean }[];
  const known = new Set(existing.map((r) => r.source));
  let added = 0;
  for (const o of orphans) {
    const source = `/ressources/${o.slug}`;
    if (known.has(source)) continue;
    existing.push({ source, destination: `/ressources/${o.hub_slug}`, permanent: true });
    added++;
  }
  fs.writeFileSync(REDIRECTS_PATH, `${JSON.stringify(existing, null, 2)}\n`, "utf-8");
  console.log(`[commit] ${added} redirections ajoutées (total ${existing.length})`);
}

main();
