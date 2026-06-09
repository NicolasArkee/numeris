// ─── VillesStrip ───
// Bande de tags de maillage interne vers les pages villes. Extraite du
// template secteurs — réutilisée par secteurs (DB + fallback) et departements.

import type { Ville } from "@/libs/db";

interface VillesStripProps {
  title: string;
  villes: Ville[];
}

export function VillesStrip({ title, villes }: VillesStripProps) {
  if (villes.length === 0) return null;
  return (
    <div className="mb-12">
      <h2 className="mb-6 font-serif text-[1.25rem] font-light text-encre">
        {title}
      </h2>
      <div className="flex flex-wrap gap-2">
        {villes.map((v) => (
          <a
            key={v.slug}
            href={`/villes/${v.slug}`}
            className="border border-pierre-12 bg-blanc px-4 py-2 text-[0.78rem] text-encre-75 transition-colors hover:border-or hover:text-or-fonce"
          >
            {v.name}
          </a>
        ))}
      </div>
    </div>
  );
}
