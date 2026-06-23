import { AppConfig } from "@/utils/AppConfig";

interface TrustItem {
  icon: string;
  label: string;
  value: string;
}

const defaultItems: TrustItem[] = [
  { icon: "◇", value: "Indépendant", label: "Pas un cabinet" },
  { icon: "◌", value: "Sources", label: "Données publiques" },
  { icon: "↔", value: "Comparer", label: "Méthode transparente" },
  { icon: "✓", value: `${new Date().getFullYear() - AppConfig.foundedYear} ans`, label: "Veille éditoriale" },
];

interface TrustBarProps {
  items?: TrustItem[];
  variant?: "light" | "dark" | "gold";
}

export function TrustBar({ items = defaultItems, variant = "light" }: TrustBarProps) {
  const styles = {
    light: {
      bg: "bg-surface border-b border-border-soft",
      value: "text-ink",
      label: "text-ink-muted",
      divider: "bg-border-soft",
    },
    dark: {
      bg: "bg-brand-ink border-b border-white/10",
      value: "text-surface",
      label: "text-white/40",
      divider: "bg-white/10",
    },
    gold: {
      bg: "bg-accent-50 border-b border-accent-300",
      value: "text-accent-700",
      label: "text-ink-muted",
      divider: "bg-accent-300",
    },
  }[variant];

  return (
    <section className={styles.bg}>
      <div className="mx-auto flex max-w-[82rem] flex-wrap items-center justify-center gap-6 px-6 py-4 lg:justify-between lg:px-[4.5rem]">
        {items.map((item, i) => (
          <div key={item.label} className="flex items-center gap-6">
            <div className="flex items-center gap-2.5">
              <span className="text-[1rem]">{item.icon}</span>
              <div className="flex items-baseline gap-1.5">
                <span className={`text-[0.88rem] font-semibold ${styles.value}`}>
                  {item.value}
                </span>
                <span className={`text-[0.72rem] ${styles.label}`}>
                  {item.label}
                </span>
              </div>
            </div>
            {i < items.length - 1 && (
              <div className={`hidden h-4 w-px lg:block ${styles.divider}`} />
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
