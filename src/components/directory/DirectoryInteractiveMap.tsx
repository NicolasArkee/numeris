"use client";

import React, { useEffect, useRef } from "react";
import type { DirectoryMapPoint } from "./profile-v2-helpers";

type DirectoryInteractiveMapProps = {
  name: string;
  address: string;
  point: DirectoryMapPoint;
};

function appendPopupText(container: HTMLElement, text: string, className: string) {
  const element = document.createElement("p");
  element.className = className;
  element.textContent = text;
  container.appendChild(element);
}

export function DirectoryInteractiveMap({
  name,
  address,
  point,
}: DirectoryInteractiveMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<import("leaflet").Map | null>(null);

  useEffect(() => {
    let disposed = false;

    async function mountMap() {
      if (!containerRef.current || mapRef.current) return;

      const leafletModule = await import("leaflet");
      const L = leafletModule.default ?? leafletModule;
      if (disposed || !containerRef.current) return;

      const map = L.map(containerRef.current, {
        scrollWheelZoom: false,
        zoomControl: true,
      }).setView(
        [point.latitude, point.longitude],
        point.source === "establishment" ? 16 : 13,
      );
      const updateMapState = () => {
        if (!containerRef.current) return;
        containerRef.current.dataset.mapReady = "true";
        containerRef.current.dataset.mapZoom = String(map.getZoom());
      };
      updateMapState();
      map.on("zoomend", updateMapState);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map);

      const markerIcon = L.divIcon({
        className: "",
        html:
          '<span class="block h-7 w-7 rounded-full border-[3px] border-white bg-accent-500 shadow-lg ring-4 ring-accent-500/20"></span>',
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      const popup = document.createElement("div");
      const title = document.createElement("strong");
      title.className = "block font-display text-[0.875rem] text-ink";
      title.textContent = name;
      popup.appendChild(title);
      if (address) {
        appendPopupText(
          popup,
          address,
          "mt-1 text-[0.8125rem] leading-5 text-ink-muted",
        );
      }

      L.marker([point.latitude, point.longitude], {
        icon: markerIcon,
        title: name,
      }).addTo(map).bindPopup(popup);

      mapRef.current = map;
      window.setTimeout(() => map.invalidateSize(), 0);
    }

    void mountMap();

    return () => {
      disposed = true;
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [address, name, point.latitude, point.longitude, point.source]);

  return (
    <div
      ref={containerRef}
      data-directory-map="interactive"
      data-map-provider="leaflet"
      data-map-latitude={point.latitude}
      data-map-longitude={point.longitude}
      aria-label={`Carte interactive de ${name}`}
      className="h-full min-h-72 w-full bg-brand-50"
    >
      <div className="flex h-full min-h-72 items-center justify-center px-6 text-center">
        <p className="font-display text-[0.875rem] font-medium text-ink-muted">
          Chargement de la carte interactive
        </p>
      </div>
    </div>
  );
}
