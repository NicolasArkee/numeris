import type {
  DirectoryProfileFact,
  DirectoryProfileFactType,
  DirectoryQualificationSnapshot,
} from "@/libs/db";

export type DirectoryQualificationInput = {
  isActive: boolean;
  nafCode: string | null;
  professionalStatus: DirectoryQualificationSnapshot["professional_status"];
  matchedRegistry: boolean;
  matchedWebsite: boolean;
  matchedAddress: boolean;
  matchedSirenOrSiret: boolean;
  hasWebsiteContactPage: boolean;
  retrievedAt: string | null;
  now?: Date;
  facts: DirectoryProfileFact[];
  hasActiveSuppression: boolean;
};

export type DirectoryQualificationResult = {
  score: number;
  professionalStatus: DirectoryQualificationSnapshot["professional_status"];
  matchedWebsite: boolean;
  matchedRegistry: boolean;
  matchedAddress: boolean;
  matchedSirenOrSiret: boolean;
  hasUsefulProfileFacts: boolean;
  blockingReason: string | null;
  canPublish: boolean;
  snapshot: Record<string, unknown>;
};

export type GroupedDirectoryProfileFacts = {
  contact: DirectoryProfileFact[];
  services: DirectoryProfileFact[];
  sectors: DirectoryProfileFact[];
  software: DirectoryProfileFact[];
  evidence: DirectoryProfileFact[];
};

const USEFUL_FACT_TYPES = new Set<DirectoryProfileFactType>([
  "website",
  "phone",
  "contact_url",
  "opening_hours",
  "service",
  "sector",
  "software",
  "registry_status",
]);

function bool(value: number | boolean | null | undefined): boolean {
  return value === true || value === 1;
}

function displayableFacts(facts: DirectoryProfileFact[]): DirectoryProfileFact[] {
  return facts.filter((fact) => bool(fact.is_displayable));
}

export function hasUsefulDirectoryProfileFacts(
  facts: DirectoryProfileFact[],
): boolean {
  return displayableFacts(facts).some((fact) => USEFUL_FACT_TYPES.has(fact.fact_type));
}

export function groupDirectoryProfileFacts(
  facts: DirectoryProfileFact[],
): GroupedDirectoryProfileFacts {
  const shown = displayableFacts(facts);
  return {
    contact: shown.filter((fact) =>
      ["website", "phone", "email", "contact_url", "opening_hours"].includes(fact.fact_type),
    ),
    services: shown.filter((fact) => fact.fact_type === "service"),
    sectors: shown.filter((fact) => fact.fact_type === "sector"),
    software: shown.filter((fact) => fact.fact_type === "software"),
    evidence: shown.filter((fact) => fact.fact_type === "registry_status"),
  };
}

function isRecent(value: string | null, now: Date): boolean {
  if (!value) return false;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return false;
  const ageMs = now.getTime() - date.getTime();
  return ageMs >= 0 && ageMs <= 180 * 24 * 60 * 60 * 1000;
}

function isDocumentedProfessionalStatus(
  status: DirectoryQualificationSnapshot["professional_status"],
): boolean {
  return status === "verified" || status === "manual_verified";
}

export function computeDirectoryQualification(
  input: DirectoryQualificationInput,
): DirectoryQualificationResult {
  const now = input.now ?? new Date();
  const facts = displayableFacts(input.facts);
  const serviceCount = facts.filter((fact) => fact.fact_type === "service").length;
  const usefulFacts = hasUsefulDirectoryProfileFacts(facts);

  let score = 0;
  if (input.isActive && input.nafCode === "69.20Z") score += 25;
  if (input.matchedRegistry || input.professionalStatus === "manual_verified") score += 20;
  if (input.matchedWebsite) score += 15;
  if (input.hasWebsiteContactPage) score += 10;
  if (facts.some((fact) => ["phone", "contact_url"].includes(fact.fact_type))) score += 10;
  if (serviceCount >= 2) score += 10;
  if (input.matchedAddress) score += 5;
  if (isRecent(input.retrievedAt, now)) score += 5;
  score = Math.min(score, 100);

  let blockingReason: string | null = null;
  if (input.hasActiveSuppression) {
    blockingReason = "active_suppression_request";
  } else if (!input.isActive) {
    blockingReason = "inactive_establishment";
  } else if (!input.matchedRegistry && !isDocumentedProfessionalStatus(input.professionalStatus)) {
    blockingReason = "professional_status_unverified";
  } else if (!usefulFacts) {
    blockingReason = "missing_useful_profile_facts";
  } else if (score < 85) {
    blockingReason = "score_below_publication_threshold";
  }

  const canPublish = blockingReason === null && score >= 85;

  return {
    score,
    professionalStatus: input.professionalStatus,
    matchedWebsite: input.matchedWebsite,
    matchedRegistry: input.matchedRegistry,
    matchedAddress: input.matchedAddress,
    matchedSirenOrSiret: input.matchedSirenOrSiret,
    hasUsefulProfileFacts: usefulFacts,
    blockingReason,
    canPublish,
    snapshot: {
      rules_version: "directory-enrichment-v1",
      service_count: serviceCount,
      useful_fact_count: facts.length,
      retrieved_at: input.retrievedAt,
      matched_siren_or_siret: input.matchedSirenOrSiret,
    },
  };
}
