"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";
import {
  OPEN_BRIEF_EVENT,
  type BriefPrefill,
  type OpenBriefEventDetail,
} from "./types";

export interface BriefTriggerProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "type" | "children"> {
  prefill?: BriefPrefill;
  children?: ReactNode;
  onTrigger?: () => void;
}

export function openBrief(prefill: BriefPrefill = {}) {
  document.dispatchEvent(
    new CustomEvent<OpenBriefEventDetail>(OPEN_BRIEF_EVENT, {
      detail: { prefill },
    }),
  );
}

export function BriefTrigger({
  prefill,
  children = "Préparer mon brief",
  className = "inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-orange px-6 py-3 text-[.875rem] font-bold text-navy transition-colors hover:bg-apricot",
  onClick,
  onTrigger,
  ...props
}: BriefTriggerProps) {
  return (
    <button
      {...props}
      type="button"
      className={className}
      onClick={(event) => {
        onClick?.(event);
        if (event.defaultPrevented) return;
        onTrigger?.();
        openBrief(prefill);
      }}
    >
      {children}
    </button>
  );
}
