import React from "react";
import Link from "next/link";
import type {
  DirectoryCabinetCard,
  DirectoryEnrichmentSource,
  DirectoryProfileFact,
  DirectoryQualificationSnapshot,
  Profession,
  Service,
} from "@/libs/db";
import { AppConfig } from "@/utils/AppConfig";
import {
  DirectoryEnrichmentPanel,
  filterDirectoryFactsWithLoadedSources,
} from "./DirectoryEnrichmentPanel";
import { DirectoryFactTable } from "./DirectoryFactTable";
import { DirectoryFaq } from "./DirectoryFaq";
import { DirectoryInternalMesh } from "./DirectoryInternalMesh";
import { DirectoryRelatedCabinets } from "./DirectoryRelatedCabinets";
import { DirectoryStaticMap } from "./DirectoryStaticMap";
import {
  buildDirectoryAddress,
  buildDirectoryFactRows,
  buildDirectoryFaqItems,
  buildDirectoryMapPoint,
  directoryDisplayName,
  formatDirectoryDate,
  isDirectoryCabinetVerified,
} from "./profile-v2-helpers";

export function DirectoryVerifiedAccountingServiceJsonLd({
  card,
  path,
  enrichmentFacts = [],
  enrichmentSources = [],
}: {
  card: DirectoryCabinetCard;
  path: string;
  enrichmentFacts?: DirectoryProfileFact[];
  enrichmentSources?: DirectoryEnrichmentSource[];
}) {
  if (!isDirectoryCabinetVerified(card)) return null;

  const point = buildDirectoryMapPoint(card);
  const name = directoryDisplayName(card);
  const displayableFacts = filterDirectoryFactsWithLoadedSources(
    enrichmentFacts,
    enrichmentSources,
  ).filter((fact) => fact.is_displayable === true || fact.is_displayable === 1);
  const website = displayableFacts.find(
    (fact) => fact.fact_type === "website",
  )?.value;
  const phone = displayableFacts.find((fact) => fact.fact_type === "phone")?.value;
  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "AccountingService",
    name,
    url: `${AppConfig.url}${path}`,
    mainEntityOfPage: `${AppConfig.url}${path}`,
    areaServed: card.city
      ? { "@type": "City", name: card.city.name }
      : { "@type": "Country", name: "France" },
    identifier: [
      {
        "@type": "PropertyValue",
        propertyID: "SIRET",
        value: card.establishment.siret,
      },
      ...(card.cabinet.siren
        ? [
            {
              "@type": "PropertyValue",
              propertyID: "SIREN",
              value: card.cabinet.siren,
            },
          ]
        : []),
      ...(card.cabinet.naf_code
        ? [
            {
              "@type": "PropertyValue",
              propertyID: "APE",
              value: card.cabinet.naf_code,
            },
          ]
        : []),
    ],
  };

  if (card.establishment.address_line1 || card.establishment.postal_code) {
    schema.address = {
      "@type": "PostalAddress",
      streetAddress: card.establishment.address_line1 ?? "",
      postalCode: card.establishment.postal_code ?? "",
      addressLocality: card.city?.name ?? card.establishment.city_name ?? "",
      addressRegion: card.city?.region_name ?? card.establishment.region_code ?? "",
      addressCountry: "FR",
    };
  }

  if (point) {
    schema.geo = {
      "@type": "GeoCoordinates",
      latitude: point.latitude,
      longitude: point.longitude,
    };
  }

  if (website) {
    schema.sameAs = [website];
  }

  if (phone) {
    schema.telephone = phone;
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

function StatusBadge({ verified }: { verified: boolean }) {
  return (
    <span
      className={
        verified
          ? "inline-flex w-fit items-center gap-1.5 rounded-md border border-success-500/30 bg-success-50 px-3 py-2 font-display text-[0.8125rem] font-semibold text-success-700"
          : "inline-flex w-fit items-center gap-1.5 rounded-md border border-warning-500/30 bg-warning-50 px-3 py-2 font-display text-[0.8125rem] font-semibold text-warning-700"
      }
    >
      <span aria-hidden>{verified ? "✓" : "?"}</span>
      {verified ? "Fiche documentée" : "À confirmer"}
    </span>
  );
}

function SidebarPanel({
  card,
  verified,
}: {
  card: DirectoryCabinetCard;
  verified: boolean;
}) {
  const address = buildDirectoryAddress(card);
  const retrievedAt = formatDirectoryDate(card.establishment.retrieved_at);

  return (
    <aside className="space-y-5 lg:sticky lg:top-24">
      <section className="rounded-xl border border-border bg-surface p-6 shadow-sm">
        <h2 className="font-display text-[1.25rem] font-semibold text-ink">
          Coordonnées
        </h2>
        {address && (
          <p className="mt-5 text-[0.9375rem] leading-6 text-ink-muted">
            {address}
          </p>
        )}
        <div className="mt-6">
          <p className="mb-2 font-display text-[0.75rem] font-semibold uppercase tracking-[0.08em] text-ink-soft">
            Statut de la fiche
          </p>
          <StatusBadge verified={verified} />
          <p className="mt-3 text-[0.875rem] leading-6 text-ink-muted">
            {verified
              ? "La vérification professionnelle est documentée pour cette fiche."
              : "Cette fiche provient de sources publiques ; le statut professionnel doit être confirmé auprès du professionnel concerné."}
          </p>
        </div>
        <div className="mt-6 border-t border-border-soft pt-5">
          <p className="font-display text-[0.75rem] font-semibold uppercase tracking-[0.08em] text-ink-soft">
            Source des informations
          </p>
          <p className="mt-2 font-mono text-[0.875rem] text-ink">
            Recherche Entreprises / Sirene
          </p>
          {retrievedAt && (
            <p className="mt-1 font-mono text-[0.75rem] text-ink-soft">
              Récupérée le {retrievedAt}
            </p>
          )}
        </div>
        <div className="mt-6 border-t border-border-soft pt-5">
          <p className="font-display font-semibold text-ink">Une information à corriger ?</p>
          <p className="mt-2 text-[0.875rem] leading-6 text-ink-muted">
            Signalez une erreur ou demandez la suppression de cette fiche.
          </p>
          <Link
            href={`/contact?objet=correction-annuaire&siret=${card.establishment.siret}`}
            className="mt-4 inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-accent-500 px-5 py-3 font-display text-[0.875rem] font-semibold text-surface transition-colors hover:bg-accent-700"
          >
            Demander une correction
          </Link>
        </div>
      </section>

      <section className="rounded-xl border border-border bg-bg-muted p-6">
        <h2 className="font-display text-[1.0625rem] font-semibold text-ink">
          Transparence et conformité
        </h2>
        <p className="mt-3 text-[0.875rem] leading-6 text-ink-muted">
          {AppConfig.name} distingue les données administratives publiques des
          vérifications professionnelles. Aucune note ni avis n'est inventé.
        </p>
        <Link
          href="/confidentialite"
          className="mt-4 inline-flex items-center gap-1.5 font-display text-[0.875rem] font-semibold text-brand-700 transition-colors hover:text-brand-500"
        >
          En savoir plus sur notre démarche
          <span aria-hidden>→</span>
        </Link>
      </section>
    </aside>
  );
}

export function DirectoryProfileV2({
  card,
  relatedCabinets,
  services,
  professions,
  enrichmentFacts = [],
  enrichmentSources = [],
  qualificationSnapshot = null,
}: {
  card: DirectoryCabinetCard;
  relatedCabinets: DirectoryCabinetCard[];
  services: Service[];
  professions: Profession[];
  enrichmentFacts?: DirectoryProfileFact[];
  enrichmentSources?: DirectoryEnrichmentSource[];
  qualificationSnapshot?: DirectoryQualificationSnapshot | null;
}) {
  const name = directoryDisplayName(card);
  const verified = isDirectoryCabinetVerified(card);
  const cityName = card.city?.name ?? card.establishment.city_name ?? "cette ville";
  const citySlug = card.city?.slug ?? "ville";
  const facts = buildDirectoryFactRows(card);
  const faqItems = buildDirectoryFaqItems(card);

  return (
    <>
      <section className="relative overflow-hidden bg-brand-ink px-6 py-14 text-surface lg:px-12 lg:py-18">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-32 -bottom-32 h-115 w-115 rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(255,107,53,0.15) 0%, rgba(255,107,53,0) 60%)",
          }}
        />
        <div className="relative z-10 mx-auto max-w-328">
          <nav aria-label="Fil d'Ariane" className="mb-7">
            <ol className="flex flex-wrap items-center gap-1.5 font-mono text-[0.75rem] text-white/55">
              <li>
                <Link href="/" className="transition-colors hover:text-accent-300">
                  Accueil
                </Link>
              </li>
              <li aria-hidden>/</li>
              <li>
                <Link
                  href="/annuaire/experts-comptables"
                  className="transition-colors hover:text-accent-300"
                >
                  Annuaire des cabinets
                </Link>
              </li>
              <li aria-hidden>/</li>
              <li>
                <Link
                  href={`/expert-comptable/${citySlug}`}
                  className="transition-colors hover:text-accent-300"
                >
                  {cityName}
                </Link>
              </li>
              <li aria-hidden>/</li>
              <li className="text-surface">{name}</li>
            </ol>
          </nav>

          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_25rem] lg:items-end">
            <div>
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-accent-500/30 bg-accent-500/10 px-3.5 py-1.5">
                <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-accent-500" />
                <span className="font-display text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-accent-300">
                  Fiche cabinet · {cityName}
                </span>
              </div>
              <h1 className="max-w-4xl font-display text-[2.25rem] font-extrabold leading-[1.06] tracking-tight text-surface lg:text-[3.25rem]">
                {name}
              </h1>
              <p className="mt-3 text-[1.0625rem] text-white/85">
                Cabinet comptable à {cityName}
              </p>
              <div className="mt-5">
                <StatusBadge verified={verified} />
              </div>
              <p
                className="mt-6 max-w-2xl text-[0.9375rem] leading-7 text-white/70"
                data-speakable="true"
              >
                {verified
                  ? "Cette fiche distingue les données administratives publiques et la vérification professionnelle documentée."
                  : "Les informations présentées proviennent de sources publiques. Le statut professionnel de cette fiche reste à confirmer auprès du professionnel concerné."}
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row lg:justify-end">
              <Link
                href={`/contact?objet=correction-annuaire&siret=${card.establishment.siret}`}
                className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-accent-500 px-6 py-3 font-display text-[0.9375rem] font-semibold text-surface transition-colors hover:bg-accent-700"
              >
                Demander une correction
              </Link>
              <Link
                href={`/expert-comptable/${citySlug}`}
                className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-white/20 bg-white/5 px-6 py-3 font-display text-[0.9375rem] font-semibold text-surface transition-colors hover:border-white/40 hover:bg-white/10"
              >
                Voir les cabinets à {cityName}
              </Link>
            </div>
          </div>
        </div>
      </section>

      <article className="bg-bg px-6 py-14 lg:px-12 lg:py-18">
        <div className="mx-auto max-w-328 space-y-14">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_23rem]">
            <div className="space-y-10">
              <section>
                <h2 className="font-display text-[1.5rem] font-bold text-ink">
                  À propos de {name}
                </h2>
                <p className="mt-4 max-w-3xl text-[1rem] leading-7 text-ink-muted">
                  {name} est référencé comme cabinet comptable à {cityName} à
                  partir de données administratives publiques. Les informations
                  ci-dessous servent à identifier l'établissement, sans attester
                  un statut professionnel lorsque la fiche est candidate.
                </p>
              </section>

              <section>
                <h2 className="font-display text-[1.5rem] font-bold text-ink">
                  Informations légales et administratives
                </h2>
                <div className="mt-5">
                  <DirectoryFactTable rows={facts} />
                </div>
              </section>

              <DirectoryEnrichmentPanel
                facts={enrichmentFacts}
                sources={enrichmentSources}
                snapshot={qualificationSnapshot}
              />

              <section>
                <h2 className="font-display text-[1.375rem] font-bold text-ink">
                  Ce que l'on peut vérifier publiquement
                </h2>
                <p className="mt-3 max-w-3xl text-[0.9375rem] leading-7 text-ink-muted">
                  Ces éléments sont issus de bases administratives accessibles à
                  tous. Ils ne préjugent pas de la qualité des prestations du
                  cabinet.
                </p>
                <ul className="mt-5 grid gap-3 text-[0.9375rem] text-ink-muted">
                  <li className="flex gap-3">
                    <span aria-hidden className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" />
                    Existence administrative de l'entreprise et de
                    l'établissement.
                  </li>
                  <li className="flex gap-3">
                    <span aria-hidden className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" />
                    Activité déclarée d'expertise comptable lorsque le code NAF
                    69.20Z est disponible.
                  </li>
                  <li className="flex gap-3">
                    <span aria-hidden className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" />
                    Statut administratif actif selon la source publique.
                  </li>
                  <li className="flex gap-3">
                    <span aria-hidden className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" />
                    Identité du dirigeant uniquement si la source publique le
                    fournit.
                  </li>
                </ul>
              </section>
            </div>

            <SidebarPanel card={card} verified={verified} />
          </div>

          <section>
            <h2 className="mb-5 font-display text-[1.5rem] font-bold text-ink">
              Localisation
            </h2>
            <DirectoryStaticMap card={card} />
          </section>

          <DirectoryInternalMesh
            cityName={cityName}
            services={services}
            professions={professions}
          />

          <DirectoryRelatedCabinets
            cityName={cityName}
            citySlug={citySlug}
            cabinets={relatedCabinets}
          />

          <DirectoryFaq items={faqItems} />

          <div className="grid gap-5 md:grid-cols-2">
            <section className="rounded-xl border border-border bg-surface p-7 shadow-sm">
              <h2 className="font-display text-[1.125rem] font-semibold text-ink">
                Transparence des données
              </h2>
              <p className="mt-3 text-[0.9375rem] leading-7 text-ink-muted">
                Les données proviennent de sources publiques et sont mises à jour
                régulièrement. {AppConfig.name} peut modifier ou retirer une fiche après
                demande documentée.
              </p>
              <Link
                href="/confidentialite"
                className="mt-4 inline-flex items-center gap-1.5 font-display text-[0.9375rem] font-semibold text-brand-700 transition-colors hover:text-brand-500"
              >
                En savoir plus sur notre politique de données
                <span aria-hidden>→</span>
              </Link>
            </section>
            <section className="rounded-xl border border-border bg-surface p-7 shadow-sm">
              <h2 className="font-display text-[1.125rem] font-semibold text-ink">
                Nous contacter
              </h2>
              <p className="mt-3 text-[0.9375rem] leading-7 text-ink-muted">
                Une question sur cette fiche, une suggestion ou une demande de
                partenariat ? Notre équipe vous répond.
              </p>
              <Link
                href="/contact"
                className="mt-4 inline-flex items-center gap-1.5 font-display text-[0.9375rem] font-semibold text-brand-700 transition-colors hover:text-brand-500"
              >
                Nous contacter
                <span aria-hidden>→</span>
              </Link>
            </section>
          </div>
        </div>
      </article>
    </>
  );
}
