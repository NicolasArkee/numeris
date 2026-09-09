import assert from "node:assert/strict";
import path from "node:path";
import dotenv from "dotenv";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { db } from "../src/libs/db";
import { DirectoryProfileV2 } from "../src/components/directory/DirectoryProfileV2";

globalThis.React = React;

dotenv.config({ path: path.join(process.cwd(), ".env.local") });
dotenv.config();

async function main(): Promise<void> {
  const card = await db.getDirectoryListingCabinetBySiret("44110142500037");
  assert.ok(card, "Expected sample Paris cabinet to exist");

  const cityCode = card.city?.code_insee ?? card.establishment.city_code_insee;
  assert.ok(cityCode, "Expected sample cabinet to have a city code");

  const html = renderToStaticMarkup(
    <DirectoryProfileV2
      card={card}
      relatedCabinets={await db.getDirectoryRelatedListingCabinetsByCity(
        cityCode,
        card.establishment.siret,
        3,
      )}
      services={await db.getDirectoryProfileServices()}
      professions={await db.getDirectoryProfileProfessions(8)}
    />,
  );

  assert.match(html, /01 EXPERTS ASSOCIES/);
  assert.match(html, /Cabinet comptable a Paris|Cabinet comptable à Paris/);
  assert.match(html, /SIRET/);
  assert.match(html, /44110142500037/);
  assert.match(html, /Informations legales et administratives|Informations légales et administratives/);
  assert.match(
    html,
    /Ce que l&#x27;on peut verifier publiquement|Ce que l'on peut verifier publiquement|Ce que l&#x27;on peut vérifier publiquement|Ce que l'on peut vérifier publiquement/,
  );
  assert.match(html, /Missions comptables souvent recherchees a Paris|Missions comptables souvent recherchées à Paris/);
  assert.match(html, /href="\/expertises\/comptabilite"/);
  assert.match(html, /Professions accompagnees par un expert-comptable|Professions accompagnées par un expert-comptable/);
  assert.match(html, /href="\/professions\//);
  assert.match(html, /Autres cabinets comptables a Paris|Autres cabinets comptables à Paris/);
  assert.match(html, /Questions frequentes|Questions fréquentes/);
  assert.doesNotMatch(html, /avis client|note moyenne|etoiles/i);

  console.log("Directory profile V2 page OK");
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
