import React from "react";
import Link from "next/link";
import Image from "next/image";
import { DirectoryCityTile, directoryCityImage } from "./DirectoryCityTile";
import type {
  DirectoryCabinetCard,
  DirectoryCity,
  DirectoryCityEnrichmentStats,
  Profession,
  Service,
} from "@/libs/db";
import { AppConfig } from "@/utils/AppConfig";
import { DirectoryComplianceNotice } from "./DirectoryComplianceNotice";
import { DirectoryFaq } from "./DirectoryFaq";
import { DirectoryInternalMesh } from "./DirectoryInternalMesh";
import { DirectoryCityMapExplorer } from "./DirectoryCityMapExplorer";
import { ItemListJsonLd } from "@/components/JsonLd";
import {
  cabinetDirectoryPath,
} from "./CabinetCard";
import {
  directoryDisplayName,
  buildDirectoryAddress,
  isDirectoryCabinetVerified,
} from "./profile-v2-helpers";
import {
  DirectoryComparePanel,
  type DirectoryComparisonCandidate,
} from "./DirectoryComparePanel";
import {
  buildDirectoryCityFaqItems,
  buildDirectoryCityStats,
  buildNearbyDirectoryCityLinks,
} from "./city-v2-helpers";

const numberFormatter = new Intl.NumberFormat("fr-FR");

function formatNumber(value: number): string {
  return numberFormatter.format(value);
}

function StatusBadge({ verifiedCount }: { verifiedCount: number }) {
  return (
    <span
      className={
        verifiedCount > 0
          ? "inline-flex w-fit items-center gap-1.5 rounded-full border border-[#17613b]/15 bg-mint px-3 py-2 font-display text-[0.8125rem] font-semibold text-[#17613b]"
          : "inline-flex w-fit items-center gap-1.5 rounded-full border border-[#8b3d24]/15 bg-apricot px-3 py-2 font-display text-[0.8125rem] font-semibold text-[#8b3d24]"
      }
    >
      <span aria-hidden>{verifiedCount > 0 ? "✓" : "?"}</span>
      {verifiedCount > 0 ? "Fiches documentées présentes" : "Statut à confirmer"}
    </span>
  );
}

