import Image from "next/image";
import Link from "next/link";
import { PageHero } from "@/components/PageHero";
import { ActivityClosingCta, ActivityFaq, ActivitySectionIntro, ActivityStatBand } from "./ActivityHubShared";
import { ServicesExplorer } from "./ServicesExplorer";
import type { ActivityLinkEntry, ServiceHubEntry } from "./types";

const SERVICE_FAQ = [
  {
    question: "Que recouvre une expertise comptable sur Skoria ?",
    answer: "Une expertise est une famille de missions à examiner, comme la comptabilité, la fiscalité, la gestion sociale, la création, le conseil en gestion ou l’audit. Skoria en explique les tâches, les livrables et les points à vérifier. Le périmètre contractuel dépend ensuite de la proposition du cabinet et de votre situation.",
  },
  {
    question: "Comment savoir ce qui est inclus dans une proposition ?",
    answer: "Demandez une répartition explicite des responsabilités. Pour chaque étape, identifiez ce que vous préparez, ce que le cabinet traite, les contrôles réalisés et le document ou l’échange qui en résulte. Vérifiez aussi la fréquence, l’interlocuteur, les délais, la reprise de l’existant et les travaux facturés séparément.",
  },
  {
    question: "Dois-je choisir d’abord une expertise, un métier ou un secteur ?",
    answer: "Commencez par l’entrée la plus claire pour vous. Si vous savez ce que vous voulez obtenir, partez de l’expertise. Si vos questions viennent surtout de vos opérations, utilisez le secteur. Si votre mode d’exercice est déterminant, choisissez la profession. Le parcours relie ensuite ces dimensions dans le brief.",
  },
  {
    question: "Un outil numérique définit-il la qualité de la mission ?",
    answer: "Non. Un outil peut faciliter la collecte, le partage ou la consultation, mais il ne décrit pas les contrôles, le conseil et les échanges prévus. Demandez comment l’outil s’insère dans le processus, qui traite les anomalies, quelles données peuvent être récupérées et ce qui se passe lorsqu’une opération sort du cadre habituel.",
  },
  {
    question: "Pourquoi comparer les livrables et le calendrier ?",
    answer: "Deux missions portant le même nom peuvent produire des résultats différents et à des rythmes différents. Un document annuel, une situation intermédiaire et un tableau commenté ne répondent pas au même besoin. Reliez chaque livrable à une décision ou une obligation, puis vérifiez la date et le temps d’échange associés.",
  },
  {
    question: "Le brief Skoria engage-t-il un cabinet ?",
    answer: "Non. Il s’agit d’un support de préparation sous votre contrôle. Il n’est ni une lettre de mission ni une commande, et aucun envoi automatique n’est effectué. Le cabinet reste responsable de la proposition qu’il formule ; vous pouvez utiliser le brief pour comparer plusieurs réponses sur un cadre commun.",
  },
];

