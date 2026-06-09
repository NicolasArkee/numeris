import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/libs/db";
import { AppConfig } from "@/utils/AppConfig";
import { ClusterPage } from "@/components/ClusterPage";
import { DynamicSection } from "@/components/DynamicSection";
import { getSEOForRessource } from "@/data/seo";
import { getRessourceLinks } from "@/utils/taxonomy";

interface Props {
  params: Promise<{ theme: string }>;
}

const ROUTE = "ressources";

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
  const silos = db.getSilos();
  for (const silo of silos) {
    const hubs = db.getHubsBySilo(silo.slug);
    for (const hub of hubs) {
      push(hub.slug);

      // All clusters under this hub
      const clusters = db.getClustersByHub(hub.slug);
      for (const cluster of clusters) {
        push(cluster.slug);
      }
    }
  }

  // All keyword_pages — required so cluster→keyword internal links don't 404
  // (cluster pages render up to 10 links per cluster via getRessourceLinks)
  const keywords = db.getAllKeywords();
  for (const kw of keywords) {
    push(kw.slug);
  }

  return params;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { theme: slug } = await params;
  const dbSeo = db.getSeoOverride(ROUTE, slug);

  // Try hub first, then cluster
  const hub = db.getHubBySlug(slug);
  if (hub) {
    const fallback = getSEOForRessource(hub, "hub");
    return {
      title: dbSeo?.meta_title ?? fallback.metaTitle,
      description: dbSeo?.meta_description ?? fallback.metaDescription,
      alternates: { canonical: `${AppConfig.url}/ressources/${slug}` },
    };
  }

  const cluster = db.getClusterBySlug(slug);
  if (cluster) {
    const fallback = getSEOForRessource(cluster, "cluster");
    return {
      title: dbSeo?.meta_title ?? fallback.metaTitle,
      description: dbSeo?.meta_description ?? fallback.metaDescription,
      alternates: { canonical: `${AppConfig.url}/ressources/${slug}` },
    };
  }

  const keyword = db.getKeywordBySlug(slug);
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

function ExtraJsonLd({ raw }: { raw: string | null }) {
  if (!raw) return null;
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw) as unknown;
  } catch {
    return null;
  }
  const entries = Array.isArray(parsed) ? parsed : [parsed];
  const valid = entries.filter(
    (e): e is Record<string, unknown> =>
      e !== null && typeof e === "object" && Object.keys(e as object).length > 0,
  );
  if (valid.length === 0) return null;
  return (
    <>
      {valid.map((entry, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(entry) }}
        />
      ))}
    </>
  );
}

function parseTakeaways(raw: string | null): string[] | undefined {
  if (!raw) return undefined;
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (Array.isArray(parsed)) {
      return parsed.filter((x): x is string => typeof x === "string");
    }
  } catch {
    // fall through
  }
  return undefined;
}

