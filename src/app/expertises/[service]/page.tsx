import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { db } from "@/libs/db";
import { AppConfig } from "@/utils/AppConfig";
import { ClusterPage } from "@/components/ClusterPage";
import { DynamicSection } from "@/components/DynamicSection";
import { ExtraJsonLd } from "@/components/ExtraJsonLd";
import { ServiceJsonLd } from "@/components/JsonLd";
import { getDbPageBundle } from "@/libs/content/dbFirst";
import { getSEOForService } from "@/data/seo";
import { getServiceLinks } from "@/utils/taxonomy";
import { getServiceMarketing } from "@/data/marketing";
import { BenefitsGrid } from "@/components/BenefitsGrid";
import { NumberedSteps } from "@/components/NumberedSteps";
import { StatHighlight } from "@/components/StatHighlight";
import { Checklist } from "@/components/Checklist";
import { AlertBox } from "@/components/AlertBox";
import { QuoteBlock } from "@/components/QuoteBlock";

interface Props {
  params: Promise<{ service: string }>;
}

export async function generateStaticParams() {
  return db.getServices().map((s) => ({ service: s.slug }));
}

const ROUTE = "expertises";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { service: slug } = await params;
  const service = db.getServices().find((s) => s.slug === slug);
  if (!service) return {};
  // Clé racine = slug du service (pas de collision avec les clés composites
  // `{svc}__{type}__{dim}` des pages croisées).
  const dbSeo = db.getSeoOverride(ROUTE, slug);
  const seo = getSEOForService(service);
  return {
    title: dbSeo?.meta_title ?? seo.metaTitle,
    description: dbSeo?.meta_description ?? seo.metaDescription,
    alternates: { canonical: `${AppConfig.url}/expertises/${slug}` },
  };
}