export function ServicesHub({
  services,
  sectors,
  categories,
}: {
  services: ServiceHubEntry[];
  sectors: ActivityLinkEntry[];
  categories: ActivityLinkEntry[];
}) {
  return (
    <>
      <PageHero
        eyebrow="Expertises comptables"
        title="Commencez par le résultat."
        titleAccent="Cadrez la mission."
        subtitle="Tenir les comptes, préparer une création, suivre la paie ou éclairer une décision : explorez les missions à partir de votre besoin, puis comparez les tâches, les livrables et le fonctionnement proposés."
        breadcrumbs={[{ name: "Accueil", url: "/" }, { name: "Expertises", url: "/expertises" }]}
        badges={[`${services.length} expertises`, `${sectors.length} secteurs reliés`, `${categories.length} familles professionnelles`]}
        cta={{ label: "Explorer les missions", href: "#expertises-catalogue" }}
        ctaSecondary={{ label: "Partir de mon métier", href: "/professions" }}
        tone="navy"
        media={{
          src: "/images/skoria-v2/editorial/accounting-flow.webp",
          alt: "Documents comptables organisés en étapes avec registre et calculatrice",
          position: "50% center",
          disclaimer: "Illustration générée par IA.",
        }}
      >
        <button
          type="button"
          data-open-brief
          className="mt-4 w-fit rounded-full border border-white/25 px-5 py-3 text-[.8rem] font-bold text-white transition-colors hover:bg-white hover:text-navy"
        >
          Décrire directement mon besoin ↗
        </button>
      </PageHero>

      <ActivityStatBand
        items={[
          { value: String(services.length), label: "expertises issues du catalogue" },
          { value: String(sectors.length), label: "secteurs pour contextualiser" },
          { value: String(categories.length), label: "familles de professions reliées" },
        ]}
      />

      <nav aria-label="Étapes du parcours expertises" className="sticky top-[var(--site-header-height)] z-20 border-b border-ink/10 bg-white/95 px-5 backdrop-blur sm:px-8">
        <div className="mx-auto flex max-w-[80rem] gap-7 overflow-x-auto py-4 text-[.75rem] font-semibold text-ink-muted">
          <a className="whitespace-nowrap hover:text-cobalt" href="#expertises-catalogue">01 · Choisir</a>
          <a className="whitespace-nowrap hover:text-cobalt" href="#responsabilites-expertise">02 · Répartir</a>
          <a className="whitespace-nowrap hover:text-cobalt" href="#devis-expertise">03 · Lire le devis</a>
          <a className="whitespace-nowrap hover:text-cobalt" href="#relier-expertise">04 · Contextualiser</a>
        </div>
      </nav>

      <ServicesExplorer services={services} />

      <section id="responsabilites-expertise" className="bg-navy px-5 py-16 text-white sm:px-8 lg:px-14 lg:py-24 xl:px-20">
        <div className="mx-auto max-w-[80rem]">
          <ActivitySectionIntro
            eyebrow="Le périmètre avant le prix"
            title="Une mission répartit"
            accent="des responsabilités."
            body="Pour comprendre une proposition, suivez une information depuis sa préparation jusqu’à sa restitution. Chaque étape doit avoir un responsable, un calendrier et un résultat identifiable."
            inverse
          />
          <div className="overflow-x-auto rounded-xl border border-white/15">
            <table className="w-full min-w-[50rem] border-collapse text-left">
              <thead className="bg-white/8 text-[.69rem] uppercase tracking-[.12em] text-white/65">
                <tr>
                  <th className="px-6 py-5">Étape</th>
                  <th className="px-6 py-5">À préciser côté entreprise</th>
                  <th className="px-6 py-5">À demander au cabinet</th>
                  <th className="px-6 py-5">Preuve attendue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/15 text-[.84rem] leading-6">
                {[
                  ["Collecter", "Où naissent les données et qui les transmet ?", "Quels formats, contrôles d’entrée et relances ?", "Circuit documenté"],
                  ["Traiter", "Quelles tâches restent réalisées en interne ?", "Quels travaux récurrents sont inclus ?", "Périmètre écrit"],
                  ["Contrôler", "Qui répond aux questions et corrige les sources ?", "Quelles vérifications et quels seuils d’alerte ?", "Points de contrôle"],
                  ["Restituer", "Quelles décisions ou obligations faut-il servir ?", "Quels livrables, dates et temps d’échange ?", "Calendrier partagé"],
                ].map((row) => (
                  <tr key={row[0]}>
                    <th className="px-6 py-6 text-[.95rem] font-semibold text-white">{row[0]}</th>
                    <td className="px-6 py-6 text-white/68">{row[1]}</td>
                    <td className="px-6 py-6 text-white/68">{row[2]}</td>
                    <td className="px-6 py-6 font-semibold text-accent-300">{row[3]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section id="devis-expertise" className="bg-apricot px-5 py-16 sm:px-8 lg:px-14 lg:py-24 xl:px-20">
        <div className="mx-auto grid max-w-[80rem] gap-12 lg:grid-cols-[.92fr_1.08fr] lg:items-center lg:gap-20">
          <figure className="relative min-h-[27rem] overflow-hidden rounded-[9rem_1rem_1rem_1rem] bg-white lg:min-h-[36rem]">
            <Image
              src="/images/skoria-v2/editorial/objects.webp"
              alt="Nature morte de documents et objets de calcul"
              fill
              sizes="(max-width: 1024px) 100vw, 42vw"
              className="object-cover"
              style={{ objectPosition: "52% 58%" }}
            />
            <figcaption className="absolute bottom-5 right-5 max-w-[15rem] bg-white px-5 py-4 text-[.75rem] leading-5 text-ink shadow-lg">
              Un intitulé donne le thème. Le devis doit décrire le fonctionnement.
            </figcaption>
          </figure>
          <div>
            <p className="sk-eyebrow mb-4 text-cobalt">Lire une proposition</p>
            <h2 className="sk-section-title">
              Cinq lignes à retrouver avant de comparer.
            </h2>
            <div className="mt-9 divide-y divide-ink/15 border-y border-ink/15">
              {[
                ["01", "Les travaux inclus", "Listez les opérations récurrentes et les interventions ponctuelles déjà prévues."],
                ["02", "Vos contributions", "Repérez les pièces, validations, outils et dates qui restent sous votre responsabilité."],
                ["03", "Les livrables", "Reliez chaque document ou indicateur à sa date et à l’usage que vous en ferez."],
                ["04", "Les échanges", "Identifiez l’interlocuteur, les rendez-vous compris et le traitement d’une question inhabituelle."],
                ["05", "Les conditions", "Vérifiez la reprise, les travaux supplémentaires, la durée, la révision des honoraires et la sortie."],
              ].map(([number, title, body]) => (
                <article key={number} className="grid grid-cols-[3rem_1fr] gap-4 py-5">
                  <span className="font-editorial text-[2rem] leading-none text-cobalt">{number}</span>
                  <div>
                    <h3 className="text-[1rem] font-semibold">{title}</h3>
                    <p className="mt-2 text-[.84rem] leading-6 text-ink-muted">{body}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-mint px-5 py-16 sm:px-8 lg:px-14 lg:py-24 xl:px-20">
        <div className="mx-auto max-w-[80rem]">
          <ActivitySectionIntro
            eyebrow="Du besoin au premier échange"
            title="Quatre étapes."
            accent="Un fil conservé."
            body="La qualification reste utile lorsqu’elle accompagne la navigation. Chaque choix alimente la prochaine étape sans décider à votre place."
          />
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {[
              ["01", "Nommer le résultat", "L’obligation, le document ou la décision que vous voulez mieux traiter."],
              ["02", "Décrire l’existant", "Les personnes, outils, volumes, échéances et irritants déjà présents."],
              ["03", "Choisir le contexte", "Votre profession, votre secteur et la ville utile pour la recherche."],
              ["04", "Comparer les réponses", "Le même brief, les mêmes questions et un périmètre relu avant le prix."],
            ].map(([number, title, body]) => (
              <article key={number} className="rounded-[.75rem_2rem_.75rem_.75rem] bg-white p-7">
                <span className="font-editorial text-[3rem] text-cobalt">{number}</span>
                <h3 className="mt-8 text-[1.15rem] font-semibold">{title}</h3>
                <p className="mt-4 text-[.84rem] leading-7 text-ink-muted">{body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="relier-expertise" className="bg-lilac px-5 py-16 sm:px-8 lg:px-14 lg:py-24 xl:px-20">
        <div className="mx-auto max-w-[80rem]">
          <ActivitySectionIntro
            eyebrow="Ajouter le contexte"
            title="La mission devient concrète"
            accent="avec votre activité."
            body="Choisissez ensuite un secteur ou une famille professionnelle. Toutes les entrées du catalogue restent accessibles : ces liens orientent la lecture sans produire de recommandation automatique."
          />
          <div className="grid gap-6 lg:grid-cols-2">
            <section className="rounded-[2rem_2rem_.5rem_.5rem] bg-white p-7 lg:p-9">
              <p className="sk-eyebrow mb-6 text-cobalt">Par secteur</p>
              <div className="flex flex-wrap gap-2">
                {sectors.map((sector) => (
                  <Link key={sector.slug} href={`/secteurs/${sector.slug}`} className="rounded-full border border-ink/15 px-4 py-2 text-[.76rem] font-semibold text-ink hover:border-cobalt hover:text-cobalt">
                    {sector.name} ↗
                  </Link>
                ))}
              </div>
              <Link href="/secteurs" className="mt-8 inline-flex text-[.82rem] font-bold text-cobalt">Explorer le hub secteurs ↗</Link>
            </section>
            <section className="rounded-[.5rem_2rem_2rem_.5rem] bg-navy p-7 text-white lg:p-9">
              <p className="sk-eyebrow mb-6 text-accent-300">Par famille professionnelle</p>
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <Link key={category.slug} href={`/professions#${category.slug}`} className="rounded-full border border-white/20 px-4 py-2 text-[.76rem] font-semibold text-white/80 hover:border-white hover:text-white">
                    {category.name} ↗
                  </Link>
                ))}
              </div>
              <Link href="/professions" className="mt-8 inline-flex text-[.82rem] font-bold text-white">Explorer le hub professions ↗</Link>
            </section>
          </div>
        </div>
      </section>

      <section className="bg-paper px-5 py-16 sm:px-8 lg:px-14 lg:py-24 xl:px-20">
        <div className="mx-auto grid max-w-[80rem] gap-10 lg:grid-cols-[.8fr_1.2fr] lg:gap-20">
          <div>
            <p className="sk-eyebrow mb-4 text-cobalt">Une comparaison exploitable</p>
            <h2 className="sk-section-title">Le prix prend son sens dans un périmètre.</h2>
          </div>
          <div className="sk-prose">
            <p>Une proposition synthétique peut sembler simple, mais laisser de nombreuses tâches implicites. Pour comparer, reprenez chaque flux important et demandez qui intervient, à quel moment et avec quel résultat. Les écarts de prix deviennent plus compréhensibles lorsque la reprise des données, les rendez-vous, les outils et les travaux ponctuels sont visibles.</p>
            <p>Le calendrier mérite une attention particulière. Une information disponible après la décision qu’elle devait éclairer apporte peu de valeur. Indiquez vos échéances et les périodes où vous avez besoin d’un échange. Le cabinet pourra préciser ce qui est réaliste, les données nécessaires et la manière dont les retards ou anomalies sont traités.</p>
            <p>Gardez enfin une trace des hypothèses retenues. Volume de pièces, nombre de salariés, établissements, fréquence de reporting ou opérations particulières peuvent modifier le périmètre. Un brief clair facilite l’actualisation de la proposition et limite les comparaisons fondées sur des situations différentes.</p>
          </div>
        </div>
      </section>

      <ActivityFaq eyebrow="Questions fréquentes" title="Comprendre la mission avant de choisir." items={SERVICE_FAQ} />

      <ActivityClosingCta
        eyebrow="Votre prochain pas"
        title="La mission est plus claire. Préparez une comparaison réelle."
        body="Conservez le besoin, ajoutez votre activité et votre ville, puis utilisez le brief pour demander un périmètre comparable aux cabinets que vous souhaitez consulter."
        browseHref="/annuaire/experts-comptables"
        browseLabel="Explorer les cabinets"
        need="Mission comptable à préciser"
      />
    </>
  );
}
