// ─── VillesStrip ───
// Navigation visuelle vers les pages villes. Les douze villes prioritaires
// disposent d'une maquette générée pour la V2 ; les autres gardent le visuel
// générique du hub géographique.

import Image from "next/image";
import Link from "next/link";
import type { Ville } from "@/libs/db";

interface VillesStripProps {
  title: string;
  villes: Ville[];
}

const CITY_IMAGES: Record<string, string> = {
  paris: "/images/skoria-v2/cities/paris.webp",
  marseille: "/images/skoria-v2/cities/marseille.webp",
  lyon: "/images/skoria-v2/cities/lyon.webp",
  toulouse: "/images/skoria-v2/cities/toulouse.webp",
  nice: "/images/skoria-v2/cities/nice.webp",
  nantes: "/images/skoria-v2/cities/nantes.webp",
  montpellier: "/images/skoria-v2/cities/montpellier.webp",
  strasbourg: "/images/skoria-v2/cities/strasbourg.webp",
  bordeaux: "/images/skoria-v2/cities/bordeaux.webp",
  lille: "/images/skoria-v2/cities/lille.webp",
  rennes: "/images/skoria-v2/cities/rennes.webp",
  reims: "/images/skoria-v2/cities/reims.webp",
};

const CITY_LAYOUT = [
  "md:col-span-2 md:row-span-2 lg:col-span-2",
  "",
  "",
  "",
  "",
  "md:col-span-2 lg:col-span-2",
  "",
  "",
  "",
  "",
  "",
  "",
] as const;

export function VillesStrip({ title, villes }: VillesStripProps) {
  if (villes.length === 0) return null;

  return (
    <section aria-labelledby="city-strip-title" className="mb-10 overflow-hidden rounded-[1.75rem] bg-lilac p-5 sm:p-8 lg:p-10">
      <div className="mb-8 grid gap-5 lg:grid-cols-[1fr_.55fr] lg:items-end">
        <div>
          <p className="text-[.64rem] font-bold uppercase tracking-[.2em] text-blue">Explorer le territoire</p>
          <h2 id="city-strip-title" className="mt-4 max-w-4xl text-balance text-[clamp(2.1rem,4.2vw,3.8rem)] font-semibold leading-[1.02] text-navy">
            {title}
          </h2>
        </div>
        <div className="lg:justify-self-end">
          <p className="max-w-xl text-[.84rem] leading-7 text-ink-muted">
            Comparez les cabinets disponibles autour de votre activité, puis confrontez leur connaissance du secteur et leur mode de collaboration.
          </p>
          <Link href="/villes" className="mt-4 inline-flex items-center gap-2 text-[.74rem] font-bold text-blue hover:underline">
            Voir toutes les villes <span aria-hidden>↗</span>
          </Link>
        </div>
      </div>

      <div className="grid auto-rows-[15rem] grid-flow-row-dense gap-3 md:grid-cols-2 md:auto-rows-[13rem] lg:grid-cols-4">
        {villes.map((ville, index) => {
          const location = [ville.departement, ville.region].filter(Boolean).join(" · ");
          return (
            <Link
              key={ville.slug}
              href={`/villes/${ville.slug}`}
              aria-label={`Explorer les experts-comptables à ${ville.name}`}
              className={`group relative isolate h-full overflow-hidden rounded-[1.25rem] bg-navy text-white ${CITY_LAYOUT[index % CITY_LAYOUT.length]}`}
            >
              <Image
                src={CITY_IMAGES[ville.slug] ?? "/images/skoria-v2/editorial/cityscape.webp"}
                alt={`Interprétation architecturale de ${ville.name}`}
                fill
                sizes={index === 0 || index === 5 ? "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 46vw" : "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 24vw"}
                className="object-cover transition duration-700 group-hover:scale-[1.045]"
              />
              <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-navy via-navy/10 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-5 sm:p-6">
                <div>
                  <p className="text-[.63rem] font-bold uppercase tracking-[.17em] text-white/62">Expert-comptable</p>
                  <h3 className="mt-1 text-[1.55rem] font-semibold leading-none">{ville.name}</h3>
                  {location && <p className="mt-2 text-[.68rem] text-white/65">{location}</p>}
                </div>
                <span aria-hidden className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange text-navy transition-transform group-hover:rotate-45">↗</span>
              </div>
            </Link>
          );
        })}
      </div>

      <p className="mt-4 text-[.64rem] leading-5 text-ink-muted">
        Illustrations architecturales générées par IA. Elles évoquent les villes sans représenter une vue exacte.
      </p>
    </section>
  );
}
