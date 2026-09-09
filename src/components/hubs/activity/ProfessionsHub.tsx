import Image from "next/image";
import Link from "next/link";
import { PageHero } from "@/components/PageHero";
import { ActivityClosingCta, ActivityFaq, ActivitySectionIntro, ActivityStatBand } from "./ActivityHubShared";
import { ProfessionsExplorer } from "./ProfessionsExplorer";
import type { ProfessionHubCategory } from "./types";

const PROFESSION_FAQ = [
  {
    question: "Pourquoi chercher un expert-comptable à partir de mon métier ?",
    answer: "Votre métier donne un premier vocabulaire commun : types d’encaissements, dépenses fréquentes, saisonnalité, organisation de l’équipe ou obligations récurrentes. Il aide à préparer des questions concrètes. Il ne suffit toutefois pas à choisir un cabinet : le mode d’exercice, la taille de l’activité, les outils et les missions souhaitées doivent aussi être précisés.",
  },
  {
    question: "Une page profession garantit-elle qu’un cabinet accompagne ce métier ?",
    answer: "Non. Les pages profession de Skoria expliquent les sujets à vérifier et facilitent la préparation d’un échange. Elles ne certifient ni l’expérience sectorielle ni la disponibilité d’un cabinet. Demandez à chaque interlocuteur quels dossiers comparables il traite et comment cette expérience se traduit dans l’organisation, les livrables et le suivi proposés.",
  },
  {
    question: "Que faut-il préparer avant un premier rendez-vous ?",
    answer: "Décrivez votre structure, votre mode d’exercice, vos principaux flux et les outils déjà utilisés. Ajoutez les échéances proches, les travaux actuellement réalisés en interne et ce qui vous pose problème. Quelques exemples représentatifs valent mieux qu’une liste abstraite : un export de caisse, un circuit de factures ou le calendrier de paie permettent de discuter d’un fonctionnement réel.",
  },
  {
    question: "Comment comparer deux propositions pour la même profession ?",
    answer: "Demandez un périmètre comparable. Vérifiez les tâches incluses, les informations à fournir, les contrôles réalisés, les livrables, le calendrier, les interlocuteurs et les conditions de sortie. Un tarif seul reste difficile à interpréter lorsque l’une des propositions inclut des rendez-vous, une reprise de dossier ou des travaux ponctuels que l’autre traite séparément.",
  },
  {
    question: "Puis-je chercher par secteur si je ne trouve pas mon métier ?",
    answer: "Oui. Un secteur peut être plus utile lorsque plusieurs professions partagent les mêmes opérations : caisse et stocks dans la restauration, chantiers et sous-traitance dans le bâtiment, abonnements et international dans certaines activités numériques. Vous pouvez aussi partir directement d’une expertise si votre priorité est déjà claire.",
  },
  {
    question: "Skoria transmet-il automatiquement mon brief à des cabinets ?",
    answer: "Non. Le brief sert d’abord à organiser vos critères et peut être téléchargé. Vous gardez la maîtrise des cabinets consultés et des informations que vous leur communiquez. Évitez d’y placer des données sensibles inutiles ; complétez les éléments confidentiels directement avec le professionnel retenu dans un cadre adapté.",
  },
];

