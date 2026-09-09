"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

export type DirectoryComparisonCandidate = {
  siret: string;
  name: string;
  address: string;
  href: string;
  verified: boolean;
  confidence: number;
};

const STORAGE_KEY = "skoria:directory-selection:v2";

function normalize(value: string): string {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

export function DirectoryComparePanel({
  cityName,
  candidates,
}: {
  cityName: string;
  candidates: DirectoryComparisonCandidate[];
}) {
  const [query, setQuery] = useState("");
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [selection, setSelection] = useState<DirectoryComparisonCandidate[]>([]);
  const [showComparison, setShowComparison] = useState(false);

  useEffect(() => {
    const currentBySiret = new Map(candidates.map((candidate) => [candidate.siret, candidate]));
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      const stored = raw ? JSON.parse(raw) : [];
      if (Array.isArray(stored)) {
        const restored = stored
          .filter((item): item is DirectoryComparisonCandidate => item && typeof item.siret === "string")
          .map((item) => currentBySiret.get(item.siret))
          .filter((item): item is DirectoryComparisonCandidate => Boolean(item))
          .slice(0, 3);
        setSelection(restored);
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(restored));
      }
    } catch {
      try {
        window.localStorage.removeItem(STORAGE_KEY);
      } catch {
        // Le comparateur reste utilisable sans stockage local.
      }
    }
  }, [candidates]);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(selection));
    } catch {
      // La sélection reste disponible pendant la session si le stockage est bloqué.
    }
  }, [selection]);

  const filtered = useMemo(() => {
    const needle = normalize(query.trim());
    return candidates.filter((candidate) => {
      if (verifiedOnly && !candidate.verified) return false;
      return !needle || normalize(`${candidate.name} ${candidate.address} ${candidate.siret}`).includes(needle);
    });
  }, [candidates, query, verifiedOnly]);

  const toggle = (candidate: DirectoryComparisonCandidate) => {
    setSelection((current) => {
      if (current.some((item) => item.siret === candidate.siret)) {
        return current.filter((item) => item.siret !== candidate.siret);
      }
      if (current.length >= 3) return current;
      return [...current, candidate];
    });
  };

  const exportSelection = () => {
    const header = ["Cabinet", "Adresse", "SIRET", "Statut", "Fiche Skoria"];
    const rows = selection.map((item) => [
      item.name,
      item.address,
      item.siret,
      item.verified ? "Documentée" : "À confirmer",
      `${window.location.origin}${item.href}`,
    ]);
    const csv = [header, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(";"))
      .join("\n");
    const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `selection-cabinets-${normalize(cityName).replace(/[^a-z0-9]+/g, "-")}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section className="overflow-hidden rounded-[2rem] border border-ink/12 bg-white shadow-[0_24px_80px_rgba(16,34,59,.08)]" aria-labelledby="compare-title">
      <div className="grid gap-6 bg-lilac p-6 lg:grid-cols-[.78fr_1.22fr] lg:items-end lg:p-8">
        <div>
          <p className="text-[.64rem] font-bold uppercase tracking-[.18em] text-blue">Sélection locale</p>
          <h2 id="compare-title" className="scroll-mt-32 mt-3 text-[clamp(1.9rem,4vw,3rem)] font-bold leading-tight text-ink">
            Comparez jusqu’à trois établissements.
          </h2>
        </div>
        <p className="text-[.88rem] leading-7 text-ink-muted">
          Cette sélection conserve uniquement les repères publics de la fiche. Les compétences, la disponibilité, le périmètre et les honoraires restent à confirmer directement.
        </p>
      </div>

      <div className="grid gap-4 border-b border-ink/10 p-5 sm:grid-cols-[1fr_auto] sm:items-center lg:p-6">
        <label className="flex min-h-12 min-w-0 items-center gap-3 rounded-full border border-ink/16 bg-paper px-5 focus-within:border-blue focus-within:ring-4 focus-within:ring-blue/10">
          <span aria-hidden className="font-serif text-2xl text-blue">⌕</span>
          <span className="sr-only">Rechercher un cabinet</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={`Rechercher à ${cityName}…`}
            className="min-w-0 w-full bg-transparent text-[.88rem] text-ink outline-none placeholder:text-ink-soft"
          />
        </label>
        <label className="flex cursor-pointer items-center gap-2 text-[.76rem] font-bold text-ink-muted">
          <input type="checkbox" checked={verifiedOnly} onChange={(event) => setVerifiedOnly(event.target.checked)} className="h-4 w-4 accent-blue" />
          Fiches documentées seulement
        </label>
      </div>

      <div className="max-h-[31rem] divide-y divide-ink/10 overflow-y-auto">
        {filtered.map((candidate) => {
          const selected = selection.some((item) => item.siret === candidate.siret);
          const limitReached = selection.length >= 3 && !selected;
          return (
            <article key={candidate.siret} className={`grid gap-4 p-5 sm:grid-cols-[1fr_auto] sm:items-center lg:px-6 ${selected ? "bg-mint" : "bg-white hover:bg-paper"}`}>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="break-words font-bold text-ink">{candidate.name}</h3>
                  <span className={`rounded-full px-2.5 py-1 text-[.6rem] font-bold uppercase tracking-[.1em] ${candidate.verified ? "bg-mint text-[#17613b]" : "bg-apricot text-[#8b3d24]"}`}>
                    {candidate.verified ? "Documentée" : "À confirmer"}
                  </span>
                </div>
                <p className="mt-2 text-[.8rem] leading-5 text-ink-muted">{candidate.address || "Adresse publique non disponible"}</p>
                <p className="mt-1 text-[.66rem] text-ink-soft">SIRET {candidate.siret}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Link href={candidate.href} className="rounded-full border border-ink/18 px-4 py-2 text-[.7rem] font-bold text-ink hover:border-blue hover:text-blue">Voir la fiche</Link>
                <button
                  type="button"
                  disabled={limitReached}
                  aria-pressed={selected}
                  onClick={() => toggle(candidate)}
                  title={limitReached ? "Retirez un cabinet avant d’en ajouter un autre" : undefined}
                  className={`rounded-full px-4 py-2 text-[.7rem] font-bold ${selected ? "bg-ink text-white" : "bg-blue text-white disabled:cursor-not-allowed disabled:bg-ink/20"}`}
                >
                  {selected ? "Retirer" : "Ajouter"}
                </button>
              </div>
            </article>
          );
        })}
        {filtered.length === 0 && <p className="p-8 text-[.86rem] text-ink-muted">Aucun établissement ne correspond à ce filtre.</p>}
      </div>

      <div className="flex flex-col gap-4 bg-navy p-5 text-white sm:flex-row sm:items-center sm:justify-between lg:px-6">
        <p className="text-[.78rem] text-white/70" aria-live="polite">
          <strong className="text-white">{selection.length}/3</strong> cabinet{selection.length > 1 ? "s" : ""} dans votre sélection
        </p>
        <div className="flex flex-wrap gap-2">
          {selection.length > 0 && <button type="button" onClick={() => setSelection([])} className="rounded-full border border-white/25 px-4 py-2 text-[.7rem] font-bold">Effacer</button>}
          <button type="button" disabled={selection.length < 2} onClick={() => setShowComparison((value) => !value)} className="rounded-full bg-orange px-4 py-2 text-[.7rem] font-bold text-navy disabled:cursor-not-allowed disabled:opacity-45">
            {showComparison ? "Fermer" : "Comparer"}
          </button>
          <button type="button" disabled={selection.length === 0} onClick={exportSelection} className="rounded-full border border-white/25 px-4 py-2 text-[.7rem] font-bold disabled:cursor-not-allowed disabled:opacity-45">Exporter CSV</button>
        </div>
      </div>

      {showComparison && selection.length >= 2 && (
        <div className="overflow-x-auto p-5 lg:p-6">
          <table className="w-full min-w-[42rem] border-collapse text-left text-[.8rem]">
            <caption className="sr-only">Comparaison de la sélection de cabinets</caption>
            <thead>
              <tr>
                <th className="border-b border-ink/15 p-3 text-ink-muted">Critère public</th>
                {selection.map((item) => <th key={item.siret} className="border-b border-ink/15 p-3 text-ink">{item.name}</th>)}
              </tr>
            </thead>
            <tbody>
              {[
                ["Statut", ...selection.map((item) => item.verified ? "Fiche documentée" : "À confirmer")],
                ["Adresse", ...selection.map((item) => item.address || "Non disponible")],
                ["SIRET", ...selection.map((item) => item.siret)],
                ["À demander", ...selection.map(() => "Mission · outils · disponibilité · honoraires")],
              ].map((row) => (
                <tr key={row[0]}>
                  {row.map((cell, index) => <td key={`${row[0]}-${index}`} className={`border-b border-ink/10 p-3 align-top leading-6 ${index === 0 ? "font-bold text-ink" : "text-ink-muted"}`}>{cell}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
