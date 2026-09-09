import {
  EDITORIAL_HEADING,
  EditorialArrow,
  EditorialCheck,
} from "./editorial/EditorialElements";

interface ChecklistProps {
  title?: string;
  intro?: string;
  items: string[];
  variant?: "check" | "arrow" | "star";
  columns?: 1 | 2;
}

export function Checklist({
  title,
  intro,
  items,
  variant = "check",
  columns = 1,
}: ChecklistProps) {
  return (
    <section className="mb-12 rounded-[1.75rem] bg-mint p-6 sm:p-8">
      <div className="mb-6 flex items-start justify-between gap-4">
        {title && <h2 className={EDITORIAL_HEADING}>{title}</h2>}
        <span
          aria-hidden="true"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-navy text-mint"
        >
          <EditorialCheck />
        </span>
      </div>
      {intro && (
        <p className="mb-6 max-w-3xl text-base leading-7 text-ink-muted">
          {intro}
        </p>
      )}
      <ul className={`grid gap-3 ${columns === 2 ? "md:grid-cols-2" : ""}`}>
        {items.map((item, i) => (
          <li
            key={i}
            className="flex min-w-0 items-start gap-3 rounded-2xl bg-white/75 p-4 sm:gap-4 sm:p-5"
          >
            <span
              aria-hidden="true"
              className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-navy text-white"
            >
              {variant === "arrow" ? (
                <EditorialArrow className="h-4 w-4" />
              ) : variant === "star" ? (
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                >
                  <path d="m12 3 2.7 5.5 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1-4.4-4.3 6.1-.9Z" />
                </svg>
              ) : (
                <EditorialCheck className="h-4 w-4" />
              )}
            </span>
            <span className="min-w-0 break-words text-base leading-7 text-ink">
              {item}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
