import type { DbAdapter } from "./types";

// ─── V2: Supabase adapter (live since juin 2026) ───
// Le flag explicite sert aux audits et previews locaux lorsque le CMS distant
// n'est pas joignable. Supabase reste le choix par défaut en production.
import { supabaseAdapter } from "./supabase";
import { sqliteAdapter } from "./sqlite";

export const db: DbAdapter =
  process.env.SKORIA_DB_ADAPTER === "sqlite" ? sqliteAdapter : supabaseAdapter;

export type { DbAdapter } from "./types";
export type {
  Service,
  TeamMember,
  Testimonial,
  PricingPlan,
  PricingTier,
  FaqItem,
  Page,
  Silo,
  Hub,
  Cluster,
  KeywordPage,
  Ville,
  Departement,
  Secteur,
  KgEdge,
  LinkGroup,
  ProfessionCategory,
  Profession,
  PageSection,
  SeoOverride,
  PageMeta,
  MaillageLink,
  PublishStatus,
  DirectoryCabinet,
  DirectoryEstablishment,
  DirectoryCity,
  DirectoryCabinetCard,
  DirectoryEnrichmentSourceType,
  DirectoryProfileFactType,
  DirectoryEnrichmentSource,
  DirectoryProfileFact,
  DirectoryQualificationSnapshot,
  DirectoryCityEnrichmentStats,
} from "./types";
