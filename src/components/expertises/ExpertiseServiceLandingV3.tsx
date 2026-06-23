import React from "react";
import Link from "next/link";
import type {
  Profession,
  ProfessionCategory,
  Secteur,
  Service,
} from "@/libs/db";
import { DirectoryFaq } from "@/components/directory/DirectoryFaq";
import {
  buildServiceHeroAsset,
  buildServiceLandingFaqItems,
  buildServiceSeoContentPack,
  buildServiceProfessionCards,
  buildServiceSectorCards,
  buildVisualAsset,
  type ServiceSeoContentCard,
  type ServiceSeoDeliverable,
  type ServiceSeoInternalLink,
  type ServiceSeoListBlock,
} from "./service-v3-helpers";

type ServiceSeo = {
  h1: string;
  intro: string;
  faqs: { question: string; answer: string }[];
};

function AssetImage({
  src,
  alt,
  kind,
  className,
}: {
  src: string;
  alt: string;
  kind: string;
  className: string;
}) {
  return (
    <img
      src={src}
      alt={alt}
      data-asset-kind={kind}
      loading="lazy"
      className={className}
    />
  );
}

function OfferCard({
  title,
  body,
  assetSlug,
}: {
  title: string;
  body: string;
  assetSlug: string;
}) {
  const asset = buildVisualAsset("offer", assetSlug, title);
  return (
    <article className="border border-border-soft bg-surface">
      <AssetImage
        src={asset.src}
        alt={asset.alt}
        kind="offer"
        className="h-36 w-full object-cover"
      />
      <div className="p-6">
        <h3 className="font-display text-[1.05rem] font-medium text-ink">
          {title}
        </h3>
        <p className="mt-3 text-[0.86rem] leading-6 text-ink-muted">
          {body}
        </p>
      </div>
    </article>
  );
}

function SectionHeading({
  title,
  body,
  align = "left",
}: {
  title: string;
  body: string;
  align?: "left" | "center";
}) {
  return (
    <div className={align === "center" ? "mx-auto mb-8 max-w-3xl text-center" : "mb-7 max-w-3xl"}>
      <h2 className="font-display text-[1.75rem] font-bold leading-tight text-ink lg:text-[2.05rem]">
        {title}
      </h2>
      <p className="mt-3 text-[0.94rem] leading-7 text-ink-muted">{body}</p>
    </div>
  );
}

function SeoContentCard({ card }: { card: ServiceSeoContentCard }) {
  return (
    <article className="border border-border-soft bg-surface p-5">
      <h3 className="text-[0.95rem] font-semibold text-ink">{card.title}</h3>
      <p className="mt-3 text-[0.82rem] leading-6 text-ink-muted">{card.body}</p>
    </article>
  );
}

