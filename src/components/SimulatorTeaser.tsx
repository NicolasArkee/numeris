import Link from "next/link";

interface Simulator {
  icon: string;
  title: string;
  description: string;
  href: string;
  badge?: string;
}

const defaultSimulators: Simulator[] = [
  {
    icon: "🧮",
    title: "Simulateur de charges",
    description: "Estimez vos cotisations sociales selon votre statut et votre rémunération.",
    href: "/simulateurs/charges",
    badge: "Populaire",
  },
  {
    icon: "💰",
    title: "Comparateur de statuts",
    description: "SASU, EURL, auto-entrepreneur : quel statut est le plus avantageux pour vous ?",
    href: "/simulateurs/statuts",
  },
  {
    icon: "📊",
    title: "Calcul du TJM",
    description: "Calculez votre taux journalier moyen idéal selon vos objectifs de revenus.",
    href: "/simulateurs/tjm",
  },
  {
    icon: "🏠",
    title: "Simulateur LMNP / SCI",
    description: "Estimez la fiscalité de votre investissement immobilier en LMNP ou SCI.",
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
    <section className="bg-blanc px-6 py-24 lg:px-[4.5rem]">
      <div className="mx-auto max-w-[82rem]">
        <div className="mb-14 max-w-2xl">
          <div className="mb-5 flex items-center gap-3.5">
            <span className="block h-px w-6 flex-shrink-0 bg-or" />
            <span className="text-[0.65rem] font-bold uppercase tracking-[0.14em] text-or-fonce">
              Simulateurs
            </span>
          </div>
          <h2 className="mb-4 font-serif text-[2.25rem] font-light leading-[1.15] tracking-tight text-encre lg:text-[2.75rem]">
            {title}
          </h2>
          <p className="text-[0.95rem] leading-relaxed text-ardoise">{subtitle}</p>
        </div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {simulators.map((sim) => (
            <Link
              key={sim.href}
              href={sim.href}
              className="group relative border border-pierre-12 bg-blanc p-7 transition-all hover:-translate-y-0.5 hover:border-or hover:shadow-lg"
            >
              {sim.badge && (
                <span className="absolute right-4 top-4 bg-or-clair px-2 py-0.5 text-[0.6rem] font-semibold tracking-wide text-or-fonce">
                  {sim.badge}
                </span>
              )}
              <span className="mb-4 block text-[1.5rem]">{sim.icon}</span>
              <h3 className="mb-2 text-[0.95rem] font-semibold text-encre transition-colors group-hover:text-or-fonce">
                {sim.title}
              </h3>
              <p className="text-[0.78rem] leading-relaxed text-ardoise">
                {sim.description}
              </p>
              <span className="mt-4 block text-[0.75rem] font-medium text-or-fonce opacity-0 transition-opacity group-hover:opacity-100">
                Accéder au simulateur →
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
