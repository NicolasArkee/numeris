import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { db } from "@/libs/db";
import { AppConfig } from "@/utils/AppConfig";
import { ClusterPage } from "@/components/ClusterPage";
import { getSEOForProfession } from "@/data/seo";
import { getProfessionLinks } from "@/utils/taxonomy";
import { getProfessionMarketing } from "@/data/marketing";
import { ContentSection } from "@/components/ContentSection";
import { BenefitsGrid } from "@/components/BenefitsGrid";
import { StatHighlight } from "@/components/StatHighlight";

interface Props {
  params: Promise<{ profession: string }>;
}

export async function generateStaticParams() {
  return db.getProfessions().map((p) => ({ profession: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { profession: slug } = await params;
  const profession = db.getProfessionBySlug(slug);
  if (!profession) return {};
  const seo = getSEOForProfession(profession);
  return {
    title: seo.metaTitle,
    description: seo.metaDescription,
    alternates: { canonical: `${AppConfig.url}/professions/${slug}` },
  };
}

export default async function ProfessionPage({ params }: Props) {
  const { profession: slug } = await params;
  const profession = db.getProfessionBySlug(slug);
  if (!profession) notFound();

  const category = db.getProfessionCategoryBySlug(profession.category_slug);
  const seo = getSEOForProfession(profession);
  const linkGroups = getProfessionLinks(slug);
  const mkt = getProfessionMarketing(profession);
  const services = db.getServices();
  const siblingProfessions = db.getProfessionsByCategory(profession.category_slug)
    .filter((p) => p.slug !== slug)
    .slice(0, 8);

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
      keyTakeaways={[
        `Expert-comptable spécialisé pour les ${profession.name.toLowerCase()}`,
        `Maîtrise des obligations comptables et fiscales de votre métier`,
        `Accompagnement dédié et conseils personnalisés`,
      ]}
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

      {/* Services pour cette profession */}
      <div className="mb-12">
        <h2 className="mb-6 font-serif text-[1.5rem] font-light text-encre">
          Nos services pour les {profession.name.toLowerCase()}
        </h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {services.map((svc) => (
            <a
              key={svc.slug}
              href={`/expertises/${svc.slug}/${slug}`}
              className="group border border-pierre-12 bg-blanc px-6 py-5 transition-all hover:-translate-y-0.5 hover:border-or hover:shadow-md"
            >
              <span className="mb-2 block text-[1.1rem]">{svc.icon}</span>
              <h3 className="mb-1 text-[0.95rem] font-medium text-encre group-hover:text-or-fonce">
                {svc.title}
              </h3>
              <p className="text-[0.72rem] text-ardoise">{svc.description}</p>
            </a>
          ))}
        </div>
      </div>

      {/* Professions similaires */}
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
    </ClusterPage>
  );
}
