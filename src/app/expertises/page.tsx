import type { Metadata } from "next";
import { db } from "@/libs/db";
import { AppConfig } from "@/utils/AppConfig";
import { BreadcrumbJsonLd, ItemListJsonLd, WebPageJsonLd } from "@/components/JsonLd";
import { ServicesHub } from "@/components/hubs/activity/ServicesHub";

export const metadata: Metadata = {
  title: "Expertises comptables à comparer",
  description: `Explorez les expertises comptables à comparer : comptabilité, fiscalité, social, création d'entreprise, conseil en gestion, audit, secteurs et professions.`,
  alternates: { canonical: `${AppConfig.url}/expertises` },
};

export default async function ExpertisesPage() {
  const services = await db.getServices();
  const secteurs = await db.getSecteurs();
  const categories = await db.getProfessionCategories();
  const serviceEntries = [...services]
    .sort((a, b) => a.order_index - b.order_index || a.title.localeCompare(b.title, "fr"))
    .map((service) => ({
      slug: service.slug,
      title: service.title,
      description: service.description,
      icon: service.icon,
      orderIndex: service.order_index,
    }));
  const sectorEntries = secteurs.map((sector) => ({
    slug: sector.slug,
    name: sector.name,
    description: sector.description,
  }));
  const categoryEntries = categories.map((category) => ({
    slug: category.slug,
    name: category.name,
    description: category.description,
  }));

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Accueil", url: "/" },
          { name: "Expertises", url: "/expertises" },
        ]}
      />
      <WebPageJsonLd
        name="Expertises comptables"
        description={`De la tenue comptable au conseil de gestion, ${AppConfig.name} organise les critères de comparaison par mission, secteur et profession.`}
        url="/expertises"
      />
      <ItemListJsonLd
        name="Expertises comptables à comparer"
        description="Catalogue des missions comptables, fiscales, sociales, de création, de gestion et d’audit documentées par Skoria."
        url="/expertises"
        items={serviceEntries.map((service) => ({
          name: service.title,
          url: `/expertises/${service.slug}`,
        }))}
      />
      <ServicesHub services={serviceEntries} sectors={sectorEntries} categories={categoryEntries} />
    </>
  );
}
