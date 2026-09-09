"use client";

import { useId, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { DirectoryCity } from "@/libs/db";

function normalize(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

/** Recherche ville du hero : suggestions instantanées → page annuaire ville.
 *  Entrée sans sélection = meilleure suggestion ; aucune = index annuaire. */
export function HomeCitySearch({ cities }: { cities: DirectoryCity[] }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const [highlighted, setHighlighted] = useState(0);
  const listboxId = useId().replace(/:/gu, "");

  const suggestions = useMemo(() => {
    const needle = normalize(query.trim());
    if (!needle) return [];
    return cities
      .map((city) => {
        const cityName = normalize(city.name);
        const department = normalize(`${city.department_code ?? ""} ${city.department_name ?? ""}`);
        const score = cityName === needle
          ? 0
          : cityName.startsWith(needle)
            ? 1
            : cityName.includes(needle)
              ? 2
              : department.startsWith(needle)
                ? 3
                : department.includes(needle)
                  ? 4
                  : Number.POSITIVE_INFINITY;
        return { city, score };
      })
      .filter((entry) => Number.isFinite(entry.score))
      .sort((a, b) => a.score - b.score || b.city.population - a.city.population || a.city.name.localeCompare(b.city.name, "fr"))
      .slice(0, 6)
      .map((entry) => entry.city);
  }, [cities, query]);

  const go = (city?: DirectoryCity) => {
    const target = city ?? suggestions[0];
    router.push(target ? `/expert-comptable/${target.slug}` : "/annuaire/experts-comptables");
  };

  return (
    <div
      className="relative max-w-xl"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false);
      }}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          go(suggestions[highlighted]);
        }}
        className="flex items-stretch rounded-2xl border border-white/25 bg-white/[0.06] p-1.5 backdrop-blur-sm transition-colors focus-within:border-orange"
      >
        <span aria-hidden className="flex items-center pl-5 font-mono text-[1.05rem] text-white/50">
          ⌕
        </span>
        <input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setHighlighted(0);
            setFocused(true);
          }}
          onFocus={() => setFocused(true)}
          onKeyDown={(e) => {
            if (suggestions.length > 0 && e.key === "ArrowDown") { e.preventDefault(); setHighlighted((h) => Math.min(h + 1, suggestions.length - 1)); }
            if (suggestions.length > 0 && e.key === "ArrowUp") { e.preventDefault(); setHighlighted((h) => Math.max(h - 1, 0)); }
            if (suggestions.length > 0 && e.key === "Home") { e.preventDefault(); setHighlighted(0); }
            if (suggestions.length > 0 && e.key === "End") { e.preventDefault(); setHighlighted(suggestions.length - 1); }
            if (e.key === "Escape") { e.preventDefault(); setFocused(false); }
          }}
          placeholder="Votre ville — Paris, Lyon, Obernai…"
          aria-label="Comparer les experts-comptables de votre ville"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={focused && suggestions.length > 0}
          aria-controls={listboxId}
          aria-activedescendant={focused && suggestions[highlighted] ? `${listboxId}-option-${highlighted}` : undefined}
          className="min-w-0 w-full rounded-xl bg-transparent px-3 py-4 text-[.95rem] text-white outline-none placeholder:text-white/60"
        />
        <button
          type="submit"
          className="shrink-0 rounded-xl bg-orange px-4 text-[.82rem] font-bold text-navy transition-colors hover:bg-apricot sm:px-6"
        >
          Comparer →
        </button>
      </form>

      {focused && suggestions.length > 0 && (
        <div id={listboxId} role="listbox" aria-label="Villes suggérées" className="absolute inset-x-0 top-full z-30 mt-2 overflow-hidden rounded-2xl border border-white/15 bg-navy/95 p-1.5 shadow-xl backdrop-blur-md">
          {suggestions.map((city, i) => (
            <button
              key={city.code_insee}
              id={`${listboxId}-option-${i}`}
              type="button"
              role="option"
              aria-selected={i === highlighted}
              onClick={() => go(city)}
              onMouseEnter={() => setHighlighted(i)}
              className={`flex w-full items-center justify-between gap-3 rounded-xl px-4 py-3 text-left text-[0.88rem] transition-colors ${
                i === highlighted ? "bg-white/10 text-white" : "text-white/75"
              }`}
            >
              <span>{city.name}</span>
              <span className="font-mono text-[0.7rem] text-white/40">
                {city.department_code ?? ""} · {city.population.toLocaleString("fr-FR")} hab.
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
