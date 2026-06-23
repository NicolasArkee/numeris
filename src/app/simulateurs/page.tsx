import type { Metadata } from "next";
import Link from "next/link";
import { AppConfig } from "@/utils/AppConfig";
import { BreadcrumbJsonLd, WebPageJsonLd } from "@/components/JsonLd";
import { PageHero } from "@/components/PageHero";
import { Icon } from "@/components/Icon";
import { SIMULATEURS } from "./registry";

export const metadata: Metadata = {
  title: `Simulateurs & Outils Gratuits pour Entrepreneurs | ${AppConfig.name}`,
  description: `Charges sociales, choix de statut, TJM freelance, LMNP, honoraires comptables, salaires de la profession : ${SIMULATEURS.length} outils gratuits pour préparer votre comparaison.`,
  alternates: { canonical: `${AppConfig.url}/simulateurs` },
};

export default function SimulateursPage() {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Accueil", url: "/" },
          { name: "Simulateurs", url: "/simulateurs" },
        ]}
      />
      <WebPageJsonLd
        name="Simulateurs & outils gratuits"
        description="Outils de simulation gratuits pour entrepreneurs : charges sociales, statuts, TJM, LMNP, honoraires et salaires."
        url="/simulateurs"
      />

      <PageHero
        eyebrow="Outils gratuits"
        title="Simulateurs & outils"
        subtitle="Faites vos premières estimations en quelques clics : charges, statut, TJM, immobilier meublé, honoraires. Outils indicatifs, sans inscription."
        breadcrumbs={[
          { name: "Accueil", url: "/" },
          { name: "Simulateurs", url: "/simulateurs" },
        ]}
        cta={{ label: "Demander une orientation", href: "/contact" }}
      />

      <section className="bg-bg px-6 py-20 lg:px-[4.5rem]">
        <div className="mx-auto max-w-[82rem]">
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {SIMULATEURS.map((sim) => (
              <Link
                key={sim.slug}
                href={`/simulateurs/${sim.slug}`}
                className="group border border-border-soft border-t-2 border-t-transparent bg-surface p-8 transition-all hover:-translate-y-0.5 hover:border-t-accent-500 hover:shadow-lg"
              >
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-md border border-brand-100 bg-brand-50 text-brand-700 transition-colors group-hover:border-accent-300 group-hover:bg-accent-50 group-hover:text-accent-700">
                  <Icon name={sim.slug} size={22} />
                </div>
                <h2 className="mb-2 font-display text-[1.2rem] font-medium text-ink group-hover:text-accent-700">
                  {sim.title}
                </h2>
                <p className="mb-5 text-[0.82rem] leading-relaxed text-ink-muted">
                  {sim.metaDescription.split(".")[0]}.
                </p>
                <span className="text-[0.78rem] font-medium text-accent-700">
                  Lancer l&apos;outil →
                </span>
              </Link>
            ))}
          </div>

          <p className="mt-12 max-w-3xl text-[0.82rem] leading-relaxed text-ink-muted">
            Ces outils fournissent des estimations indicatives fondées sur les barèmes 2026
            simplifiés. Pour un chiffrage engageant — statut, rémunération, fiscalité immobilière
            ou honoraires — Skoria vous aide à préparer les critères à comparer
            avant de contacter un professionnel.
          </p>
        </div>
      </section>
    </>
  );
}
