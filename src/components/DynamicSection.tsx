// ─── DynamicSection ───
// Renders a single PageSection row (from DB: numeris.page_sections) by
// dispatching on `section_type` to the matching presentational component.
//
// Server component (no state / no client-only APIs) so it stays SSG-friendly.
// PricingTeaser + TestimonialSlider read the DB directly server-side.
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
import { RichText } from "./RichText";
import { BenefitsGrid } from "./BenefitsGrid";
import { Checklist } from "./Checklist";
import { AlertBox } from "./AlertBox";
import { KeyTakeaways } from "./KeyTakeaways";
import { DefinitionBox } from "./DefinitionBox";
import { NumberedSteps } from "./NumberedSteps";
import { QuoteBlock } from "./QuoteBlock";
import { StatHighlight } from "./StatHighlight";
import { SimulatorTeaser } from "./SimulatorTeaser";
import { PricingTeaser } from "./PricingTeaser";
import { pricingTierToProp, type PricingTierShape } from "./pricing-shared";
import { ProcessSteps } from "./ProcessSteps";
import { TestimonialSlider } from "./TestimonialSlider";
import { TableOfContents } from "./TableOfContents";
import { IconSet, isSupportedIcon } from "./IconSet";
import type { IconName } from "./IconSet";
import { FaqJsonLd } from "./JsonLd";
import { db } from "@/libs/db";
import type { PageSection, PricingTier, Testimonial } from "@/libs/db";
import { legalEntity } from "@/data/legal-entity";

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
    if (typeof q === "string" && typeof a === "string" && q.trim() && a.trim()) {
      out.push({ q, a });
    }
  }
  return out;
}

