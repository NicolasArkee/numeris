"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { Icon } from "@/components/Icon";

export type SimulatorCatalogGroup =
  | "Fiscalité & TVA"
  | "Équipe & rémunération"
  | "Créer & piloter";

/** Deliberately serializable: the tool registry stays on the server. */
export type SimulatorCatalogItem = {
  slug: string;
  title: string;
  description: string;
  group: SimulatorCatalogGroup;
  eyebrow: string;
  tags?: string[];
};

type CardPresentation = {
  icon: string;
  inputs: string;
  output: string;
  action?: string;
};

const GROUPS: SimulatorCatalogGroup[] = [
  "Fiscalité & TVA",
  "Équipe & rémunération",
  "Créer & piloter",
];

const GROUP_TONES: Record<SimulatorCatalogGroup, string> = {
  "Fiscalité & TVA": "bg-mint",
  "Équipe & rémunération": "bg-lilac",
  "Créer & piloter": "bg-apricot",
};

// These labels describe existing inputs and results; no rates or calculations
// are duplicated here. The simulator itself remains the source of its rules.
const PRESENTATIONS: Record<string, CardPresentation> = {
  "calcul-tva": {
    icon: "calculator",
    inputs: "Montant · sens de conversion · taux",
    output: "Montants HT, TTC et taxe",
  },
  "frais-kilometriques": {
    icon: "route",
    inputs: "Distance · véhicule · puissance fiscale",
    output: "Indemnité kilométrique estimée",
  },
  "calcul-impot-societes": {
    icon: "bar-chart",
    inputs: "Bénéfice · conditions du taux réduit",
    output: "Impôt estimé par tranche",
  },
  immobilier: {
    icon: "house",
    inputs: "Loyers · charges · bien et mobilier",
    output: "Bases imposables micro-BIC / réel",
    action: "Comparer les régimes",
  },
  "cout-salarie": {
    icon: "users",
    inputs: "Salaire brut · profil du salarié",
    output: "Coût employeur et net estimés",
  },
  "jours-ouvres": {
    icon: "calendar",
    inputs: "Date de début · date de fin",
    output: "Jours ouvrés, ouvrables et calendaires",
  },
  "rupture-conventionnelle": {
    icon: "clipboard",
    inputs: "Ancienneté · salaire de référence",
    output: "Indemnité minimale indicative",
  },
  "prime-fin-cdd": {
    icon: "receipt",
    inputs: "Rémunération du contrat · options",
    output: "Prime et congés payés éventuels",
  },
  "grille-salaire-expert-comptable": {
    icon: "wallet",
    inputs: "Expérience · région",
    output: "Fourchettes de rémunération",
    action: "Explorer la grille",
  },
  charges: {
    icon: "calculator",
    inputs: "Activité · statut · revenu",
    output: "Cotisations et net avant impôt",
  },
  statuts: {
    icon: "scale",
    inputs: "Chiffre d’affaires · frais · activité",
    output: "Revenus et prélèvements par scénario",
    action: "Comparer les statuts",
  },
  tjm: {
    icon: "trending-up",
    inputs: "Revenu cible · frais · jours facturés",
    output: "Taux journalier à envisager",
  },
  "capital-social": {
    icon: "capital",
    inputs: "Associés · apports · valeur d’une part",
    output: "Parts, pourcentages et répartition",
  },
  honoraires: {
    icon: "euro",
    inputs: "Forme juridique · activité · salariés",
    output: "Fourchette mensuelle indicative",
    action: "Estimer les honoraires",
  },
};

function normalizeSearch(value: string) {
  return value
    .toLocaleLowerCase("fr")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/œ/g, "oe")
    .replace(/[’'\-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function CatalogIcon({ name, size = 24 }: { name: string; size?: number }) {
  if (!["route", "calendar", "capital"].includes(name)) {
    return <Icon name={name} size={size} />;
  }

  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {name === "route" && <><circle cx="5" cy="5" r="2" /><circle cx="19" cy="19" r="2" /><path d="M7 5h9a4 4 0 0 1 0 8H8a3 3 0 0 0 0 6h9" /></>}
      {name === "calendar" && <><rect x="3" y="5" width="18" height="16" rx="3" /><path d="M7 3v4m10-4v4M3 11h18M7 15h2m6 0h2m-10 3h2" /></>}
      {name === "capital" && <><path d="M12 3v9h9A9 9 0 1 1 12 3Z" /><path d="M15 3.5A9 9 0 0 1 20.5 9H15Z" /></>}
    </svg>
  );
}

