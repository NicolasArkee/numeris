import React from "react";
import type { DirectoryFactRow } from "./profile-v2-helpers";

export function DirectoryFactTable({ rows }: { rows: DirectoryFactRow[] }) {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-surface">
      <dl className="divide-y divide-border-soft">
        {rows.map((row) => (
          <div
            key={row.label}
            className="grid gap-1 px-5 py-3 text-[0.875rem] sm:grid-cols-[14rem_1fr]"
          >
            <dt className="font-display font-medium text-ink-muted">{row.label}</dt>
            <dd className="font-mono text-ink">{row.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
