import assert from "node:assert/strict";
import type { ProfessionCategory, Secteur, Service } from "../src/libs/db";
import {
  buildExpertiseFaqItems,
  buildExpertiseNeedLinks,
  buildExpertisePageStats,
  buildExpertiseProfessionCategoryLinks,
  buildExpertiseSectorLinks,
} from "../src/components/expertises/expertises-v2-helpers";
import { db } from "../src/libs/db";

const services: Service[] = [
  { id: 3, slug: "social", title: "Gestion sociale", description: "", icon: "", order_index: 3 },
  { id: 1, slug: "comptabilite", title: "Comptabilite generale", description: "", icon: "", order_index: 1 },
  { id: 2, slug: "fiscalite", title: "Conseil fiscal", description: "", icon: "", order_index: 2 },
];
const secteurs: Secteur[] = [
  { id: 1, slug: "immobilier", name: "Immobilier", description: "SCI et LMNP", volume: 5680 },
  { id: 2, slug: "commerce", name: "Commerce", description: "Commerce et franchises", volume: 1100 },
];
const categories: ProfessionCategory[] = [
  { id: 2, slug: "sante", name: "Sante", description: "Soignants", icon: "", order_index: 2 },
  { id: 1, slug: "tech", name: "Tech", description: "Digital", icon: "", order_index: 1 },
];

assert.deepEqual(buildExpertisePageStats(services, secteurs, categories), {
  serviceCount: 3,
  sectorCount: 2,
  professionCategoryCount: 2,
});

assert.deepEqual(
  buildExpertiseNeedLinks(services).map((link) => link.href),
  ["/expertises/comptabilite", "/expertises/fiscalite", "/expertises/social"],
);
assert.ok(
  buildExpertiseNeedLinks(services).every((link) => link.description.length > 0),
  "Need links must expose explanatory copy",
);

assert.deepEqual(
  buildExpertiseSectorLinks(secteurs, 1),
  [{ label: "Immobilier", href: "/secteurs/immobilier", description: "SCI et LMNP" }],
);

assert.deepEqual(
  buildExpertiseProfessionCategoryLinks(categories).map((link) => link.href),
  ["/professions#tech", "/professions#sante"],
);

const faq = buildExpertiseFaqItems();
assert.equal(faq.length, 4);
assert.ok(faq.some((item) => item.question.includes("expertise comptable")));
assert.ok(faq.every((item) => item.answer.length > 40));

async function main(): Promise<void> {
  const [dbServices, dbSecteurs, dbCategories] = await Promise.all([
    db.getServices(),
    db.getSecteurs(),
    db.getProfessionCategories(),
  ]);
  const dbStats = buildExpertisePageStats(
    dbServices,
    dbSecteurs,
    dbCategories,
  );
  assert.equal(dbStats.serviceCount, 6);
  assert.ok(dbStats.sectorCount >= 6);
  assert.ok(dbStats.professionCategoryCount >= 8);
  assert.ok(
    buildExpertiseNeedLinks(dbServices).some((link) => link.href === "/expertises/creation-entreprise"),
    "Need links should include creation d'entreprise when available",
  );

  console.log("Expertises V2 helpers OK");
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
