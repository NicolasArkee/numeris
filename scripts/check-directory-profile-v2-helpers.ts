import assert from "node:assert/strict";
import type {
  DirectoryCabinetCard,
  Profession,
  Service,
} from "../src/libs/db";
import {
  buildDirectoryFactRows,
  buildDirectoryFaqItems,
  buildDirectoryMapPoint,
  buildDirectoryProfileServiceLinks,
  buildDirectoryProfileProfessionLinks,
  buildDirectoryRobots,
  isDirectoryCabinetVerified,
} from "../src/components/directory/profile-v2-helpers";
import { db } from "../src/libs/db";

type CardOverrides = Omit<
  Partial<DirectoryCabinetCard>,
  "cabinet" | "establishment" | "city"
> & {
  cabinet?: Partial<DirectoryCabinetCard["cabinet"]>;
  establishment?: Partial<DirectoryCabinetCard["establishment"]>;
  city?: DirectoryCabinetCard["city"];
};

function makeCard(
  overrides: CardOverrides = {},
): DirectoryCabinetCard {
  const base: DirectoryCabinetCard = {
    cabinet: {
      id: 1,
      siren: "441101425",
      legal_name: "01 EXPERTS ASSOCIES",
      display_name: null,
      naf_code: "69.20Z",
      legal_form: "SAS",
      is_active: 1,
      oec_status: "unverified",
      oec_profile_url: null,
      oec_verified_at: null,
      confidence_score: 65,
      publish_status: "review",
      source_summary: "Source administrative publique",
      created_at: "2026-06-14 08:00:00",
      updated_at: "2026-06-14 08:00:00",
    },
    establishment: {
      id: 10,
      cabinet_id: 1,
      siret: "44110142500037",
      is_headquarter: 0,
      is_active: 1,
      address_line1: "31 RUE DE CHATEAUDUN",
      address_line2: null,
      postal_code: "75009",
      city_name: "PARIS",
      city_code_insee: "75056",
      department_code: "75",
      region_code: "11",
      latitude: 48.876,
      longitude: 2.336,
      geocode_score: 0.91,
      source_key: "api-recherche-entreprises",
      retrieved_at: "2026-06-14T07:30:00.000Z",
      created_at: "2026-06-14 08:00:00",
      updated_at: "2026-06-14 08:00:00",
    },
    city: {
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
    },
  };

  return {
    ...base,
    ...overrides,
    cabinet: { ...base.cabinet, ...overrides.cabinet },
    establishment: { ...base.establishment, ...overrides.establishment },
    city: overrides.city === undefined ? base.city : overrides.city,
  };
}

const candidate = makeCard();
assert.equal(isDirectoryCabinetVerified(candidate), false);
assert.deepEqual(buildDirectoryRobots(candidate), { index: false, follow: true });

const verified = makeCard({
  cabinet: {
    oec_status: "manual_verified",
    publish_status: "published",
    confidence_score: 95,
    oec_verified_at: "2026-06-14",
  },
});
assert.equal(isDirectoryCabinetVerified(verified), true);
assert.equal(buildDirectoryRobots(verified), undefined);

const establishmentPoint = buildDirectoryMapPoint(candidate);
assert.deepEqual(establishmentPoint, {
  latitude: 48.876,
  longitude: 2.336,
  source: "establishment",
});

const cityFallbackPoint = buildDirectoryMapPoint(
  makeCard({ establishment: { latitude: null, longitude: null } }),
);
assert.deepEqual(cityFallbackPoint, {
  latitude: 48.8566,
  longitude: 2.3522,
  source: "city",
});

const noPoint = buildDirectoryMapPoint(
  makeCard({
    establishment: { latitude: null, longitude: null },
    city: { ...candidate.city!, latitude: null, longitude: null },
  }),
);
assert.equal(noPoint, null);

const facts = buildDirectoryFactRows(candidate);
assert.equal(facts.find((row) => row.label === "SIRET")?.value, "44110142500037");
assert.equal(facts.find((row) => row.label === "SIREN")?.value, "441101425");
assert.equal(facts.find((row) => row.label === "Code NAF / APE")?.value, "69.20Z");
assert.equal(facts.find((row) => row.label === "Statut administratif")?.value, "Actif");
assert.ok(facts.some((row) => row.label === "Date de recuperation"));

const services: Service[] = [
  { id: 3, slug: "social", title: "Gestion sociale", description: "", icon: "", order_index: 3 },
  { id: 1, slug: "comptabilite", title: "Comptabilite generale", description: "", icon: "", order_index: 1 },
  { id: 99, slug: "hors-sujet", title: "Hors sujet", description: "", icon: "", order_index: 99 },
  { id: 2, slug: "fiscalite", title: "Conseil fiscal", description: "", icon: "", order_index: 2 },
];
assert.deepEqual(
  buildDirectoryProfileServiceLinks(services).map((link) => link.href),
  ["/expertises/comptabilite", "/expertises/fiscalite", "/expertises/social"],
);

const professions: Profession[] = [
  { id: 1, slug: "avocats", name: "Avocats", category_slug: "liberales", description: null, obligations: null, volume: 1500 },
  { id: 2, slug: "medecins", name: "Medecins", category_slug: "sante", description: null, obligations: null, volume: 1500 },
  { id: 3, slug: "restaurateurs", name: "Restaurateurs", category_slug: "commerce", description: null, obligations: null, volume: 1200 },
  { id: 4, slug: "artisans", name: "Artisans", category_slug: "commerce", description: null, obligations: null, volume: 300 },
];
assert.deepEqual(
  buildDirectoryProfileProfessionLinks(professions, 3).map((link) => link.href),
  ["/professions/avocats", "/professions/medecins", "/professions/restaurateurs"],
);

const faq = buildDirectoryFaqItems(candidate);
assert.equal(faq.length, 4);
assert.ok(faq[0]!.question.includes("statut a confirmer"));
assert.ok(faq.some((item) => item.answer.includes("SIRET")));

async function main(): Promise<void> {
  const paris = await db.getDirectoryCityBySlug("paris");
  assert.ok(paris, "Expected Paris to exist in imported directory data");
  const related = await db.getDirectoryRelatedListingCabinetsByCity(
    paris.code_insee,
    "44110142500037",
    10,
  );
  assert.ok(related.length > 0, "Expected related Paris cabinets");
  assert.ok(
    related.every((card) => card.establishment.siret !== "44110142500037"),
    "Related cabinets must exclude the current establishment",
  );

  const profileServices = await db.getDirectoryProfileServices();
  assert.deepEqual(
    profileServices.map((service) => service.slug),
    ["comptabilite", "fiscalite", "social", "creation-entreprise", "conseil-gestion", "audit"],
  );

  const profileProfessions = await db.getDirectoryProfileProfessions(8);
  assert.equal(profileProfessions.length, 8);
  assert.ok(
    profileProfessions.every((profession, index, list) =>
      index === 0 || list[index - 1]!.volume >= profession.volume
    ),
    "Profile professions should be ordered by descending volume",
  );

  console.log("Directory profile V2 helpers OK");
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
