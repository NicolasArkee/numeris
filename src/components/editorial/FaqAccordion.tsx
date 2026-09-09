import { RichText } from "../RichText";
import { EDITORIAL_FOCUS } from "./EditorialElements";

export function FaqAccordion({
  items,
  htmlAnswers = false,
}: {
  items: { question: string; answer: string; id?: string | number }[];
  htmlAnswers?: boolean;
}) {
  return (
    <div className="grid min-w-0 gap-3">
      {items.map((item, i) => (
        <details
          key={item.id ?? `${item.question}-${i}`}
          className="group min-w-0 rounded-[1.4rem] border border-ink/10 bg-white transition-colors open:border-blue/20 open:bg-lilac/45"
        >
          <summary
            className={`flex cursor-pointer list-none items-start gap-4 rounded-[1.4rem] p-5 sm:p-6 ${EDITORIAL_FOCUS} [&::-webkit-details-marker]:hidden`}
          >
            <span
              aria-hidden="true"
              className="mt-1 hidden min-w-6 font-mono text-xs text-blue sm:block"
            >
              {String(i + 1).padStart(2, "0")}
            </span>
            <span className="min-w-0 flex-1 text-[1rem] font-bold leading-6 text-ink sm:text-[1.06rem]">
              {item.question}
            </span>
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-paper text-blue transition-colors group-open:bg-blue group-open:text-white">
              <svg
                aria-hidden="true"
                className="h-4 w-4 transition-transform group-open:rotate-45"
                viewBox="0 0 20 20"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
              >
                <path d="M4 10h12M10 4v12" />
              </svg>
            </span>
          </summary>
          <div className="px-5 pb-6 sm:pl-16 sm:pr-8">
            {htmlAnswers ? (
              <div
                className="max-w-none break-words text-base leading-7 text-ink-muted [&_a]:text-blue [&_a]:underline [&_li]:mb-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_p+p]:mt-4 [&_ul]:list-disc [&_ul]:pl-5"
                dangerouslySetInnerHTML={{ __html: item.answer }}
              />
            ) : (
              <RichText text={item.answer} className="max-w-none" />
            )}
          </div>
        </details>
      ))}
    </div>
  );
}
