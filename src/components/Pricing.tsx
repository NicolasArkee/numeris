import Link from "next/link";
import type { PricingPlan } from "@/libs/db";

interface Feature {
  label: string;
  included: boolean;
}

export function Pricing({ plans }: { plans: PricingPlan[] }) {
  return (
    <section className="bg-creme-06 px-6 py-24 lg:px-[4.5rem]">
      <div className="mx-auto max-w-[82rem]">
        <div className="mb-5 flex items-center gap-3.5">
          <span className="block h-px w-6 flex-shrink-0 bg-or" />
          <span className="text-[0.65rem] font-bold uppercase tracking-[0.14em] text-or-fonce">
            Formules & tarifs
          </span>
        </div>
        <h2 className="mb-14 font-serif text-[2.75rem] font-light leading-[1.15] tracking-tight text-encre">
          Des formules claires, sans surprise
        </h2>

        <div className="grid items-start gap-5 lg:grid-cols-3">
          {plans.map((plan) => {
            const features: Feature[] = JSON.parse(plan.features);
            const isFeatured = Boolean(plan.featured);

            return (
              <div
                key={plan.slug}
                className={`overflow-hidden border bg-blanc ${isFeatured ? "border-nuit border-t-[3px] border-t-or" : "border-pierre-12"}`}
              >
                {/* Head */}
                <div
                  className={`border-b border-pierre-12 p-8 ${isFeatured ? "bg-nuit" : ""}`}
                >
                  <span
                    className={`mb-3.5 inline-block px-2.5 py-0.5 text-[0.6rem] font-bold uppercase tracking-[0.1em] ${isFeatured ? "bg-or/20 text-or-clair" : "bg-or-clair text-or-fonce"}`}
                  >
                    {plan.tag}
                  </span>
                  <h3
                    className={`font-serif text-[1.5rem] font-normal ${isFeatured ? "text-blanc" : "text-encre"}`}
                  >
                    {plan.name}
                  </h3>
                  <p
                    className={`text-[0.78rem] leading-relaxed ${isFeatured ? "text-white/40" : "text-ardoise"}`}
                  >
                    {plan.description}
                  </p>
                  <div className="mt-5 flex items-baseline gap-2.5">
                    <span
                      className={`font-serif text-[2.5rem] font-light italic leading-none ${isFeatured ? "text-or" : "text-encre"}`}
                    >
                      {plan.price}
                    </span>
                    {plan.period && (
                      <span
                        className={`text-[0.75rem] ${isFeatured ? "text-white/30" : "text-ardoise"}`}
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
                      className="flex items-start gap-3 border-b border-pierre-12 py-2 text-[0.8rem] leading-snug text-encre-50 last:border-b-0"
                    >
                      <span
                        className={`mt-0.5 flex-shrink-0 text-[0.8rem] ${feat.included ? "text-or" : "text-pierre-25"}`}
                      >
                        {feat.included ? "✓" : "—"}
                      </span>
                      {feat.label}
                    </div>
                  ))}
                </div>

                {/* Foot */}
                <div className="border-t border-pierre-12 px-8 pb-8 pt-5">
                  <Link
                    href="/contact"
                    className={`block w-full py-3.5 text-center text-[0.8rem] font-semibold tracking-wide transition-colors ${
                      isFeatured
                        ? "bg-or text-blanc hover:bg-[#b08844]"
                        : "border border-pierre-12 bg-transparent text-nuit hover:border-nuit"
                    }`}
                  >
                    {plan.cta_label}
                  </Link>
                  {plan.note && (
                    <p className="mt-2.5 text-center text-[0.65rem] text-pierre-37">
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
