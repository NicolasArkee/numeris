import Link from "next/link";
import { BreadcrumbJsonLd, WebPageJsonLd } from "@/components/JsonLd";
import { CtaContact } from "@/components/CtaContact";
import { MaillageLinks } from "@/components/MaillageLinks";
import { PageHero } from "@/components/PageHero";
import { CollectionExplorer, type CollectionItem } from "@/components/hubs/shared/CollectionExplorer";
import { db } from "@/libs/db";
import {
  FLAGSHIP_DOSSIERS,
  getEditorialDossiers,
  getPillarPages,
} from "@/libs/ressources/bibliotheque-data";
import { AppConfig } from "@/utils/AppConfig";

function prettify(slug: string): string {
  const label = slug.replace(/-/g, " ");
  return label.charAt(0).toUpperCase() + label.slice(1);
}

/** Vue exhaustive de la bibliothèque, avec recherche et gate de publication. */
export async function AllDossiersPage() {
  const canonicalPath = "/ressources/tous-les-dossiers";
  const canonicalUrl = `${AppConfig.url}${canonicalPath}`;
  const [rawEditorialDossiers, rawPillars, allMeta] = await Promise.all([
    getEditorialDossiers(),
    getPillarPages(),
    db.getAllPageMeta().catch(() => []),
  ]);

  // getEditorialDossiers lit la table de sections pour agréger les slugs. On
  // recroise ici avec page_meta afin qu'un dossier draft ne devienne jamais
  // découvrable dans la bibliothèque publique.
  const publishedResources = new Set(
    allMeta
      .filter((meta) => meta.route === "ressources" && meta.publish_status === "published")
      .map((meta) => meta.slug),
  );
  const editorialDossiers = rawEditorialDossiers.filter((dossier) =>
    publishedResources.has(dossier.slug),
  );
  const resourceStatus = new Map(
    allMeta
      .filter((meta) => meta.route === "ressources")
      .map((meta) => [meta.slug, meta.publish_status]),
  );
  const visiblePillars = rawPillars.filter((pillar) => {
    const status = resourceStatus.get(pillar.slug);
    return status === undefined || status === "published";
  });

  // Les titres SEO ne sont lus qu'au travers du helper déjà gated. En absence
  // d'override publié, on revient au libellé de taxonomie ou au slug lisible.
  const pillars = await Promise.all(
    visiblePillars.map(async (pillar) => {
      const [seo, keyword] = await Promise.all([
        db.getSeoOverride("ressources", pillar.slug).catch(() => null),
        db.getKeywordBySlug(pillar.slug).catch(() => undefined),
      ]);
      return {
        ...pillar,
        title: seo?.h1 || keyword?.label || prettify(pillar.slug),
      };
    }),
  );

  const breadcrumbs = [
    { name: "Accueil", url: "/" },
    { name: "Ressources", url: "/ressources" },
    { name: "Tous les dossiers", url: canonicalPath },
  ];
  const featured = FLAGSHIP_DOSSIERS[0];
  const byHref = new Map<string, CollectionItem>();

  for (const dossier of FLAGSHIP_DOSSIERS) {
    byHref.set(dossier.href, {
      href: dossier.href,
      title: dossier.title,
      description: dossier.description,
      group: "Dossiers phares",
      tag: dossier.tag,
      meta: "Sélection éditoriale",
    });
  }
  for (const pillar of pillars) {
    const href = `/ressources/${pillar.slug}`;
    if (!byHref.has(href)) {
      byHref.set(href, {
        href,
        title: pillar.title,
        group: "Pages de référence",
        meta: "Guide de référence",
      });
    }
  }
  for (const dossier of editorialDossiers) {
    const href = `/ressources/${dossier.slug}`;
    if (!byHref.has(href)) {
      byHref.set(href, {
        href,
        title: dossier.title,
        description: dossier.description,
        group: "Dossiers éditoriaux",
        meta: "Dossier approfondi",
      });
    }
  }
  const items = [...byHref.values()];

  return (
    <>
      <BreadcrumbJsonLd items={breadcrumbs} />
      <WebPageJsonLd
        name="Tous les dossiers"
        description="La vue exhaustive de la bibliothèque Skoria : dossiers phares, thèmes et dossiers éditoriaux publiés."
        url={canonicalPath}
      />

      <PageHero
        eyebrow="Bibliothèque · vue exhaustive"
        title="Tous les dossiers"
        subtitle={`${items.length} ressources pour comprendre, chiffrer et préparer vos choix avec une même grille de lecture.`}
        breadcrumbs={breadcrumbs}
        badges={[`${FLAGSHIP_DOSSIERS.length} sélections`, `${pillars.length} pages de référence`, `${editorialDossiers.length} dossiers publiés`]}
        ctaSecondary={{ label: "Rechercher un sujet", href: "#bibliotheque" }}
        tone="navy"
        media={{
          src: "/images/skoria-v2/editorial/objects.webp",
          alt: "Documents, repères et objets de calcul organisés comme une bibliothèque éditoriale",
        }}
      />

      {featured && (
        <section className="bg-apricot px-5 py-14 sm:px-8 lg:py-20">
          <div className="mx-auto grid max-w-7xl overflow-hidden rounded-[1.5rem] bg-navy text-white lg:grid-cols-[.72fr_1.28fr]">
            <div className="flex min-h-64 flex-col justify-between p-7 sm:p-10">
              <div>
                <p className="text-[.65rem] font-bold uppercase tracking-[.2em] text-[#ffb293]">À la une</p>
                <p className="mt-6 font-serif text-[clamp(3.5rem,8vw,6.4rem)] leading-none text-[#ffb293]">01</p>
              </div>
              <p className="text-[.68rem] uppercase tracking-[.14em] text-white/55">{featured.tag}</p>
            </div>
            <Link href={featured.href} className="group flex flex-col justify-between bg-white p-7 text-ink transition-colors hover:bg-lilac sm:p-10 lg:p-14">
              <div>
                <h2 className="max-w-3xl text-balance text-[clamp(2.2rem,5vw,4.2rem)] font-semibold leading-[1.02] tracking-[-.04em]">
                  {featured.title}
                </h2>
                <p className="mt-6 max-w-2xl text-[.96rem] leading-8 text-ink-muted">{featured.description}</p>
              </div>
              <span className="mt-10 inline-flex items-center gap-3 text-[.78rem] font-bold text-blue">
                Ouvrir le dossier <span aria-hidden className="transition-transform group-hover:translate-x-1">↗</span>
              </span>
            </Link>
          </div>
        </section>
      )}

      <section id="bibliotheque" className="scroll-mt-36 bg-paper px-5 py-16 sm:px-8 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 grid gap-6 lg:grid-cols-[.75fr_1.25fr] lg:items-end">
            <div>
              <p className="text-[.65rem] font-bold uppercase tracking-[.2em] text-blue">Toute la collection</p>
              <h2 className="mt-4 text-balance text-[clamp(2.4rem,5vw,4.25rem)] font-semibold leading-[1.02] tracking-[-.04em] text-ink">
                Cherchez par sujet ou par intention.
              </h2>
            </div>
            <p className="max-w-2xl text-[.94rem] leading-7 text-ink-muted lg:justify-self-end">
              Les filtres rassemblent les sélections, les grandes pages de référence et les dossiers éditoriaux dont la publication a été validée.
            </p>
          </div>
          <CollectionExplorer
            items={items}
            groups={["Dossiers phares", "Pages de référence", "Dossiers éditoriaux"]}
            searchPlaceholder="Rechercher un thème, une réforme, un métier…"
            emptyMessage="Aucun dossier publié ne correspond à cette recherche."
          />
        </div>
      </section>

      <section className="bg-white px-5 py-14 sm:px-8 lg:py-20">
        <div className="mx-auto max-w-7xl">
          <MaillageLinks sourceUrl={canonicalUrl} />
          <div className="mt-12 border-t border-ink/12 pt-8 text-center">
            <Link href="/ressources" className="text-[.8rem] font-bold text-blue underline-offset-4 hover:underline">
              ← Retour à la bibliothèque
            </Link>
          </div>
        </div>
      </section>

      <CtaContact />
    </>
  );
}
