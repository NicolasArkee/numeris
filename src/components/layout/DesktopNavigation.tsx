"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";

export interface DesktopNavigationItem {
  label: string;
  href: string;
  description?: string;
  icon?: string;
}

export interface DesktopNavigationSection {
  title: string;
  items: DesktopNavigationItem[];
  seeAll?: { label: string; href: string };
}

export interface DesktopNavigationMenu {
  label: string;
  href?: string;
  layout?: "links" | "cards";
  sections: DesktopNavigationSection[];
}

interface DesktopNavigationProps {
  menus: DesktopNavigationMenu[];
  simpleLinks: { label: string; href: string }[];
}

function routeMatches(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function isMenuActive(pathname: string, menu: DesktopNavigationMenu): boolean {
  const destinations = [
    ...(menu.href ? [menu.href] : []),
    ...menu.sections.flatMap((section) => section.items.map((item) => item.href)),
  ];
  return destinations.some((href) => routeMatches(pathname, href));
}

export function DesktopNavigation({ menus, simpleLinks }: DesktopNavigationProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const pathname = usePathname();
  const navRef = useRef<HTMLElement | null>(null);
  const buttonRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const panelIdPrefix = useId().replace(/:/gu, "");

  useEffect(() => setOpenIndex(null), [pathname]);

  useEffect(() => {
    if (openIndex === null) return;
    const handlePointerDown = (event: PointerEvent) => {
      if (event.target instanceof Node && !navRef.current?.contains(event.target)) {
        setOpenIndex(null);
      }
    };
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [openIndex]);

  const closeAndFocus = (index: number) => {
    setOpenIndex(null);
    window.requestAnimationFrame(() => buttonRefs.current[index]?.focus());
  };

  const focusFirstLink = (index: number) => {
    setOpenIndex(index);
    window.requestAnimationFrame(() => {
      document
        .getElementById(`${panelIdPrefix}-panel-${index}`)
        ?.querySelector<HTMLElement>("a[href]")
        ?.focus();
    });
  };

  const handleButtonKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      focusFirstLink(index);
    } else if (event.key === "Escape" && openIndex === index) {
      event.preventDefault();
      closeAndFocus(index);
    }
  };

  return (
    <nav
      ref={navRef}
      aria-label="Navigation principale"
      className="ml-auto hidden items-center gap-1 rounded-full border border-ink/8 bg-navy/[.045] p-1.5 lg:flex"
      onKeyDown={(event) => {
        if (event.key === "Escape" && openIndex !== null) {
          event.preventDefault();
          closeAndFocus(openIndex);
        }
      }}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setOpenIndex(null);
      }}
    >
      {menus.map((menu, index) => {
        const open = openIndex === index;
        const active = isMenuActive(pathname, menu);
        const panelId = `${panelIdPrefix}-panel-${index}`;
        return (
          <div key={menu.label}>
            <button
              ref={(node) => { buttonRefs.current[index] = node; }}
              type="button"
              aria-haspopup="true"
              aria-expanded={open}
              aria-controls={panelId}
              onClick={() => setOpenIndex(open ? null : index)}
              onKeyDown={(event) => handleButtonKeyDown(event, index)}
              className={`inline-flex min-h-10 items-center gap-1.5 rounded-full px-3 font-display text-[.78rem] font-semibold transition-all xl:px-4 xl:text-[.82rem] ${
                open
                  ? "bg-navy text-white shadow-sm"
                  : active
                    ? "bg-white text-blue shadow-sm"
                    : "text-ink-muted hover:bg-white hover:text-blue"
              }`}
            >
              {menu.label}
              <svg aria-hidden width="12" height="12" viewBox="0 0 12 12" fill="none" className={`transition-transform ${open ? "rotate-180" : ""}`}>
                <path d="m3 4.5 3 3 3-3" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            {open && (
              <NavigationPanel
                id={panelId}
                menu={menu}
                index={index}
                onClose={() => closeAndFocus(index)}
              />
            )}
          </div>
        );
      })}

      {simpleLinks.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          prefetch={false}
          className="inline-flex min-h-10 items-center rounded-full px-3 font-display text-[.78rem] font-semibold text-ink-muted transition-colors hover:bg-white hover:text-blue xl:px-4 xl:text-[.82rem]"
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}

