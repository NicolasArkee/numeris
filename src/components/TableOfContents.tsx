import { EDITORIAL_FOCUS } from "./editorial/EditorialElements";
interface TocItem {
  id: string;
  label: string;
  level?: number;
}
interface TableOfContentsProps {
  items: TocItem[];
  title?: string;
}

export function TableOfContents({
  items,
  title = "Sommaire",
}: TableOfContentsProps) {
  if (!items.length) return null;
  return (
    <nav className="rounded-[1.5rem] bg-lilac p-5 sm:p-7" aria-label="Sommaire">
      <h2 className="mb-5 font-display text-xl font-bold tracking-[-.025em] text-ink">
        {title}
      </h2>
      <ol className="grid gap-2">
        {items.map((item, i) => {
          const id = item.id.trim().replace(/^#+/, "");
          return (
            <li key={id}>
              <a
                href={`#${id}`}
                className={`group flex items-start gap-3 rounded-xl px-3 py-3 text-sm leading-6 text-ink transition-colors hover:bg-white/80 hover:text-blue ${EDITORIAL_FOCUS} ${item.level === 3 ? "ml-5" : "bg-white/50"}`}
              >
                <span
                  aria-hidden="true"
                  className="mt-0.5 shrink-0 font-mono text-xs font-bold text-blue"
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span>{item.label}</span>
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
