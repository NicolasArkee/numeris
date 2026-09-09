import { RichText } from "./RichText";
import { IconSet } from "./IconSet";

interface AlertBoxProps {
  type?: "info" | "warning" | "tip" | "important";
  title?: string;
  children: string;
}
const config = {
  info: { bg: "bg-lilac", icon: "book", label: "Information" },
  warning: { bg: "bg-apricot", icon: "shield", label: "Attention" },
  tip: { bg: "bg-mint", icon: "target", label: "Conseil" },
  important: { bg: "bg-paper", icon: "scale", label: "Important" },
};

export function AlertBox({ type = "info", title, children }: AlertBoxProps) {
  const style = config[type];
  return (
    <aside
      className={`mb-12 rounded-[1.75rem] p-6 sm:p-8 ${style.bg}`}
      role="note"
    >
      <div className="flex flex-col gap-5 sm:flex-row sm:gap-6">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-navy text-white">
          <IconSet name={style.icon} size={25} />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="mb-3 font-display text-xl font-bold leading-tight tracking-[-.025em] text-ink">
            {title || style.label}
          </h3>
          <RichText text={children} className="max-w-none" />
        </div>
      </div>
    </aside>
  );
}
