import { BreadcrumbJsonLd, WebPageJsonLd } from "@/components/JsonLd";
import { CtaContact } from "@/components/CtaContact";
import { InternalLinks } from "@/components/InternalLinks";
import { LastUpdated } from "@/components/LastUpdated";
import { MaillageLinks } from "@/components/MaillageLinks";
import { PageHero } from "@/components/PageHero";
import { EditorialPathChooser } from "@/components/hubs/editorial/EditorialPathChooser";
import { EditorialSectionStream } from "@/components/hubs/editorial/EditorialSections";
import { CollectionExplorer, type CollectionItem } from "@/components/hubs/shared/CollectionExplorer";
import type { LinkGroup, PageSection } from "@/libs/db";
import { AppConfig } from "@/utils/AppConfig";

export interface TaxonomyChild {
  slug: string;
  label: string;
  description?: string | null;
  /** Permet aux hubs /guides de conserver leur arborescence propre. */
  href?: string;
  meta?: string;
  tag?: string;
}

export interface TaxonomyHubPageProps {
  h1: string;
  intro: string;
  eyebrow: string;
  breadcrumbs: { name: string; url: string }[];
  canonicalUrl: string;
  children_: TaxonomyChild[];
  childrenTitle: string;
  sections: PageSection[];
  linkGroups: LinkGroup[];
  level?: "hub" | "subhub";
  media?: {
    src: string;
    alt: string;
    position?: string;
    disclaimer?: string;
  };
  lastUpdatedDate?: string;
  schema?: React.ReactNode;
}

const DEFAULT_MEDIA = {
  hub: {
    src: "/images/skoria-v2/editorial/objects.webp",
    alt: "Documents et objets de calcul disposés en composition éditoriale",
  },
  subhub: {
    src: "/images/skoria-v2/editorial/lmnp-dossier.webp",
    alt: "Dossier, plan simplifié et clés disposés sur une table",
  },
} as const;

/** Hub éditorial V2 : un parcours d'abord, puis la profondeur SEO complète. */
export function TaxonomyHubPage({
  h1,
  intro,
  eyebrow,
  breadcrumbs,
  canonicalUrl,
  children_,
  childrenTitle,
  sections,
  linkGroups,
  level = "hub",
  media,
  lastUpdatedDate,
  schema,
}: TaxonomyHubPageProps) {
  const canonicalPath = canonicalUrl.startsWith(AppConfig.url)
    ? canonicalUrl.slice(AppConfig.url.length) || "/"
    : canonicalUrl;
  const itemKind = level === "hub" ? "Dossier" : "Guide";
  const items: CollectionItem[] = children_.map((child) => ({
    href: child.href ?? `/ressources/${child.slug}`,
    title: child.label,
    description: child.description,
    meta: child.meta ?? `${itemKind} · lecture guidée`,
    tag: child.tag,
  }));

  return (
    <>
      <BreadcrumbJsonLd items={breadcrumbs} />
      <WebPageJsonLd
        name={h1}
        description={intro}
        url={canonicalPath}
        dateModified={lastUpdatedDate?.split("T")[0]}
      />
      {schema}

      <PageHero
        eyebrow={`${eyebrow} · ${level === "hub" ? "thème" : "dossier"}`}
        title={h1}
        subtitle={intro}
        breadcrumbs={breadcrumbs}
        badges={children_.length > 0 ? [`${children_.length} ${itemKind.toLowerCase()}${children_.length > 1 ? "s" : ""}`] : undefined}
        ctaSecondary={children_.length > 0 ? { label: "Explorer le dossier", href: "#catalogue" } : undefined}
        variant={level === "subhub" ? "compact" : "default"}
        tone={level === "subhub" ? "lilac" : "navy"}
        media={media ?? DEFAULT_MEDIA[level]}
      />

      {lastUpdatedDate && (
        <div className="border-b border-ink/10 bg-apricot px-5 py-5 sm:px-8">
          <div className="mx-auto max-w-7xl">
            <LastUpdated date={lastUpdatedDate} reviewLabel="Contenu vérifié par l’équipe éditoriale" />
          </div>
        </div>
      )}

      <EditorialPathChooser
        items={items.map((item) => ({
          href: item.href,
          title: item.title,
          description: item.description,
          meta: item.meta,
        }))}
        title={level === "hub" ? "Trouvez le dossier adapté à votre question" : "Construisez votre parcours de lecture"}
      />

      {items.length > 0 && (
        <section id="catalogue" className="scroll-mt-36 bg-paper px-5 py-16 sm:px-8 lg:py-24">
          <div className="mx-auto max-w-7xl">
            <div className="mb-10 grid gap-6 lg:grid-cols-[.72fr_1.28fr] lg:items-end">
              <div>
                <p className="text-[.65rem] font-bold uppercase tracking-[.2em] text-blue">
                  {level === "hub" ? "Vue d’ensemble" : "Dans ce dossier"}
                </p>
                <h2 className="mt-4 text-balance text-[clamp(2.25rem,5vw,4rem)] font-semibold leading-[1.04] tracking-[-.04em] text-ink">
                  {childrenTitle}
                </h2>
              </div>
              <p className="max-w-2xl text-[.94rem] leading-7 text-ink-muted lg:justify-self-end">
                Recherchez un sujet précis ou parcourez l’ensemble des contenus disponibles. Chaque destination conserve sa profondeur éditoriale et ses liens utiles.
              </p>
            </div>
            <CollectionExplorer
              items={items}
              searchPlaceholder={level === "hub" ? "Rechercher un dossier…" : "Rechercher dans les guides…"}
              emptyMessage="Aucun contenu ne correspond à cette recherche."
            />
          </div>
        </section>
      )}

      <EditorialSectionStream
        sections={sections}
        tocTitle={level === "hub" ? "Comprendre ce thème" : "Repères du dossier"}
      />

      <section className="bg-white px-5 py-16 sm:px-8 lg:py-20">
        <div className="mx-auto max-w-7xl">
          <MaillageLinks sourceUrl={canonicalUrl} />
          {linkGroups.length > 0 && (
            <div className="mt-12">
              <InternalLinks groups={linkGroups} />
            </div>
          )}
        </div>
      </section>

      <CtaContact />
    </>
  );
}
