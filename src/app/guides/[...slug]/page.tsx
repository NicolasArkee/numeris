import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { ClusterPage } from "@/components/ClusterPage";
import { ExtraJsonLd } from "@/components/ExtraJsonLd";
import {
  AnchoredDynamicSection,
  buildEditorialSectionEntries,
  editorialTocItems,
} from "@/components/hubs/editorial/EditorialSections";
import { EditorialToc } from "@/components/hubs/editorial/EditorialToc";
import { TaxonomyHubPage, type TaxonomyChild } from "@/components/ressources/TaxonomyHubPage";
import { getDbPageBundle } from "@/libs/content/dbFirst";
import { db } from "@/libs/db";
import { AppConfig } from "@/utils/AppConfig";

interface Props {
  params: Promise<{ slug: string[] }>;
}

const ROUTE = "guides";
export const revalidate = 86400;
export const dynamicParams = true;

const HUB_LABELS: Record<string, string> = {
  investir: "Investir en LMNP",
  dispositifs: "Dispositifs & arbitrages",
  "regimes-fiscalite": "Régimes & fiscalité",
  amortissement: "Amortissement",
  "comptabilite-declaration": "Comptabilité & déclaration",
  charges: "Charges déductibles",
  "immatriculation-demarches": "Immatriculation & démarches",
  "gestion-locative": "Gestion locative & bail",
  "courte-duree": "Location courte durée",
  "structures-detention": "Structures & détention",
  "par-profil": "LMNP par profil",
  "sortie-cession": "Revente & plus-value",
  comprendre: "Comprendre le LMNP",
};
const HUB_ORDER = Object.keys(HUB_LABELS);
const PILLAR_LABELS: Record<string, string> = { lmnp: "LMNP" };

type GuidePageKind = "hub" | "subhub" | "article";

const prettify = (value: string) => {
  const label = value.replace(/-/g, " ");
  return label.charAt(0).toUpperCase() + label.slice(1);
};

// URL segments → clé DB, conformément aux briefs `guides-<seg1>-<seg2>-…`.
const dbKey = (segments: string[]) => ["guides", ...segments].join("-");

function pageKind(segments: string[]): GuidePageKind {
  if (segments.length === 1) return "hub";
  if (segments.length === 2 && HUB_LABELS[segments[1]!]) return "subhub";
  return "article";
}

function buildChrome(segments: string[], currentLabel: string) {
  const [pillar, second] = segments;
  const kind = pageKind(segments);
  const pillarLabel = PILLAR_LABELS[pillar!] ?? prettify(pillar!);
  const breadcrumbs = [
    { name: "Accueil", url: "/" },
    { name: "Guides", url: "/guides" },
  ];

  if (kind === "hub") {
    breadcrumbs.push({ name: currentLabel, url: `/guides/${pillar}` });
    return { breadcrumbs, eyebrow: "Guides pratiques", kind };
  }

  breadcrumbs.push({ name: pillarLabel, url: `/guides/${pillar}` });
  if (kind === "subhub") {
    breadcrumbs.push({ name: currentLabel, url: `/guides/${segments.join("/")}` });
    return { breadcrumbs, eyebrow: pillarLabel, kind };
  }

  if (segments.length > 2 && second) {
    breadcrumbs.push({
      name: HUB_LABELS[second] ?? prettify(second),
      url: `/guides/${pillar}/${second}`,
    });
  }
  breadcrumbs.push({ name: currentLabel, url: `/guides/${segments.join("/")}` });
  return {
    breadcrumbs,
    eyebrow: second && HUB_LABELS[second] ? HUB_LABELS[second] : pillarLabel,
    kind,
  };
}

/**
 * Construit le sommaire uniquement depuis page_meta publié. Les slugs LMNP
 * contiennent des tirets : les sous-hubs connus servent de frontières stables,
 * et le reliquat reste un segment d'article complet.
 */
