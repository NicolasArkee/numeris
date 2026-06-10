import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { db } from "@/libs/db";
import { AppConfig } from "@/utils/AppConfig";
import { ClusterPage } from "@/components/ClusterPage";
import { DynamicSection } from "@/components/DynamicSection";
import { ExtraJsonLd } from "@/components/ExtraJsonLd";
import { ProfessionalServiceJsonLd } from "@/components/JsonLd";
import { getDbPageBundle } from "@/libs/content/dbFirst";
import { expertisesSlugKey, type ExpertiseDimType } from "@/libs/content/keys";
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

const EXPERTISES_ROUTE = "expertises";

// ─── Résolution de la dimension (ordre de précédence : secteur > ville >
// profession, identique à l'historique). La clé DB suit la convention
// pipeline `{service}__{type}__{dimension}` — voir libs/content/keys.ts.
function resolveDimension(dimSlug: string) {
  const secteur = db.getSecteurBySlug(dimSlug);
  if (secteur) return { dimType: "secteur" as ExpertiseDimType, secteur, ville: undefined, profession: undefined };
  const ville = db.getVilleBySlug(dimSlug);
  if (ville) return { dimType: "ville" as ExpertiseDimType, secteur: undefined, ville, profession: undefined };
  const profession = db.getProfessionBySlug(dimSlug);
  if (profession) return { dimType: "profession" as ExpertiseDimType, secteur: undefined, ville: undefined, profession };
  return null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { service: svcSlug, dimension: dimSlug } = await params;
  const service = db.getServices().find((s) => s.slug === svcSlug);
  if (!service) return {};

  const dim = resolveDimension(dimSlug);
  if (!dim) return {};

  const dbSeo = db.getSeoOverride(
    EXPERTISES_ROUTE,
    expertisesSlugKey(svcSlug, dim.dimType, dimSlug),
  );
  const seo = dim.secteur
    ? getSEOForServiceSecteur(service, dim.secteur)
    : dim.ville
      ? getSEOForServiceVille(service, dim.ville)
      : getSEOForServiceProfession(service, dim.profession!);

  return {
    title: dbSeo?.meta_title ?? seo.metaTitle,
    description: dbSeo?.meta_description ?? seo.metaDescription,
    alternates: { canonical: `${AppConfig.url}/expertises/${svcSlug}/${dimSlug}` },
  };
}

