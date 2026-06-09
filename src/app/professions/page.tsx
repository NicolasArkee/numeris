import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/libs/db";
import { AppConfig } from "@/utils/AppConfig";
import { BreadcrumbJsonLd, WebPageJsonLd } from "@/components/JsonLd";
import { PageHero } from "@/components/PageHero";

export const metadata: Metadata = {
  title: `Expert-Comptable par Profession | ${AppConfig.name}`,
  description: `Expert-comptable spécialisé par métier : santé, BTP, restauration, tech, immobilier, commerce et plus de 100 professions accompagnées.`,
  alternates: { canonical: `${AppConfig.url}/professions` },
};

export default function ProfessionsPage() {
  const categories = db.getProfessionCategories();

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Accueil", url: "/" },
          { name: "Professions", url: "/professions" },
        ]}
      />
      <WebPageJsonLd
        name="Expert-comptable par profession"
        description={`Chaque métier a ses obligations comptables et fiscales spécifiques. ${AppConfig.name} adapte son accompagnement à votre réalité professionnelle.`}
        url="/professions"
      />

      <PageHero
        eyebrow="+100 professions accompagnées"
        title="Expert-comptable par profession"
        subtitle={`Chaque métier a ses obligations comptables et fiscales spécifiques. ${AppConfig.name} adapte son accompagnement à votre réalité professionnelle.`}
        breadcrumbs={[
          { name: "Accueil", url: "/" },
          { name: "Professions", url: "/professions" },
        ]}
        cta={{ label: "Prendre rendez-vous", href: "/contact" }}
      />

      <section className="bg-creme px-6 py-20 lg:px-[4.5rem]">
        <div className="mx-auto max-w-[82rem]">
          {categories.map((cat) => {
            const professions = db.getProfessionsByCategory(cat.slug);
            return (
              <div key={cat.slug} id={cat.slug} className="mb-14 scroll-mt-24">
                <div className="mb-6 flex items-center gap-3">
                  <span className="text-[1.5rem]">{cat.icon}</span>
                  <h2 className="font-serif text-[1.5rem] font-medium text-encre">
                    {cat.name}
                  </h2>
                </div>
                {cat.description && (
                  <p className="mb-5 text-[0.85rem] text-ardoise">{cat.description}</p>
                )}
                <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-4">
                  {professions.map((p) => (
                    <Link
                      key={p.slug}
                      href={`/professions/${p.slug}`}
                      className="border border-pierre-12 bg-blanc px-5 py-4 transition-colors hover:border-or"
                    >
                      <h3 className="mb-1 text-[0.88rem] font-medium text-encre">{p.name}</h3>
                      <p className="line-clamp-2 text-[0.7rem] text-ardoise">{p.description}</p>
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
