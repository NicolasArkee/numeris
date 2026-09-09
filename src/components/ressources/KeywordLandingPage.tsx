import Link from "next/link";
import { ClusterPage } from "@/components/ClusterPage";
import { CtaContact } from "@/components/CtaContact";
import { InternalLinks } from "@/components/InternalLinks";
import { BreadcrumbJsonLd, FaqJsonLd, WebPageJsonLd } from "@/components/JsonLd";
import { KeyTakeaways } from "@/components/KeyTakeaways";
import { LastUpdated } from "@/components/LastUpdated";
import { MaillageLinks } from "@/components/MaillageLinks";
import { PageHero } from "@/components/PageHero";
import { SimulatorTeaser } from "@/components/SimulatorTeaser";
import {
  AnchoredDynamicSection,
  buildEditorialSectionEntries,
  editorialTocItems,
  EditorialSectionStream,
} from "@/components/hubs/editorial/EditorialSections";
import { EditorialToc } from "@/components/hubs/editorial/EditorialToc";
import {
  EDITORIAL_DECISION_TOC,
  EditorialContextWorkshop,
  EditorialScenarioLab,
  EditorialVerificationPlan,
} from "@/components/hubs/editorial/EditorialDecisionSupport";
import { buildNearbyDirectoryCityLinks } from "@/components/directory/city-v2-helpers";
import { db } from "@/libs/db";
import type { DirectoryCity, LinkGroup, PageSection } from "@/libs/db";
import type { KeywordClass } from "@/libs/ressources/keyword-lp-helpers";
import { AppConfig } from "@/utils/AppConfig";
import { KeywordLocalCabinets } from "./KeywordLocalCabinets";
import { FaqAccordion } from "@/components/editorial/FaqAccordion";
import type { DbPagePublication } from "@/libs/content/dbFirst";

export interface KeywordLandingPageProps {
  cls: KeywordClass;
  h1: string;
  intro: string;
  eyebrow: string;
  breadcrumbs: { name: string; url: string }[];
  canonicalUrl: string;
  linkGroups: LinkGroup[];
  /** Sections publiées de page_sections, déjà filtrées par getDbPageBundle. */
  sections: PageSection[];
  keyTakeaways?: string[];
  faqs: { question: string; answer: string }[];
  inlineFaq: boolean;
  city?: DirectoryCity | null;
  cabinetCount?: number;
  themeLabel?: string;
  themeHref?: string;
  lastUpdatedDate?: string;
  publication?: DbPagePublication;
  schema?: React.ReactNode;
}

function lpMedia(cls: KeywordClass) {
  if (cls === "geo" || cls === "geo-theme") {
    return {
      src: "/images/skoria-v2/editorial/cityscape.webp",
      alt: "Maquette abstraite d’un quartier français et de ses implantations professionnelles",
    };
  }
  if (cls === "navigational") {
    return {
      src: "/images/skoria-v2/editorial/objects.webp",
      alt: "Documents et objets de comparaison organisés sur une table",
    };
  }
  return {
    src: "/images/skoria-v2/editorial/accounting-flow.webp",
    alt: "Composition illustrant un flux de documents comptables",
  };
}

