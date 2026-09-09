"use client";

import { useEffect, useState } from "react";
import { openBrief } from "./BriefTrigger";
import {
  BRIEF_SAVED_EVENT,
  BRIEF_STORAGE_KEY,
  RESUME_DISMISSED_KEY,
  hasBriefContent,
  isBriefDraft,
  type BriefDraft,
} from "./types";

function readBrief(): BriefDraft | null {
  try {
    const raw = window.localStorage.getItem(BRIEF_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    return isBriefDraft(parsed) && hasBriefContent(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function JourneyResume() {
  const [brief, setBrief] = useState<BriefDraft | null>(null);
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    try {
      setDismissed(window.sessionStorage.getItem(RESUME_DISMISSED_KEY) === "1");
    } catch {
      setDismissed(false);
    }
    setBrief(readBrief());

    const handleSaved = (event: Event) => {
      const next = (event as CustomEvent<BriefDraft>).detail;
      if (isBriefDraft(next) && hasBriefContent(next)) setBrief(next);
    };
    const handleStorage = (event: StorageEvent) => {
      if (event.key === BRIEF_STORAGE_KEY) setBrief(readBrief());
    };
    document.addEventListener(BRIEF_SAVED_EVENT, handleSaved);
    window.addEventListener("storage", handleStorage);
    return () => {
      document.removeEventListener(BRIEF_SAVED_EVENT, handleSaved);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  if (!brief || dismissed) return null;

  const context = [brief.profession, brief.city].filter(Boolean).join(" · ");

  return (
    <aside
      aria-label="Reprendre votre brief"
      className="fixed bottom-4 right-4 z-50 flex max-w-[calc(100%_-_2rem)] items-stretch overflow-hidden rounded-full border border-white/15 bg-brand-ink text-white shadow-xl sm:bottom-6 sm:right-6"
    >
      <button
        type="button"
        onClick={() => openBrief()}
        className="flex min-h-12 items-center gap-3 px-5 text-left transition-colors hover:bg-white/10"
      >
        <span aria-hidden className="h-2 w-2 shrink-0 rounded-full bg-accent-500" />
        <span>
          <span className="block font-display text-[0.78rem] font-semibold">
            Reprendre mon brief
          </span>
          {context && (
            <span className="hidden max-w-52 truncate text-[0.66rem] text-white/55 sm:block">
              {context}
            </span>
          )}
        </span>
      </button>
      <button
        type="button"
        aria-label="Masquer le raccourci du brief pour cette session"
        onClick={() => {
          try {
            window.sessionStorage.setItem(RESUME_DISMISSED_KEY, "1");
          } catch {
            // The shortcut can still be dismissed in memory.
          }
          setDismissed(true);
        }}
        className="flex w-10 items-center justify-center border-l border-white/10 text-lg text-white/55 transition-colors hover:bg-white/10 hover:text-white"
      >
        ×
      </button>
    </aside>
  );
}
