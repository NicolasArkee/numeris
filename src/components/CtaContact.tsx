import Link from "next/link";
import { ContactButton } from "./ContactButton";

export function CtaContact() {
  return (
    <section className="relative overflow-hidden bg-brand-ink px-6 py-28 lg:px-[4.5rem]">
      <div
        aria-hidden
        className="pointer-events-none absolute -left-[8%] -top-[30%] h-150 w-150 rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(255,107,53,0.18) 0%, rgba(255,107,53,0) 60%)",
        }}
      />

      <div className="relative z-10 mx-auto grid max-w-[82rem] items-center gap-12 lg:grid-cols-2 lg:gap-28">
        {/* Left */}
        <div>
          <div className="mb-7 flex items-center gap-3.5">
            <span className="block h-px w-6 flex-shrink-0 bg-accent-500" />
            <span className="text-[0.65rem] font-bold uppercase tracking-[0.14em] text-accent-500">
              Contact
            </span>
          </div>
          <h2 className="mb-5 font-display text-[3rem] font-bold leading-[1.12] tracking-tight text-surface">
            Prenons <em className="font-normal italic text-accent-500">rendez-vous</em>
          </h2>
          <p className="mb-10 text-[0.9rem] leading-relaxed text-white/[0.38]">
            Décrivez votre besoin. Skoria vous aide à cadrer les critères de
            comparaison avant de contacter un professionnel.
          </p>
          <div className="flex flex-wrap items-center gap-5">
            <ContactButton
              className="inline-flex items-center gap-2 bg-accent-500 px-9 py-4 font-body text-[0.875rem] font-semibold text-brand-ink transition-colors hover:bg-accent-700"
            >
              Demander une orientation →
            </ContactButton>
            <Link
              href="tel:+33142360000"
              className="border border-white/15 px-7 py-4 font-body text-[0.875rem] text-white/40 transition-colors hover:border-white/30 hover:text-white/85"
            >
              01 42 36 XX XX
            </Link>
          </div>
          <p className="mt-6 text-[0.68rem] text-white/20">
            Réponse sous 24h · Orientation gratuite · Sans engagement
          </p>
        </div>

        {/* Right — quick form */}
        <div className="border border-white/10 border-t-2 border-t-accent-500 bg-white/[0.04] p-9">
          <h3 className="mb-2.5 font-display text-[1.375rem] font-normal text-surface">
            Demande d'orientation
          </h3>
          <p className="mb-7 text-[0.75rem] leading-relaxed text-white/30">
            Remplissez ce formulaire et nous vous indiquons les critères à comparer.
          </p>

          <form className="space-y-3.5">
            <div className="grid gap-3.5 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-[0.62rem] font-bold uppercase tracking-[0.08em] text-white/30">
                  Nom
                </label>
                <input
                  type="text"
                  placeholder="Votre nom"
                  className="h-11 w-full border border-white/[0.12] bg-white/[0.06] px-3.5 text-[0.82rem] text-white/80 placeholder:text-white/[0.18] focus:border-accent-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-[0.62rem] font-bold uppercase tracking-[0.08em] text-white/30">
                  Téléphone
                </label>
                <input
                  type="tel"
                  placeholder="06 XX XX XX XX"
                  className="h-11 w-full border border-white/[0.12] bg-white/[0.06] px-3.5 text-[0.82rem] text-white/80 placeholder:text-white/[0.18] focus:border-accent-500 focus:outline-none"
                />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-[0.62rem] font-bold uppercase tracking-[0.08em] text-white/30">
                Email
              </label>
              <input
                type="email"
                placeholder="email@entreprise.fr"
                className="h-11 w-full border border-white/[0.12] bg-white/[0.06] px-3.5 text-[0.82rem] text-white/80 placeholder:text-white/[0.18] focus:border-accent-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-[0.62rem] font-bold uppercase tracking-[0.08em] text-white/30">
                Besoin
              </label>
              <select className="h-11 w-full cursor-pointer border border-white/[0.12] bg-white/[0.06] px-3.5 text-[0.82rem] text-white/50">
                <option>Comptabilité générale</option>
                <option>Conseil fiscal</option>
                <option>Gestion sociale</option>
                <option>Création d&apos;entreprise</option>
                <option>Autre</option>
              </select>
            </div>
            <button
              type="submit"
              className="mt-3.5 w-full bg-accent-500 py-3.5 text-[0.82rem] font-semibold text-brand-ink transition-colors hover:bg-accent-700"
            >
              Envoyer ma demande
            </button>
          </form>
          <p className="mt-3 text-center text-[0.62rem] leading-relaxed text-white/[0.18]">
            Vos données sont traitées conformément à notre politique de
            confidentialité.
          </p>
        </div>
      </div>
    </section>
  );
}
