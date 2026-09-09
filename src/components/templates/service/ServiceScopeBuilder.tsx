"use client";

import { useMemo, useState } from "react";
import { BriefTrigger } from "@/components/journey/BriefTrigger";

export type ScopeOption = {
  title: string;
  body: string;
};

export function ServiceScopeBuilder({
  serviceTitle,
  options,
}: {
  serviceTitle: string;
  options: ScopeOption[];
}) {
  const [selected, setSelected] = useState<string[]>([]);
  const summary = useMemo(
    () => selected.length > 0 ? selected.join(" · ") : "Aucun bloc sélectionné pour le moment",
    [selected],
  );

  function toggle(title: string) {
    setSelected((current) => current.includes(title)
      ? current.filter((item) => item !== title)
      : [...current, title]);
  }

  return (
    <div className="overflow-hidden rounded-[1.5rem] border border-white/15 bg-white/7">
      <div className="grid gap-px bg-white/15 md:grid-cols-2 xl:grid-cols-3">
        {options.map((option, index) => {
          const checked = selected.includes(option.title);
          return (
            <label key={option.title} className={`group cursor-pointer p-5 transition-colors ${checked ? "bg-orange text-navy" : "bg-navy text-white hover:bg-white/10"}`}>
              <span className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggle(option.title)}
                  className="mt-1 h-4 w-4 shrink-0 accent-[#ff7548]"
                />
                <span>
                  <span className="block text-[.63rem] font-bold uppercase tracking-[.16em] opacity-60">Bloc {String(index + 1).padStart(2, "0")}</span>
                  <span className="mt-2 block text-[.95rem] font-bold">{option.title}</span>
                  <span className="mt-2 block text-[.78rem] leading-6 opacity-75">{option.body}</span>
                </span>
              </span>
            </label>
          );
        })}
      </div>
      <div className="flex flex-col gap-5 bg-white px-6 py-5 text-ink lg:flex-row lg:items-center lg:justify-between">
        <div aria-live="polite">
          <p className="sk-eyebrow text-ink-muted">Périmètre provisoire · {selected.length} bloc{selected.length > 1 ? "s" : ""}</p>
          <p className="mt-2 max-w-3xl text-[.82rem] leading-6 text-ink-muted">{summary}</p>
        </div>
        <BriefTrigger
          prefill={{
            need: serviceTitle,
            notes: selected.length > 0
              ? `Périmètre envisagé pour ${serviceTitle} : ${selected.join(", ")}`
              : `Je souhaite cadrer une mission de ${serviceTitle}.`,
          }}
          className="inline-flex min-h-12 shrink-0 items-center justify-center rounded-full bg-orange px-6 text-[.8rem] font-bold text-navy transition-transform hover:-translate-y-0.5"
        >
          Ajouter au brief&nbsp; ↗
        </BriefTrigger>
      </div>
    </div>
  );
}