async function getPublishedChildren(segments: string[]): Promise<TaxonomyChild[]> {
  let allMeta: Awaited<ReturnType<typeof db.getAllPageMeta>>;
  try {
    allMeta = await db.getAllPageMeta();
  } catch {
    return [];
  }
  const published = allMeta.filter(
    (meta) => meta.route === ROUTE && meta.publish_status === "published",
  );
  const candidates: { dbSlug: string; urlSlug: string; isSubhub: boolean }[] = [];

  if (segments.length === 1) {
    const prefix = `${dbKey(segments)}-`;
    for (const meta of published) {
      if (!meta.slug.startsWith(prefix)) continue;
      const remainder = meta.slug.slice(prefix.length);
      const matchingHub = HUB_ORDER.find(
        (hubSlug) => remainder === hubSlug || remainder.startsWith(`${hubSlug}-`),
      );
      if (matchingHub) {
        if (remainder === matchingHub) {
          candidates.push({ dbSlug: meta.slug, urlSlug: matchingHub, isSubhub: true });
        }
        continue;
      }
      candidates.push({ dbSlug: meta.slug, urlSlug: remainder, isSubhub: false });
    }
  } else {
    const prefix = `${dbKey(segments)}-`;
    for (const meta of published) {
      if (!meta.slug.startsWith(prefix)) continue;
      const remainder = meta.slug.slice(prefix.length);
      if (remainder) {
        candidates.push({ dbSlug: meta.slug, urlSlug: remainder, isSubhub: false });
      }
    }
  }

  const unique = [...new Map(candidates.map((candidate) => [candidate.dbSlug, candidate])).values()];
  const children = await Promise.all(
    unique.map(async (candidate): Promise<TaxonomyChild> => {
      const seo = await db.getSeoOverride(ROUTE, candidate.dbSlug).catch(() => null);
      return {
        slug: candidate.urlSlug,
        href: `/guides/${segments.join("/")}/${candidate.urlSlug}`,
        label:
          seo?.h1
          || (candidate.isSubhub ? HUB_LABELS[candidate.urlSlug] : undefined)
          || prettify(candidate.urlSlug),
        description: seo?.meta_description ?? null,
        tag: candidate.isSubhub ? "Sous-dossier" : "Article",
        meta: candidate.isSubhub ? "Parcours thématique" : "Guide détaillé",
      };
    }),
  );

  return children.sort((left, right) => {
    const leftOrder = HUB_ORDER.indexOf(left.slug);
    const rightOrder = HUB_ORDER.indexOf(right.slug);
    if (leftOrder >= 0 || rightOrder >= 0) {
      return (leftOrder >= 0 ? leftOrder : Number.MAX_SAFE_INTEGER)
        - (rightOrder >= 0 ? rightOrder : Number.MAX_SAFE_INTEGER);
    }
    return left.label.localeCompare(right.label, "fr");
  });
}

export async function generateStaticParams() {
  return [] as { slug: string[] }[];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const canonical = `${AppConfig.url}/guides/${slug.join("/")}`;
  const dbSeo = await db.getSeoOverride(ROUTE, dbKey(slug));
  if (!dbSeo) {
    return {
      title: `Guide ${prettify(slug.join(" "))}`,
      alternates: { canonical },
    };
  }
  return {
    title: dbSeo.meta_title ?? undefined,
    description: dbSeo.meta_description ?? undefined,
    alternates: { canonical },
  };
}

export default async function GuidePage({ params }: Props) {
  const { slug } = await params;
  if (!slug?.length || slug[0] !== "lmnp") notFound();

  // getDbPageBundle est fail-closed : aucun texte draft, review ou archivé
  // n'est rendu. Les anciens liens LMNP rejoignent le dossier publié pendant
  // que la nouvelle arborescence reste en préparation dans le CMS.
  const bundle = await getDbPageBundle(ROUTE, dbKey(slug));
  const { seo: dbSeo, lastUpdatedDate, hasDbContent, keyTakeaways } = bundle;
  if (!hasDbContent) redirect("/ressources/lmnp-expert-comptable");

  const h1 = dbSeo?.h1 ?? prettify(slug[slug.length - 1]!);
  const { breadcrumbs, eyebrow, kind } = buildChrome(slug, h1);
  const editoIntro = bundle.sections.find((section) => section.section_type === "EditoIntro");
  const intro = editoIntro?.body || dbSeo?.meta_description || bundle.heroSection?.body || "";
  const canonicalUrl = `${AppConfig.url}/guides/${slug.join("/")}`;

  if (kind === "hub" || kind === "subhub") {
    const children_ = await getPublishedChildren(slug);
    const sections = bundle.renderableSections.filter((section) => section.id !== editoIntro?.id);
    return (
      <TaxonomyHubPage
        h1={h1}
        intro={intro}
        eyebrow={eyebrow}
        breadcrumbs={breadcrumbs}
        canonicalUrl={canonicalUrl}
        children_={children_}
        childrenTitle={kind === "hub" ? "Les grands dossiers du LMNP" : "Tous les guides de ce dossier"}
        sections={sections}
        linkGroups={[]}
        level={kind}
        media={
          kind === "hub"
            ? {
                src: "/images/skoria-v2/editorial/apartment.webp",
                alt: "Appartement meublé lumineux avec table et carnet",
              }
            : {
                src: "/images/skoria-v2/editorial/lmnp-dossier.webp",
                alt: "Dossier de location meublée, plan simplifié et clés sur une table",
              }
        }
        lastUpdatedDate={lastUpdatedDate}
        schema={<ExtraJsonLd raw={dbSeo?.json_ld_extra ?? null} />}
      />
    );
  }

  const entries = buildEditorialSectionEntries(bundle.renderableSections);
  return (
    <ClusterPage
      eyebrow={eyebrow}
      h1={h1}
      intro={intro}
      breadcrumbs={breadcrumbs}
      linkGroups={[]}
      keyTakeaways={keyTakeaways}
      schema={<ExtraJsonLd raw={dbSeo?.json_ld_extra ?? null} />}
      lastUpdatedDate={lastUpdatedDate}
      publication={bundle.publication}
      articleSchema
      articleHeadline={h1}
      articleSection="Guides LMNP"
      canonicalUrl={canonicalUrl}
    >
      <EditorialToc items={editorialTocItems(entries)} title="Dans ce guide" />
      {entries.map((entry) => (
        <AnchoredDynamicSection key={entry.section.id} entry={entry} />
      ))}
    </ClusterPage>
  );
}
