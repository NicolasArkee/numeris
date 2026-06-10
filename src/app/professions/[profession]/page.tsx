import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { db } from "@/libs/db";
import { AppConfig } from "@/utils/AppConfig";
import { ClusterPage } from "@/components/ClusterPage";
import { DynamicSection } from "@/components/DynamicSection";
import { ExtraJsonLd } from "@/components/ExtraJsonLd";
import { getDbPageBundle } from "@/libs/content/dbFirst";
import { getSEOForProfession } from "@/data/seo";
import { getProfessionLinks } from "@/utils/taxonomy";
import { getProfessionMarketing } from "@/data/marketing";
import { ContentSection } from "@/components/ContentSection";
import { BenefitsGrid } from "@/components/BenefitsGrid";
import { StatHighlight } from "@/components/StatHighlight";
import { ServicesGrid } from "@/components/ServicesGrid";

interface Props {
  params: Promise<{ profession: string }>;
}

const ROUTE = "professions";

export async function generateStaticParams() {
  return db.getProfessions().map((p) => ({ profession: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { profession: slug } = await params;
  const profession = db.getProfessionBySlug(slug);
  if (!profession) return {};

  const dbSeo = db.getSeoOverride(ROUTE, slug);
  const fallback = getSEOForProfession(profession);

  return {
    title: dbSeo?.meta_title ?? fallback.metaTitle,
    description: dbSeo?.meta_description ?? fallback.metaDescription,
    alternates: { canonical: `${AppConfig.url}/professions/${slug}` },
  };
}

export default async function ProfessionPage({ params }: Props) {
  const { profession: slug } = await params;
  const profession = db.getProfessionBySlug(slug);
  if (!profession) notFound();

  const category = db.getProfessionCategoryBySlug(profession.category_slug);
  const linkGroups = getProfessionLinks(slug);

  // ─── DB-first path ───
  const bundle = getDbPageBundle(ROUTE, slug);
  const { sections: dbSections, seo: dbSeo, lastUpdatedDate, hasDbContent } = bundle;
  const canonicalUrl = `${AppConfig.url}/professions/${slug}`;

  // ─── Maillage interne — rendu dans les DEUX chemins (DB et fallback) ───
  const services = db.getServices();
  const siblingProfessions = db
    .getProfessionsByCategory(profession.category_slug)
    .filter((p) => p.slug !== slug)
    .slice(0, 8);
  const internalMesh = (
    <>
      <ServicesGrid
        title={`Nos services pour les ${profession.name.toLowerCase()}`}
        services={services}
        hrefBuilder={(svc) => `/expertises/${svc.slug}/${slug}`}
      />
      {siblingProfessions.length > 0 && (
        <div className="mb-12">
          <h2 className="mb-4 font-serif text-[1.25rem] font-light text-encre">
            Professions similaires
          </h2>
          <div className="flex flex-wrap gap-2">
            {siblingProfessions.map((p) => (
              <a
                key={p.slug}
                href={`/professions/${p.slug}`}
                className="border border-pierre-12 bg-blanc px-4 py-2 text-[0.78rem] text-encre-75 transition-colors hover:border-or hover:text-or-fonce"
              >
                {p.name}
              </a>
            ))}
          </div>
        </div>
      )}
    </>
  );

  if (hasDbContent) {
    const seoFallback = getSEOForProfession(profession);
    const h1 = dbSeo?.h1 ?? seoFallback.h1;
    // Intro: use the first Hero/ContentSection body if no metaDescription seed.
    const intro = dbSeo?.meta_description ?? bundle.heroSection?.body ?? seoFallback.intro;
    // Faq + Hero are rendered inline via DynamicSection — skip the
    // ClusterPage built-in FAQ rail to avoid duplication.
    const { inlineFaq, keyTakeaways } = bundle;

    return (
      <ClusterPage
        eyebrow={category?.name || "Professions"}
        h1={h1}
        intro={intro}
        breadcrumbs={[
          { name: "Accueil", url: "/" },
          { name: "Professions", url: "/professions" },
          { name: profession.name, url: `/professions/${slug}` },
        ]}
        badges={[
          category?.icon || "",
          profession.name,
          category?.name || "",
        ].filter(Boolean)}
        faqs={inlineFaq ? undefined : seoFallback.faqs}
        linkGroups={linkGroups}
        keyTakeaways={keyTakeaways}
        schema={<ExtraJsonLd raw={dbSeo?.json_ld_extra ?? null} />}
        lastUpdatedDate={lastUpdatedDate}
        articleSchema={true}
        articleHeadline={h1}
        articleSection="Professions libérales et indépendants"
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
  const seo = getSEOForProfession(profession);
  const mkt = getProfessionMarketing(profession);

  return (
    <ClusterPage
      eyebrow={category?.name || "Professions"}
      h1={seo.h1}
      intro={seo.intro}
      breadcrumbs={[
        { name: "Accueil", url: "/" },
        { name: "Professions", url: "/professions" },
        { name: profession.name, url: `/professions/${slug}` },
      ]}
      badges={[
        category?.icon || "",
        profession.name,
        category?.name || "",
      ].filter(Boolean)}
      faqs={seo.faqs}
      linkGroups={linkGroups}
      keyTakeaways={bundle.keyTakeaways ?? [
        `Expert-comptable spécialisé pour les ${profession.name.toLowerCase()}`,
        `Maîtrise des obligations comptables et fiscales de votre métier`,
        `Accompagnement dédié et conseils personnalisés`,
      ]}
      schema={<ExtraJsonLd raw={dbSeo?.json_ld_extra ?? null} />}
      lastUpdatedDate={lastUpdatedDate}
      articleSchema={true}
      articleHeadline={seo.h1}
      articleSection="Professions libérales et indépendants"
      canonicalUrl={canonicalUrl}
    >
      {/* Obligations comptables */}
      {profession.obligations && (
        <ContentSection
          title={`Obligations comptables des ${profession.name.toLowerCase()}`}
          paragraphs={[profession.obligations]}
          variant="highlighted"
        />
      )}

      {/* Marketing content */}
      {mkt.contentSections.map((cs) => (
        <ContentSection key={cs.title} title={cs.title} paragraphs={cs.paragraphs} />
      ))}

      {/* Benefits */}
      <BenefitsGrid
        title={`Pourquoi choisir ${AppConfig.name} pour les ${profession.name.toLowerCase()} ?`}
        benefits={mkt.benefits}
        columns={4}
      />

      {/* Stats */}
      <StatHighlight stats={mkt.stats} />

      {/* Maillage interne (services + professions similaires) */}
      {internalMesh}
    </ClusterPage>
  );
}
