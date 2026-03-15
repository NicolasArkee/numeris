import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/libs/db";
import { AppConfig } from "@/utils/AppConfig";
import { BreadcrumbJsonLd } from "@/components/JsonLd";

export const metadata: Metadata = {
  title: `Expert-Comptable par Secteur d'Activité | ${AppConfig.name}`,
  description: `Expertise comptable spécialisée par secteur : immobilier, restauration, professions libérales, start-up, BTP et plus. Découvrez nos solutions adaptées.`,
  alternates: { canonical: `${AppConfig.url}/secteurs` },
};

export default function SecteursPage() {
  const secteurs = db.getSecteurs();
  const services = db.getServices();

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Accueil", url: "/" },
          { name: "Secteurs", url: "/secteurs" },
        ]}
      />

      <section className="relative overflow-hidden bg-nuit px-6 py-20 lg:px-[4.5rem] lg:py-24">
        <div className="grid-bg pointer-events-none absolute inset-0 opacity-35" />
        <div className="relative z-10 mx-auto max-w-[82rem]">
          <div className="mb-6 flex items-center gap-3.5">
            <span className="block h-px w-7 bg-or" />
            <span className="text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-or">
              Secteurs d&apos;activité
            </span>
          </div>
          <h1 className="mb-6 font-serif text-[2.75rem] font-light leading-[1.08] tracking-tight text-blanc lg:text-[4rem]">
            Expertise par secteur
          </h1>
          <p className="max-w-2xl text-[0.95rem] leading-relaxed text-white/40">
            Chaque secteur a ses spécificités comptables, fiscales et sociales.
            {AppConfig.name} adapte ses services à votre réalité métier.
          </p>
        </div>
      </section>

      <section className="bg-creme px-6 py-20 lg:px-[4.5rem]">
        <div className="mx-auto max-w-[82rem]">
          <div className="grid gap-6 md:grid-cols-2">
            {secteurs.map((s) => (
              <Link
                key={s.slug}
                href={`/secteurs/${s.slug}`}
                className="group border border-pierre-12 border-t-2 border-t-transparent bg-blanc p-9 transition-all hover:-translate-y-0.5 hover:border-t-or hover:shadow-lg"
              >
                <h2 className="mb-3 font-serif text-[1.3rem] font-medium text-encre">
                  {s.name}
                </h2>
                <p className="mb-6 text-[0.85rem] leading-relaxed text-ardoise">{s.description}</p>
                <div className="flex flex-wrap gap-2">
                  {services.slice(0, 3).map((svc) => (
                    <span
                      key={svc.slug}
                      className="border border-pierre-12 px-2.5 py-1 text-[0.65rem] text-ardoise"
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
