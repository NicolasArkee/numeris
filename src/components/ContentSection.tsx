import React from "react";
import { RichText } from "./RichText";

interface ContentSectionProps {
  id?: string;
  title: string;
  paragraphs: string[];
  variant?: "default" | "highlighted" | "bordered";
  className?: string;
  contentClassName?: string;
  contentLayout?: "default" | "editorial-grid" | "editorial-single";
}

export function ContentSection({
  id,
  title,
  paragraphs,
  variant = "default",
  className = "",
  contentClassName = "",
  contentLayout = "default",
}: ContentSectionProps) {
  const wrapperStyles = {
    default: "",
    highlighted: "border border-border-soft border-l-2 border-l-accent-500 bg-surface p-7",
    bordered: "border border-border-soft bg-surface p-7",
  }[variant];

  // Join paragraphs with blank lines so RichText can detect block boundaries
  // (handles both array-of-paragraphs AND single string with embedded `### `).
  const text = paragraphs.join("\n\n");
  const richTextClassName = contentClassName.includes("max-w-none")
    ? contentClassName
    : `max-w-prose ${contentClassName}`.trim();

  return (
    <div className={`mb-12 ${wrapperStyles} ${className}`.trim()} id={id}>
      <h2 className="mb-4 font-display text-[1.25rem] font-bold text-ink">
        {title}
      </h2>
      <RichText text={text} className={richTextClassName} layout={contentLayout} />
    </div>
  );
}
