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

export async function generateStaticParams() {
  return db.getDepartements().map((d) => ({ dept: d.slug }));
}

const ROUTE = "departements";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { dept: slug } = await params;
  const dept = db.getDepartementBySlug(slug);
  if (!dept) return {};
  const dbSeo = db.getSeoOverride(ROUTE, slug);
  const seo = getSEOForDepartement(dept);
  return {
    title: dbSeo?.meta_title ?? seo.metaTitle,
    description: dbSeo?.meta_description ?? seo.metaDescription,
    alternates: { canonical: `${AppConfig.url}/departements/${slug}` },
  };
}

export default async function DepartementPage({ params }: Props) {
  const { dept: slug } = await params;
  const dept = db.getDepartementBySlug(slug);
  if (!dept) notFound();

  const seo = getSEOForDepartement(dept);
  const linkGroups = getDepartementLinks(slug);

  // ─── DB-first path (route prête pour la pipeline — 0 rows aujourd'hui) ───
  const bundle = getDbPageBundle(ROUTE, slug);
  const { sections: dbSections, seo: dbSeo, lastUpdatedDate, hasDbContent } = bundle;
  const canonicalUrl = `${AppConfig.url}/departements/${slug}`;

  // ─── Maillage interne — rendu dans les DEUX chemins ───
  const villesDuDept = db.getVilles().filter((v) => v.departement === dept.code);
  const internalMesh = (
    <>
      <VillesStrip
        title={`Nos villes d'intervention en ${dept.name}`}
        villes={villesDuDept}
      />
      <ServicesGrid
        title={`Nos services en ${dept.name}`}
        services={db.getServices()}
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
      `Expert-comptable intervenant dans tout le département ${dept.name}`,
      `Rendez-vous en présentiel ou en visio, partout en ${dept.region || "France"}`,
      `Premier échange gratuit et sans engagement`,
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
        {dbSections
          .filter((s) => s.section_type !== "Hero")
          .map((s) => (
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
