interface DefinitionBoxProps {
  term: string;
  definition: string;
  source?: string;
}

export function DefinitionBox({ term, definition, source }: DefinitionBoxProps) {
  return (
    <div
      className="border border-pierre-12 bg-blanc p-7"
      data-speakable="true"
      role="definition"
    >
      <div className="mb-3 flex items-center gap-2">
        <span className="text-[0.68rem] font-bold uppercase tracking-[0.1em] text-or-fonce">
          Définition
        </span>
        <span className="h-px flex-1 bg-pierre-12" />
      </div>
      <p className="text-[0.95rem] leading-relaxed text-encre">
        <strong className="font-semibold">{term}</strong> : {definition}
      </p>
      {source && (
        <p className="mt-3 text-[0.68rem] text-pierre-37">
          Source : {source}
        </p>
      )}
    </div>
  );
}
