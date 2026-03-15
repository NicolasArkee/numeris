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
      className={`relative overflow-hidden bg-nuit px-6 lg:px-[4.5rem] ${
        isCompact ? "py-16 lg:py-20" : "py-20 lg:py-24"
      }`}
    >
      <div className="grid-bg pointer-events-none absolute inset-0 opacity-35" />
      <div className="radial-or pointer-events-none absolute -bottom-1/4 -right-[8%] h-[560px] w-[560px]" />

      <div className={`relative z-10 mx-auto max-w-[82rem] ${isCentered ? "text-center" : ""}`}>
        {/* Breadcrumbs */}
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav aria-label="Fil d'Ariane" className="mb-8">
            <ol className={`flex flex-wrap items-center gap-1.5 text-[0.72rem] text-white/30 ${isCentered ? "justify-center" : ""}`}>
              {breadcrumbs.map((item, i) => (
                <li key={item.url} className="flex items-center gap-1.5">
                  {i > 0 && <span>/</span>}
                  {i < breadcrumbs.length - 1 ? (
                    <Link href={item.url} className="transition-colors hover:text-or">
                      {item.name}
                    </Link>
                  ) : (
                    <span className="text-white/50">{item.name}</span>
                  )}
                </li>
              ))}
            </ol>
          </nav>
        )}

        {/* Eyebrow */}
        <div className={`mb-6 flex items-center gap-3.5 ${isCentered ? "justify-center" : ""}`}>
          <span className="block h-px w-7 bg-or" />
          <span className="text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-or">
            {eyebrow}
          </span>
          {!isCentered && <span className="block h-px w-7 bg-or" />}
        </div>

        {/* Title */}
        <h1
          className={`mb-6 font-serif font-light leading-[1.08] tracking-tight text-blanc ${
            isCompact
              ? "text-[2.25rem] lg:text-[3rem]"
              : "text-[2.75rem] lg:text-[4rem]"
          } ${isCentered ? "mx-auto max-w-4xl" : "max-w-3xl"}`}
        >
          {title}
          {titleAccent && (
            <>
              {" "}
              <em className="font-normal italic text-or">{titleAccent}</em>
            </>
          )}
        </h1>

        {/* Subtitle */}
        {subtitle && (
          <p className={`mb-8 text-[0.95rem] leading-relaxed text-white/40 ${isCentered ? "mx-auto max-w-2xl" : "max-w-2xl"}`}>
            {subtitle}
          </p>
        )}

        {/* Badges */}
        {badges && badges.length > 0 && (
          <div className={`mb-8 flex flex-wrap gap-2 ${isCentered ? "justify-center" : ""}`}>
            {badges.map((badge) => (
              <span
                key={badge}
                className="border border-white/10 px-3 py-1.5 text-[0.68rem] font-medium text-white/40"
              >
                {badge}
              </span>
            ))}
          </div>
        )}

        {/* CTAs */}
        {(cta || ctaSecondary) && (
          <div className={`flex flex-wrap items-center gap-5 ${isCentered ? "justify-center" : ""}`}>
            {cta && (
              <Link
                href={cta.href}
                className="inline-flex items-center gap-2 bg-or px-9 py-4 font-sans text-[0.875rem] font-semibold text-blanc transition-colors hover:bg-[#b08844]"
              >
                {cta.label} →
              </Link>
            )}
            {ctaSecondary && (
              <Link
                href={ctaSecondary.href}
                className="border border-white/20 px-8 py-4 font-sans text-[0.875rem] font-medium text-white/50 transition-colors hover:border-white/40 hover:text-white/90"
              >
                {ctaSecondary.label}
              </Link>
            )}
          </div>
        )}

        {/* Extra content */}
        {children}
      </div>
    </section>
  );
}
