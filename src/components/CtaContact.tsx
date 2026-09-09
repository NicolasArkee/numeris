import Link from "next/link";
import { BriefTrigger } from "./journey/BriefTrigger";

/** CTA de fin de parcours : prépare un brief local, sans promesse de rappel. */
export function CtaContact() {
  return (
    <section className="overflow-hidden bg-blue px-5 py-16 text-white sm:px-8 lg:py-20">
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1fr_.75fr] lg:items-end lg:gap-20">
        <div>
          <p className="text-[.65rem] font-bold uppercase tracking-[.2em] text-white/65">Votre prochaine étape</p>
          <h2 className="mt-4 max-w-4xl text-balance text-[clamp(2.5rem,5vw,4.4rem)] font-semibold leading-[1.02] tracking-[-.04em]">
            Gardez vos critères dans un brief que vous contrôlez.
          </h2>
          <p className="mt-6 max-w-2xl text-[1rem] leading-8 text-white/75">
            Décrivez votre activité, la mission, votre situation et vos questions. Le résumé reste local, peut être téléchargé et vous sert à préparer plusieurs échanges.
          </p>
        </div>
        <div className="rounded-[1.2rem] bg-white p-6 text-ink lg:p-8">
          <p className="text-[.65rem] font-bold uppercase tracking-[.18em] text-blue">Brief en trois étapes</p>
          <ol className="mt-5 space-y-3 text-[.86rem] leading-6 text-ink-muted">
            <li><span className="mr-2 font-serif text-xl text-blue">01</span>Votre activité et votre situation</li>
            <li><span className="mr-2 font-serif text-xl text-blue">02</span>La mission et le mode de collaboration</li>
            <li><span className="mr-2 font-serif text-xl text-blue">03</span>Vos critères et questions à conserver</li>
          </ol>
          <BriefTrigger className="mt-6 inline-flex min-h-12 w-full items-center justify-center rounded-full bg-orange px-6 text-[.82rem] font-bold text-navy">
            Construire mon brief&nbsp; ↗
          </BriefTrigger>
          <Link href="/annuaire/experts-comptables" className="mt-4 flex justify-center text-[.72rem] font-bold text-blue underline underline-offset-4">
            Explorer d’abord l’annuaire
          </Link>
        </div>
      </div>
    </section>
  );
}
