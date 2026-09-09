"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { SectorHubEntry, ServiceHubEntry } from "./types";

function normalize(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/gu, "")
    .toLocaleLowerCase("fr")
    .trim();
}

export function SectorsExplorer({
  sectors,
  services,
}: {
  sectors: SectorHubEntry[];
  services: ServiceHubEntry[];
}) {
  const [query, setQuery] = useState("");
  const [serviceSlug, setServiceSlug] = useState("");

  const selectedService = services.find((service) => service.slug === serviceSlug);
  const visibleSectors = useMemo(() => {
    const needle = normalize(query);
    if (!needle) return sectors;
    return sectors.filter((sector) =>
      normalize([sector.name, sector.description].filter(Boolean).join(" ")).includes(needle),
    );
  }, [query, sectors]);

  const withService = (slug: string) => {
    if (!serviceSlug) return `/secteurs/${slug}`;
    return `/expertises/${serviceSlug}/${slug}`;
  };

  return (
    <section id="secteurs-catalogue" className="bg-white px-5 py-16 sm:px-8 lg:px-14 lg:py-24 xl:px-20">
      <div className="mx-auto max-w-[80rem]">
        <div className="mb-10 grid gap-6 lg:grid-cols-[1fr_.72fr] lg:items-end">
          <div>
            <p className="sk-eyebrow mb-4 text-cobalt">Explorer les secteurs</p>
            <h2 className="sk-section-title">
              Partez du terrain. Ajoutez la mission.
            </h2>
          </div>
          <p className="text-[.98rem] leading-7 text-ink-muted">
            Le même intitulé de mission change avec les flux, les outils, les équipes et les échéances de votre secteur. Le filtre conserve ce contexte dans la suite du parcours.
          </p>
        </div>

        <div className="grid gap-5 bg-apricot p-5 sm:p-7 lg:grid-cols-[1.1fr_1fr_auto] lg:items-end">
          <div>
            <label htmlFor="sector-search" className="mb-2 block text-[.72rem] font-semibold uppercase tracking-[.12em] text-ink-muted">
              Rechercher un secteur
            </label>
            <input
              id="sector-search"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Restauration, immobilier, transport…"
              className="min-h-12 w-full rounded-xl border border-ink/15 bg-white px-4 text-[.92rem] text-ink placeholder:text-ink-muted/70"
              aria-controls="sector-results"
            />
          </div>
          <div>
            <label htmlFor="sector-service" className="mb-2 block text-[.72rem] font-semibold uppercase tracking-[.12em] text-ink-muted">
              Mission à croiser
            </label>
            <select
              id="sector-service"
              value={serviceSlug}
              onChange={(event) => setServiceSlug(event.target.value)}
              className="min-h-12 w-full rounded-xl border border-ink/15 bg-white px-4 text-[.9rem] text-ink"
              aria-describedby="sector-filter-help"
            >
              <option value="">Toutes les missions</option>
              {services.map((service) => (
                <option key={service.slug} value={service.slug}>{service.title}</option>
              ))}
            </select>
          </div>
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setServiceSlug("");
            }}
            disabled={!query && !serviceSlug}
            className="min-h-12 rounded-full border border-ink/25 px-5 text-[.8rem] font-semibold text-ink transition-colors hover:bg-ink hover:text-white disabled:cursor-not-allowed disabled:opacity-35"
          >
            Réinitialiser
          </button>
        </div>
        <div id="sector-filter-help" className="flex flex-wrap items-center justify-between gap-3 border-b border-ink/15 py-5">
          <p className="text-[.83rem] font-semibold" role="status" aria-live="polite">
            {visibleSectors.length} {visibleSectors.length > 1 ? "secteurs affichés" : "secteur affiché"}
          </p>
          <p className="text-[.78rem] text-ink-muted">
            {selectedService ? `Parcours enrichi avec : ${selectedService.title}` : "Choisissez une mission pour préparer le croisement."}
          </p>
        </div>

        <div id="sector-results" className="divide-y divide-ink/15 border-b border-ink/15">
          {visibleSectors.map((sector, index) => (
            <article key={sector.slug} className="grid gap-5 py-9 lg:grid-cols-[5rem_.8fr_1.15fr_auto] lg:items-start lg:gap-8">
              <span className="font-editorial text-[3.2rem] leading-none text-cobalt" aria-hidden>
                {String(index + 1).padStart(2, "0")}
              </span>
              <div>
                <p className="mb-2 text-[.66rem] font-bold uppercase tracking-[.13em] text-ink-muted">Secteur d’activité</p>
                <h3 className="text-[1.45rem] font-semibold leading-tight text-ink">{sector.name}</h3>
                {selectedService && (
                  <span className="mt-4 inline-flex rounded-full bg-lilac px-3 py-1.5 text-[.7rem] font-semibold text-cobalt">
                    × {selectedService.title}
                  </span>
                )}
              </div>
              <p className="text-[.9rem] leading-7 text-ink-muted">
                {sector.description || "Identifiez les flux, obligations, outils et rythmes propres à cette activité avant de comparer les cabinets."}
              </p>
              <div className="flex flex-row flex-wrap gap-3 lg:w-48 lg:flex-col">
                <Link
                  href={withService(sector.slug)}
                  className="inline-flex min-h-11 items-center justify-center rounded-full bg-navy px-5 text-[.78rem] font-bold text-white transition-colors hover:bg-cobalt"
                >
                  Explorer le secteur ↗
                </Link>
                <button
                  type="button"
                  data-open-brief
                  data-profession={sector.name}
                  data-need={selectedService?.title}
                  data-notes={`Secteur choisi : ${sector.name}`}
                  className="inline-flex min-h-11 items-center justify-center rounded-full border border-ink/20 px-5 text-[.76rem] font-semibold text-ink transition-colors hover:border-cobalt hover:text-cobalt"
                >
                  Ajouter au brief
                </button>
              </div>
            </article>
          ))}

          {visibleSectors.length === 0 && (
            <div className="py-14 text-center" role="status">
              <h3 className="text-[1.2rem] font-semibold">Aucun secteur ne correspond à cette recherche.</h3>
              <p className="mt-3 text-[.9rem] text-ink-muted">Essayez un terme plus large ou affichez de nouveau tout le catalogue.</p>
              <button type="button" onClick={() => setQuery("")} className="mt-5 rounded-full bg-cobalt px-5 py-3 text-[.82rem] font-bold text-white">
                Voir tous les secteurs
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
