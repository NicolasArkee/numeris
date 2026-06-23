import type { Metadata } from "next";
import { db } from "@/libs/db";
import { AppConfig } from "@/utils/AppConfig";
import { BreadcrumbJsonLd, WebPageJsonLd } from "@/components/JsonLd";
import { ExpertisesPageV2 } from "@/components/expertises/ExpertisesPageV2";

export const metadata: Metadata = {
  title: `Expertises comptables | ${AppConfig.name}`,
  description: `Explorez les expertises comptables à comparer : comptabilité, fiscalité, social, création d'entreprise, conseil en gestion, audit, secteurs et professions.`,
  alternates: { canonical: `${AppConfig.url}/expertises` },
};

export default async function ExpertisesPage() {
  const services = await db.getServices();
  const secteurs = await db.getSecteurs();
  const categories = await db.getProfessionCategories();

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

      <ExpertisesPageV2
        services={services}
        secteurs={secteurs}
        categories={categories}
      />
    </>
  );
}
