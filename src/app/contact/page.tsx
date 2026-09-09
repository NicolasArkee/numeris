import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { AppConfig } from "@/utils/AppConfig";
import { BreadcrumbJsonLd, WebPageJsonLd } from "@/components/JsonLd";

const reassuranceItems = ["Brief structuré", "Sans création de compte", "Aucun envoi automatique"];

const segments = [
  {
    eyebrow: "Création ou reprise",
    number: "01",
    title: "Vous lancez une activité",
    body: "Clarifiez le statut, le régime fiscal, le budget comptable et les pièces à préparer avant de contacter un professionnel.",
    bullets: ["Choix EI, EURL, SASU ou société", "Budget et livrables attendus", "Questions à poser au premier rendez-vous"],
    cta: "Préparer mon lancement",
    situation: "Création ou reprise",
    tone: "bg-apricot text-navy",
    layout: "lg:col-span-5",
  },
  {
    eyebrow: "TPE et indépendants",
    number: "02",
    title: "Vous cherchez un suivi fiable",
    body: "Comparez les besoins réels : tenue, déclarations, paie, tableaux de bord, outils et niveau d'accompagnement attendu.",
    bullets: ["Périmètre de mission lisible", "Points d'attention métier", "Comparaison des offres sans jargon"],
    cta: "Comparer mon besoin",
    situation: "Suivi récurrent",
    tone: "bg-navy text-white",
    layout: "lg:col-span-7",
  },
  {
    eyebrow: "Changement",
    number: "03",
    title: "Votre organisation évolue",
    body: "Préparez une transition propre si votre situation change : croissance, paie, multi-sites, délais fiscaux ou besoin de pilotage.",
    bullets: ["Cartographie des urgences", "Documents à rassembler", "Critères pour éviter les mauvais arbitrages"],
    cta: "Qualifier ma situation",
    situation: "Changement de professionnel",
    tone: "bg-blue text-white",
    layout: "lg:col-span-12",
  },
] as const;

const painPoints = [
  {
    label: "Périmètre flou",
    title: "Les offres ne couvrent pas toujours la même chose",
    body: "Tenue comptable, bilan, déclarations, conseil, paie ou outils : une comparaison utile commence par un périmètre clair.",
  },
  {
    label: "Prix difficiles à lire",
    title: "Un tarif bas peut masquer des exclusions",
    body: "Le bon sujet n'est pas seulement le prix mensuel, mais les livrables inclus, les options et le temps de réponse attendu.",
  },
  {
    label: "Urgence mal qualifiée",
    title: "Toutes les demandes n'ont pas le même calendrier",
    body: "Création, retard déclaratif, embauche, contrôle ou changement d'outil : l'urgence doit être formulée avant la prise de contact.",
  },
  {
    label: "Spécialisation",
    title: "Votre métier change les questions à poser",
    body: "Restauration, immobilier, commerce, libéral ou BTP : les flux, la TVA, la paie et les indicateurs de gestion ne se ressemblent pas.",
  },
] as const;

const methodSteps = [
  {
    number: "01",
    title: "Qualifier",
    body: "Le brief transforme votre contexte en critères comparables : activité, volume, ville, urgence, missions et contraintes.",
  },
  {
    number: "02",
    title: "Prioriser",
    body: "Le parcours distingue ce qui relève d'une urgence, d'un besoin de suivi régulier ou d'une préparation de rendez-vous.",
  },
  {
    number: "03",
    title: "Préparer",
    body: "Vous obtenez une base claire pour contacter les interlocuteurs de votre choix avec les mêmes questions et documents.",
  },
] as const;

const deliverables = [
  "Un brief de comparaison adapté à votre activité",
  "Les points de vigilance à vérifier avant signature",
  "Une liste de questions pour le premier échange",
  "Les pièces à préparer pour accélérer la qualification",
];

const guardrails = [
  "Skoria est un comparateur indépendant, pas un cabinet comptable.",
  "Nous ne produisons pas de conseil fiscal, social ou juridique individualisé.",
  "Nous n'inventons ni avis, ni notes, ni certification d'un professionnel.",
];

const needs = [
  "Comptabilité générale",
  "Conseil fiscal",
  "Gestion sociale et paie",
  "Création d'entreprise",
  "Conseil en gestion",
  "Audit contractuel",
  "Correction annuaire",
  "Autre",
];

const situations = [
  "Création ou reprise",
  "Changement de professionnel",
  "Besoin ponctuel",
  "Suivi récurrent",
  "Correction annuaire",
] as const;

