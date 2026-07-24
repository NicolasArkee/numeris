import graphConfig from "../../../data/directory-service-knowledge-graph.config.json";

export type DirectoryServiceDisplayMode = "sourced" | "inferred" | "hidden";

export type DirectoryServiceOffer = {
  id: string;
  label: string;
  keywords: string[];
  description: string;
};

export type DirectoryServiceFamily = {
  id: string;
  label: string;
  route: string;
  factValue: string;
  inferForVerifiedAccountingFirm: boolean;
  keywords: string[];
  offers: DirectoryServiceOffer[];
};

export type DirectoryServiceKnowledgeGraph = {
  version: "directory-service-kg-v1";
  serviceFamilies: DirectoryServiceFamily[];
  specificities: {
    sectors: string[];
    professions: string[];
    software: string[];
    differentiators: string[];
  };
};

export type DirectoryServiceFactMetadata = {
  entityId: string;
  routeSlug: string;
  offerIds: string[];
  displayMode: DirectoryServiceDisplayMode;
  description: string;
  evidenceSnippets: string[];
  sourcePageUrls: string[];
  confidenceReason: string;
};

export type DirectoryAgentClassification = {
  serviceIds?: string[];
  sectorIds?: string[];
  professionIds?: string[];
  softwareIds?: string[];
  differentiatorIds?: string[];
};

const graph = graphConfig as DirectoryServiceKnowledgeGraph;

function assertUnique(values: string[], label: string): void {
  const seen = new Set<string>();
  for (const value of values) {
    if (seen.has(value)) {
      throw new Error(`Duplicate ${label}: ${value}`);
    }
    seen.add(value);
  }
}

function validateGraph(value: DirectoryServiceKnowledgeGraph): void {
  if (value.version !== "directory-service-kg-v1") {
    throw new Error(`Unsupported directory service KG version: ${value.version}`);
  }
  assertUnique(value.serviceFamilies.map((service) => service.id), "service id");
  assertUnique(value.serviceFamilies.map((service) => service.factValue), "service fact value");

  for (const service of value.serviceFamilies) {
    if (!service.route.startsWith("/expertises/")) {
      throw new Error(`Invalid route for service ${service.id}: ${service.route}`);
    }
    if (!service.factValue || !service.label) {
      throw new Error(`Missing label/factValue for service ${service.id}`);
    }
    assertUnique(service.offers.map((offer) => offer.id), `${service.id} offer id`);
    for (const offer of service.offers) {
      if (offer.keywords.length === 0) {
        throw new Error(`Missing keywords for offer ${service.id}/${offer.id}`);
      }
      if (offer.description.length < 80) {
        throw new Error(`Description too short for offer ${service.id}/${offer.id}`);
      }
    }
  }
}

validateGraph(graph);

export function getDirectoryServiceKnowledgeGraph(): DirectoryServiceKnowledgeGraph {
  return graph;
}

export function routeSlugForService(service: DirectoryServiceFamily): string {
  return service.route.replace(/^\/expertises\//, "");
}

export function findServiceFamilyById(id: string): DirectoryServiceFamily | null {
  return graph.serviceFamilies.find((service) => service.id === id) ?? null;
}

export function findServiceFamilyByFactValue(value: string): DirectoryServiceFamily | null {
  return graph.serviceFamilies.find((service) => service.factValue === value) ?? null;
}

export function buildServiceFactMetadata({
  service,
  displayMode,
  offerIds,
  evidenceSnippets,
  sourcePageUrls,
  confidenceReason,
}: {
  service: DirectoryServiceFamily;
  displayMode: DirectoryServiceDisplayMode;
  offerIds?: string[];
  evidenceSnippets?: string[];
  sourcePageUrls?: string[];
  confidenceReason: string;
}): DirectoryServiceFactMetadata {
  const selectedOfferIds = offerIds?.length ? offerIds : service.offers.map((offer) => offer.id);
  const descriptions = service.offers
    .filter((offer) => selectedOfferIds.includes(offer.id))
    .map((offer) => offer.description);
  return {
    entityId: service.id,
    routeSlug: routeSlugForService(service),
    offerIds: selectedOfferIds,
    displayMode,
    description: descriptions.join(" "),
    evidenceSnippets: evidenceSnippets ?? [],
    sourcePageUrls: sourcePageUrls ?? [],
    confidenceReason,
  };
}

export function metadataToJson(metadata: DirectoryServiceFactMetadata): string {
  return JSON.stringify(metadata);
}

export function parseDirectoryServiceFactMetadata(
  value: string | null | undefined,
): DirectoryServiceFactMetadata | null {
  if (!value) return null;
  try {
    const parsed = JSON.parse(value) as Partial<DirectoryServiceFactMetadata>;
    if (
      !parsed.entityId ||
      !parsed.routeSlug ||
      !Array.isArray(parsed.offerIds) ||
      !parsed.displayMode ||
      !parsed.description
    ) {
      return null;
    }
    return {
      entityId: parsed.entityId,
      routeSlug: parsed.routeSlug,
      offerIds: parsed.offerIds,
      displayMode: parsed.displayMode,
      description: parsed.description,
      evidenceSnippets: Array.isArray(parsed.evidenceSnippets) ? parsed.evidenceSnippets : [],
      sourcePageUrls: Array.isArray(parsed.sourcePageUrls) ? parsed.sourcePageUrls : [],
      confidenceReason: parsed.confidenceReason ?? "",
    };
  } catch {
    return null;
  }
}

function assertKnownIds(kind: string, ids: string[] | undefined, allowed: Set<string>): void {
  for (const id of ids ?? []) {
    if (!allowed.has(id)) {
      throw new Error(`Unknown ${kind} id from directory agent: ${id}`);
    }
  }
}

export function validateDirectoryAgentClassification(
  classification: DirectoryAgentClassification,
): void {
  assertKnownIds(
    "service",
    classification.serviceIds,
    new Set(graph.serviceFamilies.map((service) => service.id)),
  );
  assertKnownIds("sector", classification.sectorIds, new Set(graph.specificities.sectors));
  assertKnownIds(
    "profession",
    classification.professionIds,
    new Set(graph.specificities.professions),
  );
  assertKnownIds("software", classification.softwareIds, new Set(graph.specificities.software));
  assertKnownIds(
    "differentiator",
    classification.differentiatorIds,
    new Set(graph.specificities.differentiators),
  );
}
