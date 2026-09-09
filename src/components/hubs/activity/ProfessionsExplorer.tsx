"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { ProfessionHubCategory } from "./types";

function normalize(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/gu, "")
    .toLocaleLowerCase("fr")
    .trim();
}

export function ProfessionsExplorer({
  categories,
}: {
  categories: ProfessionHubCategory[];
}) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");

  const visibleGroups = useMemo(() => {
    const needle = normalize(query);
    return categories
      .filter((item) => category === "all" || item.slug === category)
      .map((item) => ({
        ...item,
        professions: item.professions.filter((profession) => {
          if (!needle) return true;
          return normalize(
            [item.name, profession.name, profession.description, profession.obligations]
              .filter(Boolean)
              .join(" "),
          ).includes(needle);
        }),
      }))
      .filter((item) => item.professions.length > 0);
  }, [categories, category, query]);

  const resultCount = visibleGroups.reduce((count, item) => count + item.professions.length, 0);
  const totalCount = categories.reduce((count, item) => count + item.professions.length, 0);
  const hasFilters = Boolean(query || category !== "all");

  return (
    <section id="professions-catalogue" className="bg-paper px-5 py-16 sm:px-8 lg:px-14 lg:py-24 xl:px-20">
      <div className="mx-auto max-w-[80rem]">
        <div className="mb-10 grid gap-6 lg:grid-cols-[1fr_.72fr] lg:items-end">
          <div>
            <p className="sk-eyebrow mb-4 text-cobalt">Explorer les métiers</p>
            <h2 className="sk-section-title">
              Trouvez votre activité. Affinez ensuite.
            </h2>
          </div>
          <p className="text-[.98rem] leading-7 text-ink-muted">
            Recherchez un métier ou choisissez une famille. Chaque entrée ouvre une page qui replace les obligations et les missions dans le contexte de l’activité.
          </p>
        </div>

        <div className="grid gap-5 rounded-[1.5rem] bg-navy p-5 text-white sm:p-7 lg:grid-cols-[1.35fr_.8fr_auto] lg:items-end">
          <div>
            <label htmlFor="profession-search" className="mb-2 block text-[.72rem] font-semibold uppercase tracking-[.12em] text-white/65">
              Rechercher parmi {totalCount} professions
            </label>
            <input
              id="profession-search"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Médecin, boulanger, architecte…"
              className="min-h-12 w-full rounded-xl border border-white/20 bg-white px-4 text-[.92rem] text-ink placeholder:text-ink-muted/70"
              aria-controls="profession-results"
            />
          </div>
          <div>
            <label htmlFor="profession-category" className="mb-2 block text-[.72rem] font-semibold uppercase tracking-[.12em] text-white/65">
              Famille professionnelle
            </label>
            <select
              id="profession-category"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className="min-h-12 w-full rounded-xl border border-white/20 bg-white px-4 text-[.9rem] text-ink"
              aria-controls="profession-results"
            >
              <option value="all">Toutes les familles</option>
              {categories.map((item) => (
                <option key={item.slug} value={item.slug}>{item.name}</option>
              ))}
            </select>
          </div>
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setCategory("all");
            }}
            disabled={!hasFilters}
            className="min-h-12 rounded-full border border-white/30 px-5 text-[.8rem] font-semibold text-white transition-colors hover:bg-white hover:text-navy disabled:cursor-not-allowed disabled:opacity-35"
          >
            Réinitialiser
          </button>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-b border-ink/15 pb-5">
          <p className="text-[.83rem] font-semibold text-ink" role="status" aria-live="polite">
            {resultCount} {resultCount > 1 ? "professions affichées" : "profession affichée"}
          </p>
          <p className="text-[.75rem] text-ink-muted">Les résultats ne constituent pas un classement.</p>
        </div>

        <div id="profession-results" className="mt-10 space-y-14">
          {visibleGroups.map((item) => (
            <section key={item.slug} id={item.slug} className="scroll-mt-32">
              <div className="mb-6 grid gap-3 border-b border-ink/15 pb-5 md:grid-cols-[1fr_1.3fr] md:items-end">
                <h3 className="flex items-center gap-3 text-[1.5rem] font-semibold text-ink">
                  <span aria-hidden className="text-[1.7rem]">{item.icon}</span>
                  {item.name}
                </h3>
                {item.description && <p className="text-[.85rem] leading-6 text-ink-muted">{item.description}</p>}
              </div>
              <div className="grid gap-px overflow-hidden border border-ink/10 bg-ink/10 sm:grid-cols-2 lg:grid-cols-3">
                {item.professions.map((profession) => (
                  <Link
                    key={profession.slug}
                    href={`/professions/${profession.slug}`}
                    className="group flex min-h-[13rem] flex-col bg-white p-6 transition-colors hover:bg-lilac focus-visible:z-10"
                  >
                    <span className="mb-8 text-[.66rem] font-bold uppercase tracking-[.12em] text-cobalt">{item.name}</span>
                    <h4 className="text-[1.08rem] font-semibold leading-6 text-ink">{profession.name}</h4>
                    {profession.description && (
                      <p className="mt-3 line-clamp-3 text-[.79rem] leading-6 text-ink-muted">{profession.description}</p>
                    )}
                    <span className="mt-auto pt-5 text-[.76rem] font-bold text-cobalt">
                      Préparer ma comparaison <span aria-hidden className="inline-block transition-transform group-hover:translate-x-1">↗</span>
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          ))}

          {resultCount === 0 && (
            <div className="rounded-2xl bg-white p-8 text-center" role="status">
              <h3 className="text-[1.2rem] font-semibold">Aucune profession ne correspond à ces critères.</h3>
              <p className="mt-3 text-[.9rem] leading-7 text-ink-muted">
                Essayez un terme plus large ou revenez à toutes les familles. Vous pouvez aussi préparer un brief sans sélectionner de métier précis.
              </p>
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setCategory("all");
                }}
                className="mt-5 rounded-full bg-cobalt px-5 py-3 text-[.82rem] font-bold text-white"
              >
                Voir toutes les professions
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
