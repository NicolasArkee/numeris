import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AppConfig } from "@/utils/AppConfig";
import { ToolPageHero } from "@/components/simulateurs/ToolPageHero";
import { ToolEditorialContent } from "@/components/simulateurs/ToolEditorialContent";
import { FaqAccordion } from "@/components/editorial/FaqAccordion";
import { LastUpdated } from "@/components/LastUpdated";
import { getDbPageBundle } from "@/libs/content/dbFirst";
import { normalizeMetaDescription } from "@/libs/content/meta-title";
import { buildToolSchema, getToolSeo, serializeToolSchema } from "@/libs/simulateurs/seo";
import { getSimulateur, SIMULATEURS } from "../registry";

interface Props {
  params: Promise<{ outil: string }>;
}

type HeroTone = "navy" | "lilac" | "mint" | "apricot";

interface ToolPresentation {
  tone: HeroTone;
  media: {
    src: string;
    alt: string;
    position?: string;
    disclaimer: string;
  };
}

const SOCIAL_TOOLS = new Set([
  "cout-salarie",
  "jours-ouvres",
  "rupture-conventionnelle",
  "prime-fin-cdd",
  "grille-salaire-expert-comptable",
]);

const FINANCE_TOOLS = new Set([
  "calcul-tva",
  "calcul-impot-societes",
  "charges",
  "statuts",
  "tjm",
  "honoraires",
  "capital-social",
]);

function getToolPresentation(slug: string): ToolPresentation {
  if (slug === "immobilier") {
    return {
      tone: "apricot",
      media: {
        src: "/images/skoria-v2/editorial/lmnp-dossier.webp",
        alt: "Clés, plan et dossier de location meublée disposés sur une table",
        position: "50% 54%",
        disclaimer: "Illustration générée par IA.",
      },
    };
  }

  if (SOCIAL_TOOLS.has(slug)) {
    return {
      tone: "lilac",
      media: {
        src: "/images/skoria-v2/editorial/accounting-flow.webp",
        alt: "Documents organisés en étapes avec registre et calculatrice",
        position: "52% center",
        disclaimer: "Illustration générée par IA.",
      },
    };
  }

  if (FINANCE_TOOLS.has(slug)) {
    return {
      tone: "mint",
      media: {
        src: "/images/skoria-v2/editorial/fintech-tools.webp",
        alt: "Outils de gestion et documents disposés en composition éditoriale",
        position: "50% center",
        disclaimer: "Illustration générée par IA.",
      },
    };
  }

  return {
    tone: "navy",
    media: {
      src: "/images/skoria-v2/editorial/objects.webp",
      alt: "Documents et objets de calcul disposés sur une table",
      position: "50% center",
      disclaimer: "Illustration générée par IA.",
    },
  };
}

export const revalidate = 86400;

