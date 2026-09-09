"use client";

import { useId, useState } from "react";
import { BriefTrigger } from "@/components/journey/BriefTrigger";
import localJourney from "@/data/skoria-v2/local-journey.json";

export function LocalComparisonPlanner({ city, area }: { city?: string; area: string }) {
  const [selected, setSelected] = useState(localJourney.modes[0].id);
  const mode = localJourney.modes.find((item) => item.id === selected)!;
  const id = useId();

  return (
    <section className="overflow-hidden rounded-[1.75rem] bg-navy text-white" aria-labelledby={`${id}-title`}>
      <div className="grid lg:grid-cols-[.8fr_1.2fr]">
        <div className="p-6 sm:p-9 lg:p-10">
          <p className="font-mono text-[.65rem] font-bold uppercase tracking-[.18em] text-[#ffb293]">Votre mode de collaboration</p>
          <h2 id={`${id}-title`} className="mt-5 max-w-[16ch] text-balance text-[clamp(2rem,4vw,3.4rem)] font-semibold leading-[1.04]">Proche de vous, dans la façon de travailler.</h2>
          <p className="mt-6 text-[.91rem] leading-7 text-white/72">Votre recherche porte sur {area}. Choisissez le mode d'échange envisagé : les questions à poser s'adaptent à votre préférence.</p>
          <div className="mt-8 flex flex-wrap gap-2" role="group" aria-label="Mode de collaboration souhaité">
            {localJourney.modes.map((item) => (
              <button key={item.id} type="button" aria-pressed={selected === item.id} aria-controls={`${id}-panel`} onClick={() => setSelected(item.id)} className={`min-h-12 rounded-full border px-4 py-3 text-[.78rem] font-bold transition-colors ${selected === item.id ? "border-orange bg-orange text-navy" : "border-white/25 text-white hover:bg-white/10"}`}>{item.label}</button>
            ))}
          </div>
          <p className="mt-5 text-[.73rem] leading-6 text-white/55">Ce choix prépare vos questions ; il ne filtre pas les cabinets de l'annuaire.</p>
        </div>
        <div id={`${id}-panel`} className="m-3 rounded-[1.3rem] bg-mint p-6 text-navy sm:m-5 sm:p-8 lg:m-6" aria-live="polite" aria-atomic="true">
          <p className="font-mono text-[.64rem] font-bold uppercase tracking-[.16em] text-blue">{mode.label}</p>
          <h3 className="mt-4 text-[clamp(1.6rem,3vw,2.25rem)] font-bold leading-tight">{mode.title}</h3>
          <p className="mt-4 text-[.87rem] leading-7 text-ink-muted">{mode.description}</p>
          <ul className="mt-6 space-y-3">
            {mode.questions.map((question, index) => <li key={question} className="flex gap-3 border-t border-ink/12 pt-3 text-[.86rem] font-semibold leading-6"><span aria-hidden className="mt-0.5 font-mono text-[.62rem] text-blue">0{index + 1}</span><span>{question}</span></li>)}
          </ul>
          <p className="mt-6 rounded-2xl bg-white/75 p-4 text-[.8rem] leading-6"><strong>À préparer : </strong>{mode.prepare}</p>
          <BriefTrigger prefill={{ ...(city ? { city } : {}), need: `Comparer un accompagnement ${mode.label.toLowerCase()} — ${area}`, notes: mode.questions.join("\n") }} className="mt-6 inline-flex min-h-12 items-center justify-center gap-3 rounded-full bg-blue px-6 py-3 text-[.81rem] font-bold text-white hover:bg-navy">Préparer ces questions <span aria-hidden>↗</span></BriefTrigger>
        </div>
      </div>
    </section>
  );
}
