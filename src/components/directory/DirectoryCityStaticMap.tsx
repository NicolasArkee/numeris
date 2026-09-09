import React from "react";
import type { DirectoryCity } from "@/libs/db";
import { buildOpenStreetMapDirectionsUrl } from "./profile-v2-helpers";
import { buildDirectoryCityMapPoint } from "./city-v2-helpers";
import { DirectoryInteractiveMap } from "./DirectoryInteractiveMap";

export function DirectoryCityStaticMap({ city, totalCount }: { city: DirectoryCity; totalCount: number }) {
  const point = buildDirectoryCityMapPoint(city);
  if (!point) return <section className="rounded-[1.75rem] bg-lilac p-7"><h2 className="font-display text-[1.5rem] font-bold text-ink">Carte des cabinets à {city.name}</h2><p className="mt-3 text-[.9rem] leading-7 text-ink-muted">Les coordonnées de référence de cette ville ne sont pas disponibles. La liste des cabinets reste consultable à partir des adresses publiques lorsqu'elles existent.</p></section>;
  return <section className="isolate overflow-hidden rounded-[1.75rem] border border-ink/10 bg-white">
    <div className="relative z-0 h-80" data-directory-city-map="interactive"><DirectoryInteractiveMap name={city.name} address="Centre de la ville" point={point} /></div>
    <div className="flex flex-col justify-between gap-5 bg-mint p-7 sm:flex-row sm:items-center">
      <div><h2 className="font-display text-[1.5rem] font-bold text-ink">Carte des cabinets à {city.name}</h2><p className="mt-3 max-w-xl text-[.9rem] leading-7 text-ink-muted">{totalCount.toLocaleString("fr-FR")} cabinet{totalCount > 1 ? "s" : ""} comptable{totalCount > 1 ? "s" : ""} référencé{totalCount > 1 ? "s" : ""} dans le comparateur Skoria pour cette ville.</p><p className="mt-2 max-w-xl text-[.78rem] leading-6 text-ink-muted">Le point affiché correspond au centre de la ville. Les fiches cabinet affichent leur propre adresse publique lorsqu'elle existe.</p></div>
      <a href={buildOpenStreetMapDirectionsUrl(point)} rel="nofollow noopener noreferrer" target="_blank" className="inline-flex w-fit shrink-0 items-center gap-3 rounded-full bg-blue px-5 py-3 text-[.8rem] font-bold text-white hover:bg-navy">Ouvrir la carte <span aria-hidden>↗</span></a>
    </div>
  </section>;
}
