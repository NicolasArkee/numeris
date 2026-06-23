import Link from "next/link";

interface Breadcrumb {
  name: string;
  url: string;
}

interface PageHeroProps {
  eyebrow: string;
  title: string;
  titleAccent?: string;
  subtitle?: string;
  breadcrumbs?: Breadcrumb[];
  badges?: string[];
  cta?: { label: string; href: string };
  ctaSecondary?: { label: string; href: string };
  variant?: "default" | "compact" | "centered";
  children?: React.ReactNode;
}

export function PageHero({
  eyebrow,
  title,
  titleAccent,
  subtitle,
  breadcrumbs,
  badges,
  cta,
  ctaSecondary,
  variant = "default",
  children,
}: PageHeroProps) {
  const isCompact = variant === "compact";
  const isCentered = variant === "centered";

  return (
    <section
      className={`relative overflow-hidden bg-brand-ink px-6 lg:px-12 ${
        isCompact ? "py-14 lg:py-16" : "py-18 lg:py-22"
      }`}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-32 -bottom-32 h-115 w-115 rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(255,107,53,0.15) 0%, rgba(255,107,53,0) 60%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 -left-16 h-90 w-90 rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(44,93,184,0.28) 0%, rgba(44,93,184,0) 60%)",
        }}
      />

      <div className={`relative z-10 mx-auto max-w-328 ${isCentered ? "text-center" : ""}`}>
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav aria-label="Fil d'Ariane" className="mb-7">
            <ol className={`flex flex-wrap items-center gap-1.5 font-mono text-[0.75rem] text-white/55 ${isCentered ? "justify-center" : ""}`}>
              {breadcrumbs.map((item, i) => (
                <li key={item.url} className="flex items-center gap-1.5">
                  {i > 0 && <span aria-hidden>/</span>}
                  {i < breadcrumbs.length - 1 ? (
                    <Link href={item.url} className="transition-colors hover:text-accent-300">
                      {item.name}
                    </Link>
                  ) : (
                    <span className="text-white">{item.name}</span>
                  )}
                </li>
              ))}
            </ol>
          </nav>
        )}

        <div className={`mb-5 inline-flex items-center gap-2 rounded-full border border-accent-500/30 bg-accent-500/10 px-3.5 py-1.5 ${isCentered ? "mx-auto" : ""}`}>
          <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-accent-500" />
          <span className="font-display text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-accent-300">
            {eyebrow}
          </span>
        </div>

        <h1
          className={`mb-5 font-display font-extrabold leading-[1.06] tracking-tight text-surface ${
            isCompact
              ? "text-[2rem] lg:text-[2.75rem]"
              : "text-[2.5rem] lg:text-[3.75rem]"
          } ${isCentered ? "mx-auto max-w-4xl" : "max-w-3xl"}`}
        >
          {title}
          {titleAccent && (
            <>
              {" "}
              <span className="text-accent-500">{titleAccent}</span>
            </>
          )}
        </h1>

        {subtitle && (
          <p className={`mb-7 text-[1rem] leading-relaxed text-white/75 lg:text-[1.0625rem] ${isCentered ? "mx-auto max-w-2xl" : "max-w-2xl"}`}>
            {subtitle}
          </p>
        )}

        {badges && badges.length > 0 && (
          <div className={`mb-7 flex flex-wrap gap-2 ${isCentered ? "justify-center" : ""}`}>
            {badges.map((badge) => (
              <span
                key={badge}
                className="inline-flex items-center gap-1.5 rounded-md border border-white/15 bg-white/5 px-3 py-1.5 text-[0.75rem] font-medium text-white/85"
              >
                <span aria-hidden className="text-accent-500">✓</span>
                {badge}
              </span>
            ))}
          </div>
        )}

        {(cta || ctaSecondary) && (
          <div className={`flex flex-wrap items-center gap-3 ${isCentered ? "justify-center" : ""}`}>
            {cta && (
              <Link
                href={cta.href}
                className="inline-flex items-center gap-2 rounded-lg bg-accent-500 px-6 py-3 font-display text-[0.9375rem] font-semibold text-surface shadow-sm transition-colors hover:bg-accent-700"
              >
                {cta.label}
                <span aria-hidden>→</span>
              </Link>
            )}
            {ctaSecondary && (
              <Link
                href={ctaSecondary.href}
                className="inline-flex items-center gap-2 rounded-lg border border-white/20 bg-white/5 px-6 py-3 font-display text-[0.9375rem] font-semibold text-surface transition-colors hover:border-white/40 hover:bg-white/10"
              >
                {ctaSecondary.label}
              </Link>
            )}
          </div>
        )}

        {children}
      </div>
    </section>
  );
}