const inputClass = "min-h-12 w-full rounded-xl border border-ink/15 bg-paper px-4 text-[0.86rem] text-ink transition-colors placeholder:text-ink-soft focus:border-blue focus:bg-white focus:outline-none";
const labelClass = "mb-2 block text-[0.66rem] font-bold uppercase tracking-[0.13em] text-ink-muted";

export const metadata: Metadata = {
  title: "Brief d'orientation comptable",
  description: `Comparez votre besoin comptable avec ${AppConfig.name}, comparateur indépendant. Décrivez votre situation et préparez un brief d'orientation clair.`,
  alternates: { canonical: `${AppConfig.url}/contact` },
};

export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<{ situation?: string | string[] }>;
}) {
  const requestedSituation = (await searchParams).situation;
  const selectedSituation =
    typeof requestedSituation === "string" &&
    situations.some((situation) => situation === requestedSituation)
      ? requestedSituation
      : "";

  return (
    <>
      <BreadcrumbJsonLd items={[{ name: "Accueil", url: "/" }, { name: "Contact", url: "/contact" }]} />
      <WebPageJsonLd name="Brief d'orientation comptable" description="Décrivez votre besoin pour préparer une comparaison comptable, fiscale ou sociale." url="/contact" />

      <section className="relative isolate overflow-hidden bg-lilac">
        <div
          aria-hidden
          className="absolute inset-0 -z-10 opacity-45"
          style={{
            backgroundImage: "linear-gradient(90deg,rgba(7,29,60,.08) 1px,transparent 1px),linear-gradient(rgba(7,29,60,.06) 1px,transparent 1px)",
            backgroundSize: "96px 96px",
            maskImage: "linear-gradient(90deg,black,transparent 72%)",
          }}
        />
        <div className="mx-auto grid max-w-[90rem] lg:min-h-[42rem] lg:grid-cols-[1.04fr_.96fr]">
          <div className="flex flex-col justify-center px-5 py-14 sm:px-8 lg:px-14 lg:py-20 xl:pl-20">
            <nav aria-label="Fil d'Ariane" className="mb-8">
              <ol className="flex items-center gap-2 text-[0.75rem] text-ink-muted">
                <li><Link href="/" className="underline-offset-4 hover:underline">Accueil</Link></li>
                <li aria-hidden>·</li>
                <li aria-current="page">Contact</li>
              </ol>
            </nav>

            <p className="mb-5 text-[0.68rem] font-bold uppercase tracking-[0.2em] text-blue">Construire une demande utile</p>
            <h1 className="max-w-[12ch] text-balance font-display text-[clamp(3.2rem,7vw,6.25rem)] font-semibold leading-[0.95] tracking-[-0.055em] text-navy">
              Un besoin clair change la comparaison.
            </h1>
            <p className="mt-7 max-w-[42rem] text-[1.05rem] leading-8 text-ink-muted lg:text-[1.16rem]">
              Décrivez votre situation. Skoria organise les critères, les questions et les pièces utiles avant votre premier échange avec un professionnel comptable.
            </p>

            <div className="mt-9 flex flex-wrap gap-3">
              <a href="#diagnostic" data-testid="contact-primary-cta" className="inline-flex min-h-12 items-center justify-center rounded-full bg-orange px-6 py-3 text-[0.88rem] font-bold text-navy transition-transform hover:-translate-y-0.5">
                Construire mon brief&nbsp; ↗
              </a>
              <Link href="/annuaire/experts-comptables" className="inline-flex min-h-12 items-center justify-center rounded-full border border-ink/25 px-6 py-3 text-[0.88rem] font-bold text-ink transition-colors hover:bg-navy hover:text-white">
                Explorer l'annuaire
              </Link>
            </div>

            <div className="mt-10 flex flex-wrap gap-2">
              {reassuranceItems.map((item) => (
                <span key={item} className="rounded-full border border-ink/15 bg-white/50 px-4 py-2 text-[0.72rem] font-semibold text-ink">{item}</span>
              ))}
            </div>
          </div>

          <figure className="relative min-h-[28rem] overflow-hidden lg:m-5 lg:min-h-0 lg:rounded-[1rem_8rem_1rem_1rem]">
            <Image src="/images/skoria-v2/editorial/workspace.webp" alt="Bureau avec ordinateur et documents de travail" fill priority sizes="(max-width: 1024px) 100vw, 48vw" className="object-cover" style={{ objectPosition: "56% 50%" }} />
            <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-navy/70 via-transparent to-transparent" />
            <figcaption className="absolute inset-x-5 bottom-5 rounded-[1.25rem] bg-navy/90 p-5 text-white shadow-2xl backdrop-blur-sm sm:inset-x-auto sm:right-5 sm:max-w-[22rem]">
              <p className="text-[0.64rem] font-bold uppercase tracking-[0.16em] text-accent-300">Le fil du brief</p>
              <div className="mt-4 grid grid-cols-3 gap-2 text-center text-[0.72rem] font-semibold">
                {[["01", "Situation"], ["02", "Mission"], ["03", "Contexte"]].map(([number, label]) => (
                  <div key={number} className="rounded-xl border border-white/15 bg-white/5 px-2 py-3">
                    <span className="block font-mono text-[0.58rem] text-accent-300">{number}</span>
                    <span className="mt-1 block">{label}</span>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-[0.65rem] text-white/58">Illustration générée par IA.</p>
            </figcaption>
          </figure>
        </div>
      </section>

      <nav aria-label="Étapes de la page contact" className="sticky top-[var(--site-header-height)] z-20 border-b border-ink/10 bg-white/95 px-5 backdrop-blur sm:px-8">
        <div className="mx-auto flex max-w-[80rem] gap-7 overflow-x-auto py-4 text-[0.75rem] font-semibold text-ink-muted">
          <a href="#situations" className="whitespace-nowrap hover:text-blue">01 · Choisir ma situation</a>
          <a href="#methode" className="whitespace-nowrap hover:text-blue">02 · Comprendre la méthode</a>
          <a href="#diagnostic" className="whitespace-nowrap hover:text-blue">03 · Construire le brief</a>
        </div>
      </nav>

      <section id="situations" className="bg-paper px-5 py-16 sm:px-8 lg:px-14 lg:py-24 xl:px-20">
        <div className="mx-auto max-w-[80rem]">
          <div className="grid gap-7 lg:grid-cols-[1fr_.6fr] lg:items-end">
            <div>
              <p className="mb-4 text-[0.68rem] font-bold uppercase tracking-[0.2em] text-blue">Choisir un point de départ</p>
              <h2 className="max-w-[18ch] text-balance text-[clamp(2.3rem,5vw,4.3rem)] font-semibold leading-[1.02] tracking-[-0.045em] text-navy">
                Votre contexte guide les premières questions.
              </h2>
            </div>
            <p className="max-w-xl text-[0.95rem] leading-7 text-ink-muted lg:justify-self-end">
              Sélectionnez le cas le plus proche de votre situation. Vous pourrez préciser les écarts dans le brief et conserver un même cadre pour chaque échange.
            </p>
          </div>

          <div className="mt-11 grid gap-4 lg:grid-cols-12">
            {segments.map((segment) => (
              <article key={segment.number} className={`group flex min-h-[25rem] flex-col overflow-hidden rounded-[1.5rem] p-7 sm:p-8 ${segment.tone} ${segment.layout}`}>
                <div className="flex items-start justify-between gap-5">
                  <p className={`text-[0.65rem] font-bold uppercase tracking-[0.16em] ${segment.number === "01" ? "text-blue" : "text-current/65"}`}>{segment.eyebrow}</p>
                  <span className="font-mono text-[0.68rem] font-bold opacity-50">{segment.number}</span>
                </div>
                <h3 className="mt-8 max-w-[19ch] text-[clamp(1.8rem,3.3vw,3rem)] font-semibold leading-[1.02] tracking-[-0.04em]">{segment.title}</h3>
                <p className="mt-5 max-w-2xl text-[0.88rem] leading-7 opacity-72">{segment.body}</p>
                <ul className="mt-7 grid gap-3 text-[0.78rem] leading-6 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
                  {segment.bullets.map((bullet) => <li key={bullet} className="rounded-xl border border-current/15 px-4 py-3">{bullet}</li>)}
                </ul>
                <Link href={`/contact?situation=${encodeURIComponent(segment.situation)}#diagnostic`} className="mt-auto inline-flex items-center gap-2 pt-8 text-[0.8rem] font-bold">
                  {segment.cta}<span aria-hidden className="transition-transform group-hover:translate-x-1">↗</span>
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-apricot px-5 py-16 sm:px-8 lg:px-14 lg:py-24 xl:px-20">
        <div className="mx-auto grid max-w-[80rem] gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
          <div className="lg:sticky lg:top-[calc(var(--site-header-height)+5rem)] lg:self-start">
            <p className="mb-4 text-[0.68rem] font-bold uppercase tracking-[0.2em] text-blue">Les écarts à rendre visibles</p>
            <h2 className="max-w-[15ch] text-balance text-[clamp(2.2rem,4.4vw,3.7rem)] font-semibold leading-[1.04] tracking-[-0.045em] text-navy">
              Une offre simple à lire peut rester difficile à comparer.
            </h2>
            <p className="mt-6 max-w-lg text-[0.94rem] leading-7 text-ink-muted">
              Le brief fait apparaître ce qui se cache derrière un intitulé, un prix ou une urgence. Vous pouvez alors poser la même question à plusieurs interlocuteurs.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {painPoints.map((point, index) => (
              <article key={point.label} className={`min-h-[18rem] rounded-[1.4rem] p-7 ${index === 0 || index === 3 ? "bg-navy text-white" : "bg-white text-navy"}`}>
                <div className="flex items-center justify-between gap-4">
                  <p className={`text-[0.64rem] font-bold uppercase tracking-[0.15em] ${index === 0 || index === 3 ? "text-accent-300" : "text-blue"}`}>{point.label}</p>
                  <span className="font-mono text-[0.62rem] opacity-45">0{index + 1}</span>
                </div>
                <h3 className="mt-8 text-[1.35rem] font-semibold leading-tight">{point.title}</h3>
                <p className="mt-4 text-[0.84rem] leading-7 opacity-68">{point.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="methode" className="bg-navy px-5 py-16 text-white sm:px-8 lg:px-14 lg:py-24 xl:px-20">
        <div className="mx-auto grid max-w-[80rem] gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:items-start lg:gap-20">
          <div>
            <p className="mb-4 text-[0.68rem] font-bold uppercase tracking-[0.2em] text-accent-300">Méthode Skoria</p>
            <h2 className="max-w-[14ch] text-balance text-[clamp(2.4rem,5vw,4.4rem)] font-semibold leading-[1.01] tracking-[-0.05em]">
              Trois mouvements pour rendre la demande exploitable.
            </h2>
            <p className="mt-7 max-w-xl text-[0.95rem] leading-8 text-white/66">
              La méthode ne décide pas à votre place. Elle organise l'information pour éviter de comparer des périmètres différents ou de lancer un échange sans les éléments essentiels.
            </p>
          </div>

          <ol className="overflow-hidden rounded-[1.6rem] border border-white/15">
            {methodSteps.map((step) => (
              <li key={step.number} className="grid gap-5 border-b border-white/15 p-6 last:border-b-0 sm:grid-cols-[5rem_1fr] sm:p-8">
                <span className="font-mono text-[0.72rem] font-bold text-accent-300">{step.number}</span>
                <div>
                  <h3 className="text-[1.55rem] font-semibold text-white">{step.title}</h3>
                  <p className="mt-3 text-[0.88rem] leading-7 text-white/64">{step.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section id="diagnostic" className="bg-mint px-5 py-16 sm:px-8 lg:px-14 lg:py-24 xl:px-20">
        <div className="mx-auto max-w-[80rem] overflow-hidden rounded-[2rem] bg-blue p-3 sm:p-5 lg:p-7">
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_24rem]">
            <div className="rounded-[1.3rem] bg-white p-6 text-ink sm:p-8 lg:p-10">
              <p className="mb-4 text-[0.68rem] font-bold uppercase tracking-[0.18em] text-blue">Votre brief de comparaison</p>
              <h2 className="max-w-[17ch] text-balance text-[clamp(2.2rem,4.6vw,3.8rem)] font-semibold leading-[1.03] tracking-[-0.045em] text-navy">
                Décrivez le contexte une seule fois.
              </h2>
              <p className="mt-5 max-w-2xl text-[0.92rem] leading-7 text-ink-muted">
                Les champs essentiels donnent une base commune à vos échanges. Le message prépare la discussion et ne remplace pas l'analyse d'un professionnel habilité.
              </p>

              <form action={`mailto:${AppConfig.email}`} encType="text/plain" method="post" className="mt-10 space-y-6">
                <div className="grid gap-5 sm:grid-cols-2">
                  <div><label htmlFor="name" className={labelClass}>Nom complet</label><input id="name" name="name" type="text" autoComplete="name" placeholder="Votre nom" required className={inputClass} /></div>
                  <div><label htmlFor="phone" className={labelClass}>Téléphone</label><input id="phone" name="phone" type="tel" autoComplete="tel" placeholder="06 XX XX XX XX" required className={inputClass} /></div>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div><label htmlFor="email" className={labelClass}>Email</label><input id="email" name="email" type="email" autoComplete="email" placeholder="email@entreprise.fr" required className={inputClass} /></div>
                  <div><label htmlFor="city" className={labelClass}>Ville</label><input id="city" name="city" type="text" autoComplete="address-level2" placeholder="Paris, Lyon, Nantes..." className={inputClass} /></div>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label htmlFor="situation" className={labelClass}>Situation</label>
                    <select key={selectedSituation || "none"} id="situation" name="situation" className={inputClass} defaultValue={selectedSituation} required>
                      <option value="" disabled>Sélectionnez</option>
                      {situations.map((situation) => <option key={situation}>{situation}</option>)}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="need" className={labelClass}>Mission principale</label>
                    <select id="need" name="need" className={inputClass} defaultValue="" required>
                      <option value="" disabled>Sélectionnez</option>
                      {needs.map((need) => <option key={need}>{need}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label htmlFor="urgency" className={labelClass}>Urgence</label>
                    <select id="urgency" name="urgency" className={inputClass} defaultValue="" required>
                      <option value="" disabled>Sélectionnez</option><option>Cette semaine</option><option>Ce mois-ci</option><option>Dans les 3 mois</option><option>Je prépare en amont</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="company-size" className={labelClass}>Taille</label>
                    <select id="company-size" name="company-size" className={inputClass} defaultValue="">
                      <option value="" disabled>Sélectionnez</option><option>Solo ou indépendant</option><option>1 à 5 salariés</option><option>6 à 20 salariés</option><option>Plus de 20 salariés</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="message" className={labelClass}>Contexte</label>
                  <textarea id="message" name="message" rows={6} placeholder="Activité, échéance, outil actuel, volume de factures, paie, question bloquante..." className={`${inputClass} py-4`} />
                </div>

                <button type="submit" className="inline-flex min-h-13 w-full items-center justify-center rounded-full bg-orange px-7 py-4 text-[0.88rem] font-bold text-navy transition-transform hover:-translate-y-0.5 sm:w-auto">
                  Préparer mon e-mail&nbsp; ↗
                </button>
                <p className="max-w-xl text-[0.72rem] leading-6 text-ink-muted">
                  Le bouton ouvre votre logiciel de messagerie avec les informations saisies. Aucun message n'est envoyé automatiquement.
                </p>
              </form>
            </div>

            <aside className="flex flex-col gap-4 text-white lg:sticky lg:top-[calc(var(--site-header-height)+2rem)] lg:self-start">
              <section className="rounded-[1.3rem] bg-navy p-6">
                <p className="text-[0.65rem] font-bold uppercase tracking-[0.16em] text-accent-300">Le résultat</p>
                <h3 className="mt-4 text-[1.35rem] font-semibold">Une base commune pour vos échanges</h3>
                <ul className="mt-6 space-y-4 text-[0.82rem] leading-6 text-white/72">
                  {deliverables.map((item, index) => (
                    <li key={item} className="grid grid-cols-[2rem_1fr] gap-2 border-t border-white/12 pt-4 first:border-t-0 first:pt-0">
                      <span className="font-mono text-[0.58rem] text-accent-300">0{index + 1}</span><span>{item}</span>
                    </li>
                  ))}
                </ul>
              </section>

              <section className="rounded-[1.3rem] bg-lilac p-6 text-navy">
                <p className="text-[0.65rem] font-bold uppercase tracking-[0.16em] text-blue">Cadre d'utilisation</p>
                <ul className="mt-5 space-y-4 text-[0.78rem] leading-6 text-ink-muted">
                  {guardrails.map((item) => <li key={item} className="border-t border-ink/12 pt-4 first:border-t-0 first:pt-0">{item}</li>)}
                </ul>
              </section>

              <section className="rounded-[1.3rem] bg-apricot p-6 text-navy">
                <p className="text-[0.65rem] font-bold uppercase tracking-[0.16em] text-blue">Contact direct</p>
                <a href={`mailto:${AppConfig.email}`} className="mt-4 block break-all text-[0.9rem] font-bold underline decoration-blue/35 underline-offset-4 hover:decoration-blue">{AppConfig.email}</a>
                <p className="mt-3 text-[0.78rem] leading-6 text-ink-muted">{AppConfig.address}</p>
                <p className="mt-4 border-t border-ink/12 pt-4 text-[0.75rem] leading-6 text-ink-muted">
                  Pour une correction d'annuaire, indiquez l'URL de la fiche et l'information concernée.
                </p>
              </section>
            </aside>
          </div>
        </div>
      </section>
    </>
  );
}
