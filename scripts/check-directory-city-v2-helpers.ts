import assert from "node:assert/strict";
import type { DirectoryCabinetCard, DirectoryCity } from "../src/libs/db";
import {
  buildDirectoryCityFaqItems,
  buildDirectoryCityMapPoint,
  buildDirectoryCityRobots,
  buildDirectoryCityStats,
  buildNearbyDirectoryCityLinks,
} from "../src/components/directory/city-v2-helpers";
import { db } from "../src/libs/db";

function makeCity(overrides: Partial<DirectoryCity> = {}): DirectoryCity {
  return {
    code_insee: "75056",
    name: "Paris",
    slug: "paris",
    postal_codes: "[\"75001\",\"75002\"]",
    department_code: "75",
    department_name: "Paris",
    region_code: "11",
    region_name: "Ile-de-France",
    latitude: 48.8566,
    longitude: 2.3522,
    population: 2103778,
    updated_at: "2026-06-14 08:00:00",
    ...overrides,
  };
}

function makeCard(
  siret: string,
  oecStatus: DirectoryCabinetCard["cabinet"]["oec_status"] = "unverified",
): DirectoryCabinetCard {
  const city = makeCity();
  return {
    cabinet: {
      id: Number(siret.slice(-4)),
      siren: siret.slice(0, 9),
      legal_name: `CABINET ${siret.slice(-4)}`,
      display_name: null,
      naf_code: "69.20Z",
      legal_form: "SAS",
      is_active: 1,
      oec_status: oecStatus,
      oec_profile_url: null,
      oec_verified_at: oecStatus === "unverified" ? null : "2026-06-14",
      confidence_score: oecStatus === "unverified" ? 65 : 95,
      publish_status: oecStatus === "unverified" ? "review" : "published",
      source_summary: "Source administrative publique",
      created_at: "2026-06-14 08:00:00",
      updated_at: "2026-06-14 08:00:00",
    },
    establishment: {
      id: Number(siret.slice(-4)),
      cabinet_id: Number(siret.slice(-4)),
      siret,
      is_headquarter: 0,
      is_active: 1,
      address_line1: "31 RUE DE CHATEAUDUN",
      address_line2: null,
      postal_code: "75009",
      city_name: "PARIS",
      city_code_insee: city.code_insee,
      department_code: city.department_code,
      region_code: city.region_code,
      latitude: 48.876,
      longitude: 2.336,
      geocode_score: 0.91,
      source_key: "api-recherche-entreprises",
      retrieved_at: "2026-06-14T07:30:00.000Z",
      created_at: "2026-06-14 08:00:00",
      updated_at: "2026-06-14 08:00:00",
    },
    city,
  };
}

assert.deepEqual(buildDirectoryCityRobots(0), { index: false, follow: true });
assert.equal(buildDirectoryCityRobots(1), undefined);

const cards = [
  makeCard("44110142500037"),
  makeCard("44110142500038", "verified"),
  makeCard("44110142500039", "manual_verified"),
];
const stats = buildDirectoryCityStats(cards, 12);
assert.equal(stats.totalCount, 12);
assert.equal(stats.displayedCount, 3);
assert.equal(stats.verifiedCount, 2);
assert.equal(stats.candidateCount, 10);
assert.equal(stats.hasMoreResults, true);

assert.deepEqual(buildDirectoryCityMapPoint(makeCity()), {
  latitude: 48.8566,
  longitude: 2.3522,
  source: "city",
});
assert.equal(
  buildDirectoryCityMapPoint(makeCity({ latitude: null, longitude: null })),
  null,
);

const nearby = buildNearbyDirectoryCityLinks(
  [
    makeCity(),
    makeCity({ code_insee: "93066", slug: "saint-denis", name: "Saint-Denis", department_code: "93", population: 113116 }),
    makeCity({ code_insee: "93001", slug: "aubervilliers", name: "Aubervilliers", department_code: "93", population: 90134 }),
    makeCity({ code_insee: "69123", slug: "lyon", name: "Lyon", department_code: "69", population: 522969 }),
  ],
  makeCity({ code_insee: "93066", slug: "saint-denis", name: "Saint-Denis", department_code: "93" }),
  2,
);
assert.deepEqual(
  nearby.map((link) => link.href),
  ["/expert-comptable/aubervilliers", "/expert-comptable/paris"],
);

const faq = buildDirectoryCityFaqItems(makeCity(), stats);
assert.equal(faq.length, 4);
assert.ok(faq.some((item) => item.question.includes("expert-comptable a Paris")));
assert.ok(faq.some((item) => item.answer.includes("statut professionnel")));

async function main(): Promise<void> {
  const paris = await db.getDirectoryCityBySlug("paris");
  assert.ok(paris, "Expected Paris to exist in imported directory data");
  const parisCount = await db.getDirectoryListingCabinetCountByCity(paris.code_insee);
  assert.ok(parisCount > 0, "Expected Paris listing count");
  const parisCards = await db.getDirectoryListingCabinetsByCity(paris.code_insee, 5);
  const parisStats = buildDirectoryCityStats(parisCards, parisCount);
  assert.equal(parisStats.totalCount, parisCount);
  assert.equal(parisStats.displayedCount, 5);
  assert.ok(parisStats.hasMoreResults);

  console.log("Directory city V2 helpers OK");
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
