import Link from "next/link";
import { Icon } from "./Icon";

interface FeatureCard {
  icon?: string;
  title: string;
  description: string;
  href: string;
  badge?: string;
}

interface FeatureGridProps {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  cards: FeatureCard[];
  columns?: 2 | 3 | 4;
  variant?: "light" | "dark";
  showMore?: { label: string; href: string };
}

export function FeatureGrid({
  title,
  subtitle,
  eyebrow,
  cards,
  columns = 3,
  variant = "light",
  showMore,
}: FeatureGridProps) {
  const isDark = variant === "dark";
  const gridCols = {
    2: "md:grid-cols-2",
    3: "md:grid-cols-2 lg:grid-cols-3",
    4: "md:grid-cols-2 lg:grid-cols-4",
  }[columns];

  return (
    <section className={`px-6 py-24 lg:px-[4.5rem] ${isDark ? "bg-brand-ink" : "bg-bg"}`}>
      <div className="mx-auto max-w-[82rem]">
        <div className="mb-14 max-w-2xl">
          {eyebrow && (
            <div className="mb-5 flex items-center gap-3.5">
              <span className="block h-px w-6 flex-shrink-0 bg-accent-500" />
              <span className={`text-[0.65rem] font-bold uppercase tracking-[0.14em] ${isDark ? "text-accent-500" : "text-accent-700"}`}>
                {eyebrow}
              </span>
            </div>
          )}
          <h2 className={`mb-4 font-display text-[2.25rem] font-bold leading-[1.15] tracking-tight lg:text-[2.75rem] ${isDark ? "text-surface" : "text-ink"}`}>
            {title}
          </h2>
          {subtitle && (
            <p className={`text-[0.95rem] leading-relaxed ${isDark ? "text-white/40" : "text-ink-muted"}`}>
              {subtitle}
            </p>
          )}
        </div>

        <div className={`grid gap-5 ${gridCols}`}>
          {cards.map((card) => (
            <Link
              key={card.href}
              href={card.href}
              className={`group relative p-7 transition-all hover:-translate-y-0.5 hover:shadow-lg ${
                isDark
                  ? "border border-white/10 bg-white/[0.04] hover:border-accent-500"
                  : "border border-border-soft bg-surface hover:border-accent-500"
              }`}
            >
              {card.badge && (
                <span className="absolute right-4 top-4 bg-accent-300 px-2 py-0.5 text-[0.6rem] font-semibold tracking-wide text-accent-700">
                  {card.badge}
                </span>
              )}
              {card.icon && (
                <div
                  className={`mb-4 flex h-10 w-10 items-center justify-center rounded-md border ${
                    isDark
                      ? "border-white/10 bg-white/4 text-accent-300"
                      : "border-brand-100 bg-brand-50 text-brand-700"
                  }`}
                >
                  <Icon name={card.icon} size={20} />
                </div>
              )}
              <h3 className={`mb-2 text-[0.95rem] font-semibold transition-colors group-hover:text-accent-700 ${isDark ? "text-surface" : "text-ink"}`}>
                {card.title}
              </h3>
              <p className={`text-[0.78rem] leading-relaxed ${isDark ? "text-white/40" : "text-ink-muted"}`}>
                {card.description}
              </p>
              <span className={`mt-3 block text-[0.72rem] font-medium text-accent-700 opacity-0 transition-opacity group-hover:opacity-100`}>
                En savoir plus →
              </span>
            </Link>
          ))}
        </div>

        {showMore && (
          <div className="mt-10 text-center">
            <Link
              href={showMore.href}
              className={`inline-flex items-center gap-2 text-[0.85rem] font-medium transition-colors hover:text-accent-700 ${isDark ? "text-accent-500" : "text-accent-700"}`}
            >
              {showMore.label} →
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
