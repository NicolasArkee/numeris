import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { db } from "@/libs/db";
import { AppConfig } from "@/utils/AppConfig";
import { ClusterPage } from "@/components/ClusterPage";
import { DynamicSection } from "@/components/DynamicSection";
import { ExtraJsonLd } from "@/components/ExtraJsonLd";
import { getDbPageBundle } from "@/libs/content/dbFirst";
import { getSEOForDepartement } from "@/data/seo";
import { getDepartementLinks } from "@/utils/taxonomy";
import { ServicesGrid } from "@/components/ServicesGrid";
import { VillesStrip } from "@/components/VillesStrip";

interface Props {
  params: Promise<{ dept: string }>;
}

export const revalidate = 86400;

export async function generateStaticParams() {
  return (await db.getDepartements()).map((d) => ({ dept: d.slug }));
}

const ROUTE = "departements";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { dept: slug } = await params;
  const dept = await db.getDepartementBySlug(slug);
  if (!dept) return {};
  const dbSeo = await db.getSeoOverride(ROUTE, slug);
  const seo = getSEOForDepartement(dept);
  return {
    title: dbSeo?.meta_title ?? seo.metaTitle,
    description: dbSeo?.meta_description ?? seo.metaDescription,
    alternates: { canonical: `${AppConfig.url}/departements/${slug}` },
  };
}

export default async function DepartementPage({ params }: Props) {
  const { dept: slug } = await params;
  const dept = await db.getDepartementBySlug(slug);
  if (!dept) notFound();

  const seo = getSEOForDepartement(dept);
  const linkGroups = await getDepartementLinks(slug);

  // ─── DB-first path (route prête pour la pipeline — 0 rows aujourd'hui) ───
  const bundle = await getDbPageBundle(ROUTE, slug);
  const { sections: dbSections, seo: dbSeo, lastUpdatedDate, hasDbContent } = bundle;
  const canonicalUrl = `${AppConfig.url}/departements/${slug}`;

  // ─── Maillage interne — rendu dans les DEUX chemins ───
  const villesDuDept = (await db.getVilles()).filter((v) => v.departement === dept.code);
  const meshServices = await db.getServices();
  const internalMesh = (
    <>
      <VillesStrip
        title={`Villes à comparer en ${dept.name}`}
        villes={villesDuDept}
      />
      <ServicesGrid
        title={`Expertises à comparer en ${dept.name}`}
        services={meshServices}
        hrefBuilder={(svc) => `/expertises/${svc.slug}`}
      />
    </>
  );

  const sharedProps = {
    eyebrow: `Département ${dept.code}`,
    breadcrumbs: [
      { name: "Accueil", url: "/" },
      { name: "Villes", url: "/villes" },
      { name: `${dept.name} (${dept.code})`, url: `/departements/${slug}` },
    ],
    badges: [dept.name, dept.code, dept.region || ""].filter(Boolean),
    linkGroups,
    keyTakeaways: bundle.keyTakeaways ?? [
      `Professionnels comptables à comparer dans le département ${dept.name}`,
      `Présentiel, visio ou distance à arbitrer en ${dept.region || "France"}`,
      `Périmètre et habilitations à confirmer avant engagement`,
    ],
    schema: <ExtraJsonLd raw={dbSeo?.json_ld_extra ?? null} />,
    lastUpdatedDate,
    articleSchema: false,
    canonicalUrl,
  };

  if (hasDbContent) {
    const h1 = dbSeo?.h1 ?? seo.h1;
    const intro = dbSeo?.meta_description ?? bundle.heroSection?.body ?? seo.intro;
    const { inlineFaq } = bundle;

    return (
      <ClusterPage
        {...sharedProps}
        h1={h1}
        intro={intro}
        faqs={inlineFaq ? undefined : seo.faqs}
      >
        {bundle.renderableSections.map((s) => (
          <DynamicSection key={s.id} section={s} />
        ))}
        {internalMesh}
      </ClusterPage>
    );
  }

  // ─── Fallback enrichi (plus de coquille vide) ───
  return (
    <ClusterPage {...sharedProps} h1={seo.h1} intro={seo.intro} faqs={seo.faqs}>
      {internalMesh}
    </ClusterPage>
  );
}
