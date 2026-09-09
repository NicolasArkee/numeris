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
  extractDirectoryTeamMembers,
  findDirectoryProfileSummary,
  groupDirectoryProfileFacts,
} from "@/libs/directory/enrichment";
import {
  DirectoryEnrichmentPanel,
  filterDirectoryFactsWithLoadedSources,
} from "./DirectoryEnrichmentPanel";
import { DirectoryFactTable } from "./DirectoryFactTable";
import { DirectoryFaq } from "./DirectoryFaq";
import { DirectoryInternalMesh } from "./DirectoryInternalMesh";
import { DirectoryRelatedCabinets } from "./DirectoryRelatedCabinets";
import { DirectoryStreetView } from "./DirectoryStreetView";
import { BriefTrigger } from "@/components/journey/BriefTrigger";
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
  const displayableFacts = filterDirectoryFactsWithLoadedSources(
    enrichmentFacts,
    enrichmentSources,
  ).filter((fact) => fact.is_displayable === true || fact.is_displayable === 1);
  const hasProfessionalRegistrySignal = displayableFacts.some(
    (fact) =>
      fact.fact_type === "registry_status"
      && /ordre|expert[s]?[-\s]?comptable[s]?/i.test(`${fact.label} ${fact.value}`),
  );

  if (!isDirectoryCabinetVerified(card) && !hasProfessionalRegistrySignal) return null;

  const point = buildDirectoryMapPoint(card);
  const name = directoryDisplayName(card);
  const website = displayableFacts.find(
    (fact) => fact.fact_type === "website",
  )?.value;
  const phone = displayableFacts.find((fact) => fact.fact_type === "phone")?.value;
  const teamMembers = extractDirectoryTeamMembers(displayableFacts);
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

  if (teamMembers.length > 0) {
    schema.employee = teamMembers.map((member) => ({
      "@type": "Person",
      name: member.name,
      jobTitle: member.role,
    }));
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
          ? "inline-flex w-fit items-center gap-1.5 rounded-full border border-[#17613b]/15 bg-mint px-3 py-2 font-display text-[0.8125rem] font-semibold text-[#17613b]"
          : "inline-flex w-fit items-center gap-1.5 rounded-full border border-[#8b3d24]/15 bg-apricot px-3 py-2 font-display text-[0.8125rem] font-semibold text-[#8b3d24]"
      }
    >
      <span aria-hidden>{verified ? "✓" : "?"}</span>
      {verified ? "Fiche documentée" : "À confirmer"}
    </span>
  );
}

type DirectoryContactAction = {
  href: string;
  label: string;
  external: boolean;
};

function isDisplayableDirectoryFact(fact: DirectoryProfileFact): boolean {
  return fact.is_displayable === true || fact.is_displayable === 1;
}

function firstDisplayableFactValue(
  facts: DirectoryProfileFact[],
  factType: DirectoryProfileFact["fact_type"],
): string | null {
  return (
    facts
      .find((fact) => fact.fact_type === factType && isDisplayableDirectoryFact(fact))
      ?.value.trim() || null
  );
}

function normalizePhoneHref(phone: string): string | null {
  const compactPhone = phone.replaceAll(/[^\d+]/g, "");
  return compactPhone ? `tel:${compactPhone}` : null;
}

function buildCabinetContactAction(
  facts: DirectoryProfileFact[],
): DirectoryContactAction {
  const contactUrl = firstDisplayableFactValue(facts, "contact_url");
  if (contactUrl?.startsWith("http")) {
    return {
      href: contactUrl,
      label: "Contacter le cabinet",
      external: true,
    };
  }

  const email = firstDisplayableFactValue(facts, "email");
  if (email) {
    return {
      href: `mailto:${email}`,
      label: "Envoyer un email",
      external: false,
    };
  }

  const phone = firstDisplayableFactValue(facts, "phone");
  const phoneHref = phone ? normalizePhoneHref(phone) : null;
  if (phoneHref) {
    return {
      href: phoneHref,
      label: "Appeler le cabinet",
      external: false,
    };
  }

  const website = firstDisplayableFactValue(facts, "website");
  if (website?.startsWith("http")) {
    return {
      href: website,
      label: "Voir le site du cabinet",
      external: true,
    };
  }

  return {
    href: "#coordonnees-verifiees",
    label: "Voir les coordonnées",
    external: false,
  };
}

