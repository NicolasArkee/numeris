import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/libs/db";
import { AppConfig } from "@/utils/AppConfig";
import { BreadcrumbJsonLd } from "@/components/JsonLd";

export const metadata: Metadata = {
  title: `Expert-Comptable par Ville | ${AppConfig.name}`,
  description: `Trouvez votre expert-comptable dans les principales villes de France : Paris, Lyon, Marseille, Bordeaux, Toulouse et plus.`,
  alternates: { canonical: `${AppConfig.url}/villes` },
};

export default function VillesPage() {
  const villes = db.getVilles();
  const departements = db.getDepartements();

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Accueil", url: "/" },
          { name: "Villes", url: "/villes" },
        ]}
      />

      <section className="relative overflow-hidden bg-nuit px-6 py-20 lg:px-[4.5rem] lg:py-24">
        <div className="grid-bg pointer-events-none absolute inset-0 opacity-35" />
        <div className="relative z-10 mx-auto max-w-[82rem]">
          <div className="mb-6 flex items-center gap-3.5">
            <span className="block h-px w-7 bg-or" />
            <span className="text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-or">
              Géolocalisation
            </span>
          </div>
          <h1 className="mb-6 font-serif text-[2.75rem] font-light leading-[1.08] tracking-tight text-blanc lg:text-[4rem]">
            Expert-comptable près de chez vous
          </h1>
          <p className="max-w-2xl text-[0.95rem] leading-relaxed text-white/40">
            {AppConfig.name} accompagne les entreprises partout en France.
            Trouvez nos services dans votre ville ou département.
          </p>
        </div>
      </section>

      <section className="bg-creme px-6 py-20 lg:px-[4.5rem]">
        <div className="mx-auto max-w-[82rem]">
          {/* Villes */}
          <h2 className="mb-8 font-serif text-[1.75rem] font-light text-encre">
            Principales villes
          </h2>
          <div className="mb-16 grid gap-4 md:grid-cols-3 lg:grid-cols-4">
            {villes.map((v) => (
              <Link
                key={v.slug}
                href={`/villes/${v.slug}`}
                className="border border-pierre-12 bg-blanc px-6 py-5 transition-colors hover:border-or"
              >
                <h3 className="mb-1 text-[0.95rem] font-medium text-encre">{v.name}</h3>
                <p className="text-[0.72rem] text-ardoise">
                  {v.region}{v.departement ? ` (${v.departement})` : ""}
                </p>
              </Link>
            ))}
          </div>

          {/* Departements */}
          <h2 className="mb-8 font-serif text-[1.75rem] font-light text-encre">
            Par département
          </h2>
          <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
            {departements.map((d) => (
              <Link
                key={d.slug}
                href={`/departements/${d.slug}`}
                className="border border-pierre-12 bg-blanc px-6 py-5 transition-colors hover:border-or"
              >
                <h3 className="mb-1 text-[0.95rem] font-medium text-encre">
                  {d.name} ({d.code})
                </h3>
                <p className="text-[0.72rem] text-ardoise">{d.region}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
