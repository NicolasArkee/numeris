import React from "react";
import type { DirectoryCity } from "@/libs/db";
import { buildOpenStreetMapDirectionsUrl } from "./profile-v2-helpers";
import { buildDirectoryCityMapPoint } from "./city-v2-helpers";

const numberFormatter = new Intl.NumberFormat("fr-FR");

export function DirectoryCityStaticMap({
  city,
  totalCount,
}: {
  city: DirectoryCity;
  totalCount: number;
}) {
  const point = buildDirectoryCityMapPoint(city);

  if (!point) {
    return (
      <section className="rounded-xl border border-border bg-surface p-7">
        <h2 className="font-display text-[1.5rem] font-bold text-ink">
          Carte des cabinets à {city.name}
        </h2>
        <p className="mt-3 text-[0.9375rem] leading-7 text-ink-muted">
          Les coordonnées de référence de cette ville ne sont pas disponibles.
          La liste des cabinets reste consultable à partir des adresses
          publiques lorsqu'elles existent.
        </p>
      </section>
    );
  }

  return (
    <section className="overflow-hidden rounded-xl border border-border bg-surface">
      <div className="grid min-h-88 lg:grid-cols-[1fr_20rem]">
        <div
          data-directory-city-map="static"
          aria-label={`Carte statique des cabinets comptables à ${city.name}`}
          className="relative min-h-72 overflow-hidden border-b border-border bg-brand-50 lg:border-b-0 lg:border-r"
        >
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,.7)_1px,transparent_1px),linear-gradient(0deg,rgba(255,255,255,.7)_1px,transparent_1px)] bg-[size:76px_54px]" />
          <span className="absolute -left-2 top-[22%] h-[3px] w-[118%] rotate-[8deg] bg-surface/90" />
          <span className="absolute -left-1 top-[55%] h-[3px] w-[116%] -rotate-[4deg] bg-surface/90" />
          <span className="absolute left-[18%] -top-3 h-[126%] w-[3px] rotate-[10deg] bg-surface/90" />
          <span className="absolute left-[50%] -top-3 h-[124%] w-[3px] -rotate-[7deg] bg-surface/90" />
          <span className="absolute left-[76%] -top-3 h-[122%] w-[3px] rotate-[5deg] bg-surface/90" />
          <span className="absolute left-[10%] top-[38%] h-14 w-24 rounded border border-brand-100 bg-brand-50" />
          <span className="absolute right-[12%] top-[18%] h-16 w-28 rounded border border-brand-100 bg-brand-50" />
          <span className="absolute bottom-[16%] left-[36%] h-16 w-28 rounded border border-brand-100 bg-brand-50" />
          <span className="absolute left-[50%] top-[45%] h-14 w-14 -translate-x-1/2 -translate-y-1/2 rotate-45 bg-accent-500 shadow-md" />
          <span className="absolute left-[50%] top-[45%] h-6 w-6 -translate-x-1/2 -translate-y-1/2 rotate-45 rounded-full bg-surface" />
          <span className="absolute left-[53%] top-[35%] rounded-md bg-surface/90 px-2 py-1 font-display text-[0.6875rem] font-medium text-ink shadow-sm">
            {city.name}
          </span>
          <span className="absolute bottom-3 left-4 rounded-md bg-surface/90 px-2 py-1 font-mono text-[0.6875rem] text-ink-muted shadow-sm">
            Carte statique · centre ville
          </span>
        </div>
        <div className="flex flex-col justify-center p-7">
          <h3 className="font-display text-[1.125rem] font-semibold text-ink">
            {city.name}
          </h3>
          <p className="mt-3 text-[0.9375rem] leading-6 text-ink-muted">
            <span className="font-mono font-semibold text-ink">
              {numberFormatter.format(totalCount)}
            </span>{" "}
            cabinet{totalCount > 1 ? "s" : ""} comptable
            {totalCount > 1 ? "s" : ""} référencé
            {totalCount > 1 ? "s" : ""} dans le comparateur Skoria pour cette
            ville.
          </p>
          <p className="mt-3 text-[0.8125rem] leading-5 text-ink-soft">
            Le point affiché correspond aux coordonnées de référence de la
            ville. Les fiches cabinet affichent leur propre adresse publique
            lorsqu'elle existe.
          </p>
          <a
            href={buildOpenStreetMapDirectionsUrl(point)}
            rel="nofollow noopener noreferrer"
            target="_blank"
            className="mt-5 inline-flex w-fit items-center gap-1.5 rounded-md border border-brand-700 px-5 py-2.5 font-display text-[0.8125rem] font-semibold text-brand-700 transition-colors hover:bg-brand-50"
          >
            Itinéraire
            <span aria-hidden>↗</span>
          </a>
        </div>
      </div>
    </section>
  );
}
