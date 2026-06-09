import { Fragment } from "react";

/**
 * Lightweight Markdown-lite renderer for body text emitted by Gemini.
 *
 * Handles inline AND block-level markers that Gemini frequently produces in
 * `body` strings despite prompts asking for plain prose:
 *   - `### Heading`  → <h3> (sub-section header, bumped visual hierarchy)
 *   - `## Heading`   → <h3> (same — H2 reserved to ContentSection title)
 *   - `**bold**`     → <strong>
 *   - `*italic*`     → <em>  (lone single-asterisk, not bold)
 *   - `- item`       → <li>  (auto-wrapped in <ul>)
 *   - blank line     → paragraph break
 *
 * NO support for : tables, code blocks, links (intentional — body should not
 * contain those, they belong in dedicated section_types).
 *
 * Used by: ContentSection, DynamicSection.EditoIntroInline, AlertBox children,
 * Faq answer, KeyTakeaways items.
 */

type Block =
  | { type: "h3"; text: string }
  | { type: "p"; text: string }
  | { type: "ul"; items: string[] };

function parseBlocks(text: string): Block[] {
  const lines = text.split(/\r?\n/);
  const blocks: Block[] = [];
  let buf: string[] = [];
  let listBuf: string[] = [];

  const flushP = () => {
    if (buf.length > 0) {
      blocks.push({ type: "p", text: buf.join(" ").trim() });
      buf = [];
    }
  };
  const flushList = () => {
    if (listBuf.length > 0) {
      blocks.push({ type: "ul", items: listBuf });
      listBuf = [];
    }
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (line === "") {
      flushP();
      flushList();
      continue;
    }
    if (line.startsWith("### ") || line.startsWith("## ")) {
      flushP();
      flushList();
      const heading = line.replace(/^#{2,3}\s+/, "").trim();
      blocks.push({ type: "h3", text: heading });
      continue;
    }
    if (line.startsWith("- ") || line.startsWith("* ")) {
      flushP();
      listBuf.push(line.slice(2).trim());
      continue;
    }
    flushList();
    buf.push(line);
  }
  flushP();
  flushList();
  return blocks;
}

/** Inline parser for **bold** and *italic*. Returns React children. */
function renderInline(text: string): React.ReactNode {
  // Split on **bold** first
  const parts = text.split(/(\*\*[^*\n]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-semibold text-encre">
          {part.slice(2, -2)}
        </strong>
      );
    }
    // Then lone *italic*
    const italicParts = part.split(/(\*[^*\n]+\*)/g);
    return (
      <Fragment key={i}>
        {italicParts.map((p, j) =>
          p.startsWith("*") && p.endsWith("*") && p.length > 2 ? (
            <em key={j}>{p.slice(1, -1)}</em>
          ) : (
            <Fragment key={j}>{p}</Fragment>
          ),
        )}
      </Fragment>
    );
  });
}

interface RichTextProps {
  text: string;
  className?: string;
}

export function RichText({ text, className = "" }: RichTextProps) {
  const blocks = parseBlocks(text);
  return (
    <div className={className}>
      {blocks.map((b, i) => {
        if (b.type === "h3") {
          return (
            <h3
              key={i}
              className="mt-6 mb-3 font-serif text-[1.15rem] font-medium text-encre"
            >
              {renderInline(b.text)}
            </h3>
          );
        }
        if (b.type === "ul") {
          return (
            <ul key={i} className="my-4 list-disc space-y-2 pl-6">
              {b.items.map((item, j) => (
                <li key={j} className="text-base leading-relaxed text-ardoise">
                  {renderInline(item)}
                </li>
              ))}
            </ul>
          );
        }
        return (
          <p
            key={i}
            className="mb-4 text-base leading-relaxed text-ardoise last:mb-0"
          >
            {renderInline(b.text)}
          </p>
        );
      })}
    </div>
  );
}
