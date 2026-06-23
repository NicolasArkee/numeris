import React from "react";
import Link from "next/link";
import type {
  ProfessionCategory,
  Secteur,
  Service,
} from "@/libs/db";
import { DirectoryFaq } from "@/components/directory/DirectoryFaq";
import {
  buildExpertiseFaqItems,
  buildExpertiseNeedLinks,
  buildExpertisePageStats,
  buildExpertiseProfessionCategoryLinks,
  buildExpertiseSectorLinks,
} from "./expertises-v2-helpers";

function StatPanel({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="border-b border-white/12 py-4 last:border-b-0">
      <p className="font-display text-[2rem] font-semibold leading-none text-surface">
        {value}
      </p>
      <p className="mt-2 text-[0.76rem] font-medium uppercase text-white/62">
        {label}
      </p>
    </div>
  );
}

function ServiceCard({ service }: { service: Service }) {
  return (
    <Link
      href={`/expertises/${service.slug}`}
      className="group flex min-h-[17rem] flex-col justify-between border border-border-soft bg-surface p-7 transition-colors hover:border-accent-500"
    >
      <div>
        <div className="mb-5 flex h-11 w-11 items-center justify-center border border-border-soft text-[1.15rem]">
          {service.icon}
        </div>
        <h3 className="font-display text-[1.2rem] font-medium leading-snug text-ink">
          {service.title}
        </h3>
        <p className="mt-3 text-[0.84rem] leading-6 text-ink-muted">
          {service.description}
        </p>
      </div>
      <span className="mt-6 inline-flex w-fit items-center gap-2 text-[0.82rem] font-semibold text-accent-700">
        Voir l'expertise
        <span className="transition-transform group-hover:translate-x-1">
          -&gt;
        </span>
      </span>
    </Link>
  );
}

