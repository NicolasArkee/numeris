import Link from "next/link";
import type { FaqItem } from "@/libs/db";

export function Faq({ items }: { items: FaqItem[] }) {
  return (
    <section className="bg-creme px-6 py-24 lg:px-[4.5rem]">
      <div className="mx-auto grid max-w-[72rem] items-start gap-12 lg:grid-cols-[0.45fr_1fr] lg:gap-24">
        {/* Left */}
        <div className="lg:sticky lg:top-[calc(72px+2rem)]">
          <div className="mb-5 flex items-center gap-3.5">
            <span className="block h-px w-6 flex-shrink-0 bg-or" />
            <span className="text-[0.65rem] font-bold uppercase tracking-[0.14em] text-or-fonce">
              FAQ
            </span>
          </div>
          <h2 className="mb-5 font-serif text-[2.75rem] font-light leading-[1.15] tracking-tight text-encre">
            Questions fréquentes
          </h2>
          <p className="mb-8 text-[0.85rem] leading-relaxed text-ardoise">
            Retrouvez les réponses aux questions les plus courantes. Notre
            équipe reste disponible pour tout complément d&apos;information.
          </p>

          {/* Contact block */}
          <div className="border-t-2 border-t-or bg-nuit p-6">
            <h3 className="font-serif text-base font-normal text-blanc">
              Besoin d&apos;aide ?
            </h3>
            <p className="mb-5 text-[0.72rem] leading-relaxed text-white/35">
              Contactez-nous directement pour une réponse personnalisée.
            </p>
            <Link
              href="/contact"
              className="block w-full bg-or py-2.5 text-center text-[0.75rem] font-semibold text-blanc transition-colors hover:bg-[#b08844]"
            >
              Nous contacter
            </Link>
          </div>
        </div>

        {/* Right */}
        <div>
          {items.map((item, i) => (
            <details
              key={item.id}
              className={`border-b border-pierre-12 ${i === 0 ? "border-t" : ""}`}
            >
              <summary className="flex cursor-pointer select-none items-center justify-between gap-4 py-6 text-[0.9rem] font-medium text-encre-75 transition-colors hover:text-or-fonce [&::-webkit-details-marker]:hidden">
                {item.question}
                <span className="flex-shrink-0 font-serif text-[1.25rem] font-light italic text-pierre-37">
                  +
                </span>
              </summary>
              <div
                className="max-w-[540px] pb-6 text-[0.85rem] leading-relaxed text-ardoise"
                dangerouslySetInnerHTML={{ __html: item.answer }}
              />
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