function SeoListBlock({ block }: { block: ServiceSeoListBlock }) {
  return (
    <article className="rounded-xl border border-border bg-surface p-6 shadow-sm">
      <h3 className="font-display text-[1rem] font-bold text-ink">{block.title}</h3>
      <p className="mt-3 text-[0.875rem] leading-6 text-ink-muted">{block.body}</p>
      <ul className="mt-5 space-y-2.5">
        {block.items.map((item) => (
          <li
            key={item}
            className="flex items-start gap-2.5 text-[0.875rem] leading-6 text-ink"
          >
            <span
              aria-hidden
              className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500"
            />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </article>
  );
}

function DeliverableRow({ item }: { item: ServiceSeoDeliverable }) {
  return (
    <div className="grid gap-3 border-t border-white/14 py-5 md:grid-cols-[7rem_minmax(0,0.65fr)_minmax(0,1fr)]">
      <p className="font-display text-[1.15rem] font-semibold text-accent-500">
        {item.rhythm}
      </p>
      <h3 className="text-[0.95rem] font-semibold text-white">{item.title}</h3>
      <p className="text-[0.82rem] leading-6 text-white/72">{item.body}</p>
    </div>
  );
}

function InternalLinkCard({ link }: { link: ServiceSeoInternalLink }) {
  return (
    <Link
      href={link.href}
      className="group border border-border-soft bg-surface p-5 transition-colors hover:border-accent-500"
    >
      <h3 className="text-[0.95rem] font-semibold text-ink">{link.label}</h3>
      <p className="mt-3 text-[0.8rem] leading-6 text-ink-muted">{link.body}</p>
      <span className="mt-4 inline-flex text-[0.78rem] font-semibold text-accent-700 group-hover:underline">
        Explorer la mission -&gt;
      </span>
    </Link>
  );
}

function QualificationQuestions({
  serviceTitle,
  coverageCards,
}: {
  serviceTitle: string;
  coverageCards: ServiceSeoContentCard[];
}) {
  const firstTopic = coverageCards[0]?.title.toLowerCase() ?? "le périmètre";
  const secondTopic = coverageCards[1]?.title.toLowerCase() ?? "les contrôles";
  const questions = [
    `Quel périmètre exact couvre la mission de ${serviceTitle.toLowerCase()} et quelles tâches restent à ma charge ?`,
    "Quels documents dois-je transmettre au départ, puis chaque mois, pour éviter les relances et les retards ?",
    "Quel rythme de suivi recommandez-vous pour sécuriser les échéances sans alourdir mon organisation ?",
    `Comment traitez-vous ${firstTopic} et ${secondTopic} dans une entreprise de ma taille ?`,
    "Quels livrables vais-je recevoir, sous quel format, et comment les utiliser pour décider ?",
    "Quels points de vigilance voyez-vous dans mon secteur, mon statut, mes outils et mon historique ?",
  ];

  return (
    <section className="border border-border-soft bg-surface p-7">
      <div className="mb-6 max-w-3xl">
        <h2 className="font-display text-[1.65rem] font-bold text-ink">
          Questions à poser avant le rendez-vous
        </h2>
        <p className="mt-3 text-[0.9rem] leading-7 text-ink-muted">
          Un rendez-vous utile commence par une mission claire. Ces questions
          transforment la lecture en brief concret et évitent les échanges
          vagues sur le prix sans périmètre.
        </p>
      </div>
      <ol className="grid gap-3 md:grid-cols-2">
        {questions.map((question, index) => (
          <li
            key={question}
            className="grid grid-cols-[2.5rem_1fr] gap-3 border border-border-soft p-4"
          >
            <span className="font-display text-[1.05rem] font-semibold text-accent-700">
              {String(index + 1).padStart(2, "0")}
            </span>
            <span className="text-[0.82rem] leading-6 text-ink">
              {question}
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}

export function ExpertiseServiceLandingV3({
  service,
  seo,
  secteurs,
  professions,
  categories,
}: {
  service: Service;
  seo: ServiceSeo;
  secteurs: Secteur[];
  professions: Profession[];
  categories: ProfessionCategory[];
}) {
  const heroAsset = buildServiceHeroAsset(service);
  const sectorCards = buildServiceSectorCards(service.slug, secteurs, 8);
  const professionCards = buildServiceProfessionCards(
    service.slug,
    professions,
    categories,
    10,
  );
  const faqItems = buildServiceLandingFaqItems(service);
  const serviceName = service.title.toLowerCase();
  const offerServiceName = service.slug === "audit" ? "d'audit & commissariat" : `de ${serviceName}`;
  const seoContent = buildServiceSeoContentPack(service);
  const overviewAsset = buildVisualAsset("seo", `${service.slug}-overview`, seoContent.overviewTitle);
  const documentsAsset = buildVisualAsset("seo", `${service.slug}-documents`, seoContent.documentsTitle);

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
              <li>
                <Link href="/expertises" className="hover:text-accent-500">
                  Expertises
                </Link>
              </li>
              <li>/</li>
              <li className="text-white/90">{service.title}</li>
            </ol>
          </nav>

          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_31rem] lg:items-center">
            <div>
              <h1 className="max-w-4xl font-display text-[2.55rem] font-semibold leading-[1.05] text-surface lg:text-[3.75rem]">
                {service.title} premium pour dirigeants exigeants
              </h1>
              <p className="mt-5 max-w-2xl text-[1.08rem] leading-8 text-white/84">
                {seo.intro}
              </p>
              <div className="mt-7 grid gap-3 text-[0.86rem] text-white/78 sm:grid-cols-3">
                {[
                  "Mission cadree",
                  "Echeances securisees",
                  "Pilotage actionnable",
                ].map((item) => (
                  <span key={item} className="border border-white/16 px-3 py-2">
                    {item}
                  </span>
                ))}
              </div>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href={`/contact?expertise=${service.slug}`}
                  className="inline-flex justify-center bg-accent-500 px-7 py-3 text-[0.86rem] font-semibold text-brand-ink transition-colors hover:bg-accent-700"
                >
                  Obtenir mon diagnostic
                </Link>
                <Link
                  href="#secteurs"
                  className="inline-flex justify-center border border-white/40 px-7 py-3 text-[0.86rem] font-semibold text-white transition-colors hover:border-accent-500 hover:text-accent-500"
                >
                  Voir les cas metiers
                </Link>
              </div>
            </div>

            <div className="border border-white/15 bg-white/[0.03] p-3">
              <AssetImage
                src={heroAsset.src}
                alt={heroAsset.alt}
                kind="hero"
                className="aspect-[4/3] w-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      <article className="bg-bg px-6 py-12 lg:px-[4.5rem] lg:py-16">
        <div className="mx-auto max-w-[82rem] space-y-16">
          <section>
            <div className="mb-7 max-w-3xl">
              <h2 className="font-display text-[1.8rem] font-bold text-ink">
                Une offre {offerServiceName} construite pour convertir les
                chiffres en decisions
              </h2>
              <p className="mt-3 text-[0.94rem] leading-7 text-ink-muted">
                Une mission doit rassurer vite : ce que l'on reprend, ce que
                l'on produit, comment les echeances sont securisees et ou le
                dirigeant gagne du temps.
              </p>
            </div>
            <div className="grid gap-5 md:grid-cols-3">
              <OfferCard
                title="Reprise propre"
                body="Audit initial du dossier, recuperation des pieces et identification des risques avant de produire."
                assetSlug={`${service.slug}-reprise`}
              />
              <OfferCard
                title="Production lisible"
                body="Livrables clairs, points d'avancement et vision partagee des prochaines echeances."
                assetSlug={`${service.slug}-production`}
              />
              <OfferCard
                title="Pilotage utile"
                body="Des chiffres presentes pour decider : tresorerie, marge, charges et priorites."
                assetSlug={`${service.slug}-pilotage`}
              />
            </div>
          </section>

          <section className="grid gap-8 border border-border-soft bg-surface p-7 lg:grid-cols-[minmax(0,1fr)_24rem] lg:items-center">
            <div>
              <h2 className="font-display text-[1.85rem] font-bold leading-tight text-ink lg:text-[2.2rem]">
                {seoContent.overviewTitle}
              </h2>
              <p className="mt-4 text-[0.98rem] leading-8 text-ink-muted">
                {seoContent.overviewIntro}
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="#mission-comptable"
                  className="inline-flex justify-center border border-brand-ink px-5 py-3 text-[0.8rem] font-semibold text-brand-ink transition-colors hover:border-accent-500 hover:text-accent-700"
                >
                  Voir le perimetre
                </Link>
                <Link
                  href={`/contact?expertise=${service.slug}&intent=audit`}
                  className="inline-flex justify-center bg-brand-ink px-5 py-3 text-[0.8rem] font-semibold text-white transition-colors hover:bg-ink"
                >
                  Auditer mon dossier
                </Link>
              </div>
            </div>
            <AssetImage
              src={overviewAsset.src}
              alt={overviewAsset.alt}
              kind={overviewAsset.kind}
              className="aspect-[4/3] w-full object-cover"
            />
          </section>

          <section id="mission-comptable">
            <SectionHeading
              title={seoContent.coverageTitle}
              body={seoContent.coverageIntro}
            />
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {seoContent.coverageCards.map((card) => (
                <SeoContentCard key={card.title} card={card} />
              ))}
            </div>
          </section>

          <section className="rounded-xl bg-bg-muted px-6 py-10 lg:px-10 lg:py-12">
            <SectionHeading
              title={seoContent.obligationsTitle}
              body={seoContent.obligationsIntro}
            />
            <div className="grid gap-5 lg:grid-cols-3">
              {seoContent.obligationsBlocks.map((block) => (
                <SeoListBlock key={block.title} block={block} />
              ))}
            </div>
          </section>

          <section className="grid gap-8 lg:grid-cols-[24rem_minmax(0,1fr)] lg:items-start">
            <div className="lg:sticky lg:top-6">
              <AssetImage
                src={documentsAsset.src}
                alt={documentsAsset.alt}
                kind={documentsAsset.kind}
                className="aspect-[4/3] w-full object-cover"
              />
              <div className="mt-5">
                <h2 className="font-display text-[1.65rem] font-bold leading-tight text-ink">
                  {seoContent.documentsTitle}
                </h2>
                <p className="mt-3 text-[0.9rem] leading-7 text-ink-muted">
                  {seoContent.documentsIntro}
                </p>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {seoContent.documentBlocks.map((block) => (
                <SeoListBlock key={block.title} block={block} />
              ))}
            </div>
          </section>

          <section>
            <SectionHeading
              title={seoContent.triggersTitle}
              body={seoContent.triggersIntro}
              align="center"
            />
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              {seoContent.triggerCards.map((card) => (
                <SeoContentCard key={card.title} card={card} />
              ))}
            </div>
          </section>

          <section className="bg-brand-ink p-7 text-surface">
            <div className="mb-5 max-w-3xl">
              <h2 className="font-display text-[1.8rem] font-semibold leading-tight">
                {seoContent.deliverablesTitle}
              </h2>
              <p className="mt-3 text-[0.94rem] leading-7 text-white/74">
                {seoContent.deliverablesIntro}
              </p>
            </div>
            <div>
              {seoContent.deliverables.map((item) => (
                <DeliverableRow key={`${item.rhythm}-${item.title}`} item={item} />
              ))}
            </div>
          </section>

          <QualificationQuestions
            serviceTitle={service.title}
            coverageCards={seoContent.coverageCards}
          />

          <section>
            <div className="mb-7 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
              <div>
                <h2 className="font-display text-[1.65rem] font-bold text-ink">
                  {seoContent.internalLinksTitle}
                </h2>
                <p className="mt-3 max-w-3xl text-[0.92rem] leading-7 text-ink-muted">
                  {seoContent.internalLinksIntro}
                </p>
              </div>
              <Link
                href="/expertises"
                className="inline-flex w-fit border border-brand-ink px-5 py-3 text-[0.8rem] font-semibold text-brand-ink transition-colors hover:border-accent-500 hover:text-accent-700"
              >
                Toutes les expertises
              </Link>
            </div>
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-5">
              {seoContent.internalLinks.map((link) => (
                <InternalLinkCard key={link.href} link={link} />
              ))}
            </div>
          </section>

          <section id="secteurs">
            <div className="mb-7 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
              <div>
                <h2 className="font-display text-[1.65rem] font-bold text-ink">
                  Secteurs accompagnes
                </h2>
                <p className="mt-3 max-w-3xl text-[0.92rem] leading-7 text-ink-muted">
                  Chaque secteur impose ses propres cycles, risques et rythmes
                  declaratifs. Les assets ci-dessous structurent la lecture et
                  rendent les cas metiers plus memorisables.
                </p>
              </div>
              <Link
                href={`/contact?expertise=${service.slug}&section=secteurs`}
                className="inline-flex w-fit border border-brand-ink px-5 py-3 text-[0.8rem] font-semibold text-brand-ink transition-colors hover:border-accent-500 hover:text-accent-700"
              >
                Parler de mon secteur
              </Link>
            </div>
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              {sectorCards.map((card) => (
                <Link
                  key={card.href}
                  href={card.href}
                  className="group border border-border-soft bg-surface transition-colors hover:border-accent-500"
                >
                  <AssetImage
                    src={card.asset.src}
                    alt={card.asset.alt}
                    kind={card.asset.kind}
                    className="aspect-[16/10] w-full object-cover"
                  />
                  <div className="p-5">
                    <h3 className="text-[0.95rem] font-semibold text-ink">
                      {card.label}
                    </h3>
                    <p className="mt-2 min-h-[3rem] text-[0.8rem] leading-6 text-ink-muted">
                      {card.description}
                    </p>
                    <span className="mt-3 inline-flex text-[0.78rem] font-semibold text-accent-700 group-hover:underline">
                      Voir le cas secteur -&gt;
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          <section>
            <div className="mb-7 max-w-3xl">
              <h2 className="font-display text-[1.65rem] font-bold text-ink">
                Professions accompagnees
              </h2>
              <p className="mt-3 text-[0.92rem] leading-7 text-ink-muted">
                Chaque profession affiche un asset dedie et renvoie vers une
                page de contexte pour transformer la navigation SEO en parcours
                de qualification.
              </p>
            </div>
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-5">
              {professionCards.map((card) => (
                <Link
                  key={card.href}
                  href={card.href}
                  className="group border border-border-soft bg-surface transition-colors hover:border-accent-500"
                >
                  <AssetImage
                    src={card.asset.src}
                    alt={card.asset.alt}
                    kind={card.asset.kind}
                    className="aspect-[4/3] w-full object-cover"
                  />
                  <div className="p-4">
                    {card.categoryLabel && (
                      <p className="mb-2 text-[0.68rem] font-bold uppercase text-accent-700">
                        {card.categoryLabel}
                      </p>
                    )}
                    <h3 className="text-[0.9rem] font-semibold text-ink">
                      {card.label}
                    </h3>
                    <p className="mt-2 text-[0.76rem] leading-5 text-ink-muted">
                      {card.description}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          <section className="grid gap-8 border border-border-soft bg-surface p-7 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1fr)] lg:items-center">
            <AssetImage
              src={buildVisualAsset("offer", `${service.slug}-plan-action`, "Plan d'action").src}
              alt="Illustration Plan d'action"
              kind="offer"
              className="aspect-[4/3] w-full object-cover"
            />
            <div>
              <h2 className="font-display text-[1.55rem] font-bold text-ink">
                Plan d'action en 4 temps
              </h2>
              <div className="mt-6 grid gap-4">
                {[
                  ["01", "Diagnostic", "Comprendre votre organisation, vos volumes et vos echeances."],
                  ["02", "Priorisation", "Identifier les urgences, risques et livrables a produire."],
                  ["03", "Mise en place", "Recuperer les pieces, cadrer les outils et lancer la mission."],
                  ["04", "Pilotage", "Installer un rythme de suivi utile pour le dirigeant."],
                ].map(([step, title, body]) => (
                  <div key={step} className="grid grid-cols-[3rem_1fr] gap-4">
                    <p className="font-display text-[1.2rem] font-semibold text-accent-700">
                      {step}
                    </p>
                    <div>
                      <h3 className="text-[0.95rem] font-semibold text-ink">
                        {title}
                      </h3>
                      <p className="mt-1 text-[0.82rem] leading-6 text-ink-muted">
                        {body}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <DirectoryFaq items={[...faqItems, ...seo.faqs]} />

          <section className="grid gap-6 bg-brand-ink p-7 text-surface lg:grid-cols-[minmax(0,1fr)_24rem] lg:items-center">
            <div>
              <h2 className="font-display text-[1.8rem] font-semibold leading-tight">
                Transformons votre {serviceName} en levier de pilotage.
              </h2>
              <p className="mt-3 max-w-2xl text-[0.94rem] leading-7 text-white/74">
                Expliquez-nous votre contexte, vos outils et vos echeances. La
                suite du parcours doit mener vers un diagnostic clair, pas vers
                une page de contenu de plus.
              </p>
            </div>
            <Link
              href={`/contact?expertise=${service.slug}&intent=lead`}
              className="inline-flex justify-center bg-accent-500 px-7 py-4 text-[0.88rem] font-semibold text-brand-ink transition-colors hover:bg-accent-700"
            >
              Obtenir mon diagnostic
            </Link>
          </section>
        </div>
      </article>
    </>
  );
}