function asCitations(v: unknown): Citation[] {
  if (!Array.isArray(v)) return [];
  const out: Citation[] = [];
  for (const entry of v) {
    if (
      entry !== null
      && typeof entry === "object"
      && "text" in entry
      && "url" in entry
      && "source" in entry
      && typeof (entry as { text: unknown }).text === "string"
      && typeof (entry as { url: unknown }).url === "string"
      && typeof (entry as { source: unknown }).source === "string"
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
function CitationsFooter({ citations }: { citations: Citation[] }) {
  // P0 defense-in-depth — strip stub/placeholder citations at render time
  // even if upstream pipeline (04_generate_sections._strip_stub_citations)
  // missed one. Drop when url is empty, contains "/stub", or text mentions
  // "stub" (case-insensitive). See ARKEE_ORG audit Tier 0 #1.
  const safeCitations = citations.filter((c) => {
    const url = (c.url || "").toLowerCase();
    const text = (c.text || "").toLowerCase();
    return url.length > 0 && !url.includes("/stub") && !text.includes("stub");
  });
  if (safeCitations.length === 0) return null;
  return (
    <div className="-mt-8 mb-12 border-l-2 border-l-pierre-12 bg-creme px-5 py-3">
      <p className="mb-1 text-[0.65rem] font-bold uppercase tracking-[0.1em] text-pierre-37">
        Sources
      </p>
      <ul className="space-y-1">
        {safeCitations.map((cit) => (
          <li key={`${cit.source}-${cit.url}`} className="text-[0.7rem] text-ardoise">
            <a
              href={cit.url}
              target="_blank"
              rel="noopener nofollow noreferrer"
              className="underline transition-colors hover:text-or-fonce"
            >
              {cit.text || cit.source}
            </a>
            <span className="ml-2 text-pierre-37">({cit.source})</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ─── Inline Faq fallback ───
// The existing <Faq> component renders a full-page section with sidebar +
// CTA and expects DB FaqItem rows (numeric id). For inline DB-driven Faq
// sections we render a lighter accordion that mirrors the ClusterPage FAQ
// markup so visuals stay coherent across the page.
function FaqInline({ title, items }: { title: string; items: FaqEntry[] }) {
  if (items.length === 0) return null;
  return (
    <div className="mb-12" id="faq">
      <h2 className="mb-8 font-serif text-[1.75rem] font-light leading-tight text-encre">
        {title || "Questions fréquentes"}
      </h2>
      <div className="grid gap-4">
        {items.map((item) => (
          <details
            key={item.q}
            className="group border border-pierre-12 bg-blanc"
          >
            <summary className="flex cursor-pointer items-center justify-between px-7 py-5 text-[0.95rem] font-medium text-encre transition-colors hover:text-or-fonce">
              {item.q}
              <span className="ml-4 text-[0.8rem] text-pierre-12 transition-transform group-open:rotate-45">
                +
              </span>
            </summary>
            <div className="max-w-prose border-t border-pierre-12 px-7 py-5 text-base leading-relaxed text-ardoise">
              {item.a}
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}

// ─── Inline ComparisonTable fallback ───
// The existing <ComparisonTable> expects a pricing-plan shape that Gemini
// does not emit for editorial pages. When `items` is flat strings (typical
// for "régime A vs régime B" lists), we render a clean two-column-style list.
function ComparisonInline({ title, body, items }: { title: string; body: string | null; items: string[] }) {
  return (
    <div className="mb-12 border border-pierre-12 bg-blanc p-7">
      {title && (
        <h2 className="mb-4 font-serif text-[1.25rem] font-light text-encre">
          {title}
        </h2>
      )}
      {body && (
        <p className="mb-4 max-w-prose text-base leading-relaxed text-ardoise">
          {body}
        </p>
      )}
      {items.length > 0 && (
        <ul className="space-y-3 border-t border-pierre-12 pt-4">
          {items.map((item, i) => {
            const { title: rowTitle, description } = splitTitled(item);
            return (
              <li key={i} className="grid gap-1 md:grid-cols-[200px_1fr] md:gap-6">
                <span className="text-[0.85rem] font-semibold text-encre">
                  {rowTitle}
                </span>
                <span className="text-[0.85rem] leading-relaxed text-ardoise">
                  {description}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

// ─── Inline InternalLinks fallback (DB shape: list of labels, no hrefs) ───
function InternalLinksInline({ title, items }: { title: string; items: string[] }) {
  if (items.length === 0) return null;
  return (
    <div className="mb-12">
      {title && (
        <h2 className="mb-5 font-serif text-[1.25rem] font-light text-encre">
          {title}
        </h2>
      )}
      <ul className="grid gap-2 md:grid-cols-2">
        {items.map((label, i) => (
          <li
            key={i}
            className="flex items-start gap-2 border border-pierre-12 bg-blanc px-4 py-3 text-[0.85rem] text-encre-75"
          >
            <span className="text-or">→</span> {label}
          </li>
        ))}
      </ul>
    </div>
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
  if (stats.length === 0) return null;
  return (
    <div className="mb-12">
      {(title || body) && (
        <div className="mb-6 max-w-3xl">
          {title && (
            <h2 className="mb-2 font-serif text-[1.25rem] font-light text-encre">
              {title}
            </h2>
          )}
          {body && (
            <p className="max-w-prose text-base leading-relaxed text-ardoise">
              {body}
            </p>
          )}
        </div>
      )}
      <div className="grid grid-cols-2 gap-0 border border-pierre-12 bg-blanc lg:grid-cols-4">
        {stats.map((s, i) => (
          <div
            key={`${s.label}-${i}`}
            className={`px-6 py-8 text-center ${i < stats.length - 1 ? "lg:border-r lg:border-pierre-12" : ""}`}
          >
            <span className="block font-serif text-[2.25rem] font-light italic leading-none text-or-fonce">
              {s.value}
            </span>
            <span className="mt-2 block text-[0.8rem] font-medium text-encre">
              {s.label}
            </span>
            {s.source && (
              <span className="mt-1 block text-[0.65rem] uppercase tracking-wider text-pierre-37">
                Source : {s.source}
              </span>
            )}
            {s.detail && !s.source && (
              <span className="mt-1 block text-[0.7rem] text-ardoise">
                {s.detail}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── EditoIntro: ContentSection variant highlighted + optional signature ───
// If body contains the marker `[HELENE_SIGN]`, we cut at that marker and
// append a small inline signature block at the bottom.
function EditoIntroInline({ title, body }: { title: string; body: string }) {
  const SIGN_MARKER = "[HELENE_SIGN]";
  const hasSign = body.includes(SIGN_MARKER);
  const cleanBody = hasSign ? body.split(SIGN_MARKER)[0]!.trim() : body;

  return (
    <div className="mb-12 border border-pierre-12 border-l-2 border-l-or bg-blanc p-7">
      {title && (
        <h2 className="mb-4 font-serif text-[1.25rem] font-light text-encre">
          {title}
        </h2>
      )}
      <RichText text={cleanBody} className="max-w-prose" />
      {hasSign && (
        <footer className="mt-6 flex items-center gap-3 border-t border-pierre-12 pt-4">
          <div className="flex h-9 w-9 items-center justify-center bg-or-pale text-[0.72rem] font-bold text-or-fonce">
            {legalEntity.presidentInitials}
          </div>
          <div>
            <p className="text-[0.78rem] font-semibold text-encre">
              {legalEntity.presidentName}
            </p>
            <p className="text-[0.66rem] text-ardoise">
              {legalEntity.presidentTitle}, Expert-comptable
            </p>
          </div>
        </footer>
      )}
    </div>
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
  if (items.length === 0) return null;
  return (
    <div className="mb-12">
      <h2 className="mb-5 font-serif text-[1.25rem] font-light text-encre">
        {title || "À lire également"}
      </h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {items.map((it) => {
          const href = it.route ? `/${it.route}/${it.slug}` : `/${it.slug}`;
          return (
            <a
              key={`${it.route ?? ""}-${it.slug}`}
              href={href}
              className="group block border border-pierre-12 bg-blanc p-5 transition-colors hover:border-or"
            >
              <span className="mb-2 block text-[0.65rem] font-bold uppercase tracking-[0.12em] text-or-fonce">
                Article lié
              </span>
              <span className="text-[0.92rem] font-medium leading-snug text-encre transition-colors group-hover:text-or-fonce">
                {it.title}
              </span>
              <span className="mt-3 block text-[0.75rem] text-or">
                Lire l&apos;article →
              </span>
            </a>
          );
        })}
      </div>
    </div>
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
  if (items.length === 0) return null;
  return (
    <div className="mb-12">
      {title && (
        <h2 className="mb-3 font-serif text-[1.25rem] font-light text-encre">
          {title}
        </h2>
      )}
      {body && (
        <p className="mb-6 max-w-prose text-base leading-relaxed text-ardoise">
          {body}
        </p>
      )}
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {items.map((it, i) => {
          const included = it.included !== false; // default true
          return (
            <div
              key={`${it.service}-${i}`}
              className={`flex items-start gap-3 border p-4 ${
                included
                  ? "border-pierre-12 bg-blanc"
                  : "border-pierre-12 bg-creme opacity-60"
              }`}
            >
              <span
                className={`mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center text-[0.75rem] font-bold ${
                  included ? "bg-or text-nuit" : "bg-pierre-12 text-pierre-37"
                }`}
              >
                {included ? "✓" : "—"}
              </span>
              <div className="flex-1">
                <span className="block text-[0.85rem] font-medium text-encre">
                  {it.service}
                </span>
                {(it.tier || it.dimension_value) && (
                  <span className="mt-0.5 block text-[0.7rem] text-ardoise">
                    {it.tier ?? it.dimension_value}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
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
    const trimmed = body.trim();
    if (trimmed.startsWith("{")) {
      data = JSON.parse(trimmed) as MapData;
    } else {
      data = { address: trimmed };
    }
  } catch {
    data = { address: body };
  }

  const hasCoords =
    typeof data.lat === "number" && typeof data.lng === "number";
  const zoom = data.zoom ?? 13;

  return (
    <div className="mb-12">
      {title && (
        <h2 className="mb-4 font-serif text-[1.25rem] font-light text-encre">
          {title}
        </h2>
      )}
      {hasCoords ? (
        <div className="aspect-[16/9] w-full overflow-hidden border border-pierre-12 bg-blanc">
          <iframe
            title={title || "Carte de localisation"}
            src={`https://www.google.com/maps?q=${data.lat},${data.lng}&z=${zoom}&output=embed`}
            className="h-full w-full"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      ) : (
        <div className="border border-dashed border-pierre-25 bg-creme p-7 text-center">
          <p className="text-[0.85rem] text-ardoise">
            {data.address || "Adresse non renseignée."}
          </p>
          {data.address && (
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(data.address)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-block text-[0.78rem] font-medium text-or-fonce hover:text-or"
            >
              Ouvrir dans Google Maps →
            </a>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Generic fallback for unknown section_type ───
function UnknownSection({ section }: { section: PageSection }) {
  if (process.env.NODE_ENV !== "production") {
    console.warn(
      `[DynamicSection] Unknown section_type="${section.section_type}" `
      + `for ${section.route}/${section.slug}#${section.section_order}`,
    );
  }
  return (
    <div className="mb-12 border border-dashed border-pierre-25 bg-creme p-7">
      {section.title && (
        <h2 className="mb-3 font-serif text-[1.25rem] font-light text-encre">
          {section.title}
        </h2>
      )}
      {section.body && (
        <p className="max-w-prose text-base leading-relaxed text-ardoise">
          {section.body}
        </p>
      )}
    </div>
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
  const out: { value: string; label: string; source?: string; detail?: string }[] = [];
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

// ─── Coerce PricingTeaser items → component props (or empty → read DB) ───
// Note: the <PricingTeaser> component expects `from` (not `from_price`) so we
// adapt the field name when mapping from DB.PricingTier or Gemini-emitted objects.
function coercePricingItems(parsed: unknown): PricingTierShape[] {
  if (!Array.isArray(parsed)) return [];
  const out: PricingTierShape[] = [];
  for (const raw of parsed) {
    if (typeof raw !== "object" || raw === null) continue;
    const obj = raw as Record<string, unknown>;
    const name = typeof obj.name === "string" ? obj.name : "";
    const from =
      typeof obj.from_price === "string"
        ? obj.from_price
        : typeof obj.from === "string"
          ? obj.from
          : "";
    if (!name || !from) continue;
    const features = Array.isArray(obj.features)
      ? (obj.features.filter((f) => typeof f === "string") as string[])
      : [];
    const highlighted =
      typeof obj.highlighted === "boolean" ? obj.highlighted : undefined;
    out.push({ name, from, features, ...(highlighted !== undefined && { highlighted }) });
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
      out.push({ slug: raw.toLowerCase().replace(/[^a-z0-9]+/g, "-"), title: raw });
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
        typeof obj.dimension_value === "string" ? obj.dimension_value : undefined;
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
      if (!id || !label) continue;
      const level = typeof obj.level === "number" ? obj.level : undefined;
      out.push({ id, label, ...(level !== undefined && { level }) });
    }
  }
  return out;
}

// ─── Map a DB Testimonial → TestimonialSlider prop shape ───
function dbTestimonialToProp(t: Testimonial): {
  body: string;
  author: string;
  role: string;
  stars: number;
  profession?: string;
} {
  return {
    body: t.body,
    author: t.author_name,
    role: t.author_role,
    stars: t.stars,
    ...(t.profession_slug && { profession: t.profession_slug }),
  };
}

// ─── Main switch ───
export function DynamicSection({ section }: { section: PageSection }) {
  const parsedItems = safeParse(section.items);
  const citations = asCitations(safeParse(section.citations));
  const title = section.title ?? "";
  const body = section.body ?? "";

  switch (section.section_type) {
    case "Hero":
      // The page-level Hero is handled by ClusterPage (h1 + intro). A
      // section-typed "Hero" coming from DB is treated as a highlighted
      // intro block to avoid duplicating the page banner.
      return (
        <>
          <ContentSection title={title} paragraphs={body ? [body] : []} variant="highlighted" />
          <CitationsFooter citations={citations} />
        </>
      );

    case "ContentSection": {
      // Body may be a single paragraph; split on \n\n for multi-paragraph.
      const paragraphs = body
        ? body.split(/\n{2,}/u).map((p) => p.trim()).filter(Boolean)
        : [];
      return (
        <>
          <ContentSection title={title} paragraphs={paragraphs} />
          <CitationsFooter citations={citations} />
        </>
      );
    }

    case "BenefitsGrid": {
      const benefits = coerceBenefitsItems(parsedItems);
      // BenefitsGrid expects {icon: string, title, description} — we pass the
      // SVG markup via IconSet by serializing to a stable identifier through
      // a wrapper card. Since BenefitsGrid renders `<span>{icon}</span>`, we
      // adapt by rendering ourselves when objects are present.
      return (
        <>
          {body && (
            <p className="mb-6 max-w-prose text-base leading-relaxed text-ardoise">
              {body}
            </p>
          )}
          {benefits.length > 0 ? (
            <div className="mb-12">
              {title && (
                <h2 className="mb-6 font-serif text-[1.25rem] font-light text-encre">
                  {title}
                </h2>
              )}
              <div className="grid gap-4 md:grid-cols-2">
                {benefits.map((b) => (
                  <div
                    key={b.title}
                    className="border border-pierre-12 bg-blanc p-6 transition-colors hover:border-or"
                  >
                    <span className="mb-3 inline-flex h-10 w-10 items-center justify-center text-or-fonce">
                      <IconSet name={b.icon} size={32} />
                    </span>
                    <h3 className="mb-1.5 text-[0.95rem] font-semibold text-encre">
                      {b.title}
                    </h3>
                    <p className="text-[0.9rem] leading-relaxed text-ardoise">
                      {b.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            // Fallback for legacy / empty input — keep the existing BenefitsGrid
            // signature so we don't crash on edge cases.
            <BenefitsGrid title={title} benefits={[]} columns={2} />
          )}
          <CitationsFooter citations={citations} />
        </>
      );
    }

    case "Checklist":
      return (
        <>
          {body && (
            <p className="mb-4 max-w-prose text-base leading-relaxed text-ardoise">
              {body}
            </p>
          )}
          <Checklist title={title} items={asStringArray(parsedItems)} variant="check" columns={1} />
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

    case "KeyTakeaways":
      return (
        <div className="mb-12">
          <KeyTakeaways title={title} items={asStringArray(parsedItems)} />
        </div>
      );

    case "Faq": {
      const faqItems = asFaqArray(parsedItems);
      if (faqItems.length === 0) return null;
      const faqId = `${section.route}-${section.slug}-${section.section_order}`;
      return (
        <>
          <FaqJsonLd items={faqItems} id={faqId} />
          <FaqInline title={title} items={faqItems} />
        </>
      );
    }

    case "DefinitionBox": {
      // DB shape ambiguous — use title as term, body as definition,
      // optional first citation as source.
      const source = citations[0]?.source;
      return (
        <div className="mb-12">
          <DefinitionBox term={title} definition={body} source={source} />
          <CitationsFooter citations={citations} />
        </div>
      );
    }

    case "NumberedSteps": {
      const steps = coerceStepsItems(parsedItems).map((s) => ({
        title: s.title,
        description: s.description,
      }));
      return (
        <>
          {body && (
            <p className="mb-4 max-w-prose text-base leading-relaxed text-ardoise">
              {body}
            </p>
          )}
          <NumberedSteps title={title} steps={steps} />
          <CitationsFooter citations={citations} />
        </>
      );
    }

    case "QuoteBlock":
      // Body = quote text, title = author (best-effort mapping).
      return (
        <>
          <QuoteBlock quote={body} author={title || "Numeris"} variant="citation" />
          <CitationsFooter citations={citations} />
        </>
      );

    case "StatHighlight": {
      const stats = coerceStatsItems(parsedItems).map((s) => ({
        value: s.value,
        label: s.label,
        ...(s.detail && { detail: s.detail }),
      }));
      if (stats.length === 0) {
        return <UnknownSection section={section} />;
      }
      return (
        <>
          {(title || body) && (
            <div className="mb-4">
              {title && (
                <h2 className="mb-2 font-serif text-[1.25rem] font-light text-encre">
                  {title}
                </h2>
              )}
              {body && (
                <p className="max-w-prose text-base leading-relaxed text-ardoise">
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

    case "ComparisonTable":
      return (
        <>
          <ComparisonInline title={title} body={body || null} items={asStringArray(parsedItems)} />
          <CitationsFooter citations={citations} />
        </>
      );

    case "InternalLinks":
      return <InternalLinksInline title={title} items={asStringArray(parsedItems)} />;

    // ─── V2 NEW CASES (Wave 3b / P2a) ───

    case "StatsBand": {
      const stats = coerceStatsItems(parsedItems);
      if (stats.length === 0) return <UnknownSection section={section} />;
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
      // Body = quote text, author auto = persona OEC.
      return (
        <>
          <QuoteBlock
            quote={body}
            author={legalEntity.presidentName}
            role={`${legalEntity.presidentTitle}, Expert-comptable`}
            variant="citation"
          />
          <CitationsFooter citations={citations} />
        </>
      );

    case "SimulatorTeaser":
      // Composant standalone : lit ses 4 simulateurs hardcoded (defaultSimulators).
      return (
        <SimulatorTeaser
          {...(title && { title })}
          {...(body && { subtitle: body })}
        />
      );

    case "PricingTeaser": {
      // Prefer items emitted by Gemini ; fallback to DB pricing_tiers.
      let tiers = coercePricingItems(parsedItems);
      if (tiers.length === 0) {
        try {
          tiers = db.getPricingTiers().map(pricingTierToProp);
        } catch (e) {
          if (process.env.NODE_ENV !== "production") {
            console.warn("[DynamicSection] PricingTeaser DB read failed:", e);
          }
          tiers = [];
        }
      }
      if (tiers.length === 0) return <UnknownSection section={section} />;
      return (
        <>
          {body && (
            <p className="mb-4 max-w-prose text-base leading-relaxed text-ardoise">
              {body}
            </p>
          )}
          <PricingTeaser
            {...(title && { title })}
            tiers={tiers}
          />
          <CitationsFooter citations={citations} />
        </>
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
      // Read DB by profession slug if we're on the /professions/ route.
      // For other routes (secteurs/villes/...), fallback to a generic pull.
      let testimonials: Testimonial[] = [];
      try {
        if (section.route === "professions") {
          testimonials = db.getTestimonialsByProfession(section.slug, 6);
        } else if (section.route === "secteurs") {
          testimonials = db.getTestimonialsBySecteur(section.slug, 6);
        } else if (section.route === "villes") {
          testimonials = db.getTestimonialsByVille(section.slug, 6);
        } else {
          // Generic — pick 3 featured testimonials.
          testimonials = db
            .getTestimonials()
            .filter((t) => t.featured)
            .slice(0, 6);
        }
      } catch (e) {
        if (process.env.NODE_ENV !== "production") {
          console.warn("[DynamicSection] TestimonialSlider DB read failed:", e);
        }
        testimonials = [];
      }
      if (testimonials.length === 0) return null;
      return (
        <TestimonialSlider
          {...(title && { title })}
          testimonials={testimonials.map(dbTestimonialToProp)}
        />
      );
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
      if (items.length === 0) return <UnknownSection section={section} />;
      return (
        <>
          <ServiceMatrixInline title={title} body={body} items={items} />
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

    default:
      return <UnknownSection section={section} />;
  }
}

// ─── Re-exports for consumers that want to introspect or override ───
// (kept minimal; do not expand without a use-case)
export type { PageSection };

// Mark as intentionally exported helper to silence lint if unused elsewhere.
export const _internals = { asObjectArray };
