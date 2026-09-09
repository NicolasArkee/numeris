export type CommercialRoute = "comparatifs" | "avis" | "codes-parrainage";

export interface CommercialPage {
  slug: string;
  route: string;
  url: string;
  archetype: string;
  silo_label: string | null;
  hub_slug: string | null;
  hub_label: string | null;
  cluster_slug: string | null;
  cluster_label: string | null;
  label: string;
  intent: string | null;
  funnel_stage: string | null;
  primary_program: string | null;
  secondary_programs: string | null;
  target_query: string | null;
  est_volume: number;
  priority_ice: number;
  publish_wave: number;
  brief_json: string | null;
  publish_status: "draft" | "review" | "published" | "archived";
}

export interface AffiliateProgram {
  slug: string;
  name: string;
  category_slug: string;
  program_type: string;
  has_affiliate: number;
  has_referral: number;
  has_apporteur: number;
  commission_display: string | null;
  recurrent: number;
  recurrent_note: string | null;
  platform: string | null;
  target_audience: string | null;
  scale_public: string | null;
  source_url: string | null;
  affiliate_url: string | null;
  notes: string | null;
  /** Champs obligatoires avant exposition publique d'un fait commercial. */
  retrieved_at?: string | null;
  fact_status?: "verified" | "to-confirm" | "expired" | null;
}

export interface PageProgram extends AffiliateProgram {
  rank: number;
  is_primary: number;
}

export interface CommercialLinkEdge {
  target_slug: string;
  target_route: string | null;
  edge_type: string;
}

export interface PublishedCommercialPage {
  route: string;
  slug: string;
  url: string;
}
