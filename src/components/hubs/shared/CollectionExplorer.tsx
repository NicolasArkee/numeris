"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

export type CollectionItem = {
  href: string;
  title: string;
  description?: string | null;
  group?: string;
  meta?: string;
  tag?: string;
};

function normalize(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

export function CollectionExplorer({
  items,
  groups = [],
  searchPlaceholder = "Rechercher dans cette collection…",
  emptyMessage = "Aucun contenu ne correspond à ces critères.",
  accent = "blue",
}: {
  items: CollectionItem[];
  groups?: string[];
  searchPlaceholder?: string;
  emptyMessage?: string;
  accent?: "blue" | "orange";
}) {
  const [query, setQuery] = useState("");
  const [group, setGroup] = useState("all");
  const [visible, setVisible] = useState(18);

  const filtered = useMemo(() => {
    const needle = normalize(query.trim());
    return items.filter((item) => {
      const matchesGroup = group === "all" || item.group === group;
      const haystack = normalize(`${item.title} ${item.description ?? ""} ${item.meta ?? ""}`);
      return matchesGroup && (!needle || haystack.includes(needle));
    });
  }, [group, items, query]);

  const shown = filtered.slice(0, visible);
  const activeClass = accent === "orange" ? "border-orange bg-orange text-navy" : "border-blue bg-blue text-white";

  return (
    <div>
      <div className="rounded-[1.25rem] border border-ink/12 bg-white p-4 shadow-[0_22px_70px_rgba(16,34,59,.07)] sm:p-5">
        <label htmlFor="collection-search" className="sr-only">Rechercher</label>
        <div className="flex items-center gap-3 border-b border-ink/14 px-1 pb-4">
          <span aria-hidden className="font-serif text-3xl text-blue">⌕</span>
          <input
            id="collection-search"
            type="search"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setVisible(18);
            }}
            placeholder={searchPlaceholder}
            className="min-h-11 w-full bg-transparent text-[.94rem] text-ink outline-none placeholder:text-ink-soft"
          />
          {(query || group !== "all") && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setGroup("all");
                setVisible(18);
              }}
              className="shrink-0 text-[.72rem] font-bold text-ink-muted underline underline-offset-4"
            >
              Effacer
            </button>
          )}
        </div>
        {groups.length > 0 && (
          <div className="mt-4 flex gap-2 overflow-x-auto pb-1" role="group" aria-label="Filtrer la collection">
            <button
              type="button"
              aria-pressed={group === "all"}
              onClick={() => { setGroup("all"); setVisible(18); }}
              className={`shrink-0 rounded-full border px-4 py-2 text-[.72rem] font-bold ${group === "all" ? activeClass : "border-ink/15 text-ink hover:border-blue"}`}
            >
              Tout
            </button>
            {groups.map((value) => (
              <button
                key={value}
                type="button"
                aria-pressed={group === value}
                onClick={() => { setGroup(value); setVisible(18); }}
                className={`shrink-0 rounded-full border px-4 py-2 text-[.72rem] font-bold ${group === value ? activeClass : "border-ink/15 text-ink hover:border-blue"}`}
              >
                {value}
              </button>
            ))}
          </div>
        )}
      </div>

      <p className="mt-5 text-[.72rem] font-bold uppercase tracking-[.16em] text-ink-muted" aria-live="polite">
        {filtered.length} résultat{filtered.length > 1 ? "s" : ""}
      </p>

      {shown.length > 0 ? (
        <div className="mt-5 grid border-l border-t border-ink/14 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((item, index) => (
            <Link
              key={`${item.href}-${index}`}
              href={item.href}
              className="group flex min-h-[13.5rem] flex-col justify-between border-b border-r border-ink/14 bg-white p-6 transition-colors hover:bg-lilac"
            >
              <div>
                <div className="flex items-start justify-between gap-4">
                  <span className="font-serif text-[2.1rem] leading-none text-blue">{String(index + 1).padStart(2, "0")}</span>
                  {(item.tag || item.group) && (
                    <span className="rounded-full border border-ink/12 px-2.5 py-1 text-[.6rem] uppercase tracking-[.11em] text-ink-muted">
                      {item.tag ?? item.group}
                    </span>
                  )}
                </div>
                <h3 className="mt-5 text-[1.2rem] font-semibold leading-snug text-ink group-hover:text-blue">{item.title}</h3>
                {item.description && <p className="mt-3 line-clamp-3 text-[.82rem] leading-6 text-ink-muted">{item.description}</p>}
              </div>
              <div className="mt-6 flex items-end justify-between gap-4 border-t border-ink/10 pt-4">
                <span className="text-[.68rem] text-ink-soft">{item.meta ?? "Lire et préparer"}</span>
                <span aria-hidden className="text-blue transition-transform group-hover:translate-x-1">↗</span>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <p className="mt-5 rounded-[1rem] border border-dashed border-ink/20 bg-white p-8 text-[.9rem] leading-7 text-ink-muted">{emptyMessage}</p>
      )}

      {visible < filtered.length && (
        <button
          type="button"
          onClick={() => setVisible((value) => value + 18)}
          className="mx-auto mt-8 flex min-h-12 items-center rounded-full border border-ink/25 bg-white px-6 text-[.8rem] font-bold text-ink hover:border-blue hover:text-blue"
        >
          Afficher plus ({filtered.length - visible})
        </button>
      )}
    </div>
  );
}
