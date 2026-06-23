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
  if (variant === "citation") {
    return (
      <div className="mb-12 border-l-2 border-l-accent-500 pl-6">
        <blockquote className="font-display text-[1.1rem] italic leading-relaxed text-ink">
          &laquo;&nbsp;{quote}&nbsp;&raquo;
        </blockquote>
        <footer className="mt-3 text-[0.78rem] text-ink-muted">
          — {author}{role && `, ${role}`}
        </footer>
      </div>
    );
  }

  return (
    <div className="mb-12 border border-border-soft bg-surface p-7">
      <div className="mb-4 flex gap-1">
        {[...Array(5)].map((_, i) => (
          <span key={i} className="text-[0.85rem] text-accent-500">★</span>
        ))}
      </div>
      <blockquote className="mb-4 text-[0.9rem] italic leading-relaxed text-ink-muted">
        &laquo;&nbsp;{quote}&nbsp;&raquo;
      </blockquote>
      <footer className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center bg-accent-50 text-[0.75rem] font-bold text-accent-700">
          {author.split(" ").map((n) => n[0]).join("").slice(0, 2)}
        </div>
        <div>
          <p className="text-[0.82rem] font-medium text-ink">{author}</p>
          {role && <p className="text-[0.68rem] text-ink-muted">{role}</p>}
        </div>
      </footer>
    </div>
  );
}
