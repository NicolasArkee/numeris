import Link from "next/link";

export function ActivityStatBand({
  items,
}: {
  items: { value: string; label: string }[];
}) {
  return (
    <section className="border-b border-ink/10 bg-white" aria-label="Repères du catalogue">
      <div className="mx-auto grid max-w-[90rem] divide-y divide-ink/10 px-5 sm:px-8 md:grid-cols-3 md:divide-x md:divide-y-0 lg:px-14 xl:px-20">
        {items.map((item) => (
          <div key={item.label} className="flex items-baseline gap-3 py-6 md:px-7 first:md:pl-0 last:md:pr-0">
            <strong className="font-editorial text-[2.55rem] font-normal leading-none text-cobalt">
              {item.value}
            </strong>
            <span className="max-w-[14rem] text-[.72rem] font-semibold uppercase leading-5 tracking-[.12em] text-ink-muted">
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

export function ActivitySectionIntro({
  eyebrow,
  title,
  accent,
  body,
  inverse = false,
}: {
  eyebrow: string;
  title: string;
  accent?: string;
  body?: string;
  inverse?: boolean;
}) {
  return (
    <div className="mb-10 grid gap-5 lg:grid-cols-[1fr_.72fr] lg:items-end">
      <div>
        <p className={`sk-eyebrow mb-4 ${inverse ? "text-accent-500" : "text-cobalt"}`}>{eyebrow}</p>
        <h2 className="sk-section-title">
          {title}
          {accent && (
            <>
              {" "}
              {accent}
            </>
          )}
        </h2>
      </div>
      {body && (
        <p className={`text-[.98rem] leading-7 ${inverse ? "text-white/68" : "text-ink-muted"}`}>
          {body}
        </p>
      )}
    </div>
  );
}

export function ActivityFaq({
  eyebrow,
  title,
  items,
}: {
  eyebrow: string;
  title: string;
  items: { question: string; answer: string }[];
}) {
  return (
    <section className="bg-white px-5 py-16 sm:px-8 lg:px-14 lg:py-24 xl:px-20">
      <div className="mx-auto grid max-w-[80rem] gap-10 lg:grid-cols-[.7fr_1.3fr] lg:gap-20">
        <div className="lg:sticky lg:top-32 lg:self-start">
          <p className="sk-eyebrow mb-4 text-cobalt">{eyebrow}</p>
          <h2 className="sk-section-title">{title}</h2>
          <p className="mt-6 max-w-sm text-[.92rem] leading-7 text-ink-muted">
            Ces réponses servent à préparer votre recherche. Le périmètre réel se confirme avec les professionnels consultés.
          </p>
        </div>
        <div className="divide-y divide-ink/15 border-y border-ink/15">
          {items.map((item, index) => (
            <details key={item.question} className="group py-1" open={index === 0}>
              <summary className="flex min-h-16 list-none items-center justify-between gap-6 py-4 text-left text-[1rem] font-semibold marker:content-none lg:text-[1.08rem]">
                {item.question}
                <span aria-hidden className="text-2xl font-light text-cobalt transition-transform group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="max-w-[45rem] pb-6 pr-10 text-[.92rem] leading-7 text-ink-muted">{item.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

export function ActivityClosingCta({
  eyebrow,
  title,
  body,
  browseHref,
  browseLabel,
  profession,
  need,
}: {
  eyebrow: string;
  title: string;
  body: string;
  browseHref: string;
  browseLabel: string;
  profession?: string;
  need?: string;
}) {
  return (
    <section className="relative overflow-hidden bg-cobalt px-5 py-16 text-white sm:px-8 lg:px-14 lg:py-24 xl:px-20">
      <div aria-hidden className="absolute -left-24 -top-32 h-80 w-80 rounded-full border border-white/20" />
      <div aria-hidden className="absolute -bottom-48 -right-28 h-[28rem] w-[28rem] rounded-full border border-white/20" />
      <div className="relative mx-auto flex max-w-[80rem] flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="sk-eyebrow mb-5 text-white/72">{eyebrow}</p>
          <h2 className="max-w-[18ch] text-[clamp(2.35rem,5vw,4.5rem)] font-semibold leading-[1.02] tracking-[-.05em]">
            {title}
          </h2>
          <p className="mt-6 max-w-[42rem] text-[1rem] leading-7 text-white/75">{body}</p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-3">
          <button
            type="button"
            data-open-brief
            data-profession={profession}
            data-need={need}
            className="inline-flex min-h-12 items-center justify-center rounded-full bg-accent-500 px-6 py-3 text-[.86rem] font-bold text-navy transition-transform hover:-translate-y-0.5"
          >
            Préparer mon brief ↗
          </button>
          <Link
            href={browseHref}
            className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/35 px-6 py-3 text-[.86rem] font-bold text-white transition-colors hover:bg-white hover:text-cobalt"
          >
            {browseLabel}
          </Link>
        </div>
      </div>
    </section>
  );
}
