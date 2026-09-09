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
  "si vous souscrivez depuis l’un d’eux, Skoria peut percevoir une commission. " +
  "La présence et la nature de ces liens sont signalées pour que vous puissiez les identifier.";

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
    title: bundle.seo?.meta_title ?? page.label,
    description:
      bundle.seo?.meta_description ??
      `${page.label} : comparatif indépendant, avis et offres. ${page.target_query ?? ""}`.trim(),
    alternates: { canonical },
  };
}

function ProgramsBlock({ programs }: { programs: PageProgram[] }) {
  if (programs.length === 0) return null;
  return (
    <section className="overflow-hidden rounded-[1.75rem] bg-navy p-6 text-white sm:p-9">
      <div className="grid gap-6 lg:grid-cols-[1fr_.7fr] lg:items-end">
        <div>
          <p className="font-mono text-[.65rem] font-bold uppercase tracking-[.18em] text-[#ffb293]">Retrouver les sources</p>
          <h2 className="mt-4 text-[clamp(2rem,4vw,3.3rem)] font-semibold leading-tight">Offres comparées</h2>
        </div>
        <p className="max-w-xl text-[.82rem] leading-7 text-white/72">Consultez les conditions de chaque offre avant de poursuivre. Les liens partenaires sont identifiés ; {AppConfig.name} peut percevoir une commission.</p>
      </div>
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {programs.map((p, index) => (
          <article
            key={p.slug}
            className={`flex min-w-0 flex-col rounded-[1.35rem] p-6 text-navy sm:p-7 ${index % 3 === 1 ? "bg-mint" : index % 3 === 2 ? "bg-apricot" : "bg-lilac"}`}
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span aria-hidden className="font-mono text-[.65rem] font-bold text-blue">{String(index + 1).padStart(2, "0")}</span>
              <span className="rounded-full bg-white/75 px-3 py-1.5 text-[.65rem] font-bold">{p.affiliate_url ? "Lien partenaire" : "Source publique"}</span>
            </div>
            <h3 className="mt-7 text-[1.65rem] font-bold leading-tight [overflow-wrap:anywhere]">{p.name}</h3>
            <p className="mt-3 text-[.86rem] leading-7 text-ink-muted">{formatProgramType(p)}</p>
            {p.platform && (
              <p className="mt-2 text-[.72rem] leading-6 text-ink-muted">Plateforme partenaire : {p.platform}</p>
            )}
            <details className="mb-6 mt-6 rounded-2xl border border-ink/15 bg-white/50 p-4">
              <summary className="cursor-pointer text-[.8rem] font-bold">Les points à vérifier</summary>
              <p className="mt-3 text-[.78rem] leading-6 text-ink-muted">Rapprochez les fonctions incluses, le prix après une éventuelle promotion, la durée d'engagement et les conditions de résiliation avec votre besoin. La source permet de confirmer les conditions en vigueur.</p>
            </details>
            {(p.affiliate_url || p.source_url) && (
              <a
                href={p.affiliate_url ?? p.source_url ?? undefined}
                rel={p.affiliate_url ? "sponsored nofollow noopener" : "noopener"}
                target="_blank"
                className="mt-auto inline-flex min-h-12 items-center justify-between gap-3 rounded-full bg-blue px-5 py-3 text-[.79rem] font-bold text-white transition-colors hover:bg-navy"
              >
                {p.affiliate_url ? "Consulter l’offre partenaire" : "Consulter la source"}<span aria-hidden>↗</span>
              </a>
            )}
          </article>
        ))}
      </div>
    </section>
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

  // NB : jamais d'intent/volume SEO affiché (données internes).
  const badges: string[] = [];
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
      publication={bundle.publication}
      articleSchema={true}
      articleHeadline={h1}
      articleSection="Comparatifs & Avis"
      canonicalUrl={canonicalUrl}
    >
      {programs.length > 0 && (
        <aside className="grid gap-5 rounded-[1.5rem] bg-apricot p-6 sm:p-8 lg:grid-cols-[.45fr_1fr]" aria-label="Transparence des liens partenaires">
          <p className="font-mono text-[.65rem] font-bold uppercase tracking-[.16em] text-blue">En toute transparence</p>
          <p className="max-w-3xl text-[.88rem] leading-7 text-ink-muted">{DISCLOSURE}</p>
        </aside>
      )}
      {bundle.renderableSections.map((s) => (
        <DynamicSection key={s.id} section={s} />
      ))}
      <ProgramsBlock programs={programs} />
    </ClusterPage>
  );
}
