import React from "react";
import type { DirectoryFactRow } from "./profile-v2-helpers";

export function DirectoryFactTable({ rows }: { rows: DirectoryFactRow[] }) {
  return (
    <div className="overflow-hidden rounded-[1.5rem] border border-ink/10 bg-white">
      <dl className="divide-y divide-ink/10">
        {rows.map((row, index) => (
          <div key={row.label} className={`grid min-w-0 gap-2 px-5 py-5 text-[.9rem] sm:grid-cols-[minmax(0,.8fr)_minmax(0,1.2fr)] sm:gap-5 sm:px-6 ${index % 2 === 0 ? "bg-paper/60" : "bg-white"}`}>
            <dt className="font-display text-[.8rem] font-bold text-ink-muted">{row.label}</dt>
            <dd className="min-w-0 break-words font-medium leading-6 text-ink">{row.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
