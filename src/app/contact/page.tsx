import Link from "next/link";
import type { Metadata } from "next";
import { AppConfig } from "@/utils/AppConfig";
import { BreadcrumbJsonLd, WebPageJsonLd } from "@/components/JsonLd";

const reassuranceItems = [
  "100% personnalisé",
  "Sans frais pour déposer la demande",
  "Réponse sous 24h ouvrées",
];

const segments = [
  {
    eyebrow: "Création ou reprise",
    title: "Vous lancez une activité",
    body:
      "Clarifiez le statut, le régime fiscal, le budget comptable et les pièces à préparer avant de contacter un professionnel.",
    bullets: ["Choix EI, EURL, SASU ou société", "Budget et livrables attendus", "Questions à poser au premier rendez-vous"],
    cta: "Préparer mon lancement",
  },
  {
    eyebrow: "TPE et indépendants",
    title: "Vous cherchez un suivi fiable",
    body:
      "Comparez les besoins réels : tenue, déclarations, paie, tableaux de bord, outils et niveau d'accompagnement attendu.",
    bullets: ["Périmètre de mission lisible", "Points d'attention métier", "Comparaison des offres sans jargon"],
    cta: "Comparer mon besoin",
  },
  {
    eyebrow: "Changement",
    title: "Votre organisation évolue",
    body:
      "Préparez une transition propre si votre situation change : croissance, paie, multi-sites, délais fiscaux ou besoin de pilotage.",
    bullets: ["Cartographie des urgences", "Documents à rassembler", "Critères pour éviter les mauvais arbitrages"],
    cta: "Qualifier ma situation",
  },
];

const painPoints = [
  {
    label: "Périmètre flou",
    title: "Les offres ne couvrent pas toujours la même chose",
    body:
      "Tenue comptable, bilan, déclarations, conseil, paie ou outils : une comparaison utile commence par un périmètre clair.",
  },
  {
    label: "Prix difficiles à lire",
    title: "Un tarif bas peut masquer des exclusions",
    body:
      "Le bon sujet n'est pas seulement le prix mensuel, mais les livrables inclus, les options et le temps de réponse attendu.",
  },
  {
    label: "Urgence mal qualifiée",
    title: "Toutes les demandes ne se traitent pas avec le même niveau de priorité",
    body:
      "Création, retard déclaratif, embauche, contrôle ou changement d'outil : l'urgence doit être formulée avant la prise de contact.",
  },
  {
    label: "Spécialisation",
    title: "Votre métier peut changer les questions à poser",
    body:
      "Restauration, immobilier, commerce, libéral ou BTP : les flux, la TVA, la paie et les indicateurs de gestion ne se ressemblent pas.",
  },
];

const methodSteps = [
  {
    number: "01",
    title: "Qualifier",
    body:
      "Nous transformons votre message en critères comparables : activité, volume, ville, urgence, missions et contraintes.",
  },
  {
    number: "02",
    title: "Prioriser",
    body:
      "Nous distinguons ce qui relève d'une urgence, d'un besoin de suivi régulier ou d'une simple préparation de rendez-vous.",
  },
  {
    number: "03",
    title: "Préparer",
    body:
      "Vous recevez un brief clair pour contacter les bons interlocuteurs avec les bonnes questions et les documents utiles.",
  },
];

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

export const metadata: Metadata = {
  title: `Brief d'orientation comptable | ${AppConfig.name}`,
  description: `Comparez votre besoin comptable avec ${AppConfig.name}, comparateur indépendant. Décrivez votre situation et recevez un brief d'orientation sous 24h ouvrées.`,
  alternates: { canonical: `${AppConfig.url}/contact` },
};

