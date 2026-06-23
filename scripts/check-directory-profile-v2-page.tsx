import assert from "node:assert/strict";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { db } from "../src/libs/db";
import { DirectoryProfileV2 } from "../src/components/directory/DirectoryProfileV2";

const card = db.getDirectoryListingCabinetBySiret("44110142500037");
assert.ok(card, "Expected sample Paris cabinet to exist");

const cityCode = card.city?.code_insee ?? card.establishment.city_code_insee;
assert.ok(cityCode, "Expected sample cabinet to have a city code");

const html = renderToStaticMarkup(
  <DirectoryProfileV2
    card={card}
    relatedCabinets={db.getDirectoryRelatedListingCabinetsByCity(
      cityCode,
      card.establishment.siret,
      3,
    )}
    services={db.getDirectoryProfileServices()}
    professions={db.getDirectoryProfileProfessions(8)}
  />,
);

assert.match(html, /01 EXPERTS ASSOCIES/);
assert.match(html, /Cabinet comptable a Paris/);
assert.match(html, /Non verifie Ordre/);
assert.match(html, /inscription Ordre non confirmee/);
assert.match(html, /SIRET/);
assert.match(html, /44110142500037/);
assert.match(html, /Informations legales et administratives/);
assert.match(html, /Ce que l&#x27;on peut verifier publiquement|Ce que l'on peut verifier publiquement/);
assert.match(html, /Localisation/);
assert.match(html, /openstreetmap/);
assert.match(html, /Missions comptables souvent recherchees a Paris/);
assert.match(html, /href="\/expertises\/comptabilite"/);
assert.match(html, /Professions accompagnees par un expert-comptable/);
assert.match(html, /href="\/professions\//);
assert.match(html, /Autres cabinets comptables a Paris/);
assert.match(html, /Questions frequentes/);
assert.doesNotMatch(html, /avis client|note moyenne|etoiles/i);

console.log("Directory profile V2 page OK");
