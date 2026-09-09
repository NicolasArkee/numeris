import Link from "next/link";

export interface LegalDocumentSection {
  id: string;
  title: string;
  paragraphs: string[];
}

interface LegalDocumentPageProps {
  eyebrow: string;
  title: string;
  subtitle: string;
  breadcrumbLabel: string;
  currentPath: string;
  updatedAt: string;
  sections: LegalDocumentSection[];
}

const sectionSurfaces = [
  "bg-white",
  "bg-mint",
  "bg-lilac",
  "bg-white",
  "bg-apricot",
];

function sectionNumber(section: LegalDocumentSection, index: number) {
  const explicitNumber = section.title.match(/^(\d+)\.\s*/)?.[1];
  if (explicitNumber) return explicitNumber.padStart(2, "0");
  return index === 0 ? "00" : String(index + 1).padStart(2, "0");
}

function sectionTitle(title: string) {
  return title.replace(/^\d+\.\s*/, "");
}

export function LegalDocumentPage({
  eyebrow,
  title,
  subtitle,
  breadcrumbLabel,
  currentPath,
  updatedAt,
  sections,
}: LegalDocumentPageProps) {
  return (
    <div className="bg-paper">
      <section id="top" className="relative isolate overflow-hidden bg-navy px-5 py-14 text-white sm:px-8 lg:px-[4.5rem] lg:py-18">
        <div
          aria-hidden="true"
          className="absolute inset-y-0 right-0 -z-10 w-[58%] bg-blue [clip-path:polygon(28%_0,100%_0,100%_100%,0_100%)]"
        />
        <div
          aria-hidden="true"
          className="absolute -right-20 top-12 -z-10 h-64 w-64 rounded-full border border-white/15"
        />
        <div
          aria-hidden="true"
          className="absolute -right-4 top-28 -z-10 h-40 w-40 rounded-full border border-white/15"
        />

        <div className="mx-auto max-w-[82rem]">
          <nav aria-label="Fil d'Ariane">
            <ol className="flex flex-wrap items-center gap-2 text-[0.74rem] text-white/65">
              <li>
                <Link href="/" className="underline-offset-4 transition-colors hover:text-white hover:underline">
                  Accueil
                </Link>
              </li>
              <li aria-hidden="true">·</li>
              <li aria-current="page" className="text-white/90">
                {breadcrumbLabel}
              </li>
            </ol>
          </nav>

          <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-end">
            <div>
              <p className="mb-5 font-mono text-[0.68rem] font-bold uppercase tracking-[0.18em] text-[#ffb293]">
                {eyebrow}
              </p>
              <h1 className="max-w-[13ch] font-display text-[clamp(2.8rem,6vw,5.5rem)] font-semibold leading-[0.98] tracking-[-0.05em] text-white">
                {title}
              </h1>
              <p className="mt-7 max-w-[46rem] text-[1.02rem] leading-8 text-white/78 lg:text-[1.12rem]">
                {subtitle}
              </p>
            </div>

            <div className="rounded-[1.5rem] border border-white/18 bg-white/10 p-5 backdrop-blur-sm">
              <p className="font-mono text-[0.64rem] font-bold uppercase tracking-[0.16em] text-white/62">
                Document en vigueur
              </p>
              <p className="mt-3 text-[0.92rem] font-semibold leading-6 text-white">
                {updatedAt}
              </p>
              <div className="mt-5 flex items-center gap-3 border-t border-white/15 pt-4 text-[0.74rem] text-white/68">
                <span className="grid h-8 w-8 place-items-center rounded-full bg-orange font-mono font-bold text-navy">
                  {String(sections.length).padStart(2, "0")}
                </span>
                <span>sections à consulter</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 py-12 sm:px-8 lg:px-[4.5rem] lg:py-20">
        <div className="mx-auto grid max-w-[82rem] gap-8 lg:grid-cols-[18rem_minmax(0,1fr)] lg:gap-12">
          <aside className="lg:sticky lg:top-[calc(var(--site-header-height)+1.5rem)] lg:self-start">
            <nav
              aria-label={`Sommaire de ${breadcrumbLabel}`}
              className="rounded-[1.5rem] border border-border bg-white p-5 shadow-[0_18px_55px_rgba(7,29,60,0.06)] lg:p-6"
            >
              <p className="font-mono text-[0.65rem] font-bold uppercase tracking-[0.16em] text-blue">
                Sommaire
              </p>
              <h2 className="mt-3 font-display text-[1.35rem] font-bold leading-tight text-ink">
                Dans ce document
              </h2>
              <ol className="mt-6 grid gap-1.5 sm:grid-cols-2 lg:grid-cols-1">
                {sections.map((section, index) => (
                  <li key={section.id}>
                    <a
                      href={`#${section.id}`}
                      className="group flex items-start gap-3 rounded-xl px-3 py-2.5 text-[0.78rem] leading-5 text-ink-muted transition-colors hover:bg-lilac hover:text-ink"
                    >
                      <span className="mt-0.5 font-mono text-[0.62rem] font-bold text-blue">
                        {sectionNumber(section, index)}
                      </span>
                      <span className="font-semibold">{sectionTitle(section.title)}</span>
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          </aside>

          <div className="min-w-0 space-y-5">
            {sections.map((section, index) => (
              <article
                key={section.id}
                id={section.id}
                className={`scroll-mt-32 rounded-[1.75rem] border border-border/75 p-6 shadow-[0_18px_60px_rgba(7,29,60,0.045)] sm:p-8 lg:p-10 ${sectionSurfaces[index % sectionSurfaces.length]}`}
              >
                <div className="grid gap-6 md:grid-cols-[4.25rem_minmax(0,1fr)] md:gap-8">
                  <div
                    aria-hidden="true"
                    className="grid h-14 w-14 place-items-center rounded-2xl bg-navy font-mono text-[0.76rem] font-bold text-white"
                  >
                    {sectionNumber(section, index)}
                  </div>
                  <div>
                    <h2 className="max-w-[27ch] font-display text-[clamp(1.55rem,3vw,2.25rem)] font-bold leading-[1.08] tracking-[-0.035em] text-ink">
                      {sectionTitle(section.title)}
                    </h2>
                    <div className="mt-6 max-w-[48rem] space-y-4 text-[0.96rem] leading-7 text-ink-muted lg:text-[1rem] lg:leading-8">
                      {section.paragraphs.map((paragraph, paragraphIndex) => (
                        <p key={`${section.id}-${paragraphIndex}`}>{paragraph}</p>
                      ))}
                    </div>
                  </div>
                </div>
              </article>
            ))}

            <div className="rounded-[1.75rem] bg-blue px-6 py-7 text-white sm:px-8 lg:flex lg:items-center lg:justify-between lg:gap-8">
              <div>
                <p className="font-mono text-[0.64rem] font-bold uppercase tracking-[0.16em] text-white/65">
                  Mise à jour
                </p>
                <p className="mt-2 text-[0.9rem] font-semibold leading-6 text-white">
                  {updatedAt}
                </p>
              </div>
              <a
                href="#top"
                className="mt-5 inline-flex min-h-11 items-center justify-center rounded-full border border-white/30 px-5 text-[0.78rem] font-bold text-white transition-colors hover:bg-white hover:text-blue lg:mt-0"
              >
                Revenir en haut ↑
              </a>
            </div>

            <nav
              aria-label="Documents et contact Skoria"
              className="rounded-[1.75rem] bg-navy p-6 text-white sm:p-8"
            >
              <p className="font-mono text-[0.64rem] font-bold uppercase tracking-[0.16em] text-[#ffb293]">
                Continuer
              </p>
              <h2 className="mt-3 font-display text-[1.65rem] font-bold leading-tight text-white">
                Documents et contact
              </h2>
              <div className="mt-6 grid gap-2 sm:grid-cols-2">
                {[
                  ["Mentions légales", "/mentions-legales"],
                  ["Confidentialité", "/confidentialite"],
                  ["Conditions d'utilisation", "/cgu"],
                  ["Contacter Skoria", "/contact"],
                ].map(([label, href]) => (
                  <Link
                    key={href}
                    href={href}
                    aria-current={href === currentPath ? "page" : undefined}
                    className={`flex min-h-12 items-center justify-between gap-4 rounded-xl px-4 py-3 text-[0.78rem] font-bold transition-colors ${
                      href === currentPath
                        ? "bg-orange text-navy"
                        : "border border-white/15 text-white/75 hover:bg-white hover:text-navy"
                    }`}
                  >
                    <span>{label}</span>
                    <span aria-hidden>{href === currentPath ? "•" : "↗"}</span>
                  </Link>
                ))}
              </div>
            </nav>
          </div>
        </div>
      </section>
    </div>
  );
}
