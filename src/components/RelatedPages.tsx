import Link from "next/link";

export interface RelatedPageLink {
  href: string;
  label: string;
  description?: string | null;
}

/** Contextual navigation shared by editorial pages and activity landings. */
export function RelatedPages({
  title,
  eyebrow = "Poursuivre votre recherche",
  description,
  links,
}: {
  title: string;
  eyebrow?: string;
  description?: string;
  links: RelatedPageLink[];
}) {
  if (!links.length) return null;

  return (
    <section className="my-8 overflow-hidden rounded-[1.75rem] border border-ink/10 bg-white" aria-label={title}>
      <div className="grid lg:grid-cols-[.7fr_1.3fr]">
        <div className="bg-navy p-6 text-white sm:p-9">
          <p className="font-mono text-[.65rem] font-bold uppercase tracking-[.16em] text-[#ffb293]">{eyebrow}</p>
          <h2 className="mt-5 max-w-[18ch] text-balance text-[clamp(1.9rem,3.5vw,2.8rem)] font-semibold leading-[1.08]">{title}</h2>
          {description && <p className="mt-5 max-w-xl text-[.88rem] leading-7 text-white/72">{description}</p>}
          <span aria-hidden className="mt-8 grid h-12 w-12 place-items-center rounded-full border border-white/25 text-xl text-[#ffb293]">↗</span>
        </div>
        <ul className="grid content-start gap-2 p-3 sm:grid-cols-2 sm:p-5">
          {links.map((link, index) => (
            <li key={link.href} className="min-w-0">
              <Link href={link.href} className="group flex h-full min-h-24 items-start gap-3 rounded-2xl p-4 transition-colors hover:bg-lilac focus-visible:bg-lilac">
                <span aria-hidden className="mt-1 font-mono text-[.61rem] font-bold text-blue">{String(index + 1).padStart(2, "0")}</span>
                <div className="min-w-0 flex-1">
                  <h3 className="text-[.96rem] font-bold leading-6 text-navy [overflow-wrap:anywhere]">{link.label}</h3>
                  {link.description && <p className="mt-2 text-[.77rem] leading-6 text-ink-muted">{link.description}</p>}
                </div>
                <span aria-hidden className="mt-0.5 text-blue transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5">↗</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
