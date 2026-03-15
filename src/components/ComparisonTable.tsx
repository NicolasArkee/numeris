interface Plan {
  name: string;
  price: string;
  period?: string;
  description: string;
  features: { label: string; included: boolean }[];
  cta?: { label: string; href: string };
  highlighted?: boolean;
}

interface ComparisonTableProps {
  title?: string;
  subtitle?: string;
  plans: Plan[];
}

export function ComparisonTable({
  title = "Choisissez la formule adaptée à votre entreprise",
  subtitle,
  plans,
}: ComparisonTableProps) {
  return (
    <section className="bg-creme px-6 py-24 lg:px-[4.5rem]">
      <div className="mx-auto max-w-[82rem]">
        <div className="mb-14 max-w-2xl">
          <div className="mb-5 flex items-center gap-3.5">
            <span className="block h-px w-6 flex-shrink-0 bg-or" />
            <span className="text-[0.65rem] font-bold uppercase tracking-[0.14em] text-or-fonce">
              Tarifs
            </span>
          </div>
          <h2 className="mb-4 font-serif text-[2.25rem] font-light leading-[1.15] tracking-tight text-encre lg:text-[2.75rem]">
            {title}
          </h2>
          {subtitle && (
            <p className="text-[0.95rem] leading-relaxed text-ardoise">{subtitle}</p>
          )}
        </div>

        {/* Mobile: stacked cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`flex flex-col ${
                plan.highlighted
                  ? "border-t-2 border-t-or bg-nuit text-blanc"
                  : "border border-pierre-12 bg-blanc"
              }`}
            >
              {/* Header */}
              <div className={`p-7 ${plan.highlighted ? "" : ""}`}>
                {plan.highlighted && (
                  <span className="mb-3 inline-block bg-or px-2.5 py-1 text-[0.6rem] font-bold uppercase tracking-wider text-blanc">
                    Recommandé
                  </span>
                )}
                <h3 className={`mb-1 text-[1.1rem] font-semibold ${plan.highlighted ? "text-blanc" : "text-encre"}`}>
                  {plan.name}
                </h3>
                <p className={`mb-4 text-[0.78rem] ${plan.highlighted ? "text-white/40" : "text-ardoise"}`}>
                  {plan.description}
                </p>
                <div className="flex items-baseline gap-1">
                  <span className={`font-serif text-[2.5rem] font-light italic leading-none ${plan.highlighted ? "text-or" : "text-or-fonce"}`}>
                    {plan.price}
                  </span>
                  <span className={`text-[0.75rem] ${plan.highlighted ? "text-white/30" : "text-ardoise"}`}>
                    {plan.period || "HT/mois"}
                  </span>
                </div>
              </div>

              {/* Features */}
              <div className={`flex-1 border-t p-7 ${plan.highlighted ? "border-white/10" : "border-pierre-12"}`}>
                <ul className="space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature.label} className="flex items-start gap-2.5 text-[0.82rem]">
                      <span className={`mt-0.5 flex-shrink-0 ${feature.included ? "text-or" : plan.highlighted ? "text-white/15" : "text-pierre-25"}`}>
                        {feature.included ? "✓" : "—"}
                      </span>
                      <span className={
                        feature.included
                          ? plan.highlighted ? "text-white/70" : "text-encre-75"
                          : plan.highlighted ? "text-white/20" : "text-pierre-37"
                      }>
                        {feature.label}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* CTA */}
              {plan.cta && (
                <div className="p-7 pt-0">
                  <a
                    href={plan.cta.href}
                    className={`block w-full py-3.5 text-center text-[0.82rem] font-semibold transition-colors ${
                      plan.highlighted
                        ? "bg-or text-blanc hover:bg-[#b08844]"
                        : "border border-pierre-12 text-encre hover:border-or hover:text-or-fonce"
                    }`}
                  >
                    {plan.cta.label}
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
