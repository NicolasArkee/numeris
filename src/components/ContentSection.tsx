import React from "react";
import { RichText } from "./RichText";
import { EDITORIAL_HEADING } from "./editorial/EditorialElements";

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
    highlighted: "rounded-[1.75rem] bg-lilac p-6 sm:p-9",
    bordered: "rounded-[1.75rem] border border-ink/10 bg-white p-6 sm:p-9",
  }[variant];
  const text = paragraphs.join("\n\n");
  const richTextClassName = contentClassName.includes("max-w-none")
    ? contentClassName
    : `max-w-prose ${contentClassName}`.trim();

  return (
    <section
      className={`mb-12 min-w-0 ${wrapperStyles} ${className}`.trim()}
      id={id}
    >
      {title && <h2 className={`mb-6 ${EDITORIAL_HEADING}`}>{title}</h2>}
      <RichText
        text={text}
        className={richTextClassName}
        layout={contentLayout}
      />
    </section>
  );
}