function ToolCard({ item, index }: { item: SimulatorCatalogItem; index: number }) {
  const presentation = PRESENTATIONS[item.slug] ?? {
    icon: "calculator",
    inputs: "Les données de votre scénario",
    output: "Une estimation expliquée",
  };
  const isComparison = item.slug === "statuts";
  const headingId = `simulator-card-${item.slug}`;

  return (
    <li className="min-w-0">
      <Link
        href={`/simulateurs/${item.slug}`}
        aria-labelledby={headingId}
        data-simulator={item.slug}
        className={`group relative flex h-full min-h-[25rem] flex-col overflow-hidden rounded-[1.6rem] border p-6 transition duration-200 hover:-translate-y-1 hover:shadow-[0_20px_45px_-25px_rgba(7,29,60,.28)] focus-visible:-translate-y-1 sm:p-7 ${isComparison ? "border-navy bg-navy text-white" : "border-navy/10 bg-white text-navy"}`}
      >
        <div className="flex items-start justify-between gap-3">
          <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${isComparison ? "bg-orange text-navy" : `${GROUP_TONES[item.group]} text-navy`}`}>
            <CatalogIcon name={presentation.icon} />
          </span>
          <span className={`pt-1 font-mono text-[.65rem] font-semibold tracking-[.13em] ${isComparison ? "text-white/50" : "text-navy/45"}`} aria-hidden="true">
            {String(index + 1).padStart(2, "0")}
          </span>
        </div>

        <p className={`mt-6 text-[.62rem] font-bold uppercase tracking-[.14em] ${isComparison ? "text-orange" : "text-cobalt"}`}>
          {isComparison ? "Comparateur de scénarios" : item.eyebrow}
        </p>
        <h3 id={headingId} className="mt-3 text-[1.5rem] font-semibold leading-[1.12] tracking-[-.035em]">
          {item.title}
        </h3>
        <p className={`mt-3 text-[.82rem] leading-6 ${isComparison ? "text-white/75" : "text-ink-muted"}`}>
          {item.description}
        </p>

        {isComparison && (
          <div className="mt-5 flex flex-wrap gap-2" aria-label="Statuts comparés">
            {["Micro", "EI au réel", "SASU"].map((label) => (
              <span key={label} className="rounded-full border border-white/20 bg-white/5 px-3 py-1.5 text-[.68rem] font-semibold">{label}</span>
            ))}
          </div>
        )}

        <div className="mt-auto pt-7">
          <div className={`rounded-xl p-4 ${isComparison ? "bg-white/10" : GROUP_TONES[item.group]}`}>
            <p className={`text-[.57rem] font-bold uppercase tracking-[.14em] ${isComparison ? "text-white/60" : "text-navy/60"}`}>À renseigner</p>
            <p className="mt-1.5 text-[.72rem] font-medium leading-5">{presentation.inputs}</p>
            <div className={`my-3 h-px ${isComparison ? "bg-white/15" : "bg-navy/10"}`} />
            <p className={`text-[.57rem] font-bold uppercase tracking-[.14em] ${isComparison ? "text-white/60" : "text-navy/60"}`}>Vous obtenez</p>
            <p className="mt-1.5 text-[.75rem] font-semibold leading-5">{presentation.output}</p>
          </div>
          <div className="mt-5 flex items-center justify-between gap-3">
            <span className="text-[.77rem] font-bold">{presentation.action ?? "Ouvrir le calculateur"}</span>
            <span aria-hidden="true" className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors ${isComparison ? "bg-orange text-navy group-hover:bg-white" : "bg-navy text-white group-hover:bg-orange group-hover:text-navy"}`}>↗</span>
          </div>
        </div>
      </Link>
    </li>
  );
}

