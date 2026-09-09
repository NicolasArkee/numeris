"use client";

import { useEffect, useState } from "react";

export interface EditorialTocItem {
  id: string;
  label: string;
}

/** Sommaire actif : les liens restent de simples ancres, l'état suit la lecture. */
export function EditorialToc({
  items,
  title = "Dans ce guide",
}: {
  items: EditorialTocItem[];
  title?: string;
}) {
  const [activeId, setActiveId] = useState(items[0]?.id ?? "");

  useEffect(() => {
    const targets = items
      .map((item) => document.getElementById(item.id))
      .filter((target): target is HTMLElement => target !== null);
    if (targets.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (visible?.target.id) setActiveId(visible.target.id);
      },
      { rootMargin: "-22% 0px -62% 0px", threshold: [0, 0.1, 0.5] },
    );
    targets.forEach((target) => observer.observe(target));
    return () => observer.disconnect();
  }, [items]);

  if (items.length < 2) return null;

  return (
    <nav aria-label={title} className="border-y border-ink/12 bg-white px-5 sm:px-8">
      <div className="mx-auto flex max-w-7xl items-center gap-4 overflow-x-auto py-3">
        <span className="shrink-0 text-[.62rem] font-bold uppercase tracking-[.18em] text-ink-soft">
          {title}
        </span>
        <ol className="flex min-w-max items-center gap-1">
          {items.map((item, index) => (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                aria-current={activeId === item.id ? "location" : undefined}
                className={`inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-[.7rem] font-bold transition-colors ${
                  activeId === item.id
                    ? "bg-blue text-white"
                    : "text-ink-muted hover:bg-lilac hover:text-ink"
                }`}
              >
                <span className="font-serif text-[.92rem] font-normal">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="max-w-[13rem] truncate">{item.label}</span>
              </a>
            </li>
          ))}
        </ol>
      </div>
    </nav>
  );
}
