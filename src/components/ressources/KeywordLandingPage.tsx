import Link from "next/link";
import { AppConfig } from "@/utils/AppConfig";
import { db } from "@/libs/db";
import type { DirectoryCity, LinkGroup, PageSection } from "@/libs/db";
import type { KeywordClass } from "@/libs/ressources/keyword-lp-helpers";
import { BreadcrumbJsonLd, FaqJsonLd, WebPageJsonLd } from "@/components/JsonLd";
import { DynamicSection } from "@/components/DynamicSection";
import { InternalLinks } from "@/components/InternalLinks";
import { KeyTakeaways } from "@/components/KeyTakeaways";
import { CtaContact } from "@/components/CtaContact";
import { StickyMobileCTA } from "@/components/StickyMobileCTA";
import { MaillageLinks } from "@/components/MaillageLinks";
import { ContactButton } from "@/components/ContactButton";
import { PricingTeaser } from "@/components/PricingTeaser";
import { SimulatorTeaser } from "@/components/SimulatorTeaser";
import { pricingTierToProp } from "@/components/pricing-shared";
import { buildNearbyDirectoryCityLinks } from "@/components/directory/city-v2-helpers";
import { KeywordLocalCabinets } from "./KeywordLocalCabinets";

export interface KeywordLandingPageProps {
  cls: KeywordClass;
  h1: string;
  intro: string;
  eyebrow: string;
  breadcrumbs: { name: string; url: string }[];
  canonicalUrl: string;
  linkGroups: LinkGroup[];
  /** Sections gen-IA (page_sections) rendues via DynamicSection. */
  sections: PageSection[];
  keyTakeaways?: string[] | undefined;
  /** FAQ data-driven — ignorée si une section Faq gen-IA est déjà rendue. */
  faqs: { question: string; answer: string }[];
  inlineFaq: boolean;
  /** Ville résolue (classes geo / geo-theme). */
  city?: DirectoryCity | null;
  /** Libellé thème (« l'agriculture ») + route riche à mailler. */
  themeLabel?: string | undefined;
  themeHref?: string | undefined;
  lastUpdatedDate?: string | undefined;
  schema?: React.ReactNode;
}

/** Landing page des keyword_pages /ressources — remplace le chrome « article
 *  de blog » (ClusterPage) : hero conversion, blocs data-driven (cabinets
 *  locaux, tarifs, simulateurs), sections gen-IA, FAQ, maillage, CTA.
 *  Pas d'ArticleJsonLd ni de badges volume/intent (footprint outillage SEO). */
