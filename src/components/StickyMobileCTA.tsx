"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

interface StickyMobileCTAProps {
  label?: string;
  href?: string;
  phone?: string;
}

export function StickyMobileCTA({
  label = "Devis gratuit",
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
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-nuit/95 px-4 py-3 backdrop-blur-md lg:hidden">
      <div className="flex items-center gap-3">
        <Link
          href={`tel:${phone.replace(/\s/g, "")}`}
          className="flex h-11 w-11 flex-shrink-0 items-center justify-center border border-white/15 text-[1rem] transition-colors hover:border-or"
          aria-label="Appeler"
        >
          📞
        </Link>
        <Link
          href={href}
          className="flex h-11 flex-1 items-center justify-center bg-or text-[0.82rem] font-semibold text-blanc transition-colors hover:bg-[#b08844]"
        >
          {label} →
        </Link>
      </div>
    </div>
  );
}
