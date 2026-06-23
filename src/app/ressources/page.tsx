import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/libs/db";
import { AppConfig } from "@/utils/AppConfig";
import { BreadcrumbJsonLd, WebPageJsonLd } from "@/components/JsonLd";
import { PageHero } from "@/components/PageHero";

export const metadata: Metadata = {
  title: `Ressources comptables et administratives | ${AppConfig.name}`,
  description: `Guides, articles et ressources pour préparer une comparaison comptable : réglementation, démarches, tarifs, salaires, conventions collectives et plus.`,
  alternates: { canonical: `${AppConfig.url}/ressources` },
};

export default async function RessourcesPage() {
  const silos = await db.getSilos();
  const hubsBySilo = new Map(
    await Promise.all(
      silos.map(async (silo) => [silo.slug, await db.getHubsBySilo(silo.slug)] as const),
    ),
  );

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Accueil", url: "/" },
          { name: "Ressources", url: "/ressources" },
        ]}
      />
      <WebPageJsonLd
        name="Ressources & guides"
        description="Repères pratiques pour comprendre les démarches comptables, fiscales, sociales et administratives avant de choisir un professionnel."
        url="/ressources"
      />

      <PageHero
        eyebrow="Centre de ressources"
        title="Ressources & guides"
        subtitle="Repères pratiques pour comprendre les démarches comptables, fiscales, sociales et administratives avant de choisir un professionnel."
        breadcrumbs={[
          { name: "Accueil", url: "/" },
          { name: "Ressources", url: "/ressources" },
        ]}
        cta={{ label: "Demander une orientation", href: "/contact" }}
      />

      <section className="bg-bg px-6 py-20 lg:px-[4.5rem]">
        <div className="mx-auto max-w-[82rem]">
          <div className="grid gap-6 md:grid-cols-2">
            {silos.map((silo) => {
              const hubs = hubsBySilo.get(silo.slug) ?? [];
              return (
                <div
                  key={silo.slug}
                  className="border border-border-soft border-t-2 border-t-accent-500 bg-surface p-9"
                >
                  <h2 className="mb-2 font-display text-[1.3rem] font-medium text-ink">
                    {silo.label}
                  </h2>
                  <p className="mb-5 text-[0.75rem] text-ink-muted">
                    {silo.n_keywords} mots-clés · {silo.volume.toLocaleString("fr-FR")} recherches/mois
                  </p>
                  <ul className="flex flex-col gap-2">
                    {hubs.slice(0, 6).map((hub) => (
                      <li key={hub.slug}>
                        <Link
                          href={`/ressources/${hub.slug}`}
                          className="group inline-flex items-center gap-2 text-[0.85rem] text-ink-muted transition-colors hover:text-accent-700"
                        >
                          <span className="h-1 w-1 flex-shrink-0 bg-border-soft transition-colors group-hover:bg-accent-500" />
                          {hub.label}
                        </Link>
                      </li>
                    ))}
                    {hubs.length > 6 && (
                      <li className="text-[0.75rem] text-ink-muted">
                        + {hubs.length - 6} autres sujets
                      </li>
                    )}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