export function generateStaticParams() {
  return SIMULATEURS.map((s) => ({ outil: s.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { outil } = await params;
  const sim = getSimulateur(outil);
  if (!sim) return {};
  const { seo } = await getDbPageBundle("simulateurs", sim.slug);
  const content = getToolSeo(sim.slug);
  const title = seo?.meta_title || content.title;
  const description = normalizeMetaDescription(seo?.meta_description || content.description) || content.description;
  const url = `${AppConfig.url}/simulateurs/${sim.slug}`;
  const media = getToolPresentation(sim.slug).media;
  const images = [{ url: `${AppConfig.url}${media.src}`, alt: media.alt }];
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title: `${title} | ${AppConfig.name}`, description, url, type: "website", locale: "fr_FR", siteName: AppConfig.name, images },
    twitter: { card: "summary_large_image", title: `${title} | ${AppConfig.name}`, description, images },
  };
}

// One source for visible questions and the identified FAQ node in the tool graph.
const FAQ_TYPES = new Set(["Faq", "FAQSection_PAA"]);

export default async function SimulateurPage({ params }: Props) {
  const { outil } = await params;
  const sim = getSimulateur(outil);
  if (!sim) notFound();

  const bundle = await getDbPageBundle("simulateurs", sim.slug);
  const content = getToolSeo(sim.slug);
  const editoSections = bundle.renderableSections.filter((section) => !FAQ_TYPES.has(section.section_type));
  const editorialSummary = editoSections
    .map((section, index) => ({ id: `outil-section-${index}`, title: section.title }))
    .filter((section): section is { id: string; title: string } => Boolean(section.title));
  const others = content.relatedSlugs.map(getSimulateur).filter((item): item is NonNullable<typeof item> => Boolean(item));
  const presentation = getToolPresentation(sim.slug);
  const pageTitle = bundle.seo?.h1 || content.h1;
  const description = normalizeMetaDescription(bundle.seo?.meta_description || content.description) || content.description;
  const schema = buildToolSchema({ slug: sim.slug, name: sim.title, pageTitle, description, image: presentation.media.src, features: content.outputs, faqs: sim.faqs });
  const pageSummary = [
    { id: "outil", label: "Faire le calcul" },
    { id: "methode", label: "Lire la méthode" },
    ...(editoSections.length > 0 ? [{ id: "comprendre", label: "Comprendre le résultat" }] : []),
    { id: "faq", label: "Questions fréquentes" },
    { id: "autres-outils", label: "Autres outils" },
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeToolSchema(schema) }} />
      <ToolPageHero title={pageTitle} description={description} name={sim.title} image={presentation.media} />

      <nav
        aria-label="Sommaire de la page"
        className="sticky top-[var(--site-header-height)] z-30 border-b border-ink/10 bg-white/95 px-5 backdrop-blur sm:px-8"
      >
        <ol className="mx-auto flex max-w-[90rem] gap-7 overflow-x-auto py-4 text-[.75rem] font-semibold text-ink-muted">
          {pageSummary.map((item, index) => (
            <li key={item.id} className="shrink-0">
              <a href={`#${item.id}`} className="transition-colors hover:text-cobalt">
                {String(index + 1).padStart(2, "0")} · {item.label}
              </a>
            </li>
          ))}
        </ol>
      </nav>

      <section id="outil" aria-labelledby="tool-title" className="relative scroll-mt-36 overflow-hidden bg-mint px-5 py-8 sm:px-8 lg:px-14 lg:py-10 xl:px-20">
        <div aria-hidden className="absolute -right-32 top-16 h-80 w-80 rounded-full border border-cobalt/15" />
        <div className="relative mx-auto max-w-[90rem]">
          <div className="grid gap-4 lg:grid-cols-[1fr_.8fr] lg:items-end">
            <div>
              <h2 id="tool-title" className="text-[clamp(1.6rem,2.5vw,2.3rem)] font-bold leading-[1.1] tracking-[-.035em] text-ink">
                {content.toolHeading}
              </h2>
            </div>
            <div>
              <p className="text-[.82rem] leading-6 text-ink-muted">
                <strong className="font-semibold text-navy">À renseigner : </strong>{content.inputs.join(", ")}.
              </p>
            </div>
          </div>

          <div className="mt-6 min-w-0">
            {sim.render()}
          </div>

          <div className="mt-6 flex flex-col gap-4 border-t border-ink/15 pt-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="max-w-2xl text-[.82rem] leading-6 text-ink-muted">
              Conservez la période, les montants et les options utilisés si vous souhaitez comparer ce résultat à un autre scénario ou le faire vérifier.
            </p>
            {bundle.lastUpdatedDate && (
              <LastUpdated date={bundle.lastUpdatedDate} reviewLabel="Contenu éditorial revu à cette date" />
            )}
          </div>
        </div>
      </section>

      <section id="methode" className="scroll-mt-36 bg-navy px-5 py-16 text-white sm:px-8 lg:px-14 lg:py-24 xl:px-20">
        <div className="mx-auto max-w-[90rem]">
          <div className="grid gap-8 lg:grid-cols-[1fr_.7fr] lg:items-end">
            <div>
              <p className="sk-eyebrow mb-4 text-accent-300">Hypothèses et méthode</p>
              <h2 className="max-w-[18ch] text-[clamp(2.35rem,5vw,4.35rem)] font-semibold leading-[1.02] tracking-[-.05em]">
                Comment fonctionne cet outil ?
              </h2>
            </div>
            <p className="text-[1rem] leading-8 text-white/68">
              {content.methodIntro}
            </p>
          </div>

          <div className="mt-9 rounded-3xl border border-white/15 bg-white/[.05] p-6 sm:p-8">
            <h3 className="text-[1.15rem] font-bold">Ce que vous obtenez</h3>
            <ul className="mt-5 grid gap-4 sm:grid-cols-2">
              {content.outputs.map((feature) => <li key={feature} className="flex gap-3 text-[.88rem] leading-6 text-white/75"><span aria-hidden className="text-mint">✓</span>{feature}</li>)}
            </ul>
          </div>

          <div className="mt-12 grid gap-px overflow-hidden bg-white/15 md:grid-cols-3">
            {[
              ["01", "Vérifiez les entrées", "Montants, période, statut et options doivent décrire le même scénario. Une donnée approximative produit une estimation tout aussi approximative."],
              ["02", "Repérez la règle appliquée", "Lisez les taux, seuils, formules et exclusions affichés avec l’outil. Vérifiez la période à laquelle ils se rapportent avant d’utiliser le résultat."],
              ["03", "Identifiez ce qui manque", "Le résultat ne tranche pas les choix qui demandent votre dossier complet. Notez les points incertains pour les reprendre avec un professionnel."],
            ].map(([number, title, body]) => (
              <article key={number} className="min-h-[18rem] bg-navy p-7 lg:p-9">
                <span className="font-editorial text-[3.2rem] leading-none text-accent-500">{number}</span>
                <h3 className="mt-9 text-[1.3rem] font-semibold">{title}</h3>
                <p className="mt-4 text-[.88rem] leading-7 text-white/65">{body}</p>
              </article>
            ))}
          </div>

          <div className="mt-8 grid gap-6 rounded-[.75rem_2rem_2rem_.75rem] bg-white p-7 text-ink lg:grid-cols-[1fr_auto] lg:items-center lg:p-9">
            <div>
              <p className="sk-eyebrow text-cobalt">Avant une décision engageante</p>
              <p className="mt-3 max-w-3xl text-[.94rem] leading-7 text-ink-muted">
                Ajoutez au brief le résultat obtenu, les hypothèses retenues et les questions encore ouvertes. Vous pourrez demander une validation sur un contexte précis plutôt qu’un avis général.
              </p>
            </div>
            <button
              type="button"
              data-open-brief
              data-need={`Valider une simulation : ${sim.title}`}
              className="inline-flex min-h-12 items-center justify-center rounded-full bg-accent-500 px-6 text-[.84rem] font-bold text-navy transition-transform hover:-translate-y-0.5"
            >
              Ajouter au brief ↗
            </button>
          </div>
        </div>
      </section>

      {editoSections.length > 0 && (
        <section id="comprendre" className="scroll-mt-36 bg-paper px-5 py-16 sm:px-8 lg:px-14 lg:py-24 xl:px-20">
          <div className="mx-auto max-w-[90rem]">
            <div className="mb-12 grid gap-8 lg:grid-cols-[.75fr_1.25fr] lg:items-end">
              <div>
                <p className="sk-eyebrow mb-4 text-cobalt">Comprendre le résultat</p>
                <h2 className="sk-section-title">
                  {sim.title} : comprendre les résultats.
                </h2>
              </div>
              <p className="text-[1rem] leading-8 text-ink-muted">
                Retrouvez le contexte, les règles et les cas qui influencent cette estimation. Ces contenus complètent le calcul et restent à rapprocher de votre situation et de la période concernée.
              </p>
            </div>

            <div className={`grid gap-10 ${editorialSummary.length > 1 ? "lg:grid-cols-[16.5rem_1fr]" : ""}`}>
              {editorialSummary.length > 1 && (
                <nav aria-label="Sommaire du guide" className="hidden lg:block">
                  <div className="sticky top-[calc(var(--site-header-height)+4.5rem)] rounded-[1.5rem_1.5rem_.5rem_.5rem] bg-lilac p-6">
                    <p className="sk-eyebrow mb-5 text-cobalt">Dans ce guide</p>
                    <ol className="space-y-3 border-l border-ink/15 pl-4">
                      {editorialSummary.map((section, index) => (
                        <li key={section.id}>
                          <a
                            href={`#${section.id}`}
                            className="grid grid-cols-[1.7rem_1fr] gap-2 text-[.78rem] leading-5 text-ink-muted transition-colors hover:text-cobalt"
                          >
                            <span className="font-editorial text-[1.05rem] text-cobalt">{String(index + 1).padStart(2, "0")}</span>
                            {section.title}
                          </a>
                        </li>
                      ))}
                    </ol>
                  </div>
                </nav>
              )}

              <div className="min-w-0">
                {bundle.keyTakeaways && bundle.keyTakeaways.length > 0 && (
                  <aside className="mb-10 rounded-[.5rem_2rem_2rem_.5rem] bg-apricot p-7 lg:p-9">
                    <p className="sk-eyebrow mb-5 text-cobalt">L’essentiel</p>
                    <ul className="grid gap-4 md:grid-cols-2">
                      {bundle.keyTakeaways.map((takeaway) => (
                        <li key={takeaway} className="flex items-start gap-3 text-[.9rem] leading-7 text-ink-muted">
                          <span aria-hidden className="mt-[.65rem] h-1.5 w-1.5 shrink-0 rounded-full bg-accent-500" />
                          {takeaway}
                        </li>
                      ))}
                    </ul>
                  </aside>
                )}
                <ToolEditorialContent sections={editoSections} />
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="bg-white px-5 py-16 sm:px-8 lg:px-14 lg:py-24 xl:px-20">
        <div className="mx-auto grid max-w-[90rem] gap-10 lg:grid-cols-[.72fr_1.28fr] lg:gap-20">
          <div>
            <p className="sk-eyebrow mb-4 text-cobalt">De l’estimation à la décision</p>
            <h2 className="sk-section-title">Faites parler les écarts entre vos scénarios.</h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-3">
            {[
              ["Rejouer", "Modifiez une seule donnée à la fois pour voir ce qui influence réellement le résultat."],
              ["Documenter", "Notez la période, les options et les valeurs utilisées afin de pouvoir refaire le calcul."],
              ["Vérifier", "Transformez l’écart observé en question précise lorsque la décision dépend de votre dossier."],
            ].map(([title, body], index) => (
              <article key={title} className="border-t border-ink/15 pt-5">
                <span className="font-editorial text-[2rem] text-cobalt">0{index + 1}</span>
                <h3 className="mt-6 text-[1.08rem] font-semibold text-ink">{title}</h3>
                <p className="mt-3 text-[.84rem] leading-7 text-ink-muted">{body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="faq" className="scroll-mt-36 bg-lilac px-5 py-16 sm:px-8 lg:px-14 lg:py-24 xl:px-20">
        <div className="mx-auto grid max-w-[90rem] gap-10 lg:grid-cols-[.68fr_1.32fr] lg:gap-20">
          <div className="lg:sticky lg:top-32 lg:self-start">
            <p className="sk-eyebrow mb-4 text-cobalt">Questions fréquentes</p>
            <h2 className="sk-section-title">
              {sim.title} : vos questions.
            </h2>
            <p className="mt-6 max-w-md text-[.92rem] leading-7 text-ink-muted">
              Ces réponses complètent le simulateur. Les règles applicables peuvent dépendre de la date, de votre statut et d’éléments absents du formulaire.
            </p>
          </div>
          <FaqAccordion items={sim.faqs} />
        </div>
      </section>

      <section id="autres-outils" className="scroll-mt-36 bg-apricot px-5 py-16 sm:px-8 lg:px-14 lg:py-24 xl:px-20">
        <div className="mx-auto max-w-[90rem]">
          <div className="mb-10 grid gap-7 lg:grid-cols-[1fr_.7fr] lg:items-end">
            <div>
              <p className="sk-eyebrow mb-4 text-cobalt">Poursuivre l’exploration</p>
              <h2 className="max-w-[20ch] text-[clamp(2.35rem,5vw,4.2rem)] font-semibold leading-[1.03] tracking-[-.045em] text-ink">
                Des outils complémentaires pour aller plus loin.
              </h2>
            </div>
            <p className="text-[1rem] leading-8 text-ink-muted">
              Explorez une autre variable, puis conservez les hypothèses communes. Tous les outils restent accessibles librement et chaque page détaille ses limites.
            </p>
          </div>

          <div className={`grid gap-5 sm:grid-cols-2 ${others.length === 3 ? "lg:grid-cols-3" : "xl:grid-cols-4"}`}>
            {others.map((other, index) => (
              <Link
                key={other.slug}
                href={`/simulateurs/${other.slug}`}
                className="group flex min-h-[15rem] flex-col rounded-3xl bg-white p-6 transition-colors hover:bg-mint focus-visible:z-10 lg:p-7"
              >
                <div className="flex items-center justify-between">
                  <span aria-hidden className="text-[1.6rem]">{other.icon}</span>
                  <span className="font-editorial text-[1.2rem] text-cobalt">{String(index + 1).padStart(2, "0")}</span>
                </div>
                <h3 className="mt-7 text-[1.14rem] font-semibold leading-6 text-ink">{other.title}</h3>
                <p className="mt-3 text-[.8rem] leading-6 text-ink-muted">{getToolSeo(other.slug).description}</p>
                <span className="mt-auto pt-5 text-[.76rem] font-bold text-cobalt">
                  Ouvrir l’outil <span aria-hidden className="inline-block transition-transform group-hover:translate-x-1">↗</span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-cobalt px-5 py-16 text-white sm:px-8 lg:px-14 lg:py-24 xl:px-20">
        <div aria-hidden className="absolute -left-24 -top-32 h-80 w-80 rounded-full border border-white/20" />
        <div aria-hidden className="absolute -bottom-48 -right-28 h-[28rem] w-[28rem] rounded-full border border-white/20" />
        <div className="relative mx-auto flex max-w-[90rem] flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="sk-eyebrow mb-5 text-white/72">Votre prochaine étape</p>
            <h2 className="max-w-[18ch] text-[clamp(2.35rem,5vw,4.5rem)] font-semibold leading-[1.02] tracking-[-.05em]">
              Gardez le calcul. Préparez les questions qui comptent.
            </h2>
            <p className="mt-6 max-w-[44rem] text-[1rem] leading-7 text-white/75">
              Le brief vous aide à conserver le contexte, les hypothèses et les points à faire confirmer. Aucun choix de cabinet ni envoi automatique n’est déclenché.
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-3">
            <button
              type="button"
              data-open-brief
              data-need={`Valider une simulation : ${sim.title}`}
              className="inline-flex min-h-12 items-center justify-center rounded-full bg-accent-500 px-7 text-[.86rem] font-bold text-navy transition-transform hover:-translate-y-0.5"
            >
              Préparer mon brief ↗
            </button>
            <Link
              href="/simulateurs"
              className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/35 px-7 text-[.86rem] font-bold text-white transition-colors hover:bg-white hover:text-cobalt"
            >
              Voir tous les outils
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
