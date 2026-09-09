import React from "react";
import type { DirectoryFaqItem } from "./profile-v2-helpers";

export function DirectoryFaq({ items }: { items: DirectoryFaqItem[] }) {
  if (items.length === 0) return null;

  return (
    <section id="questions-annuaire" className="scroll-mt-32 rounded-[2rem] bg-lilac p-6 sm:p-8 lg:p-10">
      <div className="grid gap-8 lg:grid-cols-[.7fr_1.3fr] lg:gap-12">
        <div>
          <p className="text-[.68rem] font-bold uppercase tracking-[.16em] text-blue">Pour choisir en connaissance de cause</p>
          <h2 className="mt-4 max-w-md font-display text-[clamp(2rem,4vw,3rem)] font-bold leading-[1.12] tracking-tight text-ink">Questions fréquentes</h2>
          <p className="mt-5 max-w-md text-[.95rem] leading-7 text-ink-muted">Comprendre une fiche, vérifier les informations utiles et préparer votre premier échange.</p>
          <span aria-hidden className="mt-8 hidden h-16 w-16 items-center justify-center rounded-full bg-blue text-3xl font-bold text-white lg:flex">?</span>
        </div>
        <div className="min-w-0 space-y-3">
          {items.map((item, index) => (
            <details key={item.question} className="group overflow-hidden rounded-[1.25rem] border border-ink/10 bg-white transition-colors open:border-blue/30 open:bg-white">
              <summary className="flex cursor-pointer list-none items-start gap-3 p-5 font-display text-[.97rem] font-bold leading-6 text-ink outline-none transition-colors hover:text-blue focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue sm:gap-4 sm:p-6 [&::-webkit-details-marker]:hidden">
                <span aria-hidden className="pt-0.5 text-[.65rem] font-bold text-blue">{String(index + 1).padStart(2, "0")}</span>
                <span className="min-w-0 flex-1">{item.question}</span>
                <span aria-hidden className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-paper text-xl text-blue transition-transform group-open:rotate-45">+</span>
              </summary>
              <div className="px-5 pb-6 text-[.93rem] leading-7 text-ink-muted sm:px-6 sm:pl-14">{item.answer}</div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
