// ─── StatsBand ───
// Bande de stats homepage : chrome de section (border-b + paddings) autour
// de StatHighlight variant="band". Les données doivent toujours être passées
// explicitement afin d'éviter de republier d'anciens chiffres non sourcés.

import { StatHighlight, type Stat } from "./StatHighlight";

export function StatsBand({ stats }: { stats: Stat[] }) {
  if (stats.length === 0) return null;
  return (
    <section className="border-b border-border-soft bg-surface">
      <div className="mx-auto max-w-[82rem] px-6 py-12 lg:px-[4.5rem]">
        <StatHighlight stats={stats} variant="band" />
      </div>
    </section>
  );
}
