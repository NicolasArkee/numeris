import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { db } from "@/libs/db";
import { AppConfig } from "@/utils/AppConfig";
import { ClusterPage } from "@/components/ClusterPage";
import { DynamicSection } from "@/components/DynamicSection";
import { getSEOForSecteur } from "@/data/seo";
import { getSecteurLinks } from "@/utils/taxonomy";
import { getSecteurMarketing } from "@/data/marketing";
import { ContentSection } from "@/components/ContentSection";
import { BenefitsGrid } from "@/components/BenefitsGrid";
import { StatHighlight } from "@/components/StatHighlight";

interface Props {
  params: Promise<{ secteur: string }>;
}

const ROUTE = "secteurs";

export async function generateStaticParams() {
  return db.getSecteurs().map((s) => ({ secteur: s.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { secteur: slug } = await params;
  const secteur = db.getSecteurBySlug(slug);
  if (!secteur) return {};

  const dbSeo = db.getSeoOverride(ROUTE, slug);
  const fallback = getSEOForSecteur(secteur);

  return {
    title: dbSeo?.meta_title ?? fallback.metaTitle,
    description: dbSeo?.meta_description ?? fallback.metaDescription,
    alternates: { canonical: `${AppConfig.url}/secteurs/${slug}` },
  };
}

function ExtraJsonLd({ raw }: { raw: string | null }) {
  if (!raw) return null;
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw) as unknown;
  } catch {
    return null;
  }
  const entries = Array.isArray(parsed) ? parsed : [parsed];
  const valid = entries.filter(
    (e): e is Record<string, unknown> =>
      e !== null && typeof e === "object" && Object.keys(e as object).length > 0,
  );
  if (valid.length === 0) return null;
  return (
    <>
      {valid.map((entry, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(entry) }}
        />
      ))}
    </>
  );
}

export default async function SecteurPage({ params }: Props) {
  const { secteur: slug } = await params;
  const secteur = db.getSecteurBySlug(slug);
  if (!secteur) notFound();

  const linkGroups = getSecteurLinks(slug);

  // ─── DB-first path ───
  const dbSections = db.getPageSections(ROUTE, slug);
  const dbSeo = db.getSeoOverride(ROUTE, slug);
  const dbMeta = db.getPageMeta(ROUTE, slug);
  const lastUpdatedDate = dbMeta?.reviewed_at;
  const canonicalUrl = `${AppConfig.url}/secteurs/${slug}`;
  const hasDbContent = dbSections.length > 0;

  if (hasDbContent) {
    const seoFallback = getSEOForSecteur(secteur);
    const h1 = dbSeo?.h1 ?? seoFallback.h1;
    const heroSection = dbSections.find(
      (s) => s.section_type === "Hero" || s.section_type === "ContentSection",
    );
    const intro = dbSeo?.meta_description ?? heroSection?.body ?? seoFallback.intro;
    const keyTakeaways = (() => {
      if (!dbSeo?.key_takeaways) return undefined;
      try {
        const parsed = JSON.parse(dbSeo.key_takeaways) as unknown;
        if (Array.isArray(parsed)) {
          return parsed.filter((x): x is string => typeof x === "string");
        }
      } catch {
        // fall through
      }
      return undefined;
    })();
    const inlineFaq = dbSections.some((s) => s.section_type === "Faq");

    return (
      <ClusterPage
        eyebrow={`Secteur ${secteur.name}`}
        h1={h1}
        intro={intro}
        breadcrumbs={[
          { name: "Accueil", url: "/" },
          { name: "Secteurs", url: "/secteurs" },
          { name: secteur.name, url: `/secteurs/${slug}` },
        ]}
        badges={[secteur.name]}
        faqs={inlineFaq ? undefined : seoFallback.faqs}
        linkGroups={linkGroups}
        keyTakeaways={keyTakeaways}
        schema={<ExtraJsonLd raw={dbSeo?.json_ld_extra ?? null} />}
        lastUpdatedDate={lastUpdatedDate}
        articleSchema={true}
        articleHeadline={h1}
        articleSection="Secteurs d'activité"
        canonicalUrl={canonicalUrl}
      >
        {dbSections
          .filter((s) => s.section_type !== "Hero")
          .map((s) => (
            <DynamicSection key={s.id} section={s} />
          ))}
      </ClusterPage>
    );
  }

  // ─── Fallback static path ───
  const seo = getSEOForSecteur(secteur);
  const mkt = getSecteurMarketing(secteur);
  const services = db.getServices();
  const villes = db.getVilles().slice(0, 12);

  return (
    <ClusterPage
      eyebrow={`Secteur ${secteur.name}`}
      h1={seo.h1}
      intro={seo.intro}
      breadcrumbs={[
        { name: "Accueil", url: "/" },
        { name: "Secteurs", url: "/secteurs" },
        { name: secteur.name, url: `/secteurs/${slug}` },
      ]}
      badges={[secteur.name]}
      faqs={seo.faqs}
      linkGroups={linkGroups}
      keyTakeaways={[
        `Expert-comptable spécialisé ${secteur.name.toLowerCase()}`,
        `Connaissance des normes et obligations sectorielles`,
        `Accompagnement sur mesure et interlocuteur dédié`,
      ]}
    >
      {/* Marketing content */}
      {mkt.contentSections.map((cs) => (
        <ContentSection key={cs.title} title={cs.title} paragraphs={cs.paragraphs} />
      ))}

      {/* Benefits */}
      <BenefitsGrid
        title={`Les avantages d'un expert-comptable spécialisé ${secteur.name.toLowerCase()}`}
        benefits={mkt.benefits}
        columns={4}
      />

      {/* Stats */}
      <StatHighlight stats={mkt.stats} />

      {/* Services for this secteur */}
      <div className="mb-12">
        <h2 className="mb-6 font-serif text-[1.5rem] font-light text-encre">
          Nos services pour le secteur {secteur.name}
        </h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {services.map((svc) => (
            <a
              key={svc.slug}
              href={`/expertises/${svc.slug}/${slug}`}
              className="group border border-pierre-12 bg-blanc px-6 py-5 transition-all hover:-translate-y-0.5 hover:border-or hover:shadow-md"
            >
              <span className="mb-2 block text-[1.1rem]">{svc.icon}</span>
              <h3 className="mb-1 text-[0.95rem] font-medium text-encre group-hover:text-or-fonce">{svc.title}</h3>
              <p className="text-[0.72rem] text-ardoise">{svc.description}</p>
            </a>
          ))}
        </div>
      </div>

      {/* Villes for this secteur */}
      <div className="mb-12">
        <h2 className="mb-6 font-serif text-[1.25rem] font-light text-encre">
          {secteur.name} par ville
        </h2>
        <div className="flex flex-wrap gap-2">
          {villes.map((v) => (
            <a
              key={v.slug}
              href={`/villes/${v.slug}`}
              className="border border-pierre-12 bg-blanc px-4 py-2 text-[0.78rem] text-encre-75 transition-colors hover:border-or hover:text-or-fonce"
            >
              {v.name}
            </a>
          ))}
        </div>
      </div>
    </ClusterPage>
  );
}
