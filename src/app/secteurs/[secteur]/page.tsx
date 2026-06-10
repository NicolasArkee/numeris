import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { db } from "@/libs/db";
import { AppConfig } from "@/utils/AppConfig";
import { ClusterPage } from "@/components/ClusterPage";
import { DynamicSection } from "@/components/DynamicSection";
import { ExtraJsonLd } from "@/components/ExtraJsonLd";
import { getDbPageBundle } from "@/libs/content/dbFirst";
import { getSEOForSecteur } from "@/data/seo";
import { getSecteurLinks } from "@/utils/taxonomy";
import { getSecteurMarketing } from "@/data/marketing";
import { ContentSection } from "@/components/ContentSection";
import { BenefitsGrid } from "@/components/BenefitsGrid";
import { StatHighlight } from "@/components/StatHighlight";
import { ServicesGrid } from "@/components/ServicesGrid";
import { VillesStrip } from "@/components/VillesStrip";

interface Props {
  params: Promise<{ secteur: string }>;
}

const ROUTE = "secteurs";

export async function generateStaticParams() {
  return db.getSecteurs().map((s) => ({ secteur: s.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { secteur: slug } = await params;
  const secteur = db.getSecteurBySlug(slug);
  if (!secteur) return {};

  const dbSeo = db.getSeoOverride(ROUTE, slug);
  const fallback = getSEOForSecteur(secteur);

  return {
    title: dbSeo?.meta_title ?? fallback.metaTitle,
    description: dbSeo?.meta_description ?? fallback.metaDescription,
    alternates: { canonical: `${AppConfig.url}/secteurs/${slug}` },
  };
}

export default async function SecteurPage({ params }: Props) {
  const { secteur: slug } = await params;
  const secteur = db.getSecteurBySlug(slug);
  if (!secteur) notFound();

  const linkGroups = getSecteurLinks(slug);

  // ─── DB-first path ───
  const bundle = getDbPageBundle(ROUTE, slug);
  const { sections: dbSections, seo: dbSeo, lastUpdatedDate, hasDbContent } = bundle;
  const canonicalUrl = `${AppConfig.url}/secteurs/${slug}`;

  // ─── Maillage interne — rendu dans les DEUX chemins (DB et fallback) ───
  const internalMesh = (
    <>
      <ServicesGrid
        title={`Nos services pour le secteur ${secteur.name}`}
        services={db.getServices()}
        hrefBuilder={(svc) => `/expertises/${svc.slug}/${slug}`}
      />
      <VillesStrip
        title={`${secteur.name} par ville`}
        villes={db.getVilles().slice(0, 12)}
      />
    </>
  );

  if (hasDbContent) {
    const seoFallback = getSEOForSecteur(secteur);
    const h1 = dbSeo?.h1 ?? seoFallback.h1;
    const intro = dbSeo?.meta_description ?? bundle.heroSection?.body ?? seoFallback.intro;
    const { inlineFaq, keyTakeaways } = bundle;

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
        articleSchema={true}
        articleHeadline={h1}
        articleSection="Secteurs d'activité"
        canonicalUrl={canonicalUrl}
      >
        {bundle.renderableSections.map((s) => (
          <DynamicSection key={s.id} section={s} />
        ))}
        {internalMesh}
      </ClusterPage>
    );
  }

  // ─── Fallback static path ───
  const seo = getSEOForSecteur(secteur);
  const mkt = getSecteurMarketing(secteur);

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
      faqs={seo.faqs}
      linkGroups={linkGroups}
      keyTakeaways={bundle.keyTakeaways ?? [
        `Expert-comptable spécialisé ${secteur.name.toLowerCase()}`,
        `Connaissance des normes et obligations sectorielles`,
        `Accompagnement sur mesure et interlocuteur dédié`,
      ]}
      schema={<ExtraJsonLd raw={dbSeo?.json_ld_extra ?? null} />}
      lastUpdatedDate={lastUpdatedDate}
      articleSchema={true}
      articleHeadline={seo.h1}
      articleSection="Secteurs d'activité"
      canonicalUrl={canonicalUrl}
    >
      {/* Marketing content */}
      {mkt.contentSections.map((cs) => (
        <ContentSection key={cs.title} title={cs.title} paragraphs={cs.paragraphs} />
      ))}

      {/* Benefits */}
      <BenefitsGrid
        title={`Les avantages d'un expert-comptable spécialisé ${secteur.name.toLowerCase()}`}
        benefits={mkt.benefits}
        columns={4}
      />

      {/* Stats */}
      <StatHighlight stats={mkt.stats} />

      {/* Maillage interne (services + villes) */}
      {internalMesh}
    </ClusterPage>
  );
}
