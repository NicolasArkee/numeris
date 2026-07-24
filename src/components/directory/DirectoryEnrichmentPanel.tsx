import React from "react";
import type {
  DirectoryCabinetCard,
  DirectoryEnrichmentSource,
  DirectoryProfileFact,
  DirectoryQualificationSnapshot,
} from "@/libs/db";
import {
  extractDirectoryTeamMembers,
  findDirectoryProfileSummary,
  groupDirectoryProfileFacts,
} from "@/libs/directory/enrichment";
import {
  parseDirectoryServiceFactMetadata,
  type DirectoryServiceFactMetadata,
} from "@/libs/directory/service-knowledge-graph";
import { formatDirectoryDate } from "./profile-v2-helpers";
import { DirectoryStaticMap } from "./DirectoryStaticMap";

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
  sectionId,
  sectionClassName = "",
  listClassName = "",
}: {
  title: string;
  facts: DirectoryProfileFact[];
  sources: Map<number, DirectoryEnrichmentSource>;
  sectionId?: string;
  sectionClassName?: string;
  listClassName?: string;
}) {
  if (facts.length === 0) return null;

  return (
    <section
      id={sectionId}
      className={`rounded-xl border border-border bg-surface p-6 shadow-sm ${sectionClassName}`}
    >
      <h3 className="font-display text-[1.125rem] font-semibold text-ink">
        {title}
      </h3>
      <ul className={`mt-4 grid gap-3 ${listClassName}`}>
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

const SOFTWARE_FAVICONS: Record<string, string> = {
  Cegid: "https://www.cegid.com/favicon.ico",
  Dext: "https://dext.com/favicon.ico",
  Pennylane: "https://www.pennylane.com/favicon.ico",
  Sage: "https://www.sage.com/favicon.ico",
  Silae: "https://www.silae.fr/favicon.ico",
  Tiime: "https://www.tiime.fr/favicon.ico",
};

function SoftwareList({
  facts,
  sources,
}: {
  facts: DirectoryProfileFact[];
  sources: Map<number, DirectoryEnrichmentSource>;
}) {
  if (facts.length === 0) return null;

  return (
    <section className="rounded-xl border border-border bg-surface p-6 shadow-sm">
      <h3 className="font-display text-[1.125rem] font-semibold text-ink">
        Logiciels mentionnés
      </h3>
      <ul className="mt-4 grid gap-3">
        {facts.map((fact) => {
          const source = fact.source_id ? sources.get(fact.source_id) : null;
          const favicon = SOFTWARE_FAVICONS[fact.value];

          return (
            <li
              key={fact.id}
              className="flex items-center gap-3 rounded-lg border border-border-soft bg-bg-muted px-4 py-3"
            >
              {favicon ? (
                <img
                  src={favicon}
                  alt={fact.value}
                  className="h-5 w-5 shrink-0 rounded-sm"
                  loading="lazy"
                />
              ) : (
                <span
                  aria-hidden
                  className="h-5 w-5 shrink-0 rounded-sm border border-border bg-surface"
                />
              )}
              <span className="min-w-0 flex-1 font-display text-[0.9375rem] font-semibold text-ink">
                {fact.value}
              </span>
              {source?.retrieved_at && (
                <span className="font-mono text-[0.75rem] text-ink-soft">
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

function ServiceCardList({
  title,
  facts,
  sources,
  tone,
}: {
  title: string;
  facts: DirectoryProfileFact[];
  sources: Map<number, DirectoryEnrichmentSource>;
  tone: "sourced" | "inferred";
}) {
  const cards = facts
    .map((fact) => ({
      fact,
      metadata: parseDirectoryServiceFactMetadata(fact.metadata_json),
      source: fact.source_id ? sources.get(fact.source_id) ?? null : null,
    }))
    .filter(({ metadata }) =>
      tone === "sourced"
        ? metadata?.displayMode !== "inferred" && metadata?.displayMode !== "hidden"
        : metadata?.displayMode === "inferred",
    );

  if (cards.length === 0) return null;

  const sectionClassName =
    tone === "sourced"
      ? "md:col-span-2"
      : "rounded-xl border border-border bg-surface p-6 shadow-sm md:col-span-2";

  return (
    <section className={sectionClassName}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="font-display text-[1.125rem] font-semibold text-ink">
          {title}
        </h3>
        {tone === "inferred" && (
          <span className="rounded-full border border-warning-500/30 bg-warning-50 px-3 py-1 font-display text-[0.75rem] font-semibold text-warning-700">
            À confirmer avant mission
          </span>
        )}
      </div>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        {cards.map(({ fact, metadata, source }) => (
          <ServiceCard
            key={fact.id}
            fact={fact}
            metadata={metadata}
            source={source}
            tone={tone}
          />
        ))}
      </div>
    </section>
  );
}

function ServiceCard({
  fact,
  metadata,
  source,
  tone,
}: {
  fact: DirectoryProfileFact;
  metadata: DirectoryServiceFactMetadata | null;
  source: DirectoryEnrichmentSource | null;
  tone: "sourced" | "inferred";
}) {
  const href = metadata?.routeSlug ? `/expertises/${metadata.routeSlug}` : null;
  return (
    <article className="rounded-lg border border-border-soft bg-bg-muted p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-display text-[0.75rem] font-semibold uppercase tracking-[0.08em] text-ink-soft">
            {tone === "sourced" ? "Service sourcé" : "Offre probable"}
          </p>
          <h4 className="mt-1 font-display text-[1.0625rem] font-semibold text-ink">
            {fact.value}
          </h4>
        </div>
        {href && (
          <a
            href={href}
            className="rounded-md border border-brand-700 px-3 py-1.5 font-display text-[0.75rem] font-semibold text-brand-700 transition-colors hover:bg-brand-50"
          >
            Voir le guide
          </a>
        )}
      </div>
      {metadata?.description && (
        <p className="mt-3 text-[0.9375rem] leading-7 text-ink-muted">
          {metadata.description}
        </p>
      )}
      {metadata?.offerIds.length ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {metadata.offerIds.map((offerId) => (
            <span
              key={offerId}
              className="rounded-full border border-border bg-surface px-3 py-1 font-display text-[0.75rem] font-medium text-ink-muted"
            >
              {offerId.replaceAll("-", " ")}
            </span>
          ))}
        </div>
      ) : null}
      <div className="mt-4 text-[0.8125rem] leading-6 text-ink-soft">
        {source?.retrieved_at && (
          <span className="font-mono">
            Source {formatDirectoryDate(source.retrieved_at)}
          </span>
        )}
        {metadata?.confidenceReason && (
          <span>
            {source?.retrieved_at ? " · " : ""}
            {metadata.confidenceReason}
          </span>
        )}
      </div>
    </article>
  );
}

function EnrichmentOverview({
  summary,
}: {
  summary: DirectoryProfileFact | null;
}) {
  if (!summary) return null;

  return (
    <section className="md:col-span-2">
      <div>
        <h3 className="font-display text-[1.25rem] font-semibold text-ink">
          Présentation du cabinet
        </h3>
        <p className="mt-4 max-w-3xl text-[0.9375rem] leading-7 text-ink-muted">
          {summary.value}
        </p>
      </div>
    </section>
  );
}

function EnrichmentMap({ card }: { card: DirectoryCabinetCard }) {
  return (
    <section className="md:col-span-2">
      <h3 className="font-display text-[1.125rem] font-semibold text-ink">
        Localisation
      </h3>
      <div className="mt-4">
        <DirectoryStaticMap card={card} />
      </div>
    </section>
  );
}

function TeamMemberCards({
  facts,
  sources,
}: {
  facts: DirectoryProfileFact[];
  sources: Map<number, DirectoryEnrichmentSource>;
}) {
  const members = extractDirectoryTeamMembers(facts);
  if (members.length === 0) return null;

  return (
    <section className="rounded-xl border border-border bg-surface p-6 shadow-sm md:col-span-2">
      <h3 className="font-display text-[1.125rem] font-semibold text-ink">
        Équipe identifiée
      </h3>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {members.map((member) => {
          const source = member.fact.source_id
            ? sources.get(member.fact.source_id)
            : null;

          return (
            <article
              key={`${member.name}-${member.fact.id}`}
              className="flex min-h-32 gap-4 rounded-lg border border-border-soft bg-bg-muted p-5"
            >
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-brand-100 bg-brand-50 font-display text-[1rem] font-bold text-brand-700">
                {member.initials}
              </div>
              <div className="min-w-0">
                <h4 className="font-display text-[1.0625rem] font-semibold text-ink">
                  {member.name}
                </h4>
                <p className="mt-1 text-[0.875rem] text-ink-muted">
                  {member.role}
                </p>
                {source?.retrieved_at && (
                  <p className="mt-4 font-mono text-[0.75rem] text-ink-soft">
                    Source {formatDirectoryDate(source.retrieved_at)}
                  </p>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

export function DirectoryEnrichmentPanel({
  card,
  facts,
  sources,
  snapshot,
}: {
  card: DirectoryCabinetCard;
  facts: DirectoryProfileFact[];
  sources: DirectoryEnrichmentSource[];
  snapshot: DirectoryQualificationSnapshot | null;
}) {
  const sourcedFacts = filterDirectoryFactsWithLoadedSources(facts, sources);
  if (sourcedFacts.length === 0 && !snapshot) return null;

  const grouped = groupDirectoryProfileFacts(sourcedFacts);
  const sourcesById = sourceById(sources);
  const summary = findDirectoryProfileSummary(sourcedFacts);
  const displayableServiceFacts = grouped.services.filter(
    (fact) => parseDirectoryServiceFactMetadata(fact.metadata_json)?.displayMode !== "hidden",
  );

  return (
    <section>
      <div className="mb-5">
        <h2 className="font-display text-[1.5rem] font-bold text-ink">
          Présentation et expertises
        </h2>
        <p className="mt-2 max-w-3xl text-[0.9375rem] leading-7 text-ink-muted">
          Les éléments ci-dessous synthétisent les informations utiles pour
          comprendre le positionnement du cabinet, ses expertises visibles et
          les points à confirmer avant une prise de contact.
        </p>
      </div>
      <div className="grid gap-5 md:grid-cols-2">
        <EnrichmentOverview summary={summary} />
        <FactList
          title="Coordonnees verifiees"
          facts={grouped.contact}
          sources={sourcesById}
          sectionId="coordonnees-verifiees"
          sectionClassName="md:col-span-2"
          listClassName="md:grid-cols-2"
        />
        <EnrichmentMap card={card} />
        <ServiceCardList
          title="Services identifiés"
          facts={displayableServiceFacts}
          sources={sourcesById}
          tone="sourced"
        />
        <ServiceCardList
          title="Offres probables à confirmer"
          facts={displayableServiceFacts}
          sources={sourcesById}
          tone="inferred"
        />
        <TeamMemberCards
          facts={grouped.team}
          sources={sourcesById}
        />
        <FactList
          title="Secteurs mentionnes"
          facts={grouped.sectors}
          sources={sourcesById}
        />
        <SoftwareList facts={grouped.software} sources={sourcesById} />
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
