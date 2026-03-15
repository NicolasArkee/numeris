interface KeyTakeawaysProps {
  title?: string;
  items: string[];
}

export function KeyTakeaways({
  title = "Points clés à retenir",
  items,
}: KeyTakeawaysProps) {
  if (items.length === 0) return null;

  return (
    <div
      className="border border-or-clair border-l-[3px] border-l-or bg-or-pale p-7"
      data-speakable="true"
      role="complementary"
      aria-label={title}
    >
      <h2 className="mb-4 flex items-center gap-2 text-[0.92rem] font-semibold text-encre">
        <span className="text-or">📋</span> {title}
      </h2>
      <ul className="space-y-2.5">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2.5 text-[0.85rem] leading-relaxed text-encre-75">
            <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center bg-or text-[0.6rem] font-bold text-blanc">
              {i + 1}
            </span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
