import Link from "next/link";
import { BreadcrumbJsonLd, WebPageJsonLd } from "@/components/JsonLd";
import { CtaContact } from "@/components/CtaContact";
import { StickyMobileCTA } from "@/components/StickyMobileCTA";
import { MaillageLinks } from "@/components/MaillageLinks";
import { AppConfig } from "@/utils/AppConfig";
import {
  FLAGSHIP_DOSSIERS,
  getEditorialDossiers,
  getPillarPages,
} from "@/libs/ressources/bibliotheque-data";

/** /ressources/tous-les-dossiers V2 — la vue EXHAUSTIVE de la bibliothèque :
 *  dossiers phares, tous les thèmes de la taxonomie, dossiers éditoriaux
 *  (labels maillage-v3 normalisés). L'index /ressources n'affiche qu'une
 *  sélection ; ici, tout. */
export async function AllDossiersPage() {
  const canonicalUrl = `${AppConfig.url}/ressources/tous-les-dossiers`;
  const [editorialDossiers, pillars] = await Promise.all([
    getEditorialDossiers(),
    getPillarPages(),
  ]);
  const breadcrumbs = [
    { name: "Accueil", url: "/" },
    { name: "Ressources", url: "/ressources" },
    { name: "Tous les dossiers", url: "/ressources/tous-les-dossiers" },
  ];

  return (
    <>
      <BreadcrumbJsonLd items={breadcrumbs} />
      <WebPageJsonLd
        name="Tous les dossiers"
        description="La vue exhaustive de la bibliothèque Skoria : dossiers phares, thèmes et dossiers éditoriaux."
        url="/ressources/tous-les-dossiers"
      />

      <section className="relative overflow-hidden bg-brand-ink px-6 py-14 lg:px-[4.5rem] lg:py-16">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.5]"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(255,255,255,0.045) 1px, transparent 1px)",
            backgroundSize: "96px 100%",
          }}
        />
        <div className="relative z-10 mx-auto max-w-[82rem]">
          <nav aria-label="Fil d'Ariane" className="mb-6">
            <ol className="flex flex-wrap items-center gap-1.5 text-[0.78rem] text-white/70">
              {breadcrumbs.map((item, i) => (
                <li key={item.url} className="flex items-center gap-1.5">
                  {i > 0 && <span>/</span>}
                  {i < breadcrumbs.length - 1 ? (
                    <Link href={item.url} className="transition-colors hover:text-accent-500">
                      {item.name}
                    </Link>
                  ) : (
                    <span className="text-white/90">{item.name}</span>
                  )}
                </li>
              ))}
            </ol>
          </nav>
          <p className="mb-4 font-mono text-[0.68rem] uppercase tracking-[0.22em] text-accent-300">
            Bibliothèque · vue exhaustive
          </p>
          <h1 className="mb-4 font-display text-[2rem] font-extrabold leading-[1.08] tracking-tight text-surface lg:text-[2.8rem]">
            Tous les dossiers
          </h1>
          <p className="max-w-2xl text-[0.98rem] leading-relaxed text-white/80">
            {FLAGSHIP_DOSSIERS.length} dossiers phares, {pillars.length} pages de
            référence et {editorialDossiers.length} dossiers éditoriaux —
            l&apos;intégralité de la bibliothèque du comparateur.
          </p>
        </div>
      </section>

      <div className="bg-bg px-6 py-14 lg:px-[4.5rem]">
        <div className="mx-auto max-w-[82rem] space-y-16">
          {/* Dossiers phares */}
          <section>
            <p className="mb-6 font-mono text-[0.65rem] uppercase tracking-[0.2em] text-accent-700">
              01 — Dossiers phares
            </p>
            <div className="grid gap-px border border-border bg-border md:grid-cols-2 lg:grid-cols-3">
              {FLAGSHIP_DOSSIERS.map((d, i) => (
                <Link
                  key={d.href}
                  href={d.href}
                  className="group flex min-h-32 flex-col justify-between bg-surface p-6 transition-colors hover:bg-brand-50"
                >
                  <span className="flex items-baseline justify-between gap-3">
                    <span className="font-mono text-[0.65rem] tabular-nums text-accent-700">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="font-mono text-[0.58rem] uppercase tracking-[0.14em] text-ink-soft">
                      {d.tag}
                    </span>
                  </span>
                  <span className="mt-2 font-display text-[1rem] font-bold leading-snug text-ink group-hover:text-brand-700">
                    {d.title}
                    <span aria-hidden className="ml-1.5 text-accent-500 opacity-0 transition-opacity group-hover:opacity-100">→</span>
                  </span>
                </Link>
              ))}
            </div>
          </section>

          {/* Pages de référence — pillar pages, pas de taxonomie interne */}
          {pillars.length > 0 && (
            <section>
              <p className="mb-6 font-mono text-[0.65rem] uppercase tracking-[0.2em] text-accent-700">
                02 — Les pages de référence
              </p>
              <div className="grid gap-x-10 gap-y-2.5 border border-border bg-surface p-8 sm:grid-cols-2 lg:grid-cols-3">
                {pillars.map((p) => (
                  <Link
                    key={p.slug}
                    href={`/ressources/${p.slug}`}
                    className="group inline-flex items-start gap-2 text-[0.85rem] leading-snug text-ink-muted transition-colors hover:text-accent-700"
                  >
                    <span aria-hidden className="mt-1.5 h-1 w-1 flex-shrink-0 bg-border transition-colors group-hover:bg-accent-500" />
                    {p.title}
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Dossiers éditoriaux */}
          {editorialDossiers.length > 0 && (
            <section>
              <p className="mb-6 font-mono text-[0.65rem] uppercase tracking-[0.2em] text-accent-700">
                03 — Dossiers éditoriaux
              </p>
              <div className="flex flex-wrap gap-2">
                {editorialDossiers.map((d) => (
                  <Link
                    key={d.slug}
                    href={`/ressources/${d.slug}`}
                    className="border border-border bg-surface px-4 py-2 text-[0.82rem] text-ink-muted transition-colors hover:border-accent-500 hover:text-accent-700"
                  >
                    {d.title}
                  </Link>
                ))}
              </div>
            </section>
          )}

          <MaillageLinks sourceUrl={canonicalUrl} />

          <div className="border border-border bg-surface p-7 text-center">
            <Link
              href="/ressources"
              className="font-display text-[0.88rem] font-semibold text-brand-700 transition-colors hover:text-accent-700"
            >
              ← Retour à la bibliothèque
            </Link>
          </div>
        </div>
      </div>

      <CtaContact />
      <StickyMobileCTA />
    </>
  );
}
