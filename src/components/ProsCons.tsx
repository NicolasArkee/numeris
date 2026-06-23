// ProsCons — avantages / inconvénients équilibrés (archétypes avis & vs).
// Données structurées : { pros: string[]; cons: string[] }. Pas de CTA, pas de
// données monétisées — c'est de l'éditorial (prose Gemini).

export function ProsCons({
  title,
  pros,
  cons,
}: {
  title?: string;
  pros: string[];
  cons: string[];
}) {
  if (pros.length === 0 && cons.length === 0) return null;
  return (
    <div className="mb-12">
      {title && (
        <h2 className="mb-6 font-display text-[1.25rem] font-bold text-ink">{title}</h2>
      )}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="border border-border-soft bg-surface p-6">
          <h3 className="mb-4 text-[0.8rem] font-semibold uppercase tracking-[0.12em] text-emerald-600">
            Avantages
          </h3>
          <ul className="space-y-2.5">
            {pros.map((p, i) => (
              <li key={i} className="flex items-start gap-2.5 text-[0.9rem] leading-relaxed text-ink-muted">
                <span aria-hidden className="mt-0.5 flex-shrink-0 text-emerald-600">✓</span>
                <span>{p}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="border border-border-soft bg-surface p-6">
          <h3 className="mb-4 text-[0.8rem] font-semibold uppercase tracking-[0.12em] text-rose-500">
            Inconvénients
          </h3>
          <ul className="space-y-2.5">
            {cons.map((c, i) => (
              <li key={i} className="flex items-start gap-2.5 text-[0.9rem] leading-relaxed text-ink-muted">
                <span aria-hidden className="mt-0.5 flex-shrink-0 text-rose-500">✕</span>
                <span>{c}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
