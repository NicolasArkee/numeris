import Link from "next/link";
import type { FaqItem } from "@/libs/db";

export function Faq({ items }: { items: FaqItem[] }) {
  return (
    <section className="bg-bg px-6 py-24 lg:px-[4.5rem]">
      <div className="mx-auto grid max-w-[72rem] items-start gap-12 lg:grid-cols-[0.45fr_1fr] lg:gap-24">
        {/* Left */}
        <div className="lg:sticky lg:top-[calc(72px+2rem)]">
          <div className="mb-5 flex items-center gap-3.5">
            <span className="block h-px w-6 flex-shrink-0 bg-accent-500" />
            <span className="text-[0.65rem] font-bold uppercase tracking-[0.14em] text-accent-700">
              FAQ
            </span>
          </div>
          <h2 className="mb-5 font-display text-[2.75rem] font-bold leading-[1.15] tracking-tight text-ink">
            Questions fréquentes
          </h2>
          <p className="mb-8 text-[0.85rem] leading-relaxed text-ink-muted">
            Retrouvez les réponses aux questions les plus courantes. L'équipe
            éditoriale précise les limites des contenus et les points à vérifier.
          </p>

          {/* Contact block */}
          <div className="border-t-2 border-t-accent-500 bg-brand-ink p-6">
            <h3 className="font-display text-base font-normal text-surface">
              Besoin d&apos;aide ?
            </h3>
            <p className="mb-5 text-[0.72rem] leading-relaxed text-white/35">
              Décrivez votre besoin pour préparer une demande d'orientation.
            </p>
            <Link
              href="/contact"
              className="block w-full bg-accent-500 py-2.5 text-center text-[0.75rem] font-semibold text-brand-ink transition-colors hover:bg-accent-700"
            >
              Demander une orientation
            </Link>
          </div>
        </div>

        {/* Right */}
        <div>
          {items.map((item, i) => (
            <details
              key={item.id}
              className={`border-b border-border-soft ${i === 0 ? "border-t" : ""}`}
            >
              <summary className="flex cursor-pointer select-none items-center justify-between gap-4 py-6 text-[0.9rem] font-medium text-ink-muted transition-colors hover:text-accent-700 [&::-webkit-details-marker]:hidden">
                {item.question}
                <span className="flex-shrink-0 font-display text-[1.25rem] font-bold italic text-ink-soft">
                  +
                </span>
              </summary>
              <div
                className="max-w-prose pb-6 text-base leading-relaxed text-ink-muted"
                dangerouslySetInnerHTML={{ __html: item.answer }}
              />
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
