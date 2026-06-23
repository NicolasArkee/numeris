// Smoke-check de la couche commerciale : publie 1 page temporairement, exerce
// tous les helpers lus par les templates, puis remet en draft. Read-path only.
import Database from "better-sqlite3";
import path from "node:path";
import {
  getCommercialSegments,
  getCommercialPageBySegment,
  getPagePrograms,
  getCommercialLinks,
  getPublishedCommercialPages,
} from "../src/libs/content/commercial";

const DB = path.join(process.cwd(), "numeris.db");
const SAMPLE = "meilleur-compte-pro";

const w = new Database(DB);
w.pragma("journal_mode = WAL");
w.prepare("UPDATE commercial_pages SET publish_status='published' WHERE slug=?").run(SAMPLE);
w.close();

try {
  const segs = getCommercialSegments("comparatifs");
  console.log("segments comparatifs (published only):", segs);
  const page = getCommercialPageBySegment("comparatifs", SAMPLE);
  console.log("page:", page?.label, "| url:", page?.url, "| hub:", page?.hub_label);
  const progs = getPagePrograms("comparatifs", SAMPLE);
  console.log(
    "programs:",
    progs.map((p) => `${p.name}${p.is_primary ? "★" : ""}`).join(", "),
  );
  console.log("first program commission:", progs[0]?.commission_display, "| url:", progs[0]?.affiliate_url ?? progs[0]?.source_url);
  const links = getCommercialLinks(SAMPLE);
  console.log("link groups:", links.map((g) => `${g.title}(${g.links.length})`).join(", "));
  console.log("published total:", getPublishedCommercialPages().length);

  const ok =
    segs.includes(SAMPLE) &&
    !!page &&
    progs.length > 0 &&
    links.length > 0;
  console.log(ok ? "✅ commercial read-path OK" : "❌ read-path check failed");
} finally {
  const w2 = new Database(DB);
  w2.prepare("UPDATE commercial_pages SET publish_status='draft' WHERE slug=?").run(SAMPLE);
  w2.close();
  console.log("reverted sample to draft.");
}
