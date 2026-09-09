"use client";

import Link from "next/link";
import { useId, useRef, useState, type KeyboardEvent } from "react";

export interface EditorialPathItem {
  href: string;
  title: string;
  description?: string | null;
  meta?: string;
}

type PathKey = "discover" | "deepen" | "prepare";

const PATHS: { key: PathKey; label: string; eyebrow: string; description: string }[] = [
  {
    key: "discover",
    label: "Je découvre",
    eyebrow: "Commencer par les bases",
    description: "Une première sélection pour poser le vocabulaire et comprendre les principaux choix.",
  },
  {
    key: "deepen",
    label: "J’approfondis",
    eyebrow: "Relier les règles entre elles",
    description: "Des lectures plus précises pour confronter les options, les limites et les cas particuliers.",
  },
  {
    key: "prepare",
    label: "Je prépare une décision",
    eyebrow: "Passer à une situation concrète",
    description: "Les pages qui aident à réunir les informations et à préparer les questions à poser.",
  },
];

function selectItems(items: EditorialPathItem[], path: PathKey): EditorialPathItem[] {
  if (items.length <= 3) return items;
  if (path === "discover") return items.slice(0, 3);
  if (path === "prepare") return items.slice(-3);
  const start = Math.max(0, Math.floor(items.length / 2) - 1);
  return items.slice(start, start + 3);
}

/** Navigation progressive basée uniquement sur les destinations réellement disponibles. */
export function EditorialPathChooser({
  items,
  title = "Choisissez votre point de départ",
}: {
  items: EditorialPathItem[];
  title?: string;
}) {
  const [active, setActive] = useState<PathKey>("discover");
  const idPrefix = useId().replace(/:/gu, "");
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  if (items.length === 0) return null;

  const path = PATHS.find((entry) => entry.key === active) ?? PATHS[0];
  const selected = selectItems(items, active);
  const activeIndex = PATHS.findIndex((entry) => entry.key === active);
  const activateTab = (index: number) => {
    const normalized = (index + PATHS.length) % PATHS.length;
    setActive(PATHS[normalized].key);
    window.requestAnimationFrame(() => tabRefs.current[normalized]?.focus());
  };
  const handleTabKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      activateTab(index + 1);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      activateTab(index - 1);
    } else if (event.key === "Home") {
      event.preventDefault();
      activateTab(0);
    } else if (event.key === "End") {
      event.preventDefault();
      activateTab(PATHS.length - 1);
    }
  };

  return (
    <section id="parcours" className="scroll-mt-36 bg-navy px-5 py-16 text-white sm:px-8 lg:py-24">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-10 lg:grid-cols-[.72fr_1.28fr] lg:gap-20">
          <div>
            <p className="text-[.65rem] font-bold uppercase tracking-[.2em] text-[#ffb293]">
              Parcours de lecture
            </p>
            <h2 className="mt-4 text-balance text-[clamp(2.45rem,5vw,4.35rem)] font-semibold leading-[1.01] tracking-[-.045em]">
              {title}
            </h2>
            <div className="mt-8 flex flex-wrap gap-2" role="tablist" aria-label="Objectif de lecture">
              {PATHS.map((entry, index) => (
                <button
                  key={entry.key}
                  ref={(node) => { tabRefs.current[index] = node; }}
                  id={`${idPrefix}-tab-${entry.key}`}
                  type="button"
                  role="tab"
                  aria-selected={active === entry.key}
                  aria-controls={`${idPrefix}-panel`}
                  tabIndex={active === entry.key ? 0 : -1}
                  onClick={() => setActive(entry.key)}
                  onKeyDown={(event) => handleTabKeyDown(event, index)}
                  className={`rounded-full border px-4 py-2.5 text-[.73rem] font-bold transition-colors ${
                    active === entry.key
                      ? "border-orange bg-orange text-navy"
                      : "border-white/22 text-white/78 hover:border-white/60 hover:text-white"
                  }`}
                >
                  {entry.label}
                </button>
              ))}
            </div>
          </div>

          <div
            id={`${idPrefix}-panel`}
            role="tabpanel"
            aria-labelledby={`${idPrefix}-tab-${PATHS[activeIndex]?.key ?? PATHS[0].key}`}
            tabIndex={0}
            className="min-w-0 outline-none"
          >
            <p className="text-[.66rem] font-bold uppercase tracking-[.16em] text-white/55">
              {path.eyebrow}
            </p>
            <p className="mt-3 max-w-2xl text-[.94rem] leading-7 text-white/68">
              {path.description}
            </p>
            <div className="mt-7 grid border-l border-t border-white/18 sm:grid-cols-3">
              {selected.map((item, index) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="group flex min-h-[14rem] flex-col justify-between border-b border-r border-white/18 p-5 transition-colors hover:bg-white hover:text-navy"
                >
                  <span className="font-serif text-[2.35rem] leading-none text-[#ffb293] group-hover:text-blue">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span>
                    <span className="block text-[1.02rem] font-semibold leading-snug">
                      {item.title}
                    </span>
                    {item.description && (
                      <span className="mt-3 line-clamp-3 block text-[.76rem] leading-5 text-white/58 group-hover:text-ink-muted">
                        {item.description}
                      </span>
                    )}
                  </span>
                  <span className="mt-5 flex items-center justify-between border-t border-current/15 pt-3 text-[.66rem]">
                    {item.meta ?? "Lire la suite"}
                    <span aria-hidden className="transition-transform group-hover:translate-x-1">↗</span>
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
