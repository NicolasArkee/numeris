import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { db } from "@/libs/db";
import { AppConfig } from "@/utils/AppConfig";
import { filterDirectoryFactsWithLoadedSources, isPublicDirectoryEnrichmentSource } from "@/libs/directory/public-enrichment";
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
// Tout autre cabinet est généré à la demande (ISR) puis caché 30 jours via
// revalidate — données annuaire figées (établissements scrapés), inutile de
// revalider tous les jours.
// Le filtre métier (publish_status / oec_status) est appliqué côté DB par
// getDirectoryListingCabinetBySiret — un cabinet introuvable renvoie notFound().
export const dynamicParams = true;
export const revalidate = 2592000; // 30 jours

function siretFromCabinetParam(value: string): string | null {
  const match = value.match(/-(\d{14})$/);
  return match ? match[1] : null;
}

/** Les raisons sociales sont en MAJUSCULES en base — Title Case lisible pour
 *  les metatags, en conservant les sigles courts (TGS, CSW, SAS…). */
function titleCaseCabinetName(raw: string): string {
  return raw
    .split(/\s+/u)
    .map((word) =>
      word
        .split("-")
        .map((part) => {
          const letters = part.replace(/[^\p{L}]/gu, "");
          if (letters.length <= 3) return part; // sigles et particules
          return part.replace(/\p{L}[\p{L}']*/gu, (w) => w.charAt(0) + w.slice(1).toLowerCase());
        })
        .join("-"),
    )
    .join(" ");
}

/** Extrait de résumé pour la meta description (~155c, coupe sur un mot). */
function summaryExcerpt(summary: string): string {
  const flat = summary.replace(/\s+/gu, " ").trim();
  if (flat.length <= 158) return flat;
  const cut = flat.slice(0, 155);
  return `${cut.slice(0, cut.lastIndexOf(" "))}…`;
}

/** Résumé éditorial displayable de plus haute confiance (fiche enrichie). */
async function findEnrichedSummary(establishmentId: number): Promise<string | null> {
  try {
    const [facts, sources] = await Promise.all([
      db.getDirectoryProfileFactsByEstablishment(establishmentId),
      db.getDirectoryEnrichmentSourcesByEstablishment(establishmentId),
    ]);
    const summaries = filterDirectoryFactsWithLoadedSources(facts, sources)
      .filter((f) => f.fact_type === "profile_summary" && f.is_displayable)
      .sort((a, b) => b.confidence - a.confidence);
    return summaries[0]?.value ?? null;
  } catch {
    return null;
  }
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

  const name = titleCaseCabinetName(directoryDisplayName(card));
  const city = card.city?.name ?? card.establishment.city_name ?? "";
  const verified = isDirectoryCabinetVerified(card);
  const summary = await findEnrichedSummary(card.establishment.id);

  // Politique d'indexation (2026-07-12, alignée sur les pages villes) :
  // fiche INDEXABLE dès qu'elle porte un contenu éditorial enrichi
  // (profile_summary displayable) — le title/description deviennent uniques ;
  // fiche nue → gate historique (noindex tant que non vérifiée).
  return {
    // NB : le layout applique déjà le template `%s | Skoria`.
    title: `${name} — expert-comptable à ${city || "consulter"}`,
    description: summary
      ? summaryExcerpt(summary)
      : verified
        ? "Fiche cabinet avec provenance administrative et verification professionnelle documentee."
        : "Fiche candidate issue d'une source administrative publique; statut professionnel a confirmer.",
    alternates: {
      canonical: `${AppConfig.url}${cabinetDirectoryPath(card)}`,
    },
    ...(summary ? {} : { robots: buildDirectoryRobots(card) }),
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
  const loadedFacts = await db.getDirectoryProfileFactsByEstablishment(
    card.establishment.id,
  );
  const loadedSources = await db.getDirectoryEnrichmentSourcesByEstablishment(
    card.establishment.id,
  );
  // Filter before passing props so demonstration data cannot enter the RSC payload.
  const enrichmentSources = loadedSources.filter(isPublicDirectoryEnrichmentSource);
  const enrichmentFacts = filterDirectoryFactsWithLoadedSources(loadedFacts, enrichmentSources);
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
