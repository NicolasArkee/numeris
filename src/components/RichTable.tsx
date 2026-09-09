import { EDITORIAL_HEADING } from "./editorial/EditorialElements";

/** Scrollable data table. The first cell of each row is its accessible row heading. */
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
  if (!headers.length || !rows.length) return null;
  return (
    <section className="mx-auto mb-12 min-w-0 max-w-[72rem]">
      {title && <h2 className={`mb-5 ${EDITORIAL_HEADING}`}>{title}</h2>}
      {intro && (
        <p className="mb-6 max-w-3xl text-base leading-7 text-ink-muted">
          {intro}
        </p>
      )}
      <div className="overflow-hidden rounded-[1.5rem] border border-ink/10 bg-white">
        <div
          className="overflow-x-auto overscroll-x-contain focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-blue"
          tabIndex={0}
          role="region"
          aria-label={title || caption || "Tableau comparatif"}
        >
          <table className="w-full min-w-[36rem] border-collapse text-left text-sm">
            {caption && <caption className="sr-only">{caption}</caption>}
            <thead className="bg-navy text-white">
              <tr>
                {headers.map((header, i) => (
                  <th
                    key={i}
                    scope="col"
                    className="px-5 py-5 font-bold leading-6 sm:px-6"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, r) => (
                <tr
                  key={r}
                  className={`border-t border-ink/10 ${r % 2 ? "bg-paper/70" : "bg-white"}`}
                >
                  {row.map((cell, c) =>
                    c === 0 ? (
                      <th
                        key={c}
                        scope="row"
                        className="min-w-36 px-5 py-5 align-top font-bold leading-6 text-ink sm:px-6"
                      >
                        {cell}
                      </th>
                    ) : (
                      <td
                        key={c}
                        className="min-w-36 px-5 py-5 align-top leading-6 text-ink-muted sm:px-6"
                      >
                        {cell}
                      </td>
                    ),
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
