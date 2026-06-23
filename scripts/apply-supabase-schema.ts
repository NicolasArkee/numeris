/**
 * Apply the Postgres schema to Supabase via direct pg connection.
 *
 * Usage:
 *   1. Set SUPABASE_DB_URL in .env.local (Dashboard → Settings → Database → Connection string → URI)
 *      Format: postgres://postgres.<ref>:<password>@aws-0-<region>.pooler.supabase.com:5432/postgres
 *   2. Run: npx tsx scripts/apply-supabase-schema.ts
 *
 * The script:
 *   - Reads src/libs/db/schema-supabase.sql
 *   - Splits on semicolons at statement boundaries
 *   - Executes each statement, logging success/error
 *   - Continues on error (e.g. "table already exists") so re-runs are safe
 */

import dotenv from "dotenv";
import fs from "node:fs";
import path from "node:path";
import { Client } from "pg";

// Load .env.local first (Next.js convention), fallback to .env.
dotenv.config({ path: path.join(process.cwd(), ".env.local") });
dotenv.config();

const SCHEMA_PATH = path.join(
  process.cwd(),
  "src/libs/db/schema-supabase.sql",
);

function splitStatements(sql: string): string[] {
  // Naive splitter — handles `;` outside of single quotes and dollar-quoted
  // strings ($func$...$func$). Sufficient for our generated DDL.
  const out: string[] = [];
  let buf = "";
  let inSingle = false;
  let inDollar = false;
  let dollarTag = "";
  for (let i = 0; i < sql.length; i++) {
    const ch = sql[i];
    const rest = sql.slice(i);
    if (!inSingle && !inDollar) {
      const m = rest.match(/^\$([A-Za-z_]*)\$/);
      if (m) {
        inDollar = true;
        dollarTag = m[0];
        buf += dollarTag;
        i += dollarTag.length - 1;
        continue;
      }
    }
    if (inDollar) {
      if (rest.startsWith(dollarTag)) {
        inDollar = false;
        buf += dollarTag;
        i += dollarTag.length - 1;
        continue;
      }
      buf += ch;
      continue;
    }
    if (ch === "'") inSingle = !inSingle;
    if (ch === ";" && !inSingle) {
      const stmt = buf.trim();
      if (stmt) out.push(stmt);
      buf = "";
      continue;
    }
    buf += ch;
  }
  const tail = buf.trim();
  if (tail) out.push(tail);
  return out;
}

async function main() {
  const url = process.env.SUPABASE_DB_URL;
  if (!url) {
    console.error(
      "SUPABASE_DB_URL is not set. Get it from Supabase Dashboard → Settings → Database → Connection string → URI.\n" +
        "Add to .env.local then re-run.",
    );
    process.exit(1);
  }

  if (!fs.existsSync(SCHEMA_PATH)) {
    console.error(`Schema file not found: ${SCHEMA_PATH}`);
    console.error("Run the schema codegen workflow first.");
    process.exit(1);
  }

  const sql = fs.readFileSync(SCHEMA_PATH, "utf8");
  const statements = splitStatements(sql);
  console.log(`Loaded ${statements.length} SQL statements from ${SCHEMA_PATH}`);

  const client = new Client({
    connectionString: url,
    ssl: { rejectUnauthorized: false },
  });
  await client.connect();
  console.log("Connected to Supabase Postgres");

  let ok = 0;
  let skipped = 0;
  let failed = 0;

  for (const [i, stmt] of statements.entries()) {
    const preview = stmt.slice(0, 80).replace(/\s+/g, " ");
    try {
      await client.query(stmt);
      ok++;
      if (i % 20 === 0) console.log(`  [${i + 1}/${statements.length}] ${preview}`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      // Tolerate "already exists" so re-runs are idempotent.
      if (/already exists|relation .* already exists|duplicate/i.test(msg)) {
        skipped++;
      } else {
        failed++;
        console.error(`  ❌ [${i + 1}] ${preview}`);
        console.error(`     ${msg}`);
      }
    }
  }

  await client.end();
  console.log(
    `\nDone. ok=${ok}  skipped=${skipped}  failed=${failed}  total=${statements.length}`,
  );
  process.exit(failed > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
