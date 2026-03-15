import { AppConfig } from "@/utils/AppConfig";

interface TrustItem {
  icon: string;
  label: string;
  value: string;
}

const defaultItems: TrustItem[] = [
  { icon: "⭐", value: "4.9/5", label: "Google (120+ avis)" },
  { icon: "🏛", value: "OEC", label: "Inscrit à l'Ordre" },
  { icon: "👥", value: "500+", label: "Clients accompagnés" },
  { icon: "📅", value: `${new Date().getFullYear() - AppConfig.foundedYear} ans`, label: "D'expérience" },
];

interface TrustBarProps {
  items?: TrustItem[];
  variant?: "light" | "dark" | "gold";
}

export function TrustBar({ items = defaultItems, variant = "light" }: TrustBarProps) {
  const styles = {
    light: {
      bg: "bg-blanc border-b border-pierre-12",
      value: "text-encre",
      label: "text-ardoise",
      divider: "bg-pierre-12",
    },
    dark: {
      bg: "bg-nuit border-b border-white/10",
      value: "text-blanc",
      label: "text-white/40",
      divider: "bg-white/10",
    },
    gold: {
      bg: "bg-or-pale border-b border-or-clair",
      value: "text-or-fonce",
      label: "text-encre-50",
      divider: "bg-or-clair",
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
