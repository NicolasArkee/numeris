export interface Stat {
  value: string;
  label: string;
  detail?: string;
}

interface StatHighlightProps {
  stats: Stat[];
  /** inline = bande bordée centrée · cards = cartes · band = grille pleine
   *  largeur 2/4 colonnes (markup historique de StatsBand homepage). */
  variant?: "inline" | "cards" | "band";
}

export function StatHighlight({
  stats,
  variant = "inline",
}: StatHighlightProps) {
  if (variant === "band") {
    return (
      <div className="grid grid-cols-2 gap-0 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <div
            key={stat.label}
            className={`px-2 py-2 text-center lg:px-10 ${i < stats.length - 1 ? "lg:border-r lg:border-border-soft" : ""} ${i === 0 ? "lg:text-left" : ""}`}
          >
            <span className="block font-display text-[3rem] font-bold italic leading-none text-accent-500">
              {stat.value}
            </span>
            <span className="mt-1 text-[0.78rem] text-ink-muted">
              {stat.label}
            </span>
          </div>
        ))}
      </div>
    );
  }

  if (variant === "cards") {
    return (
      <div className="mb-12 grid gap-4 md:grid-cols-3">
        {stats.map((s) => (
          <div
            key={s.label}
            className="border border-border-soft bg-surface p-6 text-center"
          >
            <span className="block font-display text-[2.5rem] font-bold italic leading-none text-accent-700">
              {s.value}
            </span>
            <span className="mt-2 block text-[0.85rem] font-medium text-ink">
              {s.label}
            </span>
            {s.detail && (
              <span className="mt-1 block text-[0.72rem] text-ink-muted">
                {s.detail}
              </span>
            )}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="mb-12 flex flex-wrap items-center justify-center gap-6 border border-border-soft bg-surface px-6 py-8 md:justify-between md:px-10">
      {stats.map((s, i) => (
        <div key={s.label} className="flex items-center gap-6">
          <div className="text-center">
            <span className="block font-display text-[2rem] font-bold italic leading-none text-accent-700">
              {s.value}
            </span>
            <span className="mt-1 block text-[0.75rem] text-ink-muted">
              {s.label}
            </span>
          </div>
          {i < stats.length - 1 && (
            <div className="hidden h-10 w-px bg-border-soft md:block" />
          )}
        </div>
      ))}
    </div>
  );
}
