interface ChecklistProps {
  title?: string;
  items: string[];
  variant?: "check" | "arrow" | "star";
  columns?: 1 | 2;
}

export function Checklist({
  title,
  items,
  variant = "check",
  columns = 1,
}: ChecklistProps) {
  const icon = { check: "✓", arrow: "→", star: "★" }[variant];
  const iconColor = { check: "text-accent-500", arrow: "text-accent-700", star: "text-accent-500" }[variant];

  return (
    <div className="mb-12 border border-border-soft bg-surface p-7">
      {title && (
        <h2 className="mb-5 font-display text-[1.15rem] font-bold text-ink">
          {title}
        </h2>
      )}
      <ul
        className={`space-y-3 ${columns === 2 ? "md:columns-2 md:gap-8" : ""}`}
      >
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2.5 break-inside-avoid">
            <span className={`mt-0.5 flex-shrink-0 text-[0.78rem] font-bold ${iconColor}`}>
              {icon}
            </span>
            <span className="text-base leading-relaxed text-ink-muted">
              {item}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
