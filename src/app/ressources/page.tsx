import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/libs/db";
import { AppConfig } from "@/utils/AppConfig";
import { BreadcrumbJsonLd, WebPageJsonLd } from "@/components/JsonLd";
import { PageHero } from "@/components/PageHero";

export const metadata: Metadata = {
  title: `Ressources Expert-Comptable | ${AppConfig.name}`,
  description: `Guides, articles et ressources sur le métier d'expert-comptable : réglementation, formation, salaires, conventions collectives et plus.`,
  alternates: { canonical: `${AppConfig.url}/ressources` },
};

export default function RessourcesPage() {
  const silos = db.getSilos();

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
        description="Tout ce que vous devez savoir sur l'expertise comptable : métier, réglementation, tarifs, salaires et spécialités."
        url="/ressources"
      />

      <PageHero
        eyebrow="Centre de ressources"
        title="Ressources & guides"
        subtitle="Tout ce que vous devez savoir sur l'expertise comptable : métier, réglementation, tarifs, salaires et spécialités."
        breadcrumbs={[
          { name: "Accueil", url: "/" },
          { name: "Ressources", url: "/ressources" },
        ]}
        cta={{ label: "Prendre rendez-vous", href: "/contact" }}
      />

      <section className="bg-creme px-6 py-20 lg:px-[4.5rem]">
        <div className="mx-auto max-w-[82rem]">
          <div className="grid gap-6 md:grid-cols-2">
            {silos.map((silo) => {
              const hubs = db.getHubsBySilo(silo.slug);
              return (
                <div
                  key={silo.slug}
                  className="border border-pierre-12 border-t-2 border-t-or bg-blanc p-9"
                >
                  <h2 className="mb-2 font-serif text-[1.3rem] font-medium text-encre">
                    {silo.label}
                  </h2>
                  <p className="mb-5 text-[0.75rem] text-ardoise">
                    {silo.n_keywords} mots-clés · {silo.volume.toLocaleString("fr-FR")} recherches/mois
                  </p>
                  <ul className="flex flex-col gap-2">
                    {hubs.slice(0, 6).map((hub) => (
                      <li key={hub.slug}>
                        <Link
                          href={`/ressources/${hub.slug}`}
                          className="group inline-flex items-center gap-2 text-[0.85rem] text-ardoise transition-colors hover:text-or-fonce"
                        >
                          <span className="h-1 w-1 flex-shrink-0 bg-pierre-12 transition-colors group-hover:bg-or" />
                          {hub.label}
                        </Link>
                      </li>
                    ))}
                    {hubs.length > 6 && (
                      <li className="text-[0.75rem] text-ardoise">
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
