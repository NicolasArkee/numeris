import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { db } from "@/libs/db";
import { AppConfig } from "@/utils/AppConfig";
import { ClusterPage } from "@/components/ClusterPage";
import { getSEOForVille } from "@/data/seo";
import { getVilleLinks } from "@/utils/taxonomy";

interface Props {
  params: Promise<{ ville: string }>;
}

export async function generateStaticParams() {
  return db.getVilles().map((v) => ({ ville: v.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { ville: slug } = await params;
  const ville = db.getVilleBySlug(slug);
  if (!ville) return {};
  const seo = getSEOForVille(ville);
  return {
    title: seo.metaTitle,
    description: seo.metaDescription,
    alternates: { canonical: `${AppConfig.url}/villes/${slug}` },
  };
}

export default async function VillePage({ params }: Props) {
  const { ville: slug } = await params;
  const ville = db.getVilleBySlug(slug);
  if (!ville) notFound();

  const seo = getSEOForVille(ville);
  const linkGroups = getVilleLinks(slug);
  const services = db.getServices();

  return (
    <ClusterPage
      eyebrow={`Expert-comptable ${ville.name}`}
      h1={seo.h1}
      intro={seo.intro}
      breadcrumbs={[
        { name: "Accueil", url: "/" },
        { name: "Villes", url: "/villes" },
        { name: ville.name, url: `/villes/${slug}` },
      ]}
      badges={[ville.name, ville.region || "", ville.departement ? `Dept. ${ville.departement}` : ""].filter(Boolean)}
      faqs={seo.faqs}
      linkGroups={linkGroups}
    >
      <div className="mb-12">
        <h2 className="mb-6 font-serif text-[1.5rem] font-light text-encre">
          Nos services à {ville.name}
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
                {svc.title} à {ville.name}
              </h3>
            </a>
          ))}
        </div>
      </div>
    </ClusterPage>
  );
}
