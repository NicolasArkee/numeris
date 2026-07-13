import type { Metadata } from "next";
import Link from "next/link";
import { AppConfig } from "@/utils/AppConfig";
import { BreadcrumbJsonLd, WebPageJsonLd } from "@/components/JsonLd";
import { PageHero } from "@/components/PageHero";
import { SIMULATEURS } from "./registry";

export const metadata: Metadata = {
  title: "Simulateurs & Calculateurs Gratuits pour Entrepreneurs",
  description: `TVA, coût d'un salarié, frais kilométriques, IS, jours ouvrés, charges sociales, statuts, TJM… ${SIMULATEURS.length} outils gratuits, barèmes 2026 vérifiés.`,
  alternates: { canonical: `${AppConfig.url}/simulateurs` },
};

/** Groupes éditoriaux du hub — pilotés par le registry (source unique). */
const GROUPES: { titre: string; slugs: string[] }[] = [
  {
    titre: "Fiscal & TVA",
    slugs: ["calcul-tva", "calcul-impot-societes", "frais-kilometriques", "immobilier"],
  },
  {
    titre: "Employeur & social",
    slugs: ["cout-salarie", "jours-ouvres", "rupture-conventionnelle", "prime-fin-cdd", "grille-salaire-expert-comptable"],
  },
  {
    titre: "Créer & piloter son activité",
    slugs: ["charges", "statuts", "tjm", "capital-social", "honoraires"],
  },
];

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
        name="Simulateurs & calculateurs gratuits"
        description={metadata.description as string}
        url="/simulateurs"
      />

      <PageHero
        eyebrow="Outils gratuits"
        title="Simulateurs & calculateurs"
        subtitle={`${SIMULATEURS.length} outils sans inscription : TVA, coût d'un salarié, frais kilométriques, impôt sur les sociétés, jours ouvrés, charges, statut, TJM… Barèmes 2026 vérifiés sur les sources officielles.`}
        breadcrumbs={[
          { name: "Accueil", url: "/" },
          { name: "Simulateurs", url: "/simulateurs" },
        ]}
        cta={{ label: "Demander une orientation", href: "/contact" }}
      />

      <section className="bg-bg px-6 py-16 lg:px-[4.5rem]">
        <div className="mx-auto max-w-[82rem] space-y-14">
          {GROUPES.map((groupe, gi) => {
            const outils = groupe.slugs
              .map((slug) => SIMULATEURS.find((s) => s.slug === slug))
              .filter((s): s is (typeof SIMULATEURS)[number] => Boolean(s));
            return (
              <div key={groupe.titre}>
                <p className="mb-6 font-mono text-[0.65rem] uppercase tracking-[0.2em] text-accent-700">
                  {String(gi + 1).padStart(2, "0")} — {groupe.titre}
                </p>
                <div className="grid gap-px border border-border bg-border md:grid-cols-2 lg:grid-cols-3">
                  {outils.map((sim) => (
                    <Link
                      key={sim.slug}
                      href={`/simulateurs/${sim.slug}`}
                      className="group flex min-h-44 flex-col justify-between bg-surface p-7 transition-colors hover:bg-brand-50"
                    >
                      <span className="flex items-start justify-between gap-3">
                        <span aria-hidden className="text-[1.4rem]">{sim.icon}</span>
                        <span className="font-mono text-[0.58rem] uppercase tracking-[0.14em] text-ink-soft">
                          {sim.eyebrow}
                        </span>
                      </span>
                      <span>
                        <span className="block font-display text-[1.05rem] font-bold leading-snug text-ink group-hover:text-brand-700">
                          {sim.title}
                          <span aria-hidden className="ml-1.5 text-accent-500 opacity-0 transition-opacity group-hover:opacity-100">→</span>
                        </span>
                        <span className="mt-1.5 line-clamp-2 block text-[0.78rem] leading-snug text-ink-muted">
                          {sim.metaDescription.split(".")[0]}.
                        </span>
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}

          <p className="max-w-3xl text-[0.82rem] leading-relaxed text-ink-muted">
            Ces outils fournissent des estimations indicatives fondées sur les barèmes 2026 en vigueur
            (sources officielles : impots.gouv.fr, urssaf.fr, service-public.gouv.fr). Pour un chiffrage
            engageant — statut, embauche, fiscalité, honoraires — Skoria vous aide à préparer les
            critères à comparer avant de contacter un professionnel.
          </p>
        </div>
      </section>
    </>
  );
}
