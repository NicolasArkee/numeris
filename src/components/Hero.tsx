import Link from "next/link";
import { AppConfig } from "@/utils/AppConfig";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-nuit px-6 py-24 lg:px-[4.5rem] lg:py-28">
      {/* Background grid */}
      <div className="grid-bg pointer-events-none absolute inset-0 opacity-35" />
      <div className="radial-or pointer-events-none absolute -bottom-1/4 -right-[8%] h-[560px] w-[560px]" />

      <div className="relative z-10 mx-auto grid max-w-[82rem] items-center gap-12 lg:grid-cols-2 lg:gap-28">
        {/* Left */}
        <div>
          <div className="animate-fade-up mb-9 flex items-center gap-3.5">
            <span className="block h-px w-7 bg-or" />
            <span className="text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-or">
              Cabinet d&apos;expertise comptable depuis {AppConfig.foundedYear}
            </span>
          </div>

          <h1 className="animate-fade-up mb-7 font-serif text-[2.75rem] font-light leading-[1.06] tracking-tight text-blanc lg:text-[4.25rem]">
            Votre <em className="font-normal italic text-or">partenaire</em>
            <br />
            comptable de confiance
          </h1>

          <p className="animate-fade-up mb-11 max-w-[460px] text-base leading-relaxed text-white/40">
            {AppConfig.description}
          </p>

          <div className="animate-fade-up mb-12 flex flex-wrap items-center gap-5">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 bg-or px-9 py-4 font-sans text-[0.875rem] font-semibold text-blanc transition-colors hover:bg-[#b08844]"
            >
              Premier rendez-vous gratuit →
            </Link>
            <Link
              href="/expertises"
              className="border border-white/20 px-8 py-4 font-sans text-[0.875rem] font-medium text-white/50 transition-colors hover:border-white/40 hover:text-white/90"
            >
              Voir nos formules
            </Link>
          </div>

          {/* Trust indicators */}
          <div className="flex items-center gap-8 border-t border-white/[0.07] pt-10">
            <div className="flex flex-col">
              <span className="font-serif text-[1.75rem] font-light italic text-or">
                500+
              </span>
              <span className="mt-0.5 max-w-[80px] text-[0.7rem] leading-snug text-white/30">
                Clients accompagnés
              </span>
            </div>
            <div className="h-10 w-px bg-white/10" />
            <div className="flex flex-col">
              <span className="font-serif text-[1.75rem] font-light italic text-or">
                28
              </span>
              <span className="mt-0.5 max-w-[80px] text-[0.7rem] leading-snug text-white/30">
                Années d&apos;expérience
              </span>
            </div>
            <div className="h-10 w-px bg-white/10" />
            <div className="flex flex-col">
              <span className="font-serif text-[1.75rem] font-light italic text-or">
                98%
              </span>
              <span className="mt-0.5 max-w-[80px] text-[0.7rem] leading-snug text-white/30">
                Taux de fidélisation
              </span>
            </div>
          </div>
        </div>

        {/* Right — service card */}
        <div className="border border-white/10 border-t-2 border-t-or bg-white/[0.04] p-9">
          <div className="mb-7 flex items-center gap-3 text-[0.62rem] font-bold uppercase tracking-[0.12em] text-white/[0.28]">
            Nos expertises
            <span className="block h-px flex-1 bg-white/[0.08]" />
          </div>

          <div className="flex flex-col">
            {[
              "Comptabilité générale",
              "Conseil fiscal",
              "Gestion sociale & paie",
              "Création d'entreprise",
              "Conseil en gestion",
              "Audit & commissariat",
            ].map((service) => (
              <div
                key={service}
                className="flex cursor-default items-center gap-3.5 border-b border-white/[0.06] py-3.5 transition-colors last:border-b-0"
              >
                <span className="h-1.5 w-1.5 flex-shrink-0 bg-or" />
                <span className="flex-1 text-[0.88rem] text-white/70">
                  {service}
                </span>
                <span className="text-[0.75rem] text-white/20">→</span>
              </div>
            ))}
          </div>

          <div className="mt-7 flex items-center justify-between border-t border-white/[0.07] pt-7">
            <span className="text-[0.8rem] text-white/45">
              <strong className="font-medium text-or">{AppConfig.phone}</strong>
            </span>
            <Link
              href="/contact"
              className="bg-or px-5 py-2.5 text-[0.72rem] font-bold text-white transition-colors hover:bg-[#b08844]"
            >
              Nous contacter
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
