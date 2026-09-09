// ─── ServicesGrid ───
// Maillage contextualisé vers les pages expertises. La composition en bento
// donne à chaque mission un vrai rôle de prochaine étape dans le parcours.

import Link from "next/link";
import type { Service } from "@/libs/db";
import { Icon } from "./Icon";

interface ServicesGridProps {
  title: string;
  services: Service[];
  hrefBuilder: (svc: Service) => string;
  /** Titre de carte contextualisé (ex: "Comptabilité à Paris"). Défaut : svc.title. */
  cardTitleBuilder?: (svc: Service) => string;
}

const CARD_LAYOUT = [
  "lg:col-span-7 lg:min-h-[19rem]",
  "lg:col-span-5 lg:min-h-[19rem]",
  "lg:col-span-4 lg:min-h-[17rem]",
  "lg:col-span-4 lg:min-h-[17rem]",
  "lg:col-span-4 lg:min-h-[17rem]",
  "lg:col-span-12 lg:min-h-[15rem]",
] as const;

const CARD_TONES = [
  "bg-white text-navy",
  "bg-mint text-navy",
  "bg-apricot text-navy",
  "bg-lilac text-navy",
  "bg-white text-navy",
  "bg-orange text-navy",
] as const;

export function ServicesGrid({ title, services, hrefBuilder, cardTitleBuilder }: ServicesGridProps) {
  if (services.length === 0) return null;

  return (
    <section
      aria-labelledby="services-grid-title"
      className="mb-10 overflow-hidden rounded-[1.75rem] bg-navy px-5 py-8 text-white sm:px-8 sm:py-10 lg:px-10 lg:py-12"
    >
      <div className="mb-9 grid gap-6 lg:grid-cols-[1fr_.55fr] lg:items-end">
        <div>
          <p className="text-[.64rem] font-bold uppercase tracking-[.2em] text-[#ffb293]">
            Choisir le bon périmètre
          </p>
          <h2
            id="services-grid-title"
            className="mt-4 max-w-4xl text-balance text-[clamp(2.15rem,4.4vw,4rem)] font-semibold leading-[1.02] tracking-[-.04em]"
          >
            {title}
          </h2>
        </div>
        <p className="max-w-xl text-[.86rem] leading-7 text-white/68 lg:justify-self-end">
          Ouvrez une mission pour vérifier les tâches, les livrables, le rythme des échanges et les responsabilités à cadrer avec le cabinet.
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-12">
        {services.map((svc, index) => {
          const title_ = cardTitleBuilder ? cardTitleBuilder(svc) : svc.title;
          return (
            <Link
              key={svc.slug}
              href={hrefBuilder(svc)}
              aria-label={`Comparer la mission ${title_}`}
              className={`group relative flex min-h-[16rem] flex-col overflow-hidden rounded-[1.3rem] p-6 transition-transform duration-300 hover:-translate-y-1 focus-visible:-translate-y-1 sm:p-7 ${CARD_LAYOUT[index % CARD_LAYOUT.length]} ${CARD_TONES[index % CARD_TONES.length]}`}
            >
              <div
                aria-hidden
                className="absolute -right-12 -top-12 h-40 w-40 rounded-full border border-current/10 transition-transform duration-500 group-hover:scale-125"
              />
              <div className="relative flex items-start justify-between gap-4">
                <span className="flex h-12 w-12 items-center justify-center rounded-full border border-current/15 bg-white/55 text-blue backdrop-blur-sm">
                  <Icon name={svc.slug} size={22} />
                </span>
                <span className="font-mono text-[.68rem] font-bold tracking-[.16em] opacity-45">
                  {String(index + 1).padStart(2, "0")}
                </span>
              </div>

              <div className="relative mt-auto pt-10">
                <h3 className="max-w-xl text-[clamp(1.35rem,2.1vw,2rem)] font-semibold leading-tight tracking-[-.035em]">
                  {title_}
                </h3>
                <p className="mt-3 max-w-2xl text-[.82rem] leading-6 opacity-68">
                  {svc.description}
                </p>
                <span className="mt-6 inline-flex items-center gap-2 text-[.73rem] font-bold">
                  Comparer ce périmètre
                  <span aria-hidden className="transition-transform group-hover:translate-x-1">↗</span>
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
