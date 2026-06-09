/**
 * scripts/seed-page-content-sample.ts
 *
 * Vague 2.B — Smoke-test seed.
 *
 * Inserts 1 sample row per new table (page_sections / seo_overrides /
 * page_meta) for (route='professions', slug='boulangers') so we can verify
 * that the helpers (getPageSections / getSeoOverride / getPageMeta) round-trip
 * correctly through the DbAdapter.
 *
 * Run: npm run db:seed-page-content-sample
 */
import { db } from "../src/libs/db";

const ROUTE = "professions";
const SLUG = "boulangers";

function main(): void {
  // ── page_sections ──────────────────────────────────────────────────────────
  db.deletePageSections(ROUTE, SLUG);

  db.upsertPageSection({
    route: ROUTE,
    slug: SLUG,
    section_type: "Hero",
    section_order: 0,
    title: "Expert-comptable pour boulangers",
    body: "Comptabilité spécialisée pour artisans boulangers : TVA 5,5 %, gestion des matières premières, registre sanitaire.",
    items: null,
    citations: null,
    generated_by_model: "gemini-2.5-pro",
  });

  db.upsertPageSection({
    route: ROUTE,
    slug: SLUG,
    section_type: "BenefitsGrid",
    section_order: 1,
    title: "Pourquoi nous choisir",
    body: null,
    items: JSON.stringify([
      { label: "TVA 5,5 %", value: "Application correcte du taux réduit sur la vente à emporter." },
      { label: "Stocks", value: "Pilotage des matières premières et pertes." },
      { label: "Registre sanitaire", value: "Conformité HACCP intégrée au suivi compta." },
    ]),
    citations: JSON.stringify([
      {
        text: "BOFiP — TVA produits alimentaires",
        url: "https://bofip.impots.gouv.fr/bofip/1502-PGP",
        source: "bofip",
      },
    ]),
    generated_by_model: "gemini-2.5-pro",
  });

  // ── seo_overrides ──────────────────────────────────────────────────────────
  db.upsertSeoOverride({
    route: ROUTE,
    slug: SLUG,
    meta_title: "Expert-comptable boulanger : TVA, stocks, HACCP | Numeris",
    meta_description:
      "Cabinet spécialisé pour les boulangers : optimisation TVA 5,5 %, gestion matières premières, conformité sanitaire. Devis gratuit.",
    h1: "Expert-comptable pour boulangers",
    key_takeaways: JSON.stringify([
      "TVA réduite à 5,5 % sur la vente de pain à emporter",
      "Suivi rigoureux des stocks matières premières (farine, levure)",
      "Conformité HACCP et registre sanitaire obligatoire",
    ]),
    json_ld_extra: JSON.stringify({
      "@type": "ProfessionalService",
      areaServed: "FR",
      serviceType: "Expertise comptable artisans boulangers",
    }),
    generated_by_model: "gemini-2.5-pro",
  });

  // ── page_meta ──────────────────────────────────────────────────────────────
  db.upsertPageMeta({
    route: ROUTE,
    slug: SLUG,
    author_persona_id: "helene-marchand",
    reviewed_by: "helene-marchand",
    content_hash: "sample-hash-0001",
    publish_status: "draft",
    published_at: null,
    pipeline_run_id: "seed-sample-2026-06-01",
  });

  // ── round-trip verification ────────────────────────────────────────────────
  const sections = db.getPageSections(ROUTE, SLUG);
  const seo = db.getSeoOverride(ROUTE, SLUG);
  const meta = db.getPageMeta(ROUTE, SLUG);

  console.log(`[seed-page-content-sample] route=${ROUTE} slug=${SLUG}`);
  console.log(`  page_sections rows: ${sections.length}`);
  for (const s of sections) {
    console.log(`    [#${s.section_order}] ${s.section_type} — ${s.title ?? "(no title)"}`);
  }
  console.log(`  seo_overrides: ${seo ? `OK — "${seo.meta_title}"` : "MISSING"}`);
  console.log(
    `  page_meta:     ${meta ? `OK — status=${meta.publish_status} hash=${meta.content_hash}` : "MISSING"}`,
  );

  if (!sections.length || !seo || !meta) {
    console.error(`[seed-page-content-sample] FAIL — at least one row not readable`);
    process.exit(1);
  }
  console.log(`[seed-page-content-sample] OK — round-trip verified.`);
}

main();
