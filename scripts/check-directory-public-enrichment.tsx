import assert from "node:assert/strict";
import path from "node:path";
import Database from "better-sqlite3";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import type { DirectoryCabinet, DirectoryCabinetCard, DirectoryEnrichmentSource, DirectoryEstablishment, DirectoryProfileFact } from "../src/libs/db";
import { filterDirectoryFactsWithLoadedSources, isPublicDirectoryEnrichmentSource } from "../src/libs/directory/public-enrichment";
import { DirectoryProfileV2, DirectoryVerifiedAccountingServiceJsonLd } from "../src/components/directory/DirectoryProfileV2";

globalThis.React = React;

const database = new Database(process.env.NUMERIS_DB ?? path.join(process.cwd(), "numeris.db"), { readonly: true, fileMustExist: true });
try {
  const establishment = database.prepare("SELECT * FROM directory_establishments WHERE siret = ?").get("44110142500037") as DirectoryEstablishment | undefined;
  assert.ok(establishment, "Expected reference establishment");
  const cabinet = database.prepare("SELECT * FROM directory_cabinets WHERE id = ?").get(establishment.cabinet_id) as DirectoryCabinet;
  const card: DirectoryCabinetCard = { cabinet, establishment, city: null };
  const source = (id: number, source_url: string | null): DirectoryEnrichmentSource => ({ id, cabinet_id: cabinet.id, establishment_id: establishment.id, source_key: `source-${id}`, source_type: "registry", source_url, retrieved_at: "2026-06-28T15:50:00Z", source_hash: null, parsed_ok: 1, robots_allowed: true, legal_basis: "Test fixture", raw_excerpt: null, created_at: "2026-06-28" });
  const fact = (id: number, source_id: number | null, fact_type: DirectoryProfileFact["fact_type"], value: string): DirectoryProfileFact => ({ id, cabinet_id: cabinet.id, establishment_id: establishment.id, fact_type, label: value, value, source_id, confidence: 95, is_displayable: 1, created_at: "2026-06-28", updated_at: "2026-06-28" });
  const official = source(1, "https://annuaire.experts-comptables.org/expert-comptable/17136-01-experts-associes-paris-75002");
  const demonstration = source(2, "https://example-cabinet.test");
  assert.equal(isPublicDirectoryEnrichmentSource(official), true);
  assert.equal(isPublicDirectoryEnrichmentSource(demonstration), false);
  assert.equal(isPublicDirectoryEnrichmentSource(source(3, "https://DEMO.TEST.:443/contact")), false);
  assert.equal(isPublicDirectoryEnrichmentSource(source(4, "https://sub.test/path")), false);
  assert.equal(isPublicDirectoryEnrichmentSource(source(5, "https://test.example.org/path")), true);
  assert.equal(isPublicDirectoryEnrichmentSource(source(6, null)), true, "Manual evidence may have no URL");

  const valid = [fact(1, 1, "registry_status", "Cabinet référencé à l'Ordre des experts-comptables"), fact(2, 1, "service", "PUBLIC_SERVICE_TO_KEEP"), fact(3, 1, "profile_summary", "PUBLIC_SUMMARY_TO_KEEP")];
  const demonstrationFacts = [fact(4, 2, "website", "https://example-cabinet.test"), fact(5, 2, "contact_url", "https://example-cabinet.test/contact"), fact(6, 2, "service", "DEMO_SERVICE_TO_HIDE"), fact(7, 2, "profile_summary", "DEMO_SUMMARY_TO_HIDE"), fact(8, 2, "phone", "DEMO_PHONE_TO_HIDE")];
  const orphan = fact(9, 999, "service", "ORPHAN_TO_HIDE");
  const facts = [...valid, ...demonstrationFacts, orphan];
  const sources = [official, demonstration];
  assert.deepEqual(filterDirectoryFactsWithLoadedSources(facts, sources), valid);

  const html = renderToStaticMarkup(<DirectoryProfileV2 card={card} relatedCabinets={[]} services={[]} professions={[]} enrichmentFacts={facts} enrichmentSources={sources} />);
  assert.match(html, /PUBLIC_SERVICE_TO_KEEP/);
  assert.match(html, /PUBLIC_SUMMARY_TO_KEEP/);
  assert.doesNotMatch(html, /example-cabinet|DEMO_|ORPHAN_TO_HIDE/);
  assert.match(html, /href="#coordonnees-verifiees"/, "Demonstration contacts must not become the main action");
  assert.equal((html.match(/id="coordonnees-verifiees"/g) ?? []).length, 1);

  const unverified = { ...card, cabinet: { ...card.cabinet, oec_status: "unverified" as const } };
  const schema = renderToStaticMarkup(<DirectoryVerifiedAccountingServiceJsonLd card={unverified} path="/expert-comptable/paris/check" enrichmentFacts={facts} enrichmentSources={sources} />);
  assert.match(schema, /AccountingService/, "Real OEC evidence remains usable");
  assert.doesNotMatch(schema, /example-cabinet|DEMO_|ORPHAN_TO_HIDE/);
  const demoSchema = renderToStaticMarkup(<DirectoryVerifiedAccountingServiceJsonLd card={unverified} path="/expert-comptable/paris/check" enrichmentFacts={[fact(10, 2, "registry_status", "Ordre des experts-comptables")]} enrichmentSources={[demonstration]} />);
  assert.equal(demoSchema, "", "A demonstration cannot establish a professional status");

  const storedFacts = database.prepare("SELECT * FROM directory_profile_facts WHERE establishment_id = ?").all(establishment.id) as DirectoryProfileFact[];
  const storedSources = database.prepare("SELECT * FROM directory_enrichment_sources WHERE establishment_id = ? AND parsed_ok = 1").all(establishment.id) as DirectoryEnrichmentSource[];
  const publicFacts = filterDirectoryFactsWithLoadedSources(storedFacts, storedSources);
  const demonstrationIds = new Set(storedSources.filter((item) => !isPublicDirectoryEnrichmentSource(item)).map((item) => item.id));
  assert.equal(publicFacts.filter((item) => item.source_id != null && demonstrationIds.has(item.source_id)).length, 0);
  const oecIds = new Set(storedSources.filter((item) => item.source_url?.includes("annuaire.experts-comptables.org/")).map((item) => item.id));
  for (const item of storedFacts.filter((item) => item.source_id != null && oecIds.has(item.source_id))) assert.ok(publicFacts.includes(item), "Stored OEC facts must remain unchanged");
  console.log(`Public directory enrichment OK: .test excluded from content, actions and JSON-LD; ${publicFacts.length} stored public facts preserved. Database opened read-only.`);
} finally {
  database.close();
}
