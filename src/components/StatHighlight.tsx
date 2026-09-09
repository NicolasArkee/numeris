export interface Stat {
  value: string;
  label: string;
  detail?: string;
}
interface StatHighlightProps {
  stats: Stat[];
  variant?: "inline" | "cards" | "band";
}

export function StatHighlight({
  stats,
  variant = "inline",
}: StatHighlightProps) {
  if (!stats.length) return null;
  const band = variant === "band";
  const grid =
    stats.length === 1
      ? ""
      : stats.length === 2
        ? "sm:grid-cols-2"
        : stats.length === 3
          ? "sm:grid-cols-3"
          : "sm:grid-cols-2 lg:grid-cols-4";
  return (
    <dl
      className={`mb-12 grid min-w-0 gap-3 ${grid} ${band ? "rounded-[1.75rem] bg-navy p-4 sm:p-6" : variant === "inline" ? "rounded-[1.75rem] bg-lilac p-4 sm:p-6" : ""}`}
    >
      {stats.map((stat, i) => (
        <div
          key={`${stat.label}-${i}`}
          className={`flex min-w-0 flex-col rounded-[1.3rem] p-5 sm:p-6 ${band ? "bg-white/[.06]" : variant === "cards" ? (i % 3 === 0 ? "bg-lilac" : i % 3 === 1 ? "bg-mint" : "bg-apricot") : "bg-white/65"}`}
        >
          <dd
            className={`order-first break-words font-display text-[clamp(1.7rem,3.5vw,2.8rem)] font-bold not-italic leading-[1.06] tracking-[-.04em] ${band ? "text-mint" : "text-blue"}`}
          >
            {stat.value}
          </dd>
          <dt
            className={`mt-4 text-base font-bold leading-6 ${band ? "text-white" : "text-ink"}`}
          >
            {stat.label}
          </dt>
          {stat.detail && (
            <dd
              className={`mt-2 text-sm leading-6 ${band ? "text-white/75" : "text-ink-muted"}`}
            >
              {stat.detail}
            </dd>
          )}
        </div>
      ))}
    </dl>
  );
}
