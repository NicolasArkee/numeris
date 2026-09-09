import React from "react";
import type { DirectoryCabinetCard } from "@/libs/db";
import { buildDirectoryAddress, buildDirectoryMapPoint, buildOpenStreetMapDirectionsUrl, directoryDisplayName } from "./profile-v2-helpers";
import { DirectoryInteractiveMap } from "./DirectoryInteractiveMap";

export function DirectoryStaticMap({ card }: { card: DirectoryCabinetCard }) {
  const point = buildDirectoryMapPoint(card);
  const address = buildDirectoryAddress(card);
  const name = directoryDisplayName(card);
  if (!point) return (
    <section className="rounded-[1.5rem] border border-ink/10 bg-paper p-6 sm:p-7">
      <h3 className="font-display text-[1.25rem] font-bold text-ink">Localisation</h3>
      <p className="mt-3 text-[.9rem] leading-7 text-ink-muted">Les coordonnées géographiques ne sont pas disponibles pour cette fiche. L'adresse publique reste affichée lorsqu'elle existe.</p>
      {address && <p className="mt-4 font-display font-bold text-ink">{address}</p>}
    </section>
  );
  return (
    <section className="isolate overflow-hidden rounded-[1.5rem] border border-ink/10 bg-white">
      <div className="relative z-0 h-80 min-h-72 overflow-hidden bg-lilac">
        <DirectoryInteractiveMap name={name} address={address} point={point} />
      </div>
      <div className="relative z-10 flex flex-col justify-between gap-5 bg-mint p-6 sm:flex-row sm:items-center sm:p-7">
        <div className="min-w-0">
          <h3 className="font-display text-[1.15rem] font-bold leading-6 text-ink">{name}</h3>
          {address && <p className="mt-2 text-[.9rem] leading-6 text-ink-muted">{address}</p>}
          <p className="mt-3 max-w-lg text-[.75rem] leading-5 text-ink-muted">Carte interactive OpenStreetMap. Point affiché depuis {point.source === "establishment" ? "les coordonnées de l'établissement" : "les coordonnées de la ville"}.</p>
        </div>
        <a href={buildOpenStreetMapDirectionsUrl(point)} rel="nofollow noopener noreferrer" target="_blank" className="inline-flex w-fit shrink-0 items-center gap-3 rounded-full bg-blue px-5 py-3 text-[.8rem] font-bold text-white transition-colors hover:bg-navy">Itinéraire <span aria-hidden>↗</span></a>
      </div>
    </section>
  );
}
