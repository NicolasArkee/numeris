import type { DbAdapter } from "./types";

// ─── V1: SQLite local ───
// ─── V2: Swap this import for Supabase adapter ───
import { sqliteAdapter } from "./sqlite";

export const db: DbAdapter = sqliteAdapter;

export type { DbAdapter } from "./types";
export type {
  Service,
  TeamMember,
  Testimonial,
  PricingPlan,
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
} from "./types";
