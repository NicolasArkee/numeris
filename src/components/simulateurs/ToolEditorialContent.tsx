import { DynamicSection } from "@/components/DynamicSection";
import type { PageSection } from "@/libs/db";

interface ToolEditorialContentProps {
  sections: PageSection[];
}

const SECTION_SURFACES: Record<string, string> = {
  DefinitionBox: "bg-lilac",
  Checklist: "bg-mint",
  AlertBox: "bg-apricot",
};

/**
 * The tool layout owns the outside spacing. DynamicSection is also used in
 * full-width pages, where its renderers need their own padding and prose
 * widths; normalize only their outer shells inside this integration.
 * Nested step cards, rich text, links and source contents keep their markup.
 */
const RENDERER_LAYOUT = [
  "min-w-0",
  "[&>section]:m-0 [&>section]:max-w-none [&>section]:rounded-none [&>section]:border-0 [&>section]:bg-transparent [&>section]:p-0",
  "[&>div]:m-0",
  "[&>[role=note]]:m-0 [&>[role=note]]:rounded-none [&>[role=note]]:border-0 [&>[role=note]]:bg-transparent [&>[role=note]]:p-0",
  "[&_[role=definition]]:m-0 [&_[role=definition]]:rounded-none [&_[role=definition]]:border-0 [&_[role=definition]]:bg-transparent [&_[role=definition]]:p-0",
  "[&_[data-editorial-sources]]:mx-0 [&_[data-editorial-sources]]:mb-0 [&_[data-editorial-sources]]:mt-7 [&_[data-editorial-sources]]:w-full [&_[data-editorial-sources]]:max-w-none",
  "[&_[data-editorial-sources]]:rounded-none [&_[data-editorial-sources]]:[border-width:1px_0_0] [&_[data-editorial-sources]]:bg-transparent",
  "[&_[data-editorial-sources]]:px-0 [&_[data-editorial-sources]]:pb-0 [&_[data-editorial-sources]]:pt-5",
].join(" ");

export function ToolEditorialContent({ sections }: ToolEditorialContentProps) {
  return (
    <div className="min-w-0 space-y-6 lg:space-y-8">
      {sections.map((section, index) => (
        <div
          key={section.id}
          id={`outil-section-${index}`}
          data-tool-editorial-section={section.section_type}
          className={`min-w-0 scroll-mt-[calc(var(--site-header-height)+5rem)] rounded-[1.75rem] border border-ink/10 p-5 sm:p-8 lg:p-9 ${SECTION_SURFACES[section.section_type] ?? "bg-white"}`}
        >
          <div className={RENDERER_LAYOUT}>
            <DynamicSection section={section} />
          </div>
        </div>
      ))}
    </div>
  );
}
