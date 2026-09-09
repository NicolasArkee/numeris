import { IconSet, isSupportedIcon } from "./IconSet";
import { EDITORIAL_HEADING } from "./editorial/EditorialElements";

interface Benefit {
  icon: string;
  title: string;
  description: string;
}
interface BenefitsGridProps {
  title?: string;
  intro?: string;
  benefits: Benefit[];
  columns?: 2 | 3 | 4;
}
const tones = ["bg-lilac", "bg-mint", "bg-apricot", "bg-paper"];

export function BenefitsGrid({
  title,
  intro,
  benefits,
  columns = 3,
}: BenefitsGridProps) {
  const gridCols = {
    2: "md:grid-cols-2",
    3: "md:grid-cols-2 lg:grid-cols-3",
    4: "md:grid-cols-2 lg:grid-cols-4",
  }[columns];
  return (
    <section className="mb-12 min-w-0">
      {title && <h2 className={`mb-7 ${EDITORIAL_HEADING}`}>{title}</h2>}
      {intro && (
        <p className="mb-7 max-w-3xl text-base leading-7 text-ink-muted">
          {intro}
        </p>
      )}
      <div className={`grid gap-4 ${gridCols}`}>
        {benefits.map((benefit, i) => (
          <article
            key={`${benefit.title}-${i}`}
            className={`min-w-0 rounded-[1.5rem] p-6 sm:p-7 ${tones[i % tones.length]}`}
          >
            <div className="mb-6 flex items-center justify-between gap-4">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white/75 text-blue">
                <IconSet
                  name={isSupportedIcon(benefit.icon) ? benefit.icon : "target"}
                  size={25}
                />
              </span>
              <span
                aria-hidden="true"
                className="font-mono text-xs text-ink-muted"
              >
                {String(i + 1).padStart(2, "0")}
              </span>
            </div>
            <h3 className="font-display text-[1.2rem] font-bold not-italic leading-tight tracking-[-.025em] text-ink">
              {benefit.title}
            </h3>
            {benefit.description && benefit.description !== benefit.title && (
              <p className="mt-3 text-[.95rem] leading-7 text-ink-muted">
                {benefit.description}
              </p>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