function publishedSectionWordCount(sections: readonly PageSection[]): number {
  return sections
    .flatMap((section) => [section.title, section.body, section.items])
    .filter((value): value is string => Boolean(value))
    .join(" ")
    .replace(/<[^>]+>/gu, " ")
    .replace(/[\[\]{}":,]/gu, " ")
    .trim()
    .split(/\s+/u)
    .filter(Boolean).length;
}

/**
 * Les requêtes informationnelles deviennent de vrais articles longs. Les
 * intentions locales, commerciales et navigationnelles gardent une structure
 * de landing page, enrichie par tout le contenu éditorial publié.
 */
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
  cabinetCount = 0,
  themeLabel,
  themeHref,
  lastUpdatedDate,
  publication,
  schema,
}: KeywordLandingPageProps) {
  const canonicalPath = canonicalUrl.startsWith(AppConfig.url)
    ? canonicalUrl.slice(AppConfig.url.length) || "/"
    : canonicalUrl;
  const isGeo = (cls === "geo" || cls === "geo-theme") && Boolean(city);
  const isInformational = cls === "informational";
  const showScopePrimer = cls !== "navigational" && !isInformational;
  const showSimulators = cls !== "navigational" && !isInformational;
  const showFaq = !inlineFaq && faqs.length > 0;

  if (isInformational) {
    const entries = buildEditorialSectionEntries(sections);
    const needsDecisionSupport = publishedSectionWordCount(sections) < 1_500;
    const tocItems = [
      ...editorialTocItems(entries),
      ...(needsDecisionSupport ? EDITORIAL_DECISION_TOC : []),
    ];
    return (
      <ClusterPage
        eyebrow={eyebrow}
        h1={h1}
        intro={intro}
        breadcrumbs={breadcrumbs}
        faqs={showFaq ? faqs : undefined}
        linkGroups={linkGroups}
        keyTakeaways={keyTakeaways}
        schema={schema}
        lastUpdatedDate={lastUpdatedDate}
        publication={publication}
        articleSchema
        articleHeadline={h1}
        articleSection="Ressources pratiques"
        canonicalUrl={canonicalUrl}
      >
        <EditorialToc items={tocItems} title="Dans cet article" />
        {entries.map((entry) => (
          <AnchoredDynamicSection key={entry.section.id} entry={entry} />
        ))}
        {needsDecisionSupport && <EditorialContextWorkshop subject={h1} />}
        {needsDecisionSupport && <EditorialScenarioLab subject={h1} />}
        {needsDecisionSupport && <EditorialVerificationPlan subject={h1} />}
      </ClusterPage>
    );
  }

  const nearbyLinks = isGeo
    ? await db
        .getDirectoryListingCities()
        .then((cities) => buildNearbyDirectoryCityLinks(cities, city!, 8))
        .catch(() => [])
    : [];

  return (
    <>
      <BreadcrumbJsonLd items={breadcrumbs} />
      {showFaq && <FaqJsonLd items={faqs} id={`kw-faq-${breadcrumbs.length}`} />}
      <WebPageJsonLd
        name={h1}
        description={intro}
        url={canonicalPath}
        dateModified={lastUpdatedDate?.split("T")[0]}
      />
      {schema}

      <PageHero
        eyebrow={eyebrow}
        title={h1}
        subtitle={intro}
        breadcrumbs={breadcrumbs}
        badges={
          cls === "navigational"
            ? ["Sources publiques", "Présentation indépendante"]
            : ["Parcours guidé", "Repères vérifiables", "Brief exportable"]
        }
        cta={isGeo ? { label: "Voir les cabinets", href: "#cabinets" } : undefined}
        ctaSecondary={{
          label: isGeo ? "Estimer les honoraires" : "Lire les critères",
          href: isGeo ? "/simulateurs/honoraires" : "#contenu",
        }}
        tone={isGeo ? "mint" : cls === "navigational" ? "lilac" : "navy"}
        media={lpMedia(cls)}
      >
        {cls === "commercial" && (
          <button
            type="button"
            data-open-brief
            data-need={h1}
            className="mt-5 inline-flex min-h-12 items-center rounded-full bg-orange px-6 text-[.84rem] font-bold text-navy transition-transform hover:-translate-y-0.5"
          >
            Préparer mon brief&nbsp; ↗
          </button>
        )}
      </PageHero>

      {lastUpdatedDate && (
        <div className="border-b border-ink/10 bg-apricot px-5 py-5 sm:px-8">
          <div className="mx-auto max-w-7xl">
            <LastUpdated date={lastUpdatedDate} reviewLabel="Données et contenu vérifiés" />
          </div>
        </div>
      )}

      <div id="contenu" className="scroll-mt-36">
        {cls === "navigational" && (
          <aside className="bg-apricot px-5 py-8 sm:px-8">
            <div className="mx-auto max-w-7xl rounded-[1rem] border border-ink/12 bg-white px-6 py-5 text-[.9rem] leading-7 text-ink-muted">
              <strong className="text-ink">{AppConfig.name} est un comparateur indépendant.</strong>{" "}
              Cette page présente une offre tierce à titre informatif, sans affiliation avec la marque citée, à partir d’informations publiques.
            </div>
          </aside>
        )}

        {isGeo && (
          <section className="bg-mint px-5 py-12 sm:px-8 lg:py-16">
            <div className="mx-auto grid max-w-7xl overflow-hidden rounded-[1.25rem] border border-ink/12 bg-white sm:grid-cols-3">
              <div className="border-b border-ink/12 p-7 sm:border-b-0 sm:border-r">
                <p className="font-serif text-[clamp(2.1rem,5vw,3.5rem)] leading-none text-blue">
                  {city!.population.toLocaleString("fr-FR")}
                </p>
                <p className="mt-3 text-[.76rem] text-ink-muted">habitants à {city!.name}</p>
              </div>
              <div className="border-b border-ink/12 p-7 sm:border-b-0 sm:border-r">
                <p className="text-[1.35rem] font-semibold leading-tight text-ink">
                  {city!.department_name ?? city!.department_code ?? "Territoire local"}
                </p>
                <p className="mt-3 text-[.76rem] text-ink-muted">zone de recherche</p>
              </div>
              <div className="p-7">
                <p className="font-serif text-[clamp(2.1rem,5vw,3.5rem)] leading-none text-blue">
                  {cabinetCount > 0 ? cabinetCount.toLocaleString("fr-FR") : "Local"}
                </p>
                <p className="mt-3 text-[.76rem] text-ink-muted">
                  {cabinetCount > 0 ? `cabinet${cabinetCount > 1 ? "s" : ""} recensé${cabinetCount > 1 ? "s" : ""}` : "recherche dans l’annuaire"}
                </p>
              </div>
            </div>
          </section>
        )}

        {keyTakeaways && keyTakeaways.length > 0 && (
          <section className="bg-lilac px-5 py-14 sm:px-8 lg:py-20">
            <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[.65fr_1.35fr]">
              <div>
                <p className="text-[.65rem] font-bold uppercase tracking-[.2em] text-blue">Avant de comparer</p>
                <h2 className="mt-4 text-balance text-[clamp(2.2rem,5vw,3.8rem)] font-semibold leading-[1.03] tracking-[-.04em] text-ink">
                  Les repères à garder sous la main.
                </h2>
              </div>
              <KeyTakeaways items={keyTakeaways} />
            </div>
          </section>
        )}

        <EditorialSectionStream sections={sections} tocTitle="Dans cette page" />

        {isGeo && (
          <section className="bg-white px-5 py-16 sm:px-8 lg:py-20">
            <div className="mx-auto max-w-7xl">
              <KeywordLocalCabinets city={city!} limit={6} />
            </div>
          </section>
        )}

        {isGeo && themeLabel && themeHref && (
          <section className="bg-apricot px-5 py-14 sm:px-8">
            <div className="mx-auto max-w-7xl">
              <Link href={themeHref} className="group grid gap-5 rounded-[1.2rem] bg-navy p-7 text-white sm:p-10 lg:grid-cols-[.65fr_1.35fr] lg:items-end">
                <p className="text-[.65rem] font-bold uppercase tracking-[.2em] text-[#ffb293]">Guide métier associé</p>
                <p className="text-balance text-[clamp(1.8rem,4vw,3.3rem)] font-semibold leading-tight">
                  Expertise comptable pour {themeLabel}
                  <span aria-hidden className="ml-3 inline-block text-[#ffb293] transition-transform group-hover:translate-x-1">↗</span>
                </p>
              </Link>
            </div>
          </section>
        )}

        {showScopePrimer && (
          <section className="bg-paper px-5 py-16 sm:px-8 lg:py-20">
            <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[.72fr_1.28fr] lg:gap-20">
              <div>
                <p className="text-[.65rem] font-bold uppercase tracking-[.2em] text-blue">Préparer un devis comparable</p>
                <h2 className="mt-4 text-balance text-[clamp(2.2rem,5vw,3.9rem)] font-semibold leading-[1.03] text-ink">
                  Le prix devient lisible quand le périmètre est précis.
                </h2>
              </div>
              <div className="space-y-6 text-[.94rem] leading-7 text-ink-muted">
                <p>
                  Le volume de pièces, les déclarations, les outils, la fréquence des échanges et les travaux ponctuels peuvent modifier une proposition. Décrivez ces éléments avant de demander un chiffrage.
                </p>
                <p>
                  Demandez ensuite à chaque interlocuteur ce qui est inclus, ce qui reste à votre charge et ce qui fera l’objet d’un montant séparé. Vous comparerez ainsi des missions de même portée.
                </p>
                <button
                  type="button"
                  data-open-brief
                  data-need={h1}
                  className="inline-flex min-h-12 items-center rounded-full bg-blue px-6 text-[.84rem] font-bold text-white"
                >
                  Préparer mon périmètre&nbsp; ↗
                </button>
              </div>
            </div>
          </section>
        )}

        {showFaq && (
          <section id="faq" className="scroll-mt-36 bg-lilac px-5 py-16 sm:px-8 lg:py-20">
            <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[.68fr_1.32fr] lg:gap-20">
              <div>
                <p className="text-[.65rem] font-bold uppercase tracking-[.2em] text-blue">Questions fréquentes</p>
                <h2 className="mt-4 text-[clamp(2.2rem,5vw,3.9rem)] font-semibold leading-[1.03] text-ink">
                  Clarifier les points locaux avant de choisir.
                </h2>
              </div>
              <FaqAccordion items={faqs} />
            </div>
          </section>
        )}

        {nearbyLinks.length > 0 && (
          <section className="bg-mint px-5 py-14 sm:px-8">
            <div className="mx-auto max-w-7xl">
              <h2 className="text-[1.35rem] font-semibold text-ink">Experts-comptables à proximité</h2>
              <div className="mt-5 flex flex-wrap gap-2">
                {nearbyLinks.map((link) => (
                  <Link key={link.href} href={link.href} className="rounded-full border border-ink/15 bg-white px-4 py-2 text-[.76rem] font-bold text-ink-muted hover:border-blue hover:text-blue">
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        <section className="bg-white px-5 py-16 sm:px-8 lg:py-20">
          <div className="mx-auto max-w-7xl">
            <MaillageLinks sourceUrl={canonicalUrl} />
            {linkGroups.length > 0 && (
              <div className="mt-12"><InternalLinks groups={linkGroups} /></div>
            )}
          </div>
        </section>
      </div>

      {showSimulators && <SimulatorTeaser />}
      <CtaContact />
    </>
  );
}
