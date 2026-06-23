import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AppConfig } from "@/utils/AppConfig";
import { BreadcrumbJsonLd, FaqJsonLd, WebPageJsonLd } from "@/components/JsonLd";
import { PageHero } from "@/components/PageHero";
import { CtaContact } from "@/components/CtaContact";
import { StickyMobileCTA } from "@/components/StickyMobileCTA";
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
  return {
    title: sim.metaTitle,
    description: sim.metaDescription,
    alternates: { canonical: `${AppConfig.url}/simulateurs/${sim.slug}` },
  };
}

export default async function SimulateurPage({ params }: Props) {
  const { outil } = await params;
  const sim = getSimulateur(outil);
  if (!sim) notFound();

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
      <WebPageJsonLd name={sim.h1} description={sim.metaDescription} url={`/simulateurs/${sim.slug}`} />
      <FaqJsonLd items={sim.faqs.map((f) => ({ question: f.question, answer: f.answer }))} />

      <PageHero
        eyebrow={sim.eyebrow}
        title={sim.h1}
        subtitle={sim.intro}
        breadcrumbs={[
          { name: "Accueil", url: "/" },
          { name: "Simulateurs", url: "/simulateurs" },
          { name: sim.title, url: `/simulateurs/${sim.slug}` },
        ]}
        variant="compact"
      />

      <section className="bg-bg px-6 py-16 lg:px-[4.5rem]">
        <div className="mx-auto max-w-[82rem]">
          {sim.render()}

          {/* FAQ */}
          <div className="mt-16" id="faq">
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
