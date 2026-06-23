import assert from "node:assert/strict";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { db } from "../src/libs/db";
import sitemap from "../src/app/sitemap";
import { DirectoryCityPageV2 } from "../src/components/directory/DirectoryCityPageV2";

const city = db.getDirectoryCityBySlug("paris");
assert.ok(city, "Expected Paris to exist in imported directory data");

const cards = db.getDirectoryListingCabinetsByCity(city.code_insee, 12);
assert.ok(cards.length > 0, "Expected Paris directory cards");

const totalCount = db.getDirectoryListingCabinetCountByCity(city.code_insee);
const verifiedCount = db.getDirectoryCabinetCountByCity(city.code_insee);

const html = renderToStaticMarkup(
  <DirectoryCityPageV2
    city={city}
    cabinets={cards}
    totalCount={totalCount}
    verifiedCount={verifiedCount}
    services={db.getDirectoryProfileServices()}
    professions={db.getDirectoryProfileProfessions(8)}
    allListingCities={db.getDirectoryListingCities()}
  />,
);

assert.match(html, /Cabinets comptables a Paris/);
assert.match(html, /Non verifie Ordre|Verifie Ordre/);
assert.match(html, /inscription Ordre non confirmee/);
assert.match(html, /Ce que l'on peut verifier publiquement|Ce que l&#x27;on peut verifier publiquement/);
assert.match(html, /data-directory-city-map="static"/);
assert.match(html, /openstreetmap/);
assert.match(html, /Cabinets comptables candidats et verifies/);
assert.match(html, /href="\/expert-comptable\/paris\//);
assert.match(html, /Missions comptables souvent recherchees a Paris/);
assert.match(html, /href="\/expertises\/comptabilite"/);
assert.match(html, /Professions accompagnees par un expert-comptable/);
assert.match(html, /href="\/professions\//);
assert.match(html, /Autres villes de l(?:'|&#x27;)annuaire|Autres villes proches/);
assert.match(html, /Questions frequentes/);
assert.doesNotMatch(html, /avis client|note moyenne|etoiles/i);

const sitemapUrls = sitemap().map((entry) => entry.url);
assert.ok(
  !sitemapUrls.some((url) => url.endsWith("/expert-comptable/paris")),
  "Candidate city pages must stay out of the sitemap",
);

console.log("Directory city V2 page OK");
