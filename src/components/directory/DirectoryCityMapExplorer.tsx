import React from "react";
import Link from "next/link";
import type { DirectoryCabinetCard, DirectoryCity } from "@/libs/db";
import { cabinetDirectoryPath } from "./CabinetCard";
import {
  buildDirectoryAddress,
  buildOpenStreetMapDirectionsUrl,
  directoryDisplayName,
  isDirectoryCabinetVerified,
  type DirectoryMapPoint,
} from "./profile-v2-helpers";
import {
  buildDirectoryCityMapPoint,
  type DirectoryCityStats,
} from "./city-v2-helpers";

const numberFormatter = new Intl.NumberFormat("fr-FR");
const MIN_BOUND_SPAN = 0.018;
const BOUND_PADDING_RATIO = 0.22;

type Coordinates = {
  latitude: number;
  longitude: number;
};

type MapBounds = {
  left: number;
  right: number;
  top: number;
  bottom: number;
};

type CabinetMarker = {
  card: DirectoryCabinetCard;
  name: string;
  href: string;
  coordinates: Coordinates;
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function buildCabinetMarkers(cabinets: DirectoryCabinetCard[]): CabinetMarker[] {
  return cabinets.flatMap((card) => {
    const { latitude, longitude } = card.establishment;
    if (latitude == null || longitude == null) return [];

    return [
      {
        card,
        name: directoryDisplayName(card),
        href: cabinetDirectoryPath(card),
        coordinates: { latitude, longitude },
      },
    ];
  });
}

function buildBounds(points: Coordinates[]): MapBounds {
  const latitudes = points.map((point) => point.latitude);
  const longitudes = points.map((point) => point.longitude);
  const minLatitude = Math.min(...latitudes);
  const maxLatitude = Math.max(...latitudes);
  const minLongitude = Math.min(...longitudes);
  const maxLongitude = Math.max(...longitudes);
  const latitudeSpan = Math.max(maxLatitude - minLatitude, MIN_BOUND_SPAN);
  const longitudeSpan = Math.max(maxLongitude - minLongitude, MIN_BOUND_SPAN);
  const latitudePadding = latitudeSpan * BOUND_PADDING_RATIO;
  const longitudePadding = longitudeSpan * BOUND_PADDING_RATIO;
  const latitudeCenter = (minLatitude + maxLatitude) / 2;
  const longitudeCenter = (minLongitude + maxLongitude) / 2;

  return {
    left: longitudeCenter - longitudeSpan / 2 - longitudePadding,
    right: longitudeCenter + longitudeSpan / 2 + longitudePadding,
    top: latitudeCenter + latitudeSpan / 2 + latitudePadding,
    bottom: latitudeCenter - latitudeSpan / 2 - latitudePadding,
  };
}

function buildOpenStreetMapEmbedUrl(bounds: MapBounds, marker: Coordinates): string {
  const params = new URLSearchParams({
    bbox: `${bounds.left},${bounds.bottom},${bounds.right},${bounds.top}`,
    layer: "mapnik",
    marker: `${marker.latitude},${marker.longitude}`,
  });

  return `https://www.openstreetmap.org/export/embed.html?${params.toString()}`;
}

function markerPosition(
  coordinates: Coordinates,
  bounds: MapBounds,
): { left: string; top: string } {
  const left =
    ((coordinates.longitude - bounds.left) / (bounds.right - bounds.left)) * 100;
  const top =
    ((bounds.top - coordinates.latitude) / (bounds.top - bounds.bottom)) * 100;

  return {
    left: `${clamp(left, 4, 96)}%`,
    top: `${clamp(top, 6, 94)}%`,
  };
}

function SidebarStatus({ verified }: { verified: boolean }) {
  return (
    <span
      className={
        verified
          ? "inline-flex w-fit items-center gap-1 rounded-full border border-[#17613b]/15 bg-mint px-2 py-0.5 font-display text-[0.625rem] font-semibold uppercase tracking-wider text-[#17613b]"
          : "inline-flex w-fit items-center gap-1 rounded-full border border-[#8b3d24]/15 bg-apricot px-2 py-0.5 font-display text-[0.625rem] font-semibold uppercase tracking-wider text-[#8b3d24]"
      }
    >
      <span aria-hidden>{verified ? "✓" : "?"}</span>
      {verified ? "Documentée" : "À confirmer"}
    </span>
  );
}

function CabinetSidebar({
  cabinets,
  stats,
}: {
  cabinets: DirectoryCabinetCard[];
  stats: DirectoryCityStats;
}) {
  return (
    <aside
      data-directory-cabinet-sidebar
      className="order-2 min-w-0 border-t border-ink/10 bg-white lg:order-1 lg:border-t-0 lg:border-r"
    >
      <div className="border-b border-ink/10 bg-mint p-6">
        <h2 className="font-display text-[1.25rem] font-bold text-ink">
          Cabinets référencés
        </h2>
        <p className="mt-2 font-mono text-[0.75rem] font-medium text-ink-soft">
          <span className="text-ink">{stats.displayedCount}</span> affiché
          {stats.displayedCount > 1 ? "s" : ""} sur{" "}
          <span className="text-ink">{numberFormatter.format(stats.totalCount)}</span>
        </p>
      </div>
      <div className="max-h-[38rem] overflow-y-auto overscroll-contain p-3">
        {cabinets.map((card, index) => {
          const name = directoryDisplayName(card);
          const address = buildDirectoryAddress(card);
          const verified = isDirectoryCabinetVerified(card);

          return (
            <article key={card.establishment.siret} className="rounded-xl border-b border-ink/10 last:border-b-0">
              <Link
                href={cabinetDirectoryPath(card)}
                className="group grid grid-cols-[2rem_minmax(0,1fr)] gap-3 rounded-xl px-3 py-4 transition-colors hover:bg-lilac focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-blue"
              >
                <span className="mt-1 flex h-7 w-7 items-center justify-center rounded-full bg-navy font-mono text-[0.6875rem] font-semibold text-surface group-hover:bg-accent-500">
                  {index + 1}
                </span>
                <span className="min-w-0">
                  <span className="block break-words font-display text-[0.9375rem] font-semibold text-ink">
                    {name}
                  </span>
                  <span className="mt-1 block text-[0.8125rem] leading-5 text-ink-muted">
                    {address || "Adresse publique non disponible"}
                  </span>
                  <span className="mt-2 flex flex-wrap items-center gap-2">
                    <SidebarStatus verified={verified} />
                    <span className="font-mono text-[0.6875rem] text-ink-soft">
                      SIRET {card.establishment.siret}
                    </span>
                  </span>
                </span>
              </Link>
            </article>
          );
        })}
      </div>
      {stats.hasMoreResults && (
        <p className="border-t border-border-soft bg-bg-muted px-5 py-4 text-[0.8125rem] leading-5 text-ink-muted">
          Cette carte présente les {stats.displayedCount} premières fiches. Utilisez le comparateur ci-dessus pour rechercher parmi les établissements affichés.
        </p>
      )}
    </aside>
  );
}

export function DirectoryCityMapExplorer({
  city,
  cabinets,
  stats,
}: {
  city: DirectoryCity;
  cabinets: DirectoryCabinetCard[];
  stats: DirectoryCityStats;
}) {
  const cityPoint = buildDirectoryCityMapPoint(city);
  const cabinetMarkers = buildCabinetMarkers(cabinets);
  const fallbackPoint = cityPoint ?? cabinetMarkers[0]?.coordinates ?? null;

  if (!fallbackPoint) {
    return (
      <section
        id="liste-cabinets"
        data-directory-city-map-explorer
        className="scroll-mt-32 overflow-hidden rounded-[2rem] border border-ink/10 bg-white"
      >
        <CabinetSidebar cabinets={cabinets} stats={stats} />
      </section>
    );
  }

  const bounds = buildBounds([
    fallbackPoint,
    ...cabinetMarkers.map((marker) => marker.coordinates),
  ]);
  const embedUrl = buildOpenStreetMapEmbedUrl(bounds, fallbackPoint);
  const openMapPoint: DirectoryMapPoint = {
    latitude: fallbackPoint.latitude,
    longitude: fallbackPoint.longitude,
    source: cityPoint ? "city" : "establishment",
  };

  return (
    <section
      id="liste-cabinets"
      data-directory-city-map-explorer
      className="scroll-mt-32 overflow-hidden rounded-[2rem] border border-ink/10 bg-white"
    >
      <div className="grid lg:grid-cols-[minmax(18rem,.8fr)_minmax(0,1.5fr)]">
        <CabinetSidebar cabinets={cabinets} stats={stats} />
        <div
          data-directory-city-map="embed"
          className="order-1 relative min-h-[26rem] overflow-hidden bg-brand-50 lg:order-2 lg:min-h-[40rem]"
        >
          <iframe
            src={embedUrl}
            title={`Carte OpenStreetMap des cabinets comptables à ${city.name}`}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="absolute inset-0 h-full w-full border-0"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(248,246,241,.18),rgba(248,246,241,0)_34%),linear-gradient(90deg,rgba(20,33,61,.16),rgba(20,33,61,0)_38%)]"
          />
          {cabinetMarkers.slice(0, 30).map((marker, index) => {
            const position = markerPosition(marker.coordinates, bounds);

            return (
              <Link
                key={marker.card.establishment.siret}
                href={marker.href}
                title={marker.name}
                aria-label={`Voir la fiche ${marker.name}`}
                className="absolute z-10 flex h-8 w-8 -translate-x-1/2 -translate-y-full items-center justify-center rounded-full border-2 border-surface bg-accent-500 font-mono text-[0.6875rem] font-bold text-surface shadow-lg transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-brand-700 focus:ring-offset-2"
                style={position}
              >
                {index + 1}
              </Link>
            );
          })}
          <div className="absolute bottom-4 left-4 right-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-md rounded-full border border-white/80 bg-surface/95 px-4 py-3 shadow-sm">
              <h2 className="font-display text-[1rem] font-bold text-ink">
                Carte des cabinets à {city.name}
              </h2>
              <p className="mt-1 text-[0.8125rem] leading-5 text-ink-muted">
                Les marqueurs utilisent les coordonnées publiques disponibles.
                Les cabinets sans coordonnées restent accessibles dans la liste.
              </p>
            </div>
            <a
              href={buildOpenStreetMapDirectionsUrl(openMapPoint)}
              rel="nofollow noopener noreferrer"
              target="_blank"
              className="inline-flex w-fit items-center gap-1.5 rounded-full border border-blue bg-surface/95 px-4 py-2.5 font-display text-[0.8125rem] font-semibold text-brand-700 shadow-sm transition-colors hover:bg-brand-50"
            >
              Ouvrir la carte
              <span aria-hidden>↗</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
