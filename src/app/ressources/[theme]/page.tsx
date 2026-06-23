import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/libs/db";
import { AppConfig } from "@/utils/AppConfig";
import { ClusterPage } from "@/components/ClusterPage";
import { DynamicSection } from "@/components/DynamicSection";
import { ExtraJsonLd } from "@/components/ExtraJsonLd";
import { getDbPageBundle } from "@/libs/content/dbFirst";
import { getSEOForRessource } from "@/data/seo";
import { getRessourceLinks } from "@/utils/taxonomy";

interface Props {
  params: Promise<{ theme: string }>;
}

const ROUTE = "ressources";

export const revalidate = 86400;
// Serve DB-only ressources slugs (ex. maillage-v3 dossier hubs `dossier-*`,
// `tous-les-dossiers`) that aren't taxonomy hubs/clusters/keywords → rendered
// on-demand (ISR) the first time they're requested, then cached per `revalidate`.
export const dynamicParams = true;

export async function generateStaticParams() {
  const params: { theme: string }[] = [];
  const seen = new Set<string>();
  const push = (slug: string) => {
    if (slug && !seen.has(slug)) {
      seen.add(slug);
      params.push({ theme: slug });
    }
  };

  // All hubs + clusters
  const silos = await db.getSilos();
  for (const silo of silos) {
    const hubs = await db.getHubsBySilo(silo.slug);
    for (const hub of hubs) {
      push(hub.slug);

      // All clusters under this hub
      const clusters = await db.getClustersByHub(hub.slug);
      for (const cluster of clusters) {
        push(cluster.slug);
      }
    }
  }

  // All keyword_pages — required so cluster→keyword internal links don't 404
  // (cluster pages render up to 10 links per cluster via getRessourceLinks)
  const keywords = await db.getAllKeywords();
  for (const kw of keywords) {
    push(kw.slug);
  }

  return params;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { theme: slug } = await params;
  const dbSeo = await db.getSeoOverride(ROUTE, slug);

  // Try hub first, then cluster
  const hub = await db.getHubBySlug(slug);
  if (hub) {
    const fallback = getSEOForRessource(hub, "hub");
    return {
      title: dbSeo?.meta_title ?? fallback.metaTitle,
      description: dbSeo?.meta_description ?? fallback.metaDescription,
      alternates: { canonical: `${AppConfig.url}/ressources/${slug}` },
    };
  }

  const cluster = await db.getClusterBySlug(slug);
  if (cluster) {
    const fallback = getSEOForRessource(cluster, "cluster");
    return {
      title: dbSeo?.meta_title ?? fallback.metaTitle,
      description: dbSeo?.meta_description ?? fallback.metaDescription,
      alternates: { canonical: `${AppConfig.url}/ressources/${slug}` },
    };
  }

  const keyword = await db.getKeywordBySlug(slug);
  if (keyword) {
    const fallback = getSEOForRessource(keyword, "keyword");
    return {
      title: dbSeo?.meta_title ?? keyword.meta_title ?? fallback.metaTitle,
      description: dbSeo?.meta_description ?? keyword.meta_description ?? fallback.metaDescription,
      alternates: { canonical: `${AppConfig.url}/ressources/${slug}` },
    };
  }

  return {};
}