function NavigationPanel({
  id,
  menu,
  index,
  onClose,
}: {
  id: string;
  menu: DesktopNavigationMenu;
  index: number;
  onClose: () => void;
}) {
  const pathname = usePathname();
  const items = menu.sections.flatMap((section) => section.items);
  const primarySection = menu.sections[0];
  const seeAll = primarySection?.seeAll ?? (menu.href ? { label: `Explorer ${menu.label.toLowerCase()}`, href: menu.href } : undefined);

  return (
    <div
      id={id}
      onKeyDown={(event) => {
        if (event.key === "Escape") onClose();
      }}
      className="fixed left-1/2 top-[var(--site-header-height)] z-50 w-[min(calc(100vw_-_2rem),68rem)] -translate-x-1/2 overflow-hidden rounded-b-[1.75rem] border border-ink/10 bg-white shadow-[0_28px_80px_rgba(7,29,60,.2)]"
    >
      <div className="grid min-h-[22rem] grid-cols-[.68fr_1.32fr]">
        <div className="relative isolate overflow-hidden bg-navy p-8 text-white">
          <div aria-hidden className="absolute -bottom-24 -right-16 -z-10 h-64 w-64 rounded-full border-[3rem] border-white/[.06]" />
          <p className="font-mono text-[.62rem] font-bold uppercase tracking-[.2em] text-[#ffb293]">
            Parcours {String(index + 1).padStart(2, "0")}
          </p>
          <h2 className="mt-6 text-[clamp(2.2rem,4vw,3.6rem)] font-semibold leading-none tracking-[-.045em]">
            {menu.label}
          </h2>
          {primarySection && (
            <p className="mt-5 max-w-sm text-[.86rem] leading-7 text-white/67">{primarySection.title}</p>
          )}
          {seeAll && (
            <Link href={seeAll.href} prefetch={false} className="mt-9 inline-flex min-h-11 items-center rounded-full bg-orange px-5 text-[.76rem] font-bold text-navy transition-transform hover:-translate-y-0.5">
              {seeAll.label}&nbsp; ↗
            </Link>
          )}
        </div>

        <div className="relative p-6 lg:p-8">
          <div className="flex items-center justify-between gap-5">
            <p className="text-[.62rem] font-bold uppercase tracking-[.2em] text-blue">Accès directs</p>
            <button type="button" onClick={onClose} aria-label={`Fermer le menu ${menu.label}`} className="flex h-9 w-9 items-center justify-center rounded-full border border-ink/12 text-lg text-ink-muted hover:bg-paper hover:text-navy">×</button>
          </div>
          <ul className="mt-6 grid grid-cols-2 gap-2">
            {items.map((item, itemIndex) => (
              <li key={`${item.href}-${item.label}`}>
                <Link
                  href={item.href}
                  prefetch={false}
                  aria-current={routeMatches(pathname, item.href) ? "page" : undefined}
                  className="group flex min-h-[5.5rem] items-center gap-4 rounded-[1rem] border border-ink/10 bg-paper px-4 py-3 transition-colors hover:border-blue/30 hover:bg-lilac"
                >
                  <span className="font-mono text-[.61rem] font-bold text-blue/55">{String(itemIndex + 1).padStart(2, "0")}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[.84rem] font-semibold leading-snug text-navy">{item.label}</span>
                    {item.description && <span className="mt-1 line-clamp-1 block text-[.68rem] text-ink-muted">{item.description}</span>}
                  </span>
                  <span aria-hidden className="text-blue transition-transform group-hover:translate-x-1">→</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
