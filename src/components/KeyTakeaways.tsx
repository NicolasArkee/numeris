import { sanitizeLegacyPublicText } from "@/libs/skoria-v2/content-safety";

interface KeyTakeawaysProps {
  title?: string;
  items: string[];
}

export function KeyTakeaways({
  title,
  items,
}: KeyTakeawaysProps) {
  if (items.length === 0) return null;

  const cardStyles = [
    "bg-navy text-white",
    "border border-ink/10 bg-white text-ink",
    "bg-apricot text-ink",
    "bg-blue text-white",
  ] as const;

  return (
    <aside
      className="relative"
      data-speakable="true"
      role="complementary"
      aria-label={title ?? "À retenir"}
    >
      {title && (
        <div className="mb-8 grid gap-3 border-b border-ink/14 pb-6 sm:grid-cols-[auto_1fr] sm:items-end sm:gap-8">
          <p className="text-[.62rem] font-bold uppercase tracking-[.2em] text-blue">Synthèse</p>
          <h2 className="text-balance text-[clamp(1.75rem,4vw,2.8rem)] font-semibold leading-[1.06] tracking-[-.035em] text-ink">
            {sanitizeLegacyPublicText(title)}
          </h2>
        </div>
      )}
      <ol className={`grid gap-3 ${items.length > 2 ? "lg:grid-cols-3" : "sm:grid-cols-2"}`}>
        {items.map((item, i) => (
          <li
            key={i}
            className={`${cardStyles[i % cardStyles.length]} group flex min-h-[13.5rem] flex-col justify-between rounded-[1.2rem] p-6 shadow-[0_18px_55px_rgba(7,29,60,.06)] transition-transform hover:-translate-y-1 sm:p-7`}
          >
            <span
              className={`font-serif text-[2.6rem] font-normal italic leading-none ${i === 0 || i === 3 ? "text-orange" : "text-blue"}`}
              aria-hidden="true"
            >
              {String(i + 1).padStart(2, "0")}
            </span>
            <p className={`mt-8 text-[.94rem] font-medium leading-7 ${i === 0 || i === 3 ? "text-white/82" : "text-ink-muted"}`}>
              {sanitizeLegacyPublicText(item)}
            </p>
          </li>
        ))}
      </ol>
    </aside>
  );
}
