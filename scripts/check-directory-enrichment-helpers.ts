import assert from "node:assert/strict";
import type { DirectoryProfileFact } from "../src/libs/db";
import {
  computeDirectoryQualification,
  groupDirectoryProfileFacts,
  hasUsefulDirectoryProfileFacts,
} from "../src/libs/directory/enrichment";

const facts: DirectoryProfileFact[] = [
  {
    id: 1,
    cabinet_id: 1,
    establishment_id: 10,
    fact_type: "website",
    label: "Site officiel",
    value: "https://cabinet.example",
    source_id: 1,
    confidence: 95,
    is_displayable: 1,
    created_at: "2026-06-28T08:00:00.000Z",
    updated_at: "2026-06-28T08:00:00.000Z",
  },
  {
    id: 2,
    cabinet_id: 1,
    establishment_id: 10,
    fact_type: "service",
    label: "Service",
    value: "Paie",
    source_id: 1,
    confidence: 90,
    is_displayable: 1,
    created_at: "2026-06-28T08:00:00.000Z",
    updated_at: "2026-06-28T08:00:00.000Z",
  },
  {
    id: 3,
    cabinet_id: 1,
    establishment_id: 10,
    fact_type: "service",
    label: "Service",
    value: "Fiscalite",
    source_id: 1,
    confidence: 90,
    is_displayable: 1,
    created_at: "2026-06-28T08:00:00.000Z",
    updated_at: "2026-06-28T08:00:00.000Z",
  },
  {
    id: 4,
    cabinet_id: 1,
    establishment_id: 10,
    fact_type: "contact_url",
    label: "Contact",
    value: "https://cabinet.example/contact",
    source_id: 1,
    confidence: 90,
    is_displayable: 1,
    created_at: "2026-06-28T08:00:00.000Z",
    updated_at: "2026-06-28T08:00:00.000Z",
  },
];

assert.equal(hasUsefulDirectoryProfileFacts(facts), true);
assert.deepEqual(groupDirectoryProfileFacts(facts).services.map((fact) => fact.value), [
  "Paie",
  "Fiscalite",
]);

const qualified = computeDirectoryQualification({
  isActive: true,
  nafCode: "69.20Z",
  professionalStatus: "manual_verified",
  matchedRegistry: true,
  matchedWebsite: true,
  matchedAddress: true,
  matchedSirenOrSiret: true,
  hasWebsiteContactPage: true,
  retrievedAt: "2026-06-28T08:00:00.000Z",
  now: new Date("2026-07-01T08:00:00.000Z"),
  facts,
  hasActiveSuppression: false,
});
assert.equal(qualified.score, 100);
assert.equal(qualified.matchedSirenOrSiret, true);
assert.equal(qualified.snapshot.matched_siren_or_siret, true);
assert.equal(qualified.blockingReason, null);
assert.equal(qualified.canPublish, true);

const suppressed = computeDirectoryQualification({
  isActive: true,
  nafCode: "69.20Z",
  professionalStatus: "manual_verified",
  matchedRegistry: true,
  matchedWebsite: true,
  matchedAddress: true,
  matchedSirenOrSiret: true,
  hasWebsiteContactPage: true,
  retrievedAt: "2026-06-28T08:00:00.000Z",
  now: new Date("2026-07-01T08:00:00.000Z"),
  facts,
  hasActiveSuppression: true,
});
assert.equal(suppressed.canPublish, false);
assert.equal(suppressed.blockingReason, "active_suppression_request");

const ambiguousStatus = computeDirectoryQualification({
  isActive: true,
  nafCode: "69.20Z",
  professionalStatus: "ambiguous",
  matchedRegistry: false,
  matchedWebsite: true,
  matchedAddress: true,
  matchedSirenOrSiret: true,
  hasWebsiteContactPage: true,
  retrievedAt: "2026-06-28T08:00:00.000Z",
  now: new Date("2026-07-01T08:00:00.000Z"),
  facts,
  hasActiveSuppression: false,
});
assert.equal(ambiguousStatus.canPublish, false);
assert.equal(ambiguousStatus.blockingReason, "professional_status_unverified");

console.log("Directory enrichment helpers OK");
