import Image from "next/image";
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
  tone?: "navy" | "blue" | "lilac" | "mint" | "apricot";
  media?: {
    src: string;
    alt: string;
    position?: string;
    disclaimer?: string;
  };
  children?: React.ReactNode;
}

const TONES = {
  navy: {
    section: "bg-navy text-white",
    eyebrow: "text-[#ffb293]",
    body: "text-white/76",
    crumb: "text-white/58",
    outline: "border-white/22 text-white hover:bg-white hover:text-navy",
  },
  blue: {
    section: "bg-blue text-white",
    eyebrow: "text-white/75",
    body: "text-white/82",
    crumb: "text-white/62",
    outline: "border-white/30 text-white hover:bg-white hover:text-blue",
  },
  lilac: {
    section: "bg-lilac text-ink",
    eyebrow: "text-blue",
    body: "text-ink-muted",
    crumb: "text-ink-muted",
    outline: "border-ink/25 text-ink hover:bg-ink hover:text-white",
  },
  mint: {
    section: "bg-mint text-ink",
    eyebrow: "text-blue",
    body: "text-ink-muted",
    crumb: "text-ink-muted",
    outline: "border-ink/25 text-ink hover:bg-ink hover:text-white",
  },
  apricot: {
    section: "bg-apricot text-ink",
    eyebrow: "text-blue",
    body: "text-ink-muted",
    crumb: "text-ink-muted",
    outline: "border-ink/25 text-ink hover:bg-ink hover:text-white",
  },
} as const;

/** Hero éditorial partagé par les hubs V2. */
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
  tone = "navy",
  media,
  children,
}: PageHeroProps) {
  const palette = TONES[tone];
  const isCompact = variant === "compact";
  const isCentered = variant === "centered";

  return (
    <section className={`relative isolate overflow-hidden ${palette.section}`}>
      <div
        aria-hidden
        className="absolute inset-0 -z-10 opacity-50"
        style={{
          backgroundImage:
            "linear-gradient(90deg,rgba(255,255,255,.06) 1px,transparent 1px),linear-gradient(rgba(255,255,255,.04) 1px,transparent 1px)",
          backgroundSize: "96px 96px",
          maskImage: "linear-gradient(90deg,black,transparent 78%)",
        }}
      />
      <div
        className={`mx-auto grid max-w-[90rem] ${
          isCentered || isCompact ? "min-h-[32rem]" : "min-h-[38rem]"
        } ${media && !isCentered ? "lg:grid-cols-[1.05fr_.95fr]" : ""}`}
      >
        <div
          className={`relative z-10 flex flex-col justify-center px-5 py-14 sm:px-8 lg:px-14 lg:py-20 xl:pl-20 ${
            isCentered ? "items-center text-center" : ""
          }`}
        >
          {breadcrumbs && breadcrumbs.length > 0 && (
            <nav aria-label="Fil d'Ariane" className="mb-8">
              <ol
                className={`flex flex-wrap items-center gap-2 text-[.75rem] ${palette.crumb} ${
                  isCentered ? "justify-center" : ""
                }`}
              >
                {breadcrumbs.map((item, index) => (
                  <li key={item.url} className="flex items-center gap-2">
                    {index > 0 && <span aria-hidden>·</span>}
                    {index < breadcrumbs.length - 1 ? (
                      <Link href={item.url} className="underline-offset-4 hover:underline">
                        {item.name}
                      </Link>
                    ) : (
                      <span aria-current="page">{item.name}</span>
                    )}
                  </li>
                ))}
              </ol>
            </nav>
          )}

          <p className={`mb-5 text-[.68rem] font-bold uppercase tracking-[.2em] ${palette.eyebrow}`}>
            {eyebrow}
          </p>
          <h1
            className={`max-w-4xl text-balance font-display font-semibold leading-[.98] tracking-[-.045em] ${
              isCompact ? "text-[clamp(2.8rem,6vw,4.8rem)]" : "text-[clamp(3.15rem,7vw,6.1rem)]"
            }`}
          >
            {title}
            {titleAccent && (
              <>
                {" "}
                <span className="tracking-[-.025em]">{titleAccent}</span>
              </>
            )}
          </h1>

          {subtitle && (
            <p className={`mt-7 max-w-[44rem] text-[1.05rem] leading-8 lg:text-[1.16rem] ${palette.body}`}>
              {subtitle}
            </p>
          )}

          {badges && badges.length > 0 && (
            <div className={`mt-7 flex flex-wrap gap-2 ${isCentered ? "justify-center" : ""}`}>
              {badges.map((badge) => (
                <span key={badge} className="rounded-full border border-current/20 px-3 py-1.5 text-[.72rem]">
                  {badge}
                </span>
              ))}
            </div>
          )}

          {(cta || ctaSecondary) && (
            <div className={`mt-9 flex flex-wrap gap-3 ${isCentered ? "justify-center" : ""}`}>
              {cta && (
                <Link
                  href={cta.href}
                  className="inline-flex min-h-12 items-center justify-center rounded-full bg-orange px-6 py-3 text-[.88rem] font-bold text-navy transition-transform hover:-translate-y-0.5"
                >
                  {cta.label}&nbsp; ↗
                </Link>
              )}
              {ctaSecondary && (
                <Link
                  href={ctaSecondary.href}
                  className={`inline-flex min-h-12 items-center justify-center rounded-full border px-6 py-3 text-[.88rem] font-bold transition-colors ${palette.outline}`}
                >
                  {ctaSecondary.label}
                </Link>
              )}
            </div>
          )}
          {children}
        </div>

        {media && !isCentered && (
          <figure className="relative min-h-[24rem] overflow-hidden lg:min-h-full">
            <Image
              src={media.src}
              alt={media.alt}
              fill
              priority={!isCompact}
              sizes="(max-width: 1024px) 100vw, 48vw"
              className="object-cover"
              style={{ objectPosition: media.position ?? "center" }}
            />
            <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-navy/30 via-transparent to-transparent" />
            {media.disclaimer && (
              <figcaption className="absolute inset-x-4 bottom-4 rounded-full bg-navy/78 px-4 py-2 text-center text-[.68rem] leading-5 text-white/78 backdrop-blur-sm">
                {media.disclaimer}
              </figcaption>
            )}
          </figure>
        )}
      </div>
    </section>
  );
}
