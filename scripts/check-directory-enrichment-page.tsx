import assert from "node:assert/strict";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import type {
  DirectoryCabinetCard,
  DirectoryEnrichmentSource,
  DirectoryProfileFact,
  DirectoryQualificationSnapshot,
} from "../src/libs/db";
import { sqliteAdapter } from "../src/libs/db/sqlite";
import {
  DirectoryProfileV2,
  DirectoryVerifiedAccountingServiceJsonLd,
} from "../src/components/directory/DirectoryProfileV2";

async function main(): Promise<void> {
  const card = await sqliteAdapter.getDirectoryListingCabinetBySiret("44110142500037");
  assert.ok(card, "Expected sample cabinet to exist");

  const facts: DirectoryProfileFact[] = [
    {
      id: 1,
      cabinet_id: card.cabinet.id,
      establishment_id: card.establishment.id,
      fact_type: "website",
      label: "Site officiel",
      value: "https://cabinet-fixture.example.org",
      source_id: 1,
      confidence: 95,
      is_displayable: 1,
      created_at: "2026-06-28T08:00:00.000Z",
      updated_at: "2026-06-28T08:00:00.000Z",
    },
    {
      id: 2,
      cabinet_id: card.cabinet.id,
      establishment_id: card.establishment.id,
      fact_type: "contact_url",
      label: "Page contact",
      value: "https://cabinet-fixture.example.org/contact",
      source_id: 1,
      confidence: 95,
      is_displayable: 1,
      created_at: "2026-06-28T08:00:00.000Z",
      updated_at: "2026-06-28T08:00:00.000Z",
    },
    {
      id: 3,
      cabinet_id: card.cabinet.id,
      establishment_id: card.establishment.id,
      fact_type: "service",
      label: "Service identifié",
      value: "Gestion sociale",
      source_id: 1,
      confidence: 90,
      is_displayable: 1,
      metadata_json: JSON.stringify({
        entityId: "social",
        routeSlug: "social",
        offerIds: ["paie", "declarations-sociales"],
        displayMode: "sourced",
        description:
          "Gestion des bulletins de paie, accompagnement social courant, déclarations sociales et suivi administratif des obligations employeur lorsque ces éléments sont identifiés dans les sources du cabinet.",
        evidenceSnippets: ["paie et fiscalite"],
        sourcePageUrls: ["https://cabinet-fixture.example.org/services"],
        confidenceReason: "Mention explicite dans la source de test.",
      }),
      created_at: "2026-06-28T08:00:00.000Z",
      updated_at: "2026-06-28T08:00:00.000Z",
    } as DirectoryProfileFact,
    {
      id: 4,
      cabinet_id: card.cabinet.id,
      establishment_id: card.establishment.id,
      fact_type: "phone",
      label: "Telephone non source",
      value: "01 23 45 67 89",
      source_id: null,
      confidence: 88,
      is_displayable: 1,
      created_at: "2026-06-28T08:00:00.000Z",
      updated_at: "2026-06-28T08:00:00.000Z",
    },
    {
      id: 5,
      cabinet_id: card.cabinet.id,
      establishment_id: card.establishment.id,
      fact_type: "service",
      label: "Service orphelin",
      value: "Audit non source",
      source_id: 999,
      confidence: 88,
      is_displayable: 1,
      metadata_json: JSON.stringify({ displayMode: "inferred", entityId: "audit" }),
      created_at: "2026-06-28T08:00:00.000Z",
      updated_at: "2026-06-28T08:00:00.000Z",
    } as DirectoryProfileFact,
    {
      id: 6,
      cabinet_id: card.cabinet.id,
      establishment_id: card.establishment.id,
      fact_type: "profile_summary" as DirectoryProfileFact["fact_type"],
      label: "Présentation",
      value:
        "01 Experts Associes accompagne les entrepreneurs, dirigeants et professionnels parisiens depuis son adresse rue Notre-Dame des Victoires. La fiche met en avant un cabinet d'expertise comptable identifié dans l'annuaire de l'Ordre des experts-comptables, avec Sandrine Jeanjacquot et Valerie Massot comme interlocutrices mentionnées. Pour préparer une prise de contact, la présentation rassemble les éléments utiles à vérifier : tenue comptable, fiscalité, gestion sociale, création d'entreprise et conseil de gestion. Les services confirmés restent séparés des offres probables à confirmer afin de donner une lecture claire du positionnement du cabinet sans mélanger preuve et hypothèse. Cette description aide un dirigeant à comprendre rapidement si le cabinet peut répondre à ses besoins courants, à comparer les expertises disponibles et à repérer les informations pratiques avant d'appeler ou de demander un rendez-vous.",
      source_id: 1,
      confidence: 92,
      is_displayable: 1,
      created_at: "2026-06-28T08:00:00.000Z",
      updated_at: "2026-06-28T08:00:00.000Z",
    } as DirectoryProfileFact,
    {
      id: 7,
      cabinet_id: card.cabinet.id,
      establishment_id: card.establishment.id,
      fact_type: "profile_summary" as DirectoryProfileFact["fact_type"],
      label: "Description orpheline",
      value: "Resume orphelin qui ne doit pas etre affiche.",
      source_id: 999,
      confidence: 92,
      is_displayable: 1,
      created_at: "2026-06-28T08:00:00.000Z",
      updated_at: "2026-06-28T08:00:00.000Z",
    },
    {
      id: 8,
      cabinet_id: card.cabinet.id,
      establishment_id: card.establishment.id,
      fact_type: "team_signal",
      label: "Equipe",
      value: "Experts-comptables mentionnes : Sandrine Jeanjacquot, Valerie Massot",
      source_id: 1,
      confidence: 88,
      is_displayable: 1,
      created_at: "2026-06-28T08:00:00.000Z",
      updated_at: "2026-06-28T08:00:00.000Z",
    },
    {
      id: 9,
      cabinet_id: card.cabinet.id,
      establishment_id: card.establishment.id,
      fact_type: "registry_status",
      label: "Annuaire professionnel",
      value: "Cabinet reference dans l'annuaire de l'Ordre des experts-comptables",
      source_id: 1,
      confidence: 92,
      is_displayable: 1,
      created_at: "2026-06-28T08:00:00.000Z",
      updated_at: "2026-06-28T08:00:00.000Z",
    },
    {
      id: 10,
      cabinet_id: card.cabinet.id,
      establishment_id: card.establishment.id,
      fact_type: "source_preview_image" as DirectoryProfileFact["fact_type"],
      label: "Apercu source",
      value: "/images/directory-previews/44110142500037-source.png",
      source_id: 1,
      confidence: 80,
      is_displayable: 1,
      created_at: "2026-06-28T08:00:00.000Z",
      updated_at: "2026-06-28T08:00:00.000Z",
    },
    {
      id: 11,
      cabinet_id: card.cabinet.id,
      establishment_id: card.establishment.id,
      fact_type: "service",
      label: "Offre probable à confirmer",
      value: "Comptabilité générale",
      source_id: 1,
      confidence: 66,
      is_displayable: 1,
      metadata_json: JSON.stringify({
        entityId: "comptabilite",
        routeSlug: "comptabilite",
        offerIds: ["tenue-comptable", "bilan-comptes-annuels"],
        displayMode: "inferred",
        description:
          "Tenue comptable, organisation des pièces, révision des comptes et préparation du bilan peuvent faire partie des besoins à explorer avec ce cabinet, compte tenu de son référencement professionnel.",
        evidenceSnippets: ["Cabinet reference dans l'annuaire de l'Ordre des experts-comptables"],
        sourcePageUrls: ["https://cabinet-fixture.example.org"],
        confidenceReason: "Inference issue d'une fiche professionnelle d'expertise comptable.",
      }),
      created_at: "2026-06-28T08:00:00.000Z",
      updated_at: "2026-06-28T08:00:00.000Z",
    } as DirectoryProfileFact,
    {
      id: 12,
      cabinet_id: card.cabinet.id,
      establishment_id: card.establishment.id,
      fact_type: "service",
      label: "Offre probable à confirmer",
      value: "Conseil fiscal",
      source_id: 1,
      confidence: 62,
      is_displayable: 1,
      metadata_json: JSON.stringify({
        entityId: "fiscalite",
        routeSlug: "fiscalite",
        offerIds: ["declarations-fiscales", "tva"],
        displayMode: "inferred",
        description:
          "Déclarations fiscales, TVA, liasse fiscale et arbitrages du dirigeant sont des sujets à qualifier lors d'un échange, car ils font partie des missions fréquemment associées à l'expertise comptable.",
        evidenceSnippets: ["Cabinet reference dans l'annuaire de l'Ordre des experts-comptables"],
        sourcePageUrls: ["https://cabinet-fixture.example.org"],
        confidenceReason: "Inference issue d'une fiche professionnelle d'expertise comptable.",
      }),
      created_at: "2026-06-28T08:00:00.000Z",
      updated_at: "2026-06-28T08:00:00.000Z",
    } as DirectoryProfileFact,
    {
      id: 13,
      cabinet_id: card.cabinet.id,
      establishment_id: card.establishment.id,
      fact_type: "software",
      label: "Logiciel mentionne",
      value: "Sage",
      source_id: 1,
      confidence: 78,
      is_displayable: 1,
      created_at: "2026-06-28T08:00:00.000Z",
      updated_at: "2026-06-28T08:00:00.000Z",
    },
  ];

  const sources: DirectoryEnrichmentSource[] = [
    {
      id: 1,
      cabinet_id: card.cabinet.id,
      establishment_id: card.establishment.id,
      source_key: "manual-pilot-example",
      source_type: "manual",
      source_url: "https://cabinet-fixture.example.org",
      retrieved_at: "2026-06-28T08:00:00.000Z",
      source_hash: null,
      parsed_ok: 1,
      robots_allowed: null,
      legal_basis: "Manual pilot source",
      raw_excerpt: "Official source checked",
      created_at: "2026-06-28T08:00:00.000Z",
    },
  ];

  const snapshot: DirectoryQualificationSnapshot = {
    id: 1,
    cabinet_id: card.cabinet.id,
    establishment_id: card.establishment.id,
    score: 90,
    professional_status: "manual_verified",
    matched_website: 1,
    matched_registry: 1,
    matched_address: 1,
    matched_siren_or_siret: 1,
    has_useful_profile_facts: 1,
    blocking_reason: null,
    snapshot_json: "{}",
    created_at: "2026-06-28T08:00:00.000Z",
  };

  const cityCode = card.city?.code_insee ?? card.establishment.city_code_insee;
  assert.ok(cityCode, "Expected city code");
  const relatedPreviewCabinet: DirectoryCabinetCard = {
    ...card,
    cabinet: {
      ...card.cabinet,
      id: card.cabinet.id + 1000,
      display_name: "Cabinet preview test",
      legal_name: "Cabinet preview test",
      oec_status: "verified",
    },
    establishment: {
      ...card.establishment,
      id: card.establishment.id + 1000,
      siret: "99999999900011",
      address_line1: "12 RUE DES TESTS",
      postal_code: "75002",
      city_name: "Paris",
    },
    sourcePreviewImageUrl: "/images/directory-previews/44110142500037-source.png",
  };

  const html = renderToStaticMarkup(
    <DirectoryProfileV2
      card={card}
      relatedCabinets={[relatedPreviewCabinet]}
      services={await sqliteAdapter.getDirectoryProfileServices()}
      professions={await sqliteAdapter.getDirectoryProfileProfessions(8)}
      enrichmentFacts={facts}
      enrichmentSources={sources}
      qualificationSnapshot={snapshot}
    />,
  );

  assert.match(html, /data-directory-hero="desktop-v2"/);
  assert.match(html, /data-directory-hero-actions="desktop-v2"/);
  assert.match(html, /lg:grid-cols-\[minmax\(0,48rem\)_minmax\(18rem,24rem\)\]/);
  assert.match(html, /lg:border-l/);
  const heroActionsIndex = html.indexOf('data-directory-hero-actions="desktop-v2"');
  assert.notEqual(heroActionsIndex, -1, "Expected hero actions");
  const heroActionsHtml = html.slice(
    heroActionsIndex,
    html.indexOf("</section>", heroActionsIndex),
  );
  assert.match(heroActionsHtml, /href="https:\/\/cabinet-fixture\.example\.org\/contact"/);
  assert.match(heroActionsHtml, />Contacter le cabinet</);
  assert.match(heroActionsHtml, /target="_blank"/);
  assert.match(heroActionsHtml, /rel="nofollow noopener noreferrer"/);
  assert.doesNotMatch(heroActionsHtml, /Demander une correction/);
  assert.match(html, /Présentation et expertises/);
  assert.match(html, /Présentation du cabinet/);
  assert.doesNotMatch(html, />À propos<\/p>/);
  assert.doesNotMatch(html, /<dt[^>]*>\s*Services\s*<\/dt>/);
  assert.doesNotMatch(html, /<dt[^>]*>\s*Équipe\s*<\/dt>/);
  assert.doesNotMatch(html, /Ce que les sources publiques permettent d'identifier/);
  assert.match(html, /Site officiel/);
  assert.match(html, /https:\/\/cabinet-fixture\.example\.org/);
  assert.match(html, /Services identifiés/);
  const servicesHeadingIndex = html.indexOf("Services identifiés");
  assert.notEqual(servicesHeadingIndex, -1, "Expected services heading");
  const servicesSectionStart = html.lastIndexOf("<section", servicesHeadingIndex);
  assert.notEqual(servicesSectionStart, -1, "Expected services section");
  const servicesSectionTag = html.slice(
    servicesSectionStart,
    html.indexOf(">", servicesSectionStart) + 1,
  );
  assert.match(servicesSectionTag, /md:col-span-2/);
  assert.doesNotMatch(servicesSectionTag, /bg-surface|p-6|shadow-sm|border-border/);
  assert.match(html, /Gestion sociale/);
  assert.match(html, /Déclarations sociales|declarations sociales/i);
  assert.match(html, /Offres probables à confirmer/);
  assert.match(html, /Comptabilité générale/);
  assert.match(html, /tenue comptable/i);
  assert.match(html, /Conseil fiscal/);
  assert.match(html, /href="\/expertises\/social"/);
  assert.match(html, /href="\/expertises\/comptabilite"/);
  assert.match(html, /href="\/expertises\/fiscalite"/);
  assert.doesNotMatch(html, /Audit non source/);
  const aboutTextWords = html
    .replaceAll(/<[^>]+>/g, " ")
    .split(/\s+/)
    .filter(Boolean);
  assert.ok(aboutTextWords.length > 250, "Expected richer SEO page content");
  assert.match(html, /01 Experts Associes accompagne les entrepreneurs/);
  assert.doesNotMatch(html, /Skoria distingue les informations explicitement sourcées/);
  assert.doesNotMatch(html, /est référencé comme cabinet comptable/);
  assert.doesNotMatch(html, /Resume orphelin/);
  assert.match(html, /Présentation du cabinet[\s\S]*\/images\/directory-previews\/44110142500037-source\.png/);
  assert.doesNotMatch(html, /À propos de 01 EXPERTS ASSOCIES/);
  assert.doesNotMatch(html, /Aperçu source/);
  assert.match(html, /Localisation/);
  assert.match(html, /data-directory-map="interactive"/);
  assert.match(html, /data-map-provider="leaflet"/);
  assert.match(html, /Itinéraire/);
  assert.match(
    html,
    /Coordonnees verifiees[\s\S]*md:grid-cols-2[\s\S]*data-directory-map="interactive"/,
  );
  assert.ok(
    html.indexOf("Coordonnees verifiees") < html.indexOf("data-directory-map=\"interactive\""),
    "Expected the interactive map to be placed below verified coordinates",
  );
  assert.doesNotMatch(html, /data-directory-map="static"/);
  assert.doesNotMatch(html, /Carte statique/);
  assert.match(html, /Équipe identifiée/);
  assert.match(html, /Sandrine Jeanjacquot/);
  assert.match(html, /Valerie Massot/);
  assert.match(html, /SJ/);
  assert.match(html, /VM/);
  assert.doesNotMatch(html, /Preuves et sources/);
  assert.doesNotMatch(html, /Annuaire professionnel: Cabinet reference/);
  assert.match(html, /Controle des donnees/);
  assert.match(html, /Logiciels mentionnés/);
  assert.match(html, /Sage/);
  assert.match(html, /src="https:\/\/www\.sage\.com\/favicon\.ico"/);
  assert.match(html, /alt="Sage"/);
  assert.ok(
    html.indexOf("Présentation et expertises") < html.indexOf("Informations légales et administratives"),
    "Expected enriched content to appear before administrative facts",
  );
  assert.match(html, /Autres cabinets comptables à Paris|Autres cabinets comptables a Paris/);
  assert.match(html, /Cabinet preview test/);
  assert.match(html, /src="\/images\/directory-previews\/44110142500037-source\.png"/);
  assert.match(html, /alt="Aperçu du site de Cabinet preview test"/);
  assert.doesNotMatch(html, /Nom du cabinet/);
  assert.doesNotMatch(html, /<div class="grid grid-cols-\[1\.2fr_1\.4fr_0\.9fr_2rem\]/);
  assert.doesNotMatch(html, /Score de qualification/);
  assert.doesNotMatch(html, /90\/100/);
  assert.doesNotMatch(html, /blocking_reason|Blocage:/);
  assert.doesNotMatch(html, /Telephone non source/);
  assert.doesNotMatch(html, /01 23 45 67 89/);
  assert.doesNotMatch(html, /Service orphelin/);
  assert.doesNotMatch(html, /Audit non source/);
  assert.doesNotMatch(html, /note moyenne|avis client|etoiles/i);

  const verifiedCard = {
    ...card,
    cabinet: {
      ...card.cabinet,
      oec_status: "manual_verified" as const,
    },
  };
  const candidateJsonLd = renderToStaticMarkup(
    <DirectoryVerifiedAccountingServiceJsonLd
      card={card}
      path="/expert-comptable/paris/sample"
      enrichmentFacts={facts}
      enrichmentSources={sources}
    />,
  );

  assert.match(candidateJsonLd, /"@type":"AccountingService"/);
  assert.match(candidateJsonLd, /"employee"/);
  assert.match(candidateJsonLd, /Sandrine Jeanjacquot/);
  assert.match(candidateJsonLd, /Valerie Massot/);

  const jsonLd = renderToStaticMarkup(
    <DirectoryVerifiedAccountingServiceJsonLd
      card={verifiedCard}
      path="/expert-comptable/paris/sample"
      enrichmentFacts={facts}
      enrichmentSources={sources}
    />,
  );

  assert.match(jsonLd, /https:\/\/cabinet-fixture\.example\.org/);
  assert.match(jsonLd, /"employee"/);
  assert.match(jsonLd, /"@type":"Person"/);
  assert.match(jsonLd, /Sandrine Jeanjacquot/);
  assert.match(jsonLd, /Valerie Massot/);
  assert.match(jsonLd, /Expert-comptable/);
  assert.doesNotMatch(jsonLd, /01 23 45 67 89/);

  console.log("Directory enrichment page OK");
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