export default async function ServicePage({ params }: Props) {
  const { service: slug } = await params;
  const service = db.getServices().find((s) => s.slug === slug);
  if (!service) notFound();

  const seo = getSEOForService(service);
  const linkGroups = getServiceLinks(slug);
  const mkt = getServiceMarketing(service);
  const secteurs = db.getServiceSecteurs(slug);
  const allSecteurs = db.getSecteurs();
  const secteurMap = new Map(allSecteurs.map((s) => [s.slug, s]));
  const professions = db.getServiceProfessions(slug);
  const categories = db.getProfessionCategories();
  const categoryMap = new Map(categories.map((c) => [c.slug, c]));

  // Group professions by category for display
  const professionsByCategory = new Map<string, { name: string; slug: string }[]>();
  for (const sp of professions) {
    const prof = db.getProfessionBySlug(sp.profession_slug);
    if (!prof) continue;
    const catSlug = prof.category_slug;
    if (!professionsByCategory.has(catSlug)) {
      professionsByCategory.set(catSlug, []);
    }
    professionsByCategory.get(catSlug)!.push({ name: prof.name, slug: prof.slug });
  }

  // ─── DB-first path ───
  const bundle = getDbPageBundle(ROUTE, slug);
  const { sections: dbSections, seo: dbSeo, lastUpdatedDate, hasDbContent } = bundle;
  const canonicalUrl = `${AppConfig.url}/expertises/${slug}`;

  // ─── Chrome partagé DB + fallback ───
  const breadcrumbs = [
    { name: "Accueil", url: "/" },
    { name: "Expertises", url: "/expertises" },
    { name: service.title, url: `/expertises/${slug}` },
  ];
  const keyTakeaways = bundle.keyTakeaways ?? [
    `${service.title} adaptée à votre structure et votre secteur d'activité`,
    `Équipe dédiée de ${AppConfig.name}, inscrite à l'Ordre des Experts-Comptables`,
    `Devis gratuit et premier rendez-vous sans engagement`,
  ];
  const schema = (
    <>
      <ServiceJsonLd
        name={`${service.title} — ${AppConfig.name}`}
        description={seo.metaDescription}
        url={`/expertises/${slug}`}
        category="Expertise comptable"
      />
      <ExtraJsonLd raw={dbSeo?.json_ld_extra ?? null} />
    </>
  );

  // ─── Maillage interne (secteurs + professions) — rendu dans les DEUX chemins ───
  const internalMesh = (
    <>
      {secteurs.length > 0 && (
        <div className="mb-12">
          <h2 className="mb-6 font-serif text-[1.5rem] font-light text-encre">
            {service.title} par secteur
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {secteurs.map((ss) => {
              const sec = secteurMap.get(ss.secteur_slug);
              if (!sec) return null;
              return (
                <a
                  key={ss.secteur_slug}
                  href={`/expertises/${slug}/${ss.secteur_slug}`}
                  className="border border-pierre-12 bg-blanc px-6 py-5 transition-colors hover:border-or"
                >
                  <h3 className="mb-1 text-[0.95rem] font-medium text-encre">{sec.name}</h3>
                  <p className="text-[0.72rem] text-ardoise">{sec.description}</p>
                </a>
              );
            })}
          </div>
        </div>
      )}
      {professionsByCategory.size > 0 && (
        <div className="mb-12">
          <h2 className="mb-6 font-serif text-[1.5rem] font-light text-encre">
            {service.title} par profession
          </h2>
          <div className="space-y-8">
            {Array.from(professionsByCategory.entries()).map(([catSlug, profs]) => {
              const cat = categoryMap.get(catSlug);
              if (!cat) return null;
              return (
                <div key={catSlug}>
                  <div className="mb-3 flex items-center gap-2">
                    <span className="text-[1rem]">{cat.icon}</span>
                    <h3 className="text-[0.95rem] font-medium text-encre">{cat.name}</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {profs.slice(0, 8).map((p) => (
                      <a
                        key={p.slug}
                        href={`/expertises/${slug}/${p.slug}`}
                        className="border border-pierre-12 bg-blanc px-4 py-2 text-[0.78rem] text-encre-75 transition-colors hover:border-or hover:text-or-fonce"
                      >
                        {p.name}
                      </a>
                    ))}
                    {profs.length > 8 && (
                      <span className="px-4 py-2 text-[0.72rem] text-ardoise">
                        +{profs.length - 8} professions
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </>
  );

  if (hasDbContent) {
    const h1 = dbSeo?.h1 ?? seo.h1;
    const intro = dbSeo?.meta_description ?? bundle.heroSection?.body ?? seo.intro;
    const { inlineFaq } = bundle;

    return (
      <ClusterPage
        eyebrow={AppConfig.tagline}
        h1={h1}
        intro={intro}
        breadcrumbs={breadcrumbs}
        badges={[service.icon, service.title]}
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
        {dbSections
          .filter((s) => s.section_type !== "Hero")
          .map((s) => (
            <DynamicSection key={s.id} section={s} />
          ))}
        {internalMesh}
      </ClusterPage>
    );
  }

  return (
    <ClusterPage
      eyebrow={AppConfig.tagline}
      h1={seo.h1}
      intro={seo.intro}
      breadcrumbs={breadcrumbs}
      badges={[service.icon, service.title]}
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
      {/* Benefits */}
      <BenefitsGrid
        title={`Pourquoi choisir ${AppConfig.name} pour votre ${service.title.toLowerCase()} ?`}
        benefits={mkt.benefits}
      />

      {/* Stats */}
      <StatHighlight stats={mkt.stats} />

      {/* Maillage interne (secteurs + professions) */}
      {internalMesh}

      {/* How it works */}
      <NumberedSteps
        title={`Comment se passe votre ${service.title.toLowerCase()} ?`}
        steps={mkt.steps}
      />

      {/* Checklist */}
      <Checklist
        title={`Ce que comprend notre service de ${service.title.toLowerCase()}`}
        items={mkt.checklist}
        columns={2}
      />

      {/* Testimonial */}
      <QuoteBlock
        quote={mkt.quote.text}
        author={mkt.quote.author}
        role={mkt.quote.role}
      />

      {/* Alert */}
      <AlertBox type="tip">
        {mkt.alert}
      </AlertBox>
    </ClusterPage>
  );
}
