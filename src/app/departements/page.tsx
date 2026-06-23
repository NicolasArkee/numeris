import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/libs/db";
import { AppConfig } from "@/utils/AppConfig";
import { BreadcrumbJsonLd, WebPageJsonLd } from "@/components/JsonLd";
import { PageHero } from "@/components/PageHero";

export const revalidate = 86400;

export const metadata: Metadata = {
  title: `Comparer par département | ${AppConfig.name}`,
  description: `Comparez les experts-comptables par département : ${AppConfig.name} couvre l'ensemble des départements français à partir de sources publiques et d'avis vérifiés.`,
  alternates: { canonical: `${AppConfig.url}/departements` },
};

export default async function DepartementsPage() {
  const departements = await db.getDepartements();

  // Group by region for legibility — most users scan by region first.
  const byRegion = new Map<string, typeof departements>();
  for (const d of departements) {
    const key = d.region ?? "Autres";
    const list = byRegion.get(key) ?? [];
    list.push(d);
    byRegion.set(key, list);
  }
  const regions = Array.from(byRegion.entries()).sort(([a], [b]) =>
    a.localeCompare(b, "fr"),
  );

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Accueil", url: "/" },
          { name: "Départements", url: "/departements" },
        ]}
      />
      <WebPageJsonLd
        name="Experts-comptables par département"
        description={`${AppConfig.name} référence des experts-comptables dans chaque département français. Choisissez votre département pour comparer les options locales.`}
        url="/departements"
      />

      <PageHero
        eyebrow="Par département"
        title="Choisissez votre département"
        subtitle={`${AppConfig.name} référence les experts-comptables dans chacun des départements français. Sélectionnez le vôtre pour comparer les options locales.`}
        breadcrumbs={[
          { name: "Accueil", url: "/" },
          { name: "Départements", url: "/departements" },
        ]}
        cta={{ label: "Demander une orientation", href: "/contact" }}
      />

      <section className="bg-bg px-6 py-20 lg:px-12">
        <div className="mx-auto max-w-328 space-y-14">
          {regions.map(([region, list]) => (
            <div key={region}>
              <h2 className="mb-6 font-display text-[1.5rem] font-bold text-ink">
                {region}
                <span className="ml-3 font-mono text-[0.875rem] font-medium text-ink-soft">
                  {list.length}
                </span>
              </h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {list
                  .sort((a, b) => a.code.localeCompare(b.code))
                  .map((d) => (
                    <Link
                      key={d.slug}
                      href={`/departements/${d.slug}`}
                      className="group flex items-center justify-between rounded-md border border-border-soft bg-surface px-4 py-3 transition-colors hover:border-brand-500 hover:bg-brand-50"
                    >
                      <div className="min-w-0">
                        <p className="truncate font-display text-[0.9375rem] font-semibold text-ink group-hover:text-brand-700">
                          {d.name}
                        </p>
                      </div>
                      <span className="ml-3 shrink-0 rounded bg-bg-muted px-2 py-0.5 font-mono text-[0.75rem] font-semibold text-ink-muted">
                        {d.code}
                      </span>
                    </Link>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
