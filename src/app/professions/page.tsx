import type { Metadata } from "next";
import { db } from "@/libs/db";
import { AppConfig } from "@/utils/AppConfig";
import { BreadcrumbJsonLd, ItemListJsonLd, WebPageJsonLd } from "@/components/JsonLd";
import { ProfessionsHub } from "@/components/hubs/activity/ProfessionsHub";

export const metadata: Metadata = {
  title: "Comparer un expert-comptable par profession",
  description: `Comparez les besoins comptables par métier : santé, BTP, restauration, tech, immobilier, commerce et plus de 100 professions documentées.`,
  alternates: { canonical: `${AppConfig.url}/professions` },
};

export default async function ProfessionsPage() {
  const categories = await db.getProfessionCategories();
  const professionsByCategory = new Map(
    await Promise.all(
      categories.map(
        async (cat) => [cat.slug, await db.getProfessionsByCategory(cat.slug)] as const,
      ),
    ),
  );
  const hubCategories = categories.map((category) => ({
    slug: category.slug,
    name: category.name,
    description: category.description,
    icon: category.icon,
    professions: (professionsByCategory.get(category.slug) ?? []).map((profession) => ({
      slug: profession.slug,
      name: profession.name,
      description: profession.description,
      obligations: profession.obligations,
    })),
  }));
  const professions = hubCategories.flatMap((category) => category.professions);

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Accueil", url: "/" },
          { name: "Professions", url: "/professions" },
        ]}
      />
      <WebPageJsonLd
        name="Comparer par profession"
        description={`Chaque métier a ses obligations comptables et fiscales spécifiques. ${AppConfig.name} aide à préparer les critères de comparaison adaptés.`}
        url="/professions"
      />
      <ItemListJsonLd
        name="Professions documentées par Skoria"
        description="Catalogue des professions permettant de préparer une comparaison d’experts-comptables par métier."
        url="/professions"
        items={professions.map((profession) => ({
          name: profession.name,
          url: `/professions/${profession.slug}`,
        }))}
      />
      <ProfessionsHub categories={hubCategories} />
    </>
  );
}
