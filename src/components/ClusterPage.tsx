import Image from "next/image";
import Link from "next/link";
import React from "react";
import { AppConfig } from "@/utils/AppConfig";
import {
  ArticleJsonLd,
  BreadcrumbJsonLd,
  FaqJsonLd,
  WebPageJsonLd,
} from "./JsonLd";
import { InternalLinks } from "./InternalLinks";
import { ExpertAuthorBox } from "./ExpertAuthorBox";
import { LastUpdated } from "./LastUpdated";
import { KeyTakeaways } from "./KeyTakeaways";
import { MaillageLinks } from "./MaillageLinks";
import type { LinkGroup } from "@/libs/db";
import contentContract from "@/data/skoria-v2/content-contract.json";
import type { DbPagePublication } from "@/libs/content/dbFirst";
import { getMediaById } from "@/libs/skoria-v2/registry";
import { FaqAccordion } from "./editorial/FaqAccordion";

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
  lastUpdatedDate?: string;
  publication?: DbPagePublication;
  articleSchema?: boolean;
  articleHeadline?: string;
  articleSection?: string;
  canonicalUrl?: string;
  reviewLabel?: string;
}

type EditorialMedia = {
  src: string;
  alt: string;
  position?: string;
  peopleFictional?: boolean;
};

function mediaForPage(path: string, h1: string): EditorialMedia {
  const value = `${path} ${h1}`.toLowerCase();
  const citySlug = path.match(/^\/villes\/([^/?#]+)/)?.[1];
  if (citySlug) {
    const cityMedia = getMediaById(`city-${citySlug}`);
    if (cityMedia?.status === "approved") return { src: cityMedia.src, alt: cityMedia.alt };
  }
  if (value.includes("medecin") || value.includes("médecin")) {
    return {
      src: "/images/skoria-v2/editorial/doctor.webp",
      alt: "Médecin préparant ses documents dans son cabinet",
      position: "52% center",
      peopleFictional: true,
    };
  }
  if (value.includes("restauration") || value.includes("restaurant")) {
    return {
      src: "/images/skoria-v2/editorial/restaurant.webp",
      alt: "Restaurateur préparant son activité au comptoir",
      position: "35% center",
      peopleFictional: true,
    };
  }
  if (value.includes("/guides/lmnp/") && path.split("/").filter(Boolean).length > 2) {
    return {
      src: "/images/skoria-v2/editorial/lmnp-dossier.webp",
      alt: "Dossier de location meublée, plan simplifié et clés sur une table",
    };
  }
  if (value.includes("lmnp") || value.includes("meubl")) {
    return {
      src: "/images/skoria-v2/editorial/apartment.webp",
      alt: "Appartement meublé lumineux avec table et carnet",
    };
  }
  if (value.includes("/comparatifs") || value.includes("/avis") || value.includes("/codes-parrainage")) {
    return {
      src: "/images/skoria-v2/editorial/fintech-tools.webp",
      alt: "Carte de paiement sans marque, terminal et carnet sur une table",
    };
  }
  if (value.includes("annuaire") || value.includes("ville") || value.includes("cabinet")) {
    return {
      src: "/images/skoria-v2/editorial/cityscape.webp",
      alt: "Maquette abstraite d’un quartier français",
    };
  }
  if (value.includes("expertise") || value.includes("comptabilit") || value.includes("fiscal")) {
    return {
      src: "/images/skoria-v2/editorial/accounting-flow.webp",
      alt: "Composition illustrant un flux de documents comptables",
    };
  }
  if (value.includes("profession") || value.includes("secteur")) {
    return {
      src: "/images/skoria-v2/editorial/atelier.webp",
      alt: "Architecte travaillant sur une maquette dans son atelier",
      position: "62% center",
      peopleFictional: true,
    };
  }
  return {
    src: "/images/skoria-v2/editorial/objects.webp",
    alt: "Documents et objets de calcul disposés en composition éditoriale",
  };
}

const THEME_CLASS: Record<string, string> = {
  white: "bg-white",
  paper: "bg-paper",
  lilac: "bg-lilac",
  mint: "bg-mint",
  apricot: "bg-apricot",
};

const BAND_STYLES = contentContract.defaults.themeCycle.map(
  (theme) => THEME_CLASS[theme] ?? "bg-paper",
);

function isStructuredDataElement(child: React.ReactNode): boolean {
  if (!React.isValidElement(child)) return false;
  if (typeof child.type !== "function") return false;
  return /JsonLd|ExtraJsonLd/.test(child.type.name || "");
}

/**
 * Shell V2 pour les LP, dossiers et pages commerciales alimentées par la base.
 * Le contrat historique est conservé afin que les longues traînes changent de
 * composition sans migration simultanée de leur contenu.
 */
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
  publication,
  articleSchema,
  articleHeadline,
  articleSection,
  canonicalUrl,
  reviewLabel,
}: ClusterPageProps) {
  const currentUrl = breadcrumbs[breadcrumbs.length - 1]?.url || "/";
  const effectiveModifiedDate = publication?.reviewedAt ?? lastUpdatedDate;
  const effectiveDateShort = effectiveModifiedDate?.split("T")[0];
  const effectiveCanonical = canonicalUrl || `${AppConfig.url}${currentUrl}`;
  const isEditorialArticle = Boolean(
    articleSchema && articleSection && /guide|ressource/i.test(articleSection),
  );
  const media = mediaForPage(currentUrl, h1);
  const contentBlocks = React.Children.toArray(children);

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
      {isEditorialArticle && publication?.publishedAt && effectiveModifiedDate && (
        <ArticleJsonLd
          headline={articleHeadline || h1}
          datePublished={publication.publishedAt}
          dateModified={effectiveModifiedDate}
          mainEntityOfPage={effectiveCanonical}
          description={intro}
          articleSection={articleSection}
          authorId={publication.authorPersonaId}
          reviewedById={publication.reviewedBy}
        />
      )}
      {schema}

      <section className="overflow-hidden bg-navy text-white">
        <div className="mx-auto grid max-w-[90rem] lg:min-h-[40rem] lg:grid-cols-[1.08fr_.92fr]">
          <div className="flex flex-col justify-center px-5 py-14 sm:px-8 lg:px-14 lg:py-20 xl:pl-20">
            <nav aria-label="Fil d'Ariane">
              <ol className="flex flex-wrap items-center gap-2 text-[.72rem] text-white/58">
                {breadcrumbs.map((item, index) => (
                  <li key={item.url} className="flex items-center gap-2">
                    {index > 0 && <span aria-hidden>·</span>}
                    {index < breadcrumbs.length - 1 ? (
                      <Link href={item.url} className="underline-offset-4 hover:text-white hover:underline">
                        {item.name}
                      </Link>
                    ) : (
                      <span aria-current="page">{item.name}</span>
                    )}
                  </li>
                ))}
              </ol>
            </nav>

            <p className="mt-10 text-[.67rem] font-bold uppercase tracking-[.2em] text-[#ffb293]">{eyebrow}</p>
            <h1 className="mt-5 max-w-[52rem] text-balance font-display text-[clamp(3.1rem,6.7vw,5.9rem)] font-semibold leading-[.96] tracking-[-.052em]">
              {h1}
            </h1>
            <p className="mt-7 max-w-[43rem] text-[1.04rem] leading-8 text-white/75 lg:text-[1.14rem]" data-speakable="true">
              {intro}
            </p>
            {badges && badges.length > 0 && (
              <div className="mt-7 flex flex-wrap gap-2">
                {badges.map((badge) => (
                  <span key={badge} className="rounded-full border border-white/20 px-3 py-1.5 text-[.7rem] text-white/80">
                    {badge}
                  </span>
                ))}
              </div>
            )}
            <div className="mt-9 flex flex-wrap gap-3">
              <button
                type="button"
                data-open-brief
                data-need={h1}
                className="inline-flex min-h-12 items-center rounded-full bg-orange px-6 text-[.84rem] font-bold text-navy transition-transform hover:-translate-y-0.5"
              >
                Préparer mon brief&nbsp; ↗
              </button>
              <a href="#contenu" className="inline-flex min-h-12 items-center rounded-full border border-white/25 px-6 text-[.82rem] font-bold text-white hover:bg-white hover:text-navy">
                Lire le guide
              </a>
            </div>
          </div>

          <figure className="relative min-h-[28rem] overflow-hidden lg:min-h-full">
            <Image
              src={media.src}
              alt={media.alt}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 46vw"
              className="object-cover"
              style={{ objectPosition: media.position ?? "center" }}
            />
            <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-navy/45 via-transparent to-transparent" />
            <figcaption className="absolute bottom-4 left-4 right-4 w-fit rounded-2xl bg-navy/85 px-4 py-2 text-[.65rem] leading-5 text-white/85 backdrop-blur-sm">
              {media.peopleFictional ? "Illustration générée par IA, personne fictive." : "Illustration éditoriale générée par IA."}
            </figcaption>
          </figure>
        </div>
      </section>

      <div className="border-b border-ink/10 bg-apricot px-5 py-5 sm:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <LastUpdated date={effectiveModifiedDate} reviewLabel={reviewLabel} />
          <p className="max-w-2xl text-[.72rem] leading-5 text-ink-muted">
            Contenu informatif et comparatif. Les besoins, responsabilités et conditions se confirment directement avec le professionnel retenu.
          </p>
        </div>
      </div>

      <nav aria-label="Dans cette page" className="sticky top-[var(--sticky-header-height,72px)] z-20 overflow-x-auto border-b border-ink/10 bg-white/92 px-5 backdrop-blur-md sm:px-8">
        <div className="mx-auto flex min-w-max max-w-7xl items-center gap-1 py-3">
          {keyTakeaways && keyTakeaways.length > 0 && (
            <a href="#essentiel" className="rounded-full px-4 py-2 text-[.72rem] font-bold text-ink hover:bg-lilac">L’essentiel</a>
          )}
          <a href="#contenu" className="rounded-full px-4 py-2 text-[.72rem] font-bold text-ink hover:bg-lilac">Comprendre</a>
          <a href="#methode" className="rounded-full px-4 py-2 text-[.72rem] font-bold text-ink hover:bg-lilac">Méthode</a>
          {faqs && faqs.length > 0 && <a href="#faq" className="rounded-full px-4 py-2 text-[.72rem] font-bold text-ink hover:bg-lilac">Questions</a>}
          <a href="#suite" className="rounded-full px-4 py-2 text-[.72rem] font-bold text-ink hover:bg-lilac">Continuer</a>
        </div>
      </nav>

      {keyTakeaways && keyTakeaways.length > 0 && (
        <section id="essentiel" className="scroll-mt-36 bg-mint px-5 py-14 sm:px-8 lg:py-18">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-8 lg:grid-cols-[.65fr_1.35fr]">
              <div>
                <p className="text-[.66rem] font-bold uppercase tracking-[.2em] text-blue">À retenir avant de comparer</p>
                <h2 className="mt-4 text-[clamp(2rem,4vw,3.4rem)] font-semibold leading-tight text-ink">
                  Les repères qui structurent votre décision.
                </h2>
              </div>
              <KeyTakeaways items={keyTakeaways} />
            </div>
          </div>
        </section>
      )}

      <article id="contenu" className="scroll-mt-36">
        {contentBlocks.map((child, index) => {
          if (isStructuredDataElement(child)) return <React.Fragment key={`schema-${index}`}>{child}</React.Fragment>;
          const background = BAND_STYLES[index % BAND_STYLES.length];
          return (
            <section key={`block-${index}`} className={`${background} px-5 py-14 sm:px-8 lg:py-20`}>
              <div className="mx-auto max-w-7xl">{child}</div>
            </section>
          );
        })}
      </article>

      <section id="methode" className="scroll-mt-36 bg-navy px-5 py-16 text-white sm:px-8 lg:py-20">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[.78fr_1.22fr] lg:gap-20">
          <div>
            <p className="text-[.65rem] font-bold uppercase tracking-[.2em] text-[#ffb293]">Méthode Skoria</p>
            <h2 className="mt-4 text-[clamp(2.3rem,5vw,4rem)] font-semibold leading-[1.03] tracking-[-.04em]">
              Comparez des périmètres, pas des slogans.
            </h2>
          </div>
          <div className="grid gap-px bg-white/18 sm:grid-cols-3">
            {[
              ["01", "Décrire", "Votre activité, vos volumes, vos outils et les échéances à reprendre."],
              ["02", "Questionner", "Les livrables, les responsabilités, les échanges et les limites de la mission."],
              ["03", "Confronter", "Les réponses et les propositions avec la même grille de lecture."],
            ].map(([number, title, copy]) => (
              <div key={number} className="bg-navy p-6">
                <span className="font-serif text-[2.6rem] text-[#ffb293]">{number}</span>
                <h3 className="mt-5 text-lg font-semibold">{title}</h3>
                <p className="mt-3 text-[.82rem] leading-6 text-white/65">{copy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="suite" className="scroll-mt-36 bg-paper px-5 py-16 sm:px-8 lg:py-20">
        <div className="mx-auto max-w-7xl">
          <MaillageLinks sourceUrl={effectiveCanonical} />
          {linkGroups.length > 0 && (
            <div className="mt-12">
              <InternalLinks groups={linkGroups} />
            </div>
          )}
        </div>
      </section>

      {faqs && faqs.length > 0 && (
        <section id="faq" className="scroll-mt-36 bg-lilac px-5 py-16 sm:px-8 lg:py-20">
          <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[.7fr_1.3fr] lg:gap-20">
            <div>
              <p className="text-[.65rem] font-bold uppercase tracking-[.2em] text-blue">Questions fréquentes</p>
              <h2 className="mt-4 text-[clamp(2.3rem,5vw,3.9rem)] font-semibold leading-[1.03] text-ink">
                Les points à éclaircir avant le premier échange.
              </h2>
            </div>
            <FaqAccordion items={faqs} />
          </div>
        </section>
      )}

      {isEditorialArticle && (
        <section className="bg-white px-5 py-12 sm:px-8">
          <div className="mx-auto max-w-7xl">
            <ExpertAuthorBox date={effectiveModifiedDate} />
          </div>
        </section>
      )}

      <section className="bg-blue px-5 py-14 text-white sm:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-7 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-[.65rem] font-bold uppercase tracking-[.2em] text-white/65">Passer de la lecture à l’échange</p>
            <h2 className="mt-3 max-w-3xl text-balance text-[clamp(2rem,4vw,3.35rem)] font-semibold leading-tight">
              Transformez vos critères en un brief que vous pouvez garder et comparer.
            </h2>
          </div>
          <button type="button" data-open-brief data-need={h1} className="inline-flex min-h-12 shrink-0 items-center justify-center rounded-full bg-orange px-7 text-[.86rem] font-bold text-navy">
            Construire mon brief&nbsp; ↗
          </button>
        </div>
      </section>
    </>
  );
}
