import Link from "next/link";
import { db } from "@/libs/db";
import { pricingTierToProp } from "@/components/pricing-shared";
import { SIMULATEURS } from "@/app/simulateurs/registry";
import { SectionHead } from "./HomeSections";

/** Tarifs « registre » : la grille de référence en table à filets + les
 *  simulateurs comme instruments de chiffrage. Aucun prix inventé — grille
 *  pricing_tiers + estimation personnalisée par simulateur. */
export async function HomeTarifs() {
  const tiers = await db
    .getPricingTiers()
    .then((rows) => rows.map(pricingTierToProp))
    .catch(() => []);

  return (
    <section className="border-t border-border bg-surface px-6 py-20 lg:px-12 lg:py-24">
      <div className="mx-auto max-w-328">
        <SectionHead
          index="03"
          eyebrow="Tarifs"
          title="Comparez les prix avant le premier rendez-vous"
          sub="La grille de référence des offres comparées, et des simulateurs pour passer du barème à VOTRE situation."
        />

        <div className="grid gap-12 lg:grid-cols-[1.5fr_1fr] lg:gap-16">
          {/* Grille de référence */}
          {tiers.length > 0 && (
            <div className="border border-border">
              <div className="grid grid-cols-3 divide-x divide-border border-b border-border bg-bg-muted">
                {tiers.map((tier) => (
                  <div key={tier.name} className="px-5 py-4">
                    <p className="font-display text-[0.9rem] font-bold text-ink">
                      {tier.name}
                      {tier.highlighted && (
                        <span className="ml-2 bg-accent-500 px-1.5 py-0.5 font-mono text-[0.55rem] uppercase tracking-wider text-brand-ink">
                          Populaire
                        </span>
                      )}
                    </p>
                    <p className="mt-1 font-mono text-[1.05rem] font-semibold tabular-nums text-brand-700">
                      {tier.from}
                    </p>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-3 divide-x divide-border">
                {tiers.map((tier) => (
                  <ul key={tier.name} className="space-y-2.5 px-5 py-5">
                    {tier.features.slice(0, 5).map((f) => (
                      <li key={f} className="flex gap-2 text-[0.78rem] leading-snug text-ink-muted">
                        <span aria-hidden className="mt-0.5 text-accent-500">✓</span>
                        {f}
                      </li>
                    ))}
                  </ul>
                ))}
              </div>
              <p className="border-t border-border bg-bg-muted px-5 py-3 text-[0.72rem] text-ink-soft">
                Grille indicative des offres en ligne comparées — les honoraires réels dépendent
                du périmètre de la lettre de mission.
              </p>
            </div>
          )}

          {/* Simulateurs = instruments */}
          <div>
            <p className="mb-4 font-mono text-[0.65rem] uppercase tracking-[0.2em] text-ink-soft">
              Instruments de chiffrage
            </p>
            <ul className="border-t border-border">
              {SIMULATEURS.slice(0, 5).map((sim) => (
                <li key={sim.slug}>
                  <Link
                    href={`/simulateurs/${sim.slug}`}
                    className="group flex items-center justify-between gap-4 border-b border-border py-3.5 transition-colors hover:bg-bg"
                  >
                    <span className="text-[0.9rem] text-ink group-hover:text-brand-700">
                      {sim.title}
                    </span>
                    <span aria-hidden className="font-mono text-[0.8rem] text-accent-500">→</span>
                  </Link>
                </li>
              ))}
            </ul>
            <Link
              href="/simulateurs/honoraires"
              className="mt-6 inline-flex items-center gap-2 bg-accent-500 px-6 py-3.5 font-display text-[0.85rem] font-bold text-brand-ink transition-colors hover:bg-accent-300"
            >
              Estimer mes honoraires →
            </Link>
            <p className="mt-3 text-[0.75rem] text-ink-soft">
              Gratuit, sans inscription, résultat immédiat.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
