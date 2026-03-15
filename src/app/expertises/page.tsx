import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/libs/db";
import { AppConfig } from "@/utils/AppConfig";
import { BreadcrumbJsonLd } from "@/components/JsonLd";
import { PageHero } from "@/components/PageHero";
import { TrustBar } from "@/components/TrustBar";

export const metadata: Metadata = {
  title: `Nos Expertises Comptables | ${AppConfig.name}`,
  description: `Découvrez l'ensemble de nos services d'expertise comptable : comptabilité, fiscalité, social, création d'entreprise, conseil en gestion et audit.`,
  alternates: { canonical: `${AppConfig.url}/expertises` },
};

export default function ExpertisesPage() {
  const services = db.getServices();
  const secteurs = db.getSecteurs();
  const categories = db.getProfessionCategories();

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Accueil", url: "/" },
          { name: "Expertises", url: "/expertises" },
        ]}
      />

      <PageHero
        eyebrow="Expertise comptable"
        title="Nos expertises"
        subtitle={`De la tenue comptable au conseil stratégique, ${AppConfig.name} couvre l'ensemble de vos besoins en expertise comptable et financière.`}
        breadcrumbs={[
          { name: "Accueil", url: "/" },
          { name: "Expertises", url: "/expertises" },
        ]}
        cta={{ label: "Demander un devis", href: "/contact" }}
        ctaSecondary={{ label: "Voir nos tarifs", href: "/expertises#tarifs" }}
      />

      <TrustBar />

      {/* Services grid */}
      <section className="bg-creme px-6 py-20 lg:px-[4.5rem]">
        <div className="mx-auto max-w-[82rem]">
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
              <Link
                key={service.slug}
                href={`/expertises/${service.slug}`}
                className="group border border-pierre-12 border-t-2 border-t-transparent bg-blanc p-9 transition-all hover:-translate-y-0.5 hover:border-t-or hover:shadow-lg"
              >
                <div className="mb-5 flex h-10 w-10 items-center justify-center border border-pierre-12 text-[0.95rem]">
                  {service.icon}
                </div>
                <h2 className="mb-3 font-serif text-[1.2rem] font-medium leading-snug text-encre">
                  {service.title}
                </h2>
                <p className="mb-6 text-[0.8rem] leading-relaxed text-ardoise">
                  {service.description}
                </p>
                <span className="inline-flex items-center gap-1.5 border-b border-or-clair pb-px text-[0.72rem] font-semibold text-or-fonce transition-all group-hover:gap-2.5 group-hover:border-or">
                  Découvrir →
                </span>
              </Link>
            ))}
          </div>

          {/* Secteurs */}
          <div className="mt-20">
            <div className="mb-6 flex items-center gap-3.5">
              <span className="block h-px w-6 flex-shrink-0 bg-or" />
              <span className="text-[0.65rem] font-bold uppercase tracking-[0.14em] text-or-fonce">
                Par secteur
              </span>
            </div>
            <h2 className="mb-8 font-serif text-[1.75rem] font-light text-encre">
              Expertises par secteur d&apos;activité
            </h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {secteurs.map((s) => (
                <Link
                  key={s.slug}
                  href={`/secteurs/${s.slug}`}
                  className="border border-pierre-12 bg-blanc px-6 py-5 transition-colors hover:border-or"
                >
                  <h3 className="mb-1 text-[0.95rem] font-medium text-encre">{s.name}</h3>
                  <p className="text-[0.75rem] text-ardoise">{s.description}</p>
                </Link>
              ))}
            </div>
          </div>

          {/* Professions */}
          <div className="mt-20">
            <div className="mb-6 flex items-center gap-3.5">
              <span className="block h-px w-6 flex-shrink-0 bg-or" />
              <span className="text-[0.65rem] font-bold uppercase tracking-[0.14em] text-or-fonce">
                Par profession
              </span>
            </div>
            <h2 className="mb-8 font-serif text-[1.75rem] font-light text-encre">
              Expertises par profession
            </h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {categories.map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/professions#${cat.slug}`}
                  className="border border-pierre-12 bg-blanc px-6 py-5 transition-colors hover:border-or"
                >
                  <span className="mb-2 block text-[1.3rem]">{cat.icon}</span>
                  <h3 className="mb-1 text-[0.95rem] font-medium text-encre">{cat.name}</h3>
                  {cat.description && (
                    <p className="line-clamp-2 text-[0.72rem] text-ardoise">{cat.description}</p>
                  )}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
