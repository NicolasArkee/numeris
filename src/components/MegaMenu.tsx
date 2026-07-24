"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Icon } from "./Icon";

export interface MegaMenuLinkItem {
  label: string;
  href: string;
  description?: string;
  icon?: string;
}

export interface MegaMenuSection {
  title: string;
  items: MegaMenuLinkItem[];
  seeAll?: { label: string; href: string };
}

export interface MegaMenuConfig {
  label: string;
  href?: string;
  /** "links" = 3-col text columns ; "cards" = 2-col cards with icon + description. */
  layout?: "links" | "cards";
  sections: MegaMenuSection[];
}

interface MegaMenuProps {
  menus: MegaMenuConfig[];
  simpleLinks: { label: string; href: string }[];
}

export function MegaMenu({ menus, simpleLinks }: MegaMenuProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pathname = usePathname();

  // Auto-close on route change.
  useEffect(() => {
    setOpenIndex(null);
  }, [pathname]);

  // Close on Escape.
  useEffect(() => {
    if (openIndex === null) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpenIndex(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openIndex]);

  const handleOpen = (idx: number) => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpenIndex(idx);
  };
  const handleClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setOpenIndex(null), 150);
  };

  return (
    <nav
      aria-label="Navigation principale"
      className="ml-auto hidden items-center gap-7 lg:flex"
    >
      {menus.map((menu, idx) => {
        const open = openIndex === idx;
        return (
          <div
            key={menu.label}
            className="relative"
            onMouseEnter={() => handleOpen(idx)}
            onMouseLeave={handleClose}
          >
            <button
              type="button"
              aria-haspopup="true"
              aria-expanded={open}
              onClick={() => setOpenIndex(open ? null : idx)}
              className={`inline-flex items-center gap-1 font-display text-[0.9375rem] font-medium transition-colors ${
                open ? "text-brand-700" : "text-ink-muted hover:text-brand-700"
              }`}
            >
              {menu.label}
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
                className={`transition-transform ${open ? "rotate-180" : ""}`}
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </button>

            <Panel menu={menu} open={open} />
          </div>
        );
      })}
      {simpleLinks.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          prefetch={false}
          className="font-display text-[0.9375rem] font-medium text-ink-muted transition-colors hover:text-brand-700"
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}

function Panel({ menu, open }: { menu: MegaMenuConfig; open: boolean }) {
  const layout = menu.layout ?? "links";
  const widthClass = layout === "cards" ? "w-180" : "w-200";

  return (
    <div
      className={`absolute left-1/2 top-full z-40 mt-3 -translate-x-1/2 origin-top transition-all duration-150 ${widthClass} ${
        open
          ? "pointer-events-auto translate-y-0 opacity-100"
          : "pointer-events-none -translate-y-1 opacity-0"
      }`}
      aria-hidden={!open}
    >
      <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-xl">
        {layout === "cards" ? <CardsLayout menu={menu} /> : <LinksLayout menu={menu} />}
      </div>
    </div>
  );
}

function LinksLayout({ menu }: { menu: MegaMenuConfig }) {
  const colCount = Math.min(menu.sections.length, 4);
  const gridClass = colCount === 4 ? "grid-cols-4" : colCount === 3 ? "grid-cols-3" : colCount === 2 ? "grid-cols-2" : "grid-cols-1";
  return (
    <div className={`grid ${gridClass} gap-6 p-6`}>
      {menu.sections.map((section) => (
        <div key={section.title}>
          <p className="mb-3 font-display text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-ink-soft">
            {section.title}
          </p>
          <ul className="space-y-0.5">
            {section.items.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  prefetch={false}
                  className="block rounded-md px-2 py-1.5 text-[0.875rem] text-ink transition-colors hover:bg-bg hover:text-brand-700"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          {section.seeAll && (
            <Link
              href={section.seeAll.href}
              prefetch={false}
              className="mt-3 inline-flex items-center gap-1 px-2 font-display text-[0.8125rem] font-semibold text-brand-700 transition-colors hover:text-brand-500"
            >
              {section.seeAll.label}
              <span aria-hidden>→</span>
            </Link>
          )}
        </div>
      ))}
    </div>
  );
}

function CardsLayout({ menu }: { menu: MegaMenuConfig }) {
  // Cards layout flattens all items into a 2-col grid; sections are headers above their items.
  return (
    <div className="p-5">
      {menu.sections.map((section, sectionIdx) => (
        <div key={section.title} className={sectionIdx > 0 ? "mt-5" : ""}>
          {menu.sections.length > 1 && (
            <p className="mb-3 px-2 font-display text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-ink-soft">
              {section.title}
            </p>
          )}
          <div className="grid grid-cols-2 gap-2">
            {section.items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                prefetch={false}
                className="group flex items-start gap-3 rounded-lg p-3 transition-colors hover:bg-bg"
              >
                {item.icon && (
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-brand-100 bg-brand-50 text-brand-700 transition-colors group-hover:border-accent-300 group-hover:bg-accent-50 group-hover:text-accent-700">
                    <Icon name={item.icon} size={20} />
                  </div>
                )}
                <div className="min-w-0">
                  <p className="font-display text-[0.9375rem] font-semibold text-ink transition-colors group-hover:text-brand-700">
                    {item.label}
                  </p>
                  {item.description && (
                    <p className="mt-0.5 line-clamp-2 text-[0.8125rem] leading-snug text-ink-muted">
                      {item.description}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
          {section.seeAll && (
            <Link
              href={section.seeAll.href}
              prefetch={false}
              className="mt-3 inline-flex items-center gap-1 px-3 font-display text-[0.8125rem] font-semibold text-brand-700 transition-colors hover:text-brand-500"
            >
              {section.seeAll.label}
              <span aria-hidden>→</span>
            </Link>
          )}
        </div>
      ))}
    </div>
  );
}
