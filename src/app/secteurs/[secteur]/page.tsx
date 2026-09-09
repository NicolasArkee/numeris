import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { db, type PageSection } from "@/libs/db";
import { AppConfig } from "@/utils/AppConfig";
import { ClusterPage } from "@/components/ClusterPage";
import { DynamicSection } from "@/components/DynamicSection";
import { ExtraJsonLd } from "@/components/ExtraJsonLd";
import { getDbPageBundle } from "@/libs/content/dbFirst";
import { normalizeMetaDescription } from "@/libs/content/meta-title";
import { getSEOForSecteur } from "@/data/seo";
import { getSecteurLinks } from "@/utils/taxonomy";
import { ServicesGrid } from "@/components/ServicesGrid";
import { VillesStrip } from "@/components/VillesStrip";
import { LandingScopeBuilder } from "@/components/journey/LandingScopeBuilder";
import {
  buildSectorFallbackSections,
  getSectorFallbackFaqs,
  getSectorFallbackTakeaways,
} from "@/components/templates/sector/SectorFallbackSections";

interface Props {
  params: Promise<{ secteur: string }>;
}

const ROUTE = "secteurs";

function collectConfiguredText(value: unknown): string {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value.map(collectConfiguredText).join(" ");
  if (value && typeof value === "object") {
    return Object.values(value).map(collectConfiguredText).join(" ");
  }
  return "";
}

function countConfiguredWords(sections: readonly PageSection[]): number {
  const text = sections.map((section) => {
    let itemText = "";
    if (section.items) {
      try {
        itemText = collectConfiguredText(JSON.parse(section.items) as unknown);
      } catch {
        itemText = section.items;
      }
    }
    return [section.title, section.body, itemText].filter(Boolean).join(" ");
  }).join(" ");

  return text
    .replaceAll(/<[^>]+>/g, " ")
    .match(/[\p{L}\p{N}]+(?:[’'-][\p{L}\p{N}]+)*/gu)?.length ?? 0;
}

export const revalidate = 86400;

export async function generateStaticParams() {
  return (await db.getSecteurs()).map((s) => ({ secteur: s.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { secteur: slug } = await params;
  const secteur = await db.getSecteurBySlug(slug);
  if (!secteur) return {};

  const dbSeo = await db.getSeoOverride(ROUTE, slug);
  const fallback = getSEOForSecteur(secteur);

  return {
    title: dbSeo?.meta_title ?? fallback.metaTitle,
    description: normalizeMetaDescription(dbSeo?.meta_description ?? fallback.metaDescription),
    alternates: { canonical: `${AppConfig.url}/secteurs/${slug}` },
  };
}

export default async function SecteurPage({ params }: Props) {
  const { secteur: slug } = await params;
  const secteur = await db.getSecteurBySlug(slug);
  if (!secteur) notFound();

  const linkGroups = await getSecteurLinks(slug);

  // ─── DB-first path ───
  const bundle = await getDbPageBundle(ROUTE, slug);
  const { sections: dbSections, seo: dbSeo, lastUpdatedDate, hasDbContent } = bundle;
  const canonicalUrl = `${AppConfig.url}/secteurs/${slug}`;

  // ─── Maillage interne — rendu dans les DEUX chemins (DB et fallback) ───
  const meshServices = await db.getServices();
  const meshVilles = (await db.getVilles()).slice(0, 12);
  const internalMesh = (
    <>
      <ServicesGrid
        title={`Expertises à comparer pour le secteur ${secteur.name}`}
        services={meshServices}
        hrefBuilder={(svc) => `/expertises/${svc.slug}/${slug}`}
      />
      <VillesStrip
        title={`${secteur.name} par ville`}
        villes={meshVilles}
      />
    </>
  );

  if (hasDbContent) {
    const seoFallback = getSEOForSecteur(secteur);
    const h1 = dbSeo?.h1 ?? seoFallback.h1;
    const intro = dbSeo?.meta_description ?? bundle.heroSection?.body ?? seoFallback.intro;
    const { inlineFaq, keyTakeaways } = bundle;
    const needsSectorSupport = countConfiguredWords(bundle.renderableSections) < 1_200;

    return (
      <ClusterPage
        eyebrow={`Secteur ${secteur.name}`}
        h1={h1}
        intro={intro}
        breadcrumbs={[
          { name: "Accueil", url: "/" },
          { name: "Secteurs", url: "/secteurs" },
          { name: secteur.name, url: `/secteurs/${slug}` },
        ]}
        badges={[secteur.name]}
        faqs={inlineFaq ? undefined : seoFallback.faqs}
        linkGroups={linkGroups}
        keyTakeaways={keyTakeaways}
        schema={<ExtraJsonLd raw={dbSeo?.json_ld_extra ?? null} />}
        lastUpdatedDate={lastUpdatedDate}
        publication={bundle.publication}
        articleSchema={true}
        articleHeadline={h1}
        articleSection="Secteurs d'activité"
        canonicalUrl={canonicalUrl}
      >
        <LandingScopeBuilder
          activity={secteur.name}
          activityKind="secteur"
          missions={meshServices.map((service) => ({ slug: service.slug, label: service.title }))}
        />
        {needsSectorSupport && buildSectorFallbackSections({ secteur })}
        {bundle.renderableSections.map((s) => (
          <DynamicSection key={s.id} section={s} />
        ))}
        {internalMesh}
      </ClusterPage>
    );
  }

  // ─── Fallback static path ───
  const seo = getSEOForSecteur(secteur);
  const fallbackFaqs = getSectorFallbackFaqs(secteur);

  return (
    <ClusterPage
      eyebrow={`Secteur ${secteur.name}`}
      h1={seo.h1}
      intro={seo.intro}
      breadcrumbs={[
        { name: "Accueil", url: "/" },
        { name: "Secteurs", url: "/secteurs" },
        { name: secteur.name, url: `/secteurs/${slug}` },
      ]}
      badges={[secteur.name]}
      faqs={fallbackFaqs}
      linkGroups={linkGroups}
      keyTakeaways={bundle.keyTakeaways ?? getSectorFallbackTakeaways(secteur)}
      schema={<ExtraJsonLd raw={dbSeo?.json_ld_extra ?? null} />}
      lastUpdatedDate={lastUpdatedDate}
      publication={bundle.publication}
      articleSchema={true}
      articleHeadline={seo.h1}
      articleSection="Secteurs d'activité"
      canonicalUrl={canonicalUrl}
    >
      <LandingScopeBuilder
        activity={secteur.name}
        activityKind="secteur"
        missions={meshServices.map((service) => ({ slug: service.slug, label: service.title }))}
      />
      {buildSectorFallbackSections({ secteur })}

      {/* Maillage interne (services + villes) */}
      {internalMesh}
    </ClusterPage>
  );
}
