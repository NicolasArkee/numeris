import type { DbAdapter } from "./types";

// ─── V2: Supabase adapter (live since juin 2026) ───
// Switch back to sqliteAdapter ONLY for local CLI scripts that don't have the
// Supabase env vars (e.g. `npm run db:import-directory-candidates` writing to
// the local numeris.db before re-running migrate-supabase).
import { supabaseAdapter } from "./supabase";

export const db: DbAdapter = supabaseAdapter;

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
} from "./types";
