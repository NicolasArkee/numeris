import Link from "next/link";

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
    <section className={`px-6 py-24 lg:px-[4.5rem] ${isDark ? "bg-nuit" : "bg-creme"}`}>
      <div className="mx-auto max-w-[82rem]">
        <div className="mb-14 max-w-2xl">
          {eyebrow && (
            <div className="mb-5 flex items-center gap-3.5">
              <span className="block h-px w-6 flex-shrink-0 bg-or" />
              <span className={`text-[0.65rem] font-bold uppercase tracking-[0.14em] ${isDark ? "text-or" : "text-or-fonce"}`}>
                {eyebrow}
              </span>
            </div>
          )}
          <h2 className={`mb-4 font-serif text-[2.25rem] font-light leading-[1.15] tracking-tight lg:text-[2.75rem] ${isDark ? "text-blanc" : "text-encre"}`}>
            {title}
          </h2>
          {subtitle && (
            <p className={`text-[0.95rem] leading-relaxed ${isDark ? "text-white/40" : "text-ardoise"}`}>
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
                  ? "border border-white/10 bg-white/[0.04] hover:border-or"
                  : "border border-pierre-12 bg-blanc hover:border-or"
              }`}
            >
              {card.badge && (
                <span className="absolute right-4 top-4 bg-or-clair px-2 py-0.5 text-[0.6rem] font-semibold tracking-wide text-or-fonce">
                  {card.badge}
                </span>
              )}
              {card.icon && (
                <span className="mb-4 block text-[1.3rem]">{card.icon}</span>
              )}
              <h3 className={`mb-2 text-[0.95rem] font-semibold transition-colors group-hover:text-or-fonce ${isDark ? "text-blanc" : "text-encre"}`}>
                {card.title}
              </h3>
              <p className={`text-[0.78rem] leading-relaxed ${isDark ? "text-white/40" : "text-ardoise"}`}>
                {card.description}
              </p>
              <span className={`mt-3 block text-[0.72rem] font-medium text-or-fonce opacity-0 transition-opacity group-hover:opacity-100`}>
                En savoir plus →
              </span>
            </Link>
          ))}
        </div>

        {showMore && (
          <div className="mt-10 text-center">
            <Link
              href={showMore.href}
              className={`inline-flex items-center gap-2 text-[0.85rem] font-medium transition-colors hover:text-or-fonce ${isDark ? "text-or" : "text-or-fonce"}`}
            >
              {showMore.label} →
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
