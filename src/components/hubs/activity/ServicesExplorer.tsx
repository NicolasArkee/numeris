"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { ServiceHubEntry } from "./types";

const INTENTS = [
  { value: "", label: "Tous les besoins" },
  { value: "obligations", label: "Tenir mes obligations" },
  { value: "launch", label: "Créer ou reprendre" },
  { value: "team", label: "Gérer mon équipe" },
  { value: "manage", label: "Piloter mon activité" },
  { value: "secure", label: "Contrôler et sécuriser" },
] as const;

function normalize(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/gu, "")
    .toLocaleLowerCase("fr")
    .trim();
}

function serviceIntent(service: ServiceHubEntry): string {
  const value = normalize(`${service.slug} ${service.title}`);
  if (/creation|reprendre|reprise|lancement/u.test(value)) return "launch";
  if (/social|paie|rh|salar/u.test(value)) return "team";
  if (/gestion|pilot|conseil/u.test(value)) return "manage";
  if (/audit|commissariat|controle/u.test(value)) return "secure";
  return "obligations";
}

function comparisonPoints(service: ServiceHubEntry): string[] {
  const value = normalize(`${service.slug} ${service.title}`);
  if (/social|paie|rh/u.test(value)) {
    return ["Qui collecte et contrôle les variables ?", "Quels événements sont inclus ?", "Quel interlocuteur répond aux questions ?"];
  }
  if (/creation|reprise/u.test(value)) {
    return ["Quelles étapes sont réellement couvertes ?", "Quels livrables sont remis ?", "Comment démarre le suivi récurrent ?"];
  }
  if (/gestion|pilot|conseil/u.test(value)) {
    return ["Quels indicateurs répondent à vos décisions ?", "À quelle fréquence sont-ils commentés ?", "Qui prépare les hypothèses ?"];
  }
  if (/audit|commissariat|controle/u.test(value)) {
    return ["Quel est l’objet précis de l’intervention ?", "Quel calendrier et quelles pièces prévoir ?", "Comment sont restitués les constats ?"];
  }
  if (/fiscal/u.test(value)) {
    return ["Quelles déclarations entrent dans la mission ?", "Qui prépare et valide les éléments ?", "Comment traiter une opération inhabituelle ?"];
  }
  return ["Qui collecte, traite et contrôle ?", "Quels livrables sont compris ?", "Quel rythme d’échange est prévu ?"];
}

