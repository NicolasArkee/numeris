/** Shared, server-rendered primitives for the V2 editorial sections. */
export const EDITORIAL_HEADING =
  "font-display text-[clamp(1.5rem,2.5vw,2.25rem)] font-bold not-italic leading-[1.12] tracking-[-.035em] text-ink";
export const EDITORIAL_BODY = "text-base leading-7 text-ink-muted";
export const EDITORIAL_FOCUS =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue";

export function EditorialArrow({ className = "" }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      className={`h-5 w-5 ${className}`}
    >
      <path
        d="M5 12h14m-6-6 6 6-6 6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function EditorialCheck({ className = "" }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      className={`h-5 w-5 ${className}`}
    >
      <path d="m5 12 4 4L19 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
