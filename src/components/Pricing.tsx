import Link from "next/link";
import type { PricingPlan } from "@/libs/db";

interface Feature {
  label: string;
  included: boolean;
}

export function Pricing({ plans }: { plans: PricingPlan[] }) {
  return (
    <section className="bg-bg-muted px-6 py-24 lg:px-[4.5rem]">
      <div className="mx-auto max-w-[82rem]">
        <div className="mb-5 flex items-center gap-3.5">
          <span className="block h-px w-6 flex-shrink-0 bg-accent-500" />
          <span className="text-[0.65rem] font-bold uppercase tracking-[0.14em] text-accent-700">
            Repères de budget
          </span>
        </div>
        <h2 className="mb-14 font-display text-[2.75rem] font-bold leading-[1.15] tracking-tight text-ink">
          Comparer le périmètre avant le prix
        </h2>

        <div className="grid items-start gap-5 lg:grid-cols-3">
          {plans.map((plan) => {
            const features: Feature[] = JSON.parse(plan.features);
            const isFeatured = Boolean(plan.featured);

            return (
              <div
                key={plan.slug}
                className={`overflow-hidden border bg-surface ${isFeatured ? "border-brand-ink border-t-[3px] border-t-accent-500" : "border-border-soft"}`}
              >
                {/* Head */}
                <div
                  className={`border-b border-border-soft p-8 ${isFeatured ? "bg-brand-ink" : ""}`}
                >
                  <span
                    className={`mb-3.5 inline-block px-2.5 py-0.5 text-[0.6rem] font-bold uppercase tracking-[0.1em] ${isFeatured ? "bg-accent-500/20 text-accent-300" : "bg-accent-300 text-accent-700"}`}
                  >
                    {plan.tag}
                  </span>
                  <h3
                    className={`font-display text-[1.5rem] font-normal ${isFeatured ? "text-surface" : "text-ink"}`}
                  >
                    {plan.name}
                  </h3>
                  <p
                    className={`text-[0.78rem] leading-relaxed ${isFeatured ? "text-white/40" : "text-ink-muted"}`}
                  >
                    {plan.description}
                  </p>
                  <div className="mt-5 flex items-baseline gap-2.5">
                    <span
                      className={`font-display text-[2.5rem] font-bold italic leading-none ${isFeatured ? "text-accent-500" : "text-ink"}`}
                    >
                      {plan.price}
                    </span>
                    {plan.period && (
                      <span
                        className={`text-[0.75rem] ${isFeatured ? "text-white/30" : "text-ink-muted"}`}
                      >
                        {plan.period}
                      </span>
                    )}
                  </div>
                </div>

                {/* Body */}
                <div className="p-7">
                  {features.map((feat) => (
                    <div
                      key={feat.label}
                      className="flex items-start gap-3 border-b border-border-soft py-2 text-[0.8rem] leading-snug text-ink-muted last:border-b-0"
                    >
                      <span
                        className={`mt-0.5 flex-shrink-0 text-[0.8rem] ${feat.included ? "text-accent-500" : "text-border"}`}
                      >
                        {feat.included ? "✓" : "—"}
                      </span>
                      {feat.label}
                    </div>
                  ))}
                </div>

                {/* Foot */}
                <div className="border-t border-border-soft px-8 pb-8 pt-5">
                  <Link
                    href="/contact"
                    className={`block w-full py-3.5 text-center text-[0.8rem] font-semibold tracking-wide transition-colors ${
                      isFeatured
                        ? "bg-accent-500 text-brand-ink hover:bg-accent-700"
                        : "border border-border-soft bg-transparent text-brand-ink hover:border-brand-ink"
                    }`}
                  >
                    {plan.cta_label}
                  </Link>
                  {plan.note && (
                    <p className="mt-2.5 text-center text-[0.65rem] text-ink-soft">
                      {plan.note}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
