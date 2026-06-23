// ─── StatsBand ───
// Bande de stats homepage : chrome de section (border-b + paddings) autour
// de StatHighlight variant="band". Les 4 stats par défaut sont la copy
// homepage historique ; passer `stats` pour un autre jeu.

import { StatHighlight, type Stat } from "./StatHighlight";

const defaultStats: Stat[] = [
  { value: "500+", label: "Clients accompagnés" },
  { value: "28", label: "Années d'expérience" },
  { value: "15", label: "Collaborateurs experts" },
  { value: "98%", label: "Taux de fidélisation" },
];

export function StatsBand({ stats = defaultStats }: { stats?: Stat[] }) {
  return (
    <section className="border-b border-border-soft bg-surface">
      <div className="mx-auto max-w-[82rem] px-6 py-12 lg:px-[4.5rem]">
        <StatHighlight stats={stats} variant="band" />
      </div>
    </section>
  );
}
