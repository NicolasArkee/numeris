import Link from "next/link";

interface PricingTier {
  name: string;
  from: string;
  features: string[];
  highlighted?: boolean;
}

interface PricingTeaserProps {
  title?: string;
  tiers: PricingTier[];
}

export function PricingTeaser({
  title = "Nos tarifs pour cette prestation",
  tiers,
}: PricingTeaserProps) {
  return (
    <div className="mb-12">
      <h2 className="mb-6 font-serif text-[1.25rem] font-light text-encre">
        {title}
      </h2>
      <div className="grid gap-4 md:grid-cols-3">
        {tiers.map((tier) => (
          <div
            key={tier.name}
            className={`flex flex-col p-6 ${
              tier.highlighted
                ? "border-t-2 border-t-or bg-nuit text-blanc"
                : "border border-pierre-12 bg-blanc"
            }`}
          >
            {tier.highlighted && (
              <span className="mb-2 inline-block w-fit bg-or px-2 py-0.5 text-[0.58rem] font-bold uppercase tracking-wider text-blanc">
                Populaire
              </span>
            )}
            <h3
              className={`mb-1 text-[0.92rem] font-semibold ${
                tier.highlighted ? "text-blanc" : "text-encre"
              }`}
            >
              {tier.name}
            </h3>
            <div className="mb-4 flex items-baseline gap-1">
              <span className="text-[0.72rem] text-ardoise">à partir de</span>
              <span
                className={`font-serif text-[1.75rem] font-light italic leading-none ${
                  tier.highlighted ? "text-or" : "text-or-fonce"
                }`}
              >
                {tier.from}
              </span>
              <span
                className={`text-[0.68rem] ${
                  tier.highlighted ? "text-white/30" : "text-ardoise"
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
                    tier.highlighted ? "text-white/60" : "text-ardoise"
                  }`}
                >
                  <span className="mt-0.5 flex-shrink-0 text-or">✓</span>
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
          className="inline-flex items-center gap-2 text-[0.82rem] font-medium text-or-fonce transition-colors hover:text-or"
        >
          Demander un devis personnalisé →
        </Link>
      </div>
    </div>
  );
}
