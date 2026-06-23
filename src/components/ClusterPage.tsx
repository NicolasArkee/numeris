import Link from "next/link";
import { AppConfig } from "@/utils/AppConfig";
import {
  ArticleJsonLd,
  BreadcrumbJsonLd,
  FaqJsonLd,
  PersonJsonLd,
  WebPageJsonLd,
} from "./JsonLd";
import { InternalLinks } from "./InternalLinks";
import { ExpertAuthorBox } from "./ExpertAuthorBox";
import { LastUpdated } from "./LastUpdated";
import { KeyTakeaways } from "./KeyTakeaways";
import { CtaContact } from "./CtaContact";
import { StickyMobileCTA } from "./StickyMobileCTA";
import type { LinkGroup } from "@/libs/db";

interface ClusterPageProps {
  eyebrow: string;
  h1: string;
  intro: string;
  breadcrumbs: { name: string; url: string }[];
  badges?: string[];
  faqs?: { question: string; answer: string }[];
  linkGroups: LinkGroup[];
  keyTakeaways?: string[];
  children?: React.ReactNode;
  schema?: React.ReactNode;
  /** ISO 8601 (page_meta.reviewed_at). Fallback : `new Date().toISOString()`. */
  lastUpdatedDate?: string;
  /** Si true, émet ArticleJsonLd + PersonJsonLd. */
  articleSchema?: boolean;
  /** Headline pour ArticleJsonLd. Fallback : h1. */
  articleHeadline?: string;
  /** Section éditoriale pour ArticleJsonLd (ex: "Professions libérales"). */
  articleSection?: string;
  /** Canonical URL pour ArticleJsonLd.mainEntityOfPage. Fallback : breadcrumb final. */
  canonicalUrl?: string;
  /** Label du signal de revue affiche sous le hero. */
  reviewLabel?: string;
}

