import React from "react";
import Link from "next/link";
import type { DirectoryCabinetCard } from "@/libs/db";
import {
  buildDirectoryAddress,
  directoryDisplayName,
  isDirectoryCabinetVerified,
} from "./profile-v2-helpers";
import { cabinetDirectoryPath } from "./CabinetCard";

export function DirectoryRelatedCabinets({
  cityName,
  citySlug,
  cabinets,
}: {
  cityName: string;
  citySlug: string;
  cabinets: DirectoryCabinetCard[];
}) {
  if (cabinets.length === 0) return null;

  return (
    <section>
      <h2 className="font-display text-[1.5rem] font-bold text-ink">
        Autres cabinets comptables à {cityName}
      </h2>
      <div className="mt-5 grid gap-5 md:grid-cols-3">
        {cabinets.map((card) => {
          const verified = isDirectoryCabinetVerified(card);
          const name = directoryDisplayName(card);
          return (
            <Link
              key={card.establishment.siret}
              href={cabinetDirectoryPath(card)}
              className="group flex min-h-88 flex-col overflow-hidden rounded-lg border border-border bg-surface shadow-sm transition-all hover:-translate-y-0.5 hover:border-brand-500 hover:shadow-md"
              aria-label={`Voir la fiche de ${name}`}
            >
              <div className="relative aspect-[16/9] overflow-hidden border-b border-border-soft bg-bg-muted">
                {card.sourcePreviewImageUrl ? (
                  <img
                    src={card.sourcePreviewImageUrl}
                    alt={`Aperçu du site de ${name}`}
                    className="h-full w-full object-cover object-top transition-transform duration-300 group-hover:scale-[1.02]"
                    loading="lazy"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-brand-ink px-6 text-center">
                    <span className="font-display text-[0.75rem] font-semibold uppercase tracking-[0.12em] text-white/70">
                      Aperçu à enrichir
                    </span>
                  </div>
                )}
              </div>
              <div className="flex flex-1 flex-col p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <h3 className="font-display text-[1rem] font-semibold leading-snug text-ink transition-colors group-hover:text-brand-700">
                    {name}
                  </h3>
                  <span
                    className={
                      verified
                        ? "shrink-0 rounded-full border border-success-500/30 bg-success-50 px-2.5 py-1 font-display text-[0.6875rem] font-semibold text-success-700"
                        : "shrink-0 rounded-full border border-warning-500/30 bg-warning-50 px-2.5 py-1 font-display text-[0.6875rem] font-semibold text-warning-700"
                    }
                  >
                    {verified ? "Documentée" : "À confirmer"}
                  </span>
                </div>
                <p className="mt-3 line-clamp-2 text-[0.875rem] leading-6 text-ink-muted">
                  {buildDirectoryAddress(card)}
                </p>
                <div className="mt-auto pt-5 font-display text-[0.875rem] font-semibold text-brand-700">
                  Voir la fiche
                  <span
                    aria-hidden
                    className="ml-1 inline-block transition-transform group-hover:translate-x-1"
                  >
                    →
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
      <Link
        href={`/expert-comptable/${citySlug}`}
        prefetch={false}
        className="mt-5 inline-flex items-center gap-2 font-display text-[0.9375rem] font-semibold text-brand-700 transition-colors hover:text-brand-500"
      >
        Voir plus de cabinets à {cityName}
        <span aria-hidden>→</span>
      </Link>
    </section>
  );
}
