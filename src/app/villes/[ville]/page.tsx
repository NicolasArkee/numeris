import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { db } from "@/libs/db";
import { AppConfig } from "@/utils/AppConfig";
import { ClusterPage } from "@/components/ClusterPage";
import { getSEOForVille } from "@/data/seo";
import { getVilleLinks } from "@/utils/taxonomy";
import { getVilleMarketing } from "@/data/marketing";
import { ContentSection } from "@/components/ContentSection";
import { BenefitsGrid } from "@/components/BenefitsGrid";
import { QuoteBlock } from "@/components/QuoteBlock";
import { LocalBusinessVilleJsonLd } from "@/components/JsonLd";

interface Props {
  params: Promise<{ ville: string }>;
}

export async function generateStaticParams() {
  return db.getVilles().map((v) => ({ ville: v.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { ville: slug } = await params;
  const ville = db.getVilleBySlug(slug);
  if (!ville) return {};
  const seo = getSEOForVille(ville);
  return {
    title: seo.metaTitle,
    description: seo.metaDescription,
    alternates: { canonical: `${AppConfig.url}/villes/${slug}` },
  };
}

const VILLES_ROUTE = "villes";

export default async function VillePage({ params }: Props) {
  const { ville: slug } = await params;
  const ville = db.getVilleBySlug(slug);
  if (!ville) notFound();

  const seo = getSEOForVille(ville);
  const linkGroups = getVilleLinks(slug);
  const mkt = getVilleMarketing(ville);
  const services = db.getServices();

  // ─── DB-first metadata (canonical + lastUpdatedDate from page_meta).
  // ville pages stay LocalBusiness (articleSchema=false). DB sections wiring
  // can be added when the pipeline populates `villes` rows in Wave 5+.
  const dbMeta = db.getPageMeta(VILLES_ROUTE, slug);
  const lastUpdatedDate = dbMeta?.reviewed_at;
  const canonicalUrl = `${AppConfig.url}/villes/${slug}`;

  return (
    <ClusterPage
      eyebrow={`Expert-comptable ${ville.name}`}
      h1={seo.h1}
      intro={seo.intro}
      breadcrumbs={[
        { name: "Accueil", url: "/" },
        { name: "Villes", url: "/villes" },
        { name: ville.name, url: `/villes/${slug}` },
      ]}
      badges={[ville.name, ville.region || "", ville.departement ? `Dept. ${ville.departement}` : ""].filter(Boolean)}
      faqs={seo.faqs}
      linkGroups={linkGroups}
      keyTakeaways={[
        `Expert-comptable à ${ville.name}, inscrit à l'Ordre`,
        `Rendez-vous en présentiel ou en visio`,
        `Premier échange gratuit et sans engagement`,
      ]}
      lastUpdatedDate={lastUpdatedDate}
      articleSchema={false}
      canonicalUrl={canonicalUrl}
    >
      {/* LocalBusiness JSON-LD (per ville) */}
      <LocalBusinessVilleJsonLd ville={ville} />

      {/* Local info card — fully driven by per-ville DB columns */}
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

      {/* Services in this ville */}
      <div className="mb-12">
        <h2 className="mb-6 font-serif text-[1.5rem] font-light text-encre">
          Nos services à {ville.name}
        </h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {services.map((svc) => (
            <a
              key={svc.slug}
              href={`/expertises/${svc.slug}/${slug}`}
              className="border border-pierre-12 bg-blanc px-6 py-5 transition-colors hover:border-or"
            >
              <span className="mb-2 block text-[1.1rem]">{svc.icon}</span>
              <h3 className="mb-1 text-[0.95rem] font-medium text-encre">
                {svc.title} à {ville.name}
              </h3>
              <p className="text-[0.72rem] text-ardoise">{svc.description}</p>
            </a>
          ))}
        </div>
      </div>
    </ClusterPage>
  );
}
