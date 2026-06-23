import assert from "node:assert/strict";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { db } from "../src/libs/db";
import { ExpertisesPageV2 } from "../src/components/expertises/ExpertisesPageV2";

const html = renderToStaticMarkup(
  <ExpertisesPageV2
    services={db.getServices()}
    secteurs={db.getSecteurs()}
    categories={db.getProfessionCategories()}
  />,
);

assert.match(html, /Expertises comptables/);
assert.match(html, /Choisissez l'expertise adaptee a votre besoin|Choisissez l&#x27;expertise adaptee a votre besoin/);
assert.match(html, /href="\/expertises\/comptabilite"/);
assert.match(html, /href="\/expertises\/fiscalite"/);
assert.match(html, /href="\/expertises\/social"/);
assert.match(html, /href="\/expertises\/creation-entreprise"/);
assert.match(html, /Par besoin/);
assert.match(html, /Par secteur/);
assert.match(html, /href="\/secteurs\//);
assert.match(html, /Par profession/);
assert.match(html, /href="\/professions#/);
assert.match(html, /Methode Numeris/);
assert.match(html, /Questions frequentes/);
assert.match(html, /Prendre rendez-vous/);
assert.doesNotMatch(html, /avis Google|note moyenne|4\.9\/5|etoiles/i);

console.log("Expertises V2 page OK");
