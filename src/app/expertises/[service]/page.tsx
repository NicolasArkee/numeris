import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { db } from "@/libs/db";
import { AppConfig } from "@/utils/AppConfig";
import { ClusterPage } from "@/components/ClusterPage";
import { getSEOForService } from "@/data/seo";
import { getServiceLinks } from "@/utils/taxonomy";

interface Props {
  params: Promise<{ service: string }>;
}

export async function generateStaticParams() {
  return db.getServices().map((s) => ({ service: s.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { service: slug } = await params;
  const service = db.getServices().find((s) => s.slug === slug);
  if (!service) return {};
  const seo = getSEOForService(service);
  return {
    title: seo.metaTitle,
    description: seo.metaDescription,
    alternates: { canonical: `${AppConfig.url}/expertises/${slug}` },
  };
}

export default async function ServicePage({ params }: Props) {
  const { service: slug } = await params;
  const service = db.getServices().find((s) => s.slug === slug);
  if (!service) notFound();

  const seo = getSEOForService(service);
  const linkGroups = getServiceLinks(slug);
  const secteurs = db.getServiceSecteurs(slug);
  const allSecteurs = db.getSecteurs();
  const secteurMap = new Map(allSecteurs.map((s) => [s.slug, s]));

  return (
    <ClusterPage
      eyebrow={AppConfig.tagline}
      h1={seo.h1}
      intro={seo.intro}
      breadcrumbs={[
        { name: "Accueil", url: "/" },
        { name: "Expertises", url: "/expertises" },
        { name: service.title, url: `/expertises/${slug}` },
      ]}
      badges={[service.icon, service.title]}
      faqs={seo.faqs}
      linkGroups={linkGroups}
    >
      {/* Secteurs for this service */}
      {secteurs.length > 0 && (
        <div className="mb-12">
          <h2 className="mb-6 font-serif text-[1.5rem] font-light text-encre">
            {service.title} par secteur
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {secteurs.map((ss) => {
              const sec = secteurMap.get(ss.secteur_slug);
              if (!sec) return null;
              return (
                <a
                  key={ss.secteur_slug}
                  href={`/expertises/${slug}/${ss.secteur_slug}`}
                  className="border border-pierre-12 bg-blanc px-6 py-5 transition-colors hover:border-or"
                >
                  <h3 className="mb-1 text-[0.95rem] font-medium text-encre">{sec.name}</h3>
                  <p className="text-[0.72rem] text-ardoise">{sec.description}</p>
                </a>
              );
            })}
          </div>
        </div>
      )}
    </ClusterPage>
  );
}
