import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/libs/db";
import { AppConfig } from "@/utils/AppConfig";
import { ClusterPage } from "@/components/ClusterPage";
import { DynamicSection } from "@/components/DynamicSection";
import { ExtraJsonLd } from "@/components/ExtraJsonLd";
import { KeywordLandingPage } from "@/components/ressources/KeywordLandingPage";
import { getDbPageBundle } from "@/libs/content/dbFirst";
import { getSEOForRessource } from "@/data/seo";
import { getRessourceLinks } from "@/utils/taxonomy";
import {
  buildGeoKeywordFaqItems,
  buildKeywordMeta,
  classifyKeyword,
  resolveGeoKeyword,
  resolveTheme,
  type KeywordClass,
} from "@/libs/ressources/keyword-lp-helpers";
import type { KeywordPage } from "@/libs/db";

/** Contexte LP d'un keyword : parse géo + classe + meta déterministes.
 *  Partagé entre generateMetadata et le rendu. */
async function getKeywordLpContext(keyword: KeywordPage) {
  const geo = await resolveGeoKeyword(keyword.slug, (citySlug) =>
    db.getDirectoryCityBySlug(citySlug),
  );
  const cls: KeywordClass = classifyKeyword(keyword, geo);
  const theme = geo ? resolveTheme(geo.themeTokens) : null;
  let cabinetCount = 0;
  if (geo) {
    try {
      cabinetCount = await db.getDirectoryListingCabinetCountByCity(geo.city.code_insee);
    } catch {
      cabinetCount = 0;
    }
  }
  const meta = buildKeywordMeta(keyword, cls, {
    ...(geo && { cityName: geo.city.name, departmentName: geo.city.department_name }),
    ...(cabinetCount > 0 && { cabinetCount }),
    ...(theme && { themeLabel: theme.label }),
  });
  return { geo, cls, theme, cabinetCount, meta };
}

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
  // (cluster pages render up to 10 links per cluster via getRessourceLinks).
  // Les slugs disposition='redirect' sont interceptés par next.config avant la
  // route : inutile de les pré-rendre.
  const keywords = await db.getAllKeywords();
  for (const kw of keywords) {
    if (kw.disposition === "redirect") continue;
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
    const { meta } = await getKeywordLpContext(keyword);
    // NB : keyword_pages.meta_title/h1 legacy (labels bruts d'import) sont
    // volontairement ignorés — seo_overrides sinon meta déterministes.
    return {
      title: dbSeo?.meta_title || meta.title,
      description: dbSeo?.meta_description || meta.description,
      alternates: { canonical: `${AppConfig.url}/ressources/${slug}` },
      ...(keyword.disposition === "noindex" && {
        robots: { index: false, follow: true },
      }),
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

  // ─── Keyword → LANDING PAGE, que des sections gen-IA existent ou non ───
  // (jamais le chrome article ClusterPage : pas d'ArticleJsonLd, pas de badges
  // volume/intent, hero conversion + blocs data-driven.)
  if (keyword) {
    const { geo, cls, theme, cabinetCount, meta } = await getKeywordLpContext(keyword);

    const parentCluster = await db.getClusterBySlug(keyword.cluster_slug);
    const parentHub = parentCluster ? await db.getHubBySlug(parentCluster.hub_slug) : undefined;
    const breadcrumbs = [
      { name: "Accueil", url: "/" },
      { name: "Ressources", url: "/ressources" },
      ...(parentHub ? [{ name: parentHub.label, url: `/ressources/${parentHub.slug}` }] : []),
      ...(parentCluster
        ? [{ name: parentCluster.label, url: `/ressources/${parentCluster.slug}` }]
        : []),
      { name: dbSeo?.h1 || meta.h1, url: `/ressources/${slug}` },
    ];
    const linkGroups = await getRessourceLinks(slug, "keyword");

    // FAQ data-driven uniquement en géo (données locales uniques par ville —
    // pas de boilerplate dupliqué sur les pages non géo, qui reçoivent leur
    // FAQ via la génération Gemini).
    const faqs =
      geo && !bundle.inlineFaq
        ? buildGeoKeywordFaqItems(
            geo.city.name,
            cabinetCount,
            geo.city.department_name,
            theme?.label,
          )
        : [];

    return (
      <KeywordLandingPage
        cls={cls}
        h1={dbSeo?.h1 || meta.h1}
        intro={meta.intro}
        eyebrow={parentCluster?.label ?? parentHub?.label ?? "Ressources"}
        breadcrumbs={breadcrumbs}
        canonicalUrl={canonicalUrl}
        linkGroups={linkGroups}
        sections={bundle.renderableSections}
        keyTakeaways={bundle.keyTakeaways}
        faqs={faqs}
        inlineFaq={bundle.inlineFaq}
        city={geo?.city ?? null}
        themeLabel={theme?.label}
        themeHref={theme?.href}
        lastUpdatedDate={lastUpdatedDate}
        schema={<ExtraJsonLd raw={dbSeo?.json_ld_extra ?? null} />}
      />
    );
  }

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

  notFound();
}
