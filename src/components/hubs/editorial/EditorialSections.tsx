import { DynamicSection } from "@/components/DynamicSection";
import type { PageSection } from "@/libs/db";
import { normalizeAnchorId } from "@/libs/skoria-v2/model";
import { EditorialToc, type EditorialTocItem } from "./EditorialToc";

const SECTION_BACKGROUNDS = [
  "bg-white",
  "bg-paper",
  "bg-lilac",
  "bg-white",
  "bg-mint",
  "bg-apricot",
] as const;

function sectionAnchor(value: string): string {
  return normalizeAnchorId(value).replace(/-{2,}/g, "-");
}

export interface EditorialSectionEntry {
  id: string;
  label: string;
  section: PageSection;
}

export function buildEditorialSectionEntries(
  sections: readonly PageSection[],
): EditorialSectionEntry[] {
  const seen = new Map<string, number>();
  return sections
    .filter((section) => section.section_type !== "TableOfContents")
    .map((section, index) => {
      const base =
        sectionAnchor(section.title ?? "")
        || sectionAnchor(`${section.section_type}-${index + 1}`);
      const count = seen.get(base) ?? 0;
      seen.set(base, count + 1);
      const id = count === 0 ? base : `${base}-${count + 1}`;
      return {
        id,
        label: section.title || `Section ${index + 1}`,
        section,
      };
    });
}

export function editorialTocItems(
  entries: readonly EditorialSectionEntry[],
): EditorialTocItem[] {
  return entries
    .filter(
      (entry) =>
        Boolean(entry.section.title)
        && !["InternalLinks", "RelatedArticles"].includes(entry.section.section_type),
    )
    .map(({ id, label }) => ({ id, label }));
}

export function AnchoredDynamicSection({ entry }: { entry: EditorialSectionEntry }) {
  return (
    <div id={entry.id} className="scroll-mt-36">
      <DynamicSection section={entry.section} />
    </div>
  );
}

/** Full-width stream for hubs that are not wrapped by ClusterPage. */
export function EditorialSectionStream({
  sections,
  tocTitle = "Explorer ce dossier",
}: {
  sections: readonly PageSection[];
  tocTitle?: string;
}) {
  const entries = buildEditorialSectionEntries(sections);
  if (entries.length === 0) return null;

  return (
    <>
      <EditorialToc items={editorialTocItems(entries)} title={tocTitle} />
      <div id="contenu-editorial" className="scroll-mt-36">
        {entries.map((entry, index) => (
          <section
            key={entry.section.id}
            className={`${SECTION_BACKGROUNDS[index % SECTION_BACKGROUNDS.length]} px-5 py-14 sm:px-8 lg:py-20`}
          >
            <div className="mx-auto max-w-7xl">
              <AnchoredDynamicSection entry={entry} />
            </div>
          </section>
        ))}
      </div>
    </>
  );
}
