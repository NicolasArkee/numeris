"use client";

import { useId, useState } from "react";

const SITUATIONS = [
  {
    id: "create",
    label: "Je démarre",
    title: "Préparez les décisions à prendre",
    body: "Présentez votre projet, les personnes impliquées et le calendrier envisagé. Distinguez les questions de création de celles qui concerneront la tenue comptable après le lancement.",
    bullets: [
      "Les démarches sur lesquelles vous attendez un accompagnement.",
      "Les documents déjà réunis et les sujets encore ouverts.",
      "Le fonctionnement souhaité pendant les premiers mois.",
    ],
    need: "Création d’activité",
  },
  {
    id: "switch",
    label: "Je change",
    title: "Organisez la reprise du dossier",
    body: "Votre prochain cabinet doit comprendre les travaux déjà réalisés, les échéances en cours et les outils utilisés. Préparez le transfert avant de comparer uniquement les honoraires.",
    bullets: [
      "Les documents disponibles et les accès à récupérer.",
      "Les responsabilités pendant la période de transition.",
      "Le calendrier à coordonner avec votre interlocuteur actuel.",
    ],
    need: "Reprise d’un dossier",
  },
  {
    id: "scope",
    label: "Je délègue",
    title: "Rendez le périmètre concret",
    body: "Listez les tâches que vous voulez déléguer et celles que vous gardez en interne. Une comparaison utile explique comment les pièces circulent et quand vous échangez.",
    bullets: [
      "Les volumes et la nature de vos opérations.",
      "Les outils de facturation, de caisse ou de paie.",
      "Le niveau de suivi attendu au fil de l’année.",
    ],
    need: "Définition du périmètre",
  },
] as const;

export function HomeJourneyTabs() {
  const [active, setActive] = useState<(typeof SITUATIONS)[number]["id"]>("create");
  const prefix = useId();
  const current = SITUATIONS.find((item) => item.id === active) ?? SITUATIONS[0];

  return (
    <div>
      <div
        role="tablist"
        aria-label="Votre situation"
        className="mb-4 flex flex-wrap gap-2"
        onKeyDown={(event) => {
          if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
          event.preventDefault();
          const index = SITUATIONS.findIndex((item) => item.id === active);
          const delta = event.key === 'ArrowRight' ? 1 : -1;
          const next = SITUATIONS[(index + delta + SITUATIONS.length) % SITUATIONS.length];
          setActive(next.id);
          document.getElementById(`${prefix}-tab-${next.id}`)?.focus();
        }}
      >
        {SITUATIONS.map((item) => (
          <button
            key={item.id}
            id={`${prefix}-tab-${item.id}`}
            type="button"
            role="tab"
            aria-selected={active === item.id}
            aria-controls={`${prefix}-panel-${item.id}`}
            tabIndex={active === item.id ? 0 : -1}
            onClick={() => setActive(item.id)}
            className={`rounded-full border px-4 py-2 text-[.78rem] font-bold transition-colors ${
              active === item.id
                ? "border-blue bg-blue text-white"
                : "border-ink/15 bg-white/50 text-ink hover:border-blue"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div
        id={`${prefix}-panel-${current.id}`}
        role="tabpanel"
        aria-labelledby={`${prefix}-tab-${current.id}`}
        className="rounded-[1.25rem] bg-white p-6 shadow-[0_24px_70px_rgba(16,34,59,.08)] sm:p-9"
      >
        <p className="text-[.66rem] font-bold uppercase tracking-[.18em] text-blue">Votre point de départ</p>
        <h3 className="mt-3 max-w-xl text-[clamp(1.6rem,3vw,2.25rem)] font-semibold leading-tight text-ink">
          {current.title}
        </h3>
        <p className="mt-5 max-w-2xl text-[.98rem] leading-7 text-ink-muted">{current.body}</p>
        <ul className="mt-5 grid gap-3 text-[.88rem] leading-6 text-ink sm:grid-cols-3">
          {current.bullets.map((bullet, index) => (
            <li key={bullet} className="border-t border-ink/12 pt-3">
              <span className="mr-2 font-serif text-xl text-blue">0{index + 1}</span>
              {bullet}
            </li>
          ))}
        </ul>
        <button
          type="button"
          data-open-brief
          data-situation={current.label}
          data-need={current.need}
          className="mt-7 inline-flex min-h-12 items-center rounded-full bg-orange px-6 text-[.86rem] font-bold text-navy transition-transform hover:-translate-y-0.5"
        >
          Préparer ce parcours&nbsp; ↗
        </button>
      </div>
    </div>
  );
}
