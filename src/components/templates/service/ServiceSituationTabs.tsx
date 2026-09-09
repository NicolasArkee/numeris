"use client";

import { useId, useRef, useState, type KeyboardEvent } from "react";
import { BriefTrigger } from "@/components/journey/BriefTrigger";

type Situation = {
  id: string;
  label: string;
  title: string;
  body: string;
  checks: string[];
};

const situations: Situation[] = [
  {
    id: "demarrer",
    label: "Je démarre",
    title: "Poser le bon cadre avant les premières échéances",
    body: "Le choix du statut, des outils et du rythme de suivi influence la façon dont la mission sera organisée. Un brief initial permet de comparer des propositions portant sur le même périmètre.",
    checks: ["Date de démarrage et première échéance", "Statut, régime et activité", "Outils déjà choisis ou à sélectionner"],
  },
  {
    id: "deleguer",
    label: "Je délègue",
    title: "Distinguer ce qui reste en interne de ce qui est confié",
    body: "La collecte, la validation et les décisions ne disparaissent pas avec l’externalisation. La lettre de mission doit nommer les tâches, les interlocuteurs, les contrôles et les livrables.",
    checks: ["Volumes et fréquence des flux", "Répartition des responsabilités", "Livrables utiles au dirigeant"],
  },
  {
    id: "changer",
    label: "Je change",
    title: "Sécuriser la reprise sans perdre l’historique",
    body: "Un changement de cabinet demande un état des lieux, un calendrier de bascule et une liste précise des données à reprendre. Les points bloquants doivent être visibles avant l’engagement.",
    checks: ["Dernière période validée", "Exports, pièces et accès disponibles", "Échéances proches et anomalies connues"],
  },
];

export function ServiceSituationTabs({
  serviceTitle,
}: {
  serviceTitle: string;
}) {
  const uid = useId();
  const [activeId, setActiveId] = useState(situations[0].id);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const active = situations.find((item) => item.id === activeId) ?? situations[0];

  function onTabKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let nextIndex: number | undefined;
    if (event.key === "ArrowRight") nextIndex = (index + 1) % situations.length;
    if (event.key === "ArrowLeft") nextIndex = (index - 1 + situations.length) % situations.length;
    if (event.key === "Home") nextIndex = 0;
    if (event.key === "End") nextIndex = situations.length - 1;
    if (nextIndex === undefined) return;
    event.preventDefault();
    setActiveId(situations[nextIndex].id);
    tabRefs.current[nextIndex]?.focus();
  }

  return (
    <div className="overflow-hidden rounded-[1.5rem] border border-ink/12 bg-white shadow-[0_24px_70px_rgba(7,29,60,.08)]">
      <div
        role="tablist"
        aria-label="Choisir votre situation"
        className="grid border-b border-ink/12 bg-paper sm:grid-cols-3"
      >
        {situations.map((item, index) => {
          const selected = item.id === active.id;
          return (
            <button
              key={item.id}
              ref={(node) => { tabRefs.current[index] = node; }}
              id={`${uid}-tab-${item.id}`}
              type="button"
              role="tab"
              aria-selected={selected}
              aria-controls={`${uid}-panel-${item.id}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => setActiveId(item.id)}
              onKeyDown={(event) => onTabKeyDown(event, index)}
              className={`min-h-14 border-b-2 px-5 py-4 text-left text-[.78rem] font-bold transition-colors sm:text-center ${selected ? "border-blue bg-white text-blue" : "border-transparent text-ink-muted hover:bg-white/70 hover:text-ink"}`}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      <div
        id={`${uid}-panel-${active.id}`}
        role="tabpanel"
        aria-labelledby={`${uid}-tab-${active.id}`}
        className="grid gap-8 p-6 lg:grid-cols-[1fr_.85fr] lg:p-9"
      >
        <div>
          <p className="sk-eyebrow text-blue">Votre point de départ</p>
          <h3 className="mt-3 max-w-xl text-[clamp(1.65rem,3vw,2.5rem)] font-semibold leading-tight text-ink">
            {active.title}
          </h3>
          <p className="mt-4 max-w-2xl text-[.94rem] leading-7 text-ink-muted">{active.body}</p>
          <BriefTrigger
            prefill={{
              situation: active.label,
              need: serviceTitle,
              notes: `Situation : ${active.label}\nMission à comparer : ${serviceTitle}`,
            }}
            className="mt-6 inline-flex min-h-12 items-center justify-center rounded-full bg-orange px-6 text-[.8rem] font-bold text-navy transition-transform hover:-translate-y-0.5"
          >
            Préparer ce cas dans mon brief&nbsp; ↗
          </BriefTrigger>
        </div>
        <ul className="grid content-start gap-3" aria-label="Points à préparer">
          {active.checks.map((check, index) => (
            <li key={check} className="grid grid-cols-[2.25rem_1fr] gap-3 rounded-xl bg-lilac p-4 text-[.84rem] leading-6 text-ink">
              <span aria-hidden className="font-mono text-[.7rem] font-bold text-blue">0{index + 1}</span>
              {check}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
