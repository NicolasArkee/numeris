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
      <h2 className="mb-6 font-display text-[1.25rem] font-bold text-ink">
        {title}
      </h2>
      <div className="flex flex-wrap gap-2">
        {villes.map((v) => (
          <a
            key={v.slug}
            href={`/villes/${v.slug}`}
            className="border border-border-soft bg-surface px-4 py-2 text-[0.78rem] text-ink-muted transition-colors hover:border-accent-500 hover:text-accent-700"
          >
            {v.name}
          </a>
        ))}
      </div>
    </div>
  );
}
