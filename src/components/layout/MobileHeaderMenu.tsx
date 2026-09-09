"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { BriefTrigger } from "@/components/journey/BriefTrigger";

export interface MobileHeaderGroup {
  id: string;
  href: string;
  label: string;
  description: string;
  links: Array<{ href: string; label: string }>;
}

export function MobileHeaderMenu({ groups, coverageLabel }: { groups: MobileHeaderGroup[]; coverageLabel: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(() => {
    const active = groups.find((group) =>
      [group.href, ...group.links.map((link) => link.href)].some(
        (href) => pathname === href || pathname.startsWith(`${href}/`),
      ),
    );
    return active?.id ?? groups[0]?.id ?? null;
  });
  const toggleRef = useRef<HTMLButtonElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setOpen(false);
    const active = groups.find((group) =>
      [group.href, ...group.links.map((link) => link.href)].some(
        (href) => pathname === href || pathname.startsWith(`${href}/`),
      ),
    );
    setExpandedId(active?.id ?? groups[0]?.id ?? null);
  }, [groups, pathname]);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    const backgroundNodes = [document.querySelector("main"), document.querySelector("footer")].filter(
      (node): node is HTMLElement => node instanceof HTMLElement,
    );
    const previousAccessibility = backgroundNodes.map((node) => ({
      node,
      inert: node.hasAttribute("inert"),
      ariaHidden: node.getAttribute("aria-hidden"),
    }));
    document.body.style.overflow = "hidden";
    backgroundNodes.forEach((node) => {
      node.setAttribute("inert", "");
      node.setAttribute("aria-hidden", "true");
    });
    const frame = window.requestAnimationFrame(() => {
      panelRef.current?.querySelector<HTMLElement>("a, button")?.focus();
    });
    return () => {
      window.cancelAnimationFrame(frame);
      document.body.style.overflow = previousOverflow;
      previousAccessibility.forEach(({ node, inert, ariaHidden }) => {
        if (!inert) node.removeAttribute("inert");
        if (ariaHidden === null) node.removeAttribute("aria-hidden");
        else node.setAttribute("aria-hidden", ariaHidden);
      });
    };
  }, [open]);

  const close = (restoreFocus = false) => {
    setOpen(false);
    if (restoreFocus) window.requestAnimationFrame(() => toggleRef.current?.focus());
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape") {
      event.preventDefault();
      close(true);
      return;
    }
    if (event.key !== "Tab" || !panelRef.current) return;
    const nodes = Array.from(panelRef.current.querySelectorAll<HTMLElement>('a[href], button:not([disabled])'));
    const first = nodes[0];
    const last = nodes.at(-1);
    if (!first || !last) return;
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  return (
    <>
      <button
        ref={toggleRef}
        type="button"
        aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
        aria-expanded={open}
        aria-controls="skoria-mobile-navigation"
        onClick={() => setOpen((current) => !current)}
        className={`flex h-11 w-11 items-center justify-center rounded-full border transition-colors lg:hidden ${open ? "border-navy bg-navy text-white" : "border-ink/14 bg-white text-navy"}`}
      >
        <svg aria-hidden width="19" height="19" viewBox="0 0 20 20" fill="none">
          {open ? (
            <><path d="M4 4l12 12M16 4 4 16" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" /></>
          ) : (
            <><path d="M3 5.5h14M3 10h14M3 14.5h14" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" /></>
          )}
        </svg>
      </button>

      {open && (
        <>
          <button
            type="button"
            tabIndex={-1}
            aria-label="Fermer le menu"
            className="fixed inset-0 top-[var(--site-header-height)] z-40 bg-navy/38 backdrop-blur-sm lg:hidden"
            onClick={() => close(true)}
          />
          <div
            ref={panelRef}
            id="skoria-mobile-navigation"
            role="dialog"
            aria-modal="true"
            aria-labelledby="mobile-navigation-title"
            onKeyDown={handleKeyDown}
            className="fixed inset-x-0 top-[var(--site-header-height)] z-50 max-h-[calc(100dvh-var(--site-header-height))] overflow-y-auto overscroll-contain border-t border-ink/10 bg-paper px-4 pb-8 pt-4 shadow-2xl lg:hidden"
          >
            <nav aria-label="Navigation mobile" className="mx-auto max-w-xl">
              <section className="relative isolate overflow-hidden rounded-[1.4rem] bg-navy p-5 text-white">
                <div aria-hidden className="absolute -right-12 -top-12 -z-10 h-40 w-40 rounded-full border-[2.25rem] border-white/[.06]" />
                <p className="text-[.6rem] font-bold uppercase tracking-[.2em] text-[#ffb293]">Votre point de départ</p>
                <h2 id="mobile-navigation-title" className="mt-3 max-w-sm text-[1.75rem] font-semibold leading-[1.05] tracking-[-.04em]">Comparez à partir de votre situation.</h2>
                <p className="mt-3 max-w-md text-[.78rem] leading-6 text-white/65">Cherchez un cabinet, explorez une mission ou construisez un brief à réutiliser.</p>
                <div className="mt-5 grid grid-cols-2 gap-2">
                  <Link href="/annuaire/experts-comptables" onClick={() => close()} className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/28 px-3 text-center text-[.72rem] font-bold text-white hover:bg-white hover:text-navy">
                    Voir l’annuaire
                  </Link>
                  <BriefTrigger onTrigger={() => close()} className="inline-flex min-h-11 items-center justify-center rounded-full bg-orange px-3 text-center text-[.72rem] font-bold text-navy">
                    Construire mon brief
                  </BriefTrigger>
                </div>
              </section>

              <div className="mt-4 space-y-2">
                {groups.map((group, index) => {
                  const expanded = expandedId === group.id;
                  const panelId = `mobile-group-${group.id}`;
                  return (
                    <section key={group.id} className="overflow-hidden rounded-[1.1rem] border border-ink/10 bg-white">
                      <button
                        type="button"
                        aria-expanded={expanded}
                        aria-controls={panelId}
                        onClick={() => setExpandedId(expanded ? null : group.id)}
                        className="flex min-h-16 w-full items-center gap-4 px-4 py-3 text-left"
                      >
                        <span className="font-mono text-[.6rem] font-bold text-blue/55">{String(index + 1).padStart(2, "0")}</span>
                        <span className="flex-1 text-[.94rem] font-semibold text-navy">{group.label}</span>
                        <span aria-hidden className={`flex h-8 w-8 items-center justify-center rounded-full bg-paper text-blue transition-transform ${expanded ? "rotate-45" : ""}`}>+</span>
                      </button>
                      {expanded && (
                        <div id={panelId} className="border-t border-ink/10 bg-lilac/55 px-4 pb-4 pt-3">
                          <p className="text-[.72rem] leading-5 text-ink-muted">{group.description}</p>
                          <ul className="mt-3 grid grid-cols-2 gap-2">
                            {group.links.map((link) => (
                              <li key={`${group.id}-${link.href}-${link.label}`}>
                                <Link href={link.href} aria-current={pathname === link.href || pathname.startsWith(`${link.href}/`) ? "page" : undefined} onClick={() => close()} className="flex min-h-12 items-center justify-between gap-2 rounded-[.8rem] bg-white px-3 py-2 text-[.71rem] font-semibold leading-snug text-navy aria-[current=page]:ring-2 aria-[current=page]:ring-blue/35">
                                  {link.label}<span aria-hidden className="text-blue">→</span>
                                </Link>
                              </li>
                            ))}
                          </ul>
                          <Link href={group.href} onClick={() => close()} className="mt-3 inline-flex items-center gap-2 text-[.7rem] font-bold text-blue">
                            Tout explorer <span aria-hidden>↗</span>
                          </Link>
                        </div>
                      )}
                    </section>
                  );
                })}
              </div>

              <p className="mt-5 text-center font-mono text-[.61rem] uppercase tracking-[.12em] text-ink-muted">{coverageLabel}</p>
            </nav>
          </div>
        </>
      )}
    </>
  );
}
