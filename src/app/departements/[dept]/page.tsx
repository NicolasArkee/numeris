import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { db } from "@/libs/db";
import { AppConfig } from "@/utils/AppConfig";
import { ClusterPage } from "@/components/ClusterPage";
import { getSEOForDepartement } from "@/data/seo";
import { getDepartementLinks } from "@/utils/taxonomy";

interface Props {
  params: Promise<{ dept: string }>;
}

export async function generateStaticParams() {
  return db.getDepartements().map((d) => ({ dept: d.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { dept: slug } = await params;
  const dept = db.getDepartementBySlug(slug);
  if (!dept) return {};
  const seo = getSEOForDepartement(dept);
  return {
    title: seo.metaTitle,
    description: seo.metaDescription,
    alternates: { canonical: `${AppConfig.url}/departements/${slug}` },
  };
}

export default async function DepartementPage({ params }: Props) {
  const { dept: slug } = await params;
  const dept = db.getDepartementBySlug(slug);
  if (!dept) notFound();

  const seo = getSEOForDepartement(dept);
  const linkGroups = getDepartementLinks(slug);

  return (
    <ClusterPage
      eyebrow={`Département ${dept.code}`}
      h1={seo.h1}
      intro={seo.intro}
      breadcrumbs={[
        { name: "Accueil", url: "/" },
        { name: "Villes", url: "/villes" },
        { name: `${dept.name} (${dept.code})`, url: `/departements/${slug}` },
      ]}
      badges={[dept.name, dept.code, dept.region || ""].filter(Boolean)}
      faqs={seo.faqs}
      linkGroups={linkGroups}
    />
  );
}
