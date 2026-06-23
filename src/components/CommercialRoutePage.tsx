import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AppConfig } from "@/utils/AppConfig";
import { ClusterPage } from "@/components/ClusterPage";
import { DynamicSection } from "@/components/DynamicSection";
import { ExtraJsonLd } from "@/components/ExtraJsonLd";
import { getDbPageBundle } from "@/libs/content/dbFirst";
import {
  type CommercialRoute,
  getCommercialPageBySegment,
  getCommercialSegments,
  getCommercialLinks,
  getPagePrograms,
  formatProgramType,
  type PageProgram,
} from "@/libs/content/commercial";

const ROUTE_LABEL: Record<CommercialRoute, string> = {
  comparatifs: "Comparatifs",
  avis: "Avis",
  "codes-parrainage": "Codes parrainage",
};

const DISCLOSURE =
  `${AppConfig.name} est un comparateur indépendant. Certains liens de cette page sont des liens d'affiliation : ` +
  "si vous souscrivez, nous pouvons percevoir une commission, sans surcoût pour vous. " +
  "Cela n'influence pas notre classement, fondé sur des critères objectifs.";

export async function commercialGenerateStaticParams(
  route: CommercialRoute,
  paramName: string,
): Promise<Record<string, string>[]> {
  const segments = await getCommercialSegments(route);
  return segments.map((segment) => ({ [paramName]: segment }));
}

export async function commercialGenerateMetadata(
  route: CommercialRoute,
  segment: string,
): Promise<Metadata> {
  const page = await getCommercialPageBySegment(route, segment);
  if (!page) return {};
  const bundle = await getDbPageBundle(route, page.slug);
  const canonical = `${AppConfig.url}${page.url}`;
  return {
    title: bundle.seo?.meta_title ?? `${page.label} — ${AppConfig.name}`,
    description:
      bundle.seo?.meta_description ??
      `${page.label} : comparatif indépendant, avis et offres. ${page.target_query ?? ""}`.trim(),
    alternates: { canonical },
  };
}

function ProgramsBlock({ programs }: { programs: PageProgram[] }) {
  if (programs.length === 0) return null;
  return (
    <div className="mb-12">
      <div className="mb-5 text-[0.68rem] leading-relaxed text-ink-muted">
        Liens partenaires — {AppConfig.name} peut percevoir une commission, sans surcoût pour vous.
      </div>
      <h2 className="mb-6 font-display text-[1.5rem] font-bold text-ink">
        Offres comparées
      </h2>
      <div className="grid gap-4 md:grid-cols-2">
        {programs.map((p) => (
          <div
            key={p.slug}
            className="flex flex-col border border-border-soft bg-surface px-6 py-5"
          >
            <div className="mb-2 flex items-center justify-between gap-3">
              <h3 className="text-[1rem] font-medium text-ink">{p.name}</h3>
              {p.is_primary === 1 && (
                <span className="shrink-0 bg-accent-500 px-2 py-0.5 text-[0.62rem] font-semibold uppercase tracking-[0.1em] text-surface">
                  Notre choix
                </span>
              )}
            </div>
            <p className="mb-1 text-[0.78rem] text-ink-muted">{formatProgramType(p)}</p>
            {p.commission_display && (
              <p className="mb-1 text-[0.8rem] text-ink">{p.commission_display}</p>
            )}
            {p.platform && (
              <p className="mb-3 text-[0.68rem] text-border-soft">Plateforme : {p.platform}</p>
            )}
            <a
              href={p.affiliate_url ?? p.source_url ?? "#"}
              rel="sponsored nofollow noopener"
              target="_blank"
              className="mt-auto inline-block border border-ink px-4 py-2 text-center text-[0.78rem] font-medium text-ink transition-colors hover:bg-ink hover:text-surface"
            >
              Voir l&apos;offre
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}

export async function CommercialRouteView({
  route,
  segment,
}: {
  route: CommercialRoute;
  segment: string;
}) {
  const page = await getCommercialPageBySegment(route, segment);
  if (!page) notFound();

  const bundle = await getDbPageBundle(route, page.slug);
  const linkGroups = await getCommercialLinks(page.slug);
  const programs = await getPagePrograms(route, page.slug);
  const canonicalUrl = `${AppConfig.url}${page.url}`;

  const breadcrumbs: { name: string; url: string }[] = [
    { name: "Accueil", url: "/" },
    { name: ROUTE_LABEL[route], url: `/${route}` },
  ];
  if (page.hub_label && page.hub_slug && page.archetype !== "tofu") {
    breadcrumbs.push({ name: page.hub_label, url: `/comparatifs/${page.hub_slug}` });
  }
  breadcrumbs.push({ name: page.label, url: page.url });

  const h1 = bundle.seo?.h1 ?? page.label;
  const intro =
    bundle.seo?.meta_description ??
    bundle.heroSection?.body ??
    `Comparatif indépendant : ${page.label.toLowerCase()}.`;

  const badges: string[] = [];
  if (page.intent) badges.push(`Intent : ${page.intent}`);
  if (page.hub_label) badges.push(page.hub_label);

  return (
    <ClusterPage
      eyebrow={page.hub_label ?? ROUTE_LABEL[route]}
      h1={h1}
      intro={intro}
      breadcrumbs={breadcrumbs}
      badges={badges}
      linkGroups={linkGroups}
      keyTakeaways={bundle.keyTakeaways}
      schema={<ExtraJsonLd raw={bundle.seo?.json_ld_extra ?? null} />}
      lastUpdatedDate={bundle.lastUpdatedDate}
      articleSchema={true}
      articleHeadline={h1}
      articleSection="Comparatifs & Avis"
      canonicalUrl={canonicalUrl}
    >
      {programs.length > 0 && (
        <div className="mb-8 border border-accent-500/40 bg-accent-500/5 px-5 py-3 text-[0.72rem] leading-relaxed text-ink-muted">
          {DISCLOSURE}
        </div>
      )}
      {bundle.renderableSections.map((s) => (
        <DynamicSection key={s.id} section={s} />
      ))}
      <ProgramsBlock programs={programs} />
    </ClusterPage>
  );
}
