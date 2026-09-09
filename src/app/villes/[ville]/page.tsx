import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/libs/db";
import type { Ville } from "@/libs/db";
import { AppConfig } from "@/utils/AppConfig";
import { ClusterPage } from "@/components/ClusterPage";
import { DynamicSection } from "@/components/DynamicSection";
import { ExtraJsonLd } from "@/components/ExtraJsonLd";
import { getDbPageBundle } from "@/libs/content/dbFirst";
import { getSEOForVille } from "@/data/seo";
import { getVilleLinks } from "@/utils/taxonomy";
import { getVilleMarketing } from "@/data/marketing";
import { ContentSection } from "@/components/ContentSection";
import { BenefitsGrid } from "@/components/BenefitsGrid";
import { QuoteBlock } from "@/components/QuoteBlock";
import { ServicesGrid } from "@/components/ServicesGrid";
import { LocalBusinessVilleJsonLd } from "@/components/JsonLd";
import { BriefTrigger } from "@/components/journey/BriefTrigger";
import { LocalComparisonPlanner } from "@/components/templates/geo/LocalComparisonPlanner";
import { LocalComparisonGuide } from "@/components/templates/geo/LocalComparisonGuide";

interface Props {
  params: Promise<{ ville: string }>;
}

export const revalidate = 86400;

export async function generateStaticParams() {
  return (await db.getVilles()).map((v) => ({ ville: v.slug }));
}

const VILLES_ROUTE = "villes";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { ville: slug } = await params;
  const ville = await db.getVilleBySlug(slug);
  if (!ville) return {};
  const dbSeo = await db.getSeoOverride(VILLES_ROUTE, slug);
  const seo = getSEOForVille(ville);
  return {
    title: dbSeo?.meta_title ?? seo.metaTitle,
    description: dbSeo?.meta_description ?? seo.metaDescription,
    alternates: { canonical: `${AppConfig.url}/villes/${slug}` },
  };
}

// ─── Info card locale — invariant rendu dans les DEUX chemins (DB + fallback).
// Entièrement pilotée par les colonnes per-ville de la DB.
function VilleInfoCard({ ville, directoryHref }: { ville: Ville; directoryHref: string }) {
  return (
    <section className="overflow-hidden rounded-[1.75rem] bg-lilac p-6 sm:p-9 lg:p-11" aria-label={`Votre recherche à ${ville.name}`}>
      <div className="grid gap-8 lg:grid-cols-[1fr_.8fr] lg:items-end">
        <div>
          <p className="font-mono text-[.65rem] font-bold uppercase tracking-[.18em] text-blue">Votre point de départ</p>
          <h2 className="mt-4 max-w-[20ch] text-balance text-[clamp(2rem,4vw,3.5rem)] font-semibold leading-[1.05] text-navy">Comparer à {ville.name} avec les bons repères.</h2>
          <p className="mt-5 max-w-xl text-[.9rem] leading-7 text-ink-muted">Commencez par les établissements recensés, puis rapprochez votre activité, votre organisation et les missions à confier. Une adresse donne un point de départ à la recherche ; les modalités d'accompagnement restent à confirmer.</p>
        </div>
        <dl className="overflow-hidden rounded-[1.25rem] bg-white p-5 sm:p-6">
          {[
            ["Ville", [ville.postal_code, ville.name].filter(Boolean).join(" ")],
            ["Département", ville.departement || "À préciser"],
            ["Région", ville.region || "À préciser"],
          ].map(([label, value]) => <div key={label} className="flex flex-wrap justify-between gap-x-6 gap-y-2 border-t border-ink/10 py-4 first:border-0"><dt className="text-[.78rem] text-ink-muted">{label}</dt><dd className="text-[.88rem] font-bold text-navy">{value}</dd></div>)}
        </dl>
      </div>
      <div className="mt-8 flex flex-wrap gap-3 border-t border-ink/15 pt-6">
        <Link href={directoryHref} className="inline-flex min-h-12 items-center justify-center gap-3 rounded-full bg-blue px-6 py-3 text-[.83rem] font-bold text-white hover:bg-navy">Explorer l'annuaire <span aria-hidden>↗</span></Link>
        <BriefTrigger prefill={{ city: ville.name }} className="inline-flex min-h-12 items-center justify-center gap-3 rounded-full border border-ink/20 px-6 py-3 text-[.83rem] font-bold text-navy hover:bg-white">Préparer mon besoin <span aria-hidden>→</span></BriefTrigger>
      </div>
    </section>
  );
}

