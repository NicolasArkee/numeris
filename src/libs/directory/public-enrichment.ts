import type { DirectoryEnrichmentSource, DirectoryProfileFact } from "@/libs/db";

/** Reserved .test domains identify demonstrations, never public evidence. */
export function isPublicDirectoryEnrichmentSource(source: DirectoryEnrichmentSource): boolean {
  if (!source.source_url) return true;
  try {
    const hostname = new URL(source.source_url).hostname.toLowerCase().replace(/\.$/, "");
    return hostname !== "test" && !hostname.endsWith(".test");
  } catch {
    return false;
  }
}

export function filterDirectoryFactsWithLoadedSources(
  facts: DirectoryProfileFact[],
  sources: DirectoryEnrichmentSource[],
): DirectoryProfileFact[] {
  const sourceIds = new Set(sources.filter(isPublicDirectoryEnrichmentSource).map((source) => source.id));
  return facts.filter((fact) => fact.source_id != null && sourceIds.has(fact.source_id));
}
