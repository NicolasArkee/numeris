import React from "react";
import type {
  DirectoryEnrichmentSource,
  DirectoryProfileFact,
  DirectoryQualificationSnapshot,
} from "@/libs/db";
import { groupDirectoryProfileFacts } from "@/libs/directory/enrichment";
import { formatDirectoryDate } from "./profile-v2-helpers";

function sourceById(
  sources: DirectoryEnrichmentSource[],
): Map<number, DirectoryEnrichmentSource> {
  return new Map(sources.map((source) => [source.id, source]));
}

export function filterDirectoryFactsWithLoadedSources(
  facts: DirectoryProfileFact[],
  sources: DirectoryEnrichmentSource[],
): DirectoryProfileFact[] {
  const sourceIds = new Set(sources.map((source) => source.id));
  return facts.filter(
    (fact) => fact.source_id != null && sourceIds.has(fact.source_id),
  );
}

function qualificationMessage(
  snapshot: DirectoryQualificationSnapshot,
): string {
  if (snapshot.blocking_reason) {
    return "Cette fiche conserve un statut de controle avant toute qualification supplementaire.";
  }

  if (
    snapshot.professional_status === "verified"
    || snapshot.professional_status === "manual_verified"
  ) {
    return "Les informations enrichies affichees sont rattachees a une fiche documentee.";
  }

  return "Les informations enrichies affichees restent separees du statut professionnel de la fiche.";
}

function FactList({
  title,
  facts,
  sources,
}: {
  title: string;
  facts: DirectoryProfileFact[];
  sources: Map<number, DirectoryEnrichmentSource>;
}) {
  if (facts.length === 0) return null;

  return (
    <section className="rounded-xl border border-border bg-surface p-6 shadow-sm">
      <h3 className="font-display text-[1.125rem] font-semibold text-ink">
        {title}
      </h3>
      <ul className="mt-4 grid gap-3">
        {facts.map((fact) => {
          const source = fact.source_id ? sources.get(fact.source_id) : null;
          return (
            <li
              key={fact.id}
              className="text-[0.9375rem] leading-6 text-ink-muted"
            >
              <span className="font-display font-semibold text-ink">
                {fact.label}
              </span>
              {": "}
              {fact.value.startsWith("http") ? (
                <a
                  href={fact.value}
                  className="break-words text-brand-700 transition-colors hover:text-brand-500"
                  rel="nofollow noopener noreferrer"
                >
                  {fact.value}
                </a>
              ) : (
                fact.value
              )}
              {source?.retrieved_at && (
                <span className="ml-2 font-mono text-[0.75rem] text-ink-soft">
                  Source {formatDirectoryDate(source.retrieved_at)}
                </span>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export function DirectoryEnrichmentPanel({
  facts,
  sources,
  snapshot,
}: {
  facts: DirectoryProfileFact[];
  sources: DirectoryEnrichmentSource[];
  snapshot: DirectoryQualificationSnapshot | null;
}) {
  const sourcedFacts = filterDirectoryFactsWithLoadedSources(facts, sources);
  if (sourcedFacts.length === 0 && !snapshot) return null;

  const grouped = groupDirectoryProfileFacts(sourcedFacts);
  const sourcesById = sourceById(sources);

  return (
    <section>
      <div className="mb-5">
        <h2 className="font-display text-[1.5rem] font-bold text-ink">
          Profil enrichi
        </h2>
        <p className="mt-2 max-w-3xl text-[0.9375rem] leading-7 text-ink-muted">
          Ces informations proviennent de sources identifiees et ne sont affichees
          que lorsqu'elles sont suffisamment documentees.
        </p>
      </div>
      <div className="grid gap-5 md:grid-cols-2">
        <FactList
          title="Coordonnees verifiees"
          facts={grouped.contact}
          sources={sourcesById}
        />
        <FactList
          title="Services detectes"
          facts={grouped.services}
          sources={sourcesById}
        />
        <FactList
          title="Secteurs mentionnes"
          facts={grouped.sectors}
          sources={sourcesById}
        />
        <FactList
          title="Signaux publics"
          facts={[...grouped.software, ...grouped.evidence]}
          sources={sourcesById}
        />
        {snapshot && (
          <section className="rounded-xl border border-border bg-bg-muted p-6 md:col-span-2">
            <h3 className="font-display text-[1.125rem] font-semibold text-ink">
              Controle des donnees
            </h3>
            <p className="mt-3 text-[0.9375rem] leading-7 text-ink-muted">
              {qualificationMessage(snapshot)}
            </p>
          </section>
        )}
      </div>
    </section>
  );
}
