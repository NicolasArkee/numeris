import Link from "next/link";
import { SIMULATEURS } from "@/app/simulateurs/registry";
import { IconSet, isSupportedIcon } from "./IconSet";
import type { IconName } from "./IconSet";
import { EditorialArrow, EDITORIAL_FOCUS } from "./editorial/EditorialElements";

interface Simulator {
  slug: string;
  title: string;
  description: string;
  href: string;
  badge?: string;
  icon?: string;
}
const defaultSimulators: Simulator[] = SIMULATEURS.slice(0, 4).map((sim) => ({
  slug: sim.slug,
  title: sim.title,
  description: `${sim.metaDescription.split(".")[0]}.`,
  href: `/simulateurs/${sim.slug}`,
  icon: sim.icon,
}));
const simulatorIcons: Record<string, IconName> = {
  charges: "chart",
  statuts: "scale",
  tjm: "euro",
  immobilier: "book",
  honoraires: "euro",
};
interface SimulatorTeaserProps {
  title?: string;
  subtitle?: string;
  simulators?: Simulator[];
}

export function SimulatorTeaser({
  title = "Nos outils gratuits",
  subtitle = "Faites une première estimation, puis identifiez les hypothèses à vérifier avec un professionnel.",
  simulators = defaultSimulators,
}: SimulatorTeaserProps) {
  return (
    <section className="mb-12 rounded-[1.75rem] bg-navy p-6 sm:p-9">
      <div className="mb-8 grid gap-5 lg:grid-cols-[1fr_.85fr] lg:items-end lg:gap-10">
        <div>
          <p className="mb-4 text-xs font-bold uppercase tracking-[.14em] text-mint">
            Passer aux chiffres
          </p>
          <h2 className="font-display text-[clamp(1.6rem,3vw,2.5rem)] font-bold leading-[1.1] tracking-[-.04em] text-white">
            {title}
          </h2>
        </div>
        <p className="max-w-xl text-base leading-7 text-white/75">{subtitle}</p>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {simulators.map((sim, i) => (
          <Link
            key={sim.href}
            href={sim.href}
            className={`group flex min-w-0 flex-col rounded-[1.4rem] p-5 transition-colors hover:bg-white sm:p-6 ${EDITORIAL_FOCUS} ${i % 2 ? "bg-mint" : "bg-lilac"}`}
          >
            <div className="mb-5 flex items-center justify-between gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/75 text-blue">
                <IconSet
                  name={
                    sim.icon && isSupportedIcon(sim.icon)
                      ? sim.icon
                      : (simulatorIcons[sim.slug] ?? "chart")
                  }
                  size={24}
                />
              </span>
              {sim.badge && (
                <span className="rounded-full bg-white/75 px-3 py-1 text-xs font-bold text-blue">
                  {sim.badge}
                </span>
              )}
              <EditorialArrow className="ml-auto text-blue transition-transform group-hover:translate-x-1" />
            </div>
            <h3 className="font-display text-xl font-bold leading-tight tracking-[-.025em] text-ink">
              {sim.title}
            </h3>
            <p className="mt-3 flex-1 text-sm leading-6 text-ink-muted">
              {sim.description}
            </p>
            <span className="mt-5 text-sm font-bold text-blue">
              Ouvrir le simulateur
            </span>
          </Link>
        ))}
      </div>
      <Link
        href="/simulateurs"
        className={`mt-7 inline-flex min-h-11 items-center gap-3 rounded-full border border-white/30 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-white/10 ${EDITORIAL_FOCUS}`}
      >
        Tous les simulateurs <EditorialArrow />
      </Link>
    </section>
  );
}
