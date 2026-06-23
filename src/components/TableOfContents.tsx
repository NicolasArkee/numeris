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
  if (items.length === 0) return null;

  return (
    <nav
      className="border border-border-soft bg-surface p-6"
      aria-label="Sommaire"
    >
      <h2 className="mb-4 flex items-center gap-2 text-[0.82rem] font-bold uppercase tracking-[0.08em] text-ink">
        <span className="text-accent-500">§</span> {title}
      </h2>
      <ol className="space-y-1.5">
        {items.map((item, i) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              className={`flex items-baseline gap-2 text-[0.82rem] leading-snug text-ink-muted transition-colors hover:text-accent-700 ${
                item.level === 3 ? "ml-5" : ""
              }`}
            >
              <span className="flex-shrink-0 text-[0.68rem] font-medium text-accent-500">
                {i + 1}.
              </span>
              {item.label}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