export default async function CrossDimensionPage({ params }: Props) {
  const { service: svcSlug, dimension: dimSlug } = await params;
  const service = db.getServices().find((s) => s.slug === svcSlug);
  if (!service) notFound();

  const dim = resolveDimension(dimSlug);
  if (!dim) notFound();
  const { dimType, secteur, ville, profession } = dim;

  // ─── DB-first bundle — clé composite alignée sur la pipeline ───
  const expertisesSlug = expertisesSlugKey(svcSlug, dimType, dimSlug);
  const bundle = getDbPageBundle(EXPERTISES_ROUTE, expertisesSlug);
  const { sections: dbSections, seo: dbSeo, lastUpdatedDate, hasDbContent } = bundle;
  const canonicalUrl = `${AppConfig.url}/expertises/${svcSlug}/${dimSlug}`;

  // ─── Chrome par type de dimension (partagé DB + fallback) ───
  const dimName = secteur?.name ?? ville?.name ?? profession!.name;
  const seo = secteur
    ? getSEOForServiceSecteur(service, secteur)
    : ville
      ? getSEOForServiceVille(service, ville)
      : getSEOForServiceProfession(service, profession!);
  const linkGroups = secteur
    ? getCrossServiceSecteurLinks(svcSlug, dimSlug)
    : ville
      ? getServiceLinks(svcSlug)
      : getCrossServiceProfessionLinks(svcSlug, dimSlug);
  const category = profession
    ? db.getProfessionCategoryBySlug(profession.category_slug)
    : undefined;
  const eyebrow = ville
    ? `${service.title} à ${ville.name}`
    : `${service.title} × ${dimName}`;
  const breadcrumbs = [
    { name: "Accueil", url: "/" },
    { name: "Expertises", url: "/expertises" },
    { name: service.title, url: `/expertises/${svcSlug}` },
    { name: dimName, url: `/expertises/${svcSlug}/${dimSlug}` },
  ];
  const badges = secteur
    ? [service.title, secteur.name]
    : ville
      ? [service.title, ville.name, ville.region || ""].filter(Boolean)
      : [service.title, category?.icon || "", profession!.name, category?.name || ""].filter(Boolean);
  const fallbackTakeaways = secteur
    ? [
        `${service.title} adaptée aux spécificités du secteur ${secteur.name.toLowerCase()}`,
        `Expertise sectorielle et conformité réglementaire garanties`,
        `Devis personnalisé gratuit pour votre activité`,
      ]
    : ville
      ? [
          `${service.title} à ${ville.name} avec ${AppConfig.name}`,
          `Rendez-vous en présentiel ou en visio, selon vos préférences`,
          `Devis gratuit et premier échange sans engagement`,
        ]
      : [
          `${service.title} spécifiquement adaptée aux ${profession!.name.toLowerCase()}`,
          `Connaissance des obligations comptables et fiscales de votre métier`,
          `Accompagnement dédié par un expert-comptable spécialisé`,
        ];
  const keyTakeaways = bundle.keyTakeaways ?? fallbackTakeaways;
  const schema = (
    <>
      <ProfessionalServiceJsonLd
        name={seo.h1}
        description={seo.metaDescription}
        url={`/expertises/${svcSlug}/${dimSlug}`}
        serviceType={service.title}
        {...(ville
          ? { areaServed: ville.name }
          : {
              audience: secteur
                ? `Professionnels du secteur ${secteur.name}`
                : profession!.name,
            })}
      />
      <ExtraJsonLd raw={dbSeo?.json_ld_extra ?? null} />
    </>
  );

  // ─── DB-first path (branche unique, tous types de dimension) ───
  if (hasDbContent) {
    const h1 = dbSeo?.h1 ?? seo.h1;
    const intro = dbSeo?.meta_description ?? bundle.heroSection?.body ?? seo.intro;
    const { inlineFaq } = bundle;

    return (
      <ClusterPage
        eyebrow={eyebrow}
        h1={h1}
        intro={intro}
        breadcrumbs={breadcrumbs}
        badges={badges}
        faqs={inlineFaq ? undefined : seo.faqs}
        linkGroups={linkGroups}
        keyTakeaways={keyTakeaways}
        schema={schema}
        lastUpdatedDate={lastUpdatedDate}
        articleSchema={true}
        articleHeadline={h1}
        articleSection="Expertises comptables"
        canonicalUrl={canonicalUrl}
      >
        {bundle.renderableSections.map((s) => (
          <DynamicSection key={s.id} section={s} />
        ))}
      </ClusterPage>
    );
  }

  // ─── Fallback static paths (rendu historique par type) ───
  if (secteur) {
    const mkt = getServiceSecteurMarketing(service, secteur);
    return (
      <ClusterPage
        eyebrow={eyebrow}
        h1={seo.h1}
        intro={seo.intro}
        breadcrumbs={breadcrumbs}
        badges={badges}
        faqs={seo.faqs}
        linkGroups={linkGroups}
        keyTakeaways={keyTakeaways}
        schema={schema}
        lastUpdatedDate={lastUpdatedDate}
        articleSchema={true}
        articleHeadline={seo.h1}
        articleSection="Expertises comptables"
        canonicalUrl={canonicalUrl}
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

  if (ville) {
    const mkt = getServiceVilleMarketing(service, ville);
    return (
      <ClusterPage
        eyebrow={eyebrow}
        h1={seo.h1}
        intro={seo.intro}
        breadcrumbs={breadcrumbs}
        badges={badges}
        faqs={seo.faqs}
        linkGroups={linkGroups}
        keyTakeaways={keyTakeaways}
        schema={schema}
        lastUpdatedDate={lastUpdatedDate}
        articleSchema={true}
        articleHeadline={seo.h1}
        articleSection="Expertises comptables"
        canonicalUrl={canonicalUrl}
      >
        {mkt.contentSections.map((cs) => (
          <ContentSection key={cs.title} title={cs.title} paragraphs={cs.paragraphs} />
        ))}
        <BenefitsGrid benefits={mkt.benefits} columns={3} />
        <AlertBox type="tip">{mkt.alert}</AlertBox>
      </ClusterPage>
    );
  }

  const mkt = getServiceProfessionMarketing(service, profession!);
  return (
    <ClusterPage
      eyebrow={eyebrow}
      h1={seo.h1}
      intro={seo.intro}
      breadcrumbs={breadcrumbs}
      badges={badges}
      faqs={seo.faqs}
      linkGroups={linkGroups}
      keyTakeaways={keyTakeaways}
      schema={schema}
      lastUpdatedDate={lastUpdatedDate}
      articleSchema={true}
      articleHeadline={seo.h1}
      articleSection="Expertises comptables"
      canonicalUrl={canonicalUrl}
    >
      {profession!.obligations && (
        <ContentSection
          title={`Spécificités ${service.title.toLowerCase()} pour les ${profession!.name.toLowerCase()}`}
          paragraphs={[profession!.obligations]}
          variant="highlighted"
        />
      )}
      {mkt.contentSections.map((cs) => (
        <ContentSection key={cs.title} title={cs.title} paragraphs={cs.paragraphs} />
      ))}
      <Checklist
        title={`Notre accompagnement pour les ${profession!.name.toLowerCase()}`}
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
