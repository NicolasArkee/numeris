import assert from "node:assert/strict";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { DynamicSection } from "../src/components/DynamicSection";
import {
  getProfessionSectionAside,
  ProfessionSectionWithAside,
} from "../src/components/professions/ProfessionSidebarV2";
import {
  buildProfessionSidebarData,
  dedupeProfessionRenderableSections,
} from "../src/components/professions/profession-v2-helpers";
import { getDbPageBundle } from "../src/libs/content/dbFirst";
import { db } from "../src/libs/db";
import { getProfessionLinks } from "../src/utils/taxonomy";

globalThis.React = React;

function renderProfession(slug: string) {
  const profession = db.getProfessionBySlug(slug);
  assert.ok(profession, `Expected ${slug} profession`);

  const category = db.getProfessionCategoryBySlug(profession.category_slug);
  const services = db.getServices();
  const linkGroups = getProfessionLinks(slug);
  const siblingProfessions = db
    .getProfessionsByCategory(profession.category_slug)
    .filter((item) => item.slug !== slug)
    .slice(0, 8);
  const bundle = getDbPageBundle("professions", slug);
  assert.ok(bundle.hasDbContent, `Expected DB content for ${slug}`);

  const sidebarData = buildProfessionSidebarData({
    profession,
    ...(category && { category }),
    services,
    siblingProfessions,
    linkGroups,
  });

  return renderToStaticMarkup(
    <>
      {dedupeProfessionRenderableSections(bundle.renderableSections).map((section) => {
        const aside = getProfessionSectionAside(sidebarData, section);
        return (
          <ProfessionSectionWithAside key={section.id} aside={aside}>
            <DynamicSection
              section={section}
              professionEditorialLayout={aside ? "single" : "grid"}
            />
          </ProfessionSectionWithAside>
        );
      })}
    </>,
  );
}

const html = renderProfession("epiceries-fines");
const normalized = html
  .replaceAll("&#x27;", "'")
  .replaceAll("&amp;", "&")
  .normalize("NFD")
  .replaceAll(/\p{Diacritic}/gu, "")
  .toLowerCase();

assert.match(html, /lg:grid-cols-\[minmax\(0,48rem\)_20rem\]/);
assert.match(html, /max-w-\[72rem\]/);
assert.match(html, /lg:grid-cols-2/);
assert.match(html, /lg:col-span-2/);
assert.doesNotMatch(html, /max-w-prose max-w-none/);
assert.doesNotMatch(html, /lg:columns-2/);
assert.match(html, /data-profession-aside="true"/);
assert.match(html, /lg:sticky/);
assert.match(html, /lg:top-\[calc\(72px\+2rem\)\]/);
assert.equal((html.match(/data-profession-aside="true"/g) ?? []).length, 4);
assert.match(html, /Les contrôles utiles/);
assert.match(html, /TVA ventilée par canal/);
assert.match(html, /Stock suivi par âge/);
assert.match(html, /Pièces à préparer/);
assert.match(html, /Export caisse par taux de TVA/);
assert.match(html, /Âge de stock par lot et date limite/);
assert.match(html, /Trésorerie immobilisée/);
assert.match(html, /Coffrets et paniers composés/);
assert.match(html, /Tableau d&#x27;âge de stock|Tableau d'âge de stock/);
assert.match(html, /Calculateur marge coffret/);
assert.ok(normalized.includes("marge par fournisseur"));
assert.ok(normalized.includes("magasin, coffrets et e-commerce"));
assert.equal((html.match(/id="faq"/g) ?? []).length, 1);
assert.doesNotMatch(html, /Ressources[\s\S]{0,120}Aller plus loin|Aller plus loin[\s\S]{0,120}Ressources/);
assert.doesNotMatch(html, /offre à pousser|Priorité|Score|Urgence|Complexité|Potentiel lead|Tableau stock \+ article|3,65|P2/);
assert.doesNotMatch(html, /observe Hélène Marchand|Hélène Marchand, experte-comptable/);

const barsHtml = renderProfession("bars-et-brasseries");
assert.match(barsHtml, /Création, reprise et choix du statut juridique pour votre bar ou brasserie/);
assert.match(barsHtml, /Préparer un business plan finançable/);
assert.match(barsHtml, /SARL ou EURL : sécuriser l&#x27;exploitation|SARL ou EURL : sécuriser l'exploitation/);
assert.match(barsHtml, /SAS ou SASU : arbitrer souplesse et protection/);
assert.match(barsHtml, /lg:grid-cols-2/);
assert.match(barsHtml, /lg:col-span-2/);
assert.match(barsHtml, /Vos obligations comptables, fiscales et réglementaires spécifiques[\s\S]*space-y-8/);
assert.doesNotMatch(
  barsHtml,
  /Vos obligations comptables, fiscales et réglementaires spécifiques[\s\S]{0,4000}lg:grid-cols-2/,
);
assert.doesNotMatch(barsHtml, /lg:columns-2/);
assert.doesNotMatch(barsHtml, /max-w-prose max-w-none/);

console.log("Profession V2 page OK");
