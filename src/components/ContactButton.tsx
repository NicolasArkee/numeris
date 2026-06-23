"use client";

import { useRouter } from "next/navigation";
import type { ReactNode } from "react";

/**
 * Non-crawlable contact CTA (TECH-03).
 *
 * Renders a <button> that navigates client-side via the router instead of an
 * <a href> — crawlers don't follow it, so the site-wide /contact CTAs (nav,
 * footer, mobile menu, sticky bar, content CTAs) stop funneling internal
 * PageRank to the utility /contact page. /contact stays indexable via the
 * sitemap. Visually identical (same className), keyboard-accessible (native
 * button + aria-label).
 */
export function ContactButton({
  children,
  className,
  href = "/contact",
  ariaLabel = "Aller au formulaire de contact",
  onClick,
}: {
  children: ReactNode;
  className?: string;
  href?: string;
  ariaLabel?: string;
  /** Optional side-effect run before navigation (e.g. close the mobile menu). */
  onClick?: () => void;
}) {
  const router = useRouter();
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      className={className}
      onClick={() => {
        onClick?.();
        router.push(href);
      }}
    >
      {children}
    </button>
  );
}
