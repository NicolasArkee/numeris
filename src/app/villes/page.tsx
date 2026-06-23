import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/libs/db";
import { AppConfig } from "@/utils/AppConfig";
import { BreadcrumbJsonLd, WebPageJsonLd } from "@/components/JsonLd";
import { PageHero } from "@/components/PageHero";

export const metadata: Metadata = {
  title: `Comparer par ville | ${AppConfig.name}`,
  description: `Comparez les professionnels comptables dans les principales villes de France : Paris, Lyon, Marseille, Bordeaux, Toulouse et plus.`,
  alternates: { canonical: `${AppConfig.url}/villes` },
};

export default async function VillesPage() {
  const villes = await db.getVilles();
  const departements = await db.getDepartements();

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Accueil", url: "/" },
          { name: "Villes", url: "/villes" },
        ]}
      />
      <WebPageJsonLd
        name="Comparer près de chez vous"
        description={`${AppConfig.name} aide à comparer les professionnels comptables partout en France à partir de critères lisibles.`}
        url="/villes"
      />

      <PageHero
        eyebrow="Géolocalisation"
        title="Comparer près de chez vous"
        subtitle={`${AppConfig.name} aide à comparer les professionnels comptables partout en France à partir de critères lisibles.`}
        breadcrumbs={[
          { name: "Accueil", url: "/" },
          { name: "Villes", url: "/villes" },
        ]}
        cta={{ label: "Demander une orientation", href: "/contact" }}
      />

      <section className="bg-bg px-6 py-20 lg:px-[4.5rem]">
        <div className="mx-auto max-w-[82rem]">
          {/* Villes */}
          <h2 className="mb-8 font-display text-[1.75rem] font-bold text-ink">
            Principales villes
          </h2>
          <div className="mb-16 grid gap-4 md:grid-cols-3 lg:grid-cols-4">
            {villes.map((v) => (
              <Link
                key={v.slug}
                href={`/villes/${v.slug}`}
                className="border border-border-soft bg-surface px-6 py-5 transition-colors hover:border-accent-500"
              >
                <h3 className="mb-1 text-[0.95rem] font-medium text-ink">{v.name}</h3>
                <p className="text-[0.72rem] text-ink-muted">
                  {v.region}{v.departement ? ` (${v.departement})` : ""}
                </p>
              </Link>
            ))}
          </div>

          {/* Departements */}
          <h2 className="mb-8 font-display text-[1.75rem] font-bold text-ink">
            Par département
          </h2>
          <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
            {departements.map((d) => (
              <Link
                key={d.slug}
                href={`/departements/${d.slug}`}
                className="border border-border-soft bg-surface px-6 py-5 transition-colors hover:border-accent-500"
              >
                <h3 className="mb-1 text-[0.95rem] font-medium text-ink">
                  {d.name} ({d.code})
                </h3>
                <p className="text-[0.72rem] text-ink-muted">{d.region}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
