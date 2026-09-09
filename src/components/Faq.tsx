import Link from "next/link";
import type { FaqItem } from "@/libs/db";
import { FaqAccordion } from "./editorial/FaqAccordion";
import { EditorialArrow, EDITORIAL_FOCUS } from "./editorial/EditorialElements";

export function Faq({ items }: { items: FaqItem[] }) {
  if (!items.length) return null;
  return (
    <section className="bg-paper px-5 py-16 sm:px-8 lg:py-24">
      <div className="mx-auto grid max-w-[80rem] items-start gap-9 lg:grid-cols-[.42fr_1fr] lg:gap-16">
        <div className="lg:sticky lg:top-28">
          <p className="mb-4 text-xs font-bold uppercase tracking-[.14em] text-blue">
            Pour y voir plus clair
          </p>
          <h2 className="font-display text-[clamp(2rem,3.5vw,3rem)] font-bold leading-[1.07] tracking-[-.045em] text-ink">
            Questions fréquentes
          </h2>
          <p className="mt-5 text-base leading-7 text-ink-muted">
            Retrouvez les réponses aux questions les plus courantes. L’équipe
            éditoriale précise les limites des contenus et les points à
            vérifier.
          </p>
          <div className="mt-7 rounded-[1.5rem] bg-navy p-6">
            <h3 className="font-display text-xl font-bold text-white">
              Besoin d’aide ?
            </h3>
            <p className="mt-3 text-sm leading-6 text-white/75">
              Décrivez votre besoin pour préparer une demande d’orientation.
            </p>
            <Link
              href="/contact"
              className={`mt-5 inline-flex min-h-11 w-full items-center justify-between gap-3 rounded-full bg-mint px-5 py-3 text-sm font-bold text-navy transition-colors hover:bg-white ${EDITORIAL_FOCUS}`}
            >
              Demander une orientation <EditorialArrow className="shrink-0" />
            </Link>
          </div>
        </div>
        <FaqAccordion items={items} htmlAnswers />
      </div>
    </section>
  );
}
