import Link from "next/link";
import type { Service } from "@/libs/db";

export function Services({ services }: { services: Service[] }) {
  return (
    <section className="bg-creme px-6 py-24 lg:px-[4.5rem]">
      <div className="mx-auto max-w-[82rem]">
        {/* Header */}
        <div className="mb-14 grid items-start gap-6 lg:grid-cols-2 lg:gap-20">
          <div>
            <div className="mb-5 flex items-center gap-3.5">
              <span className="block h-px w-6 flex-shrink-0 bg-or" />
              <span className="text-[0.65rem] font-bold uppercase tracking-[0.14em] text-or-fonce">
                Nos expertises
              </span>
            </div>
            <h2 className="font-serif text-[2.75rem] font-light leading-[1.15] tracking-tight text-encre">
              Un accompagnement complet
            </h2>
          </div>
          <p className="text-[0.95rem] leading-relaxed text-ardoise lg:pt-10">
            De la tenue comptable au conseil stratégique, notre équipe
            pluridisciplinaire couvre l&apos;ensemble de vos besoins en
            expertise comptable et financière.
          </p>
        </div>

        {/* Grid */}
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <div
              key={service.slug}
              className="group relative cursor-default border border-pierre-12 border-t-2 border-t-transparent bg-blanc p-9 transition-all hover:-translate-y-0.5 hover:border-t-or hover:shadow-lg"
            >
              <span className="mb-5 block font-serif text-[2rem] font-light italic leading-none text-pierre-12">
                {String(service.order_index).padStart(2, "0")}
              </span>
              <div className="mb-5 flex h-10 w-10 items-center justify-center border border-pierre-12 text-[0.95rem]">
                {service.icon}
              </div>
              <h3 className="mb-3 font-serif text-[1.2rem] font-medium leading-snug text-encre">
                {service.title}
              </h3>
              <p className="mb-6 text-[0.8rem] leading-relaxed text-ardoise">
                {service.description}
              </p>
              <Link
                href={`/expertises/${service.slug}`}
                className="inline-flex items-center gap-1.5 border-b border-or-clair pb-px text-[0.72rem] font-semibold text-or-fonce transition-all group-hover:gap-2.5 group-hover:border-or"
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
