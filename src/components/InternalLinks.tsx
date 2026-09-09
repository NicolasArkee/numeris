import Link from "next/link";
import type { LinkGroup } from "@/libs/db";

const GROUP_TONES = [
  "bg-white text-navy",
  "bg-mint text-navy",
  "bg-apricot text-navy",
  "bg-lilac text-navy",
] as const;

export function InternalLinks({ groups }: { groups: LinkGroup[] }) {
  if (groups.length === 0) return null;

  return (
    <nav aria-labelledby="related-links-title" className="overflow-hidden rounded-[1.75rem] bg-navy p-5 text-white sm:p-8 lg:p-10">
      <div className="mb-9 grid gap-5 lg:grid-cols-[1fr_.55fr] lg:items-end">
        <div>
          <p className="text-[.64rem] font-bold uppercase tracking-[.2em] text-[#ffb293]">Continuer sans repartir de zéro</p>
          <h2 id="related-links-title" className="mt-4 max-w-3xl text-balance text-[clamp(2.1rem,4.2vw,3.75rem)] font-semibold leading-[1.02] tracking-[-.04em]">
            Prolongez votre comparaison avec le bon contexte.
          </h2>
        </div>
        <p className="max-w-xl text-[.84rem] leading-7 text-white/66 lg:justify-self-end">
          Passez d’une mission à un secteur proche, ou explorez une autre activité en conservant la même méthode de lecture.
        </p>
      </div>

      <div className={`grid gap-3 ${groups.length === 1 ? "" : "md:grid-cols-2"} ${groups.length >= 3 ? "lg:grid-cols-3" : ""}`}>
        {groups.map((group, groupIndex) => (
          <section key={group.title} className={`rounded-[1.3rem] p-5 sm:p-6 ${GROUP_TONES[groupIndex % GROUP_TONES.length]}`}>
            <div className="flex items-start justify-between gap-5 border-b border-current/14 pb-5">
              <h3 className="max-w-[18rem] text-[1rem] font-semibold leading-snug tracking-[-.02em]">{group.title}</h3>
              <span className="rounded-full border border-current/15 px-2.5 py-1 font-mono text-[.62rem] opacity-60">
                {String(group.links.length).padStart(2, "0")}
              </span>
            </div>
            <ol className="mt-2">
              {group.links.map((link, linkIndex) => (
                <li key={link.href}>
                  <Link href={link.href} className="group flex items-center gap-3 border-b border-current/12 py-4 text-[.82rem] font-medium last:border-b-0 hover:text-blue">
                    <span className="font-mono text-[.61rem] opacity-42">{String(linkIndex + 1).padStart(2, "0")}</span>
                    <span className="min-w-0 flex-1">{link.label}</span>
                    <span aria-hidden className="transition-transform group-hover:translate-x-1">→</span>
                  </Link>
                </li>
              ))}
            </ol>
          </section>
        ))}
      </div>
    </nav>
  );
}
