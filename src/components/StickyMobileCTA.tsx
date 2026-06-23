"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

interface StickyMobileCTAProps {
  label?: string;
  href?: string;
  phone?: string;
}

export function StickyMobileCTA({
  label = "Demander une orientation",
  href = "/contact",
  phone = "01 42 36 XX XX",
}: StickyMobileCTAProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 600);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-brand-ink/95 px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] backdrop-blur-md lg:hidden">
      <div className="flex items-center gap-3">
        <Link
          href={`tel:${phone.replace(/\s/g, "")}`}
          className="flex h-11 w-11 flex-shrink-0 items-center justify-center border border-white/15 text-[1rem] transition-colors hover:border-accent-500"
          aria-label="Appeler"
        >
          📞
        </Link>
        <Link
          href={href}
          className="flex h-11 flex-1 items-center justify-center bg-accent-500 text-[0.82rem] font-semibold text-brand-ink transition-colors hover:bg-accent-700"
        >
          {label} →
        </Link>
      </div>
    </div>
  );
}