function SidebarPanel({
  card,
  verified,
  hasContactFacts,
}: {
  card: DirectoryCabinetCard;
  verified: boolean;
  hasContactFacts: boolean;
}) {
  const address = buildDirectoryAddress(card);
  const retrievedAt = formatDirectoryDate(card.establishment.retrieved_at);

  return (
    <aside className="space-y-5 lg:sticky lg:top-32 lg:self-start">
      <section id={hasContactFacts ? undefined : "coordonnees-verifiees"} className="scroll-mt-32 rounded-[1.75rem] border border-ink/10 bg-white p-6 sm:p-7">
        <p className="mb-3 text-[.65rem] font-bold uppercase tracking-[.16em] text-blue">Les informations utiles</p>
        <h2 className="font-display text-[1.25rem] font-bold text-ink">
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
            className="mt-4 inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-blue px-5 py-3 font-display text-[0.875rem] font-bold text-white transition-colors hover:bg-accent-700"
          >
            Demander une correction
          </Link>
        </div>
      </section>

      <section className="rounded-[1.75rem] bg-mint p-6 sm:p-7">
        <h2 className="font-display text-[1.0625rem] font-bold text-ink">
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
  const sourcedFacts = filterDirectoryFactsWithLoadedSources(
    enrichmentFacts,
    enrichmentSources,
  );
  const sourcedSummary = findDirectoryProfileSummary(sourcedFacts);
  const sourcePreview = sourcedFacts.find(
    (fact) => fact.fact_type === "source_preview_image" && isDisplayableDirectoryFact(fact),
  );
  const sourcesById = new Map(enrichmentSources.map((source) => [source.id, source]));
  const sourcePreviewSource = sourcePreview?.source_id
    ? sourcesById.get(sourcePreview.source_id) ?? null
    : null;
  const cabinetContactAction = buildCabinetContactAction(sourcedFacts);
  const hasContactFacts = groupDirectoryProfileFacts(sourcedFacts).contact.length > 0;

  return (
    <>
      <section
        data-directory-hero="desktop-v2"
        className="relative overflow-hidden bg-navy px-6 py-10 text-surface lg:px-12 lg:py-14"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute -right-32 -bottom-32 h-115 w-115 rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(255,107,53,0.15) 0%, rgba(255,107,53,0) 60%)",
          }}
        />
        <div className="relative z-10 mx-auto max-w-328">
          <nav aria-label="Fil d'Ariane" className="mb-7 lg:mb-8">
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
                  prefetch={false}
                  className="transition-colors hover:text-accent-300"
                >
                  {cityName}
                </Link>
              </li>
              <li aria-hidden>/</li>
              <li className="text-surface">{name}</li>
            </ol>
          </nav>

          <div className="grid gap-8 lg:grid-cols-[minmax(0,48rem)_minmax(18rem,24rem)] lg:items-center lg:justify-between">
            <div className="max-w-3xl">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-accent-500/30 bg-accent-500/10 px-3.5 py-1.5">
                <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-accent-500" />
                <span className="font-display text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-accent-300">
                  Fiche cabinet · {cityName}
                </span>
              </div>
              <h1 className="max-w-4xl break-words font-display text-[2.25rem] font-extrabold leading-[1.06] tracking-tight text-surface lg:text-[3.25rem]">
                {name}
              </h1>
              <div className="lg:mt-4 lg:flex lg:items-center lg:gap-4">
                <p className="mt-3 text-[1.0625rem] text-white/85 lg:mt-0">
                  Cabinet comptable à {cityName}
                </p>
                <div className="mt-5 lg:mt-0">
                  <StatusBadge verified={verified} />
                </div>
              </div>
              <p
                className="mt-6 max-w-2xl text-[0.9375rem] leading-7 text-white/70 lg:mt-5"
                data-speakable="true"
              >
                {verified
                  ? "Cette fiche distingue les données administratives publiques et la vérification professionnelle documentée."
                  : "Les informations présentées proviennent de sources publiques. Le statut professionnel de cette fiche reste à confirmer auprès du professionnel concerné."}
              </p>
            </div>
            <div
              data-directory-hero-actions="desktop-v2"
              className="space-y-4 lg:w-full lg:max-w-96 lg:justify-self-end lg:border-l lg:border-white/10 lg:py-5 lg:pl-8"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap lg:flex-col">
                <BriefTrigger
                  prefill={{
                    city: cityName,
                    notes: `Échange à préparer avec ${name}`,
                  }}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-orange px-6 py-3 font-display text-[0.9375rem] font-semibold text-brand-ink transition-colors hover:bg-accent-300 lg:w-full"
                >
                  Préparer mon échange →
                </BriefTrigger>
                <a
                  href={cabinetContactAction.href}
                  target={cabinetContactAction.external ? "_blank" : undefined}
                  rel={
                    cabinetContactAction.external
                      ? "nofollow noopener noreferrer"
                      : undefined
                  }
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-white/30 bg-white/5 px-6 py-3 font-display text-[0.9375rem] font-semibold text-surface transition-colors hover:border-white hover:bg-white hover:text-brand-ink lg:w-full"
                >
                  {cabinetContactAction.label}
                </a>
                <Link
                  href={`/expert-comptable/${citySlug}`}
                  prefetch={false}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 bg-white/5 px-6 py-3 font-display text-[0.9375rem] font-semibold text-surface transition-colors hover:border-white/40 hover:bg-white/10 lg:w-full"
                >
                  Voir les cabinets à {cityName}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <nav aria-label="Dans cette fiche" className="border-b border-ink/10 bg-white px-6 lg:px-12">
        <div className="mx-auto flex max-w-328 gap-6 overflow-x-auto py-5 text-[.75rem] font-bold text-ink-muted sm:gap-8">
          <a href="#informations-cabinet" className="shrink-0 hover:text-blue">01 · Le cabinet</a>
          <a href="#informations-administratives" className="shrink-0 hover:text-blue">02 · Données publiques</a>
          <a href="#profile-prepare-title" className="shrink-0 hover:text-blue">03 · Votre besoin</a>
          <a href="#questions-annuaire" className="shrink-0 hover:text-blue">04 · Questions fréquentes</a>
        </div>
      </nav>

      <section className="bg-lilac px-6 py-10 lg:px-12 lg:py-12" aria-labelledby="profile-prepare-title">
        <div className="mx-auto grid max-w-328 gap-7 lg:grid-cols-[0.8fr_1.5fr] lg:items-start">
          <div>
            <p className="sk-eyebrow text-brand-700">Avant le premier échange</p>
            <h2 id="profile-prepare-title" className="scroll-mt-32 mt-3 font-display text-[1.8rem] font-bold leading-tight text-ink lg:text-[2.3rem]">
              Transformez la fiche en questions utiles.
            </h2>
            <p className="mt-4 max-w-xl text-[0.95rem] leading-7 text-ink-muted">
              Les données publiques identifient le cabinet. Le rendez-vous doit ensuite confirmer l'adéquation avec votre activité, le périmètre de mission et la façon de travailler.
            </p>
          </div>
          <ol className="grid gap-3 sm:grid-cols-3">
            {[
              ["01", "Votre contexte", "Activité, statut, volume, échéances et outils déjà utilisés."],
              ["02", "Le périmètre", "Production, conseil, fiscalité, paie et interlocuteur au quotidien."],
              ["03", "La comparaison", "Livrables, délais, responsabilités, honoraires et conditions de sortie."],
            ].map(([index, title, copy]) => (
              <li key={index} className="rounded-2xl border border-brand-ink/10 bg-white/75 p-5">
                <span className="font-mono text-[0.72rem] font-semibold text-brand-700">{index}</span>
                <h3 className="mt-5 font-display text-[1rem] font-bold text-ink">{title}</h3>
                <p className="mt-2 text-[0.84rem] leading-6 text-ink-muted">{copy}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <article className="bg-paper px-6 py-10 lg:px-12 lg:py-12">
        <div className="mx-auto max-w-328 space-y-14">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_23rem]">
            <div id="informations-cabinet" className="min-w-0 scroll-mt-32 space-y-10">
              {(sourcePreview || !sourcedSummary) && <section>
                <h2 className="font-display text-[clamp(1.6rem,3vw,2.1rem)] font-bold leading-tight tracking-tight text-ink">
                  {sourcePreview ? "Aperçu de la source publique" : "Présentation du cabinet"}
                </h2>
                {sourcePreview && (
                  <figure className="mt-5 overflow-hidden rounded-[2rem] border border-ink/10 bg-white">
                    <img
                      src={sourcePreview.value}
                      alt={`Capture de la source publique pour ${name}`}
                      className="aspect-[16/9] w-full object-cover object-top"
                      loading="eager"
                    />
                    {(sourcePreviewSource?.source_url || sourcePreviewSource?.retrieved_at) && (
                      <figcaption className="flex flex-wrap items-center justify-between gap-3 border-t border-ink/10 bg-mint px-5 py-4 text-[0.8125rem] text-ink-soft">
                        {sourcePreviewSource?.source_url ? (
                          <a
                            href={sourcePreviewSource.source_url}
                            className="font-display font-semibold text-brand-700 transition-colors hover:text-brand-500"
                            rel="nofollow noopener noreferrer"
                          >
                            Ouvrir la source
                            <span aria-hidden> →</span>
                          </a>
                        ) : (
                          <span>Capture de source publique</span>
                        )}
                        {sourcePreviewSource?.retrieved_at && (
                          <span className="font-mono">
                            Consultée le {formatDirectoryDate(sourcePreviewSource.retrieved_at)}
                          </span>
                        )}
                      </figcaption>
                    )}
                  </figure>
                )}
                {!sourcedSummary && (
                  <p className="mt-4 max-w-3xl text-[1rem] leading-7 text-ink-muted">
                    {name} est référencé comme cabinet comptable à {cityName} à partir de données administratives publiques. Les informations ci-dessous servent à identifier l'établissement, sans attester un statut professionnel lorsque la fiche est candidate.
                  </p>
                )}
              </section>}

              <DirectoryEnrichmentPanel
                card={card}
                facts={enrichmentFacts}
                sources={enrichmentSources}
                snapshot={qualificationSnapshot}
              />

              <section id="informations-administratives" className="scroll-mt-32">
                <h2 className="font-display text-[clamp(1.6rem,3vw,2.1rem)] font-bold leading-tight tracking-tight text-ink">
                  Informations légales et administratives
                </h2>
                <div className="mt-5">
                  <DirectoryFactTable rows={facts} />
                </div>
                <DirectoryStreetView
                  establishment={card.establishment}
                  cabinetName={name}
                />
              </section>

              <section className="rounded-[1.75rem] bg-mint p-6 sm:p-8">
                <h2 className="font-display text-[1.375rem] font-bold text-ink">
                  Ce que l'on peut vérifier publiquement
                </h2>
                <p className="mt-3 max-w-3xl text-[0.9375rem] leading-7 text-ink-muted">
                  Ces éléments sont issus de bases administratives accessibles à
                  tous. Ils ne préjugent pas de la qualité des prestations du
                  cabinet.
                </p>
                <ul className="mt-5 grid gap-3 text-[0.9375rem] text-ink-muted">
                  <li className="flex gap-3 rounded-xl bg-white/70 p-4">
                    <span aria-hidden className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" />
                    Existence administrative de l'entreprise et de
                    l'établissement.
                  </li>
                  <li className="flex gap-3 rounded-xl bg-white/70 p-4">
                    <span aria-hidden className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" />
                    Activité déclarée d'expertise comptable lorsque le code NAF
                    69.20Z est disponible.
                  </li>
                  <li className="flex gap-3 rounded-xl bg-white/70 p-4">
                    <span aria-hidden className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" />
                    Statut administratif actif selon la source publique.
                  </li>
                  <li className="flex gap-3 rounded-xl bg-white/70 p-4">
                    <span aria-hidden className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" />
                    Identité du dirigeant uniquement si la source publique le
                    fournit.
                  </li>
                </ul>
              </section>
            </div>

            <SidebarPanel card={card} verified={verified} hasContactFacts={hasContactFacts} />
          </div>

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
            <section className="rounded-[1.75rem] border border-ink/10 bg-white p-7 sm:p-8">
              <h2 className="font-display text-[1.125rem] font-bold text-ink">
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
            <section className="rounded-[1.75rem] border border-ink/10 bg-white p-7 sm:p-8">
              <h2 className="font-display text-[1.125rem] font-bold text-ink">
                Nous contacter
              </h2>
              <p className="mt-3 text-[0.9375rem] leading-7 text-ink-muted">
                Une question sur cette fiche, une suggestion ou un élément à
                clarifier ? Notre équipe vous répond.
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
