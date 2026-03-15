interface LastUpdatedProps {
  date?: string;
  readingTime?: string;
}

export function LastUpdated({ date, readingTime }: LastUpdatedProps) {
  const displayDate = date || new Date().toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="flex flex-wrap items-center gap-4 text-[0.72rem] text-ardoise">
      <span className="flex items-center gap-1.5">
        <span className="text-or">📅</span>
        Mis à jour le {displayDate}
      </span>
      {readingTime && (
        <>
          <span className="h-3 w-px bg-pierre-12" />
          <span className="flex items-center gap-1.5">
            <span className="text-or">⏱</span>
            {readingTime} de lecture
          </span>
        </>
      )}
      <span className="h-3 w-px bg-pierre-12" />
      <span className="flex items-center gap-1.5">
        <span className="text-or">✓</span>
        Vérifié par un expert-comptable
      </span>
    </div>
  );
}
