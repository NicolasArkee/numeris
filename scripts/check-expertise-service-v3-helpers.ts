import assert from "node:assert/strict";
import type {
  Profession,
  ProfessionCategory,
  Secteur,
  Service,
} from "../src/libs/db";
import {
  buildServiceHeroAsset,
  buildServiceLandingFaqItems,
  buildServiceProfessionCards,
  buildServiceSeoContentPack,
  buildServiceSectorCards,
} from "../src/components/expertises/service-v3-helpers";
import { db } from "../src/libs/db";

const service: Service = {
  id: 1,
  slug: "comptabilite",
  title: "Comptabilite generale",
  description: "Tenue, revision et reporting comptable.",
  icon: "",
  order_index: 1,
};

const secteurs: Secteur[] = [
  { id: 1, slug: "immobilier", name: "Immobilier", description: "SCI, LMNP", volume: 1000 },
  { id: 2, slug: "start-up", name: "Start-up & Tech", description: "SaaS et levee de fonds", volume: 900 },
];

const categories: ProfessionCategory[] = [
  { id: 1, slug: "droit-chiffre", name: "Droit & Chiffre", description: null, icon: "", order_index: 1 },
  { id: 2, slug: "commerce-ecommerce", name: "Commerce & E-commerce", description: null, icon: "", order_index: 2 },
];

const professions: Profession[] = [
  {
    id: 1,
    slug: "avocats",
    name: "Avocats",
    category_slug: "droit-chiffre",
    description: "Cabinets d'avocats",
    obligations: null,
    volume: 1500,
  },
  {
    id: 2,
    slug: "e-commercants",
    name: "E-commercants",
    category_slug: "commerce-ecommerce",
    description: "Boutiques en ligne",
    obligations: null,
    volume: 1200,
  },
];

const heroAsset = buildServiceHeroAsset(service);
assert.equal(heroAsset.kind, "hero");
assert.ok(heroAsset.src.startsWith("data:image/svg+xml"));
assert.ok(heroAsset.alt.includes("Comptabilite generale"));

const sectorCards = buildServiceSectorCards(service.slug, secteurs);
assert.equal(sectorCards.length, 2);
assert.deepEqual(
  sectorCards.map((card) => card.href),
  ["/expertises/comptabilite/immobilier", "/expertises/comptabilite/start-up"],
);
assert.ok(sectorCards.every((card) => card.asset.kind === "sector"));
assert.ok(sectorCards.every((card) => card.asset.src.startsWith("data:image/svg+xml")));

const professionCards = buildServiceProfessionCards(
  service.slug,
  professions,
  categories,
);
assert.deepEqual(
  professionCards.map((card) => card.href),
  ["/expertises/comptabilite/avocats", "/expertises/comptabilite/e-commercants"],
);
assert.deepEqual(
  professionCards.map((card) => card.categoryLabel),
  ["Droit & Chiffre", "Commerce & E-commerce"],
);
assert.ok(professionCards.every((card) => card.asset.kind === "profession"));

const faq = buildServiceLandingFaqItems(service);
assert.equal(faq.length, 9);
assert.ok(faq.some((item) => item.question.includes("diagnostic")));
assert.ok(faq.some((item) => item.answer.includes("liasse fiscale")));

const seoContent = buildServiceSeoContentPack(service);
assert.ok(seoContent.overviewIntro.includes("comptabilité générale"));
assert.ok(seoContent.coverageCards.some((card) => card.title === "Tenue comptable courante"));
assert.ok(seoContent.obligationsIntro.includes("lettre de mission"));
assert.ok(seoContent.documentBlocks.length >= 6);
assert.ok(seoContent.internalLinks.some((link) => link.href === "/expertises/fiscalite"));

const expectedServiceTerms = new Map([
  ["comptabilite", "Tenue comptable courante"],
  ["fiscalite", "TVA et cadrage des flux"],
  ["social", "Bulletins de paie"],
  ["creation-entreprise", "Choix du statut juridique"],
  ["conseil-gestion", "Tableaux de bord dirigeants"],
  ["audit", "Audit légal"],
]);

async function main(): Promise<void> {
  const dbServices = await db.getServices();
  for (const dbServiceItem of dbServices) {
    const contentPack = buildServiceSeoContentPack(dbServiceItem);
    const expectedTerm = expectedServiceTerms.get(dbServiceItem.slug);
    assert.ok(expectedTerm, `Unexpected service ${dbServiceItem.slug}`);
    assert.ok(
      contentPack.coverageCards.some((card) => card.title === expectedTerm),
      `Expected ${dbServiceItem.slug} coverage to include ${expectedTerm}`,
    );
    assert.ok(contentPack.coverageCards.length >= 6);
    assert.ok(contentPack.documentBlocks.length >= 6);
    assert.ok(contentPack.deliverables.length >= 4);
    assert.ok(contentPack.internalLinks.length >= 4);
    assert.ok(
      buildServiceLandingFaqItems(dbServiceItem).length >= 8,
      `Expected rich FAQ for ${dbServiceItem.slug}`,
    );
  }

  const dbService = dbServices.find((item) => item.slug === "comptabilite");
  assert.ok(dbService);
  const allSecteurs = await db.getSecteurs();
  const secteurMap = new Map(allSecteurs.map((item) => [item.slug, item]));
  const serviceSecteurs = await db.getServiceSecteurs(dbService.slug);
  const dbSectorCards = buildServiceSectorCards(
    dbService.slug,
    serviceSecteurs
      .map((item) => secteurMap.get(item.secteur_slug))
      .filter((item): item is Secteur => Boolean(item)),
  );
  assert.ok(dbSectorCards.length >= 6);
  assert.ok(dbSectorCards.every((card) => card.asset.src.startsWith("data:image/svg+xml")));

  console.log("Expertise service V3 helpers OK");
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
