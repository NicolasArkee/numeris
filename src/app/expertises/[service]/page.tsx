import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { db } from "@/libs/db";
import { AppConfig } from "@/utils/AppConfig";
import {
  BreadcrumbJsonLd,
  FaqJsonLd,
  WebPageJsonLd,
} from "@/components/JsonLd";
import { getDbPageBundle } from "@/libs/content/dbFirst";
import { normalizeMetaDescription } from "@/libs/content/meta-title";
import { getSEOForService } from "@/data/seo";
import { ExpertiseServiceLandingV3 } from "@/components/expertises/ExpertiseServiceLandingV3";
import { buildServiceLandingFaqItems } from "@/components/expertises/service-v3-helpers";

interface Props {
  params: Promise<{ service: string }>;
}

export const revalidate = 86400;

export async function generateStaticParams() {
  return (await db.getServices()).map((s) => ({ service: s.slug }));
}

const ROUTE = "expertises";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { service: slug } = await params;
  const service = (await db.getServices()).find((s) => s.slug === slug);
  if (!service) return {};
  // Clé racine = slug du service (pas de collision avec les clés composites
  // `{svc}__{type}__{dim}` des pages croisées).
  const dbSeo = await db.getSeoOverride(ROUTE, slug);
  const seo = getSEOForService(service);
  return {
    title: dbSeo?.meta_title ?? seo.metaTitle,
    description: normalizeMetaDescription(dbSeo?.meta_description ?? seo.metaDescription),
    alternates: { canonical: `${AppConfig.url}/expertises/${slug}` },
  };
}

export default async function ServicePage({ params }: Props) {
  const { service: slug } = await params;
  const service = (await db.getServices()).find((s) => s.slug === slug);
  if (!service) notFound();

  const seo = getSEOForService(service);
  const secteurs = await db.getServiceSecteurs(slug);
  const allSecteurs = await db.getSecteurs();
  const secteurMap = new Map(allSecteurs.map((s) => [s.slug, s]));
  const sectorCards = secteurs
    .map((item) => secteurMap.get(item.secteur_slug))
    .filter((item): item is NonNullable<typeof item> => Boolean(item));
  const serviceProfessions = await db.getServiceProfessions(slug);
  const professions = (
    await Promise.all(
      serviceProfessions.map((item) => db.getProfessionBySlug(item.profession_slug)),
    )
  ).filter((item): item is NonNullable<typeof item> => Boolean(item));
  const categories = await db.getProfessionCategories();

  // ─── DB-first path ───
  const bundle = await getDbPageBundle(ROUTE, slug);
  const { seo: dbSeo, lastUpdatedDate } = bundle;

  // ─── Chrome partagé DB + fallback ───
  const breadcrumbs = [
    { name: "Accueil", url: "/" },
    { name: "Expertises", url: "/expertises" },
    { name: service.title, url: `/expertises/${slug}` },
  ];
  const h1 = dbSeo?.h1 ?? seo.h1;
  const intro = dbSeo?.meta_description ?? bundle.heroSection?.body ?? seo.intro;
  const landingSeo = { ...seo, h1, intro };
  const faqItems = [...buildServiceLandingFaqItems(service), ...seo.faqs];
  const dbEditorialSections = bundle.renderableSections.filter(
    (section) => !/(faq|pricing|testimonial|cta|hero)/i.test(section.section_type),
  );

  return (
    <>
      <BreadcrumbJsonLd items={breadcrumbs} />
      <FaqJsonLd items={faqItems} id={`expertise-${slug}`} />
      <WebPageJsonLd
        name={h1}
        description={intro}
        url={`/expertises/${slug}`}
        dateModified={lastUpdatedDate}
      />
      <ExpertiseServiceLandingV3
        service={service}
        seo={landingSeo}
        secteurs={sectorCards}
        professions={professions}
        categories={categories}
        dbSections={dbEditorialSections}
      />
    </>
  );
}
