// Smoke-check de la couche commerciale sur une copie temporaire de SQLite.
// La base du depot reste strictement en lecture seule pendant ce controle.
import assert from "node:assert/strict";
import Database from "better-sqlite3";
import { copyFileSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import {
  getCommercialSegments,
  getCommercialPageBySegment,
  getPagePrograms,
  getCommercialLinks,
  getPublishedCommercialPages,
} from "../src/libs/content/commercial";

const ORIGINAL_DB_ENV = process.env.NUMERIS_DB;
const SOURCE_DB = ORIGINAL_DB_ENV ?? path.join(process.cwd(), "numeris.db");
const SAMPLE = "meilleur-compte-pro";

function ensureProgramProvenanceColumns(database: Database.Database): void {
  const columns = new Set(
    (database.prepare("PRAGMA table_info(affiliate_programs)").all() as { name: string }[])
      .map((column) => column.name),
  );
  if (!columns.has("fact_status")) {
    database.exec("ALTER TABLE affiliate_programs ADD COLUMN fact_status TEXT");
  }
  if (!columns.has("retrieved_at")) {
    database.exec("ALTER TABLE affiliate_programs ADD COLUMN retrieved_at TEXT");
  }
}

async function main(): Promise<void> {
  const tempDir = mkdtempSync(path.join(tmpdir(), "skoria-commercial-check-"));
  const tempDb = path.join(tempDir, "numeris.db");
  copyFileSync(SOURCE_DB, tempDb);
  process.env.NUMERIS_DB = tempDb;

  try {
    const fixtureDb = new Database(tempDb);
    let verifiedProgramSlug = "";
    try {
      ensureProgramProvenanceColumns(fixtureDb);
      fixtureDb.prepare("UPDATE commercial_pages SET publish_status='published' WHERE slug=?").run(SAMPLE);
      const linkedTarget = fixtureDb.prepare(
        `SELECT target.slug
         FROM commercial_links edge
         JOIN commercial_pages target ON target.slug = edge.target_slug
         WHERE edge.source_slug = ?
         ORDER BY edge.weight DESC, target.slug ASC
         LIMIT 1`,
      ).get(SAMPLE) as { slug: string } | undefined;
      assert.ok(linkedTarget, `Expected ${SAMPLE} to have a commercial page target`);
      fixtureDb.prepare("UPDATE commercial_pages SET publish_status='published' WHERE slug=?")
        .run(linkedTarget.slug);

      const linkedProgram = fixtureDb.prepare(
        `SELECT program.slug
         FROM page_affiliate_programs link
         JOIN affiliate_programs program ON program.slug = link.program_slug
         WHERE link.route = 'comparatifs'
           AND link.page_slug = ?
           AND program.is_active = 1
           AND program.source_url IS NOT NULL
           AND program.source_url <> ''
         ORDER BY link.rank ASC
         LIMIT 1`,
      ).get(SAMPLE) as { slug: string } | undefined;
      assert.ok(linkedProgram, `Expected ${SAMPLE} to have a sourced active program`);
      verifiedProgramSlug = linkedProgram.slug;

      fixtureDb.prepare(
        `UPDATE affiliate_programs
         SET fact_status = 'to-confirm', retrieved_at = NULL
         WHERE slug IN (
           SELECT program_slug
           FROM page_affiliate_programs
           WHERE route = 'comparatifs' AND page_slug = ?
         )`,
      ).run(SAMPLE);
      fixtureDb.prepare(
        `UPDATE affiliate_programs
         SET fact_status = 'verified', retrieved_at = ?
         WHERE slug = ?`,
      ).run(new Date().toISOString(), verifiedProgramSlug);
    } finally {
      fixtureDb.close();
    }

    const segs = await getCommercialSegments("comparatifs");
    console.log("segments comparatifs (published only):", segs);
    const page = await getCommercialPageBySegment("comparatifs", SAMPLE);
    console.log("page:", page?.label, "| url:", page?.url, "| hub:", page?.hub_label);
    const progs = await getPagePrograms("comparatifs", SAMPLE);
    console.log(
      "programs:",
      progs.map((p) => `${p.name}${p.is_primary ? "★" : ""}`).join(", "),
    );
    console.log(
      "first program commission:",
      progs[0]?.commission_display,
      "| url:",
      progs[0]?.affiliate_url ?? progs[0]?.source_url,
    );
    const links = await getCommercialLinks(SAMPLE);
    console.log("link groups:", links.map((g) => `${g.title}(${g.links.length})`).join(", "));
    const publishedPages = await getPublishedCommercialPages();
    console.log("published total:", publishedPages.length);

    assert.ok(segs.includes(SAMPLE), "Published fixture should be listed as a route segment");
    assert.ok(page, "Published fixture should be readable by route and segment");
    assert.ok(links.length > 0, "Published linked fixture should produce a commercial link group");
    assert.ok(
      progs.some((program) => program.slug === verifiedProgramSlug),
      "Published fixture should expose its current verified program",
    );

    const staleFixtureDb = new Database(tempDb);
    try {
      staleFixtureDb.prepare(
        "UPDATE affiliate_programs SET retrieved_at = ? WHERE slug = ?",
      ).run("2000-01-01T00:00:00.000Z", verifiedProgramSlug);
    } finally {
      staleFixtureDb.close();
    }
    const stalePrograms = await getPagePrograms("comparatifs", SAMPLE);
    assert.ok(
      stalePrograms.every((program) => program.slug !== verifiedProgramSlug),
      "A verified program with an expired retrieval date must stay private",
    );
    console.log("✅ commercial read-path OK");
  } finally {
    rmSync(tempDir, { recursive: true, force: true });
    if (ORIGINAL_DB_ENV === undefined) delete process.env.NUMERIS_DB;
    else process.env.NUMERIS_DB = ORIGINAL_DB_ENV;
    console.log("removed temporary database copy.");
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