export function ClusterPage({
  eyebrow,
  h1,
  intro,
  breadcrumbs,
  badges,
  faqs,
  linkGroups,
  keyTakeaways,
  children,
  schema,
  lastUpdatedDate,
  articleSchema,
  articleHeadline,
  articleSection,
  canonicalUrl,
  reviewLabel,
}: ClusterPageProps) {
  const currentUrl = breadcrumbs[breadcrumbs.length - 1]?.url || "/";
  const effectiveDate = lastUpdatedDate || new Date().toISOString();
  const effectiveDateShort = effectiveDate.split("T")[0];
  const effectiveCanonical = canonicalUrl || `${AppConfig.url}${currentUrl}`;

  return (
    <>
      <BreadcrumbJsonLd items={breadcrumbs} />
      {faqs && faqs.length > 0 && <FaqJsonLd items={faqs} />}
      <WebPageJsonLd
        name={h1}
        description={intro}
        url={currentUrl}
        dateModified={effectiveDateShort}
      />
      {articleSchema && (
        <>
          <PersonJsonLd />
          <ArticleJsonLd
            headline={articleHeadline || h1}
            datePublished={effectiveDate}
            dateModified={effectiveDate}
            mainEntityOfPage={effectiveCanonical}
            description={intro}
            articleSection={articleSection}
          />
        </>
      )}
      {schema}

      {/* Hero */}
      <section className="relative overflow-hidden bg-brand-ink px-6 py-20 lg:px-[4.5rem] lg:py-24">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-32 -bottom-32 h-130 w-130 rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(255,107,53,0.15) 0%, rgba(255,107,53,0) 60%)",
          }}
        />
        <div className="relative z-10 mx-auto max-w-[82rem]">
          {/* Breadcrumbs */}
          <nav aria-label="Fil d'Ariane" className="mb-8">
            <ol className="flex flex-wrap items-center gap-1.5 text-[0.78rem] text-white/70">
              {breadcrumbs.map((item, i) => (
                <li key={item.url} className="flex items-center gap-1.5">
                  {i > 0 && <span>/</span>}
                  {i < breadcrumbs.length - 1 ? (
                    <Link href={item.url} className="transition-colors hover:text-accent-500">
                      {item.name}
                    </Link>
                  ) : (
                    <span className="text-white/90">{item.name}</span>
                  )}
                </li>
              ))}
            </ol>
          </nav>

          <div className="mb-6 flex items-center gap-3.5">
            <span className="block h-px w-7 bg-accent-500" />
            <span className="text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-accent-500">
              {eyebrow}
            </span>
          </div>

          <h1 className="mb-6 max-w-3xl font-display text-[2.25rem] font-bold leading-[1.12] tracking-tight text-surface lg:text-[3.25rem]">
            {h1}
          </h1>

          <p className="mb-8 max-w-2xl text-[1.05rem] leading-relaxed text-white/85" data-speakable="true">
            {intro}
          </p>

          {badges && badges.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {badges.map((badge) => (
                <span
                  key={badge}
                  className="border border-white/20 px-3 py-1.5 text-[0.72rem] font-medium text-white/80"
                >
                  {badge}
                </span>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Content */}
      <article className="bg-bg px-6 pt-20 pb-28 lg:px-[4.5rem] lg:py-20">
        <div className="mx-auto max-w-[82rem]">
          {/* Freshness + E-E-A-T signals */}
          <div className="mb-10">
            <LastUpdated
              date={lastUpdatedDate}
              readingTime="3 min"
              reviewLabel={reviewLabel}
            />
          </div>

          {/* Key takeaways (featured snippet targeting) */}
          {keyTakeaways && keyTakeaways.length > 0 && (
            <div className="mb-12 max-w-[72rem]">
              <KeyTakeaways items={keyTakeaways} />
            </div>
          )}

          {children}

          {/* CTA mid-page (mini-banner) — placée après le body editorial, avant FAQ */}
          <aside
            className="mt-16 flex flex-col items-start gap-5 border border-border-soft border-l-2 border-l-accent-500 bg-surface p-7 lg:flex-row lg:items-center lg:justify-between"
            aria-label="Contact rapide"
          >
            <div>
              <p className="font-display text-[1.15rem] font-bold text-ink">
                Une question sur votre situation&nbsp;?
              </p>
              <p className="mt-1 text-[0.8rem] text-ink-muted">
                Recevez une orientation pour comparer les options pertinentes.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 bg-accent-500 px-6 py-3 font-body text-[0.82rem] font-semibold text-brand-ink transition-colors hover:bg-accent-700"
              >
                Demander une orientation →
              </Link>
              <Link
                href={`tel:${AppConfig.phone.replace(/\s/g, "")}`}
                className="border border-border-soft px-5 py-3 font-body text-[0.82rem] text-ink-muted transition-colors hover:border-accent-500 hover:text-accent-700"
              >
                {AppConfig.phone}
              </Link>
            </div>
          </aside>

          {/* FAQ */}
          {faqs && faqs.length > 0 && (
            <div className="mt-16" id="faq">
              <h2 className="mb-8 font-display text-[1.75rem] font-bold leading-tight text-ink">
                Questions fréquentes
              </h2>
              <div className="grid gap-4">
                {faqs.map((faq) => (
                  <details
                    key={faq.question}
                    className="group border border-border-soft bg-surface"
                  >
                    <summary className="flex cursor-pointer items-center justify-between px-7 py-5 text-[0.95rem] font-medium text-ink transition-colors hover:text-accent-700">
                      {faq.question}
                      <span className="ml-4 text-[0.8rem] text-border-soft transition-transform group-open:rotate-45">
                        +
                      </span>
                    </summary>
                    <div className="max-w-prose border-t border-border-soft px-7 py-5 text-base leading-relaxed text-ink-muted">
                      {faq.answer}
                    </div>
                  </details>
                ))}
              </div>
            </div>
          )}

          {/* Expert author box (E-E-A-T) */}
          <div className="mt-12">
            <ExpertAuthorBox date={lastUpdatedDate} />
          </div>

          {/* Internal Links */}
          <div className="mt-16">
            <InternalLinks groups={linkGroups} />
          </div>
        </div>
      </article>

      {/* CTA footer dense — full component avec formulaire de rappel */}
      <CtaContact />

      {/* Sticky mobile bottom bar — visible <800px après scroll 600px */}
      <StickyMobileCTA />
    </>
  );
}
