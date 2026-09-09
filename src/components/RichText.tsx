import React, { Fragment } from "react";

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

type EditorialGroup = { title: string; body: Block[] };

function sanitizeGeneratedText(text: string): string {
  return text
    // A small part of the historical corpus contains HTML fragments even
    // though this component deliberately renders Markdown-lite. Converting
    // the known structural tags keeps headings and paragraphs legible while
    // React continues to render plain text rather than injected markup.
    .replaceAll(/<h[23][^>]*>(.*?)<\/h[23]>/giu, "\n### $1\n")
    .replaceAll(/<br\s*\/?>/giu, "\n")
    .replaceAll(/<\/?p[^>]*>/giu, "\n")
    .replaceAll(/<\/?em[^>]*>/giu, "*")
    .replaceAll(/<[^>]+>/gu, " ")
    .replaceAll(
      /«\s*\*?([^»]+?)\*?\s*»,\s*observe\s+Hélène\s+Marchand,\s+experte-comptable\./gu,
      "$1.",
    )
    .replaceAll(/\bNotre cabinet\b/gu, "Un professionnel adapté")
    .replaceAll(/\bnotre cabinet\b/gu, "un professionnel adapté")
    .replaceAll(/\bNos experts-comptables\b/gu, "Les professionnels comparés")
    .replaceAll(/\bnos experts-comptables\b/gu, "les professionnels comparés")
    .replaceAll(/\bNous vous accompagnons\b/gu, "Un professionnel peut vous accompagner")
    .replaceAll(/\bnous vous accompagnons\b/gu, "un professionnel peut vous accompagner")
    .replaceAll(/\bNous mettons en place\b/gu, "Un professionnel peut mettre en place")
    .replaceAll(/\bnous mettons en place\b/gu, "un professionnel peut mettre en place");
}

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

function splitSentences(text: string): string[] {
  return text
    .match(/[^.!?]+[.!?]+(?:[»”])?/gu)
    ?.map((sentence) => sentence.trim())
    .filter(Boolean)
    ?? [text.trim()].filter(Boolean);
}

function groupSentences(sentences: string[], targetLength = 620): string[] {
  const chunks: string[] = [];
  let current: string[] = [];
  let currentLength = 0;

  for (const sentence of sentences) {
    const nextLength = currentLength + sentence.length;
    if (current.length > 0 && nextLength > targetLength) {
      chunks.push(current.join(" "));
      current = [];
      currentLength = 0;
    }
    current.push(sentence);
    currentLength += sentence.length;
  }

  if (current.length > 0) {
    chunks.push(current.join(" "));
  }

  return chunks;
}

