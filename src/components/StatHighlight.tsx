interface Stat {
  value: string;
  label: string;
  detail?: string;
}

interface StatHighlightProps {
  stats: Stat[];
  variant?: "inline" | "cards";
}

export function StatHighlight({
  stats,
  variant = "inline",
}: StatHighlightProps) {
  if (variant === "cards") {
    return (
      <div className="mb-12 grid gap-4 md:grid-cols-3">
        {stats.map((s) => (
          <div
            key={s.label}
            className="border border-pierre-12 bg-blanc p-6 text-center"
          >
            <span className="block font-serif text-[2.5rem] font-light italic leading-none text-or-fonce">
              {s.value}
            </span>
            <span className="mt-2 block text-[0.85rem] font-medium text-encre">
              {s.label}
            </span>
            {s.detail && (
              <span className="mt-1 block text-[0.72rem] text-ardoise">
                {s.detail}
              </span>
            )}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="mb-12 flex flex-wrap items-center justify-center gap-6 border border-pierre-12 bg-blanc px-6 py-8 md:justify-between md:px-10">
      {stats.map((s, i) => (
        <div key={s.label} className="flex items-center gap-6">
          <div className="text-center">
            <span className="block font-serif text-[2rem] font-light italic leading-none text-or-fonce">
              {s.value}
            </span>
            <span className="mt-1 block text-[0.75rem] text-ardoise">
              {s.label}
            </span>
          </div>
          {i < stats.length - 1 && (
            <div className="hidden h-10 w-px bg-pierre-12 md:block" />
          )}
        </div>
      ))}
    </div>
  );
}
