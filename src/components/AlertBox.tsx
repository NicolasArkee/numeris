interface AlertBoxProps {
  type?: "info" | "warning" | "tip" | "important";
  title?: string;
  children: string;
}

const config = {
  info: {
    icon: "ℹ",
    border: "border-l-brand-500",
    bg: "bg-brand-50",
    iconColor: "text-brand-500",
    titleColor: "text-brand-700",
    label: "Information",
  },
  warning: {
    icon: "⚠",
    border: "border-l-warning-500",
    bg: "bg-warning-50",
    iconColor: "text-warning-700",
    titleColor: "text-warning-700",
    label: "Attention",
  },
  tip: {
    icon: "💡",
    border: "border-l-success-500",
    bg: "bg-success-50",
    iconColor: "text-success-500",
    titleColor: "text-success-700",
    label: "Conseil",
  },
  important: {
    icon: "📌",
    border: "border-l-ink",
    bg: "bg-surface",
    iconColor: "text-ink",
    titleColor: "text-ink",
    label: "Important",
  },
};

export function AlertBox({
  type = "info",
  title,
  children,
}: AlertBoxProps) {
  const c = config[type];

  return (
    <div
      className={`mb-12 rounded-md border border-border-soft border-l-[3px] ${c.border} ${c.bg} p-6`}
      role="note"
    >
      <div className="mb-2 flex items-center gap-2">
        <span className={c.iconColor}>{c.icon}</span>
        <span className={`font-display text-[0.75rem] font-bold uppercase tracking-[0.08em] ${c.titleColor}`}>
          {title || c.label}
        </span>
      </div>
      <p className="max-w-prose text-base leading-relaxed text-ink-muted">
        {children}
      </p>
    </div>
  );
}