export default async function VillePage({ params }: Props) {
  const { ville: slug } = await params;
  const ville = await db.getVilleBySlug(slug);
  if (!ville) notFound();

  const seo = getSEOForVille(ville);
  const linkGroups = await getVilleLinks(slug);

  // ─── DB-first path ───
  const bundle = await getDbPageBundle(VILLES_ROUTE, slug);
  const { seo: dbSeo, lastUpdatedDate, hasDbContent } = bundle;
  const canonicalUrl = `${AppConfig.url}/villes/${slug}`;

  // Invariants des DEUX chemins : LocalBusiness JSON-LD (via schema), info
  // card locale et grille services (maillage /expertises/{svc}/{ville}).
  const schema = (
    <>
      <LocalBusinessVilleJsonLd ville={ville} />
      <ExtraJsonLd raw={dbSeo?.json_ld_extra ?? null} />
    </>
  );
  const servicesForGrid = await db.getServices();
  const directoryCity = await db.getDirectoryCityBySlug(slug).catch(() => null);
  const directoryHref = directoryCity ? `/expert-comptable/${directoryCity.slug}` : "/annuaire/experts-comptables";
  const servicesGrid = (
    <ServicesGrid
      title={`Expertises à comparer à ${ville.name}`}
      services={servicesForGrid}
      hrefBuilder={(svc) => `/expertises/${svc.slug}/${slug}`}
      cardTitleBuilder={(svc) => `${svc.title} à ${ville.name}`}
    />
  );
  const breadcrumbs = [
    { name: "Accueil", url: "/" },
    { name: "Villes", url: "/villes" },
    { name: ville.name, url: `/villes/${slug}` },
  ];
  const badges = [
    ville.name,
    ville.region || "",
    ville.departement ? `Dept. ${ville.departement}` : "",
  ].filter(Boolean);
  const keyTakeaways = bundle.keyTakeaways ?? [
    `Professionnels comptables à comparer à ${ville.name}`,
    `Présentiel, visio ou distance à arbitrer`,
    `Périmètre et habilitations à confirmer avant engagement`,
  ];

  if (hasDbContent) {
    const h1 = dbSeo?.h1 ?? seo.h1;
    const intro = dbSeo?.meta_description ?? bundle.heroSection?.body ?? seo.intro;
    const { inlineFaq } = bundle;

    return (
      <ClusterPage
        eyebrow={`Comparateur à ${ville.name}`}
        h1={h1}
        intro={intro}
        breadcrumbs={breadcrumbs}
        badges={badges}
        faqs={inlineFaq ? undefined : seo.faqs}
        linkGroups={linkGroups}
        keyTakeaways={keyTakeaways}
        schema={schema}
        lastUpdatedDate={lastUpdatedDate}
        publication={bundle.publication}
        articleSchema={false}
        canonicalUrl={canonicalUrl}
      >
        <VilleInfoCard ville={ville} directoryHref={directoryHref} />
        <LocalComparisonPlanner city={ville.name} area={ville.name} />
        {bundle.renderableSections.map((s) => (
          <DynamicSection key={s.id} section={s} />
        ))}
        {servicesGrid}
      </ClusterPage>
    );
  }

  // ─── Fallback static path ───
  const mkt = getVilleMarketing(ville);

  return (
    <ClusterPage
      eyebrow={`Comparateur à ${ville.name}`}
      h1={seo.h1}
      intro={seo.intro}
      breadcrumbs={breadcrumbs}
      badges={badges}
      faqs={seo.faqs}
      linkGroups={linkGroups}
      keyTakeaways={keyTakeaways}
      schema={schema}
      lastUpdatedDate={lastUpdatedDate}
      publication={bundle.publication}
      articleSchema={false}
      canonicalUrl={canonicalUrl}
    >
      <VilleInfoCard ville={ville} directoryHref={directoryHref} />
      <LocalComparisonPlanner city={ville.name} area={ville.name} />
      <LocalComparisonGuide area={ville.name} />

      {/* Marketing content */}
      {mkt.contentSections.map((cs) => (
        <ContentSection key={cs.title} title={cs.title} paragraphs={cs.paragraphs} />
      ))}

      {/* Benefits */}
      <BenefitsGrid benefits={mkt.benefits} columns={4} />

      {/* Citation de méthode, sans note ni témoignage client. */}
      <QuoteBlock
        quote={mkt.quote.text}
        author={mkt.quote.author}
        role={mkt.quote.role}
        variant="citation"
      />

      {servicesGrid}
    </ClusterPage>
  );
}
