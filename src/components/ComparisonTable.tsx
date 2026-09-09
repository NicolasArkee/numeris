import { EditorialArrow, EditorialCheck } from "./editorial/EditorialElements";

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
  const cols =
    plans.length === 2
      ? "md:grid-cols-2"
      : plans.length === 3
        ? "md:grid-cols-2 lg:grid-cols-3"
        : "md:grid-cols-2 xl:grid-cols-4";
  return (
    <section className="bg-paper px-5 py-16 sm:px-8 lg:py-24">
      <div className="mx-auto max-w-[80rem]">
        <div className="mb-10 max-w-3xl">
          <p className="mb-4 text-xs font-bold uppercase tracking-[.14em] text-blue">
            Comparer les formules
          </p>
          <h2 className="font-display text-[clamp(1.8rem,3vw,3rem)] font-bold leading-[1.1] tracking-[-.04em] text-ink">
            {title}
          </h2>
          {subtitle && (
            <p className="mt-5 text-base leading-7 text-ink-muted">
              {subtitle}
            </p>
          )}
        </div>
        <div className={`grid gap-4 ${cols}`}>
          {plans.map((plan) => (
            <article
              key={plan.name}
              className={`flex min-w-0 flex-col overflow-hidden rounded-[1.75rem] ${plan.highlighted ? "bg-navy" : "border border-ink/10 bg-white"}`}
            >
              <div className="p-6 sm:p-7">
                <h3
                  className={`font-display text-2xl font-bold tracking-[-.03em] ${plan.highlighted ? "text-white" : "text-ink"}`}
                >
                  {plan.name}
                </h3>
                <p
                  className={`mt-3 text-sm leading-6 ${plan.highlighted ? "text-white/75" : "text-ink-muted"}`}
                >
                  {plan.description}
                </p>
                <div className="mt-7 flex flex-wrap items-baseline gap-x-2 gap-y-1">
                  <span
                    className={`break-words font-display text-4xl font-bold not-italic tracking-[-.04em] ${plan.highlighted ? "text-mint" : "text-blue"}`}
                  >
                    {plan.price}
                  </span>
                  <span
                    className={`text-sm ${plan.highlighted ? "text-white/75" : "text-ink-muted"}`}
                  >
                    {plan.period || "HT/mois"}
                  </span>
                </div>
              </div>
              <div
                className={`flex-1 border-t p-6 sm:p-7 ${plan.highlighted ? "border-white/15" : "border-ink/10"}`}
              >
                <ul className="space-y-4">
                  {plan.features.map((feature) => (
                    <li
                      key={feature.label}
                      className="flex items-start gap-3 text-sm leading-6"
                    >
                      <span
                        aria-hidden="true"
                        className={`mt-0.5 shrink-0 ${plan.highlighted ? "text-mint" : "text-blue"}`}
                      >
                        {feature.included ? (
                          <EditorialCheck className="h-5 w-5" />
                        ) : (
                          <span className="inline-block w-5 text-center">
                            —
                          </span>
                        )}
                      </span>
                      <span
                        className={
                          plan.highlighted ? "text-white/80" : "text-ink-muted"
                        }
                      >
                        <span className="sr-only">
                          {feature.included ? "Inclus : " : "Non inclus : "}
                        </span>
                        {feature.label}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
              {plan.cta && (
                <div className="p-6 pt-0 sm:p-7 sm:pt-0">
                  <a
                    href={plan.cta.href}
                    {...(plan.cta.href.startsWith("http")
                      ? { rel: "sponsored nofollow noopener", target: "_blank" }
                      : {})}
                    className={`inline-flex min-h-12 w-full items-center justify-between gap-4 rounded-full px-5 py-3 text-sm font-bold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue ${plan.highlighted ? "bg-mint text-navy hover:bg-white" : "bg-blue text-white hover:bg-navy"}`}
                  >
                    {plan.cta.label}
                    <EditorialArrow className="shrink-0" />
                  </a>
                </div>
              )}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