export function ServicesExplorer({ services }: { services: ServiceHubEntry[] }) {
  const [query, setQuery] = useState("");
  const [intent, setIntent] = useState("");

  const visibleServices = useMemo(() => {
    const needle = normalize(query);
    return services.filter((service) => {
      const matchesIntent = !intent || serviceIntent(service) === intent;
      const matchesQuery = !needle || normalize(`${service.title} ${service.description}`).includes(needle);
      return matchesIntent && matchesQuery;
    });
  }, [intent, query, services]);

  return (
    <section id="expertises-catalogue" className="bg-paper px-5 py-16 sm:px-8 lg:px-14 lg:py-24 xl:px-20">
      <div className="mx-auto max-w-[80rem]">
        <div className="mb-10 grid gap-6 lg:grid-cols-[1fr_.72fr] lg:items-end">
          <div>
            <p className="sk-eyebrow mb-4 text-cobalt">Construire le périmètre</p>
            <h2 className="sk-section-title">
              Une mission utile se décrit. Puis se compare.
            </h2>
          </div>
          <p className="text-[.98rem] leading-7 text-ink-muted">
            Partez du résultat attendu, examinez les tâches et vérifiez ce que couvre chaque proposition. Les intitulés proches ne garantissent pas le même fonctionnement.
          </p>
        </div>

        <div className="grid gap-5 rounded-[1.5rem] bg-navy p-5 text-white sm:p-7 lg:grid-cols-[1.2fr_.9fr_auto] lg:items-end">
          <div>
            <label htmlFor="service-search" className="mb-2 block text-[.72rem] font-semibold uppercase tracking-[.12em] text-white/65">
              Rechercher une expertise
            </label>
            <input
              id="service-search"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Comptabilité, fiscalité, paie…"
              className="min-h-12 w-full rounded-xl border border-white/20 bg-white px-4 text-[.92rem] text-ink placeholder:text-ink-muted/70"
              aria-controls="service-results"
            />
          </div>
          <div>
            <label htmlFor="service-intent" className="mb-2 block text-[.72rem] font-semibold uppercase tracking-[.12em] text-white/65">
              Votre besoin principal
            </label>
            <select
              id="service-intent"
              value={intent}
              onChange={(event) => setIntent(event.target.value)}
              className="min-h-12 w-full rounded-xl border border-white/20 bg-white px-4 text-[.9rem] text-ink"
              aria-controls="service-results"
            >
              {INTENTS.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
            </select>
          </div>
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setIntent("");
            }}
            disabled={!query && !intent}
            className="min-h-12 rounded-full border border-white/30 px-5 text-[.8rem] font-semibold transition-colors hover:bg-white hover:text-navy disabled:cursor-not-allowed disabled:opacity-35"
          >
            Réinitialiser
          </button>
        </div>

        <p className="border-b border-ink/15 py-5 text-[.83rem] font-semibold" role="status" aria-live="polite">
          {visibleServices.length} {visibleServices.length > 1 ? "expertises affichées" : "expertise affichée"}
        </p>

        <div id="service-results" className="divide-y divide-ink/15 border-b border-ink/15">
          {visibleServices.map((service, index) => (
            <article key={service.slug} className="grid gap-6 py-10 lg:grid-cols-[5rem_.72fr_1.15fr_auto] lg:gap-8">
              <div className="flex items-center gap-3 lg:block">
                <span className="font-editorial text-[3.2rem] leading-none text-cobalt" aria-hidden>{String(index + 1).padStart(2, "0")}</span>
                <span className="text-[1.4rem]" aria-hidden>{service.icon}</span>
              </div>
              <div>
                <p className="mb-2 text-[.66rem] font-bold uppercase tracking-[.13em] text-ink-muted">Expertise à comparer</p>
                <h3 className="text-[1.5rem] font-semibold leading-tight">{service.title}</h3>
                <p className="mt-4 text-[.88rem] leading-7 text-ink-muted">{service.description}</p>
              </div>
              <div>
                <p className="mb-3 text-[.7rem] font-bold uppercase tracking-[.12em] text-cobalt">Trois questions à poser</p>
                <ul className="space-y-3">
                  {comparisonPoints(service).map((point) => (
                    <li key={point} className="flex gap-3 text-[.84rem] leading-6 text-ink-muted">
                      <span aria-hidden className="mt-[.55rem] h-1.5 w-1.5 shrink-0 rounded-full bg-accent-500" />
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex flex-row flex-wrap gap-3 lg:w-48 lg:flex-col">
                <Link
                  href={`/expertises/${service.slug}`}
                  className="inline-flex min-h-11 items-center justify-center rounded-full bg-cobalt px-5 text-[.78rem] font-bold text-white transition-colors hover:bg-navy"
                >
                  Voir la mission ↗
                </Link>
                <button
                  type="button"
                  data-open-brief
                  data-need={service.title}
                  className="inline-flex min-h-11 items-center justify-center rounded-full border border-ink/20 px-5 text-[.76rem] font-semibold text-ink transition-colors hover:border-cobalt hover:text-cobalt"
                >
                  Ajouter au brief
                </button>
              </div>
            </article>
          ))}

          {visibleServices.length === 0 && (
            <div className="py-14 text-center" role="status">
              <h3 className="text-[1.2rem] font-semibold">Aucune expertise ne correspond à ces critères.</h3>
              <p className="mt-3 text-[.9rem] text-ink-muted">Revenez à tous les besoins ou recherchez un terme plus général.</p>
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setIntent("");
                }}
                className="mt-5 rounded-full bg-cobalt px-5 py-3 text-[.82rem] font-bold text-white"
              >
                Voir toutes les expertises
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
