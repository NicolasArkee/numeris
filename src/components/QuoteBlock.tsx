interface QuoteBlockProps {
  quote: string;
  author: string;
  role?: string;
  variant?: "testimonial" | "citation";
}

export function QuoteBlock({
  quote,
  author,
  role,
  variant = "testimonial",
}: QuoteBlockProps) {
  const citation = variant === "citation";
  return (
    <figure
      className={`mb-12 overflow-hidden rounded-[1.75rem] p-6 sm:p-9 ${citation ? "bg-lilac" : "bg-navy"}`}
    >
      <svg
        aria-hidden="true"
        className={`mb-5 h-9 w-11 ${citation ? "text-blue" : "text-mint"}`}
        viewBox="0 0 44 36"
        fill="currentColor"
      >
        <path d="M0 20C0 9 5 3 15 0v7C9 9 7 12 7 17h10v19H0V20Zm26 0C26 9 31 3 41 0v7c-6 2-8 5-8 10h10v19H26V20Z" />
      </svg>
      <blockquote
        className={`font-display text-[clamp(1.1rem,2vw,1.6rem)] font-medium not-italic leading-relaxed tracking-[-.015em] ${citation ? "text-ink" : "text-white"}`}
      >
        &laquo;&nbsp;{quote}&nbsp;&raquo;
      </blockquote>
      {(author || role) && (
        <figcaption
          className={`mt-7 flex items-center gap-3 border-t pt-5 ${citation ? "border-ink/10" : "border-white/15"}`}
        >
          {author && (
            <span
              aria-hidden="true"
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-bold ${citation ? "bg-white text-blue" : "bg-mint text-navy"}`}
            >
              {author
                .split(" ")
                .map((name) => name[0])
                .join("")
                .slice(0, 2)}
            </span>
          )}
          <span>
            {author && (
              <span
                className={`block text-sm font-bold ${citation ? "text-ink" : "text-white"}`}
              >
                {author}
              </span>
            )}
            {role && (
              <span
                className={`mt-1 block text-xs leading-5 ${citation ? "text-ink-muted" : "text-white/75"}`}
              >
                {role}
              </span>
            )}
          </span>
        </figcaption>
      )}
    </figure>
  );
}
