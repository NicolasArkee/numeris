import assert from "node:assert/strict";
import {
  buildCityTargets,
  pickCandidates,
  stripPostalCity,
  totalPages,
} from "./directory-import-helpers";

const targets = buildCityTargets(
  [
    {
      code: "93066",
      nom: "Saint-Denis",
      population: 113116,
      codesPostaux: ["93200"],
      centre: { coordinates: [2.357, 48.936] },
      departement: { code: "93", nom: "Seine-Saint-Denis" },
      region: { code: "11", nom: "Ile-de-France" },
    },
    {
      code: "97411",
      nom: "Saint-Denis",
      population: 154765,
      codesPostaux: ["97400"],
      centre: { coordinates: [55.448, -20.879] },
      departement: { code: "974", nom: "La Reunion" },
      region: { code: "04", nom: "La Reunion" },
    },
    {
      code: "75056",
      nom: "Paris",
      population: 2103778,
      codesPostaux: ["75001", "75002"],
      centre: { coordinates: [2.347, 48.8589] },
      departement: { code: "75", nom: "Paris" },
      region: { code: "11", nom: "Ile-de-France" },
    },
  ],
  3,
);

assert.equal(targets[0].codeInsee, "75056");
assert.equal(targets[0].slug, "paris");
assert.equal(targets[0].searchCodes.length, 20);
assert.equal(targets[0].searchCodes[0], "75101");
assert.deepEqual(
  targets.map((target) => target.slug),
  ["paris", "saint-denis-974", "saint-denis-93"],
);

const candidates = pickCandidates(
  {
    siren: "123456789",
    nom_complet: "FIDUCIAL EXPERTISE",
    activite_principale: "69.20Z",
    etat_administratif: "A",
    matching_etablissements: [
      {
        siret: "12345678900018",
        commune: "75108",
        activite_principale: "69.20Z",
        etat_administratif: "A",
        adresse: "1 RUE TEST 75008 PARIS",
        code_postal: "75008",
        libelle_commune: "PARIS 8",
      },
      {
        siret: "12345678900026",
        commune: "75108",
        activite_principale: "70.22Z",
        etat_administratif: "A",
      },
      {
        siret: "12345678900034",
        commune: "33063",
        activite_principale: "69.20Z",
        etat_administratif: "A",
      },
    ],
  },
  targets[0],
  "https://example.test/search",
);

assert.equal(candidates.length, 1);
assert.equal(candidates[0].city.codeInsee, "75056");
assert.equal(candidates[0].establishment.siret, "12345678900018");
assert.equal(
  stripPostalCity("10 RUE TEST 75008 [NON-DIFFUSIBLE] PARIS", "75008", "[NON-DIFFUSIBLE] PARIS"),
  "10 RUE TEST",
);
assert.equal(totalPages(0, 25), 0);
assert.equal(totalPages(51, 25), 3);

console.log("Directory bulk import helpers OK");
