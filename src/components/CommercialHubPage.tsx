import Link from "next/link";
import { AppConfig } from "@/utils/AppConfig";
import { BreadcrumbJsonLd, WebPageJsonLd } from "./JsonLd";
import { PageHero } from "./PageHero";
import {
  type CommercialRoute,
  getCommercialSegments,
  getCommercialPageBySegment,
} from "@/libs/content/commercial";

const META: Record<
  CommercialRoute,
  { label: string; subtitle: string; metaDescription: string }
> = {
  comparatifs: {
    label: "Comparatifs",
    subtitle:
      "Comparatifs indépendants des solutions et services utiles aux entrepreneurs et professions libérales.",
    metaDescription:
      "Comparatifs indépendants des outils, banques et solutions pour entrepreneurs : critères vérifiables, classement transparent, aucun classement payant.",
  },
  avis: {
    label: "Avis",
    subtitle:
      "Avis et synthèses neutres des solutions populaires pour entrepreneurs : méthodologie publique, sources sourcées.",
    metaDescription:
      "Avis indépendants sur les solutions pour entrepreneurs. Synthèses neutres, sources publiques, méthode éditoriale documentée.",
  },
  "codes-parrainage": {
    label: "Codes parrainage",
    subtitle:
      "Codes parrainage actifs et vérifiés sur les solutions business : néobanques, paie, comptabilité, outils marketing.",
    metaDescription:
      "Codes de parrainage vérifiés et à jour pour économiser sur vos abonnements business : néobanques, comptabilité, paie, outils marketing.",
  },
};

export function CommercialHubPage({ route }: { route: CommercialRoute }) {
  const { label, subtitle, metaDescription } = META[route];

  const items = getCommercialSegments(route)
    .map((seg) => getCommercialPageBySegment(route, seg))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Accueil", url: "/" },
          { name: label, url: `/${route}` },
        ]}
      />
      <WebPageJsonLd
        name={`${label} ${AppConfig.name}`}
        description={metaDescription}
        url={`/${route}`}
      />

      <PageHero
        eyebrow={label}
        title={`${label} indépendants`}
        subtitle={subtitle}
        breadcrumbs={[
          { name: "Accueil", url: "/" },
          { name: label, url: `/${route}` },
        ]}
        cta={{ label: "Demander une orientation", href: "/contact" }}
      />

      <section className="bg-bg px-6 py-20 lg:px-12">
        <div className="mx-auto max-w-328">
          <div className="mb-7 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <h2 className="font-display text-[1.5rem] font-bold text-ink">
              Toutes les pages {label.toLowerCase()}
            </h2>
            <p className="font-mono text-[0.875rem] text-ink-soft">
              {items.length} référence{items.length > 1 ? "s" : ""}
            </p>
          </div>

          {items.length === 0 ? (
            <p className="rounded-lg border border-dashed border-border bg-surface px-5 py-6 text-[0.9375rem] leading-7 text-ink-muted">
              Aucune fiche publiée pour le moment. Revenez prochainement.
            </p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((item) => (
                <Link
                  key={item.url}
                  href={item.url}
                  className="group flex flex-col gap-2 rounded-lg border border-border-soft bg-surface p-5 transition-all hover:-translate-y-0.5 hover:border-brand-500 hover:shadow-md"
                >
                  <h3 className="font-display text-[1rem] font-semibold text-ink group-hover:text-brand-700">
                    {item.label}
                  </h3>
                  {item.target_query && (
                    <p className="line-clamp-2 text-[0.8125rem] leading-snug text-ink-muted">
                      {item.target_query}
                    </p>
                  )}
                  <span
                    aria-hidden
                    className="mt-auto inline-flex items-center gap-1 font-display text-[0.8125rem] font-semibold text-brand-700"
                  >
                    Voir la page <span>→</span>
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
