import type { Metadata } from "next";
import Link from "next/link";
import { AppConfig } from "@/utils/AppConfig";
import { BreadcrumbJsonLd, WebPageJsonLd } from "@/components/JsonLd";
import { PageHero } from "@/components/PageHero";
import { SIMULATEURS } from "./registry";

export const metadata: Metadata = {
  title: `Simulateurs & Outils Gratuits pour Entrepreneurs | ${AppConfig.name}`,
  description: `Charges sociales, choix de statut, TJM freelance, LMNP, honoraires comptables, salaires de la profession : ${SIMULATEURS.length} outils gratuits conçus par nos experts-comptables.`,
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
        subtitle="Faites vos premières estimations en quelques clics : charges, statut, TJM, immobilier meublé, honoraires. Conçus par nos experts-comptables, sans inscription."
        breadcrumbs={[
          { name: "Accueil", url: "/" },
          { name: "Simulateurs", url: "/simulateurs" },
        ]}
        cta={{ label: "Poser une question à un expert", href: "/contact" }}
      />

      <section className="bg-creme px-6 py-20 lg:px-[4.5rem]">
        <div className="mx-auto max-w-[82rem]">
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {SIMULATEURS.map((sim) => (
              <Link
                key={sim.slug}
                href={`/simulateurs/${sim.slug}`}
                className="group border border-pierre-12 border-t-2 border-t-transparent bg-blanc p-8 transition-all hover:-translate-y-0.5 hover:border-t-or hover:shadow-lg"
              >
                <span className="mb-4 block text-[1.6rem]">{sim.icon}</span>
                <h2 className="mb-2 font-serif text-[1.2rem] font-medium text-encre group-hover:text-or-fonce">
                  {sim.title}
                </h2>
                <p className="mb-5 text-[0.82rem] leading-relaxed text-ardoise">
                  {sim.metaDescription.split(".")[0]}.
                </p>
                <span className="text-[0.78rem] font-medium text-or-fonce">
                  Lancer l&apos;outil →
                </span>
              </Link>
            ))}
          </div>

          <p className="mt-12 max-w-3xl text-[0.82rem] leading-relaxed text-ardoise">
            Ces outils fournissent des estimations indicatives fondées sur les barèmes 2026
            simplifiés. Pour un chiffrage engageant — statut, rémunération, fiscalité immobilière
            ou honoraires — nos experts-comptables inscrits à l&apos;Ordre vous répondent sous 24h.
          </p>
        </div>
      </section>
    </>
  );
}
