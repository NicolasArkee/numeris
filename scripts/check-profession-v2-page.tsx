import assert from "node:assert/strict";
import React from "react";
import { renderToReadableStream } from "react-dom/server";
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

async function renderProfession(slug: string) {
  const profession = await db.getProfessionBySlug(slug);
  assert.ok(profession, `Expected ${slug} profession`);

  const [category, services, linkGroups, professionSiblings, bundle, rawSections] = await Promise.all([
    db.getProfessionCategoryBySlug(profession.category_slug),
    db.getServices(),
    getProfessionLinks(slug),
    db.getProfessionsByCategory(profession.category_slug),
    getDbPageBundle("professions", slug),
    db.getPageSections("professions", slug),
  ]);
  const siblingProfessions = professionSiblings
    .filter((item) => item.slug !== slug)
    .slice(0, 8);
  assert.ok(rawSections.length > 0, `Expected DB fixtures for ${slug}`);
  if (!bundle.isPublished) {
    assert.equal(bundle.hasDbContent, false, `Draft content for ${slug} must remain fail-closed`);
  }

  const firstHeroId = rawSections.find((section) => section.section_type === "Hero")?.id;
  const renderableSections = bundle.hasDbContent
    ? bundle.renderableSections
    : rawSections.filter(
        (section) => section.id !== firstHeroId && section.section_type !== "KeyTakeaways",
      );

  const sidebarData = buildProfessionSidebarData({
    profession,
    ...(category && { category }),
    services,
    siblingProfessions,
    linkGroups,
  });

  const stream = await renderToReadableStream(
    <>
      {dedupeProfessionRenderableSections(renderableSections).map((section) => {
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
  await stream.allReady;
  return new Response(stream).text();
}

async function main(): Promise<void> {
const html = await renderProfession("epiceries-fines");
const normalized = html
  .replaceAll("&#x27;", "'")
  .replaceAll("&amp;", "&")
  .normalize("NFD")
  .replaceAll(/\p{Diacritic}/gu, "")
  .toLowerCase();

// The V2 content column is fluid. Keep checks on editorial structure and
// content below, rather than freezing the former 48rem/72rem layout.
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

const barsHtml = await renderProfession("bars-et-brasseries");
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
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
