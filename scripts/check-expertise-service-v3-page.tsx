import assert from "node:assert/strict";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { db } from "../src/libs/db";
import { ExpertiseServiceLandingV3 } from "../src/components/expertises/ExpertiseServiceLandingV3";
import { getSEOForService } from "../src/data/seo";

const REQUIRED_TERMS_BY_SERVICE: Record<string, string[]> = {
  comptabilite: [
    "tenue comptable courante",
    "rapprochement bancaire",
    "lettrage clients/fournisseurs",
    "TVA et déclarations périodiques",
    "bilan",
    "compte de résultat",
    "annexe",
    "liasse fiscale",
    "comptes annuels",
    "Documents à préparer avant le diagnostic comptable",
    "lettre de mission",
    "un expert-comptable externe n'est pas obligatoire",
    "facturation électronique",
  ],
  fiscalite: [
    "conseil fiscal",
    "TVA et cadrage des flux",
    "impôt sur les sociétés",
    "CFE",
    "contrôle fiscal",
    "régime de TVA",
    "rémunération et dividendes",
    "liasse fiscale",
  ],
  social: [
    "gestion sociale",
    "bulletins de paie",
    "DSN",
    "DPAE",
    "convention collective",
    "solde de tout compte",
    "URSSAF",
    "audit social",
  ],
  "creation-entreprise": [
    "création d'entreprise",
    "choix du statut juridique",
    "business plan",
    "prévisionnel",
    "SASU",
    "EURL",
    "immatriculation",
    "régime fiscal",
  ],
  "conseil-gestion": [
    "conseil en gestion",
    "tableaux de bord",
    "trésorerie",
    "marge",
    "prévisionnel financier",
    "seuil de rentabilité",
    "BFR",
    "budget et écarts",
  ],
  audit: [
    "audit légal",
    "audit contractuel",
    "commissaire aux comptes",
    "contrôle interne",
    "due diligence",
    "comptes annuels",
    "lettre de mission",
    "continuité d'exploitation",
  ],
};

function normalizeVisibleText(markup: string): string {
  return markup
    .replaceAll(/src="[^"]+"/g, " ")
    .replaceAll(/<script[\s\S]*?<\/script>/g, " ")
    .replaceAll(/<style[\s\S]*?<\/style>/g, " ")
    .replaceAll(/<[^>]+>/g, " ")
    .replaceAll("&nbsp;", " ")
    .replaceAll("&#x27;", "'")
    .replaceAll("&amp;", "&")
    .replaceAll("&quot;", "\"")
    .normalize("NFD")
    .replaceAll(/\p{Diacritic}/gu, "")
    .replaceAll(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function assertVisibleTextIncludes(text: string, needle: string, slug: string) {
  const normalizedNeedle = normalizeVisibleText(needle);
  assert.ok(
    text.includes(normalizedNeedle),
    `Expected ${slug} visible content to include "${needle}"`,
  );
}

const secteurMap = new Map(db.getSecteurs().map((item) => [item.slug, item]));
const categories = db.getProfessionCategories();
const services = db.getServices();
const reports: string[] = [];

for (const service of services) {
  const secteurs = db.getServiceSecteurs(service.slug)
    .map((item) => secteurMap.get(item.secteur_slug))
    .filter((item): item is NonNullable<typeof item> => Boolean(item));

  const professions = db.getServiceProfessions(service.slug)
    .map((item) => db.getProfessionBySlug(item.profession_slug))
    .filter((item): item is NonNullable<typeof item> => Boolean(item))
    .slice(0, 10);

  const html = renderToStaticMarkup(
    <ExpertiseServiceLandingV3
      service={service}
      seo={getSEOForService(service)}
      secteurs={secteurs}
      professions={professions}
      categories={categories}
    />,
  );

  const imageCount = (html.match(/<img /g) ?? []).length;
  const sectorAssetCount = (html.match(/data-asset-kind="sector"/g) ?? []).length;
  const professionAssetCount = (html.match(/data-asset-kind="profession"/g) ?? []).length;
  const seoAssetCount = (html.match(/data-asset-kind="seo"/g) ?? []).length;
  const expertiseLinkCount = new Set(html.match(/href="\/expertises\/[a-z-]+"/g) ?? []).size;
  const visibleHtml = html.replaceAll(/src="[^"]+"/g, "src=\"\"");
  const h2Count = (html.match(/<h2/g) ?? []).length;
  const visibleText = normalizeVisibleText(html);
  const wordCount = visibleText.match(/[a-z0-9]+(?:'[a-z0-9]+)?/g)?.length ?? 0;

  assertVisibleTextIncludes(visibleText, service.title, service.slug);
  assert.match(html, /Obtenir mon diagnostic/);
  assert.match(html, new RegExp(`href="/contact\\?expertise=${service.slug}`));
  assert.doesNotMatch(html, /<form[^>]+action="\/contact"/);
  assert.ok(imageCount >= 20, `Expected many image assets for ${service.slug}, got ${imageCount}`);
  assert.equal(sectorAssetCount, secteurs.length, `Unexpected sector asset count for ${service.slug}`);
  assert.equal(professionAssetCount, professions.length, `Unexpected profession asset count for ${service.slug}`);
  assert.equal(seoAssetCount, 2, `Expected overview and document SEO assets for ${service.slug}`);
  assert.ok(h2Count >= 10, `Expected rich H2 structure for ${service.slug}, got ${h2Count}`);
  assert.ok(wordCount >= 1450, `Expected at least 1450 visible words for ${service.slug}, got ${wordCount}`);
  assert.match(html, /Secteurs accompagnés|Secteurs accompagnes/);
  assert.match(html, /Professions accompagnées|Professions accompagnees/);
  assert.match(html, /Plan d'action|Plan d&#x27;action/);
  assert.ok(
    expertiseLinkCount >= 4,
    `Expected at least 4 internal expertise links for ${service.slug}, got ${expertiseLinkCount}`,
  );
  assert.doesNotMatch(visibleHtml, /helene-marchand\.jpg/i);
  assert.doesNotMatch(visibleHtml, /avis Google|note moyenne|4\.9\/5|98%|500\+/i);

  for (const term of REQUIRED_TERMS_BY_SERVICE[service.slug] ?? []) {
    assertVisibleTextIncludes(visibleText, term, service.slug);
  }

  reports.push(`${service.slug}: ${wordCount} visible words, ${h2Count} H2, ${imageCount} images`);
}

console.log(`Expertise service V3 pages OK\n${reports.join("\n")}`);
