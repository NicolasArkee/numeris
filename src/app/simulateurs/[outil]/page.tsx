import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AppConfig } from "@/utils/AppConfig";
import { BreadcrumbJsonLd, FaqJsonLd, WebPageJsonLd } from "@/components/JsonLd";
import { PageHero } from "@/components/PageHero";
import { CtaContact } from "@/components/CtaContact";
import { StickyMobileCTA } from "@/components/StickyMobileCTA";
import { DynamicSection } from "@/components/DynamicSection";
import { LastUpdated } from "@/components/LastUpdated";
import { getDbPageBundle } from "@/libs/content/dbFirst";
import { db } from "@/libs/db";
import { getSimulateur, SIMULATEURS } from "../registry";

interface Props {
  params: Promise<{ outil: string }>;
}

export const revalidate = 86400;

export function generateStaticParams() {
  return SIMULATEURS.map((s) => ({ outil: s.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { outil } = await params;
  const sim = getSimulateur(outil);
  if (!sim) return {};
  const seo = await db.getSeoOverride("simulateurs", sim.slug).catch(() => null);
  return {
    title: seo?.meta_title || sim.metaTitle,
    description: seo?.meta_description || sim.metaDescription,
    alternates: { canonical: `${AppConfig.url}/simulateurs/${sim.slug}` },
  };
}

// FAQ = registry uniquement (FaqJsonLd) — l'édito DB ne doit jamais rendre de
// section Faq, sinon doublon de schéma FAQPage sur la page.
const FAQ_TYPES = new Set(["Faq", "FAQSection_PAA"]);

export default async function SimulateurPage({ params }: Props) {
  const { outil } = await params;
  const sim = getSimulateur(outil);
  if (!sim) notFound();

  const bundle = await getDbPageBundle("simulateurs", sim.slug);
  const editoSections = bundle.renderableSections.filter((s) => !FAQ_TYPES.has(s.section_type));
  const sommaire = editoSections
    .map((s, i) => ({ id: `outil-section-${i}`, title: s.title }))
    .filter((s): s is { id: string; title: string } => Boolean(s.title));
  const others = SIMULATEURS.filter((s) => s.slug !== sim.slug);

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Accueil", url: "/" },
          { name: "Simulateurs", url: "/simulateurs" },
          { name: sim.title, url: `/simulateurs/${sim.slug}` },
        ]}
      />
      <WebPageJsonLd
        name={bundle.seo?.h1 || sim.h1}
        description={bundle.seo?.meta_description || sim.metaDescription}
        url={`/simulateurs/${sim.slug}`}
      />
      <FaqJsonLd items={sim.faqs.map((f) => ({ question: f.question, answer: f.answer }))} />

      <PageHero
        eyebrow={sim.eyebrow}
        title={bundle.seo?.h1 || sim.h1}
        subtitle={sim.intro}
        breadcrumbs={[
          { name: "Accueil", url: "/" },
          { name: "Simulateurs", url: "/simulateurs" },
          { name: sim.title, url: `/simulateurs/${sim.slug}` },
        ]}
        variant="compact"
      />

      {/* Calculateur — above the fold, immédiatement sous le hero */}
      <section className="bg-bg px-6 pb-4 pt-10 lg:px-[4.5rem]">
        <div className="mx-auto max-w-[82rem]">
          {sim.render()}
          {bundle.lastUpdatedDate && (
            <div className="mt-4">
              <LastUpdated date={bundle.lastUpdatedDate} reviewLabel="Barèmes vérifiés par l'équipe" />
            </div>
          )}
        </div>
      </section>

      {/* Édito DB (route='simulateurs') sous l'outil, façon dossier */}
      {editoSections.length > 0 && (
        <section className="bg-bg px-6 py-12 lg:px-[4.5rem]">
          <div className="mx-auto max-w-[82rem]">
            <div className="grid gap-10 lg:grid-cols-[15.5rem_1fr]">
              {/* Sommaire sticky */}
              {sommaire.length > 1 && (
                <nav aria-label="Sommaire" className="hidden lg:block">
                  <div className="sticky top-24 border border-border-soft bg-surface p-5">
                    <p className="mb-3 font-mono text-[0.62rem] uppercase tracking-[0.18em] text-accent-700">
                      Sommaire
                    </p>
                    <ol className="space-y-2">
                      {sommaire.map((s, i) => (
                        <li key={s.id}>
                          <a
                            href={`#${s.id}`}
                            className="flex items-baseline gap-2 text-[0.78rem] leading-snug text-ink-muted transition-colors hover:text-accent-700"
                          >
                            <span className="font-mono text-[0.62rem] tabular-nums text-accent-700">
                              {String(i + 1).padStart(2, "0")}
                            </span>
                            {s.title}
                          </a>
                        </li>
                      ))}
                    </ol>
                  </div>
                </nav>
              )}
              <div className="min-w-0">
                {bundle.keyTakeaways && bundle.keyTakeaways.length > 0 && (
                  <div className="mb-10 border border-border-soft border-l-2 border-l-accent-500 bg-surface p-6">
                    <p className="mb-3 font-mono text-[0.62rem] uppercase tracking-[0.18em] text-accent-700">
                      L&apos;essentiel
                    </p>
                    <ul className="space-y-2">
                      {bundle.keyTakeaways.map((t) => (
                        <li key={t} className="flex items-start gap-2.5 text-[0.9rem] leading-relaxed text-ink-muted">
                          <span aria-hidden className="mt-2 h-1 w-1 flex-shrink-0 bg-accent-500" />
                          {t}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {editoSections.map((s, i) => (
                  <div key={s.id} id={`outil-section-${i}`} className="scroll-mt-24">
                    <DynamicSection section={s} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="bg-bg px-6 pb-16 lg:px-[4.5rem]">
        <div className="mx-auto max-w-[82rem]">
          {/* FAQ */}
          <div className="mt-8" id="faq">
            <h2 className="mb-8 font-display text-[1.75rem] font-bold leading-tight text-ink">
              Questions fréquentes
            </h2>
            <div className="grid gap-4">
              {sim.faqs.map((faq) => (
                <details key={faq.question} className="group border border-border-soft bg-surface">
                  <summary className="flex cursor-pointer items-center justify-between px-7 py-5 text-[0.95rem] font-medium text-ink transition-colors hover:text-accent-700">
                    {faq.question}
                    <span className="ml-4 text-[0.8rem] text-border-soft transition-transform group-open:rotate-45">
                      +
                    </span>
                  </summary>
                  <div className="max-w-prose border-t border-border-soft px-7 py-5 text-base leading-relaxed text-ink-muted">
                    {faq.answer}
                  </div>
                </details>
              ))}
            </div>
          </div>

          {/* Autres outils */}
          <div className="mt-16">
            <h2 className="mb-6 font-display text-[1.25rem] font-bold text-ink">
              Nos autres outils gratuits
            </h2>
            <div className="flex flex-wrap gap-2">
              {others.map((o) => (
                <Link
                  key={o.slug}
                  href={`/simulateurs/${o.slug}`}
                  className="border border-border-soft bg-surface px-4 py-2 text-[0.78rem] text-ink-muted transition-colors hover:border-accent-500 hover:text-accent-700"
                >
                  {o.icon} {o.title}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <CtaContact />
      <StickyMobileCTA />
    </>
  );
}
