import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AppConfig } from "@/utils/AppConfig";
import { ClusterPage } from "@/components/ClusterPage";
import { DynamicSection } from "@/components/DynamicSection";
import { DocumentSpecimen } from "@/components/DocumentSpecimen";
import { ExtraJsonLd } from "@/components/ExtraJsonLd";
import { FaqJsonLd } from "@/components/JsonLd";
import { DocumentPreparation, DocumentReadingSteps, DocumentSupport, getDocumentSupportFaqs } from "@/components/documents/DocumentGuideFallback";
import { getDbPageBundle } from "@/libs/content/dbFirst";
import { db } from "@/libs/db";
import { DOCUMENTS, DOC_BY_SLUG, DOC_CATEGORIES, DOC_ROUTE, DOCS_WITH_SPECIMEN } from "@/data/documents";

interface Props {
  params: Promise<{ slug: string }>;
}

const ROUTE = DOC_ROUTE;
export const revalidate = 86400;
export const dynamicParams = true;

const catLabel = (key: string) => DOC_CATEGORIES.find((c) => c.key === key)?.label ?? "Documents";

export function generateStaticParams() {
  return DOCUMENTS.map((d) => ({ slug: d.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const doc = DOC_BY_SLUG[slug];
  if (!doc) return {};
  const dbSeo = await db.getSeoOverride(ROUTE, slug);
  const canonical = `${AppConfig.url}/documents/${slug}`;
  return {
    title: dbSeo?.meta_title ?? `${doc.label} : guide et explications`,
    description:
      dbSeo?.meta_description ??
      (DOCS_WITH_SPECIMEN.has(slug)
        ? `${doc.label} : à quoi ça sert, points à vérifier et spécimen annoté. Guide clair par Skoria.`
        : `${doc.label} : comprendre son rôle et les points à vérifier. Guide clair par Skoria.`),
    alternates: { canonical },
  };
}

export default async function DocumentPage({ params }: Props) {
  const { slug } = await params;
  const doc = DOC_BY_SLUG[slug];
  if (!doc) notFound();

  const bundle = await getDbPageBundle(ROUTE, slug);
  const { seo: dbSeo, lastUpdatedDate, hasDbContent, keyTakeaways } = bundle;

  const hasPublishedEditorial = hasDbContent && bundle.renderableSections.length > 0;
  const hasExistingFaq = bundle.renderableSections.some((section) => /faq/i.test(section.section_type))
    || /"FAQPage"/.test(dbSeo?.json_ld_extra ?? "");
  const fallbackFaqs = !hasPublishedEditorial && !hasExistingFaq ? getDocumentSupportFaqs(doc) : [];

  const eyebrow = catLabel(doc.categorie);
  const h1 = dbSeo?.h1 ?? `${doc.label} : guide et explications`;
  const intro = dbSeo?.meta_description ?? bundle.heroSection?.body
    ?? `${doc.label} : retrouvez les informations à réunir, les repères de lecture et les questions à préparer avec votre dossier. ${DOCS_WITH_SPECIMEN.has(slug) ? "Un spécimen annoté est disponible sur cette page." : "Cette fiche ne propose pas de spécimen PDF à télécharger."}`;
  const canonicalUrl = `${AppConfig.url}/documents/${slug}`;
  const breadcrumbs = [
    { name: "Accueil", url: "/" },
    { name: "Documents", url: "/documents" },
    { name: doc.label, url: `/documents/${slug}` },
  ];

  return (
    <ClusterPage
      eyebrow={eyebrow}
      h1={h1}
      intro={intro}
      breadcrumbs={breadcrumbs}
      badges={["Guide du document", DOCS_WITH_SPECIMEN.has(slug) ? "Spécimen PDF disponible" : "Sans spécimen PDF"]}
      linkGroups={[]}
      keyTakeaways={keyTakeaways}
      schema={<><ExtraJsonLd raw={dbSeo?.json_ld_extra ?? null} />{fallbackFaqs.length > 0 && <FaqJsonLd items={fallbackFaqs} />}</>}
      lastUpdatedDate={lastUpdatedDate}
      publication={bundle.publication}
      articleSchema
      articleHeadline={h1}
      articleSection="Modèles & documents"
      canonicalUrl={canonicalUrl}
    >
      <DocumentSpecimen slug={slug} label={doc.label} hasGuide />
      {!hasPublishedEditorial && <DocumentPreparation doc={doc} />}
      {!hasPublishedEditorial && <DocumentReadingSteps />}
      {!hasPublishedEditorial && <DocumentSupport doc={doc} />}
      {hasDbContent &&
        bundle.renderableSections.map((s, index) => (
          <div key={s.id} id={index === 0 ? "document-guide" : undefined} className="scroll-mt-36">
            <DynamicSection section={s} />
          </div>
        ))}
    </ClusterPage>
  );
}
