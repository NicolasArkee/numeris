"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

interface NavLink {
  href: string;
  label: string;
}

interface MobileMenuProps {
  links: NavLink[];
  ctaLabel?: string;
  ctaHref?: string;
}

export function MobileMenu({
  links,
  ctaLabel = "Comparer",
  ctaHref = "/contact",
}: MobileMenuProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Auto-close when the route changes (link click).
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Lock body scroll while the drawer is open.
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  // Close on Escape.
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <button
        type="button"
        aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
        aria-expanded={open}
        aria-controls="mobile-nav-drawer"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-border bg-surface text-ink transition-colors hover:border-brand-500 hover:text-brand-700 lg:hidden"
      >
        {open ? (
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
        ) : (
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="M4 6h16" />
            <path d="M4 12h16" />
            <path d="M4 18h16" />
          </svg>
        )}
      </button>

      {/* Drawer panel */}
      <div
        id="mobile-nav-drawer"
        className={`fixed inset-x-0 top-16 z-40 origin-top border-b border-border bg-surface shadow-xl transition-all duration-200 lg:hidden ${
          open
            ? "pointer-events-auto translate-y-0 opacity-100"
            : "pointer-events-none -translate-y-2 opacity-0"
        }`}
        aria-hidden={!open}
      >
        <nav className="mx-auto flex max-w-328 flex-col gap-1 px-6 py-4">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center justify-between rounded-md px-3 py-3 font-display text-[1rem] font-semibold text-ink transition-colors hover:bg-bg hover:text-brand-700"
            >
              {link.label}
              <span aria-hidden className="text-ink-soft">→</span>
            </Link>
          ))}
          <Link
            href={ctaHref}
            className="mt-3 inline-flex items-center justify-center gap-1.5 rounded-md bg-accent-500 px-5 py-3 font-display text-[0.9375rem] font-semibold text-surface shadow-sm transition-colors hover:bg-accent-700"
          >
            {ctaLabel}
            <span aria-hidden>→</span>
          </Link>
          <p className="mt-2 px-3 py-2 text-center font-body text-[0.75rem] text-ink-soft">
            100 % gratuit · Sans engagement · Sources publiques
          </p>
        </nav>
      </div>

      {/* Backdrop */}
      <div
        className={`fixed inset-0 top-16 z-30 bg-brand-ink/30 backdrop-blur-sm transition-opacity duration-200 lg:hidden ${
          open
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
        onClick={() => setOpen(false)}
        aria-hidden
      />
    </>
  );
}
