"use client";

import { useMemo, useState } from "react";
import { BriefTrigger } from "./BriefTrigger";

type MissionOption = { slug: string; label: string };

export function LandingScopeBuilder({
  activity,
  activityKind,
  missions,
}: {
  activity: string;
  activityKind: "profession" | "secteur";
  missions: MissionOption[];
}) {
  const [situation, setSituation] = useState("Activité en cours");
  const [mission, setMission] = useState(missions[0]?.label ?? "Comptabilité et bilan");
  const [mode, setMode] = useState("Hybride");

  const notes = useMemo(
    () => `${activityKind === "profession" ? "Profession" : "Secteur"} : ${activity}\nMode de collaboration souhaité : ${mode}`,
    [activity, activityKind, mode],
  );

  return (
    <section className="overflow-hidden rounded-[1.25rem] border border-ink/12 bg-white shadow-[0_24px_80px_rgba(16,34,59,.08)]" aria-labelledby="scope-title">
      <div className="grid gap-6 bg-lilac p-6 lg:grid-cols-[.75fr_1.25fr] lg:items-end lg:p-8">
        <div>
          <p className="text-[.64rem] font-bold uppercase tracking-[.18em] text-blue">Votre périmètre</p>
          <h2 id="scope-title" className="mt-3 text-[clamp(2rem,4vw,3.1rem)] font-semibold leading-tight text-ink">
            Rendez votre demande comparable.
          </h2>
        </div>
        <p className="text-[.9rem] leading-7 text-ink-muted">
          Trois choix suffisent pour préparer le premier échange. Vous pourrez compléter les volumes, les outils, les échéances et vos questions dans le brief.
        </p>
      </div>

      <div className="grid gap-px bg-ink/12 md:grid-cols-3">
        <label className="bg-white p-6">
          <span className="text-[.65rem] font-bold uppercase tracking-[.14em] text-ink-muted">01 · Situation</span>
          <select value={situation} onChange={(event) => setSituation(event.target.value)} className="mt-3 min-h-12 w-full rounded-xl border border-ink/16 bg-paper px-4 text-[.86rem] text-ink outline-none focus:border-blue">
            <option>Je crée mon activité</option>
            <option>Activité en cours</option>
            <option>Je change de cabinet</option>
            <option>Besoin ponctuel</option>
          </select>
        </label>
        <label className="bg-white p-6">
          <span className="text-[.65rem] font-bold uppercase tracking-[.14em] text-ink-muted">02 · Mission prioritaire</span>
          <select value={mission} onChange={(event) => setMission(event.target.value)} className="mt-3 min-h-12 w-full rounded-xl border border-ink/16 bg-paper px-4 text-[.86rem] text-ink outline-none focus:border-blue">
            {missions.map((item) => <option key={item.slug}>{item.label}</option>)}
          </select>
        </label>
        <label className="bg-white p-6">
          <span className="text-[.65rem] font-bold uppercase tracking-[.14em] text-ink-muted">03 · Mode d’échange</span>
          <select value={mode} onChange={(event) => setMode(event.target.value)} className="mt-3 min-h-12 w-full rounded-xl border border-ink/16 bg-paper px-4 text-[.86rem] text-ink outline-none focus:border-blue">
            <option>Présentiel</option>
            <option>Hybride</option>
            <option>À distance</option>
            <option>À discuter</option>
          </select>
        </label>
      </div>

      <div className="flex flex-col gap-5 bg-navy p-6 text-white sm:flex-row sm:items-center sm:justify-between lg:px-8">
        <div>
          <p className="text-[.65rem] font-bold uppercase tracking-[.14em] text-white/50">Votre point de départ</p>
          <p className="mt-2 text-[.9rem] leading-6 text-white/80">{activity} · {mission} · {mode}</p>
        </div>
        <BriefTrigger
          prefill={{ profession: activity, situation, need: mission, notes }}
          className="inline-flex min-h-12 shrink-0 items-center justify-center rounded-full bg-orange px-6 text-[.8rem] font-bold text-navy"
        >
          Continuer dans mon brief&nbsp; ↗
        </BriefTrigger>
      </div>
    </section>
  );
}
