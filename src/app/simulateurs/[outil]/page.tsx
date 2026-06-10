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

      <section className="bg-creme px-6 py-16 lg:px-[4.5rem]">
        <div className="mx-auto max-w-[82rem]">
          {sim.render()}

          {/* FAQ */}
          <div className="mt-16" id="faq">
            <h2 className="mb-8 font-serif text-[1.75rem] font-light leading-tight text-encre">
              Questions fréquentes
            </h2>
            <div className="grid gap-4">
              {sim.faqs.map((faq) => (
                <details key={faq.question} className="group border border-pierre-12 bg-blanc">
                  <summary className="flex cursor-pointer items-center justify-between px-7 py-5 text-[0.95rem] font-medium text-encre transition-colors hover:text-or-fonce">
                    {faq.question}
                    <span className="ml-4 text-[0.8rem] text-pierre-12 transition-transform group-open:rotate-45">
                      +
                    </span>
                  </summary>
                  <div className="max-w-prose border-t border-pierre-12 px-7 py-5 text-base leading-relaxed text-ardoise">
                    {faq.answer}
                  </div>
                </details>
              ))}
            </div>
          </div>

          {/* Autres outils */}
          <div className="mt-16">
            <h2 className="mb-6 font-serif text-[1.25rem] font-light text-encre">
              Nos autres outils gratuits
            </h2>
            <div className="flex flex-wrap gap-2">
              {others.map((o) => (
                <Link
                  key={o.slug}
                  href={`/simulateurs/${o.slug}`}
                  className="border border-pierre-12 bg-blanc px-4 py-2 text-[0.78rem] text-encre-75 transition-colors hover:border-or hover:text-or-fonce"
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
