import Link from "next/link";
import type { Service } from "@/libs/db";
import { Icon } from "./Icon";

export function Services({ services }: { services: Service[] }) {
  return (
    <section className="bg-bg px-6 py-24 lg:px-[4.5rem]">
      <div className="mx-auto max-w-[82rem]">
        {/* Header */}
        <div className="mb-14 grid items-start gap-6 lg:grid-cols-2 lg:gap-20">
          <div>
            <div className="mb-5 flex items-center gap-3.5">
              <span className="block h-px w-6 flex-shrink-0 bg-accent-500" />
              <span className="text-[0.65rem] font-bold uppercase tracking-[0.14em] text-accent-700">
                Expertises à comparer
              </span>
            </div>
            <h2 className="font-display text-[2.75rem] font-bold leading-[1.15] tracking-tight text-ink">
              Comprendre les missions avant de choisir
            </h2>
          </div>
          <p className="text-[0.95rem] leading-relaxed text-ink-muted lg:pt-10">
            De la tenue comptable au conseil de gestion, chaque besoin implique
            des livrables, des délais et des responsabilités différentes. Skoria
            vous aide à les comparer avant de contacter un professionnel.
          </p>
        </div>

        {/* Grid */}
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <div
              key={service.slug}
              className="group relative cursor-default border border-border-soft border-t-2 border-t-transparent bg-surface p-9 transition-all hover:-translate-y-0.5 hover:border-t-accent-500 hover:shadow-lg"
            >
              <span className="mb-5 block font-display text-[2rem] font-bold italic leading-none text-border-soft">
                {String(service.order_index).padStart(2, "0")}
              </span>
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-md border border-brand-100 bg-brand-50 text-brand-700">
                <Icon name={service.slug} size={22} />
              </div>
              <h3 className="mb-3 font-display text-[1.2rem] font-medium leading-snug text-ink">
                {service.title}
              </h3>
              <p className="mb-6 text-[0.8rem] leading-relaxed text-ink-muted">
                {service.description}
              </p>
              <Link
                href={`/expertises/${service.slug}`}
                className="inline-flex items-center gap-1.5 border-b border-accent-300 pb-px text-[0.72rem] font-semibold text-accent-700 transition-all group-hover:gap-2.5 group-hover:border-accent-500"
              >
                En savoir plus →
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
