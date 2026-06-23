import Link from "next/link";
import type { PricingTierShape } from "./pricing-shared";
import { normalizeFromPrice } from "@/libs/content/format";

interface PricingTeaserProps {
  title?: string;
  tiers: PricingTierShape[];
}

export function PricingTeaser({
  title = "Nos tarifs pour cette prestation",
  tiers,
}: PricingTeaserProps) {
  return (
    <div className="mb-12">
      <h2 className="mb-6 font-display text-[1.25rem] font-bold text-ink">
        {title}
      </h2>
      <div className="grid gap-4 md:grid-cols-3">
        {tiers.map((tier) => (
          <div
            key={tier.name}
            className={`flex flex-col p-6 ${
              tier.highlighted
                ? "border-t-2 border-t-accent-500 bg-brand-ink text-surface"
                : "border border-border-soft bg-surface"
            }`}
          >
            {tier.highlighted && (
              <span className="mb-2 inline-block w-fit bg-accent-500 px-2 py-0.5 text-[0.58rem] font-bold uppercase tracking-wider text-brand-ink">
                Populaire
              </span>
            )}
            <h3
              className={`mb-1 text-[0.92rem] font-semibold ${
                tier.highlighted ? "text-surface" : "text-ink"
              }`}
            >
              {tier.name}
            </h3>
            <div className="mb-4 flex items-baseline gap-1">
              <span className="text-[0.72rem] text-ink-muted">à partir de</span>
              <span
                className={`font-display text-[1.75rem] font-bold italic leading-none ${
                  tier.highlighted ? "text-accent-500" : "text-accent-700"
                }`}
              >
                {normalizeFromPrice(tier.from)}
              </span>
              <span
                className={`text-[0.68rem] ${
                  tier.highlighted ? "text-white/30" : "text-ink-muted"
                }`}
              >
                HT/mois
              </span>
            </div>
            <ul className="flex-1 space-y-2">
              {tier.features.map((f) => (
                <li
                  key={f}
                  className={`flex items-start gap-2 text-[0.78rem] ${
                    tier.highlighted ? "text-white/60" : "text-ink-muted"
                  }`}
                >
                  <span className="mt-0.5 flex-shrink-0 text-accent-500">✓</span>
                  {f}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="mt-4 text-center">
        <Link
          href="/contact"
          className="inline-flex items-center gap-2 text-[0.82rem] font-medium text-accent-700 transition-colors hover:text-accent-500"
        >
          Demander un devis personnalisé →
        </Link>
      </div>
    </div>
  );
}
