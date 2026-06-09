// ─── Conventions de clés (route, slug) des tables page_sections /
// seo_overrides / page_meta ───
//
// La pipeline de génération (ARKEE_ORG numeris_pipeline/06_persist_db) écrit
// les pages croisées expertises sous la clé composite
// `{service}__{type}__{dimension}` (ex: `audit__profession__avocats`).
// Le format est collision-proof : un même slug de dimension peut exister à la
// fois en secteur et en profession (ex: `immobilier`).
// Toute lecture côté app DOIT passer par ce helper — ne jamais reconstruire
// la clé à la main.

export type ExpertiseDimType = "profession" | "secteur" | "ville";

export const expertisesSlugKey = (
  service: string,
  type: ExpertiseDimType,
  dimension: string,
) => `${service}__${type}__${dimension}`;
