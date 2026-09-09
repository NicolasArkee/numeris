// ─── DynamicSection ───
// Renders a single PageSection row (from DB: numeris.page_sections) by
// dispatching on `section_type` to the matching presentational component.
//
// Server component (no state / no client-only APIs) so it stays SSG-friendly.
// Commercial pricing is deliberately replaced by a scope-comparison prompt
// unless a dedicated, current and sourced commercial surface owns the fact.
//
// Contract :
//  - section.items     : JSON-encoded array, shape depends on section_type
//                        (string[] for most; {q,a}[] for Faq; objects with
//                        polymorphic shapes for the V2 sections).
//  - section.citations : JSON-encoded array of {text, url, source}, optional.
//  - Unknown section_type fallbacks to a plain <section><h2>...</h2><p>...</p>.
//
// This is the read path: the pipeline writes well-typed JSON, but we still
// parse defensively because the same column can be re-written by future
// generators with looser shapes.

import { ContentSection } from "./ContentSection";
import React from "react";
import { RichText } from "./RichText";
import { HonorairesSimulator } from "./simulateurs/HonorairesSimulator";
import { StatutsSimulator } from "./simulateurs/StatutsSimulator";
import { ImmobilierSimulator } from "./simulateurs/ImmobilierSimulator";
import { BenefitsGrid } from "./BenefitsGrid";
import { Checklist } from "./Checklist";
import { AlertBox } from "./AlertBox";
import { KeyTakeaways } from "./KeyTakeaways";
import { DefinitionBox } from "./DefinitionBox";
import { NumberedSteps } from "./NumberedSteps";
import { QuoteBlock } from "./QuoteBlock";
import { StatHighlight } from "./StatHighlight";
import { SimulatorTeaser } from "./SimulatorTeaser";
import { ProcessSteps } from "./ProcessSteps";
import { ProsCons } from "./ProsCons";
import { RichTable } from "./RichTable";
import { TableOfContents } from "./TableOfContents";
import { IconSet, isSupportedIcon } from "./IconSet";
import { FaqAccordion } from "./editorial/FaqAccordion";
import {
  EDITORIAL_HEADING,
  EDITORIAL_FOCUS,
  EditorialArrow,
  EditorialCheck,
} from "./editorial/EditorialElements";
import type { IconName } from "./IconSet";
import { FaqJsonLd } from "./JsonLd";
import type { PageSection } from "@/libs/db";
import { normalizeAnchorId } from "@/libs/skoria-v2/model";
import {
  sanitizeLegacyPublicText,
  sanitizeLegacyPublicValue,
} from "@/libs/skoria-v2/content-safety";
import { BriefTrigger } from "@/components/journey/BriefTrigger";

// ─── Parsed shapes for items column ───
interface Citation {
  text: string;
  url: string;
  source: string;
}

interface FaqEntry {
  q: string;
  a: string;
}

interface InternalLinkEntry {
  label: string;
  href?: string;
}

const GENERATED_PROSE_SHELL = "mx-auto max-w-[48rem]";
const GENERATED_WIDE_TEXT_SHELL = "max-w-[72rem]";
const GENERATED_PROSE_TEXT = "max-w-none";
const GENERATED_EDITORIAL_GRID_TEXT = "max-w-none";

function isWideEditorialText(section: PageSection): boolean {
  return (
    section.section_type === "ContentSection" && section.route === "professions"
  );
}

// ─── Defensive JSON.parse → unknown (never throws) ───
function safeParse(raw: string | null): unknown {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as unknown;
  } catch {
    return null;
  }
}

function asStringArray(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  return v.filter((x): x is string => typeof x === "string");
}

function asObjectArray(v: unknown): Record<string, unknown>[] {
  if (!Array.isArray(v)) return [];
  return v.filter(
    (x): x is Record<string, unknown> =>
      typeof x === "object" && x !== null && !Array.isArray(x),
  );
}

function asFaqArray(v: unknown): FaqEntry[] {
  if (!Array.isArray(v)) return [];
  const out: FaqEntry[] = [];
  for (const entry of v) {
    if (entry === null || typeof entry !== "object") continue;
    const obj = entry as Record<string, unknown>;
    const q = (obj.q ?? obj.question) as unknown;
    const a = (obj.a ?? obj.answer) as unknown;
    if (
      typeof q === "string" &&
      typeof a === "string" &&
      q.trim() &&
      a.trim()
    ) {
      out.push({ q, a });
    }
  }
  return out;
}

/** RichTable items shape: { headers: string[], rows: string[][] } — defensive coercion. */
function asRichTable(v: unknown): { headers: string[]; rows: string[][] } {
  if (v === null || typeof v !== "object" || Array.isArray(v))
    return { headers: [], rows: [] };
  const obj = v as Record<string, unknown>;
  const headers = asStringArray(obj.headers);
  const rawRows = Array.isArray(obj.rows) ? obj.rows : [];
  const rows: string[][] = [];
  for (const row of rawRows) {
    if (!Array.isArray(row)) continue;
    const cells = row.map((c) =>
      typeof c === "string" ? c : c == null ? "" : String(c),
    );
    // normalise la largeur des lignes sur le nombre d'en-têtes
    while (headers.length && cells.length < headers.length) cells.push("");
    rows.push(headers.length ? cells.slice(0, headers.length) : cells);
  }
  return { headers, rows };
}

function scalarCell(value: unknown): string | null {
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  if (typeof value === "boolean") return value ? "Oui" : "Non";
  if (value === null || value === undefined) return "";
  return null;
}

const COMPARISON_HEADER_LABELS: Record<string, string> = {
  label: "Critère",
  criterion: "Critère",
  critere: "Critère",
  title: "Critère",
  name: "Option",
  value: "Valeur",
  valueA: "Option A",
  valueB: "Option B",
  description: "Détail",
};

function comparisonHeader(key: string): string {
  return (
    COMPARISON_HEADER_LABELS[key] ??
    key
      .replace(/([a-z])([A-Z])/g, "$1 $2")
      .replace(/[_-]+/g, " ")
      .replace(/^./, (letter) => letter.toUpperCase())
  );
}

/**
 * Comparison imports exist in three historical shapes. Normalize the rich
 * table object as well as record arrays such as {label,valueA,valueB}.
 */
