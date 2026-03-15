import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/libs/db";
import { AppConfig } from "@/utils/AppConfig";
import { ClusterPage } from "@/components/ClusterPage";
import { getSEOForRessource } from "@/data/seo";
import { getRessourceLinks } from "@/utils/taxonomy";

interface Props {
  params: Promise<{ theme: string }>;
}

export async function generateStaticParams() {
  const params: { theme: string }[] = [];

  // All hubs
  const silos = db.getSilos();
  for (const silo of silos) {
    const hubs = db.getHubsBySilo(silo.slug);
    for (const hub of hubs) {
      params.push({ theme: hub.slug });

      // All clusters under this hub
      const clusters = db.getClustersByHub(hub.slug);
      for (const cluster of clusters) {
        params.push({ theme: cluster.slug });
      }
    }
  }

  return params;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { theme: slug } = await params;

  // Try hub first, then cluster
  const hub = db.getHubBySlug(slug);
  if (hub) {
    const seo = getSEOForRessource(hub, "hub");
    return {
      title: seo.metaTitle,
      description: seo.metaDescription,
      alternates: { canonical: `${AppConfig.url}/ressources/${slug}` },
    };
  }

  const cluster = db.getClusterBySlug(slug);
  if (cluster) {
    const seo = getSEOForRessource(cluster, "cluster");
    return {
      title: seo.metaTitle,
      description: seo.metaDescription,
      alternates: { canonical: `${AppConfig.url}/ressources/${slug}` },
    };
  }

  return {};
}

export default async function ThemePage({ params }: Props) {
  const { theme: slug } = await params;

  // Try hub
  const hub = db.getHubBySlug(slug);
  if (hub) {
    const seo = getSEOForRessource(hub, "hub");
    const linkGroups = getRessourceLinks(slug, "hub");
    const clusters = db.getClustersByHub(slug);
    const silo = db.getSiloBySlug(hub.silo_slug);

    return (
      <ClusterPage
        eyebrow={silo?.label || "Ressources"}
        h1={seo.h1}
        intro={seo.intro}
        breadcrumbs={[
          { name: "Accueil", url: "/" },
          { name: "Ressources", url: "/ressources" },
          { name: hub.label, url: `/ressources/${slug}` },
        ]}
        badges={[
          `${hub.volume.toLocaleString("fr-FR")} recherches/mois`,
          `${hub.n_keywords} mots-clés`,
        ]}
        faqs={seo.faqs}
        linkGroups={linkGroups}
      >
        {clusters.length > 0 && (
          <div className="mb-12">
            <h2 className="mb-6 font-serif text-[1.5rem] font-light text-encre">
              Articles dans ce thème
            </h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {clusters.map((c) => (
                <Link
                  key={c.slug}
                  href={`/ressources/${c.slug}`}
                  className="border border-pierre-12 bg-blanc px-6 py-5 transition-colors hover:border-or"
                >
                  <h3 className="mb-1 text-[0.95rem] font-medium text-encre">{c.label}</h3>
                  <p className="text-[0.68rem] text-ardoise">
                    {c.volume.toLocaleString("fr-FR")} recherches · {c.n_keywords} mots-clés
                  </p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </ClusterPage>
    );
  }

  // Try cluster
  const cluster = db.getClusterBySlug(slug);
  if (cluster) {
    const seo = getSEOForRessource(cluster, "cluster");
    const linkGroups = getRessourceLinks(slug, "cluster");
    const keywords = db.getKeywordsByCluster(slug);
    const parentHub = db.getHubBySlug(cluster.hub_slug);

    return (
      <ClusterPage
        eyebrow={parentHub?.label || "Ressources"}
        h1={seo.h1}
        intro={seo.intro}
        breadcrumbs={[
          { name: "Accueil", url: "/" },
          { name: "Ressources", url: "/ressources" },
          ...(parentHub
            ? [{ name: parentHub.label, url: `/ressources/${parentHub.slug}` }]
            : []),
          { name: cluster.label, url: `/ressources/${slug}` },
        ]}
        badges={[
          `${cluster.volume.toLocaleString("fr-FR")} recherches/mois`,
          `${cluster.n_keywords} mots-clés`,
        ]}
        faqs={seo.faqs}
        linkGroups={linkGroups}
      >
        {keywords.length > 0 && (
          <div className="mb-12">
            <h2 className="mb-6 font-serif text-[1.5rem] font-light text-encre">
              Mots-clés associés
            </h2>
            <div className="flex flex-wrap gap-2">
              {keywords.map((kw) => (
                <span
                  key={kw.slug}
                  className="border border-pierre-12 bg-blanc px-3 py-1.5 text-[0.72rem] text-ardoise"
                >
                  {kw.label}
                  <span className="ml-1 text-pierre-12">
                    {kw.volume.toLocaleString("fr-FR")}
                  </span>
                </span>
              ))}
            </div>
          </div>
        )}
      </ClusterPage>
    );
  }

  notFound();
}
