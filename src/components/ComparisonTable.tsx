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
    <section className="bg-bg px-6 py-24 lg:px-[4.5rem]">
      <div className="mx-auto max-w-[82rem]">
        <div className="mb-14 max-w-2xl">
          <div className="mb-5 flex items-center gap-3.5">
            <span className="block h-px w-6 flex-shrink-0 bg-accent-500" />
            <span className="text-[0.65rem] font-bold uppercase tracking-[0.14em] text-accent-700">
              Tarifs
            </span>
          </div>
          <h2 className="mb-4 font-display text-[2.25rem] font-bold leading-[1.15] tracking-tight text-ink lg:text-[2.75rem]">
            {title}
          </h2>
          {subtitle && (
            <p className="text-[0.95rem] leading-relaxed text-ink-muted">{subtitle}</p>
          )}
        </div>

        {/* Mobile: stacked cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`flex flex-col ${
                plan.highlighted
                  ? "border-t-2 border-t-accent-500 bg-brand-ink text-surface"
                  : "border border-border-soft bg-surface"
              }`}
            >
              {/* Header */}
              <div className={`p-7 ${plan.highlighted ? "" : ""}`}>
                {plan.highlighted && (
                  <span className="mb-3 inline-block bg-accent-500 px-2.5 py-1 text-[0.6rem] font-bold uppercase tracking-wider text-brand-ink">
                    Recommandé
                  </span>
                )}
                <h3 className={`mb-1 text-[1.1rem] font-semibold ${plan.highlighted ? "text-surface" : "text-ink"}`}>
                  {plan.name}
                </h3>
                <p className={`mb-4 text-[0.78rem] ${plan.highlighted ? "text-white/40" : "text-ink-muted"}`}>
                  {plan.description}
                </p>
                <div className="flex items-baseline gap-1">
                  <span className={`font-display text-[2.5rem] font-bold italic leading-none ${plan.highlighted ? "text-accent-500" : "text-accent-700"}`}>
                    {plan.price}
                  </span>
                  <span className={`text-[0.75rem] ${plan.highlighted ? "text-white/30" : "text-ink-muted"}`}>
                    {plan.period || "HT/mois"}
                  </span>
                </div>
              </div>

              {/* Features */}
              <div className={`flex-1 border-t p-7 ${plan.highlighted ? "border-white/10" : "border-border-soft"}`}>
                <ul className="space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature.label} className="flex items-start gap-2.5 text-[0.82rem]">
                      <span className={`mt-0.5 flex-shrink-0 ${feature.included ? "text-accent-500" : plan.highlighted ? "text-white/15" : "text-border"}`}>
                        {feature.included ? "✓" : "—"}
                      </span>
                      <span className={
                        feature.included
                          ? plan.highlighted ? "text-white/70" : "text-ink-muted"
                          : plan.highlighted ? "text-white/20" : "text-ink-soft"
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
                    {...(plan.cta.href.startsWith("http")
                      ? { rel: "sponsored nofollow noopener", target: "_blank" }
                      : {})}
                    className={`block w-full py-3.5 text-center text-[0.82rem] font-semibold transition-colors ${
                      plan.highlighted
                        ? "bg-accent-500 text-brand-ink hover:bg-accent-700"
                        : "border border-border-soft text-ink hover:border-accent-500 hover:text-accent-700"
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
