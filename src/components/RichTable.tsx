/**
 * RichTable — vrai tableau comparatif multi-colonnes (headers + rows) pour le contenu éditorial.
 * Comble le manque : `ComparisonTable`/`ComparisonInline` ne rend qu'une liste 2 colonnes.
 * Data-driven via `items = { headers: string[], rows: string[][] }`. La 1ʳᵉ colonne est traitée
 * comme libellé de ligne (mise en avant). Responsive : scroll-x sur mobile, jamais de débordement.
 */
export function RichTable({
  title,
  intro,
  headers,
  rows,
  caption,
}: {
  title?: string;
  intro?: string | null;
  headers: string[];
  rows: string[][];
  caption?: string | null;
}) {
  if (headers.length === 0 || rows.length === 0) return null;

  return (
    <section className="mx-auto mb-12 max-w-[60rem]">
      {title && (
        <h2 className="mb-4 font-display text-[1.25rem] font-bold text-ink">{title}</h2>
      )}
      {intro && (
        <p className="mb-4 max-w-prose text-base leading-relaxed text-ink-muted">{intro}</p>
      )}
      <div className="overflow-x-auto border border-border-soft">
        <table className="w-full border-collapse text-left text-[0.88rem]">
          {caption && <caption className="sr-only">{caption}</caption>}
          <thead>
            <tr className="bg-surface">
              {headers.map((h, i) => (
                <th
                  key={i}
                  scope="col"
                  className={`border-b border-border-soft px-4 py-3 font-display text-[0.9rem] font-semibold text-ink ${
                    i === 0 ? "min-w-[9rem]" : ""
                  }`}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, r) => (
              <tr key={r} className={r % 2 === 1 ? "bg-bg" : "bg-surface/40"}>
                {row.map((cell, c) => (
                  <td
                    key={c}
                    {...(c === 0 ? { scope: "row" as const } : {})}
                    className={`border-b border-border-soft px-4 py-3 align-top leading-relaxed ${
                      c === 0
                        ? "font-semibold text-ink"
                        : "text-ink-muted"
                    }`}
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
