/**
 * Migration script: SQLite → Supabase
 *
 * Usage:
 *   1. npm install @supabase/supabase-js
 *   2. Set SUPABASE_URL and SUPABASE_ANON_KEY in .env
 *   3. Run schema SQL in Supabase dashboard
 *   4. Run: npm run db:migrate:supabase
 */

import Database from "better-sqlite3";
import path from "node:path";
// import { createClient } from "@supabase/supabase-js";

const DB_PATH = path.join(process.cwd(), "numeris.db");

async function migrate() {
  const db = new Database(DB_PATH, { readonly: true });

  // const supabase = createClient(
  //   process.env.SUPABASE_URL!,
  //   process.env.SUPABASE_ANON_KEY!,
  // );

  const tables = [
    "services",
    "team_members",
    "testimonials",
    "pricing_plans",
    "faq_items",
    "pages",
  ];

  for (const table of tables) {
    const rows = db.prepare(`SELECT * FROM ${table}`).all();
    console.log(`Migrating ${table}: ${rows.length} rows...`);

    // Uncomment when Supabase is configured:
    // const { error } = await supabase.from(table).upsert(rows);
    // if (error) {
    //   console.error(`  ❌ Error migrating ${table}:`, error.message);
    // } else {
    //   console.log(`  ✅ ${table} migrated`);
    // }
  }

  db.close();
  console.log("\n✅ Migration complete");
}

migrate().catch(console.error);
