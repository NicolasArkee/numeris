import React from "react";
import type { DirectoryCabinetCard } from "@/libs/db";
import {
  buildDirectoryAddress,
  buildDirectoryMapPoint,
  buildOpenStreetMapDirectionsUrl,
  directoryDisplayName,
} from "./profile-v2-helpers";
import { DirectoryInteractiveMap } from "./DirectoryInteractiveMap";

export function DirectoryStaticMap({ card }: { card: DirectoryCabinetCard }) {
  const point = buildDirectoryMapPoint(card);
  const address = buildDirectoryAddress(card);
  const name = directoryDisplayName(card);

  if (!point) {
    return (
      <section className="rounded-xl border border-border bg-surface p-7">
        <h2 className="font-display text-[1.5rem] font-bold text-ink">
          Localisation
        </h2>
        <p className="mt-3 text-[0.9375rem] leading-7 text-ink-muted">
          Les coordonnées géographiques ne sont pas disponibles pour cette
          fiche. L'adresse publique reste affichée lorsqu'elle existe.
        </p>
        {address && <p className="mt-4 font-display font-medium text-ink">{address}</p>}
      </section>
    );
  }

  return (
    <section className="overflow-hidden rounded-xl border border-border bg-surface">
      <div className="grid min-h-88 lg:grid-cols-[1fr_19rem]">
        <div className="relative min-h-72 overflow-hidden border-b border-border lg:border-b-0 lg:border-r">
          <DirectoryInteractiveMap
            name={name}
            address={address}
            point={point}
          />
        </div>
        <div className="flex flex-col justify-center p-7">
          <h3 className="font-display text-[1.125rem] font-semibold text-ink">
            {name}
          </h3>
          {address && (
            <p className="mt-3 text-[0.9375rem] leading-6 text-ink-muted">
              {address}
            </p>
          )}
          <p className="mt-3 text-[0.8125rem] leading-5 text-ink-soft">
            Carte interactive OpenStreetMap. Point affiché depuis{" "}
            {point.source === "establishment"
              ? "les coordonnées de l'établissement"
              : "les coordonnées de la ville"}.
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