export default async function ThemePage({ params }: Props) {
  const { theme: slug } = await params;

  // ─── Resolve which entity this slug maps to (hub | cluster | keyword) ───
  const hub = await db.getHubBySlug(slug);
  const cluster = !hub ? await db.getClusterBySlug(slug) : undefined;
  const keyword = !hub && !cluster ? await db.getKeywordBySlug(slug) : undefined;

  // ─── DB-first short-circuit (applies regardless of entity type) ───
  const bundle = await getDbPageBundle(ROUTE, slug);
  const { sections: dbSections, seo: dbSeo, lastUpdatedDate, hasDbContent } = bundle;
  const canonicalUrl = `${AppConfig.url}/ressources/${slug}`;

  // 404 only when the slug is neither a taxonomy entity NOR a DB-rendered page
  // (the latter covers maillage-v3 `dossier-*` hubs that have no hub/cluster/keyword).
  if (!hub && !cluster && !keyword && !hasDbContent) notFound();

  if (hasDbContent) {
    // Build chrome (eyebrow + breadcrumbs + linkGroups) from the matched entity.
    let eyebrow = "Ressources";
    let label = slug;
    let breadcrumbs: { name: string; url: string }[] = [
      { name: "Accueil", url: "/" },
      { name: "Ressources", url: "/ressources" },
    ];
    let linkGroups: Awaited<ReturnType<typeof getRessourceLinks>> = [];
    let badges: string[] = [];
    let fallbackIntro = "";
    let fallbackH1 = "";

    if (hub) {
      label = hub.label;
      const silo = await db.getSiloBySlug(hub.silo_slug);
      eyebrow = silo?.label || "Ressources";
      breadcrumbs.push({ name: hub.label, url: `/ressources/${slug}` });
      linkGroups = await getRessourceLinks(slug, "hub");
      badges = [
        `${hub.volume.toLocaleString("fr-FR")} recherches/mois`,
        `${hub.n_keywords} mots-clés`,
      ];
      const fb = getSEOForRessource(hub, "hub");
      fallbackIntro = fb.intro;
      fallbackH1 = fb.h1;
    } else if (cluster) {
      label = cluster.label;
      const parentHub = await db.getHubBySlug(cluster.hub_slug);
      eyebrow = parentHub?.label || "Ressources";
      if (parentHub) {
        breadcrumbs.push({ name: parentHub.label, url: `/ressources/${parentHub.slug}` });
      }
      breadcrumbs.push({ name: cluster.label, url: `/ressources/${slug}` });
      linkGroups = await getRessourceLinks(slug, "cluster");
      badges = [
        `${cluster.volume.toLocaleString("fr-FR")} recherches/mois`,
        `${cluster.n_keywords} mots-clés`,
      ];
      const fb = getSEOForRessource(cluster, "cluster");
      fallbackIntro = fb.intro;
      fallbackH1 = fb.h1;
    } else if (keyword) {
      label = keyword.label;
      const parentCluster = await db.getClusterBySlug(keyword.cluster_slug);
      const parentHub = parentCluster ? await db.getHubBySlug(parentCluster.hub_slug) : undefined;
      const parentSilo = parentHub ? await db.getSiloBySlug(parentHub.silo_slug) : undefined;
      eyebrow = parentCluster?.label || parentHub?.label || "Ressources";
      if (parentSilo) {
        breadcrumbs.push({ name: parentSilo.label, url: `/ressources/${parentSilo.slug}` });
      }
      if (parentHub) {
        breadcrumbs.push({ name: parentHub.label, url: `/ressources/${parentHub.slug}` });
      }
      if (parentCluster) {
        breadcrumbs.push({ name: parentCluster.label, url: `/ressources/${parentCluster.slug}` });
      }
      breadcrumbs.push({ name: keyword.label, url: `/ressources/${slug}` });
      linkGroups = await getRessourceLinks(slug, "keyword");
      if (keyword.volume > 0) {
        badges.push(`${keyword.volume.toLocaleString("fr-FR")} recherches/mois`);
      }
      if (keyword.intent) {
        badges.push(`Intent : ${keyword.intent}`);
      }
      const fb = getSEOForRessource(keyword, "keyword");
      fallbackIntro = fb.intro;
      fallbackH1 = keyword.h1 || fb.h1;
    } else {
      // DB-only page with no taxonomy entity (ex. maillage-v3 `dossier-*` hub).
      // Generic "Ressources" chrome; H1/intro come from the SEO override + hero section.
      label =
        dbSeo?.h1 ??
        slug.replace(/^dossier-/, "").replace(/-/g, " ").replace(/^\w/, (c) => c.toUpperCase());
      breadcrumbs.push({ name: label, url: `/ressources/${slug}` });
      fallbackH1 = label;
      fallbackIntro = bundle.heroSection?.body ?? "";
    }

    const h1 = dbSeo?.h1 ?? fallbackH1 ?? label;
    const intro = dbSeo?.meta_description ?? bundle.heroSection?.body ?? fallbackIntro;
    const { inlineFaq, keyTakeaways } = bundle;

    return (
      <ClusterPage
        eyebrow={eyebrow}
        h1={h1}
        intro={intro}
        breadcrumbs={breadcrumbs}
        badges={badges}
        faqs={inlineFaq ? undefined : undefined}
        linkGroups={linkGroups}
        keyTakeaways={keyTakeaways}
        schema={<ExtraJsonLd raw={dbSeo?.json_ld_extra ?? null} />}
        lastUpdatedDate={lastUpdatedDate}
        articleSchema={true}
        articleHeadline={h1}
        articleSection="Ressources éditoriales"
        canonicalUrl={canonicalUrl}
      >
        {bundle.renderableSections.map((s) => (
          <DynamicSection key={s.id} section={s} />
        ))}
      </ClusterPage>
    );
  }

  // ─── Fallback static path (unchanged from pre-wire) ───
  if (hub) {
    const seo = getSEOForRessource(hub, "hub");
    const linkGroups = await getRessourceLinks(slug, "hub");
    const clusters = await db.getClustersByHub(slug);
    const silo = await db.getSiloBySlug(hub.silo_slug);

    return (
      <ClusterPage
        eyebrow={silo?.label || "Ressources"}
        h1={seo.h1}
        intro={seo.intro}
        breadcrumbs={[
          { name: "Accueil", url: "/" },
          { name: "Ressources", url: "/ressources" },
          { name: hub.label, url: `/ressources/${slug}` },
        ]}
        badges={[
          `${hub.volume.toLocaleString("fr-FR")} recherches/mois`,
          `${hub.n_keywords} mots-clés`,
        ]}
        faqs={seo.faqs}
        linkGroups={linkGroups}
      >
        {clusters.length > 0 && (
          <div className="mb-12">
            <h2 className="mb-6 font-display text-[1.5rem] font-bold text-ink">
              Articles dans ce thème
            </h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {clusters.map((c) => (
                <Link
                  key={c.slug}
                  href={`/ressources/${c.slug}`}
                  className="border border-border-soft bg-surface px-6 py-5 transition-colors hover:border-accent-500"
                >
                  <h3 className="mb-1 text-[0.95rem] font-medium text-ink">{c.label}</h3>
                  <p className="text-[0.68rem] text-ink-muted">
                    {c.volume.toLocaleString("fr-FR")} recherches · {c.n_keywords} mots-clés
                  </p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </ClusterPage>
    );
  }

  if (cluster) {
    const seo = getSEOForRessource(cluster, "cluster");
    const linkGroups = await getRessourceLinks(slug, "cluster");
    const keywords = await db.getKeywordsByCluster(slug);
    const parentHub = await db.getHubBySlug(cluster.hub_slug);

    return (
      <ClusterPage
        eyebrow={parentHub?.label || "Ressources"}
        h1={seo.h1}
        intro={seo.intro}
        breadcrumbs={[
          { name: "Accueil", url: "/" },
          { name: "Ressources", url: "/ressources" },
          ...(parentHub
            ? [{ name: parentHub.label, url: `/ressources/${parentHub.slug}` }]
            : []),
          { name: cluster.label, url: `/ressources/${slug}` },
        ]}
        badges={[
          `${cluster.volume.toLocaleString("fr-FR")} recherches/mois`,
          `${cluster.n_keywords} mots-clés`,
        ]}
        faqs={seo.faqs}
        linkGroups={linkGroups}
      >
        {keywords.length > 0 && (
          <div className="mb-12">
            <h2 className="mb-6 font-display text-[1.5rem] font-bold text-ink">
              Mots-clés associés
            </h2>
            <div className="flex flex-wrap gap-2">
              {keywords.map((kw) => (
                <span
                  key={kw.slug}
                  className="border border-border-soft bg-surface px-3 py-1.5 text-[0.72rem] text-ink-muted"
                >
                  {kw.label}
                  <span className="ml-1 text-border-soft">
                    {kw.volume.toLocaleString("fr-FR")}
                  </span>
                </span>
              ))}
            </div>
          </div>
        )}
      </ClusterPage>
    );
  }

  if (keyword) {
    const seo = getSEOForRessource(keyword, "keyword");
    const linkGroups = await getRessourceLinks(slug, "keyword");
    const parentCluster = await db.getClusterBySlug(keyword.cluster_slug);
    const parentHub = parentCluster ? await db.getHubBySlug(parentCluster.hub_slug) : undefined;
    const parentSilo = parentHub ? await db.getSiloBySlug(parentHub.silo_slug) : undefined;

    const h1 = keyword.h1 || seo.h1;
    const intro = seo.intro;
    const badges: string[] = [];
    if (keyword.volume > 0) {
      badges.push(`${keyword.volume.toLocaleString("fr-FR")} recherches/mois`);
    }
    if (keyword.intent) {
      badges.push(`Intent : ${keyword.intent}`);
    }

    return (
      <ClusterPage
        eyebrow={parentCluster?.label || parentHub?.label || "Ressources"}
        h1={h1}
        intro={intro}
        breadcrumbs={[
          { name: "Accueil", url: "/" },
          { name: "Ressources", url: "/ressources" },
          ...(parentSilo
            ? [{ name: parentSilo.label, url: `/ressources/${parentSilo.slug}` }]
            : []),
          ...(parentHub
            ? [{ name: parentHub.label, url: `/ressources/${parentHub.slug}` }]
            : []),
          ...(parentCluster
            ? [{ name: parentCluster.label, url: `/ressources/${parentCluster.slug}` }]
            : []),
          { name: keyword.label, url: `/ressources/${slug}` },
        ]}
        badges={badges}
        faqs={seo.faqs}
        linkGroups={linkGroups}
      >
        {parentCluster && (
          <div className="mb-12 border border-border-soft bg-surface px-7 py-6">
            <p className="mb-3 text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-accent-500">
              Article principal
            </p>
            <Link
              href={`/ressources/${parentCluster.slug}`}
              className="block text-[1.05rem] font-medium text-ink transition-colors hover:text-accent-700"
            >
              {parentCluster.label} →
            </Link>
            <p className="mt-2 text-[0.78rem] text-ink-muted">
              Retrouvez le guide complet sur ce thème, dont {keyword.label.toLowerCase()} fait partie.
            </p>
          </div>
        )}
      </ClusterPage>
    );
  }

  notFound();
}
