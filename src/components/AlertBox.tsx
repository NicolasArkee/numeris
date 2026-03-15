interface AlertBoxProps {
  type?: "info" | "warning" | "tip" | "important";
  title?: string;
  children: string;
}

const config = {
  info: {
    icon: "ℹ",
    border: "border-l-[#3b82f6]",
    bg: "bg-[#eff6ff]",
    iconColor: "text-[#3b82f6]",
    titleColor: "text-[#1e40af]",
    label: "Information",
  },
  warning: {
    icon: "⚠",
    border: "border-l-or",
    bg: "bg-or-pale",
    iconColor: "text-or-fonce",
    titleColor: "text-or-fonce",
    label: "Attention",
  },
  tip: {
    icon: "💡",
    border: "border-l-[#22c55e]",
    bg: "bg-[#f0fdf4]",
    iconColor: "text-[#22c55e]",
    titleColor: "text-[#166534]",
    label: "Conseil",
  },
  important: {
    icon: "📌",
    border: "border-l-encre",
    bg: "bg-blanc",
    iconColor: "text-encre",
    titleColor: "text-encre",
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
      className={`mb-12 border border-pierre-12 border-l-[3px] ${c.border} ${c.bg} p-6`}
      role="note"
    >
      <div className="mb-2 flex items-center gap-2">
        <span className={c.iconColor}>{c.icon}</span>
        <span className={`text-[0.75rem] font-bold uppercase tracking-[0.08em] ${c.titleColor}`}>
          {title || c.label}
        </span>
      </div>
      <p className="text-[0.85rem] leading-relaxed text-encre-75">
        {children}
      </p>
    </div>
  );
}
