import { IconSet, isSupportedIcon } from "./IconSet";

interface Benefit {
  icon: string;
  title: string;
  description: string;
}

interface BenefitsGridProps {
  title?: string;
  benefits: Benefit[];
  columns?: 2 | 3 | 4;
}

export function BenefitsGrid({
  title,
  benefits,
  columns = 3,
}: BenefitsGridProps) {
  const gridCols = {
    2: "md:grid-cols-2",
    3: "md:grid-cols-2 lg:grid-cols-3",
    4: "md:grid-cols-2 lg:grid-cols-4",
  }[columns];

  return (
    <div className="mb-12">
      {title && (
        <h2 className="mb-6 font-display text-[1.25rem] font-bold text-ink">
          {title}
        </h2>
      )}
      <div className={`grid gap-4 ${gridCols}`}>
        {benefits.map((b) => {
          const iconName = isSupportedIcon(b.icon) ? b.icon : "target";
          return (
            <div
              key={b.title}
              className="border border-border-soft bg-surface p-6 transition-colors hover:border-accent-500"
            >
              <span className="mb-3 inline-flex h-9 w-9 items-center justify-center text-accent-700">
                <IconSet name={iconName} size={32} />
              </span>
              <h3 className="mb-1.5 text-[0.95rem] font-semibold text-ink">
                {b.title}
              </h3>
              <p className="text-[0.9rem] leading-relaxed text-ink-muted">
                {b.description}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
