import { RichText } from "./RichText";

interface ContentSectionProps {
  id?: string;
  title: string;
  paragraphs: string[];
  variant?: "default" | "highlighted" | "bordered";
}

export function ContentSection({
  id,
  title,
  paragraphs,
  variant = "default",
}: ContentSectionProps) {
  const wrapperStyles = {
    default: "",
    highlighted: "border border-pierre-12 border-l-2 border-l-or bg-blanc p-7",
    bordered: "border border-pierre-12 bg-blanc p-7",
  }[variant];

  // Join paragraphs with blank lines so RichText can detect block boundaries
  // (handles both array-of-paragraphs AND single string with embedded `### `).
  const text = paragraphs.join("\n\n");

  return (
    <div className={`mb-12 ${wrapperStyles}`} id={id}>
      <h2 className="mb-4 font-serif text-[1.25rem] font-light text-encre">
        {title}
      </h2>
      <RichText text={text} className="max-w-prose" />
    </div>
  );
}
