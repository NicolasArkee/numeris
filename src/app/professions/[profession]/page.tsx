import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { db } from "@/libs/db";
import { AppConfig } from "@/utils/AppConfig";
import { ClusterPage } from "@/components/ClusterPage";
import { getSEOForProfession } from "@/data/seo";
import { getProfessionLinks } from "@/utils/taxonomy";

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
  const services = db.getServices();

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
    >
      {/* Obligations comptables */}
      {profession.obligations && (
        <div className="mb-12">
          <h2 className="mb-4 font-serif text-[1.5rem] font-light text-encre">
            Obligations comptables des {profession.name.toLowerCase()}
          </h2>
          <div className="border border-pierre-12 border-l-2 border-l-or bg-blanc p-7">
            <p className="text-[0.88rem] leading-relaxed text-ardoise">
              {profession.obligations}
            </p>
          </div>
        </div>
      )}

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
              className="border border-pierre-12 bg-blanc px-6 py-5 transition-colors hover:border-or"
            >
              <span className="mb-2 block text-[1.1rem]">{svc.icon}</span>
              <h3 className="mb-1 text-[0.95rem] font-medium text-encre">
                {svc.title}
              </h3>
              <p className="text-[0.72rem] text-ardoise">{svc.description}</p>
            </a>
          ))}
        </div>
      </div>
    </ClusterPage>
  );
}
