import type { Metadata } from "next";
import { db } from "@/libs/db";
import { AppConfig } from "@/utils/AppConfig";
import { BreadcrumbJsonLd, ItemListJsonLd, WebPageJsonLd } from "@/components/JsonLd";
import { SectorsHub } from "@/components/hubs/activity/SectorsHub";

export const metadata: Metadata = {
  title: "Comparer par secteur d'activité",
  description: `Comparez les besoins comptables par secteur : immobilier, restauration, professions libérales, start-up, BTP et plus.`,
  alternates: { canonical: `${AppConfig.url}/secteurs` },
};

export default async function SecteursPage() {
  const secteurs = await db.getSecteurs();
  const services = await db.getServices();
  const sectorEntries = secteurs.map((secteur) => ({
    slug: secteur.slug,
    name: secteur.name,
    description: secteur.description,
  }));
  const serviceEntries = [...services]
    .sort((a, b) => a.order_index - b.order_index || a.title.localeCompare(b.title, "fr"))
    .map((service) => ({
      slug: service.slug,
      title: service.title,
      description: service.description,
      icon: service.icon,
      orderIndex: service.order_index,
    }));

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Accueil", url: "/" },
          { name: "Secteurs", url: "/secteurs" },
        ]}
      />
      <WebPageJsonLd
        name="Comparer par secteur"
        description={`Chaque secteur a ses spécificités comptables, fiscales et sociales. ${AppConfig.name} aide à préparer les critères de comparaison utiles.`}
        url="/secteurs"
      />
      <ItemListJsonLd
        name="Secteurs d’activité documentés par Skoria"
        description="Catalogue des secteurs permettant de contextualiser une recherche d’expert-comptable."
        url="/secteurs"
        items={sectorEntries.map((sector) => ({
          name: sector.name,
          url: `/secteurs/${sector.slug}`,
        }))}
      />
      <SectorsHub sectors={sectorEntries} services={serviceEntries} />
    </>
  );
}
