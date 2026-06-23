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
  reviewLabel = "Relu par l'équipe éditoriale",
}: LastUpdatedProps) {
  const displayDate = formatDateFr(date);

  return (
    <div className="flex flex-wrap items-center gap-4 text-[0.72rem] text-ink-muted">
      <span className="flex items-center gap-1.5">
        <span className="text-accent-500">📅</span>
        Mis à jour le {displayDate}
      </span>
      {readingTime && (
        <>
          <span className="h-3 w-px bg-border-soft" />
          <span className="flex items-center gap-1.5">
            <span className="text-accent-500">⏱</span>
            {readingTime} de lecture
          </span>
        </>
      )}
      <span className="h-3 w-px bg-border-soft" />
      <span className="flex items-center gap-1.5">
        <span className="text-accent-500">✓</span>
        {reviewLabel}
      </span>
    </div>
  );
}