export function ExpertisesPageV2({
  services,
  secteurs,
  categories,
}: {
  services: Service[];
  secteurs: Secteur[];
  categories: ProfessionCategory[];
}) {
  const orderedServices = [...services].sort(
    (a, b) => a.order_index - b.order_index || a.title.localeCompare(b.title, "fr"),
  );
  const stats = buildExpertisePageStats(services, secteurs, categories);
  const needLinks = buildExpertiseNeedLinks(services);
  const sectorLinks = buildExpertiseSectorLinks(secteurs, 8);
  const categoryLinks = buildExpertiseProfessionCategoryLinks(categories, 8);
  const faqItems = buildExpertiseFaqItems();

  return (
    <>
      <section className="bg-brand-ink px-6 py-12 text-surface lg:px-[4.5rem] lg:py-16">
        <div className="mx-auto max-w-[82rem]">
          <nav aria-label="Fil d'Ariane" className="mb-8">
            <ol className="flex flex-wrap items-center gap-1.5 text-[0.78rem] text-white/70">
              <li>
                <Link href="/" className="hover:text-accent-500">
                  Accueil
                </Link>
              </li>
              <li>/</li>
              <li className="text-white/90">Expertises</li>
            </ol>
          </nav>

          <div className="grid gap-9 lg:grid-cols-[minmax(0,1fr)_21rem] lg:items-end">
            <div>
              <h1 className="max-w-4xl font-display text-[2.45rem] font-semibold leading-[1.08] text-surface lg:text-[3.35rem]">
                Expertises comptables
              </h1>
              <p className="mt-4 max-w-2xl text-[1.05rem] leading-7 text-white/84">
                Choisissez l'expertise adaptee a votre besoin : comptabilite,
                fiscalite, social, creation d'entreprise, pilotage ou audit.
              </p>
              <p className="mt-5 max-w-2xl text-[0.92rem] leading-7 text-white/72">
                Chaque page detaille le cadre de la mission, les points a
                verifier et les liens utiles par secteur ou profession.
              </p>
            </div>

            <aside className="border border-white/15 bg-white/[0.03] px-6 py-4">
              <StatPanel label="expertises" value={stats.serviceCount} />
              <StatPanel label="secteurs relies" value={stats.sectorCount} />
              <StatPanel
                label="familles de professions"
                value={stats.professionCategoryCount}
              />
            </aside>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="#expertises"
              className="inline-flex whitespace-nowrap justify-center bg-accent-500 px-6 py-3 text-[0.84rem] font-semibold text-brand-ink transition-colors hover:bg-accent-700"
            >
              Parcourir les expertises
            </Link>
            <Link
              href="/contact"
              className="inline-flex whitespace-nowrap justify-center border border-white/40 px-6 py-3 text-[0.84rem] font-semibold text-white transition-colors hover:border-accent-500 hover:text-accent-500"
            >
              Demander une orientation
            </Link>
          </div>
        </div>
      </section>

      <article className="bg-bg px-6 py-12 lg:px-[4.5rem] lg:py-16">
        <div className="mx-auto max-w-[82rem] space-y-14">
          <section id="expertises">
            <div className="mb-7 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
              <div>
                <h2 className="font-display text-[1.65rem] font-bold text-ink">
                  Choisissez l'expertise adaptee a votre besoin
                </h2>
                <p className="mt-3 max-w-3xl text-[0.92rem] leading-7 text-ink-muted">
                  Les expertises ci-dessous structurent les principales missions
                  comptables a comparer. Elles servent de porte d'entree avant
                  un cadrage plus fin selon votre activite.
                </p>
              </div>
              <Link
                href="/contact"
                className="inline-flex w-fit border border-brand-ink px-5 py-3 text-[0.8rem] font-semibold text-brand-ink transition-colors hover:border-accent-500 hover:text-accent-700"
              >
                Parler a Skoria
              </Link>
            </div>
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {orderedServices.map((service) => (
                <ServiceCard key={service.slug} service={service} />
              ))}
            </div>
          </section>

          <section>
            <h2 className="font-display text-[1.45rem] font-bold text-ink">
              Par besoin
            </h2>
            <p className="mt-2 max-w-3xl text-[0.88rem] leading-7 text-ink-muted">
              Retrouvez rapidement la bonne expertise si vous partez d'un
              probleme concret plutot que d'un intitulé de mission.
            </p>
            <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {needLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="group border border-border-soft bg-surface px-5 py-5 transition-colors hover:border-accent-500"
                >
                  <h3 className="text-[0.95rem] font-semibold text-ink">
                    {link.label}
                  </h3>
                  <p className="mt-2 min-h-[3rem] text-[0.82rem] leading-6 text-ink-muted">
                    {link.description}
                  </p>
                  <span className="mt-3 inline-flex text-[0.78rem] font-semibold text-accent-700 group-hover:underline">
                    Continuer -&gt;
                  </span>
                </Link>
              ))}
            </div>
          </section>

          <section className="grid gap-9 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            <div>
              <h2 className="font-display text-[1.45rem] font-bold text-ink">
                Par secteur
              </h2>
              <p className="mt-2 text-[0.88rem] leading-7 text-ink-muted">
                Les obligations comptables varient selon l'activite, les marges,
                la TVA et les cycles d'encaissement.
              </p>
              <div className="mt-5 grid gap-3">
                {sectorLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="border border-border-soft bg-surface px-5 py-4 transition-colors hover:border-accent-500"
                  >
                    <h3 className="text-[0.9rem] font-semibold text-ink">
                      {link.label}
                    </h3>
                    <p className="mt-1 text-[0.78rem] leading-5 text-ink-muted">
                      {link.description}
                    </p>
                  </Link>
                ))}
              </div>
            </div>

            <div>
              <h2 className="font-display text-[1.45rem] font-bold text-ink">
                Par profession
              </h2>
              <p className="mt-2 text-[0.88rem] leading-7 text-ink-muted">
                Les pages profession aident a contextualiser les questions a
                poser avant un rendez-vous.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                {categoryLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="border border-brand-ink/55 bg-surface px-4 py-2 text-[0.8rem] font-medium text-brand-ink transition-colors hover:border-accent-500 hover:text-accent-700"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          </section>

          <section className="border border-border-soft bg-surface p-7">
            <h2 className="font-display text-[1.45rem] font-bold text-ink">
              Methode Skoria
            </h2>
            <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
              {[
                ["01", "Qualifier", "Identifier le besoin, le contexte et les obligations deja en place."],
                ["02", "Cadrer", "Lister les documents, responsabilites et points de vigilance."],
                ["03", "Produire", "Mettre en ordre les livrables comptables, fiscaux ou sociaux."],
                ["04", "Piloter", "Transformer les chiffres en decisions et prochaines actions."],
              ].map(([step, title, body]) => (
                <div key={step} className="border-l border-border-soft pl-5">
                  <p className="text-[0.76rem] font-bold uppercase text-accent-700">
                    {step}
                  </p>
                  <h3 className="mt-2 text-[0.95rem] font-semibold text-ink">
                    {title}
                  </h3>
                  <p className="mt-2 text-[0.82rem] leading-6 text-ink-muted">
                    {body}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <DirectoryFaq items={faqItems} />

          <section className="grid gap-5 md:grid-cols-2">
            <div className="border border-border-soft bg-surface p-7">
              <h2 className="font-display text-[1.15rem] font-medium text-ink">
                Besoin de choisir une mission ?
              </h2>
              <p className="mt-3 text-[0.88rem] leading-7 text-ink-muted">
                Decrivez votre situation et Skoria vous oriente vers
                l'expertise ou la combinaison d'expertises la plus pertinente.
              </p>
              <Link
                href="/contact"
                className="mt-4 inline-flex text-[0.84rem] font-medium text-accent-700 hover:underline"
              >
                Demander une orientation -&gt;
              </Link>
            </div>
            <div className="border border-border-soft bg-surface p-7">
              <h2 className="font-display text-[1.15rem] font-medium text-ink">
                Explorer l'annuaire
              </h2>
              <p className="mt-3 text-[0.88rem] leading-7 text-ink-muted">
                Vous cherchez un professionnel local ? L'annuaire distingue les
                fiches documentees des informations encore a confirmer.
              </p>
              <Link
                href="/annuaire/experts-comptables"
                className="mt-4 inline-flex text-[0.84rem] font-medium text-accent-700 hover:underline"
              >
                Voir l'annuaire -&gt;
              </Link>
            </div>
          </section>
        </div>
      </article>
    </>
  );
}
