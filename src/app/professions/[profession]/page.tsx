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
import {
  getProfessionSectionAside,
  ProfessionSectionWithAside,
} from "@/components/professions/ProfessionSidebarV2";
import {
  buildProfessionSidebarData,
  dedupeProfessionRenderableSections,
} from "@/components/professions/profession-v2-helpers";

interface Props {
  params: Promise<{ profession: string }>;
}

const ROUTE = "professions";

export const revalidate = 86400;

export async function generateStaticParams() {
  return (await db.getProfessions()).map((p) => ({ profession: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { profession: slug } = await params;
  const profession = await db.getProfessionBySlug(slug);
  if (!profession) return {};

  const dbSeo = await db.getSeoOverride(ROUTE, slug);
  const fallback = getSEOForProfession(profession);

  return {
    title: dbSeo?.meta_title ?? fallback.metaTitle,
    description: dbSeo?.meta_description ?? fallback.metaDescription,
    alternates: { canonical: `${AppConfig.url}/professions/${slug}` },
  };
}

export default async function ProfessionPage({ params }: Props) {
  const { profession: slug } = await params;
  const profession = await db.getProfessionBySlug(slug);
  if (!profession) notFound();

  const category = await db.getProfessionCategoryBySlug(profession.category_slug);
  const linkGroups = await getProfessionLinks(slug);

  // ─── DB-first path ───
  const bundle = await getDbPageBundle(ROUTE, slug);
  const { seo: dbSeo, lastUpdatedDate, hasDbContent } = bundle;
  const canonicalUrl = `${AppConfig.url}/professions/${slug}`;

  // ─── Maillage interne — rendu dans les DEUX chemins (DB et fallback) ───
  const services = await db.getServices();
  const siblingProfessions = (await db.getProfessionsByCategory(profession.category_slug))
    .filter((p) => p.slug !== slug)
    .slice(0, 8);
  const sidebarData = buildProfessionSidebarData({
    profession,
    ...(category && { category }),
    services,
    siblingProfessions,
    linkGroups,
  });
  const internalMesh = (
    <>
      <ServicesGrid
        title={`Expertises à comparer pour les ${profession.name.toLowerCase()}`}
        services={services}
        hrefBuilder={(svc) => `/expertises/${svc.slug}/${slug}`}
      />
      {siblingProfessions.length > 0 && (
        <div className="mb-12">
          <h2 className="mb-4 font-display text-[1.25rem] font-bold text-ink">
            Professions similaires
          </h2>
          <div className="flex flex-wrap gap-2">
            {siblingProfessions.map((p) => (
              <a
                key={p.slug}
                href={`/professions/${p.slug}`}
                className="border border-border-soft bg-surface px-4 py-2 text-[0.78rem] text-ink-muted transition-colors hover:border-accent-500 hover:text-accent-700"
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
        {dedupeProfessionRenderableSections(bundle.renderableSections).map((s) => {
          const aside = getProfessionSectionAside(sidebarData, s);
          return (
            <ProfessionSectionWithAside key={s.id} aside={aside}>
              <DynamicSection
                section={s}
                professionEditorialLayout={aside ? "single" : "grid"}
              />
            </ProfessionSectionWithAside>
          );
        })}
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
      <ProfessionSectionWithAside
        aside={getProfessionSectionAside(sidebarData, {
          section_type: "ContentSection",
          section_order: 1,
          title: `Obligations comptables des ${profession.name.toLowerCase()}`,
        })}
      >
        {profession.obligations && (
          <ContentSection
            title={`Obligations comptables des ${profession.name.toLowerCase()}`}
            paragraphs={[profession.obligations]}
            variant="highlighted"
          />
        )}
      </ProfessionSectionWithAside>

      {mkt.contentSections.map((cs, index) => (
        <ProfessionSectionWithAside
          key={cs.title}
          aside={
            index === 0
              ? getProfessionSectionAside(sidebarData, {
                  section_type: "Hero",
                  section_order: index + 2,
                  title: cs.title,
                })
              : undefined
          }
        >
          <ContentSection title={cs.title} paragraphs={cs.paragraphs} />
        </ProfessionSectionWithAside>
      ))}

      <BenefitsGrid
        title={`Pourquoi choisir ${AppConfig.name} pour les ${profession.name.toLowerCase()} ?`}
        benefits={mkt.benefits}
        columns={4}
      />

      <ProfessionSectionWithAside
        aside={getProfessionSectionAside(sidebarData, {
          section_type: "StatsBand",
          section_order: 6,
          title: "Chiffres clés",
        })}
      >
        <StatHighlight stats={mkt.stats} />
      </ProfessionSectionWithAside>

      {/* Maillage interne (services + professions similaires) */}
      {internalMesh}
    </ClusterPage>
  );
}
