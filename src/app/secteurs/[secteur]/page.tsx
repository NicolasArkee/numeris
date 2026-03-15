import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { db } from "@/libs/db";
import { AppConfig } from "@/utils/AppConfig";
import { ClusterPage } from "@/components/ClusterPage";
import { getSEOForSecteur } from "@/data/seo";
import { getSecteurLinks } from "@/utils/taxonomy";

interface Props {
  params: Promise<{ secteur: string }>;
}

export async function generateStaticParams() {
  return db.getSecteurs().map((s) => ({ secteur: s.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { secteur: slug } = await params;
  const secteur = db.getSecteurBySlug(slug);
  if (!secteur) return {};
  const seo = getSEOForSecteur(secteur);
  return {
    title: seo.metaTitle,
    description: seo.metaDescription,
    alternates: { canonical: `${AppConfig.url}/secteurs/${slug}` },
  };
}

export default async function SecteurPage({ params }: Props) {
  const { secteur: slug } = await params;
  const secteur = db.getSecteurBySlug(slug);
  if (!secteur) notFound();

  const seo = getSEOForSecteur(secteur);
  const linkGroups = getSecteurLinks(slug);
  const services = db.getServices();
  const villes = db.getVilles().slice(0, 12);

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
    >
      {/* Services for this secteur */}
      <div className="mb-12">
        <h2 className="mb-6 font-serif text-[1.5rem] font-light text-encre">
          Nos services pour le secteur {secteur.name}
        </h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {services.map((svc) => (
            <a
              key={svc.slug}
              href={`/expertises/${svc.slug}/${slug}`}
              className="group border border-pierre-12 bg-blanc px-6 py-5 transition-all hover:-translate-y-0.5 hover:border-or hover:shadow-md"
            >
              <span className="mb-2 block text-[1.1rem]">{svc.icon}</span>
              <h3 className="mb-1 text-[0.95rem] font-medium text-encre group-hover:text-or-fonce">{svc.title}</h3>
              <p className="text-[0.72rem] text-ardoise">{svc.description}</p>
            </a>
          ))}
        </div>
      </div>

      {/* Villes for this secteur */}
      <div className="mb-12">
        <h2 className="mb-6 font-serif text-[1.25rem] font-light text-encre">
          {secteur.name} par ville
        </h2>
        <div className="flex flex-wrap gap-2">
          {villes.map((v) => (
            <a
              key={v.slug}
              href={`/villes/${v.slug}`}
              className="border border-pierre-12 bg-blanc px-4 py-2 text-[0.78rem] text-encre-75 transition-colors hover:border-or hover:text-or-fonce"
            >
              {v.name}
            </a>
          ))}
        </div>
      </div>
    </ClusterPage>
  );
}
