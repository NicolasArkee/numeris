import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/libs/db";
import { AppConfig } from "@/utils/AppConfig";
import { BreadcrumbJsonLd, WebPageJsonLd } from "@/components/JsonLd";
import { PageHero } from "@/components/PageHero";

export const metadata: Metadata = {
  title: `Comparer par profession | ${AppConfig.name}`,
  description: `Comparez les besoins comptables par métier : santé, BTP, restauration, tech, immobilier, commerce et plus de 100 professions documentées.`,
  alternates: { canonical: `${AppConfig.url}/professions` },
};

export default async function ProfessionsPage() {
  const categories = await db.getProfessionCategories();
  const professionsByCategory = new Map(
    await Promise.all(
      categories.map(
        async (cat) => [cat.slug, await db.getProfessionsByCategory(cat.slug)] as const,
      ),
    ),
  );

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Accueil", url: "/" },
          { name: "Professions", url: "/professions" },
        ]}
      />
      <WebPageJsonLd
        name="Comparer par profession"
        description={`Chaque métier a ses obligations comptables et fiscales spécifiques. ${AppConfig.name} aide à préparer les critères de comparaison adaptés.`}
        url="/professions"
      />

      <PageHero
        eyebrow="+100 professions documentées"
        title="Comparer par profession"
        subtitle={`Chaque métier a ses obligations comptables et fiscales spécifiques. ${AppConfig.name} aide à préparer les critères de comparaison adaptés.`}
        breadcrumbs={[
          { name: "Accueil", url: "/" },
          { name: "Professions", url: "/professions" },
        ]}
        cta={{ label: "Demander une orientation", href: "/contact" }}
      />

      <section className="bg-bg px-6 py-20 lg:px-[4.5rem]">
        <div className="mx-auto max-w-[82rem]">
          {categories.map((cat) => {
            const professions = professionsByCategory.get(cat.slug) ?? [];
            return (
              <div key={cat.slug} id={cat.slug} className="mb-14 scroll-mt-24">
                <div className="mb-6 flex items-center gap-3">
                  <span className="text-[1.5rem]">{cat.icon}</span>
                  <h2 className="font-display text-[1.5rem] font-medium text-ink">
                    {cat.name}
                  </h2>
                </div>
                {cat.description && (
                  <p className="mb-5 text-[0.85rem] text-ink-muted">{cat.description}</p>
                )}
                <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-4">
                  {professions.map((p) => (
                    <Link
                      key={p.slug}
                      href={`/professions/${p.slug}`}
                      className="border border-border-soft bg-surface px-5 py-4 transition-colors hover:border-accent-500"
                    >
                      <h3 className="mb-1 text-[0.88rem] font-medium text-ink">{p.name}</h3>
                      <p className="line-clamp-2 text-[0.7rem] text-ink-muted">{p.description}</p>
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </>
  );
}
