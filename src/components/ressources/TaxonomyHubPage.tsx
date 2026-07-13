import Link from "next/link";
import { BreadcrumbJsonLd, WebPageJsonLd } from "@/components/JsonLd";
import { DynamicSection } from "@/components/DynamicSection";
import { InternalLinks } from "@/components/InternalLinks";
import { CtaContact } from "@/components/CtaContact";
import { StickyMobileCTA } from "@/components/StickyMobileCTA";
import { MaillageLinks } from "@/components/MaillageLinks";
import type { LinkGroup, PageSection } from "@/libs/db";

export interface TaxonomyChild {
  slug: string;
  label: string;
  description?: string | null;
}

export interface TaxonomyHubPageProps {
  h1: string;
  intro: string;
  eyebrow: string;
  breadcrumbs: { name: string; url: string }[];
  canonicalUrl: string;
  /** Sous-pages du thème — la raison d'être de la page, affichées en grille
   *  proéminente juste après le chapeau. */
  children_: TaxonomyChild[];
  childrenTitle: string;
  /** Chapeau éditorial généré (EditoIntro/ContentSection/Faq). */
  sections: PageSection[];
  linkGroups: LinkGroup[];
}

/** Page HUB de la taxonomie /ressources (hubs + clusters) — remplace le chrome
 *  « article » (ClusterPage) : pas de badges volume/mots-clés (footprint
 *  d'outillage SEO), pas de temps de lecture ; le sommaire des sous-pages est
 *  l'élément central. */
export function TaxonomyHubPage({
  h1,
  intro,
  eyebrow,
  breadcrumbs,
  canonicalUrl,
  children_,
  childrenTitle,
  sections,
  linkGroups,
}: TaxonomyHubPageProps) {
  const editoSections = sections.filter((s) => s.section_type !== "Faq" && s.section_type !== "FAQSection_PAA");
  const faqSections = sections.filter((s) => s.section_type === "Faq" || s.section_type === "FAQSection_PAA");

  return (
    <>
      <BreadcrumbJsonLd items={breadcrumbs} />
      <WebPageJsonLd
        name={h1}
        description={intro}
        url={canonicalUrl}
        dateModified={new Date().toISOString().split("T")[0]}
      />

      {/* Hero hub */}
      <section className="relative overflow-hidden bg-brand-ink px-6 py-16 lg:px-[4.5rem] lg:py-20">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.5]"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(255,255,255,0.045) 1px, transparent 1px)",
            backgroundSize: "96px 100%",
          }}
        />
        <div className="relative z-10 mx-auto max-w-[82rem]">
          <nav aria-label="Fil d'Ariane" className="mb-7">
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

          <p className="mb-5 font-mono text-[0.68rem] uppercase tracking-[0.2em] text-accent-300">
            {eyebrow} · dossier
          </p>
          <h1 className="mb-5 max-w-3xl font-display text-[2.1rem] font-extrabold leading-[1.08] tracking-tight text-surface lg:text-[3rem]">
            {h1}
          </h1>
          <p className="max-w-2xl text-[1rem] leading-relaxed text-white/80" data-speakable="true">
            {intro}
          </p>
          {children_.length > 0 && (
            <p className="mt-6 font-mono text-[0.72rem] uppercase tracking-[0.14em] text-white/50">
              {children_.length} guide{children_.length > 1 ? "s" : ""} dans ce dossier
            </p>
          )}
        </div>
      </section>

      <div className="bg-bg px-6 pt-14 pb-24 lg:px-[4.5rem]">
        <div className="mx-auto max-w-[82rem]">
          {/* Sommaire du dossier — la fonction hub, en premier */}
          {children_.length > 0 && (
            <section className="mb-14">
              <h2 className="mb-6 font-display text-[1.4rem] font-bold text-ink">
                {childrenTitle}
              </h2>
              <div className="grid gap-px border border-border bg-border md:grid-cols-2 lg:grid-cols-3">
                {children_.map((child, i) => (
                  <Link
                    key={child.slug}
                    href={`/ressources/${child.slug}`}
                    className="group flex min-h-28 flex-col justify-between bg-surface p-6 transition-colors hover:bg-brand-50"
                  >
                    <span className="font-mono text-[0.65rem] tabular-nums text-accent-700">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="mt-2 font-display text-[0.98rem] font-bold leading-snug text-ink group-hover:text-brand-700">
                      {child.label}
                      <span aria-hidden className="ml-1.5 text-accent-500 opacity-0 transition-opacity group-hover:opacity-100">→</span>
                    </span>
                    {child.description && (
                      <span className="mt-2 line-clamp-2 text-[0.78rem] leading-snug text-ink-muted">
                        {child.description}
                      </span>
                    )}
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Chapeau éditorial généré */}
          {editoSections.map((s) => (
            <DynamicSection key={s.id} section={s} />
          ))}

          {/* FAQ générée */}
          {faqSections.map((s) => (
            <DynamicSection key={s.id} section={s} />
          ))}

          <MaillageLinks sourceUrl={canonicalUrl} />

          <div className="mt-14">
            <InternalLinks groups={linkGroups} />
          </div>
        </div>
      </div>

      <CtaContact />
      <StickyMobileCTA />
    </>
  );
}
