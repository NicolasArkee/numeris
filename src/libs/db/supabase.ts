/**
 * ─── V2: Supabase adapter ───
 *
 * Migration steps:
 * 1. npm install @supabase/supabase-js
 * 2. Set SUPABASE_URL and SUPABASE_ANON_KEY in .env
 * 3. Run the SQL from schema.ts in Supabase SQL editor
 * 4. Run: npm run db:migrate:supabase  (exports SQLite → Supabase)
 * 5. Update src/libs/db/index.ts to import { supabaseAdapter } instead of sqliteAdapter
 */

// import { createClient } from "@supabase/supabase-js";
import type { DbAdapter } from "./types";

/*
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!,
);
*/

const notConfigured = () => {
  throw new Error("Supabase adapter not configured. See migration steps in this file.");
};

export const supabaseAdapter: DbAdapter = {
  getServices: notConfigured,
  getTeamMembers: notConfigured,
  getTestimonials: notConfigured,
  getPricingPlans: notConfigured,
  getFaqItems: notConfigured,
  getPageBySlug: notConfigured,
  getAllPages: notConfigured,
  getSilos: notConfigured,
  getSiloBySlug: notConfigured,
  getHubsBySilo: notConfigured,
  getHubBySlug: notConfigured,
  getClustersByHub: notConfigured,
  getClusterBySlug: notConfigured,
  getKeywordsByCluster: notConfigured,
  getKeywordBySlug: notConfigured,
  getVilles: notConfigured,
  getVilleBySlug: notConfigured,
  getDepartements: notConfigured,
  getDepartementBySlug: notConfigured,
  getSecteurs: notConfigured,
  getSecteurBySlug: notConfigured,
  getServiceSecteurs: notConfigured,
  getServiceVilles: notConfigured,
  getServiceProfessions: notConfigured,
  getProfessionCategories: notConfigured,
  getProfessionCategoryBySlug: notConfigured,
  getProfessionsByCategory: notConfigured,
  getProfessions: notConfigured,
  getProfessionBySlug: notConfigured,
  getEdgesFrom: notConfigured,
  getEdgesTo: notConfigured,
};
