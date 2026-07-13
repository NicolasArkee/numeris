import type { Metadata } from "next";
import fs from "node:fs";
import path from "node:path";
import { notFound } from "next/navigation";
import { db } from "@/libs/db";
import { AppConfig } from "@/utils/AppConfig";
import { ClusterPage } from "@/components/ClusterPage";
import { DynamicSection } from "@/components/DynamicSection";
import { ExtraJsonLd } from "@/components/ExtraJsonLd";
import { KeywordLandingPage } from "@/components/ressources/KeywordLandingPage";
import { TaxonomyHubPage, type TaxonomyChild } from "@/components/ressources/TaxonomyHubPage";
import { getDbPageBundle } from "@/libs/content/dbFirst";
import { getSEOForRessource } from "@/data/seo";
import { getRessourceLinks } from "@/utils/taxonomy";

// Slugs /ressources redirigés (301 next.config — clusters orphelins inclus) :
// exclus des sommaires de hubs pour ne pas mailler vers des 301.
let redirectedCache: Set<string> | null = null;
function redirectedRessourceSlugs(): Set<string> {
  if (redirectedCache) return redirectedCache;
  try {
    const raw = JSON.parse(
      fs.readFileSync(path.join(process.cwd(), "data", "redirects-ressources.json"), "utf-8"),
    ) as { source: string }[];
    redirectedCache = new Set(
      raw
        .map((r) => r.source.match(/^\/ressources\/(.+)$/u)?.[1])
        .filter((s): s is string => !!s),
    );
  } catch {
    redirectedCache = new Set();
  }
  return redirectedCache;
}
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

  // ─── Hub / cluster → PAGE HUB (sommaire de dossier), jamais le chrome
  // article : pas de badges volume/mots-clés, pas de temps de lecture, le
  // sommaire des sous-pages est l'élément central. L'EditoIntro généré sert
  // d'intro de hero (pas de doublon dans le corps).
  if (hub || cluster) {
    const isHub = !!hub;
    const node = (hub ?? cluster)!;
    const fb = getSEOForRessource(node, isHub ? "hub" : "cluster");
    const linkGroups = await getRessourceLinks(slug, isHub ? "hub" : "cluster");
    const redirected = redirectedRessourceSlugs();

    const breadcrumbs: { name: string; url: string }[] = [
      { name: "Accueil", url: "/" },
      { name: "Ressources", url: "/ressources" },
    ];
    let eyebrow = "Ressources";
    if (hub) {
      const silo = await db.getSiloBySlug(hub.silo_slug);
      eyebrow = silo?.label || "Ressources";
    } else if (cluster) {
      const parentHub = await db.getHubBySlug(cluster.hub_slug);
      if (parentHub) {
        eyebrow = parentHub.label;
        breadcrumbs.push({ name: parentHub.label, url: `/ressources/${parentHub.slug}` });
      }
    }
    breadcrumbs.push({ name: node.label, url: `/ressources/${slug}` });

    // Sommaire : enfants vivants uniquement (hors 301/noindex).
    let children_: TaxonomyChild[] = [];
    if (hub) {
      children_ = (await db.getClustersByHub(slug))
        .filter((c) => !redirected.has(c.slug))
        .map((c) => ({ slug: c.slug, label: c.label }));
    } else {
      const kws = (await db.getKeywordsByCluster(slug)).filter(
        (k) => (k.disposition ?? "enrich") === "enrich",
      );
      children_ = await Promise.all(
        kws.map(async (k) => {
          const kwSeo = await db.getSeoOverride(ROUTE, k.slug).catch(() => null);
          return {
            slug: k.slug,
            label: kwSeo?.h1 || k.label,
            description: kwSeo?.meta_description ?? null,
          };
        }),
      );
    }

    const editoIntro = bundle.sections.find((s) => s.section_type === "EditoIntro");
    const sections = bundle.renderableSections.filter((s) => s.id !== editoIntro?.id);

    return (
      <TaxonomyHubPage
        h1={dbSeo?.h1 || node.label}
        intro={editoIntro?.body || dbSeo?.meta_description || fb.intro}
        eyebrow={eyebrow}
        breadcrumbs={breadcrumbs}
        canonicalUrl={canonicalUrl}
        children_={children_}
        childrenTitle={isHub ? "Les dossiers de ce thème" : "Les guides de ce dossier"}
        sections={sections}
        linkGroups={linkGroups}
      />
    );
  }

  // ─── Pages DB-only (dossiers éditoriaux maillage-v3) — chrome article ───
  if (hasDbContent) {
    const label =
      dbSeo?.h1 ??
      slug.replace(/^dossier-/, "").replace(/-/g, " ").replace(/^\w/, (c) => c.toUpperCase());
    const breadcrumbs = [
      { name: "Accueil", url: "/" },
      { name: "Ressources", url: "/ressources" },
      { name: label, url: `/ressources/${slug}` },
    ];
    const h1 = dbSeo?.h1 ?? label;
    const intro = dbSeo?.meta_description ?? bundle.heroSection?.body ?? "";
    const { keyTakeaways } = bundle;

    return (
      <ClusterPage
        eyebrow="Ressources"
        h1={h1}
        intro={intro}
        breadcrumbs={breadcrumbs}
        linkGroups={[]}
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

  notFound();
}
