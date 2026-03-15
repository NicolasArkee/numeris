import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { db } from "@/libs/db";
import { AppConfig } from "@/utils/AppConfig";
import { ClusterPage } from "@/components/ClusterPage";
import { getSEOForServiceSecteur, getSEOForServiceVille, getSEOForServiceProfession } from "@/data/seo";
import { getCrossServiceSecteurLinks, getServiceLinks, getCrossServiceProfessionLinks } from "@/utils/taxonomy";

interface Props {
  params: Promise<{ service: string; dimension: string }>;
}

export async function generateStaticParams() {
  const services = db.getServices();
  const params: { service: string; dimension: string }[] = [];

  for (const svc of services) {
    // Service × Secteur
    const secteurs = db.getServiceSecteurs(svc.slug);
    for (const ss of secteurs) {
      params.push({ service: svc.slug, dimension: ss.secteur_slug });
    }
    // Service × Ville
    const villes = db.getServiceVilles(svc.slug);
    for (const sv of villes) {
      params.push({ service: svc.slug, dimension: sv.ville_slug });
    }
    // Service × Profession
    const professions = db.getServiceProfessions(svc.slug);
    for (const sp of professions) {
      params.push({ service: svc.slug, dimension: sp.profession_slug });
    }
  }

  return params;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { service: svcSlug, dimension: dimSlug } = await params;
  const service = db.getServices().find((s) => s.slug === svcSlug);
  if (!service) return {};

  const secteur = db.getSecteurBySlug(dimSlug);
  if (secteur) {
    const seo = getSEOForServiceSecteur(service, secteur);
    return {
      title: seo.metaTitle,
      description: seo.metaDescription,
      alternates: { canonical: `${AppConfig.url}/expertises/${svcSlug}/${dimSlug}` },
    };
  }

  const ville = db.getVilleBySlug(dimSlug);
  if (ville) {
    const seo = getSEOForServiceVille(service, ville);
    return {
      title: seo.metaTitle,
      description: seo.metaDescription,
      alternates: { canonical: `${AppConfig.url}/expertises/${svcSlug}/${dimSlug}` },
    };
  }

  const profession = db.getProfessionBySlug(dimSlug);
  if (profession) {
    const seo = getSEOForServiceProfession(service, profession);
    return {
      title: seo.metaTitle,
      description: seo.metaDescription,
      alternates: { canonical: `${AppConfig.url}/expertises/${svcSlug}/${dimSlug}` },
    };
  }

  return {};
}

export default async function CrossDimensionPage({ params }: Props) {
  const { service: svcSlug, dimension: dimSlug } = await params;
  const service = db.getServices().find((s) => s.slug === svcSlug);
  if (!service) notFound();

  // ─── Secteur ───
  const secteur = db.getSecteurBySlug(dimSlug);
  if (secteur) {
    const seo = getSEOForServiceSecteur(service, secteur);
    const linkGroups = getCrossServiceSecteurLinks(svcSlug, dimSlug);
    return (
      <ClusterPage
        eyebrow={`${service.title} × ${secteur.name}`}
        h1={seo.h1}
        intro={seo.intro}
        breadcrumbs={[
          { name: "Accueil", url: "/" },
          { name: "Expertises", url: "/expertises" },
          { name: service.title, url: `/expertises/${svcSlug}` },
          { name: secteur.name, url: `/expertises/${svcSlug}/${dimSlug}` },
        ]}
        badges={[service.title, secteur.name]}
        faqs={seo.faqs}
        linkGroups={linkGroups}
      />
    );
  }

  // ─── Ville ───
  const ville = db.getVilleBySlug(dimSlug);
  if (ville) {
    const seo = getSEOForServiceVille(service, ville);
    const linkGroups = getServiceLinks(svcSlug);
    return (
      <ClusterPage
        eyebrow={`${service.title} à ${ville.name}`}
        h1={seo.h1}
        intro={seo.intro}
        breadcrumbs={[
          { name: "Accueil", url: "/" },
          { name: "Expertises", url: "/expertises" },
          { name: service.title, url: `/expertises/${svcSlug}` },
          { name: ville.name, url: `/expertises/${svcSlug}/${dimSlug}` },
        ]}
        badges={[service.title, ville.name, ville.region || ""].filter(Boolean)}
        faqs={seo.faqs}
        linkGroups={linkGroups}
      />
    );
  }

  // ─── Profession ───
  const profession = db.getProfessionBySlug(dimSlug);
  if (profession) {
    const category = db.getProfessionCategoryBySlug(profession.category_slug);
    const seo = getSEOForServiceProfession(service, profession);
    const linkGroups = getCrossServiceProfessionLinks(svcSlug, dimSlug);
    return (
      <ClusterPage
        eyebrow={`${service.title} × ${profession.name}`}
        h1={seo.h1}
        intro={seo.intro}
        breadcrumbs={[
          { name: "Accueil", url: "/" },
          { name: "Expertises", url: "/expertises" },
          { name: service.title, url: `/expertises/${svcSlug}` },
          { name: profession.name, url: `/expertises/${svcSlug}/${dimSlug}` },
        ]}
        badges={[service.title, category?.icon || "", profession.name, category?.name || ""].filter(Boolean)}
        faqs={seo.faqs}
        linkGroups={linkGroups}
      >
        {profession.obligations && (
          <div className="mb-12">
            <h2 className="mb-4 font-serif text-[1.25rem] font-light text-encre">
              Spécificités {service.title.toLowerCase()} pour les {profession.name.toLowerCase()}
            </h2>
            <div className="border border-pierre-12 border-l-2 border-l-or bg-blanc p-7">
              <p className="text-[0.88rem] leading-relaxed text-ardoise">
                {profession.obligations}
              </p>
            </div>
          </div>
        )}
      </ClusterPage>
    );
  }

  notFound();
}
