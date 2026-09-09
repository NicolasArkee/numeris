import Database from "better-sqlite3";
import path from "node:path";
import { getSupabaseClient } from "@/libs/db/supabase";
import type {
  CommercialLinkEdge,
  CommercialPage,
  CommercialRoute,
  PageProgram,
  PublishedCommercialPage,
} from "./commercial-types";

interface CommercialStore {
  getSegments(route: CommercialRoute): Promise<string[]>;
  getPageByRouteUrl(route: CommercialRoute, url: string): Promise<CommercialPage | undefined>;
  getPageBySlug(slug: string): Promise<CommercialPage | undefined>;
  getPagePrograms(route: string, pageSlug: string): Promise<PageProgram[]>;
  getEdges(slug: string): Promise<CommercialLinkEdge[]>;
  getPublishedTargets(slugs: string[]): Promise<CommercialPage[]>;
  getPublishedPages(): Promise<PublishedCommercialPage[]>;
}

function segmentOf(url: string): string {
  const parts = url.split("/").filter(Boolean);
  return parts.at(-1) ?? "";
}

let sqlite: Database.Database | null = null;
let sqlitePath = "";

function getSqlite(): Database.Database {
  const requestedPath = process.env.NUMERIS_DB ?? path.join(process.cwd(), "numeris.db");
  if (!sqlite || sqlitePath !== requestedPath) {
    sqlite?.close();
    sqlite = new Database(requestedPath, { readonly: true, fileMustExist: true });
    sqlitePath = requestedPath;
  }
  return sqlite;
}

const sqliteStore: CommercialStore = {
  async getSegments(route) {
    return (getSqlite().prepare("SELECT url FROM commercial_pages WHERE route = ? AND publish_status = 'published'").all(route) as { url: string }[])
      .map((row) => segmentOf(row.url));
  },
  async getPageByRouteUrl(route, url) {
    return getSqlite().prepare("SELECT * FROM commercial_pages WHERE route = ? AND url = ? AND publish_status = 'published'").get(route, url) as CommercialPage | undefined;
  },
  async getPageBySlug(slug) {
    return getSqlite().prepare("SELECT * FROM commercial_pages WHERE slug = ? AND publish_status = 'published'").get(slug) as CommercialPage | undefined;
  },
  async getPagePrograms(route, pageSlug) {
    return getSqlite().prepare(
      `SELECT program.*, link.rank, link.is_primary
       FROM page_affiliate_programs link
       JOIN affiliate_programs program ON program.slug = link.program_slug
       WHERE link.route = ? AND link.page_slug = ? AND program.is_active = 1
       ORDER BY link.rank ASC`,
    ).all(route, pageSlug) as PageProgram[];
  },
  async getEdges(slug) {
    return getSqlite().prepare("SELECT target_slug, target_route, edge_type FROM commercial_links WHERE source_slug = ?").all(slug) as CommercialLinkEdge[];
  },
  async getPublishedTargets(slugs) {
    if (slugs.length === 0) return [];
    const placeholders = slugs.map(() => "?").join(",");
    return getSqlite().prepare(`SELECT * FROM commercial_pages WHERE slug IN (${placeholders}) AND publish_status = 'published'`).all(...slugs) as CommercialPage[];
  },
  async getPublishedPages() {
    return getSqlite().prepare("SELECT route, slug, url FROM commercial_pages WHERE publish_status = 'published'").all() as PublishedCommercialPage[];
  },
};

const supabaseStore: CommercialStore = {
  async getSegments(route) {
    const { data, error } = await getSupabaseClient().from("commercial_pages").select("url").eq("route", route).eq("publish_status", "published");
    if (error || !data) return [];
    return data.map((row) => segmentOf((row as { url: string }).url));
  },
  async getPageByRouteUrl(route, url) {
    const { data } = await getSupabaseClient().from("commercial_pages").select("*").eq("route", route).eq("url", url).eq("publish_status", "published").maybeSingle();
    return (data ?? undefined) as CommercialPage | undefined;
  },
  async getPageBySlug(slug) {
    const { data } = await getSupabaseClient().from("commercial_pages").select("*").eq("slug", slug).eq("publish_status", "published").maybeSingle();
    return (data ?? undefined) as CommercialPage | undefined;
  },
  async getPagePrograms(route, pageSlug) {
    const client = getSupabaseClient();
    const { data: links } = await client.from("page_affiliate_programs").select("program_slug, rank, is_primary").eq("route", route).eq("page_slug", pageSlug).order("rank", { ascending: true });
    if (!links || links.length === 0) return [];
    const slugs = links.map((link) => (link as { program_slug: string }).program_slug);
    const { data: programs } = await client.from("affiliate_programs").select("*").in("slug", slugs).eq("is_active", 1);
    const bySlug = new Map((programs ?? []).map((program) => [(program as PageProgram).slug, program as PageProgram]));
    return (links as { program_slug: string; rank: number; is_primary: number }[])
      .filter((link) => bySlug.has(link.program_slug))
      .map((link) => ({ ...bySlug.get(link.program_slug)!, rank: link.rank, is_primary: link.is_primary }));
  },
  async getEdges(slug) {
    const { data } = await getSupabaseClient().from("commercial_links").select("target_slug, target_route, edge_type").eq("source_slug", slug);
    return (data ?? []) as CommercialLinkEdge[];
  },
  async getPublishedTargets(slugs) {
    if (slugs.length === 0) return [];
    const { data } = await getSupabaseClient().from("commercial_pages").select("*").in("slug", slugs).eq("publish_status", "published");
    return (data ?? []) as CommercialPage[];
  },
  async getPublishedPages() {
    const { data } = await getSupabaseClient().from("commercial_pages").select("route, slug, url").eq("publish_status", "published");
    return (data ?? []) as PublishedCommercialPage[];
  },
};

export const commercialStore: CommercialStore =
  process.env.SKORIA_DB_ADAPTER === "sqlite" ? sqliteStore : supabaseStore;
