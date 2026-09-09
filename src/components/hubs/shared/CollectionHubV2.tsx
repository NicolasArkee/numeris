import { PageHero } from "@/components/PageHero";
import { CollectionExplorer, type CollectionItem } from "./CollectionExplorer";

type Step = { number?: string; title: string; body: string };
type Stat = { value: string; label: string };
type Faq = { question: string; answer: string };
type DecisionCard = { eyebrow: string; title: string; body: string };

const VARIANTS = {
  editorial: { catalog: "bg-paper", method: "bg-lilac", accent: "blue" as const },
  commercial: { catalog: "bg-lilac", method: "bg-apricot", accent: "orange" as const },
  tools: { catalog: "bg-mint", method: "bg-paper", accent: "blue" as const },
  geo: { catalog: "bg-paper", method: "bg-mint", accent: "blue" as const },
} as const;

export function CollectionHubV2({
  eyebrow,
  title,
  titleAccent,
  intro,
  breadcrumbs,
  media,
  tone = "navy",
  stats,
  catalogEyebrow,
  catalogTitle,
  catalogCopy,
  items,
  groups,
  searchPlaceholder,
  emptyMessage,
  decisionEyebrow,
  decisionTitle,
  decisionIntro,
  decisionCards = [],
  steps,
  methodTitle = "Choisissez avec une méthode qui reste lisible.",
  methodCopy,
  seoTitle,
  seoParagraphs,
  faqs = [],
  ctaNeed,
  variant = "editorial",
  children,
}: {
  eyebrow: string;
  title: string;
  titleAccent?: string;
  intro: string;
  breadcrumbs: { name: string; url: string }[];
  media: { src: string; alt: string; position?: string; disclaimer?: string };
  tone?: "navy" | "blue" | "lilac" | "mint" | "apricot";
  stats?: Stat[];
  catalogEyebrow: string;
  catalogTitle: string;
  catalogCopy: string;
  items: CollectionItem[];
  groups?: string[];
  searchPlaceholder?: string;
  emptyMessage?: string;
  decisionEyebrow?: string;
  decisionTitle?: string;
  decisionIntro?: string;
  decisionCards?: DecisionCard[];
  steps: Step[];
  methodTitle?: string;
  methodCopy: string;
  seoTitle: string;
  seoParagraphs: string[];
  faqs?: Faq[];
  ctaNeed: string;
  variant?: keyof typeof VARIANTS;
  children?: React.ReactNode;
}) {
  const palette = VARIANTS[variant];

  return (
    <>
      {children}
      <PageHero
        eyebrow={eyebrow}
        title={title}
        titleAccent={titleAccent}
        subtitle={intro}
        breadcrumbs={breadcrumbs}
        media={media}
        tone={tone}
      >
        <button
          type="button"
          data-open-brief
          data-need={ctaNeed}
          className="mt-8 inline-flex min-h-12 w-fit items-center rounded-full bg-orange px-6 text-[.84rem] font-bold text-navy transition-transform hover:-translate-y-0.5"
        >
          Préparer mon parcours&nbsp; ↗
        </button>
      </PageHero>

      {stats && stats.length > 0 && (
        <section className="border-b border-ink/10 bg-white px-5 py-7 sm:px-8">
          <dl className="mx-auto grid max-w-7xl gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="border-l border-ink/16 pl-4 first:border-l-0 first:pl-0">
                <dd className="font-serif text-[2.15rem] leading-none text-blue">{stat.value}</dd>
                <dt className="mt-2 text-[.68rem] font-bold uppercase tracking-[.12em] text-ink-muted">{stat.label}</dt>
              </div>
            ))}
          </dl>
        </section>
      )}

      <section className={`${palette.catalog} px-5 py-16 sm:px-8 lg:py-24`}>
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 grid gap-8 lg:grid-cols-[.78fr_1.22fr] lg:items-end">
            <div>
              <p className="text-[.65rem] font-bold uppercase tracking-[.2em] text-blue">{catalogEyebrow}</p>
              <h2 className="mt-4 text-balance text-[clamp(2.4rem,5vw,4.2rem)] font-semibold leading-[1.02] tracking-[-.04em] text-ink">{catalogTitle}</h2>
            </div>
            <p className="max-w-2xl text-[1rem] leading-8 text-ink-muted">{catalogCopy}</p>
          </div>
          <CollectionExplorer
            items={items}
            groups={groups}
            searchPlaceholder={searchPlaceholder}
            emptyMessage={emptyMessage}
            accent={palette.accent}
          />
        </div>
      </section>

      {decisionCards.length > 0 && (
        <section className="bg-paper px-5 py-16 sm:px-8 lg:py-24">
          <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[.72fr_1.28fr] lg:gap-16">
            <div className="lg:sticky lg:top-28 lg:self-start">
              <p className="text-[.65rem] font-bold uppercase tracking-[.2em] text-blue">
                {decisionEyebrow ?? "Grille de décision"}
              </p>
              <h2 className="mt-4 text-balance text-[clamp(2.35rem,5vw,4rem)] font-semibold leading-[1.03] tracking-[-.04em] text-ink">
                {decisionTitle ?? "Comparez les mêmes éléments dans le même ordre."}
              </h2>
              {decisionIntro && (
                <p className="mt-6 max-w-xl text-[.96rem] leading-8 text-ink-muted">{decisionIntro}</p>
              )}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {decisionCards.map((card, index) => {
                const tones = ["bg-white", "bg-mint", "bg-lilac", "bg-apricot"];
                return (
                  <article
                    key={card.title}
                    className={`${tones[index % tones.length]} min-h-[15rem] rounded-[1.25rem] border border-ink/10 p-6 shadow-[0_18px_60px_rgba(16,34,59,.05)] sm:p-7`}
                  >
                    <p className="text-[.62rem] font-bold uppercase tracking-[.18em] text-blue">{card.eyebrow}</p>
                    <h3 className="mt-5 text-[1.25rem] font-semibold leading-tight text-ink">{card.title}</h3>
                    <p className="mt-4 text-[.86rem] leading-7 text-ink-muted">{card.body}</p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>
      )}

      <section className="bg-navy px-5 py-16 text-white sm:px-8 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 max-w-3xl">
            <p className="text-[.65rem] font-bold uppercase tracking-[.2em] text-[#ffb293]">Du repérage à la décision</p>
            <h2 className="mt-4 text-balance text-[clamp(2.4rem,5vw,4.15rem)] font-semibold leading-[1.02] tracking-[-.04em]">
              Un parcours qui donne une prochaine étape.
            </h2>
          </div>
          <div className="grid gap-px bg-white/18 md:grid-cols-3">
            {steps.map((step, index) => (
              <article key={step.title} className="bg-navy p-7 lg:min-h-[16rem]">
                <span className="font-serif text-[3.2rem] leading-none text-[#ffb293]">{step.number ?? String(index + 1).padStart(2, "0")}</span>
                <h3 className="mt-6 text-[1.3rem] font-semibold leading-tight">{step.title}</h3>
                <p className="mt-4 text-[.86rem] leading-7 text-white/65">{step.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className={`${palette.method} px-5 py-16 sm:px-8 lg:py-24`}>
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-2 lg:gap-20">
          <h2 className="text-balance text-[clamp(2.35rem,5vw,4rem)] font-semibold leading-[1.03] tracking-[-.04em] text-ink">
            {methodTitle}
          </h2>
          <div className="text-[1rem] leading-8 text-ink-muted">
            <p>{methodCopy}</p>
            <button type="button" data-open-brief data-need={ctaNeed} className="mt-7 inline-flex min-h-12 items-center rounded-full bg-blue px-6 text-[.84rem] font-bold text-white">
              Construire mon brief&nbsp; ↗
            </button>
          </div>
        </div>
      </section>

      <section className="bg-white px-5 py-16 sm:px-8 lg:py-24">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[.72fr_1.28fr] lg:gap-20">
          <div>
            <p className="text-[.65rem] font-bold uppercase tracking-[.2em] text-blue">Pour aller au-delà du catalogue</p>
            <h2 className="mt-4 text-balance text-[clamp(2.2rem,4vw,3.7rem)] font-semibold leading-[1.04] tracking-[-.04em] text-ink">{seoTitle}</h2>
          </div>
          <div className="space-y-5 text-[1rem] leading-8 text-ink-muted">
            {seoParagraphs.map((paragraph) => <p key={paragraph.slice(0, 48)}>{paragraph}</p>)}
          </div>
        </div>
      </section>

      {faqs.length > 0 && (
        <section className="bg-lilac px-5 py-16 sm:px-8 lg:py-20">
          <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[.65fr_1.35fr] lg:gap-20">
            <h2 className="text-[clamp(2.25rem,4vw,3.7rem)] font-semibold leading-tight text-ink">
              Questions fréquentes.
            </h2>
            <div className="border-t border-ink/18">
              {faqs.map((faq) => (
                <details key={faq.question} className="group border-b border-ink/18 py-1">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-5 text-[1rem] font-semibold text-ink">
                    {faq.question}<span aria-hidden className="text-xl transition-transform group-open:rotate-45">+</span>
                  </summary>
                  <p className="max-w-2xl pb-6 text-[.92rem] leading-7 text-ink-muted">{faq.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="bg-blue px-5 py-14 text-white sm:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-7 lg:flex-row lg:items-center lg:justify-between">
          <h2 className="max-w-3xl text-balance text-[clamp(2rem,4vw,3.3rem)] font-semibold leading-tight">
            Gardez vos critères, comparez les réponses, choisissez à votre rythme.
          </h2>
          <button type="button" data-open-brief data-need={ctaNeed} className="inline-flex min-h-12 shrink-0 items-center rounded-full bg-orange px-7 text-[.86rem] font-bold text-navy">
            Préparer mon brief&nbsp; ↗
          </button>
        </div>
      </section>
    </>
  );
}