export async function KeywordLandingPage({
  cls,
  h1,
  intro,
  eyebrow,
  breadcrumbs,
  canonicalUrl,
  linkGroups,
  sections,
  keyTakeaways,
  faqs,
  inlineFaq,
  city,
  themeLabel,
  themeHref,
  lastUpdatedDate,
  schema,
}: KeywordLandingPageProps) {
  const isGeo = (cls === "geo" || cls === "geo-theme") && !!city;
  const showPricing = cls !== "navigational" && cls !== "informational";
  const showSimulators = cls !== "navigational";
  const showFaq = !inlineFaq && faqs.length > 0;

  const pricingTiers = showPricing
    ? await db.getPricingTiers().then((t) => t.map(pricingTierToProp)).catch(() => [])
    : [];
  const nearbyLinks = isGeo
    ? await db
        .getDirectoryListingCities()
        .then((cities) => buildNearbyDirectoryCityLinks(cities, city!, 8))
        .catch(() => [])
    : [];

  const trustBadges = ["Comparateur indépendant", "Données publiques", "100 % gratuit"];

  return (
    <>
      <BreadcrumbJsonLd items={breadcrumbs} />
      {showFaq && <FaqJsonLd items={faqs} id={`kw-faq-${breadcrumbs.length}`} />}
      <WebPageJsonLd
        name={h1}
        description={intro}
        url={canonicalUrl}
        dateModified={(lastUpdatedDate ?? new Date().toISOString()).split("T")[0]}
      />
      {schema}

      {/* Hero conversion */}
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

          <div className="mb-8 flex flex-wrap items-center gap-3">
            {isGeo ? (
              <Link
                href="#cabinets"
                className="inline-flex items-center gap-2 bg-accent-500 px-6 py-3 font-body text-[0.82rem] font-semibold text-brand-ink transition-colors hover:bg-accent-700"
              >
                Voir les cabinets →
              </Link>
            ) : (
              <ContactButton className="inline-flex items-center gap-2 bg-accent-500 px-6 py-3 font-body text-[0.82rem] font-semibold text-brand-ink transition-colors hover:bg-accent-700">
                Comparer les options →
              </ContactButton>
            )}
            <Link
              href="/simulateurs/honoraires"
              className="border border-white/20 px-5 py-3 font-body text-[0.82rem] text-white/85 transition-colors hover:border-accent-500 hover:text-accent-500"
            >
              Estimer les honoraires
            </Link>
          </div>

          <div className="flex flex-wrap gap-2">
            {trustBadges.map((badge) => (
              <span
                key={badge}
                className="border border-white/20 px-3 py-1.5 text-[0.72rem] font-medium text-white/80"
              >
                ✓ {badge}
              </span>
            ))}
          </div>
        </div>
      </section>

      <div className="bg-bg px-6 pt-16 pb-28 lg:px-[4.5rem] lg:py-16">
        <div className="mx-auto max-w-[82rem]">
          {/* Disclaimer d'indépendance (requêtes marque/plateforme) */}
          {cls === "navigational" && (
            <aside className="mb-12 border border-border-soft border-l-2 border-l-accent-500 bg-surface px-7 py-5 text-[0.9rem] leading-relaxed text-ink-muted">
              <strong className="text-ink">{AppConfig.name} est un comparateur indépendant.</strong>{" "}
              Cette page présente une offre tierce à titre informatif, sans lien commercial ni
              affiliation avec la marque citée, à partir d&apos;informations publiques.
            </aside>
          )}

          {/* Stats locales (LP géo) */}
          {isGeo && (
            <div className="mb-12 grid gap-4 border border-border-soft bg-surface p-7 sm:grid-cols-3">
              <div>
                <p className="font-display text-[1.6rem] font-bold text-ink">
                  {city!.population.toLocaleString("fr-FR")}
                </p>
                <p className="text-[0.78rem] text-ink-muted">habitants à {city!.name}</p>
              </div>
              <div>
                <p className="font-display text-[1.6rem] font-bold text-ink">
                  {city!.department_name ?? city!.department_code ?? "—"}
                </p>
                <p className="text-[0.78rem] text-ink-muted">département</p>
              </div>
              <div>
                <p className="font-display text-[1.6rem] font-bold text-ink">dès 59&nbsp;€/mois</p>
                <p className="text-[0.78rem] text-ink-muted">offres en ligne comparées</p>
              </div>
            </div>
          )}

          {keyTakeaways && keyTakeaways.length > 0 && (
            <div className="mb-12 max-w-[72rem]">
              <KeyTakeaways items={keyTakeaways} />
            </div>
          )}

          {/* Sections éditoriales gen-IA (page_sections) */}
          {sections.map((s) => (
            <DynamicSection key={s.id} section={s} />
          ))}

          {/* Annuaire local (LP géo) */}
          {isGeo && <KeywordLocalCabinets city={city!} limit={6} />}

          {/* Lien thème (LP géo-thème) */}
          {isGeo && themeLabel && themeHref && (
            <div className="mb-12 border border-border-soft bg-surface px-7 py-6">
              <p className="mb-2 text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-accent-500">
                Guide associé
              </p>
              <Link
                href={themeHref}
                className="text-[1.05rem] font-medium text-ink transition-colors hover:text-accent-700"
              >
                Expertise comptable pour {themeLabel} →
              </Link>
            </div>
          )}

          {/* Grille tarifaire (données pricing_tiers) */}
          {pricingTiers.length > 0 && (
            <PricingTeaser title="Ordres de prix des offres comparées" tiers={pricingTiers} />
          )}

          {/* FAQ data-driven */}
          {showFaq && (
            <div className="mt-4 mb-12" id="faq">
              <h2 className="mb-8 font-display text-[1.75rem] font-bold leading-tight text-ink">
                Questions fréquentes
              </h2>
              <div className="grid gap-4">
                {faqs.map((faq) => (
                  <details key={faq.question} className="group border border-border-soft bg-surface">
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

          {/* Villes voisines (LP géo) */}
          {nearbyLinks.length > 0 && (
            <div className="mb-12">
              <h2 className="mb-4 font-display text-[1.25rem] font-bold text-ink">
                Experts-comptables à proximité
              </h2>
              <div className="flex flex-wrap gap-2">
                {nearbyLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="border border-border-soft bg-surface px-3 py-1.5 text-[0.78rem] text-ink-muted transition-colors hover:border-accent-500 hover:text-accent-700"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Maillage interne v3 (table maillage_links) */}
          <MaillageLinks sourceUrl={canonicalUrl} />

          {/* Liens taxonomiques */}
          <div className="mt-16">
            <InternalLinks groups={linkGroups} />
          </div>
        </div>
      </div>

      {/* Simulateurs */}
      {showSimulators && <SimulatorTeaser />}

      <CtaContact />
      <StickyMobileCTA />
    </>
  );
}
