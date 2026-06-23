"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { DirectoryCity } from "@/libs/db";

function normalize(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

export function DirectorySearch({ cities }: { cities: DirectoryCity[] }) {
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => {
    const needle = normalize(query.trim());
    if (!needle) return cities;
    return cities.filter((city) =>
      normalize(`${city.name} ${city.department_code ?? ""} ${city.department_name ?? ""}`).includes(
        needle,
      ),
    );
  }, [cities, query]);

  return (
    <section className="rounded-xl border border-border bg-surface p-6 shadow-sm">
      <label className="block font-display text-[0.75rem] font-semibold uppercase tracking-[0.08em] text-ink-muted">
        Rechercher une ville
        <div className="mt-3 flex items-center gap-2 rounded-lg border border-border bg-bg px-4 focus-within:border-brand-500 focus-within:bg-surface focus-within:ring-3 focus-within:ring-brand-500/20">
          <span aria-hidden className="font-mono text-[1.125rem] text-brand-700">
            ⌕
          </span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="block w-full bg-transparent py-3 text-[0.9375rem] font-normal normal-case text-ink outline-none placeholder:text-ink-soft"
            placeholder="Paris, Lyon, Bordeaux…"
          />
        </div>
      </label>
      <div className="mt-6 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((city) => (
          <Link
            key={city.code_insee}
            href={`/expert-comptable/${city.slug}`}
            className="flex items-center justify-between rounded-lg border border-border bg-bg-muted px-4 py-3 transition-colors hover:border-brand-500 hover:bg-brand-50"
          >
            <span className="font-display font-medium text-ink">{city.name}</span>
            <span className="font-mono text-[0.75rem] text-ink-soft">
              {city.department_code}
            </span>
          </Link>
        ))}
      </div>
      {filtered.length === 0 && (
        <p className="mt-5 text-[0.875rem] text-ink-muted">
          Aucune ville candidate ou vérifiée n'est publiée pour le moment.
        </p>
      )}
    </section>
  );
}
