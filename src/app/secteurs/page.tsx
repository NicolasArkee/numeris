import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/libs/db";
import { AppConfig } from "@/utils/AppConfig";
import { BreadcrumbJsonLd, WebPageJsonLd } from "@/components/JsonLd";
import { PageHero } from "@/components/PageHero";

export const metadata: Metadata = {
  title: `Comparer par secteur d'activité | ${AppConfig.name}`,
  description: `Comparez les besoins comptables par secteur : immobilier, restauration, professions libérales, start-up, BTP et plus.`,
  alternates: { canonical: `${AppConfig.url}/secteurs` },
};

export default async function SecteursPage() {
  const secteurs = await db.getSecteurs();
  const services = await db.getServices();

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Accueil", url: "/" },
          { name: "Secteurs", url: "/secteurs" },
        ]}
      />
      <WebPageJsonLd
        name="Comparer par secteur"
        description={`Chaque secteur a ses spécificités comptables, fiscales et sociales. ${AppConfig.name} aide à préparer les critères de comparaison utiles.`}
        url="/secteurs"
      />

      <PageHero
        eyebrow="Secteurs d'activité"
        title="Comparer par secteur"
        subtitle={`Chaque secteur a ses spécificités comptables, fiscales et sociales. ${AppConfig.name} aide à préparer les critères de comparaison utiles.`}
        breadcrumbs={[
          { name: "Accueil", url: "/" },
          { name: "Secteurs", url: "/secteurs" },
        ]}
        cta={{ label: "Demander une orientation", href: "/contact" }}
      />

      <section className="bg-bg px-6 py-20 lg:px-[4.5rem]">
        <div className="mx-auto max-w-[82rem]">
          <div className="grid gap-6 md:grid-cols-2">
            {secteurs.map((s) => (
              <Link
                key={s.slug}
                href={`/secteurs/${s.slug}`}
                className="group border border-border-soft border-t-2 border-t-transparent bg-surface p-9 transition-all hover:-translate-y-0.5 hover:border-t-accent-500 hover:shadow-lg"
              >
                <h2 className="mb-3 font-display text-[1.3rem] font-medium text-ink">
                  {s.name}
                </h2>
                <p className="mb-6 text-[0.85rem] leading-relaxed text-ink-muted">{s.description}</p>
                <div className="flex flex-wrap gap-2">
                  {services.slice(0, 3).map((svc) => (
                    <span
                      key={svc.slug}
                      className="border border-border-soft px-2.5 py-1 text-[0.65rem] text-ink-muted"
                    >
                      {svc.title}
                    </span>
                  ))}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
