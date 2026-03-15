import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { db } from "@/libs/db";
import { AppConfig } from "@/utils/AppConfig";
import { ClusterPage } from "@/components/ClusterPage";
import { ProfessionalServiceJsonLd } from "@/components/JsonLd";
import { getSEOForServiceSecteur, getSEOForServiceVille, getSEOForServiceProfession } from "@/data/seo";
import { getCrossServiceSecteurLinks, getServiceLinks, getCrossServiceProfessionLinks } from "@/utils/taxonomy";
import { getServiceSecteurMarketing, getServiceVilleMarketing, getServiceProfessionMarketing } from "@/data/marketing";
import { ContentSection } from "@/components/ContentSection";
import { Checklist } from "@/components/Checklist";
import { StatHighlight } from "@/components/StatHighlight";
import { BenefitsGrid } from "@/components/BenefitsGrid";
import { AlertBox } from "@/components/AlertBox";
import { QuoteBlock } from "@/components/QuoteBlock";

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
    const mkt = getServiceSecteurMarketing(service, secteur);
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
        keyTakeaways={[
          `${service.title} adaptée aux spécificités du secteur ${secteur.name.toLowerCase()}`,
          `Expertise sectorielle et conformité réglementaire garanties`,
          `Devis personnalisé gratuit pour votre activité`,
        ]}
        schema={
          <ProfessionalServiceJsonLd
            name={seo.h1}
            description={seo.metaDescription}
            url={`/expertises/${svcSlug}/${dimSlug}`}
            serviceType={service.title}
            audience={`Professionnels du secteur ${secteur.name}`}
          />
        }
      >
        {mkt.contentSections.map((cs) => (
          <ContentSection key={cs.title} title={cs.title} paragraphs={cs.paragraphs} />
        ))}
        <StatHighlight stats={mkt.stats} />
        <Checklist
          title={`Ce que nous couvrons en ${service.title.toLowerCase()} pour le ${secteur.name.toLowerCase()}`}
          items={mkt.checklist}
          columns={2}
        />
      </ClusterPage>
    );
  }

  // ─── Ville ───
  const ville = db.getVilleBySlug(dimSlug);
  if (ville) {
    const seo = getSEOForServiceVille(service, ville);
    const linkGroups = getServiceLinks(svcSlug);
    const mkt = getServiceVilleMarketing(service, ville);
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
        keyTakeaways={[
          `${service.title} à ${ville.name} avec ${AppConfig.name}`,
          `Rendez-vous en présentiel ou en visio, selon vos préférences`,
          `Devis gratuit et premier échange sans engagement`,
        ]}
        schema={
          <ProfessionalServiceJsonLd
            name={seo.h1}
            description={seo.metaDescription}
            url={`/expertises/${svcSlug}/${dimSlug}`}
            serviceType={service.title}
            areaServed={ville.name}
          />
        }
      >
        {mkt.contentSections.map((cs) => (
          <ContentSection key={cs.title} title={cs.title} paragraphs={cs.paragraphs} />
        ))}
        <BenefitsGrid benefits={mkt.benefits} columns={3} />
        <AlertBox type="tip">{mkt.alert}</AlertBox>
      </ClusterPage>
    );
  }

  // ─── Profession ───
  const profession = db.getProfessionBySlug(dimSlug);
  if (profession) {
    const category = db.getProfessionCategoryBySlug(profession.category_slug);
    const seo = getSEOForServiceProfession(service, profession);
    const linkGroups = getCrossServiceProfessionLinks(svcSlug, dimSlug);
    const mkt = getServiceProfessionMarketing(service, profession);
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
        keyTakeaways={[
          `${service.title} spécifiquement adaptée aux ${profession.name.toLowerCase()}`,
          `Connaissance des obligations comptables et fiscales de votre métier`,
          `Accompagnement dédié par un expert-comptable spécialisé`,
        ]}
        schema={
          <ProfessionalServiceJsonLd
            name={seo.h1}
            description={seo.metaDescription}
            url={`/expertises/${svcSlug}/${dimSlug}`}
            serviceType={service.title}
            audience={profession.name}
          />
        }
      >
        {profession.obligations && (
          <ContentSection
            title={`Spécificités ${service.title.toLowerCase()} pour les ${profession.name.toLowerCase()}`}
            paragraphs={[profession.obligations]}
            variant="highlighted"
          />
        )}
        {mkt.contentSections.map((cs) => (
          <ContentSection key={cs.title} title={cs.title} paragraphs={cs.paragraphs} />
        ))}
        <Checklist
          title={`Notre accompagnement pour les ${profession.name.toLowerCase()}`}
          items={mkt.checklist}
          columns={2}
        />
        <QuoteBlock
          quote={mkt.quote.text}
          author={mkt.quote.author}
          role={mkt.quote.role}
        />
      </ClusterPage>
    );
  }

  notFound();
}