export default async function ThemePage({ params }: Props) {
  const { theme: slug } = await params;

  // ─── Resolve which entity this slug maps to (hub | cluster | keyword) ───
  const hub = db.getHubBySlug(slug);
  const cluster = !hub ? db.getClusterBySlug(slug) : undefined;
  const keyword = !hub && !cluster ? db.getKeywordBySlug(slug) : undefined;
  if (!hub && !cluster && !keyword) notFound();

  // ─── DB-first short-circuit (applies regardless of entity type) ───
  const dbSections = db.getPageSections(ROUTE, slug);
  const dbSeo = db.getSeoOverride(ROUTE, slug);
  const dbMeta = db.getPageMeta(ROUTE, slug);
  const lastUpdatedDate = dbMeta?.reviewed_at;
  const canonicalUrl = `${AppConfig.url}/ressources/${slug}`;
  const hasDbContent = dbSections.length > 0;

  if (hasDbContent) {
    // Build chrome (eyebrow + breadcrumbs + linkGroups) from the matched entity.
    let eyebrow = "Ressources";
    let label = slug;
    let breadcrumbs: { name: string; url: string }[] = [
      { name: "Accueil", url: "/" },
      { name: "Ressources", url: "/ressources" },
    ];
    let linkGroups: ReturnType<typeof getRessourceLinks> = [];
    let badges: string[] = [];
    let fallbackIntro = "";
    let fallbackH1 = "";

    if (hub) {
      label = hub.label;
      const silo = db.getSiloBySlug(hub.silo_slug);
      eyebrow = silo?.label || "Ressources";
      breadcrumbs.push({ name: hub.label, url: `/ressources/${slug}` });
      linkGroups = getRessourceLinks(slug, "hub");
      badges = [
        `${hub.volume.toLocaleString("fr-FR")} recherches/mois`,
        `${hub.n_keywords} mots-clés`,
      ];
      const fb = getSEOForRessource(hub, "hub");
      fallbackIntro = fb.intro;
      fallbackH1 = fb.h1;
    } else if (cluster) {
      label = cluster.label;
      const parentHub = db.getHubBySlug(cluster.hub_slug);
      eyebrow = parentHub?.label || "Ressources";
      if (parentHub) {
        breadcrumbs.push({ name: parentHub.label, url: `/ressources/${parentHub.slug}` });
      }
      breadcrumbs.push({ name: cluster.label, url: `/ressources/${slug}` });
      linkGroups = getRessourceLinks(slug, "cluster");
      badges = [
        `${cluster.volume.toLocaleString("fr-FR")} recherches/mois`,
        `${cluster.n_keywords} mots-clés`,
      ];
      const fb = getSEOForRessource(cluster, "cluster");
      fallbackIntro = fb.intro;
      fallbackH1 = fb.h1;
    } else if (keyword) {
      label = keyword.label;
      const parentCluster = db.getClusterBySlug(keyword.cluster_slug);
      const parentHub = parentCluster ? db.getHubBySlug(parentCluster.hub_slug) : undefined;
      const parentSilo = parentHub ? db.getSiloBySlug(parentHub.silo_slug) : undefined;
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
      linkGroups = getRessourceLinks(slug, "keyword");
      if (keyword.volume > 0) {
        badges.push(`${keyword.volume.toLocaleString("fr-FR")} recherches/mois`);
      }
      if (keyword.intent) {
        badges.push(`Intent : ${keyword.intent}`);
      }
      const fb = getSEOForRessource(keyword, "keyword");
      fallbackIntro = fb.intro;
      fallbackH1 = keyword.h1 || fb.h1;
    }

    const heroSection = dbSections.find(
      (s) => s.section_type === "Hero" || s.section_type === "ContentSection",
    );
    const h1 = dbSeo?.h1 ?? fallbackH1 ?? label;
    const intro = dbSeo?.meta_description ?? heroSection?.body ?? fallbackIntro;
    const inlineFaq = dbSections.some((s) => s.section_type === "Faq");
    const keyTakeaways = parseTakeaways(dbSeo?.key_takeaways ?? null);

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
        {dbSections
          .filter((s) => s.section_type !== "Hero")
          .map((s) => (
            <DynamicSection key={s.id} section={s} />
          ))}
      </ClusterPage>
    );
  }

  // ─── Fallback static path (unchanged from pre-wire) ───
  if (hub) {
    const seo = getSEOForRessource(hub, "hub");
    const linkGroups = getRessourceLinks(slug, "hub");
    const clusters = db.getClustersByHub(slug);
    const silo = db.getSiloBySlug(hub.silo_slug);

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
            <h2 className="mb-6 font-serif text-[1.5rem] font-light text-encre">
              Articles dans ce thème
            </h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {clusters.map((c) => (
                <Link
                  key={c.slug}
                  href={`/ressources/${c.slug}`}
                  className="border border-pierre-12 bg-blanc px-6 py-5 transition-colors hover:border-or"
                >
                  <h3 className="mb-1 text-[0.95rem] font-medium text-encre">{c.label}</h3>
                  <p className="text-[0.68rem] text-ardoise">
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
    const linkGroups = getRessourceLinks(slug, "cluster");
    const keywords = db.getKeywordsByCluster(slug);
    const parentHub = db.getHubBySlug(cluster.hub_slug);

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
            <h2 className="mb-6 font-serif text-[1.5rem] font-light text-encre">
              Mots-clés associés
            </h2>
            <div className="flex flex-wrap gap-2">
              {keywords.map((kw) => (
                <span
                  key={kw.slug}
                  className="border border-pierre-12 bg-blanc px-3 py-1.5 text-[0.72rem] text-ardoise"
                >
                  {kw.label}
                  <span className="ml-1 text-pierre-12">
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
    const linkGroups = getRessourceLinks(slug, "keyword");
    const parentCluster = db.getClusterBySlug(keyword.cluster_slug);
    const parentHub = parentCluster ? db.getHubBySlug(parentCluster.hub_slug) : undefined;
    const parentSilo = parentHub ? db.getSiloBySlug(parentHub.silo_slug) : undefined;

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
          <div className="mb-12 border border-pierre-12 bg-blanc px-7 py-6">
            <p className="mb-3 text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-or">
              Article principal
            </p>
            <Link
              href={`/ressources/${parentCluster.slug}`}
              className="block text-[1.05rem] font-medium text-encre transition-colors hover:text-or-fonce"
            >
              {parentCluster.label} →
            </Link>
            <p className="mt-2 text-[0.78rem] text-ardoise">
              Retrouvez le guide complet sur ce thème, dont {keyword.label.toLowerCase()} fait partie.
            </p>
          </div>
        )}
      </ClusterPage>
    );
  }

  notFound();
}
