import type {
  DirectoryProfileFactType,
  DirectoryQualificationSnapshot,
} from "../db";
import {
  buildServiceFactMetadata,
  getDirectoryServiceKnowledgeGraph,
  metadataToJson,
} from "./service-knowledge-graph";

export type DirectoryInferredEnrichmentInput = {
  siret: string;
  cabinetName: string;
  cityName: string;
  addressLine1?: string | null;
  postalCode?: string | null;
  sourceUrl?: string | null;
  retrievedAt?: string | null;
};

export type DirectoryInferredEnrichmentFact = {
  fact_type: DirectoryProfileFactType;
  label: string;
  value: string;
  confidence: number;
  is_displayable: boolean;
  metadata_json?: string | Record<string, unknown> | null;
};

export type DirectoryInferredEnrichmentRecord = {
  siret: string;
  source: {
    source_key: string;
    source_type: "registry";
    source_url: string | null;
    retrieved_at: string;
    legal_basis: string;
    raw_excerpt?: string | null;
  };
  matches: {
    professional_status: DirectoryQualificationSnapshot["professional_status"];
    matched_registry: boolean;
    matched_website: boolean;
    matched_address: boolean;
    matched_siren_or_siret: boolean;
    has_website_contact_page: boolean;
  };
  facts: DirectoryInferredEnrichmentFact[];
};

function compactValue(value: string | null | undefined): string | null {
  const compacted = value?.trim().replaceAll(/\s+/g, " ");
  return compacted ? compacted : null;
}

function buildSourceUrl(siret: string, sourceUrl: string | null | undefined): string | null {
  return compactValue(sourceUrl)
    ?? `https://annuaire-entreprises.data.gouv.fr/etablissement/${siret}`;
}

function buildProfileSummary({
  cabinetName,
  cityName,
  serviceLabels,
}: {
  cabinetName: string;
  cityName: string;
  serviceLabels: string[];
}): string {
  return [
    `${cabinetName} est une fiche d'expert-comptable localisée à ${cityName}, enrichie à partir de données administratives publiques et d'une taxonomie métier dédiée aux cabinets comptables.`,
    `Cette première lecture ne remplace pas une validation par le site officiel du cabinet, mais elle permet de structurer une page utile pour les dirigeants qui comparent les prestataires de leur ville.`,
    `Les offres probables à confirmer couvrent les besoins les plus fréquemment associés à un cabinet d'expertise comptable : ${serviceLabels.join(", ")}.`,
    "Chaque service reste séparé des preuves sourcées afin de ne pas présenter une prestation comme confirmée sans mention explicite, tout en donnant au lecteur une grille claire pour préparer son contact.",
    `La fiche sert aussi au maillage interne vers les expertises pertinentes, pour relier ${cabinetName} aux recherches locales autour de la comptabilité, de la fiscalité, de la paie, de la création d'entreprise et du pilotage de gestion à ${cityName}.`,
    "Les informations devront être renforcées par un crawl du site officiel, une page contact, une page équipe ou une source professionnelle dès qu'elles seront disponibles.",
  ].join(" ");
}

export function buildDirectoryInferredEnrichmentRecord(
  input: DirectoryInferredEnrichmentInput,
): DirectoryInferredEnrichmentRecord {
  const siret = compactValue(input.siret);
  const cabinetName = compactValue(input.cabinetName);
  const cityName = compactValue(input.cityName);

  if (!siret) throw new Error("Missing inferred enrichment SIRET");
  if (!cabinetName) throw new Error(`Missing inferred enrichment cabinet name for ${siret}`);
  if (!cityName) throw new Error(`Missing inferred enrichment city name for ${siret}`);

  const sourceUrl = buildSourceUrl(siret, input.sourceUrl);
  const sourcePageUrls = sourceUrl ? [sourceUrl] : [];
  const retrievedAt = input.retrievedAt ?? new Date().toISOString();
  const graph = getDirectoryServiceKnowledgeGraph();
  const inferredServices = graph.serviceFamilies.filter(
    (service) => service.inferForVerifiedAccountingFirm,
  );
  const serviceLabels = inferredServices.map((service) => service.factValue);
  const evidenceSnippets = [
    "Etablissement actif rattache a une activite comptable 69.20Z dans une source administrative publique.",
  ];

  const facts: DirectoryInferredEnrichmentFact[] = [
    {
      fact_type: "registry_status",
      label: "Source administrative",
      value:
        "Etablissement actif 69.20Z reference dans une source administrative publique; statut professionnel et offres detaillees a confirmer.",
      confidence: 55,
      is_displayable: true,
    },
    {
      fact_type: "profile_summary",
      label: "À propos",
      value: buildProfileSummary({ cabinetName, cityName, serviceLabels }),
      confidence: 58,
      is_displayable: true,
    },
  ];

  for (const service of inferredServices) {
    facts.push({
      fact_type: "service",
      label: "Offre probable à confirmer",
      value: service.factValue,
      confidence: 58,
      is_displayable: true,
      metadata_json: metadataToJson(
        buildServiceFactMetadata({
          service,
          displayMode: "inferred",
          evidenceSnippets,
          sourcePageUrls,
          confidenceReason:
            "Offre probable issue de la typologie expert-comptable 69.20Z, a confirmer avant mission.",
        }),
      ),
    });
  }

  return {
    siret,
    source: {
      source_key: `admin-inferred-${siret}`,
      source_type: "registry",
      source_url: sourceUrl,
      retrieved_at: retrievedAt,
      legal_basis: "Source administrative publique reutilisee pour qualifier la fiche annuaire.",
      raw_excerpt:
        "Generation automatique d'offres probables a confirmer depuis la typologie administrative du cabinet.",
    },
    matches: {
      professional_status: "unverified",
      matched_registry: false,
      matched_website: false,
      matched_address: Boolean(compactValue(input.addressLine1) || compactValue(input.postalCode)),
      matched_siren_or_siret: true,
      has_website_contact_page: false,
    },
    facts,
  };
}
