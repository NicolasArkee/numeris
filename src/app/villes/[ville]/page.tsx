import type { Metadata } from "next";
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

interface Props {
  params: Promise<{ ville: string }>;
}

export async function generateStaticParams() {
  return db.getVilles().map((v) => ({ ville: v.slug }));
}

const VILLES_ROUTE = "villes";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { ville: slug } = await params;
  const ville = db.getVilleBySlug(slug);
  if (!ville) return {};
  const dbSeo = db.getSeoOverride(VILLES_ROUTE, slug);
  const seo = getSEOForVille(ville);
  return {
    title: dbSeo?.meta_title ?? seo.metaTitle,
    description: dbSeo?.meta_description ?? seo.metaDescription,
    alternates: { canonical: `${AppConfig.url}/villes/${slug}` },
  };
}

// ─── Info card locale — invariant rendu dans les DEUX chemins (DB + fallback).
// Entièrement pilotée par les colonnes per-ville de la DB.
function VilleInfoCard({ ville }: { ville: Ville }) {
  return (
    <div className="mb-12 border border-pierre-12 border-l-2 border-l-or bg-blanc p-7">
      <h2 className="mb-4 font-serif text-[1.25rem] font-light text-encre">
        Votre cabinet à {ville.name}
      </h2>
      <div className="grid gap-6 md:grid-cols-3">
        <div>
          <span className="mb-1 block text-[0.68rem] font-bold uppercase tracking-[0.1em] text-ardoise">
            Adresse
          </span>
          <p className="text-[0.85rem] text-encre">
            {ville.address ? (
              <>
                {ville.address}
                <br />
                {ville.postal_code} {ville.name}
              </>
            ) : (
              AppConfig.address
            )}
          </p>
        </div>
        <div>
          <span className="mb-1 block text-[0.68rem] font-bold uppercase tracking-[0.1em] text-ardoise">
            Téléphone
          </span>
          <p className="text-[0.85rem] font-medium text-or-fonce">
            {ville.phone ?? AppConfig.phone}
          </p>
          {ville.opening_hours && (
            <p className="mt-1 text-[0.72rem] text-ardoise">
              Lun.–Ven. 9h–18h
            </p>
          )}
        </div>
        <div>
          <span className="mb-1 block text-[0.68rem] font-bold uppercase tracking-[0.1em] text-ardoise">
            Rendez-vous
          </span>
          <a href="/contact" className="text-[0.85rem] font-medium text-or-fonce hover:underline">
            Prendre rendez-vous →
          </a>
        </div>
      </div>
    </div>
  );
}

export default async function VillePage({ params }: Props) {
  const { ville: slug } = await params;
  const ville = db.getVilleBySlug(slug);
  if (!ville) notFound();

  const seo = getSEOForVille(ville);
  const linkGroups = getVilleLinks(slug);

  // ─── DB-first path ───
  const bundle = getDbPageBundle(VILLES_ROUTE, slug);
  const { sections: dbSections, seo: dbSeo, lastUpdatedDate, hasDbContent } = bundle;
  const canonicalUrl = `${AppConfig.url}/villes/${slug}`;

  // Invariants des DEUX chemins : LocalBusiness JSON-LD (via schema), info
  // card locale et grille services (maillage /expertises/{svc}/{ville}).
  const schema = (
    <>
      <LocalBusinessVilleJsonLd ville={ville} />
      <ExtraJsonLd raw={dbSeo?.json_ld_extra ?? null} />
    </>
  );
  const servicesGrid = (
    <ServicesGrid
      title={`Nos services à ${ville.name}`}
      services={db.getServices()}
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
    `Expert-comptable à ${ville.name}, inscrit à l'Ordre`,
    `Rendez-vous en présentiel ou en visio`,
    `Premier échange gratuit et sans engagement`,
  ];

  if (hasDbContent) {
    const h1 = dbSeo?.h1 ?? seo.h1;
    const intro = dbSeo?.meta_description ?? bundle.heroSection?.body ?? seo.intro;
    const { inlineFaq } = bundle;

    return (
      <ClusterPage
        eyebrow={`Expert-comptable ${ville.name}`}
        h1={h1}
        intro={intro}
        breadcrumbs={breadcrumbs}
        badges={badges}
        faqs={inlineFaq ? undefined : seo.faqs}
        linkGroups={linkGroups}
        keyTakeaways={keyTakeaways}
        schema={schema}
        lastUpdatedDate={lastUpdatedDate}
        articleSchema={false}
        canonicalUrl={canonicalUrl}
      >
        <VilleInfoCard ville={ville} />
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
      eyebrow={`Expert-comptable ${ville.name}`}
      h1={seo.h1}
      intro={seo.intro}
      breadcrumbs={breadcrumbs}
      badges={badges}
      faqs={seo.faqs}
      linkGroups={linkGroups}
      keyTakeaways={keyTakeaways}
      schema={schema}
      lastUpdatedDate={lastUpdatedDate}
      articleSchema={false}
      canonicalUrl={canonicalUrl}
    >
      <VilleInfoCard ville={ville} />

      {/* Marketing content */}
      {mkt.contentSections.map((cs) => (
        <ContentSection key={cs.title} title={cs.title} paragraphs={cs.paragraphs} />
      ))}

      {/* Benefits */}
      <BenefitsGrid benefits={mkt.benefits} columns={4} />

      {/* Testimonial */}
      <QuoteBlock
        quote={mkt.quote.text}
        author={mkt.quote.author}
        role={mkt.quote.role}
      />

      {servicesGrid}
    </ClusterPage>
  );
}
