import type { Metadata } from "next";
import Link from "next/link";
import { AppConfig } from "@/utils/AppConfig";
import { BreadcrumbJsonLd, WebPageJsonLd, ItemListJsonLd } from "@/components/JsonLd";
import { PageHero } from "@/components/PageHero";
import { DOCUMENTS, DOC_CATEGORIES, documentUrl } from "@/data/documents";

export const metadata: Metadata = {
  title: "Modèles & documents comptables expliqués (spécimens annotés)",
  description: `Facture, statuts, PV d'AG, lettre de mission, bilan, liasse fiscale… ${DOCUMENTS.length} documents expliqués champ par champ, avec spécimens annotés à télécharger. Guides clairs par Skoria.`,
  alternates: { canonical: `${AppConfig.url}/documents` },
};

export default function DocumentsHub() {
  const groups = DOC_CATEGORIES.map((cat) => ({
    cat,
    docs: DOCUMENTS.filter((d) => d.categorie === cat.key).sort((a, b) => a.priorite - b.priorite),
  })).filter((g) => g.docs.length > 0);

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Accueil", url: "/" },
          { name: "Documents", url: "/documents" },
        ]}
      />
      <WebPageJsonLd name={metadata.title as string} description={metadata.description as string} url="/documents" />
      <ItemListJsonLd
        name="Modèles & documents comptables expliqués"
        url="/documents"
        items={DOCUMENTS.map((d) => ({ name: d.label, url: documentUrl(d.slug) }))}
      />

      <PageHero
        eyebrow="Modèles & documents"
        title="Documents comptables expliqués"
        subtitle={`${DOCUMENTS.length} documents décryptés champ par champ — mentions obligatoires, à quoi ça sert, erreurs à éviter — avec des spécimens annotés à télécharger. Repères 2026 vérifiés sur les sources officielles.`}
        breadcrumbs={[
          { name: "Accueil", url: "/" },
          { name: "Documents", url: "/documents" },
        ]}
      />

      <div className="mx-auto max-w-5xl px-4 py-12">
        {groups.map(({ cat, docs }) => (
          <section key={cat.key} className="mb-12">
            <h2 className="mb-5 font-display text-[1.35rem] font-bold text-ink">{cat.label}</h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {docs.map((d) => (
                <Link
                  key={d.slug}
                  href={documentUrl(d.slug)}
                  className="border border-border-soft bg-surface p-4 transition-colors hover:border-brand-500 hover:bg-brand-50"
                >
                  <span className="text-[0.95rem] font-semibold text-ink">{d.label}</span>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </>
  );
}