export function ProfessionsHub({ categories }: { categories: ProfessionHubCategory[] }) {
  const professionCount = categories.reduce((count, category) => count + category.professions.length, 0);

  return (
    <>
      <PageHero
        eyebrow="Expert-comptable par métier"
        title="Votre activité donne le contexte."
        titleAccent="Vos critères font le choix."
        subtitle="Explorez les besoins comptables par profession, puis ajoutez votre situation, les missions attendues et votre ville. Vous obtenez une base claire pour comparer des cabinets sans réduire votre recherche à une étiquette métier."
        breadcrumbs={[{ name: "Accueil", url: "/" }, { name: "Professions", url: "/professions" }]}
        badges={[`${professionCount} professions`, `${categories.length} familles`, "Parcours relié aux expertises"]}
        cta={{ label: "Trouver mon métier", href: "#professions-catalogue" }}
        ctaSecondary={{ label: "Partir d’une expertise", href: "/expertises" }}
        tone="apricot"
        media={{
          src: "/images/skoria-v2/editorial/atelier.webp",
          alt: "Architecte travaillant sur une maquette dans son atelier",
          position: "62% center",
          disclaimer: "Illustration générée par IA — personne fictive.",
        }}
      >
        <button
          type="button"
          data-open-brief
          className="mt-4 w-fit rounded-full border border-ink/25 px-5 py-3 text-[.8rem] font-bold text-ink transition-colors hover:bg-ink hover:text-white"
        >
          Je préfère décrire mon besoin ↗
        </button>
      </PageHero>

      <ActivityStatBand
        items={[
          { value: String(professionCount), label: "professions conservées depuis le catalogue" },
          { value: String(categories.length), label: "familles pour orienter la recherche" },
          { value: "3", label: "dimensions à croiser : métier, mission, situation" },
        ]}
      />

      <nav aria-label="Étapes du parcours professions" className="sticky top-[var(--site-header-height)] z-20 border-b border-ink/10 bg-white/95 px-5 backdrop-blur sm:px-8">
        <div className="mx-auto flex max-w-[80rem] gap-7 overflow-x-auto py-4 text-[.75rem] font-semibold text-ink-muted">
          <a className="whitespace-nowrap hover:text-cobalt" href="#professions-catalogue">01 · Explorer</a>
          <a className="whitespace-nowrap hover:text-cobalt" href="#situation-profession">02 · Situer</a>
          <a className="whitespace-nowrap hover:text-cobalt" href="#criteres-profession">03 · Comparer</a>
          <a className="whitespace-nowrap hover:text-cobalt" href="#questions-profession">04 · Préparer</a>
        </div>
      </nav>

      <ProfessionsExplorer categories={categories} />

      <section id="situation-profession" className="bg-mint px-5 py-16 sm:px-8 lg:px-14 lg:py-24 xl:px-20">
        <div className="mx-auto grid max-w-[80rem] gap-12 lg:grid-cols-[.9fr_1.1fr] lg:items-center lg:gap-20">
          <figure className="relative min-h-[28rem] overflow-hidden rounded-[10rem_10rem_1rem_1rem] bg-white lg:min-h-[40rem]">
            <Image
              src="/images/skoria-v2/editorial/doctor.webp"
              alt="Médecin préparant ses documents dans son cabinet"
              fill
              sizes="(max-width: 1024px) 100vw, 42vw"
              className="object-cover"
              style={{ objectPosition: "50% 42%" }}
            />
            <figcaption className="absolute inset-x-5 bottom-5 rounded-full bg-navy/85 px-4 py-2 text-center text-[.68rem] text-white/80 backdrop-blur-sm">
              Illustration générée par IA — personne fictive.
            </figcaption>
          </figure>
          <div>
            <p className="sk-eyebrow mb-4 text-cobalt">Le métier ne suffit pas</p>
            <h2 className="sk-section-title">
              La même profession. Trois moments différents.
            </h2>
            <p className="mt-6 text-[1rem] leading-8 text-ink-muted">
              Une installation, une activité déjà structurée et un changement de cabinet ne posent pas les mêmes questions. Sélectionnez votre profession pour comprendre le terrain, puis décrivez le moment que traverse votre activité.
            </p>
            <div className="mt-9 divide-y divide-ink/15 border-y border-ink/15">
              {[
                ["01", "Je m’installe", "Organisation de départ, choix des outils, premières échéances et articulation avec les autres intervenants."],
                ["02", "Mon activité évolue", "Volume, nouveaux flux, équipe, besoin de visibilité et répartition actuelle des tâches."],
                ["03", "Je change de cabinet", "Reprise des données, calendrier de transition, responsabilités et continuité des travaux."],
              ].map(([number, title, body]) => (
                <article key={number} className="grid grid-cols-[3rem_1fr] gap-4 py-6">
                  <span className="font-editorial text-[2rem] leading-none text-cobalt">{number}</span>
                  <div>
                    <h3 className="text-[1.05rem] font-semibold">{title}</h3>
                    <p className="mt-2 text-[.86rem] leading-6 text-ink-muted">{body}</p>
                  </div>
                </article>
              ))}
            </div>
            <Link href="/expertises" className="mt-7 inline-flex text-[.84rem] font-bold text-cobalt hover:underline">
              Relier ma situation à une expertise ↗
            </Link>
          </div>
        </div>
      </section>

      <section id="criteres-profession" className="bg-navy px-5 py-16 text-white sm:px-8 lg:px-14 lg:py-24 xl:px-20">
        <div className="mx-auto max-w-[80rem]">
          <ActivitySectionIntro
            eyebrow="Du métier à la proposition"
            title="Comparez le fonctionnement."
            accent="Pas seulement l’intitulé."
            body="Une expérience de votre profession devient utile lorsqu’elle améliore la collecte, les contrôles, le calendrier et la qualité des échanges. Faites préciser ces éléments dans chaque proposition."
            inverse
          />
          <div className="grid gap-px overflow-hidden bg-white/15 md:grid-cols-2 xl:grid-cols-4">
            {[
              ["01", "Les tâches", "Ce que vous préparez, ce que le cabinet traite et les contrôles prévus sur les données transmises."],
              ["02", "Les livrables", "Documents remis, niveau de détail, calendrier et explication prévue lorsque vous devez décider."],
              ["03", "Les échanges", "Interlocuteur, délais habituels, rendez-vous compris et traitement d’une demande inhabituelle."],
              ["04", "Les conditions", "Honoraires récurrents, travaux supplémentaires, reprise du dossier, durée et modalités de sortie."],
            ].map(([number, title, body]) => (
              <article key={number} className="min-h-[18rem] bg-navy p-7 lg:p-8">
                <span className="font-editorial text-[3.2rem] text-accent-500">{number}</span>
                <h3 className="mt-10 text-[1.25rem] font-semibold">{title}</h3>
                <p className="mt-4 text-[.87rem] leading-7 text-white/65">{body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-lilac px-5 py-16 sm:px-8 lg:px-14 lg:py-24 xl:px-20">
        <div className="mx-auto max-w-[80rem]">
          <ActivitySectionIntro
            eyebrow="Un parcours continu"
            title="Votre métier ouvre la porte."
            accent="Le brief garde le fil."
            body="Les pages de Skoria sont reliées pour éviter de recommencer votre recherche à chaque étape. Votre activité fournit le contexte ; la mission et la localisation rendent le besoin exploitable."
          />
          <div className="grid gap-5 lg:grid-cols-3">
            <article className="rounded-[2rem_2rem_.5rem_.5rem] bg-white p-7 lg:p-9">
              <span className="sk-eyebrow text-cobalt">Étape 1</span>
              <h3 className="mt-8 text-[1.45rem] font-semibold">Comprendre les sujets de votre activité.</h3>
              <p className="mt-4 text-[.9rem] leading-7 text-ink-muted">La page profession donne des repères : organisation des flux, points à documenter et questions spécifiques à mettre à l’ordre du jour.</p>
              <a href="#professions-catalogue" className="mt-7 inline-flex text-[.8rem] font-bold text-cobalt">Choisir une profession ↗</a>
            </article>
            <article className="rounded-lg bg-apricot p-7 lg:p-9">
              <span className="sk-eyebrow text-cobalt">Étape 2</span>
              <h3 className="mt-8 text-[1.45rem] font-semibold">Définir la mission à comparer.</h3>
              <p className="mt-4 text-[.9rem] leading-7 text-ink-muted">Comptabilité, fiscalité, social, création ou pilotage : examinez les tâches et livrables qui répondent réellement à votre situation.</p>
              <Link href="/expertises" className="mt-7 inline-flex text-[.8rem] font-bold text-cobalt">Explorer les expertises ↗</Link>
            </article>
            <article className="rounded-[.5rem_2rem_2rem_.5rem] bg-cobalt p-7 text-white lg:p-9">
              <span className="sk-eyebrow text-white/70">Étape 3</span>
              <h3 className="mt-8 text-[1.45rem] font-semibold">Rechercher et contacter librement.</h3>
              <p className="mt-4 text-[.9rem] leading-7 text-white/70">Ajoutez votre ville, consultez les informations disponibles et utilisez le même brief pour poser les mêmes questions à plusieurs cabinets.</p>
              <Link href="/annuaire/experts-comptables" className="mt-7 inline-flex text-[.8rem] font-bold text-white">Ouvrir l’annuaire ↗</Link>
            </article>
          </div>
        </div>
      </section>

      <section id="questions-profession" className="bg-paper px-5 py-16 sm:px-8 lg:px-14 lg:py-24 xl:px-20">
        <div className="mx-auto grid max-w-[80rem] gap-10 lg:grid-cols-[.8fr_1.2fr] lg:gap-20">
          <div>
            <p className="sk-eyebrow mb-4 text-cobalt">Avant le rendez-vous</p>
            <h2 className="sk-section-title">Transformez une recherche large en échange concret.</h2>
          </div>
          <div className="sk-prose">
            <p>Le nom d’une profession aide à repérer des enjeux fréquents, mais il ne décrit pas votre dossier. Deux personnes qui exercent la même activité peuvent avoir des structures, des outils et des attentes très différents. L’une cherche à organiser son installation ; l’autre veut reprendre une comptabilité existante ou disposer d’un suivi plus régulier.</p>
            <p>Avant de consulter des cabinets, notez ce qui circule réellement dans votre entreprise : ventes, achats, banque, notes de frais, contrats, paie et opérations exceptionnelles. Indiquez qui produit l’information, où elle se trouve et à quel moment elle devient disponible. Cette description permet au professionnel d’expliquer un processus plutôt que de répondre par une formule générale.</p>
            <p>Comparez ensuite les propositions sur une base stable. Une mission peut inclure la production de documents sans rendez-vous de pilotage, ou prévoir un outil sans organiser la reprise de vos données. Les différences deviennent lisibles lorsque les responsabilités, les livrables, le calendrier et les conditions sont posés côte à côte.</p>
          </div>
        </div>
      </section>

      <ActivityFaq eyebrow="Questions fréquentes" title="Choisir par métier, sans raccourci." items={PROFESSION_FAQ} />

      <ActivityClosingCta
        eyebrow="Votre prochain pas"
        title="Votre métier est trouvé. Donnez-lui un périmètre."
        body="Conservez votre activité, ajoutez la mission et la ville, puis utilisez ce brief pour préparer des échanges comparables avec les cabinets de votre choix."
        browseHref="/annuaire/experts-comptables"
        browseLabel="Explorer les cabinets"
        profession="Mon activité professionnelle"
      />
    </>
  );
}