export function SimulatorCatalog({ items }: { items: SimulatorCatalogItem[] }) {
  const [group, setGroup] = useState<SimulatorCatalogGroup | "Tous">("Tous");
  const [query, setQuery] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);
  const searchTokens = normalizeSearch(query).split(" ").filter(Boolean);

  const searchableItems = useMemo(() => items.map((item, index) => ({
    item,
    index,
    search: normalizeSearch([
      item.title,
      item.description,
      item.group,
      item.eyebrow,
      ...(item.tags ?? []),
      PRESENTATIONS[item.slug]?.inputs,
      PRESENTATIONS[item.slug]?.output,
    ].filter(Boolean).join(" ")),
  })), [items]);

  const filteredItems = searchableItems.filter(({ item, search }) =>
    (group === "Tous" || item.group === group) && searchTokens.every((token) => search.includes(token)),
  );
  const hasFilters = group !== "Tous" || query.length > 0;

  function resetFilters() {
    setGroup("Tous");
    setQuery("");
    searchRef.current?.focus();
  }

  return (
    <section id="catalogue" aria-labelledby="simulator-catalog-title" className="bg-paper px-5 py-16 sm:px-8 lg:px-14 lg:py-24 xl:px-20">
      <div className="mx-auto max-w-[80rem]">
        <div className="mb-10 grid gap-6 lg:grid-cols-[1fr_.7fr] lg:items-end lg:gap-16">
          <div>
            <p className="sk-eyebrow text-cobalt">La boîte à outils</p>
            <h2 id="simulator-catalog-title" className="mt-4 max-w-[20ch] text-[clamp(2.2rem,4.7vw,4.3rem)] font-semibold leading-[1.04] tracking-[-.045em] text-navy">
              Un besoin précis. Le bon outil pour avancer.
            </h2>
          </div>
          <p className="max-w-xl text-[.96rem] leading-8 text-ink-muted">
            Calculez un montant, comparez des scénarios ou explorez une grille. Chaque carte indique les données à préparer et ce que vous retrouverez dans le résultat.
          </p>
        </div>

        <div className="rounded-[1.6rem] bg-navy p-5 text-white sm:p-7">
          <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
            <div className="max-w-2xl">
              <label htmlFor="simulator-catalog-search" className="mb-3 block text-[.8rem] font-semibold">Quel calcul avez-vous en tête ?</label>
              <div className="relative flex items-center">
                <span className="pointer-events-none absolute left-4 text-ink-muted"><Icon name="search" size={19} /></span>
                <input
                  ref={searchRef}
                  id="simulator-catalog-search"
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Escape") {
                      setQuery("");
                      event.preventDefault();
                    }
                  }}
                  aria-controls="simulator-catalog-results"
                  autoComplete="off"
                  placeholder="TVA, salaire, micro-entreprise…"
                  className="min-h-14 w-full min-w-0 rounded-xl border border-white/20 bg-white py-3 pl-12 pr-12 text-[.86rem] text-navy placeholder:text-ink-muted [&::-webkit-search-cancel-button]:appearance-none"
                />
                {query && (
                  <button type="button" aria-label="Effacer la recherche" className="absolute right-2 flex h-10 w-10 items-center justify-center rounded-full text-navy transition-colors hover:bg-paper" onClick={() => { setQuery(""); searchRef.current?.focus(); }}>
                    <span aria-hidden="true" className="text-2xl leading-none">×</span>
                  </button>
                )}
              </div>
            </div>
            <p className="max-w-[18rem] text-[.77rem] leading-6 text-white/65">Une recherche libre, trois familles pour vous orienter.</p>
          </div>

          <div className="mt-6 flex flex-wrap gap-2 border-t border-white/15 pt-5" role="group" aria-label="Filtrer les outils par famille">
            {(["Tous", ...GROUPS] as const).map((label) => {
              const active = label === group;
              const count = label === "Tous" ? items.length : items.filter((item) => item.group === label).length;
              return (
                <button key={label} type="button" aria-pressed={active} aria-controls="simulator-catalog-results" onClick={() => setGroup(label)} className={`inline-flex min-h-11 items-center gap-2.5 rounded-full border px-4 py-2 text-left text-[.75rem] font-semibold transition-colors ${active ? "border-orange bg-orange text-navy" : "border-white/20 text-white/85 hover:border-white/60 hover:bg-white/10"}`}>
                  {label}
                  <span className={`flex h-5 min-w-5 items-center justify-center rounded-full px-1 font-mono text-[.58rem] ${active ? "bg-navy/10" : "bg-white/10"}`} aria-hidden="true">{count}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex min-h-20 flex-wrap items-center justify-between gap-x-6 gap-y-2 py-5">
          <p id="simulator-catalog-count" role="status" aria-live="polite" aria-atomic="true" className="min-w-0 break-words text-[.78rem] text-ink-muted">
            <span className="font-semibold text-navy">{filteredItems.length} outil{filteredItems.length !== 1 ? "s" : ""}</span>
            {group !== "Tous" ? ` · ${group}` : " à explorer"}
            {query.trim() && <> pour « {query.trim()} »</>}
          </p>
          {hasFilters && <button type="button" onClick={resetFilters} className="rounded text-[.75rem] font-semibold text-cobalt underline decoration-cobalt/30 underline-offset-4 hover:decoration-cobalt">Réinitialiser les filtres</button>}
        </div>

        <div id="simulator-catalog-results" aria-describedby="simulator-catalog-count">
          {filteredItems.length > 0 ? (
            <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {filteredItems.map(({ item, index }) => <ToolCard key={item.slug} item={item} index={index} />)}
            </ul>
          ) : (
            <div className="rounded-[1.6rem] border border-dashed border-navy/20 bg-white px-6 py-14 text-center">
              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-lilac text-cobalt"><Icon name="search" size={24} /></span>
              <h3 className="mt-5 text-2xl font-semibold text-navy">Aucun outil ne correspond à cette recherche.</h3>
              <p className="mx-auto mt-3 max-w-xl text-[.9rem] leading-7 text-ink-muted">Essayez un mot plus court, comme « TVA » ou « salaire », ou affichez à nouveau toutes les familles.</p>
              <button type="button" onClick={resetFilters} className="mt-6 min-h-12 rounded-full bg-navy px-6 text-[.82rem] font-semibold text-white transition-colors hover:bg-cobalt">Afficher les {items.length} outils</button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
