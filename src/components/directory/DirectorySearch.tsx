"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { DirectoryCity } from "@/libs/db";
import { DirectoryCityTile } from "./DirectoryCityTile";

export function DirectorySearch({
  cities,
  initialQuery = "",
  totalAvailable,
}: {
  cities: DirectoryCity[];
  initialQuery?: string;
  totalAvailable?: number;
}) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);

  return (
    <section className="overflow-hidden rounded-[2rem] border border-ink/12 bg-white shadow-[0_24px_80px_rgba(16,34,59,.08)]">
      <div className="grid gap-6 bg-lilac p-6 lg:grid-cols-[.75fr_1.25fr] lg:items-end lg:p-8">
        <div>
          <p className="text-[.64rem] font-bold uppercase tracking-[.18em] text-blue">Annuaire national</p>
          <h2 className="mt-3 text-[clamp(2rem,4vw,3.2rem)] font-bold leading-tight text-ink">
            Entrez une ville, puis ouvrez les fiches.
          </h2>
        </div>
        <p className="text-[.9rem] leading-7 text-ink-muted">
          Recherchez par ville ou département pour comparer les établissements près de chez vous. Chaque fiche distingue les données administratives des statuts professionnels documentés.
        </p>
      </div>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          const value = query.trim();
          router.push(value ? `/annuaire/experts-comptables?q=${encodeURIComponent(value)}` : "/annuaire/experts-comptables");
        }}
        className="grid gap-3 border-b border-ink/10 p-5 sm:grid-cols-[1fr_auto] lg:p-6"
      >
        <label className="flex min-h-13 min-w-0 items-center gap-3 rounded-full border border-ink/18 bg-paper px-5 focus-within:border-blue focus-within:ring-4 focus-within:ring-blue/10">
          <span aria-hidden className="font-serif text-3xl text-blue">⌕</span>
          <span className="sr-only">Rechercher une ville</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="min-w-0 w-full bg-transparent text-[.94rem] text-ink outline-none placeholder:text-ink-soft"
            placeholder="Paris, Lyon, Bordeaux, 35…"
            type="search"
          />
        </label>
        <button type="submit" className="min-h-13 rounded-full bg-blue px-7 text-[.82rem] font-bold text-white transition-transform hover:-translate-y-0.5">
          Rechercher&nbsp; ↗
        </button>
      </form>

      <div className="p-5 lg:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="min-w-0 break-words text-[.7rem] font-bold uppercase tracking-[.15em] text-ink-muted" aria-live="polite">
            {initialQuery ? `${cities.length} résultat${cities.length > 1 ? "s" : ""} pour « ${initialQuery} »` : `${cities.length} villes proposées`}
          </p>
          {initialQuery && <Link href="/annuaire/experts-comptables" className="text-[.72rem] font-bold text-blue underline underline-offset-4">Effacer la recherche</Link>}
        </div>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cities.map((city) => (
            <DirectoryCityTile key={city.code_insee} name={city.name} slug={city.slug} detail={[city.department_code, city.department_name].filter(Boolean).join(" · ")} />
          ))}
        </div>
        {cities.length === 0 && (
          <p className="mt-5 rounded-[1rem] border border-dashed border-ink/20 bg-paper p-7 text-[.86rem] leading-7 text-ink-muted">
            Aucune ville listable ne correspond à cette recherche. Essayez le nom complet, un code de département ou consultez les pages départementales.
          </p>
        )}
        {!initialQuery && totalAvailable && totalAvailable > cities.length && (
          <p className="mt-5 text-[.72rem] leading-6 text-ink-muted">
            {totalAvailable.toLocaleString("fr-FR")} villes sont disponibles. Utilisez la recherche pour charger uniquement les résultats utiles.
          </p>
        )}
      </div>
    </section>
  );
}