function CitySummaryPanel({
  city,
  totalCount,
  verifiedCount,
  candidateCount,
  enrichmentStats,
}: {
  city: DirectoryCity;
  totalCount: number;
  verifiedCount: number;
  candidateCount: number;
  enrichmentStats: DirectoryCityEnrichmentStats;
}) {
  const enrichedCount = Math.min(enrichmentStats.enrichedCount, totalCount);
  const documentedCount = Math.min(enrichmentStats.documentedCount, totalCount);
  const rows = [
    { label: "Cabinets listés", value: formatNumber(totalCount) },
    { label: "Fiches documentées", value: formatNumber(verifiedCount) },
    { label: "Profils enrichis", value: formatNumber(enrichedCount) },
    { label: "Qualifiés", value: formatNumber(documentedCount) },
    { label: "Candidats", value: formatNumber(candidateCount) },
    { label: "Département", value: city.department_name ?? city.department_code ?? "Non renseigné" },
    { label: "Région", value: city.region_name ?? city.region_code ?? "Non renseignée" },
  ];

  return (
    <aside className="space-y-5 lg:sticky lg:top-32 lg:self-start">
      <section className="overflow-hidden rounded-[1.75rem] bg-navy text-white">
        <div className="p-6 sm:p-7">
          <p className="text-[.65rem] font-bold uppercase tracking-[.16em] text-mint">Les repères de {city.name}</p>
          <h2 className="mt-3 font-display text-[1.5rem] font-bold leading-tight text-white">Synthèse publique</h2>
          <dl className="mt-5 divide-y divide-white/15">
            {rows.map((row) => (
              <div key={row.label} className="flex items-baseline justify-between gap-5 py-3.5">
                <dt className="text-[.8rem] text-white/70">{row.label}</dt>
                <dd className="min-w-0 break-words text-right font-display text-[.98rem] font-bold text-white">{row.value}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div className="bg-mint p-6 text-ink sm:p-7">
          <h2 className="font-display text-[1.15rem] font-bold text-ink">Statut des fiches</h2>
          <div className="mt-4"><StatusBadge verifiedCount={verifiedCount} /></div>
          <p className="mt-3 text-[.85rem] leading-6 text-ink-muted">{verifiedCount > 0
            ? "Les fiches documentées sont identifiées explicitement dans la liste. Les autres restent candidates tant que leur statut professionnel n'est pas confirmé."
            : "Les fiches de cette ville sont candidates : statut professionnel à confirmer auprès des professionnels concernés."}</p>
        </div>
      </section>
      <section className="rounded-[1.75rem] border border-ink/10 bg-white p-6 sm:p-7">
        <h2 className="font-display text-[1.15rem] font-bold text-ink">Correction ou opposition</h2>
        <p className="mt-3 text-[.86rem] leading-6 text-ink-muted">Un cabinet peut demander une correction, une mise à jour ou le retrait d'une information inexacte.</p>
        <Link href={`/contact?objet=correction-annuaire&ville=${city.slug}`} className="mt-5 inline-flex w-full items-center justify-between gap-3 rounded-full bg-blue px-5 py-3 text-[.8rem] font-bold text-white transition-colors hover:bg-navy">Demander une correction <span aria-hidden>↗</span></Link>
      </section>
    </aside>
  );
}

function NearbyCities({
  currentCity,
  cities,
}: {
  currentCity: DirectoryCity;
  cities: DirectoryCity[];
}) {
  const links = buildNearbyDirectoryCityLinks(cities, currentCity, 8);
  if (links.length === 0) return null;

  const hasSameDepartment = cities.some(
    (city) =>
      city.code_insee !== currentCity.code_insee
      && city.department_code != null
      && city.department_code === currentCity.department_code,
  );

  return (
    <section>
      <div className="mb-7 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
        <div>
          <p className="text-[.68rem] font-bold uppercase tracking-[.16em] text-blue">Élargir votre recherche</p>
          <h2 className="mt-4 font-display text-[clamp(1.8rem,3.5vw,2.6rem)] font-bold leading-tight tracking-tight text-ink">{hasSameDepartment ? "Autres villes proches" : "Autres villes du comparateur"}</h2>
          <p className="mt-3 max-w-2xl text-[.94rem] leading-7 text-ink-muted">Poursuivez votre comparaison locale avec les pages ville les plus utiles du comparateur {AppConfig.name}.</p>
        </div>
        <Link href="/annuaire/experts-comptables" className="inline-flex w-fit shrink-0 items-center gap-3 rounded-full border border-ink/20 px-5 py-3 text-[.8rem] font-bold text-ink hover:border-blue hover:text-blue">Rechercher une autre ville <span aria-hidden>↗</span></Link>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {links.map((link) => <DirectoryCityTile key={link.href} name={link.label} slug={link.href.split("/").at(-1)!} />)}
      </div>
    </section>
  );
}

export function DirectoryCityPageV2({
  city,
  cabinets,
  totalCount,
  verifiedCount,
  enrichmentStats,
  services,
  professions,
  allListingCities,
}: {
  city: DirectoryCity;
  cabinets: DirectoryCabinetCard[];
  totalCount: number;
  verifiedCount: number;
  enrichmentStats: DirectoryCityEnrichmentStats;
  services: Service[];
  professions: Profession[];
  allListingCities: DirectoryCity[];
}) {
  const stats = buildDirectoryCityStats(cabinets, totalCount, verifiedCount);
  const faqItems = buildDirectoryCityFaqItems(city, stats);
  const comparisonCandidates: DirectoryComparisonCandidate[] = cabinets.map((card) => ({
    siret: card.establishment.siret,
    name: directoryDisplayName(card),
    address: buildDirectoryAddress(card),
    href: cabinetDirectoryPath(card),
    verified: isDirectoryCabinetVerified(card),
    confidence: card.cabinet.confidence_score,
  }));
  const candidateCopy =
    stats.candidateCount > 0
      ? `${formatNumber(stats.candidateCount)} fiche${stats.candidateCount > 1 ? "s" : ""} candidate${stats.candidateCount > 1 ? "s" : ""} avec statut professionnel à confirmer.`
      : "Toutes les fiches affichées disposent d'un statut documenté.";
  const enrichedCount = Math.min(enrichmentStats.enrichedCount, stats.totalCount);
  const cityImage = directoryCityImage(city.slug);

  return (
    <>
      <ItemListJsonLd
        name={`Cabinets comptables à ${city.name}`}
        description={`Liste des cabinets comptables référencés à ${city.name}, triée par documentation et confiance.`}
        url={`/expert-comptable/${city.slug}`}
        numberOfItems={stats.totalCount}
        ordered
        items={cabinets.slice(0, 25).map((card) => ({
          name: directoryDisplayName(card),
          url: cabinetDirectoryPath(card),
        }))}
      />
      <section className="relative overflow-hidden bg-navy px-6 py-14 text-surface lg:px-12 lg:py-18">
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
              <li className="text-surface">{city.name}</li>
            </ol>
          </nav>

          <div className="grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,.8fr)] lg:items-center">
            <div>
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-accent-500/30 bg-accent-500/10 px-3.5 py-1.5">
                <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-accent-500" />
                <span className="font-display text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-accent-300">
                  Annuaire local · {city.name}
                </span>
              </div>
              <h1 className="max-w-4xl font-display text-[2.25rem] font-extrabold leading-[1.06] tracking-tight text-surface lg:text-[3.25rem]">
                Cabinets comptables à <span className="text-accent-500">{city.name}</span>
              </h1>
              <p className="mt-4 max-w-2xl text-[1rem] leading-7 text-white/80 lg:text-[1.0625rem]">
                Comparez les cabinets référencés à {city.name} avec provenance
                administrative, statut de fiche et liens vers les fiches détaillées.
              </p>
              <div className="mt-5">
                <StatusBadge verifiedCount={stats.verifiedCount} />
              </div>
              <p
                className="mt-5 max-w-2xl text-[0.9375rem] leading-7 text-white/70"
                data-speakable="true"
              >
                <span className="font-mono font-semibold text-surface">
                  {formatNumber(stats.totalCount)}
                </span>{" "}
                cabinet
                {stats.totalCount > 1 ? "s" : ""} candidat
                {stats.totalCount > 1 ? "s" : ""} ou vérifié
                {stats.totalCount > 1 ? "s" : ""}, dont{" "}
                <span className="font-mono font-semibold text-surface">
                  {formatNumber(stats.verifiedCount)}
                </span>{" "}
                vérifié{stats.verifiedCount > 1 ? "s" : ""} documenté
                {stats.verifiedCount > 1 ? "s" : ""}. {candidateCopy}
                {enrichedCount > 0 && (
                  <>
                    {" "}
                    <span className="font-mono font-semibold text-surface">
                      {formatNumber(enrichedCount)}
                    </span>{" "}
                    profil{enrichedCount > 1 ? "s" : ""} dispose
                    {enrichedCount > 1 ? "nt" : ""} déjà de données enrichies sourcées.
                  </>
                )}
              </p>
            </div>
            <div className="space-y-5">
              {cityImage && <figure className="overflow-hidden rounded-[2rem] bg-lilac">
                <div className="relative aspect-[4/3]"><Image src={cityImage} alt={`Maquette architecturale évoquant ${city.name}`} fill priority sizes="(max-width: 1024px) 90vw, 40vw" className="object-cover" /></div>
                <figcaption className="px-5 py-3 text-[.65rem] text-ink-muted">Illustration de {city.name} générée par IA</figcaption>
              </figure>}
              {!cityImage && <div className="relative overflow-hidden rounded-[2rem] bg-lilac p-7 text-ink sm:p-9">
                <span aria-hidden className="absolute -right-12 -top-12 h-56 w-56 rounded-full border-[28px] border-white/45" />
                <p className="relative text-[.65rem] font-bold uppercase tracking-[.16em] text-blue">Votre recherche locale</p>
                <p className="relative mt-8 font-display text-[clamp(3.5rem,7vw,6rem)] font-bold leading-none tracking-tight text-blue">{city.department_code || city.name.slice(0, 2).toUpperCase()}</p>
                <p className="relative mt-5 font-display text-2xl font-bold">{city.name}</p>
                {(city.department_name || city.region_name) && <p className="relative mt-2 text-[.85rem] leading-6 text-ink-muted">{[city.department_name, city.region_name].filter(Boolean).join(" · ")}</p>}
              </div>}
              <div className="flex flex-col gap-3 sm:flex-row">
                <Link href="#liste-cabinets" className="inline-flex flex-1 items-center justify-center gap-3 rounded-full bg-orange px-5 py-3.5 text-[.85rem] font-bold text-navy transition-colors hover:bg-apricot">Voir les cabinets <span aria-hidden>↘</span></Link>
                <Link href="/annuaire/experts-comptables" className="inline-flex flex-1 items-center justify-center rounded-full border border-white/30 px-5 py-3.5 text-[.85rem] font-bold text-white transition-colors hover:bg-white hover:text-navy">Retour annuaire</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <nav aria-label="Dans cette page" className="border-b border-ink/10 bg-white px-6 lg:px-12">
        <div className="mx-auto flex max-w-328 gap-6 overflow-x-auto py-5 text-[.75rem] font-bold text-ink-muted sm:gap-8">
          <a href="#compare-title" className="shrink-0 hover:text-blue">01 · Comparer les fiches</a>
          <a href="#liste-cabinets" className="shrink-0 hover:text-blue">02 · Explorer la carte</a>
          <a href="#comprendre-annuaire" className="shrink-0 hover:text-blue">03 · Comprendre les fiches</a>
          <a href="#questions-annuaire" className="shrink-0 hover:text-blue">04 · Questions fréquentes</a>
        </div>
      </nav>

      <article className="bg-paper px-6 py-14 lg:px-12 lg:py-18">
        <div className="mx-auto max-w-328 space-y-14">
          <DirectoryComparePanel
            cityName={city.name}
            candidates={comparisonCandidates}
          />

          <DirectoryCityMapExplorer
            city={city}
            cabinets={cabinets}
            stats={stats}
          />

          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_23rem]">
            <div id="comprendre-annuaire" className="min-w-0 scroll-mt-32 space-y-10">
              <section>
                <h2 className="font-display text-[clamp(1.6rem,3vw,2.1rem)] font-bold leading-tight tracking-tight text-ink">
                  Trouver un cabinet comptable à {city.name}
                </h2>
                <p className="mt-4 max-w-3xl text-[1rem] leading-7 text-ink-muted">
                  Cette page rassemble les cabinets comptables référencés à{" "}
                  {city.name} à partir de données administratives publiques. Le
                  statut de la fiche est séparé du reste des informations pour éviter
                  toute confusion entre présence administrative et vérification
                  professionnelle.
                </p>
              </section>

              <section className="rounded-[1.75rem] border border-ink/10 bg-white p-6 sm:p-8">
                <h2 className="font-display text-[1.375rem] font-bold text-ink">
                  Ce que l'on peut vérifier publiquement
                </h2>
                <p className="mt-3 max-w-3xl text-[0.9375rem] leading-7 text-ink-muted">
                  La page expose uniquement des signaux publics utiles à une
                  première comparaison. Elle ne remplace pas la vérification
                  directe auprès du professionnel concerné.
                </p>
                <ul className="mt-5 grid gap-3 text-[0.9375rem] text-ink-muted">
                  <li className="flex gap-3 rounded-xl bg-paper p-4">
                    <span aria-hidden className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" />
                    Identité administrative, SIRET et adresse publique lorsqu'ils
                    sont disponibles.
                  </li>
                  <li className="flex gap-3 rounded-xl bg-paper p-4">
                    <span aria-hidden className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" />
                    Statut actif de l'entreprise et de l'établissement selon la
                    source publique.
                  </li>
                  <li className="flex gap-3 rounded-xl bg-paper p-4">
                    <span aria-hidden className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" />
                    Code NAF / APE lié à l'activité comptable lorsque la source
                    le fournit.
                  </li>
                  <li className="flex gap-3 rounded-xl bg-paper p-4">
                    <span aria-hidden className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" />
                    Statut professionnel uniquement quand il est documenté par
                    une source fiable ou une validation manuelle.
                  </li>
                </ul>
              </section>

              <DirectoryComplianceNotice />
            </div>

            <CitySummaryPanel
              city={city}
              totalCount={stats.totalCount}
              verifiedCount={stats.verifiedCount}
              candidateCount={stats.candidateCount}
              enrichmentStats={enrichmentStats}
            />
          </div>

          <DirectoryInternalMesh
            cityName={city.name}
            services={services}
            professions={professions}
          />

          <NearbyCities currentCity={city} cities={allListingCities} />

          <DirectoryFaq items={faqItems} />

          <div className="grid gap-5 md:grid-cols-2">
            <section className="rounded-[1.75rem] border border-ink/10 bg-white p-7 sm:p-8">
              <h2 className="font-display text-[1.125rem] font-bold text-ink">
                Transparence des données
              </h2>
              <p className="mt-3 text-[0.9375rem] leading-7 text-ink-muted">
                {AppConfig.name} distingue les données administratives publiques, le
                statut de fiche et les contenus de maillage interne.
                Aucun avis, note ou horaire n'est inventé.
              </p>
              <Link
                href="/confidentialite"
                className="mt-4 inline-flex items-center gap-1.5 font-display text-[0.9375rem] font-semibold text-brand-700 transition-colors hover:text-brand-500"
              >
                Politique de données
                <span aria-hidden>→</span>
              </Link>
            </section>
            <section className="rounded-[1.75rem] border border-ink/10 bg-white p-7 sm:p-8">
              <h2 className="font-display text-[1.125rem] font-bold text-ink">
                Besoin d'une mise à jour ?
              </h2>
              <p className="mt-3 text-[0.9375rem] leading-7 text-ink-muted">
                Une demande de correction peut porter sur un SIRET, une adresse,
                un statut administratif ou une opposition à l'affichage.
              </p>
              <Link
                href={`/contact?objet=correction-annuaire&ville=${city.slug}`}
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