function coerceComparisonTable(
  value: unknown,
): { headers: string[]; rows: string[][] } | null {
  if (isRecord(value)) {
    const explicitHeaders = asStringArray(value.headers ?? value.columns);
    const rawRows = Array.isArray(value.rows) ? value.rows : [];
    if (explicitHeaders.length > 0 && rawRows.length > 0) {
      const rows = rawRows
        .map((row) => {
          if (Array.isArray(row))
            return row
              .map(scalarCell)
              .filter((cell): cell is string => cell !== null);
          if (isRecord(row)) {
            return Object.values(row)
              .map(scalarCell)
              .filter((cell): cell is string => cell !== null);
          }
          return [];
        })
        .filter((row) => row.length > 0)
        .map((row) => {
          const normalized = row.slice(0, explicitHeaders.length);
          while (normalized.length < explicitHeaders.length)
            normalized.push("");
          return normalized;
        });
      return rows.length > 0 ? { headers: explicitHeaders, rows } : null;
    }
  }

  const records = asObjectArray(value);
  if (records.length === 0) return null;
  const keys: string[] = [];
  for (const record of records) {
    for (const [key, cell] of Object.entries(record)) {
      if (keys.includes(key) || scalarCell(cell) === null) continue;
      keys.push(key);
      if (keys.length === 6) break;
    }
    if (keys.length === 6) break;
  }
  if (keys.length < 2) return null;
  const rows = records.map((record) =>
    keys.map((key) => scalarCell(record[key]) ?? ""),
  );
  return { headers: keys.map(comparisonHeader), rows };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function internalHref(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const href = value.trim();
  if (!href.startsWith("/") || href.startsWith("//")) return undefined;
  return href;
}

function labelFromInternalHref(href: string): string {
  const leaf =
    href.split(/[?#]/, 1)[0]?.split("/").filter(Boolean).at(-1) ?? href;
  try {
    return decodeURIComponent(leaf)
      .replace(/[-_]+/g, " ")
      .replace(/^./, (letter) => letter.toUpperCase());
  } catch {
    return leaf.replace(/[-_]+/g, " ");
  }
}

function coerceInternalLinks(value: unknown): InternalLinkEntry[] {
  if (!Array.isArray(value)) return [];
  const links: InternalLinkEntry[] = [];
  const seen = new Set<string>();
  for (const raw of value) {
    let label = "";
    let href: string | undefined;
    if (typeof raw === "string") {
      href = internalHref(raw);
      label = href ? labelFromInternalHref(href) : raw.trim();
    } else if (isRecord(raw)) {
      href = internalHref(raw.href ?? raw.url ?? raw.target_url);
      const route =
        typeof raw.route === "string"
          ? raw.route.replace(/^\/+|\/+$/g, "")
          : "";
      const slug =
        typeof raw.slug === "string" ? raw.slug.replace(/^\/+|\/+$/g, "") : "";
      if (!href && route && slug) href = `/${route}/${slug}`;
      const rawLabel = raw.label ?? raw.title ?? raw.anchor;
      label =
        typeof rawLabel === "string"
          ? rawLabel.trim()
          : href
            ? labelFromInternalHref(href)
            : "";
    }
    if (!label) continue;
    const key = href ?? label;
    if (seen.has(key)) continue;
    seen.add(key);
    links.push({ label, ...(href ? { href } : {}) });
  }
  return links;
}

function asCitations(v: unknown): Citation[] {
  if (!Array.isArray(v)) return [];
  const out: Citation[] = [];
  for (const entry of v) {
    if (
      entry !== null &&
      typeof entry === "object" &&
      "text" in entry &&
      "url" in entry &&
      "source" in entry &&
      typeof (entry as { text: unknown }).text === "string" &&
      typeof (entry as { url: unknown }).url === "string" &&
      typeof (entry as { source: unknown }).source === "string"
    ) {
      out.push({
        text: (entry as { text: string }).text,
        url: (entry as { url: string }).url,
        source: (entry as { source: string }).source,
      });
    }
  }
  return out;
}

// ─── Heuristic: split a flat string into {title, description} for cards ───
// Gemini emits BenefitsGrid `items` as flat strings "Title : description".
// We split on the first " : " (NBSP-tolerant) and fall back to the full
// string as both title and description when no delimiter is found.
function splitTitled(item: string): { title: string; description: string } {
  const match = item.match(/^(.{2,80}?)\s*[:：]\s+(.+)$/u);
  if (match) {
    return { title: match[1]!.trim(), description: match[2]!.trim() };
  }
  // No delimiter — use first sentence as title, rest as description.
  const dot = item.indexOf(".");
  if (dot > 0 && dot < 90) {
    return {
      title: item.slice(0, dot).trim(),
      description: item.slice(dot + 1).trim() || item,
    };
  }
  return { title: item, description: item };
}

// ─── Citations footnote block ───
function isVisibleCitation(citation: Citation) {
  return Boolean(citation.url && !citation.url.toLowerCase().includes("/stub") && !citation.text.toLowerCase().includes("stub"));
}

function CitationsFooter({
  citations,
  wide = false,
}: {
  citations: Citation[];
  wide?: boolean;
}) {
  const safeCitations = citations.filter(isVisibleCitation);
  if (!safeCitations.length) return null;
  return (
    <aside
      className={`${wide ? GENERATED_WIDE_TEXT_SHELL : GENERATED_PROSE_SHELL} mb-10 mt-4 rounded-2xl border border-ink/10 bg-white/70 p-5`}
      aria-label="Sources de cette section"
      data-editorial-sources
    >
      <p className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[.12em] text-blue">
        <IconSet name="book" size={16} /> Sources
      </p>
      <ul className="grid gap-2">
        {safeCitations.map((citation) => (
          <li
            key={`${citation.source}-${citation.url}`}
            className="text-xs leading-5 text-ink-muted"
          >
            <a
              href={citation.url}
              target="_blank"
              rel="noopener nofollow noreferrer"
              className={`break-words underline decoration-blue/30 underline-offset-4 transition-colors hover:text-blue ${EDITORIAL_FOCUS}`}
            >
              {citation.text || citation.source}
            </a>
            {citation.source && (
              <span className="ml-2">({citation.source})</span>
            )}
          </li>
        ))}
      </ul>
    </aside>
  );
}

// ─── Inline Faq fallback ───
// The existing <Faq> component renders a full-page section with sidebar +
// CTA and expects DB FaqItem rows (numeric id). For inline DB-driven Faq
// sections we render a lighter accordion that mirrors the ClusterPage FAQ
// markup so visuals stay coherent across the page.
function FaqInline({ title, items }: { title: string; items: FaqEntry[] }) {
  if (!items.length) return null;
  return (
    <section className="mb-12 min-w-0 max-w-[72rem]" id="faq">
      <p className="mb-4 text-xs font-bold uppercase tracking-[.14em] text-blue">
        Vos questions
      </p>
      <h2 className={`mb-7 ${EDITORIAL_HEADING}`}>
        {title || "Questions fréquentes"}
      </h2>
      <FaqAccordion
        items={items.map((item) => ({ question: item.q, answer: item.a }))}
      />
    </section>
  );
}

// ─── Inline ComparisonTable fallback ───
// The existing <ComparisonTable> expects a pricing-plan shape that Gemini
// does not emit for editorial pages. When `items` is flat strings (typical
// for "régime A vs régime B" lists), we render a clean two-column-style list.
function ComparisonInline({
  title,
  body,
  items,
}: {
  title: string;
  body: string | null;
  items: string[];
}) {
  return (
    <section
      className={`${GENERATED_PROSE_SHELL} mb-12 overflow-hidden rounded-[1.75rem] border border-ink/10 bg-white`}
    >
      {(title || body) && (
        <div className="bg-lilac p-6 sm:p-8">
          {title && <h2 className={EDITORIAL_HEADING}>{title}</h2>}
          {body && (
            <p className="mt-4 text-base leading-7 text-ink-muted">{body}</p>
          )}
        </div>
      )}
      {items.length > 0 && (
        <dl className="divide-y divide-ink/10 px-6 sm:px-8">
          {items.map((item, i) => {
            const row = splitTitled(item);
            return (
              <div
                key={i}
                className="grid gap-3 py-5 sm:grid-cols-[.7fr_1fr] sm:gap-6"
              >
                <dt className="text-base font-bold leading-6 text-ink">
                  {row.title}
                </dt>
                {row.description !== row.title && (
                  <dd className="text-sm leading-6 text-ink-muted">
                    {row.description}
                  </dd>
                )}
              </div>
            );
          })}
        </dl>
      )}
    </section>
  );
}

// ─── Inline InternalLinks fallback (legacy labels + V2 label/href objects) ───
function InternalLinksInline({
  title,
  items,
}: {
  title: string;
  items: InternalLinkEntry[];
}) {
  if (!items.length) return null;
  return (
    <section className="mb-12 rounded-[1.75rem] bg-lilac p-6 sm:p-8">
      {title && <h2 className={`mb-6 ${EDITORIAL_HEADING}`}>{title}</h2>}
      <ul className="grid gap-3 md:grid-cols-2">
        {items.map((item, i) => (
          <li key={item.href ?? `${item.label}-${i}`} className="min-w-0">
            {item.href ? (
              <a
                className={`group flex h-full min-h-16 items-center justify-between gap-4 rounded-2xl bg-white/80 p-5 text-base font-bold leading-6 text-ink transition-colors hover:bg-blue hover:text-white ${EDITORIAL_FOCUS}`}
                href={item.href}
              >
                <span>{item.label}</span>
                <EditorialArrow className="shrink-0 transition-transform group-hover:translate-x-1" />
              </a>
            ) : (
              <span className="flex h-full min-h-16 items-center rounded-2xl bg-white/50 p-5 text-base leading-6 text-ink">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}

// ─── Inline StatsBand renderer ───
// Different from the homepage <StatsBand> (which is fixed copy) — this one
// renders Gemini-emitted stats with optional source attribution.
// items shape: { value, label, source?, detail? }
function StatsBandInline({
  title,
  body,
  stats,
}: {
  title: string;
  body: string;
  stats: { value: string; label: string; source?: string; detail?: string }[];
}) {
  if (!stats.length) return null;
  return (
    <section className="mb-12">
      {(title || body) && (
        <div className="mb-6 max-w-3xl">
          {title && <h2 className={EDITORIAL_HEADING}>{title}</h2>}
          {body && (
            <p className="mt-4 text-base leading-7 text-ink-muted">{body}</p>
          )}
        </div>
      )}
      <StatHighlight
        variant="band"
        stats={stats.map((stat) => ({
          value: stat.value,
          label: stat.label,
          detail: [stat.detail, stat.source ? `Source : ${stat.source}` : ""]
            .filter(Boolean)
            .join(" · "),
        }))}
      />
    </section>
  );
}

// ─── EditoIntro: preserve prose without inferring a byline from a generator marker. ───
function EditoIntroInline({ title, body }: { title: string; body: string }) {
  // This marker came from generated content; it is not proof of authorship.
  const cleanBody = body.split("[HELENE_SIGN]")[0]!.trim();
  return (
    <section
      className={`${GENERATED_PROSE_SHELL} mb-12 rounded-[1.75rem] bg-paper p-6 sm:p-9`}
    >
      <span
        aria-hidden="true"
        className="mb-5 flex h-11 w-11 items-center justify-center rounded-2xl bg-blue text-white"
      >
        <IconSet name="book" size={23} />
      </span>
      {title && <h2 className={`mb-5 ${EDITORIAL_HEADING}`}>{title}</h2>}
      <RichText text={cleanBody} className="max-w-none" />
    </section>
  );
}

// ─── RelatedArticles inline — minimal grid of internal-link cards ───
// items shape: { slug, title, route? } OR string[]
function RelatedArticlesInline({
  title,
  items,
}: {
  title: string;
  items: { slug: string; title: string; route?: string }[];
}) {
  if (!items.length) return null;
  return (
    <section className="mb-12 rounded-[1.75rem] bg-paper p-6 sm:p-8">
      <h2 className={`mb-7 ${EDITORIAL_HEADING}`}>
        {title || "À lire également"}
      </h2>
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {items.map((item, i) => {
          const href = item.route
            ? `/${item.route}/${item.slug}`
            : `/${item.slug}`;
          return (
            <a
              key={`${item.route ?? ""}-${item.slug}`}
              href={href}
              className={`group flex min-w-0 flex-col rounded-[1.4rem] border border-ink/10 bg-white p-6 transition-colors hover:border-blue/30 hover:bg-lilac/40 ${EDITORIAL_FOCUS}`}
            >
              <span className="mb-7 flex items-center justify-between text-xs font-bold uppercase tracking-[.1em] text-blue">
                Article lié{" "}
                <span aria-hidden="true" className="font-mono">
                  {String(i + 1).padStart(2, "0")}
                </span>
              </span>
              <h3 className="flex-1 font-display text-xl font-bold leading-tight tracking-[-.025em] text-ink">
                {item.title}
              </h3>
              <span className="mt-6 flex items-center justify-between gap-4 text-sm font-bold text-blue">
                Lire l’article{" "}
                <EditorialArrow className="shrink-0 transition-transform group-hover:translate-x-1" />
              </span>
            </a>
          );
        })}
      </div>
    </section>
  );
}

// ─── ServiceMatrix inline — grid of service availability cards ───
// items shape: { service: string, included: boolean, tier?: string } OR
// { service_slug: string, dimension_value: string }
interface ServiceMatrixItem {
  service: string;
  included?: boolean;
  tier?: string;
  dimension_value?: string;
}

function ServiceMatrixInline({
  title,
  body,
  items,
}: {
  title: string;
  body: string;
  items: ServiceMatrixItem[];
}) {
  if (!items.length) return null;
  return (
    <section className="mb-12 rounded-[1.75rem] bg-mint p-6 sm:p-8">
      {title && <h2 className={EDITORIAL_HEADING}>{title}</h2>}
      {body && (
        <p className="mt-4 max-w-3xl text-base leading-7 text-ink-muted">
          {body}
        </p>
      )}
      <ul className="mt-7 grid gap-3 md:grid-cols-2">
        {items.map((item, i) => {
          const included = item.included !== false;
          return (
            <li
              key={`${item.service}-${i}`}
              className="flex min-w-0 items-start gap-4 rounded-2xl bg-white/80 p-5"
            >
              <span
                aria-hidden="true"
                className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${included ? "bg-navy text-mint" : "bg-paper text-ink-muted"}`}
              >
                {included ? <EditorialCheck className="h-4 w-4" /> : "—"}
              </span>
              <div className="min-w-0">
                <p className="text-base font-bold leading-6 text-ink">
                  <span className="sr-only">
                    {included ? "Inclus : " : "Non inclus : "}
                  </span>
                  {item.service}
                </p>
                {(item.tier || item.dimension_value) && (
                  <p className="mt-2 text-sm leading-6 text-ink-muted">
                    {[item.tier, item.dimension_value]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

// ─── MapEmbed inline — Google Maps embed via lat/lng from body JSON ───
// body should contain JSON: {"lat":48.85,"lng":2.35,"zoom":13,"address":"..."}
// OR a free-text address (we still render a fallback link).
interface MapData {
  lat?: number;
  lng?: number;
  zoom?: number;
  address?: string;
}

function MapEmbedInline({ title, body }: { title: string; body: string }) {
  let data: MapData = {};
  try {
    const parsed = body.trim().startsWith("{")
      ? JSON.parse(body)
      : { address: body.trim() };
    data = isRecord(parsed) ? (parsed as MapData) : {};
  } catch {
    data = body.trim().startsWith("{") ? {} : { address: body };
  }
  const hasCoords =
    typeof data.lat === "number" &&
    Number.isFinite(data.lat) &&
    Math.abs(data.lat) <= 90 &&
    typeof data.lng === "number" &&
    Number.isFinite(data.lng) &&
    Math.abs(data.lng) <= 180;
  const zoom =
    typeof data.zoom === "number" ? Math.min(20, Math.max(1, data.zoom)) : 13;
  const address = typeof data.address === "string" ? data.address : "";
  return (
    <section className="mb-12 rounded-[1.75rem] bg-mint p-5 sm:p-8">
      {title && <h2 className={`mb-6 ${EDITORIAL_HEADING}`}>{title}</h2>}
      {hasCoords ? (
        <div className="aspect-[4/3] overflow-hidden rounded-[1.4rem] bg-white sm:aspect-[16/9]">
          <iframe
            title={title || "Carte de localisation"}
            src={`https://www.google.com/maps?q=${data.lat},${data.lng}&z=${zoom}&output=embed`}
            className="h-full w-full"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      ) : (
        <div className="rounded-[1.4rem] bg-white/80 p-6">
          <IconSet name="target" size={30} className="mb-4 text-blue" />
          <p className="text-base leading-7 text-ink">
            {address || "Adresse non renseignée."}
          </p>
          {address && (
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`}
              target="_blank"
              rel="noopener noreferrer"
              className={`mt-5 inline-flex min-h-11 items-center gap-3 rounded-full bg-blue px-5 py-3 text-sm font-bold text-white ${EDITORIAL_FOCUS}`}
            >
              Ouvrir dans Google Maps <EditorialArrow />
            </a>
          )}
        </div>
      )}
    </section>
  );
}

// ─── Generic fallback for unknown section_type ───
function UnknownSection({ section }: { section: PageSection }) {
  if (process.env.NODE_ENV !== "production")
    console.warn(
      `[DynamicSection] Unknown section_type="${section.section_type}" for ${section.route}/${section.slug}#${section.section_order}`,
    );
  const body = section.body?.trim() ?? "";
  const isStructuredBody = /^[\[{]/u.test(body);
  const parsed = safeParse(isStructuredBody ? body : section.items);
  const strings = asStringArray(parsed);
  const records = asObjectArray(parsed);
  const paragraphs = [
    !isStructuredBody ? body : "",
    ...strings,
    ...records.flatMap((item) =>
      [item.title, item.description, item.text, item.body].filter(
        (value): value is string => typeof value === "string",
      ),
    ),
  ].filter(Boolean);
  if (!section.title && !paragraphs.length) return null;
  return (
    <>
      <ContentSection
        title={section.title ?? ""}
        paragraphs={paragraphs}
        variant="bordered"
      />
      <CitationsFooter citations={asCitations(safeParse(section.citations))} />
    </>
  );
}

// ─── Coerce arbitrary object → BenefitsGrid props with IconSet integration ───
interface BenefitItem {
  icon: IconName;
  title: string;
  description: string;
}

function coerceBenefitsItems(parsed: unknown): BenefitItem[] {
  if (!Array.isArray(parsed)) return [];
  const out: BenefitItem[] = [];
  for (const raw of parsed) {
    if (typeof raw === "string") {
      // Legacy "Title : description" flat string — keep retro-compat.
      const { title, description } = splitTitled(raw);
      out.push({ icon: "target", title, description });
      continue;
    }
    if (typeof raw === "object" && raw !== null) {
      const obj = raw as Record<string, unknown>;
      const t = typeof obj.title === "string" ? obj.title : "";
      if (!t) continue;
      const d =
        typeof obj.description === "string"
          ? obj.description
          : typeof obj.body === "string"
            ? obj.body
            : "";
      const iconRaw = typeof obj.icon === "string" ? obj.icon : "";
      const icon: IconName = isSupportedIcon(iconRaw) ? iconRaw : "target";
      out.push({ icon, title: t, description: d });
    }
  }
  return out;
}

// ─── Coerce process/numbered-steps items → {title, description} ───
function coerceStepsItems(
  parsed: unknown,
): { title: string; description: string; number?: string }[] {
  if (!Array.isArray(parsed)) return [];
  const out: { title: string; description: string; number?: string }[] = [];
  for (const raw of parsed) {
    if (typeof raw === "string") {
      const split = splitTitled(raw);
      out.push(split);
      continue;
    }
    if (typeof raw === "object" && raw !== null) {
      const obj = raw as Record<string, unknown>;
      const t = typeof obj.title === "string" ? obj.title : "";
      if (!t) continue;
      const d =
        typeof obj.description === "string"
          ? obj.description
          : typeof obj.body === "string"
            ? obj.body
            : "";
      const n = typeof obj.number === "string" ? obj.number : undefined;
      out.push({ title: t, description: d, number: n });
    }
  }
  return out;
}

// ─── Coerce StatsBand / StatHighlight items → {value, label, source?, detail?} ───
function coerceStatsItems(
  parsed: unknown,
): { value: string; label: string; source?: string; detail?: string }[] {
  if (!Array.isArray(parsed)) return [];
  const out: {
    value: string;
    label: string;
    source?: string;
    detail?: string;
  }[] = [];
  for (const raw of parsed) {
    if (typeof raw === "string") {
      const split = splitTitled(raw);
      out.push({ value: split.title, label: split.description });
      continue;
    }
    if (typeof raw === "object" && raw !== null) {
      const obj = raw as Record<string, unknown>;
      const value = typeof obj.value === "string" ? obj.value : "";
      const label = typeof obj.label === "string" ? obj.label : "";
      if (!value || !label) continue;
      const source = typeof obj.source === "string" ? obj.source : undefined;
      const detail = typeof obj.detail === "string" ? obj.detail : undefined;
      out.push({ value, label, source, detail });
    }
  }
  return out;
}

// ─── Coerce RelatedArticles items → {slug, title, route?} ───
function coerceRelatedItems(
  parsed: unknown,
): { slug: string; title: string; route?: string }[] {
  if (!Array.isArray(parsed)) return [];
  const out: { slug: string; title: string; route?: string }[] = [];
  for (const raw of parsed) {
    if (typeof raw === "string") {
      // Bare string → treat as title only (no link)
      out.push({
        slug: raw.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        title: raw,
      });
      continue;
    }
    if (typeof raw === "object" && raw !== null) {
      const obj = raw as Record<string, unknown>;
      const slug = typeof obj.slug === "string" ? obj.slug : "";
      const title = typeof obj.title === "string" ? obj.title : "";
      if (!slug || !title) continue;
      const route = typeof obj.route === "string" ? obj.route : undefined;
      out.push({ slug, title, ...(route !== undefined && { route }) });
    }
  }
  return out;
}

// ─── Coerce ServiceMatrix items ───
function coerceServiceMatrixItems(parsed: unknown): ServiceMatrixItem[] {
  if (!Array.isArray(parsed)) return [];
  const out: ServiceMatrixItem[] = [];
  for (const raw of parsed) {
    if (typeof raw === "string") {
      out.push({ service: raw, included: true });
      continue;
    }
    if (typeof raw === "object" && raw !== null) {
      const obj = raw as Record<string, unknown>;
      const service =
        typeof obj.service === "string"
          ? obj.service
          : typeof obj.service_slug === "string"
            ? obj.service_slug
            : "";
      if (!service) continue;
      const included =
        typeof obj.included === "boolean" ? obj.included : undefined;
      const tier = typeof obj.tier === "string" ? obj.tier : undefined;
      const dimension_value =
        typeof obj.dimension_value === "string"
          ? obj.dimension_value
          : undefined;
      out.push({
        service,
        ...(included !== undefined && { included }),
        ...(tier !== undefined && { tier }),
        ...(dimension_value !== undefined && { dimension_value }),
      });
    }
  }
  return out;
}

// ─── Coerce TableOfContents items → {id, label, level?} ───
function coerceTocItems(
  parsed: unknown,
): { id: string; label: string; level?: number }[] {
  if (!Array.isArray(parsed)) return [];
  const out: { id: string; label: string; level?: number }[] = [];
  const seen = new Set<string>();
  for (const raw of parsed) {
    if (typeof raw === "object" && raw !== null) {
      const obj = raw as Record<string, unknown>;
      const id =
        typeof obj.anchor === "string"
          ? obj.anchor
          : typeof obj.id === "string"
            ? obj.id
            : "";
      const label =
        typeof obj.label === "string"
          ? obj.label
          : typeof obj.title === "string"
            ? obj.title
            : "";
      const normalizedId = normalizeAnchorId(id);
      if (!normalizedId || !label || seen.has(normalizedId)) continue;
      seen.add(normalizedId);
      const level = typeof obj.level === "number" ? obj.level : undefined;
      out.push({
        id: normalizedId,
        label,
        ...(level !== undefined && { level }),
      });
    }
  }
  return out;
}

// Preserve all supported historical shapes. Unlabelled prose remains neutral:
// its position in an array is not evidence of an advantage or disadvantage.
function coerceProsCons(parsed: unknown): {
  pros: string[];
  cons: string[];
  points: string[];
} {
  const result = {
    pros: [] as string[],
    cons: [] as string[],
    points: [] as string[],
  };
  function side(label: string): "pros" | "cons" | undefined {
    const normalized = label
      .trim()
      .normalize("NFD")
      .replaceAll(/\p{Diacritic}/gu, "")
      .toLowerCase();
    if (/^(?:pros?|avantages?|atouts?|pour|plus|\+)$/u.test(normalized))
      return "pros";
    if (
      /^(?:cons?|inconvenients?|contraintes?|limites?|points? de vigilance|risques?|contre|minus|-)$/u.test(
        normalized,
      )
    )
      return "cons";
    return undefined;
  }
  function add(raw: unknown, explicitSide?: "pros" | "cons") {
    if (typeof raw === "string") {
      const text = raw.trim();
      if (!text) return;
      const labelled = text.match(
        /^\s*(avantages?|atouts?|pour|pros?|plus|inconv[ée]nients?|contraintes?|limites?|points? de vigilance|risques?|contre|cons?|minus)\b([^:：]*?)\s*[:：]\s*(.+)$/iu,
      );
      const category =
        explicitSide ?? (labelled ? side(labelled[1]!) : undefined);
      if (labelled && category) {
        const context = labelled[2]!.trim();
        result[category].push(
          context ? `${context} : ${labelled[3]!}` : labelled[3]!,
        );
      } else result[category ?? "points"].push(text);
      return;
    }
    if (!isRecord(raw)) return;
    const title = typeof raw.title === "string" ? raw.title.trim() : "";
    const label = typeof raw.label === "string" ? raw.label.trim() : "";
    const declared =
      typeof raw.type === "string"
        ? raw.type
        : typeof raw.kind === "string"
          ? raw.kind
          : "";
    const category =
      explicitSide ?? side(declared) ?? side(title) ?? side(label);
    const description =
      [raw.text, raw.description, raw.body]
        .find(
          (value): value is string =>
            typeof value === "string" && Boolean(value.trim()),
        )
        ?.trim() ?? "";
    const heading =
      title && !side(title) ? title : label && !side(label) ? label : "";
    const text = [heading, description]
      .filter(
        (value, index, values) => value && values.indexOf(value) === index,
      )
      .join(" : ");
    if (text) add(text, category);
  }
  if (isRecord(parsed)) {
    for (const [label, values] of Object.entries(parsed)) {
      const category = side(label);
      if (Array.isArray(values)) for (const item of values) add(item, category);
    }
  } else if (Array.isArray(parsed)) {
    for (const item of parsed) add(item);
  }
  return result;
}

// ─── Main switch ───
export async function DynamicSection({
  section,
  professionEditorialLayout = "grid",
}: {
  section: PageSection;
  professionEditorialLayout?: "grid" | "single";
}) {
  const parsedItems = sanitizeLegacyPublicValue(safeParse(section.items));
  const citations = asCitations(safeParse(section.citations));
  const title = sanitizeLegacyPublicText(section.title ?? "");
  const body = sanitizeLegacyPublicText(section.body ?? "");
  const safeSection: PageSection = {
    ...section,
    title: title || null,
    body: body || null,
  };

  switch (section.section_type) {
    case "Hero":
      // The page-level Hero is handled by ClusterPage (h1 + intro). A
      // section-typed "Hero" coming from DB is treated as a highlighted
      // intro block to avoid duplicating the page banner.
      return (
        <>
          <ContentSection
            title={title}
            paragraphs={body ? [body] : []}
            variant="highlighted"
            className={GENERATED_PROSE_SHELL}
            contentClassName={GENERATED_PROSE_TEXT}
          />
          <CitationsFooter citations={citations} />
        </>
      );

    case "ContentSection": {
      // Body may be a single paragraph; split on \n\n for multi-paragraph.
      const paragraphs = body
        ? body
            .split(/\n{2,}/u)
            .map((p) => p.trim())
            .filter(Boolean)
        : [];
      const wideText = isWideEditorialText(section);
      const contentLayout = wideText
        ? professionEditorialLayout === "single"
          ? "editorial-single"
          : "editorial-grid"
        : "default";
      return (
        <>
          <ContentSection
            title={title}
            paragraphs={paragraphs}
            className={
              wideText ? GENERATED_WIDE_TEXT_SHELL : GENERATED_PROSE_SHELL
            }
            contentClassName={
              wideText ? GENERATED_EDITORIAL_GRID_TEXT : GENERATED_PROSE_TEXT
            }
            contentLayout={contentLayout}
          />
          <CitationsFooter citations={citations} wide={wideText} />
        </>
      );
    }

    case "BenefitsGrid": {
      const benefits = coerceBenefitsItems(parsedItems);
      return (
        <>
          <BenefitsGrid
            title={title}
            intro={body}
            benefits={benefits}
            columns={2}
          />
          <CitationsFooter citations={citations} />
        </>
      );
    }

    case "Checklist":
      return (
        <>
          <Checklist
            title={title}
            intro={body}
            items={asStringArray(parsedItems)}
            variant="check"
            columns={1}
          />
          <CitationsFooter citations={citations} />
        </>
      );

    case "AlertBox":
      return (
        <>
          <AlertBox type="warning" title={title}>
            {body}
          </AlertBox>
          <CitationsFooter citations={citations} />
        </>
      );

    case "ProsCons": {
      const { pros, cons, points } = coerceProsCons(parsedItems);
      if (pros.length === 0 && cons.length === 0 && points.length === 0)
        return <UnknownSection section={safeSection} />;
      return (
        <>
          <ProsCons
            title={title}
            intro={body}
            pros={pros}
            cons={cons}
            points={points}
          />
          <CitationsFooter citations={citations} />
        </>
      );
    }

    case "KeyTakeaways":
      return (
        <div className="mb-12">
          <KeyTakeaways title={title} items={asStringArray(parsedItems)} />
        </div>
      );

    case "Faq":
    case "FAQSection_PAA": {
      // FAQSection_PAA = FAQ quick-answer PAA émise par la pipeline V2-bis
      // (même shape {q,a} que Faq — KPI K2 du validateur).
      const faqItems = asFaqArray(parsedItems);
      if (faqItems.length === 0) return null;
      const faqId = `${section.route}-${section.slug}-${section.section_order}`;
      return (
        <>
          <FaqJsonLd items={faqItems} id={faqId} />
          <FaqInline title={title || "Questions fréquentes"} items={faqItems} />
        </>
      );
    }

    case "DefinitionBox": {
      // DB shape ambiguous — use title as term, body as definition,
      // optional first citation as source.
      // The linked source footer already includes the source's name.
      const source = citations[0] && !isVisibleCitation(citations[0]) ? citations[0].source : undefined;
      return (
        <div className="mb-12">
          <DefinitionBox term={title} definition={body} source={source} />
          <CitationsFooter citations={citations} />
        </div>
      );
    }

    case "NumberedSteps": {
      const steps = coerceStepsItems(parsedItems).map((step) => ({
        title: step.title,
        description: step.description,
      }));
      return (
        <>
          <NumberedSteps title={title} intro={body} steps={steps} />
          <CitationsFooter citations={citations} />
        </>
      );
    }

    case "QuoteBlock":
      // Body = quote text, title = author (best-effort mapping).
      return (
        <>
          <QuoteBlock
            quote={body}
            author={title || "Skoria"}
            variant="citation"
          />
          <CitationsFooter citations={citations} />
        </>
      );

    case "StatHighlight": {
      const stats = coerceStatsItems(parsedItems).map((s) => ({
        value: s.value,
        label: s.label,
        ...((s.detail || s.source) && {
          detail: [s.detail, s.source ? `Source : ${s.source}` : ""]
            .filter(Boolean)
            .join(" · "),
        }),
      }));
      if (stats.length === 0) {
        return <UnknownSection section={safeSection} />;
      }
      return (
        <>
          {(title || body) && (
            <div className="mb-4">
              {title && (
                <h2 className={`mb-4 ${EDITORIAL_HEADING}`}>{title}</h2>
              )}
              {body && (
                <p className="max-w-prose text-base leading-relaxed text-ink-muted">
                  {body}
                </p>
              )}
            </div>
          )}
          <StatHighlight stats={stats} variant="cards" />
          <CitationsFooter citations={citations} />
        </>
      );
    }

    case "ComparisonTable": {
      const table = coerceComparisonTable(parsedItems);
      return (
        <>
          {table ? (
            <RichTable
              title={title}
              intro={body || null}
              headers={table.headers}
              rows={table.rows}
            />
          ) : (
            <ComparisonInline
              title={title}
              body={body || null}
              items={asStringArray(parsedItems)}
            />
          )}
          <CitationsFooter citations={citations} />
        </>
      );
    }

    case "RichTable": {
      const { headers, rows } = asRichTable(parsedItems);
      if (headers.length === 0 || rows.length === 0)
        return <UnknownSection section={safeSection} />;
      return (
        <>
          <RichTable
            title={title}
            intro={body || null}
            headers={headers}
            rows={rows}
          />
          <CitationsFooter citations={citations} />
        </>
      );
    }

    case "InternalLinks":
      return (
        <InternalLinksInline
          title={title}
          items={coerceInternalLinks(parsedItems)}
        />
      );

    // ─── V2 NEW CASES (Wave 3b / P2a) ───

    case "StatsBand": {
      const stats = coerceStatsItems(parsedItems);
      if (stats.length === 0) return <UnknownSection section={safeSection} />;
      return (
        <>
          <StatsBandInline title={title} body={body} stats={stats} />
          <CitationsFooter citations={citations} />
        </>
      );
    }

    case "EditoIntro":
      return (
        <>
          <EditoIntroInline title={title} body={body} />
          <CitationsFooter citations={citations} />
        </>
      );

    case "ExpertQuote":
      return (
        <>
          <ContentSection
            title="Le repère éditorial"
            paragraphs={body ? [body] : []}
            variant="highlighted"
            className={GENERATED_PROSE_SHELL}
            contentClassName="max-w-none"
          />
          <CitationsFooter citations={citations} />
        </>
      );

    case "SimulatorTeaser":
      // The default tools are derived from the shared simulator registry.
      return (
        <SimulatorTeaser
          {...(title && { title })}
          {...(body && { subtitle: body })}
        />
      );

    case "PricingTeaser": {
      return (
        <section className="mb-12 rounded-[1.25rem] border border-ink/12 bg-apricot p-6 sm:p-8">
          <p className="sk-eyebrow text-blue">Honoraires</p>
          <h2 className="mt-3 font-display text-[1.5rem] font-bold text-ink">
            Comparer un prix relié à un périmètre
          </h2>
          <p className="mt-4 max-w-3xl text-[.9rem] leading-7 text-ink-muted">
            Sans volume, état du dossier, fréquence et niveau de conseil, un
            forfait isolé ne permet pas de comparer. Demandez à chaque
            professionnel de séparer le socle récurrent, la mise en place, les
            options et les travaux exceptionnels.
          </p>
          <BriefTrigger className="mt-6 inline-flex min-h-11 items-center rounded-full bg-blue px-5 text-[.78rem] font-bold text-white">
            Ajouter ces critères au brief&nbsp; ↗
          </BriefTrigger>
        </section>
      );
    }

    case "ProcessSteps": {
      const rawSteps = coerceStepsItems(parsedItems);
      const steps = rawSteps.map((s, i) => ({
        number: s.number ?? String(i + 1).padStart(2, "0"),
        title: s.title,
        description: s.description,
      }));
      const props: {
        title?: string;
        subtitle?: string;
        steps?: typeof steps;
      } = {};
      if (title) props.title = title;
      if (body) props.subtitle = body;
      if (steps.length > 0) props.steps = steps;
      return (
        <>
          <ProcessSteps {...props} />
          <CitationsFooter citations={citations} />
        </>
      );
    }

    case "TestimonialSlider": {
      return null;
    }

    case "TableOfContents": {
      // Items may be explicit {anchor,label} or omitted (then we cannot
      // auto-generate from siblings here — server component receives only
      // one section at a time). When empty, return null.
      const tocItems = coerceTocItems(parsedItems);
      if (tocItems.length === 0) return null;
      return (
        <div className="mb-12">
          <TableOfContents items={tocItems} {...(title && { title })} />
        </div>
      );
    }

    case "RelatedArticles": {
      const items = coerceRelatedItems(parsedItems);
      if (items.length === 0) return null;
      return <RelatedArticlesInline title={title} items={items} />;
    }

    case "ServiceMatrix": {
      const items = coerceServiceMatrixItems(parsedItems);
      if (items.length === 0) return <UnknownSection section={safeSection} />;
      return (
        <>
          <ServiceMatrixInline title={title} body={body} items={items} />
          <CitationsFooter citations={citations} />
        </>
      );
    }

    case "LocalProvidersMap": {
      const providers = asObjectArray(parsedItems).filter(
        (item) => typeof item.name === "string" && item.name.trim(),
      );
      if (!providers.length) return <UnknownSection section={safeSection} />;
      return (
        <section className="mb-12 rounded-[1.75rem] bg-mint p-6 sm:p-8">
          <h2 className={EDITORIAL_HEADING}>
            {title.replace(/partenaires/giu, "organismes") ||
              "Les organismes à proximité"}
          </h2>
          {body && (
            <p className="mt-4 max-w-3xl text-base leading-7 text-ink-muted">
              {body.replace(/partenaires/giu, "organismes")}
            </p>
          )}
          <div className="mt-7 grid gap-3 md:grid-cols-2">
            {providers.map((provider, i) => {
              const name = String(provider.name);
              const address = [provider.address, provider.ville]
                .filter((value): value is string => typeof value === "string")
                .join(", ");
              return (
                <article
                  key={`${name}-${i}`}
                  className="min-w-0 rounded-[1.4rem] bg-white/85 p-6"
                >
                  <IconSet name="target" className="mb-5 text-blue" size={28} />
                  {typeof provider.type === "string" && (
                    <p className="mb-3 text-xs font-bold uppercase tracking-[.08em] text-blue">
                      {provider.type}
                    </p>
                  )}
                  <h3 className="font-display text-xl font-bold leading-tight text-ink">
                    {name}
                  </h3>
                  {address && (
                    <p className="mt-3 text-sm leading-6 text-ink-muted">
                      {address}
                    </p>
                  )}
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${name} ${address}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`mt-5 inline-flex min-h-11 items-center gap-3 text-sm font-bold text-blue ${EDITORIAL_FOCUS}`}
                  >
                    Vérifier la localisation <EditorialArrow />
                  </a>
                </article>
              );
            })}
          </div>
          <CitationsFooter citations={citations} />
        </section>
      );
    }

    case "OpeningHoursTable": {
      const sourced = citations.some(
        (citation) => citation.url && !citation.url.includes("/stub"),
      );
      if (!sourced)
        return (
          <AlertBox type="info" title="Préparer une visite">
            Avant de vous déplacer, consultez les horaires publiés par
            l’organisme ou contactez-le pour confirmer ses disponibilités et les
            modalités de rendez-vous.
          </AlertBox>
        );
      const rows = asObjectArray(parsedItems).flatMap((item) =>
        typeof item.day === "string" && typeof item.hours === "string"
          ? [[item.day, item.hours]]
          : [],
      );
      return (
        <>
          <RichTable
            title={title || "Horaires d’ouverture"}
            intro={body}
            headers={["Jour", "Horaires"]}
            rows={rows}
          />
          <CitationsFooter citations={citations} />
        </>
      );
    }

    case "MapEmbed":
      return (
        <>
          <MapEmbedInline title={title} body={body} />
          <CitationsFooter citations={citations} />
        </>
      );

    case "Calculator": {
      // Heuristique de famille sur le titre : quand un moteur interactif
      // existe (simulateurs P1/P2), on le rend inline ; sinon carte CTA.
      const calcKey = `${title} ${section.slug}`.toLowerCase();
      const interactive = /lmnp|meubl|loyer|locati/.test(calcKey) ? (
        <ImmobilierSimulator />
      ) : /honoraire|accompagnement comptable|budget pour votre accompagnement|co[ûu]t de votre accompagnement/.test(
          calcKey,
        ) ? (
        <HonorairesSimulator />
      ) : /r[ée]gime|micro|r[ée]el|\bis\b|\bir\b|sasu|bnc|statut/.test(
          calcKey,
        ) ? (
        <StatutsSimulator />
      ) : null;
      if (interactive) {
        return (
          <div className="mb-12">
            {title && <h2 className={`mb-4 ${EDITORIAL_HEADING}`}>{title}</h2>}
            {body && (
              <p className="mb-5 max-w-prose text-base leading-relaxed text-ink-muted">
                {body}
              </p>
            )}
            {interactive}
            <CitationsFooter citations={citations} />
          </div>
        );
      }
      const fields = asObjectArray(parsedItems)
        .map((item) => ({
          label: typeof item.label === "string" ? item.label : "",
          hint: typeof item.hint === "string" ? item.hint : "",
        }))
        .filter((field) => field.label);
      return (
        <section className="mb-12 rounded-[1.75rem] bg-lilac p-6 sm:p-8">
          <p className="mb-4 text-xs font-bold uppercase tracking-[.14em] text-blue">
            Préparer votre estimation
          </p>
          {title && <h2 className={EDITORIAL_HEADING}>{title}</h2>}
          {body && (
            <p className="mt-4 max-w-3xl text-base leading-7 text-ink-muted">
              {body}
            </p>
          )}
          {fields.length > 0 && (
            <ul className="my-6 grid gap-3 sm:grid-cols-2">
              {fields.map((field) => (
                <li key={field.label} className="rounded-2xl bg-white/75 p-5">
                  <p className="text-sm font-bold leading-6 text-ink">
                    {field.label}
                  </p>
                  {field.hint && (
                    <p className="mt-2 text-sm leading-6 text-ink-muted">
                      {field.hint}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          )}
          <div className="mt-6 flex flex-wrap gap-3">
            <BriefTrigger
              prefill={{ need: title || "Préparer une estimation" }}
              className="inline-flex min-h-12 items-center gap-3 rounded-full bg-blue px-5 py-3 text-sm font-bold text-white"
            >
              Préparer les questions de mon brief <EditorialArrow />
            </BriefTrigger>
            <a
              href="/simulateurs"
              className={`inline-flex min-h-12 items-center gap-3 rounded-full border border-ink/20 px-5 py-3 text-sm font-bold text-ink ${EDITORIAL_FOCUS}`}
            >
              Voir les simulateurs <EditorialArrow />
            </a>
          </div>
          <CitationsFooter citations={citations} />
        </section>
      );
    }

    default:
      return <UnknownSection section={safeSection} />;
  }
}

// ─── Re-exports for consumers that want to introspect or override ───
// (kept minimal; do not expand without a use-case)
export type { PageSection };

// Mark as intentionally exported helper to silence lint if unused elsewhere.
export const _internals = { asObjectArray };
