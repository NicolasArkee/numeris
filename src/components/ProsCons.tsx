import {
  EDITORIAL_HEADING,
  EditorialCheck,
} from "./editorial/EditorialElements";

export function ProsCons({
  title,
  intro,
  pros,
  cons,
  points = [],
}: {
  title?: string;
  intro?: string;
  pros: string[];
  cons: string[];
  points?: string[];
}) {
  if (pros.length === 0 && cons.length === 0 && points.length === 0)
    return null;
  const groups = [
    { label: "Avantages", items: pros, tone: "bg-mint", icon: true },
    { label: "Inconvénients", items: cons, tone: "bg-apricot", icon: false },
  ].filter((group) => group.items.length > 0);
  return (
    <section className="mb-12">
      {title && <h2 className={`mb-7 ${EDITORIAL_HEADING}`}>{title}</h2>}
      {intro && (
        <p className="mb-7 max-w-3xl text-base leading-7 text-ink-muted">
          {intro}
        </p>
      )}
      <div
        className={`grid gap-4 ${groups.length > 1 ? "md:grid-cols-2" : ""}`}
      >
        {groups.map((group) => (
          <div
            key={group.label}
            className={`min-w-0 rounded-[1.75rem] p-6 sm:p-8 ${group.tone}`}
          >
            <div className="mb-6 flex items-center gap-3">
              <span
                aria-hidden="true"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-navy text-white"
              >
                {group.icon ? (
                  <EditorialCheck />
                ) : (
                  <svg
                    className="h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  >
                    <path d="M12 5v8m0 4v2" />
                  </svg>
                )}
              </span>
              <h3 className="font-display text-xl font-bold text-ink">
                {group.label}
              </h3>
            </div>
            <ul className="divide-y divide-ink/10">
              {group.items.map((item, i) => (
                <li
                  key={i}
                  className="py-4 text-base leading-7 text-ink first:pt-0 last:pb-0"
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      {points.length > 0 && (
        <div
          className={`${groups.length > 0 ? "mt-4 " : ""}rounded-[1.75rem] bg-lilac p-6 sm:p-8`}
        >
          <h3 className="mb-5 font-display text-xl font-bold text-ink">
            Éléments à comparer
          </h3>
          <ul className="divide-y divide-ink/10">
            {points.map((point, i) => (
              <li
                key={i}
                className="py-4 text-base leading-7 text-ink first:pt-0 last:pb-0"
              >
                {point}
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
