import Link from "next/link";
import { Icon } from "./Icon";

interface Simulator {
  slug: string;
  title: string;
  description: string;
  href: string;
  badge?: string;
}

const defaultSimulators: Simulator[] = [
  {
    slug: "charges",
    title: "Simulateur de charges",
    description: "Estimez vos cotisations sociales selon votre statut et votre rémunération.",
    href: "/simulateurs/charges",
    badge: "Populaire",
  },
  {
    slug: "statuts",
    title: "Comparateur de statuts",
    description: "SASU, EURL, auto-entrepreneur : quel statut est le plus avantageux pour vous ?",
    href: "/simulateurs/statuts",
  },
  {
    slug: "tjm",
    title: "Calcul du TJM",
    description: "Calculez votre taux journalier moyen idéal selon vos objectifs de revenus.",
    href: "/simulateurs/tjm",
  },
  {
    slug: "immobilier",
    title: "Simulateur LMNP",
    description: "Micro-BIC ou régime réel avec amortissement : comparez la fiscalité de votre meublé.",
    href: "/simulateurs/immobilier",
  },
];

interface SimulatorTeaserProps {
  title?: string;
  subtitle?: string;
  simulators?: Simulator[];
}

export function SimulatorTeaser({
  title = "Nos outils gratuits",
  subtitle = "Faites vos premières estimations en quelques clics. Nos simulateurs sont conçus pour vous aider à prendre les bonnes décisions.",
  simulators = defaultSimulators,
}: SimulatorTeaserProps) {
  return (
    <section className="bg-surface px-6 py-24 lg:px-[4.5rem]">
      <div className="mx-auto max-w-[82rem]">
        <div className="mb-14 max-w-2xl">
          <div className="mb-5 flex items-center gap-3.5">
            <span className="block h-px w-6 flex-shrink-0 bg-accent-500" />
            <span className="text-[0.65rem] font-bold uppercase tracking-[0.14em] text-accent-700">
              Simulateurs
            </span>
          </div>
          <h2 className="mb-4 font-display text-[2.25rem] font-bold leading-[1.15] tracking-tight text-ink lg:text-[2.75rem]">
            {title}
          </h2>
          <p className="text-[0.95rem] leading-relaxed text-ink-muted">{subtitle}</p>
        </div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {simulators.map((sim) => (
            <Link
              key={sim.href}
              href={sim.href}
              className="group relative border border-border-soft bg-surface p-7 transition-all hover:-translate-y-0.5 hover:border-accent-500 hover:shadow-lg"
            >
              {sim.badge && (
                <span className="absolute right-4 top-4 bg-accent-300 px-2 py-0.5 text-[0.6rem] font-semibold tracking-wide text-accent-700">
                  {sim.badge}
                </span>
              )}
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-md border border-brand-100 bg-brand-50 text-brand-700 transition-colors group-hover:border-accent-300 group-hover:bg-accent-50 group-hover:text-accent-700">
                <Icon name={sim.slug} size={22} />
              </div>
              <h3 className="mb-2 text-[0.95rem] font-semibold text-ink transition-colors group-hover:text-accent-700">
                {sim.title}
              </h3>
              <p className="text-[0.78rem] leading-relaxed text-ink-muted">
                {sim.description}
              </p>
              <span className="mt-4 block text-[0.75rem] font-medium text-accent-700 opacity-0 transition-opacity group-hover:opacity-100">
                Accéder au simulateur →
              </span>
            </Link>
          ))}
        </div>

        <div className="mt-8">
          <Link
            href="/simulateurs"
            className="inline-flex items-center gap-2 text-[0.85rem] font-medium text-accent-700 transition-colors hover:text-accent-500"
          >
            Tous nos outils gratuits →
          </Link>
        </div>
      </div>
    </section>
  );
}
