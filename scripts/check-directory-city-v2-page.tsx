import assert from "node:assert/strict";
import path from "node:path";
import dotenv from "dotenv";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { db } from "../src/libs/db";
import { DirectoryCityPageV2 } from "../src/components/directory/DirectoryCityPageV2";

globalThis.React = React;

dotenv.config({ path: path.join(process.cwd(), ".env.local") });
dotenv.config();

async function main(): Promise<void> {
  const city = await db.getDirectoryCityBySlug("marseille");
  assert.ok(city, "Expected Marseille to exist in imported directory data");

  const cards = await db.getDirectoryListingCabinetsByCity(city.code_insee, 12);
  assert.ok(cards.length > 0, "Expected Marseille directory cards");

  const totalCount = await db.getDirectoryListingCabinetCountByCity(city.code_insee);
  const verifiedCount = await db.getDirectoryCabinetCountByCity(city.code_insee);
  const enrichmentStatsStart = Date.now();
  const enrichmentStats = await db.getDirectoryCityEnrichmentStats(city.code_insee);
  const enrichmentStatsMs = Date.now() - enrichmentStatsStart;
  assert.ok(
    enrichmentStatsMs < 10_000,
    `Expected Marseille enrichment stats to avoid Supabase statement timeouts; took ${enrichmentStatsMs}ms`,
  );

  const html = renderToStaticMarkup(
    <DirectoryCityPageV2
      city={city}
      cabinets={cards}
      totalCount={totalCount}
      verifiedCount={verifiedCount}
      enrichmentStats={enrichmentStats}
      services={await db.getDirectoryProfileServices()}
      professions={await db.getDirectoryProfileProfessions(8)}
      allListingCities={await db.getDirectoryListingCities()}
    />,
  );

  assert.match(html, /Annuaire local · Marseille/);
  assert.doesNotMatch(html, /Annuaire vérifié/);
  assert.match(html, /Cabinets comptables à Marseille/);
  assert.match(html, /Fiche documentée|À confirmer/);
  assert.match(html, /Ce que l'on peut vérifier publiquement|Ce que l&#x27;on peut vérifier publiquement/);
  assert.match(html, /Profils enrichis/);
  assert.match(html, /Qualifiés/);
  assert.match(html, /data-directory-city-map-explorer/);
  assert.match(html, /data-directory-cabinet-sidebar/);
  assert.match(html, /data-directory-city-map="embed"/);
  assert.match(html, /openstreetmap/);
  assert.match(html, /Cabinets référencés/);
  assert.match(html, /href="\/expert-comptable\/marseille\//);
  assert.doesNotMatch(html, /data-directory-city-map="static"/);
  assert.ok(
    html.indexOf("data-directory-city-map-explorer") > html.indexOf("Cabinets comptables à Marseille")
    && html.indexOf("data-directory-city-map-explorer") < html.indexOf("Trouver un cabinet comptable à Marseille"),
    "Expected map explorer to render directly below the hero before editorial content",
  );
  assert.match(html, /Missions comptables souvent recherchées à Marseille/);
  assert.match(html, /href="\/expertises\/comptabilite"/);
  assert.match(html, /Professions accompagnées par un expert-comptable/);
  assert.match(html, /href="\/professions\//);
  assert.match(html, /Autres villes du comparateur|Autres villes proches/);
  assert.match(html, /Questions fréquentes/);
  assert.doesNotMatch(html, /avis client|note moyenne|etoiles/i);

  console.log("Directory city V2 page OK");
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
