"use client";

import { useMemo, useRef, useState } from "react";
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
  const blurTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const suggestions = useMemo(() => {
    const needle = normalize(query.trim());
    if (!needle) return [];
    return cities
      .filter((city) =>
        normalize(`${city.name} ${city.department_code ?? ""} ${city.department_name ?? ""}`).includes(needle),
      )
      .slice(0, 6);
  }, [cities, query]);

  const go = (city?: DirectoryCity) => {
    const target = city ?? suggestions[0];
    router.push(target ? `/expert-comptable/${target.slug}` : "/annuaire/experts-comptables");
  };

  return (
    <div className="relative max-w-xl">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          go(suggestions[highlighted]);
        }}
        className="flex items-stretch border border-white/25 bg-white/[0.06] backdrop-blur-sm transition-colors focus-within:border-accent-500"
      >
        <span aria-hidden className="flex items-center pl-5 font-mono text-[1.05rem] text-white/50">
          ⌕
        </span>
        <input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setHighlighted(0);
          }}
          onFocus={() => setFocused(true)}
          onBlur={() => {
            blurTimer.current = setTimeout(() => setFocused(false), 150);
          }}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") { e.preventDefault(); setHighlighted((h) => Math.min(h + 1, suggestions.length - 1)); }
            if (e.key === "ArrowUp") { e.preventDefault(); setHighlighted((h) => Math.max(h - 1, 0)); }
          }}
          placeholder="Votre ville — Paris, Lyon, Obernai…"
          aria-label="Rechercher les experts-comptables de votre ville"
          className="w-full bg-transparent px-4 py-4 text-[0.95rem] text-white outline-none placeholder:text-white/45"
        />
        <button
          type="submit"
          className="shrink-0 bg-accent-500 px-6 font-display text-[0.82rem] font-bold text-brand-ink transition-colors hover:bg-accent-300"
        >
          Consulter →
        </button>
      </form>

      {focused && suggestions.length > 0 && (
        <ul className="absolute inset-x-0 top-full z-30 mt-1 border border-white/15 bg-brand-ink/95 backdrop-blur-md">
          {suggestions.map((city, i) => (
            <li key={city.code_insee}>
              <button
                type="button"
                onMouseDown={(e) => { e.preventDefault(); go(city); }}
                onMouseEnter={() => setHighlighted(i)}
                className={`flex w-full items-center justify-between px-5 py-3 text-left text-[0.88rem] transition-colors ${
                  i === highlighted ? "bg-white/10 text-white" : "text-white/75"
                }`}
              >
                <span>{city.name}</span>
                <span className="font-mono text-[0.7rem] text-white/40">
                  {city.department_code ?? ""} · {city.population.toLocaleString("fr-FR")} hab.
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
