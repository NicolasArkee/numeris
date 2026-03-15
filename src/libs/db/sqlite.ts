import Database from "better-sqlite3";
import path from "node:path";
import { SCHEMA } from "./schema";
import type {
  DbAdapter,
  FaqItem,
  Page,
  PricingPlan,
  Service,
  TeamMember,
  Testimonial,
} from "./types";

const DB_PATH = path.join(process.cwd(), "numeris.db");

let _db: Database.Database | null = null;

function getDb(): Database.Database {
  if (!_db) {
    _db = new Database(DB_PATH);
    _db.pragma("journal_mode = WAL");
    _db.exec(SCHEMA);
  }
  return _db;
}

export const sqliteAdapter: DbAdapter = {
  getServices(): Service[] {
    return getDb()
      .prepare("SELECT * FROM services ORDER BY order_index")
      .all() as Service[];
  },

  getTeamMembers(): TeamMember[] {
    return getDb()
      .prepare("SELECT * FROM team_members ORDER BY order_index")
      .all() as TeamMember[];
  },

  getTestimonials(): Testimonial[] {
    return getDb()
      .prepare("SELECT * FROM testimonials ORDER BY id")
      .all() as Testimonial[];
  },

  getPricingPlans(): PricingPlan[] {
    return getDb()
      .prepare("SELECT * FROM pricing_plans ORDER BY order_index")
      .all() as PricingPlan[];
  },

  getFaqItems(): FaqItem[] {
    return getDb()
      .prepare("SELECT * FROM faq_items ORDER BY order_index")
      .all() as FaqItem[];
  },

  getPageBySlug(slug: string): Page | undefined {
    return getDb()
      .prepare("SELECT * FROM pages WHERE slug = ?")
      .get(slug) as Page | undefined;
  },

  getAllPages(): Page[] {
    return getDb().prepare("SELECT * FROM pages").all() as Page[];
  },
};
