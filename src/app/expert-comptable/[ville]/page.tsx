import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { db } from "@/libs/db";
import { AppConfig } from "@/utils/AppConfig";
import { BreadcrumbJsonLd, WebPageJsonLd } from "@/components/JsonLd";
import { DirectoryCityPageV2 } from "@/components/directory/DirectoryCityPageV2";
import { buildDirectoryCityRobots } from "@/components/directory/city-v2-helpers";

interface Props {
  params: Promise<{ ville: string }>;
}

// SSG initial : uniquement les villes avec au moins 1 cabinet published+verified.
// Toute autre ville est générée à la demande (ISR) puis cachée 30 jours — les
// données annuaire (établissements scrapés) sont figées, pas la peine de
// revalider tous les jours.
// getDirectoryListingCabinetsByCity renvoie [] pour les villes sans cabinet listé,
// auquel cas la page appelle notFound().
export const dynamicParams = true;
export const revalidate = 2592000; // 30 jours

export async function generateStaticParams() {
  const seen = new Set<string>();
  for (const card of await db.getTopDirectoryListingCabinets(10_000)) {
    const slug = card.city?.slug;
    if (slug) seen.add(slug);
  }
  return Array.from(seen, (ville) => ({ ville }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { ville } = await params;
  const city = await db.getDirectoryCityBySlug(ville);
  if (!city) return {};
  // Gate d'indexation : établissements listables (pas seulement vérifiés) —
  // cf. buildDirectoryCityRobots. Une ville avec 0 établissement reste noindex.
  const listedCount = await db.getDirectoryListingCabinetCountByCity(city.code_insee);

  return {
    title: `Comparer les cabinets comptables à ${city.name}`,
    description: `Comparez les cabinets comptables à ${city.name} à partir de leurs implantations et données publiques disponibles, puis préparez les critères à confirmer lors de l’échange.`,
    alternates: { canonical: `${AppConfig.url}/expert-comptable/${city.slug}` },
    robots: buildDirectoryCityRobots(listedCount),
  };
}

export default async function DirectoryCityPage({ params }: Props) {
  const { ville } = await params;
  const city = await db.getDirectoryCityBySlug(ville);
  if (!city) notFound();

  const cards = await db.getDirectoryListingCabinetsByCity(city.code_insee, 100);
  if (cards.length === 0) notFound();
  const totalCount = await db.getDirectoryListingCabinetCountByCity(city.code_insee);
  const verifiedCount = await db.getDirectoryCabinetCountByCity(city.code_insee);
  const enrichmentStats = await db.getDirectoryCityEnrichmentStats(city.code_insee);
  const pagePath = `/expert-comptable/${city.slug}`;
  const breadcrumbs = [
    { name: "Accueil", url: "/" },
    { name: "Annuaire", url: "/annuaire/experts-comptables" },
    { name: city.name, url: pagePath },
  ];

  return (
    <>
      <BreadcrumbJsonLd items={breadcrumbs} />
      <WebPageJsonLd
        name={`Cabinets comptables a ${city.name}`}
        description={`Annuaire local comparatif des cabinets comptables a ${city.name}, avec donnees publiques et statut de fiche explicite.`}
        url={pagePath}
        dateModified={city.updated_at}
      />
      <DirectoryCityPageV2
        city={city}
        cabinets={cards}
        totalCount={totalCount}
        verifiedCount={verifiedCount}
        enrichmentStats={enrichmentStats}
        services={await db.getDirectoryProfileServices()}
        professions={await db.getDirectoryProfileProfessions(8)}
        allListingCities={await db.getDirectoryListingCities()}
      />
    </>
  );
}
