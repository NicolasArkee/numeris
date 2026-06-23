import React from "react";
import type { DirectoryCabinetCard } from "@/libs/db";
import {
  buildDirectoryAddress,
  buildDirectoryMapPoint,
  buildOpenStreetMapDirectionsUrl,
  directoryDisplayName,
} from "./profile-v2-helpers";

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
        <div
          data-directory-map="static"
          aria-label={`Carte statique de ${name}`}
          className="relative min-h-72 overflow-hidden border-b border-border bg-brand-50 lg:border-b-0 lg:border-r"
        >
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,.72)_1px,transparent_1px),linear-gradient(0deg,rgba(255,255,255,.72)_1px,transparent_1px)] bg-[size:82px_58px]" />
          <span className="absolute -left-2 top-[24%] h-[3px] w-[115%] rotate-[7deg] bg-surface/90" />
          <span className="absolute -left-1 top-[62%] h-[3px] w-[116%] -rotate-[5deg] bg-surface/90" />
          <span className="absolute left-[18%] -top-2 h-[120%] w-[3px] rotate-[11deg] bg-surface/90" />
          <span className="absolute left-[55%] -top-3 h-[125%] w-[3px] -rotate-[9deg] bg-surface/90" />
          <span className="absolute left-[77%] -top-2 h-[120%] w-[3px] rotate-[5deg] bg-surface/90" />
          <span className="absolute left-[9%] top-[42%] h-12 w-20 rounded border border-brand-100 bg-brand-50" />
          <span className="absolute right-[10%] top-[18%] h-16 w-24 rounded border border-brand-100 bg-brand-50" />
          <span className="absolute bottom-[15%] left-[35%] h-14 w-24 rounded border border-brand-100 bg-brand-50" />
          <span className="absolute left-[47%] top-[43%] h-12 w-12 -translate-x-1/2 -translate-y-1/2 rotate-45 bg-accent-500 shadow-md" />
          <span className="absolute left-[47%] top-[43%] h-5 w-5 -translate-x-1/2 -translate-y-1/2 rotate-45 rounded-full bg-surface" />
          <span className="absolute left-[50%] top-[35%] rounded-md bg-surface/90 px-2 py-1 font-display text-[0.6875rem] font-medium text-ink shadow-sm">
            {card.establishment.city_name ?? card.city?.name}
          </span>
          <span className="absolute bottom-3 left-4 rounded-md bg-surface/90 px-2 py-1 font-mono text-[0.6875rem] text-ink-muted shadow-sm">
            Carte statique · ouvrir l'itinéraire pour le détail
          </span>
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
            Point affiché depuis{" "}
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
