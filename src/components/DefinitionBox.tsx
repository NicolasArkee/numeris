import { IconSet } from "./IconSet";
import { RichText } from "./RichText";

interface DefinitionBoxProps {
  term: string;
  definition: string;
  source?: string;
}

export function DefinitionBox({
  term,
  definition,
  source,
}: DefinitionBoxProps) {
  return (
    <aside
      className="rounded-[1.75rem] bg-lilac p-6 sm:p-8"
      data-speakable="true"
      role="definition"
    >
      <div className="mb-5 flex items-center justify-between gap-5">
        <span className="rounded-full bg-white/80 px-3 py-1.5 text-xs font-bold tracking-wide text-blue">
          Définition
        </span>
        <IconSet name="book" size={26} className="text-blue" />
      </div>
      <p className="mb-3 font-display text-[1.4rem] font-bold leading-tight tracking-[-.03em] text-ink">
        <dfn className="not-italic">{term}</dfn>
      </p>
      <RichText text={definition} className="max-w-none" />
      {source && (
        <p className="mt-5 border-t border-ink/10 pt-4 text-xs leading-5 text-ink-muted">
          Source : {source}
        </p>
      )}
    </aside>
  );
}
