function truncateAtWord(value: string, maxLength: number): string {
  const normalized = value.replace(/\s+/gu, " ").trim();
  if (normalized.length <= maxLength) return normalized;
  const candidate = normalized.slice(0, maxLength - 1);
  const lastSpace = candidate.lastIndexOf(" ");
  const cut = lastSpace >= Math.floor(maxLength * 0.65)
    ? candidate.slice(0, lastSpace)
    : candidate;
  return `${cut.replace(/[,:;\s]+$/u, "")}…`;
}

/** Next's root metadata template appends `| Skoria`. Remove only a duplicate
 * terminal site suffix supplied by the CMS and preserve the editorial title. */
export function normalizeDbMetaTitle(title: string | null): string | null {
  if (!title) return title;
  return truncateAtWord(
    title.replace(/\s*(?:\||—|-)\s*Skoria\s*$/iu, "").trim(),
    56,
  );
}

/** Keep dynamic CMS descriptions inside the V2 search-snippet contract. */
export function normalizeMetaDescription(description: string | null): string | null {
  if (!description) return description;
  return truncateAtWord(description, 165);
}
