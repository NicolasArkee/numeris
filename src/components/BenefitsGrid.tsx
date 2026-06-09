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
        <h2 className="mb-6 font-serif text-[1.25rem] font-light text-encre">
          {title}
        </h2>
      )}
      <div className={`grid gap-4 ${gridCols}`}>
        {benefits.map((b) => {
          const iconName = isSupportedIcon(b.icon) ? b.icon : "target";
          return (
            <div
              key={b.title}
              className="border border-pierre-12 bg-blanc p-6 transition-colors hover:border-or"
            >
              <span className="mb-3 inline-flex h-9 w-9 items-center justify-center text-or-fonce">
                <IconSet name={iconName} size={32} />
              </span>
              <h3 className="mb-1.5 text-[0.95rem] font-semibold text-encre">
                {b.title}
              </h3>
              <p className="text-[0.9rem] leading-relaxed text-ardoise">
                {b.description}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
