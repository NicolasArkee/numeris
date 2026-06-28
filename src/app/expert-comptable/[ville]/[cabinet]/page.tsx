import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { db } from "@/libs/db";
import { AppConfig } from "@/utils/AppConfig";
import { BreadcrumbJsonLd, WebPageJsonLd } from "@/components/JsonLd";
import {
  cabinetDirectorySlug,
  cabinetDirectoryPath,
} from "@/components/directory/CabinetCard";
import {
  DirectoryProfileV2,
  DirectoryVerifiedAccountingServiceJsonLd,
} from "@/components/directory/DirectoryProfileV2";
import {
  buildDirectoryRobots,
  directoryDisplayName,
  isDirectoryCabinetVerified,
} from "@/components/directory/profile-v2-helpers";

interface Props {
  params: Promise<{ ville: string; cabinet: string }>;
}

// SSG initial : uniquement les cabinets published+verified (générés au build, ~3).
// Tout autre cabinet est généré à la demande (ISR) puis caché 24h via revalidate.
// Le filtre métier (publish_status / oec_status) est appliqué côté DB par
// getDirectoryListingCabinetBySiret — un cabinet introuvable renvoie notFound().
export const dynamicParams = true;
export const revalidate = 86400;

function siretFromCabinetParam(value: string): string | null {
  const match = value.match(/-(\d{14})$/);
  return match ? match[1] : null;
}

export async function generateStaticParams() {
  return (await db.getTopDirectoryListingCabinets(10_000)).flatMap((card) => {
    const citySlug = card.city?.slug;
    if (!citySlug) return [];
    return [
      {
        ville: citySlug,
        cabinet: cabinetDirectorySlug(card),
      },
    ];
  });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { cabinet } = await params;
  const siret = siretFromCabinetParam(cabinet);
  if (!siret) return {};

  const card = await db.getDirectoryListingCabinetBySiret(siret);
  if (!card) return {};

  const name = directoryDisplayName(card);
  const city = card.city?.name ?? card.establishment.city_name ?? "";
  const verified = isDirectoryCabinetVerified(card);
  return {
    title: `${name}${city ? ` a ${city}` : ""} | Annuaire Skoria`,
    description: verified
      ? "Fiche cabinet avec provenance administrative et verification professionnelle documentee."
      : "Fiche candidate issue d'une source administrative publique; statut professionnel a confirmer.",
    alternates: {
      canonical: `${AppConfig.url}${cabinetDirectoryPath(card)}`,
    },
    robots: buildDirectoryRobots(card),
  };
}

export default async function DirectoryCabinetPage({ params }: Props) {
  const { ville, cabinet } = await params;
  const siret = siretFromCabinetParam(cabinet);
  if (!siret) notFound();

  const card = await db.getDirectoryListingCabinetBySiret(siret);
  if (!card || card.city?.slug !== ville) notFound();

  const name = directoryDisplayName(card);
  const cityName = card.city?.name ?? card.establishment.city_name ?? "Ville";
  const cityCode = card.city?.code_insee ?? card.establishment.city_code_insee;
  const pagePath = `/expert-comptable/${ville}/${cabinet}`;
  const enrichmentFacts = await db.getDirectoryProfileFactsByEstablishment(
    card.establishment.id,
  );
  const enrichmentSources = await db.getDirectoryEnrichmentSourcesByEstablishment(
    card.establishment.id,
  );
  const qualificationSnapshot = await db.getLatestDirectoryQualificationSnapshot(
    card.cabinet.id,
    card.establishment.id,
  );
  const breadcrumbs = [
    { name: "Accueil", url: "/" },
    { name: "Annuaire", url: "/annuaire/experts-comptables" },
    { name: cityName, url: `/expert-comptable/${ville}` },
    { name, url: pagePath },
  ];

  return (
    <>
      <BreadcrumbJsonLd items={breadcrumbs} />
      <WebPageJsonLd
        name={name}
        description={
          isDirectoryCabinetVerified(card)
            ? "Fiche cabinet avec provenance administrative et verification professionnelle documentee."
            : "Fiche candidate issue d'une source administrative publique; statut professionnel a confirmer."
        }
        url={pagePath}
        dateModified={card.cabinet.updated_at}
      />
      <DirectoryVerifiedAccountingServiceJsonLd
        card={card}
        path={pagePath}
        enrichmentFacts={enrichmentFacts}
        enrichmentSources={enrichmentSources}
      />
      <DirectoryProfileV2
        card={card}
        relatedCabinets={
          cityCode
            ? await db.getDirectoryRelatedListingCabinetsByCity(
                cityCode,
                card.establishment.siret,
                3,
              )
            : []
        }
        services={await db.getDirectoryProfileServices()}
        professions={await db.getDirectoryProfileProfessions(8)}
        enrichmentFacts={enrichmentFacts}
        enrichmentSources={enrichmentSources}
        qualificationSnapshot={qualificationSnapshot}
      />
    </>
  );
}
