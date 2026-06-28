import assert from "node:assert/strict";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import type {
  DirectoryEnrichmentSource,
  DirectoryProfileFact,
  DirectoryQualificationSnapshot,
} from "../src/libs/db";
import { sqliteAdapter } from "../src/libs/db/sqlite";
import { DirectoryProfileV2 } from "../src/components/directory/DirectoryProfileV2";

async function main(): Promise<void> {
  const card = await sqliteAdapter.getDirectoryListingCabinetBySiret("44110142500037");
  assert.ok(card, "Expected sample cabinet to exist");

  const facts: DirectoryProfileFact[] = [
    {
      id: 1,
      cabinet_id: card.cabinet.id,
      establishment_id: card.establishment.id,
      fact_type: "website",
      label: "Site officiel",
      value: "https://example-cabinet.test",
      source_id: 1,
      confidence: 95,
      is_displayable: 1,
      created_at: "2026-06-28T08:00:00.000Z",
      updated_at: "2026-06-28T08:00:00.000Z",
    },
    {
      id: 2,
      cabinet_id: card.cabinet.id,
      establishment_id: card.establishment.id,
      fact_type: "service",
      label: "Service detecte",
      value: "Paie",
      source_id: 1,
      confidence: 90,
      is_displayable: 1,
      created_at: "2026-06-28T08:00:00.000Z",
      updated_at: "2026-06-28T08:00:00.000Z",
    },
  ];

  const sources: DirectoryEnrichmentSource[] = [
    {
      id: 1,
      cabinet_id: card.cabinet.id,
      establishment_id: card.establishment.id,
      source_key: "manual-pilot-example",
      source_type: "manual",
      source_url: "https://example-cabinet.test",
      retrieved_at: "2026-06-28T08:00:00.000Z",
      source_hash: null,
      parsed_ok: 1,
      robots_allowed: null,
      legal_basis: "Manual pilot source",
      raw_excerpt: "Official source checked",
      created_at: "2026-06-28T08:00:00.000Z",
    },
  ];

  const snapshot: DirectoryQualificationSnapshot = {
    id: 1,
    cabinet_id: card.cabinet.id,
    establishment_id: card.establishment.id,
    score: 90,
    professional_status: "manual_verified",
    matched_website: 1,
    matched_registry: 1,
    matched_address: 1,
    matched_siren_or_siret: 1,
    has_useful_profile_facts: 1,
    blocking_reason: null,
    snapshot_json: "{}",
    created_at: "2026-06-28T08:00:00.000Z",
  };

  const cityCode = card.city?.code_insee ?? card.establishment.city_code_insee;
  assert.ok(cityCode, "Expected city code");

  const html = renderToStaticMarkup(
    <DirectoryProfileV2
      card={card}
      relatedCabinets={await sqliteAdapter.getDirectoryRelatedListingCabinetsByCity(
        cityCode,
        card.establishment.siret,
        3,
      )}
      services={await sqliteAdapter.getDirectoryProfileServices()}
      professions={await sqliteAdapter.getDirectoryProfileProfessions(8)}
      enrichmentFacts={facts}
      enrichmentSources={sources}
      qualificationSnapshot={snapshot}
    />,
  );

  assert.match(html, /Profil enrichi/);
  assert.match(html, /Site officiel/);
  assert.match(html, /https:\/\/example-cabinet\.test/);
  assert.match(html, /Service detecte/);
  assert.match(html, /Paie/);
  assert.match(html, /Score de qualification/);
  assert.doesNotMatch(html, /note moyenne|avis client|etoiles/i);

  console.log("Directory enrichment page OK");
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
