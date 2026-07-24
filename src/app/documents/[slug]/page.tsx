import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AppConfig } from "@/utils/AppConfig";
import { ClusterPage } from "@/components/ClusterPage";
import { DynamicSection } from "@/components/DynamicSection";
import { DocumentSpecimen } from "@/components/DocumentSpecimen";
import { ExtraJsonLd } from "@/components/ExtraJsonLd";
import { getDbPageBundle } from "@/libs/content/dbFirst";
import { db } from "@/libs/db";
import { DOCUMENTS, DOC_BY_SLUG, DOC_CATEGORIES, DOC_ROUTE } from "@/data/documents";

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
    title: dbSeo?.meta_title ?? `${doc.label} : modèle expliqué | ${AppConfig.name}`,
    description:
      dbSeo?.meta_description ??
      `${doc.label} : à quoi ça sert, mentions obligatoires et spécimen annoté. Guide clair par Skoria.`,
    alternates: { canonical },
  };
}

export default async function DocumentPage({ params }: Props) {
  const { slug } = await params;
  const doc = DOC_BY_SLUG[slug];
  if (!doc) notFound();

  const bundle = await getDbPageBundle(ROUTE, slug);
  const { seo: dbSeo, lastUpdatedDate, hasDbContent, keyTakeaways } = bundle;

  const eyebrow = catLabel(doc.categorie);
  const h1 = dbSeo?.h1 ?? `${doc.label} : modèle et explications`;
  const intro = dbSeo?.meta_description ?? bundle.heroSection?.body ?? "";
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
      linkGroups={[]}
      keyTakeaways={keyTakeaways}
      schema={<ExtraJsonLd raw={dbSeo?.json_ld_extra ?? null} />}
      lastUpdatedDate={lastUpdatedDate}
      articleSchema
      articleHeadline={h1}
      articleSection="Modèles & documents"
      canonicalUrl={canonicalUrl}
    >
      <DocumentSpecimen slug={slug} label={doc.label} />
      {hasDbContent &&
        bundle.renderableSections.map((s) => <DynamicSection key={s.id} section={s} />)}
    </ClusterPage>
  );
}