export default function ContactPage() {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Accueil", url: "/" },
          { name: "Contact", url: "/contact" },
        ]}
      />

      <WebPageJsonLd
        name="Brief d'orientation comptable"
        description="Décrivez votre besoin pour préparer une comparaison comptable, fiscale ou sociale."
        url="/contact"
      />

      <section className="bg-brand-ink px-6 py-16 text-surface lg:px-[4.5rem] lg:py-20">
        <div className="mx-auto grid max-w-[82rem] gap-10 lg:grid-cols-[minmax(0,1fr)_28rem] lg:items-center">
          <div>
            <nav aria-label="Fil d'Ariane" className="mb-8">
              <ol className="flex flex-wrap items-center gap-1.5 text-[0.72rem] text-white/65">
                <li>
                  <Link href="/" className="transition-colors hover:text-accent-500">
                    Accueil
                  </Link>
                </li>
                <li>/</li>
                <li className="text-white/90">Contact</li>
              </ol>
            </nav>

            <div className="mb-6 flex items-center gap-3.5">
              <span className="block h-px w-7 bg-accent-500" />
              <span className="text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-accent-500">
                Comparateur indépendant
              </span>
              <span className="block h-px w-7 bg-accent-500" />
            </div>

            <h1 className="max-w-4xl font-display text-[2.6rem] font-semibold leading-[1.04] tracking-tight text-surface lg:text-[4rem]">
              Comparez avant de choisir votre professionnel comptable.
            </h1>
            <p className="mt-6 max-w-2xl text-[1rem] leading-relaxed text-white/78 lg:text-[1.08rem]">
              Décrivez votre situation. Skoria vous aide à cadrer le besoin,
              les critères de comparaison et les questions utiles avant de
              contacter un professionnel.
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-4">
              <a
                href="#diagnostic"
                data-testid="contact-primary-cta"
                className="inline-flex justify-center bg-accent-500 px-8 py-4 text-[0.88rem] font-semibold text-brand-ink transition-colors hover:bg-accent-700"
              >
                Commencer le brief
              </a>
              <Link
                href="/expertises"
                className="inline-flex justify-center border border-white/25 px-7 py-4 text-[0.88rem] font-semibold text-white/75 transition-colors hover:border-accent-500 hover:text-accent-500"
              >
                Voir les expertises
              </Link>
            </div>

            <div className="mt-10 grid gap-3 sm:grid-cols-3">
              {reassuranceItems.map((item) => (
                <div key={item} className="border border-white/12 px-4 py-3">
                  <span className="text-[0.76rem] font-semibold text-white/86">{item}</span>
                </div>
              ))}
            </div>
          </div>

          <aside className="border border-white/12 bg-white/[0.04] p-7" aria-label="Aperçu du brief">
            <p className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-accent-500">
              Brief de comparaison
            </p>
            <h2 className="mt-3 font-display text-[1.55rem] font-semibold leading-tight text-surface">
              Ce que votre demande doit permettre de clarifier
            </h2>
            <div className="mt-7 space-y-5">
              {[
                ["Situation", "création, changement, urgence, correction ou besoin ponctuel"],
                ["Mission", "tenue, fiscalité, paie, gestion, audit ou accompagnement"],
                ["Contexte", "ville, activité, taille, délais, outils et documents disponibles"],
              ].map(([title, body]) => (
                <div key={title} className="border-t border-white/12 pt-4">
                  <p className="text-[0.9rem] font-semibold text-white">{title}</p>
                  <p className="mt-1 text-[0.82rem] leading-relaxed text-white/62">{body}</p>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </section>

      <section className="bg-surface px-6 py-18 lg:px-[4.5rem] lg:py-20">
        <div className="mx-auto max-w-[82rem]">
          <div className="max-w-3xl">
            <p className="mb-3 text-[0.68rem] font-bold uppercase tracking-[0.14em] text-accent-700">
              Trouver le bon angle
            </p>
            <h2 className="font-display text-[2rem] font-bold leading-tight text-ink lg:text-[2.65rem]">
              Un funnel par situation, pas un formulaire vague.
            </h2>
            <p className="mt-5 text-[0.96rem] leading-relaxed text-ink-muted">
              Plus votre demande est précise, plus la comparaison devient utile.
              Choisissez le cas qui se rapproche le plus de votre situation, puis
              complétez le brief en bas de page.
            </p>
          </div>

          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            {segments.map((segment) => (
              <article
                key={segment.title}
                className="flex min-h-[25rem] flex-col border border-border-soft bg-surface p-7 transition-colors hover:border-accent-500"
              >
                <p className="text-[0.66rem] font-bold uppercase tracking-[0.13em] text-accent-700">
                  {segment.eyebrow}
                </p>
                <h3 className="mt-4 font-display text-[1.45rem] font-semibold leading-tight text-ink">
                  {segment.title}
                </h3>
                <p className="mt-4 text-[0.88rem] leading-relaxed text-ink-muted">{segment.body}</p>
                <ul className="mt-6 space-y-3 text-[0.82rem] leading-relaxed text-ink-muted">
                  {segment.bullets.map((bullet) => (
                    <li key={bullet} className="flex gap-2">
                      <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 bg-accent-500" />
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
                <a
                  href="#diagnostic"
                  className="mt-auto inline-flex pt-7 text-[0.84rem] font-semibold text-accent-700 hover:underline"
                >
                  {segment.cta} -&gt;
                </a>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-bg px-6 py-18 lg:px-[4.5rem] lg:py-20">
        <div className="mx-auto grid max-w-[82rem] gap-12 lg:grid-cols-[24rem_1fr]">
          <div>
            <p className="mb-3 text-[0.68rem] font-bold uppercase tracking-[0.14em] text-accent-700">
              Pourquoi comparer
            </p>
            <h2 className="font-display text-[2rem] font-bold leading-tight text-ink lg:text-[2.6rem]">
              Choisir devient vite opaque.
            </h2>
            <p className="mt-5 text-[0.95rem] leading-relaxed text-ink-muted">
              Comme un courtier structure une comparaison de solutions, Skoria
              structure vos critères avant la mise en relation ou la recherche
              d'un interlocuteur adapté.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            {painPoints.map((point) => (
              <article key={point.title} className="border border-border-soft bg-surface p-6">
                <p className="text-[0.66rem] font-bold uppercase tracking-[0.13em] text-accent-700">
                  {point.label}
                </p>
                <h3 className="mt-3 text-[1rem] font-semibold leading-snug text-ink">
                  {point.title}
                </h3>
                <p className="mt-3 text-[0.85rem] leading-relaxed text-ink-muted">{point.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-surface px-6 py-18 lg:px-[4.5rem] lg:py-20">
        <div className="mx-auto max-w-[82rem]">
          <div className="grid gap-10 border-y border-border-soft py-12 lg:grid-cols-[minmax(0,1fr)_35rem] lg:items-start">
            <div>
              <p className="mb-3 text-[0.68rem] font-bold uppercase tracking-[0.14em] text-accent-700">
                Méthode Skoria
              </p>
              <h2 className="font-display text-[2rem] font-bold leading-tight text-ink lg:text-[2.55rem]">
                Transformer une demande floue en brief exploitable.
              </h2>
              <p className="mt-5 max-w-2xl text-[0.95rem] leading-relaxed text-ink-muted">
                L'objectif n'est pas de promettre une solution miracle, mais de
                vous éviter de comparer des offres incomparables ou de lancer un
                échange sans les bons éléments.
              </p>
            </div>

            <div className="space-y-5">
              {methodSteps.map((step) => (
                <article key={step.number} className="grid grid-cols-[3.5rem_1fr] gap-4 border border-border-soft p-5">
                  <span className="font-display text-[1.45rem] font-semibold italic text-accent-700">
                    {step.number}
                  </span>
                  <div>
                    <h3 className="text-[1rem] font-semibold text-ink">{step.title}</h3>
                    <p className="mt-2 text-[0.85rem] leading-relaxed text-ink-muted">{step.body}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="diagnostic" className="bg-brand-ink px-6 py-18 text-surface lg:px-[4.5rem] lg:py-20">
        <div className="mx-auto grid max-w-[82rem] gap-8 lg:grid-cols-[minmax(0,1fr)_28rem] lg:items-start">
          <div className="border border-white/12 bg-surface p-6 text-ink lg:p-9">
            <p className="mb-3 text-[0.68rem] font-bold uppercase tracking-[0.14em] text-accent-700">
              Brief en 2 minutes
            </p>
            <h2 className="font-display text-[2rem] font-bold leading-tight text-ink">
              Recevoir une orientation de comparaison
            </h2>
            <p className="mt-3 text-[0.9rem] leading-relaxed text-ink-muted">
              Remplissez les champs essentiels. Votre message doit permettre de
              comprendre le contexte, pas de remplacer un rendez-vous avec un
              professionnel habilité.
            </p>

            <form
              action={`mailto:${AppConfig.email}`}
              encType="text/plain"
              method="post"
              className="mt-8 space-y-5"
            >
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="name" className="mb-1.5 block text-[0.68rem] font-bold uppercase tracking-[0.08em] text-ink-muted">
                    Nom complet
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    placeholder="Votre nom"
                    required
                    className="h-11 w-full border border-border-soft bg-surface px-3.5 text-[0.85rem] text-ink placeholder:text-ink-soft focus:border-accent-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="mb-1.5 block text-[0.68rem] font-bold uppercase tracking-[0.08em] text-ink-muted">
                    Téléphone
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                    placeholder="06 XX XX XX XX"
                    required
                    className="h-11 w-full border border-border-soft bg-surface px-3.5 text-[0.85rem] text-ink placeholder:text-ink-soft focus:border-accent-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="email" className="mb-1.5 block text-[0.68rem] font-bold uppercase tracking-[0.08em] text-ink-muted">
                    Email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="email@entreprise.fr"
                    required
                    className="h-11 w-full border border-border-soft bg-surface px-3.5 text-[0.85rem] text-ink placeholder:text-ink-soft focus:border-accent-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label htmlFor="city" className="mb-1.5 block text-[0.68rem] font-bold uppercase tracking-[0.08em] text-ink-muted">
                    Ville
                  </label>
                  <input
                    id="city"
                    name="city"
                    type="text"
                    autoComplete="address-level2"
                    placeholder="Paris, Lyon, Nantes..."
                    className="h-11 w-full border border-border-soft bg-surface px-3.5 text-[0.85rem] text-ink placeholder:text-ink-soft focus:border-accent-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="situation" className="mb-1.5 block text-[0.68rem] font-bold uppercase tracking-[0.08em] text-ink-muted">
                    Situation
                  </label>
                  <select
                    id="situation"
                    name="situation"
                    className="h-11 w-full cursor-pointer border border-border-soft bg-surface px-3.5 text-[0.85rem] text-ink focus:border-accent-500 focus:outline-none"
                    defaultValue=""
                    required
                  >
                    <option value="" disabled>
                      Sélectionnez
                    </option>
                    <option>Création ou reprise</option>
                    <option>Changement de professionnel</option>
                    <option>Besoin ponctuel</option>
                    <option>Suivi récurrent</option>
                    <option>Correction annuaire</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="need" className="mb-1.5 block text-[0.68rem] font-bold uppercase tracking-[0.08em] text-ink-muted">
                    Mission principale
                  </label>
                  <select
                    id="need"
                    name="need"
                    className="h-11 w-full cursor-pointer border border-border-soft bg-surface px-3.5 text-[0.85rem] text-ink focus:border-accent-500 focus:outline-none"
                    defaultValue=""
                    required
                  >
                    <option value="" disabled>
                      Sélectionnez
                    </option>
                    {needs.map((need) => (
                      <option key={need}>{need}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="urgency" className="mb-1.5 block text-[0.68rem] font-bold uppercase tracking-[0.08em] text-ink-muted">
                    Urgence
                  </label>
                  <select
                    id="urgency"
                    name="urgency"
                    className="h-11 w-full cursor-pointer border border-border-soft bg-surface px-3.5 text-[0.85rem] text-ink focus:border-accent-500 focus:outline-none"
                    defaultValue=""
                    required
                  >
                    <option value="" disabled>
                      Sélectionnez
                    </option>
                    <option>Cette semaine</option>
                    <option>Ce mois-ci</option>
                    <option>Dans les 3 mois</option>
                    <option>Je prépare en amont</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="company-size" className="mb-1.5 block text-[0.68rem] font-bold uppercase tracking-[0.08em] text-ink-muted">
                    Taille
                  </label>
                  <select
                    id="company-size"
                    name="company-size"
                    className="h-11 w-full cursor-pointer border border-border-soft bg-surface px-3.5 text-[0.85rem] text-ink focus:border-accent-500 focus:outline-none"
                    defaultValue=""
                  >
                    <option value="" disabled>
                      Sélectionnez
                    </option>
                    <option>Solo ou indépendant</option>
                    <option>1 à 5 salariés</option>
                    <option>6 à 20 salariés</option>
                    <option>Plus de 20 salariés</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="message" className="mb-1.5 block text-[0.68rem] font-bold uppercase tracking-[0.08em] text-ink-muted">
                  Contexte
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={5}
                  placeholder="Activité, échéance, outil actuel, volume de factures, paie, question bloquante..."
                  className="w-full border border-border-soft bg-surface px-3.5 py-3 text-[0.85rem] text-ink placeholder:text-ink-soft focus:border-accent-500 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-accent-500 py-4 text-[0.88rem] font-semibold text-brand-ink transition-colors hover:bg-accent-700"
              >
                Envoyer ma demande
              </button>
              <p className="text-center text-[0.72rem] leading-relaxed text-ink-muted">
                Demande gratuite et sans engagement. Les informations transmises
                servent uniquement à qualifier votre besoin.
              </p>
            </form>
          </div>

          <aside className="space-y-5 lg:sticky lg:top-8">
            <div className="border border-white/12 bg-white/[0.04] p-6">
              <p className="text-[0.68rem] font-bold uppercase tracking-[0.14em] text-accent-500">
                Ce que vous recevez
              </p>
              <ul className="mt-5 space-y-4 text-[0.86rem] leading-relaxed text-white/75">
                {deliverables.map((item) => (
                  <li key={item} className="flex gap-3">
                    <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 bg-accent-500" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="border border-white/12 bg-white/[0.04] p-6">
              <p className="text-[0.68rem] font-bold uppercase tracking-[0.14em] text-accent-500">
                Cadre légal
              </p>
              <ul className="mt-5 space-y-4 text-[0.82rem] leading-relaxed text-white/65">
                {guardrails.map((item) => (
                  <li key={item} className="border-t border-white/10 pt-4 first:border-t-0 first:pt-0">
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="border border-white/12 bg-white/[0.04] p-6">
              <p className="text-[0.68rem] font-bold uppercase tracking-[0.14em] text-accent-500">
                Contact direct
              </p>
              <div className="mt-4 space-y-3 text-[0.85rem] leading-relaxed text-white/70">
                <p>{AppConfig.phone}</p>
                <p>{AppConfig.email}</p>
                <p>{AppConfig.address}</p>
                <p>Lundi - vendredi : 9h00 - 18h30</p>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
