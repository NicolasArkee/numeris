import React from "react";
import type { DirectoryFaqItem } from "./profile-v2-helpers";

export function DirectoryFaq({ items }: { items: DirectoryFaqItem[] }) {
  if (items.length === 0) return null;

  return (
    <section>
      <h2 className="font-display text-[1.5rem] font-bold text-ink">
        Questions fréquentes
      </h2>
      <div className="mt-5 overflow-hidden rounded-lg border border-border bg-surface">
        <div className="divide-y divide-border-soft">
          {items.map((item) => (
            <details key={item.question} className="group">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 font-display text-[0.9375rem] font-medium text-ink transition-colors hover:text-brand-700">
                <span>{item.question}</span>
                <span aria-hidden className="text-brand-700 transition-transform group-open:rotate-90">
                  →
                </span>
              </summary>
              <div className="border-t border-border-soft bg-bg-muted px-5 py-4 text-[0.9375rem] leading-7 text-ink-muted">
                {item.answer}
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
