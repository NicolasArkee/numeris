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
import type {
  DbAdapter,
  FaqItem,
  Page,
  PricingPlan,
  Service,
  TeamMember,
  Testimonial,
} from "./types";

/*
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!,
);
*/

export const supabaseAdapter: DbAdapter = {
  getServices(): Service[] {
    // const { data } = await supabase.from("services").select("*").order("order_index");
    // return data ?? [];
    throw new Error("Supabase adapter not configured. See migration steps in this file.");
  },

  getTeamMembers(): TeamMember[] {
    throw new Error("Supabase adapter not configured.");
  },

  getTestimonials(): Testimonial[] {
    throw new Error("Supabase adapter not configured.");
  },

  getPricingPlans(): PricingPlan[] {
    throw new Error("Supabase adapter not configured.");
  },

  getFaqItems(): FaqItem[] {
    throw new Error("Supabase adapter not configured.");
  },

  getPageBySlug(_slug: string): Page | undefined {
    throw new Error("Supabase adapter not configured.");
  },

  getAllPages(): Page[] {
    throw new Error("Supabase adapter not configured.");
  },
};