function headingFromText(text: string, index: number, usedHeadings: Set<string>): string {
  const normalized = text
    .normalize("NFD")
    .replaceAll(/\p{Diacritic}/gu, "")
    .toLowerCase();

  const rules: Array<[RegExp, string]> = [
    [/business plan|previsionnel|plan de financement|partenaires financiers|banques/u, "Préparer un business plan finançable"],
    [/acquisition du fonds|droit au bail|travaux d'amenagement|materiel professionnel|stock de depart/u, "Financer l'acquisition et le démarrage"],
    [/sarl|eurl|travailleur non salarie|tns/u, "SARL ou EURL : sécuriser l'exploitation"],
    [/sas|sasu|assimile salarie|regime general/u, "SAS ou SASU : arbitrer souplesse et protection"],
    [/redaction des statuts|investisseurs|protection sociale|charges sociales/u, "Comparer rémunération, charges et protection sociale"],
    [/statut juridique|forme societale|responsabilite aux apports/u, "Choisir le bon statut juridique"],
    [/impot sur les societes|impot sur le revenu|benefices|dividendes/u, "Anticiper le régime fiscal"],
    [/tva|taxe sur la valeur ajoutee|taux normal|taux reduit/u, "Ventiler correctement la TVA"],
    [/logiciel de caisse|systeme de caisse|caisse certifie|nf525|lne|attestation individuelle/u, "Sécuriser le système de caisse"],
    [/licence|debit de boissons|permis d'exploitation|fermeture administrative/u, "Respecter les obligations réglementaires"],
    [/marge|rentabilite|cout matiere|coefficient multiplicateur/u, "Piloter les marges au quotidien"],
    [/ressources humaines|planning|hcr|salaires|personnel|majorations/u, "Maîtriser la gestion du personnel"],
    [/tresorerie|bfr|flux financiers|echeances fiscales/u, "Anticiper les besoins de trésorerie"],
    [/fournisseurs|conditions de reglement|remises de fin d'annee|rfa/u, "Optimiser les achats et règlements fournisseurs"],
    [/financements|subventions|bpifrance|pret d'honneur/u, "Financer les projets de développement"],
    [/stock|inventaire|coulage|futs|bouteilles|denrees/u, "Contrôler les stocks et le coulage"],
    [/fiche technique|recettes|cuisine|food cost|beverage cost/u, "Suivre les coûts matière par activité"],
    [/restauration|snacking|tapas|plats du jour/u, "Structurer l'activité restauration"],
    [/criteres de comparaison|points de vigilance|suivi|pilotage/u, "Mettre en place un pilotage suivi"],
  ];

  for (const [pattern, heading] of rules) {
    if (pattern.test(normalized) && !usedHeadings.has(heading)) {
      usedHeadings.add(heading);
      return heading;
    }
  }

  const firstSentence = splitSentences(text)[0] ?? text;
  const compact = firstSentence
    .replace(/\s+/gu, " ")
    .replace(/[.:;!?]+$/u, "")
    .trim();
  const fallback = compact.length > 78
    ? `${compact.slice(0, 75).replace(/\s+\S*$/u, "")}...`
    : compact;
  const heading = fallback || `Point de vigilance ${index + 1}`;
  usedHeadings.add(heading);
  return heading;
}

function buildFallbackEditorialLayout(blocks: Block[]): { intro: Block[]; groups: EditorialGroup[] } | null {
  const textBlocks = blocks.filter((block): block is Extract<Block, { type: "p" }> => block.type === "p");
  const hasOnlyParagraphs = textBlocks.length === blocks.length;
  const text = textBlocks.map((block) => block.text).join(" ").replace(/\s+/gu, " ").trim();

  if (!hasOnlyParagraphs || text.length < 900) {
    return null;
  }

  const sentences = splitSentences(text);
  if (sentences.length < 5) {
    return null;
  }

  const introSentenceCount = sentences[0] && sentences[0].length < 260 ? 1 : 2;
  const introText = sentences.slice(0, introSentenceCount).join(" ");
  const chunks = groupSentences(sentences.slice(introSentenceCount));
  const usedHeadings = new Set<string>();

  return {
    intro: [{ type: "p", text: introText }],
    groups: chunks.map((chunk, index) => ({
      title: headingFromText(chunk, index, usedHeadings),
      body: [{ type: "p", text: chunk }],
    })),
  };
}

/** Inline parser for **bold** and *italic*. Returns React children. */
function renderInline(text: string, allowEmphasis = true): React.ReactNode {
  if (!allowEmphasis) {
    return text
      .replaceAll(/\*\*([^*\n]+)\*\*/gu, "$1")
      .replaceAll(/\*([^*\n]+)\*/gu, "$1");
  }

  // Split on **bold** first
  const parts = text.split(/(\*\*[^*\n]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-semibold text-ink">
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
  layout?: "default" | "editorial-grid" | "editorial-single";
}

function renderBlock(b: Block, i: number, h3ClassName?: string) {
  if (b.type === "h3") {
    return (
      <h3
        key={i}
        className={
          h3ClassName
          ?? "mt-6 mb-3 min-w-0 break-words font-display text-[1.15rem] font-medium text-ink [break-inside:avoid] [break-after:avoid]"
        }
      >
        {renderInline(b.text, false)}
      </h3>
    );
  }
  if (b.type === "ul") {
    return (
      <ul key={i} className="my-4 list-disc space-y-2 pl-6 [break-inside:avoid]">
        {b.items.map((item, j) => (
          <li key={j} className="min-w-0 break-words text-base leading-relaxed text-ink-muted">
            {renderInline(item)}
          </li>
        ))}
      </ul>
    );
  }
  return (
    <p
      key={i}
      className="mb-4 min-w-0 break-words text-base leading-relaxed text-ink-muted last:mb-0 [break-inside:avoid]"
    >
      {renderInline(b.text)}
    </p>
  );
}

function renderEditorialLayout(blocks: Block[], columns: "grid" | "single") {
  const intro: Block[] = [];
  let groups: EditorialGroup[] = [];
  let currentGroup: EditorialGroup | null = null;

  for (const block of blocks) {
    if (block.type === "h3") {
      currentGroup = { title: block.text, body: [] };
      groups.push(currentGroup);
      continue;
    }
    if (currentGroup) {
      currentGroup.body.push(block);
    } else {
      intro.push(block);
    }
  }

  const fallbackLayout = groups.length === 0 ? buildFallbackEditorialLayout(blocks) : null;
  const finalIntro = fallbackLayout?.intro ?? intro;
  groups = fallbackLayout?.groups ?? groups;

  return (
    <>
      {finalIntro.length > 0 && (
        <div className="mb-8 max-w-none">
          {finalIntro.map((block, i) => renderBlock(block, i))}
        </div>
      )}
      {groups.length > 0 && (
        <div className={columns === "grid" ? "grid gap-x-12 gap-y-9 lg:grid-cols-2" : "space-y-8"}>
          {groups.map((group, i) => {
            const isOddLast = columns === "grid" && groups.length % 2 === 1 && i === groups.length - 1;
            return (
              <section
                key={`${group.title}-${i}`}
                className={[
                  "min-w-0",
                  isOddLast ? "lg:col-span-2 lg:max-w-none" : "",
                ].filter(Boolean).join(" ")}
              >
                {renderBlock(
                  { type: "h3", text: group.title },
                  0,
                  "mb-3 min-w-0 break-words font-display text-[1.15rem] font-medium leading-snug text-ink",
                )}
                {group.body.map((block, bodyIndex) => renderBlock(block, bodyIndex + 1))}
              </section>
            );
          })}
        </div>
      )}
    </>
  );
}

export function RichText({ text, className = "", layout = "default" }: RichTextProps) {
  const blocks = parseBlocks(sanitizeGeneratedText(text));
  return (
    <div className={`min-w-0 break-words [overflow-wrap:anywhere] ${className}`.trim()}>
      {layout === "editorial-grid"
        ? renderEditorialLayout(blocks, "grid")
        : layout === "editorial-single"
          ? renderEditorialLayout(blocks, "single")
        : blocks.map((b, i) => renderBlock(b, i))}
    </div>
  );
}
