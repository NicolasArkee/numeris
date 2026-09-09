import { formatDateFr } from "@/libs/content/format";

interface LastUpdatedProps {
  /** ISO 8601 ou "YYYY-MM-DD HH:MM:SS" — formatée fr-FR au rendu. */
  date?: string;
  readingTime?: string;
  reviewLabel?: string;
}

export function LastUpdated({
  date,
  readingTime,
  reviewLabel,
}: LastUpdatedProps) {
  const displayDate = date ? formatDateFr(date) : null;

  if (!displayDate && !readingTime && !reviewLabel) return null;

  return (
    <div className="flex flex-wrap items-center gap-4 text-[0.72rem] text-ink-muted">
      {displayDate && (
        <span className="flex items-center gap-1.5">
          <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-4 w-4 shrink-0 text-blue"><rect x="4" y="5" width="16" height="15" rx="3" /><path d="M8 3v5m8-5v5M4 11h16" /></svg>
          Mis à jour le {displayDate}
        </span>
      )}
      {readingTime && (
        <span className="flex items-center gap-1.5">
          <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-4 w-4 shrink-0 text-blue"><circle cx="12" cy="12" r="9" /><path d="M12 6v6l4 2" /></svg>
          {readingTime} de lecture
        </span>
      )}
      {reviewLabel && (
        <span className="flex items-center gap-1.5">
          <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-4 w-4 shrink-0 text-blue"><path d="m5 12 4 4L19 6" /></svg>
          {reviewLabel}
        </span>
      )}
    </div>
  );
}
