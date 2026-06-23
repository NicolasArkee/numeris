import React from "react";
import Link from "next/link";
import type { DirectoryCabinetCard } from "@/libs/db";
import { cabinetDirectoryPath } from "./CabinetCard";
import {
  buildDirectoryAddress,
  directoryDisplayName,
  isDirectoryCabinetVerified,
} from "./profile-v2-helpers";
import type { DirectoryCityStats } from "./city-v2-helpers";

const numberFormatter = new Intl.NumberFormat("fr-FR");

function StatusLabel({ verified }: { verified: boolean }) {
  return (
    <span
      className={
        verified
          ? "inline-flex w-fit items-center gap-1 rounded-md border border-success-500/30 bg-success-50 px-2.5 py-1 font-display text-[0.6875rem] font-semibold uppercase tracking-wider text-success-700"
          : "inline-flex w-fit items-center gap-1 rounded-md border border-warning-500/30 bg-warning-50 px-2.5 py-1 font-display text-[0.6875rem] font-semibold uppercase tracking-wider text-warning-700"
      }
    >
      <span aria-hidden>{verified ? "✓" : "?"}</span>
      {verified ? "Fiche documentée" : "À confirmer"}
    </span>
  );
}

export function DirectoryCityCabinetList({
  cabinets,
  stats,
}: {
  cabinets: DirectoryCabinetCard[];
  stats: DirectoryCityStats;
}) {
  if (cabinets.length === 0) return null;

  return (
    <section id="liste-cabinets">
      <div className="mb-5 flex flex-col justify-between gap-3 md:flex-row md:items-end">
        <div>
          <h2 className="font-display text-[1.5rem] font-bold text-ink">
            Cabinets comptables candidats et vérifiés
          </h2>
          <p className="mt-2 max-w-2xl text-[0.9375rem] leading-6 text-ink-muted">
            Les fiches sont triées en priorisant les données documentées,
            puis les données administratives les plus fiables.
          </p>
        </div>
        <p className="font-mono text-[0.8125rem] font-medium text-ink-soft">
          <span className="text-ink">{stats.displayedCount}</span> affiché
          {stats.displayedCount > 1 ? "s" : ""} sur{" "}
          <span className="text-ink">{numberFormatter.format(stats.totalCount)}</span>
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
        <div className="divide-y divide-border-soft">
          {cabinets.map((card) => {
            const name = directoryDisplayName(card);
            const verified = isDirectoryCabinetVerified(card);
            const address = buildDirectoryAddress(card);

            return (
              <article
                key={card.establishment.siret}
                className="grid gap-4 px-5 py-5 transition-colors hover:bg-brand-50 lg:grid-cols-[minmax(0,1.2fr)_minmax(15rem,0.8fr)_9rem_7rem] lg:items-center"
              >
                <div>
                  <h3 className="font-display text-[1.0625rem] font-semibold text-ink">
                    {name}
                  </h3>
                  <p className="mt-1 font-mono text-[0.75rem] text-ink-soft">
                    SIRET {card.establishment.siret}
                  </p>
                </div>
                <p className="text-[0.875rem] leading-6 text-ink-muted">
                  {address || "Adresse publique non disponible"}
                </p>
                <StatusLabel verified={verified} />
                <Link
                  href={cabinetDirectoryPath(card)}
                  className="inline-flex w-fit items-center gap-1.5 font-display text-[0.875rem] font-semibold text-brand-700 transition-colors hover:text-brand-500"
                >
                  Fiche
                  <span aria-hidden>→</span>
                </Link>
              </article>
            );
          })}
        </div>
      </div>

      {stats.hasMoreResults && (
        <p className="mt-4 text-[0.875rem] leading-6 text-ink-muted">
          Les résultats affichés sont limités pour garder la page lisible. Les
          fiches restantes restent disponibles dans l'annuaire technique et
          pourront être exposées via pagination.
        </p>
      )}
    </section>
  );
}
