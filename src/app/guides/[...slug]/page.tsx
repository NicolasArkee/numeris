import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AppConfig } from "@/utils/AppConfig";
import { ClusterPage } from "@/components/ClusterPage";
import { DynamicSection } from "@/components/DynamicSection";
import { ExtraJsonLd } from "@/components/ExtraJsonLd";
import { getDbPageBundle } from "@/libs/content/dbFirst";
import { db } from "@/libs/db";

interface Props {
  params: Promise<{ slug: string[] }>;
}

const ROUTE = "guides";
export const revalidate = 86400;
export const dynamicParams = true;

// Labels des sous-hubs LMNP (niveau 2) pour breadcrumbs / eyebrow.
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
const PILLAR_LABELS: Record<string, string> = { lmnp: "LMNP" };

const prettify = (s: string) =>
  s.replace(/-/g, " ").replace(/^\w/, (c) => c.toUpperCase());

// URL segments → clé DB. Les briefs sont slugés `guides-<seg1>-<seg2>-…`
// (cf. build_skoria_briefs.py), donc la reconstruction est déterministe.
const dbKey = (segments: string[]) => ["guides", ...segments].join("-");

function buildChrome(segments: string[]) {
  const [pillar, hub, leaf] = segments;
  const breadcrumbs = [
    { name: "Accueil", url: "/" },
    { name: "Guides", url: "/guides" },
  ];
  let eyebrow = "Guides";
  if (pillar) {
    breadcrumbs.push({
      name: PILLAR_LABELS[pillar] ?? prettify(pillar),
      url: `/guides/${pillar}`,
    });
    eyebrow = PILLAR_LABELS[pillar] ?? prettify(pillar);
  }
  if (hub) {
    eyebrow = HUB_LABELS[hub] ?? prettify(hub);
    breadcrumbs.push({
      name: HUB_LABELS[hub] ?? prettify(hub),
      url: `/guides/${pillar}/${hub}`,
    });
  }
  if (leaf) {
    breadcrumbs.push({
      name: prettify(leaf),
      url: `/guides/${segments.join("/")}`,
    });
  }
  return { breadcrumbs, eyebrow, isLeaf: Boolean(leaf) };
}

export async function generateStaticParams() {
  // Pas de listing de slugs dans l'API db → rendu à la demande (ISR) via
  // `dynamicParams = true`. SSG complet possible plus tard en ajoutant un
  // helper `getSlugsByRoute` à l'adaptateur db (les pages se construisent et
  // se cachent au 1er hit, revalidate 24 h).
  return [] as { slug: string[] }[];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const dbSeo = await db.getSeoOverride(ROUTE, dbKey(slug));
  const canonical = `${AppConfig.url}/guides/${slug.join("/")}`;
  if (!dbSeo) {
    return { title: `Guide ${prettify(slug.join(" "))} | ${AppConfig.name}`, alternates: { canonical } };
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

  const bundle = await getDbPageBundle(ROUTE, dbKey(slug));
  const { seo: dbSeo, lastUpdatedDate, hasDbContent, keyTakeaways } = bundle;
  if (!hasDbContent) notFound();

  const { breadcrumbs, eyebrow, isLeaf } = buildChrome(slug);
  const h1 = dbSeo?.h1 ?? prettify(slug[slug.length - 1]!);
  const intro = dbSeo?.meta_description ?? bundle.heroSection?.body ?? "";
  const canonicalUrl = `${AppConfig.url}/guides/${slug.join("/")}`;

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
      articleSchema={isLeaf}
      articleHeadline={h1}
      articleSection="Guides LMNP"
      canonicalUrl={canonicalUrl}
    >
      {bundle.renderableSections.map((s) => (
        <DynamicSection key={s.id} section={s} />
      ))}
    </ClusterPage>
  );
}
