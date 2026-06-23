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
      <div className="mt-5 overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
        <div className="grid grid-cols-[1.2fr_1.4fr_0.9fr_2rem] border-b border-border bg-bg-muted px-5 py-3 font-display text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-ink-muted max-md:hidden">
          <span>Nom du cabinet</span>
          <span>Adresse</span>
          <span>Statut</span>
          <span />
        </div>
        <div className="divide-y divide-border-soft">
          {cabinets.map((card) => {
            const verified = isDirectoryCabinetVerified(card);
            return (
              <Link
                key={card.establishment.siret}
                href={cabinetDirectoryPath(card)}
                className="grid gap-2 px-5 py-4 text-[0.9375rem] transition-colors hover:bg-brand-50 md:grid-cols-[1.2fr_1.4fr_0.9fr_2rem] md:items-center"
              >
                <span className="font-display font-semibold text-ink">
                  {directoryDisplayName(card)}
                </span>
                <span className="text-ink-muted">{buildDirectoryAddress(card)}</span>
                <span className={verified ? "font-display text-[0.8125rem] font-semibold text-success-700" : "font-display text-[0.8125rem] font-semibold text-warning-700"}>
                  {verified ? "Fiche documentée" : "À confirmer"}
                </span>
                <span aria-hidden className="text-right text-brand-700">→</span>
              </Link>
            );
          })}
        </div>
      </div>
      <Link
        href={`/expert-comptable/${citySlug}`}
        className="mt-5 inline-flex items-center gap-2 font-display text-[0.9375rem] font-semibold text-brand-700 transition-colors hover:text-brand-500"
      >
        Voir plus de cabinets à {cityName}
        <span aria-hidden>→</span>
      </Link>
    </section>
  );
}
