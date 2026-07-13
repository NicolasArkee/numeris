import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/libs/db";
import { AppConfig } from "@/utils/AppConfig";
import { BreadcrumbJsonLd, WebPageJsonLd } from "@/components/JsonLd";
import { CtaContact } from "@/components/CtaContact";
import { StickyMobileCTA } from "@/components/StickyMobileCTA";
import {
  FLAGSHIP_DOSSIERS,
  INTENTION_RAILS,
  getPublishedGuidesCount,
} from "@/libs/ressources/bibliotheque-data";

// Index /ressources V2 « bibliothèque du comparateur » (2026-07-13) :
// à-la-une éditorial (facture électronique 2026), dossiers phares en grille
// registre, rails par intention de lecteur, index des thèmes en pied —
// aucune donnée d'outillage SEO affichée.
export const revalidate = 86400;

export const metadata: Metadata = {
  title: `Guides & comparatifs comptables | ${AppConfig.name}`,
  description:
    "La bibliothèque du comparateur : tarifs des experts-comptables, facture électronique 2026, logiciels, obligations, métier — des repères vérifiables pour décider.",
  alternates: { canonical: `${AppConfig.url}/ressources` },
};

export default async function RessourcesPage() {
  const [silos, guidesCount] = await Promise.all([
    db.getSilos().catch(() => []),
    getPublishedGuidesCount(),
  ]);
  const hubsBySilo = new Map(
    await Promise.all(
      silos.map(async (silo) => [silo.slug, await db.getHubsBySilo(silo.slug)] as const),
    ),
  );
  const [aLaUne, ...dossiers] = FLAGSHIP_DOSSIERS;

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Accueil", url: "/" },
          { name: "Ressources", url: "/ressources" },
        ]}
      />
      <WebPageJsonLd
        name="Guides & comparatifs"
        description={metadata.description as string}
        url="/ressources"
      />

      {/* Hero bibliothèque */}
      <section className="relative overflow-hidden bg-brand-ink px-6 py-16 lg:px-[4.5rem] lg:py-20">
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
          <p className="mb-5 font-mono text-[0.68rem] uppercase tracking-[0.22em] text-accent-300">
            La bibliothèque du comparateur
          </p>
          <h1 className="mb-5 max-w-3xl font-display text-[2.2rem] font-extrabold leading-[1.06] tracking-tight text-surface lg:text-[3.2rem]">
            Guides &amp; comparatifs
          </h1>
          <p className="max-w-2xl text-[1.02rem] leading-relaxed text-white/80">
            Des repères vérifiables pour chiffrer, choisir et rester en règle —
            rédigés pour comparer, pas pour vendre.
          </p>
          <dl className="mt-8 flex flex-wrap gap-x-10 gap-y-4 border-t border-white/12 pt-5">
            {[
              ...(guidesCount > 0 ? [{ v: guidesCount.toLocaleString("fr-FR"), l: "guides publiés" }] : []),
              { v: String(FLAGSHIP_DOSSIERS.length), l: "dossiers phares" },
              { v: "Continue", l: "mise à jour" },
            ].map((s) => (
              <div key={s.l}>
                <dt className="sr-only">{s.l}</dt>
                <dd className="font-mono text-[1.25rem] font-semibold tabular-nums text-surface">{s.v}</dd>
                <dd className="mt-0.5 text-[0.68rem] uppercase tracking-[0.1em] text-white/55">{s.l}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* À la une */}
      <section className="bg-bg px-6 py-16 lg:px-[4.5rem]">
        <div className="mx-auto max-w-[82rem]">
          <p className="mb-6 font-mono text-[0.65rem] uppercase tracking-[0.2em] text-accent-700">
            01 — À la une
          </p>
          <div className="grid gap-px border border-border bg-border lg:grid-cols-[1.6fr_1fr_1fr]">
            <Link
              href={aLaUne.href}
              className="group flex min-h-56 flex-col justify-between bg-brand-ink p-8 transition-colors hover:bg-brand-900 lg:p-10"
            >
              <span className="inline-flex w-fit border border-accent-500 px-2.5 py-1 font-mono text-[0.6rem] uppercase tracking-[0.14em] text-accent-300">
                {aLaUne.tag}
              </span>
              <span>
                <span className="block font-display text-[1.6rem] font-extrabold leading-tight text-surface group-hover:text-accent-300 lg:text-[2rem]">
                  {aLaUne.title}
                </span>
                <span className="mt-3 block max-w-xl text-[0.9rem] leading-relaxed text-white/70">
                  {aLaUne.description}
                </span>
                <span className="mt-5 inline-flex items-center gap-2 font-display text-[0.85rem] font-semibold text-accent-300">
                  Ouvrir le dossier →
                </span>
              </span>
            </Link>
            {dossiers.slice(0, 2).map((d) => (
              <Link
                key={d.href}
                href={d.href}
                className="group flex min-h-56 flex-col justify-between bg-surface p-8 transition-colors hover:bg-brand-50"
              >
                <span className="font-mono text-[0.6rem] uppercase tracking-[0.14em] text-accent-700">
                  {d.tag}
                </span>
                <span>
                  <span className="block font-display text-[1.15rem] font-bold leading-snug text-ink group-hover:text-brand-700">
                    {d.title}
                    <span aria-hidden className="ml-1.5 text-accent-500 opacity-0 transition-opacity group-hover:opacity-100">→</span>
                  </span>
                  <span className="mt-2 block text-[0.82rem] leading-relaxed text-ink-muted">
                    {d.description}
                  </span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Les dossiers */}
      <section className="bg-bg px-6 pb-16 lg:px-[4.5rem]">
        <div className="mx-auto max-w-[82rem]">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
            <p className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-accent-700">
              02 — Les dossiers
            </p>
            <Link
              href="/ressources/tous-les-dossiers"
              className="font-display text-[0.82rem] font-semibold text-brand-700 transition-colors hover:text-accent-700"
            >
              Vue exhaustive →
            </Link>
          </div>
          <div className="grid gap-px border border-border bg-border md:grid-cols-2 lg:grid-cols-3">
            {dossiers.slice(2).map((d, i) => (
              <Link
                key={d.href}
                href={d.href}
                className="group flex min-h-36 flex-col justify-between bg-surface p-6 transition-colors hover:bg-brand-50"
              >
                <span className="flex items-baseline justify-between gap-3">
                  <span className="font-mono text-[0.65rem] tabular-nums text-accent-700">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="font-mono text-[0.58rem] uppercase tracking-[0.14em] text-ink-soft">
                    {d.tag}
                  </span>
                </span>
                <span>
                  <span className="block font-display text-[1.02rem] font-bold leading-snug text-ink group-hover:text-brand-700">
                    {d.title}
                    <span aria-hidden className="ml-1.5 text-accent-500 opacity-0 transition-opacity group-hover:opacity-100">→</span>
                  </span>
                  <span className="mt-1.5 line-clamp-2 block text-[0.78rem] leading-snug text-ink-muted">
                    {d.description}
                  </span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Rails par intention */}
      <section className="border-t border-border bg-surface px-6 py-16 lg:px-[4.5rem]">
        <div className="mx-auto max-w-[82rem]">
          <p className="mb-8 font-mono text-[0.65rem] uppercase tracking-[0.2em] text-accent-700">
            03 — Par où commencer
          </p>
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            {INTENTION_RAILS.map((rail) => (
              <div key={rail.title}>
                <h2 className="mb-4 font-display text-[1.05rem] font-extrabold text-ink">
                  {rail.title}
                </h2>
                <ul className="space-y-2.5 border-t border-border pt-4">
                  {rail.links.map((l) => (
                    <li key={l.href}>
                      <Link
                        href={l.href}
                        className="group inline-flex items-start gap-2 text-[0.85rem] leading-snug text-ink-muted transition-colors hover:text-accent-700"
                      >
                        <span aria-hidden className="mt-1.5 h-1 w-1 flex-shrink-0 bg-border transition-colors group-hover:bg-accent-500" />
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Index des thèmes (sans données d'outillage) */}
      <section className="border-t border-border bg-bg-muted px-6 py-14 lg:px-[4.5rem]">
        <div className="mx-auto max-w-[82rem]">
          <p className="mb-8 font-mono text-[0.65rem] uppercase tracking-[0.2em] text-ink-soft">
            04 — Tous les thèmes
          </p>
          <div className="grid gap-x-10 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
            {silos.map((silo) => {
              const hubs = hubsBySilo.get(silo.slug) ?? [];
              if (hubs.length === 0) return null;
              return (
                <div key={silo.slug}>
                  <h2 className="mb-3 font-display text-[0.92rem] font-bold text-ink">
                    {silo.label}
                  </h2>
                  <ul className="space-y-1.5">
                    {hubs.map((hub) => (
                      <li key={hub.slug}>
                        <Link
                          href={`/ressources/${hub.slug}`}
                          className="text-[0.8rem] text-ink-muted transition-colors hover:text-accent-700"
                        >
                          {hub.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <CtaContact />
      <StickyMobileCTA />
    </>
  );
}
