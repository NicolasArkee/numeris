import Image from "next/image";
import Link from "next/link";
import { PageHero } from "@/components/PageHero";
import { ActivityClosingCta, ActivityFaq, ActivitySectionIntro, ActivityStatBand } from "./ActivityHubShared";
import { SectorsExplorer } from "./SectorsExplorer";
import type { SectorHubEntry, ServiceHubEntry } from "./types";

const SECTOR_FAQ = [
  {
    question: "Pourquoi croiser un secteur avec une expertise comptable ?",
    answer: "Le secteur décrit le fonctionnement de l’activité ; l’expertise décrit le travail attendu. Leur croisement rend la recherche plus précise. Une mission comptable pour un restaurant, une entreprise de transport ou une association peut porter le même nom, tout en mobilisant des flux, des justificatifs, des rythmes et des interlocuteurs différents.",
  },
  {
    question: "Une page secteur constitue-t-elle une recommandation de cabinet ?",
    answer: "Non. Elle aide à formuler les critères et les questions utiles avant une comparaison. La présence d’un cabinet dans l’annuaire ne prouve pas qu’il prend en charge votre secteur. Vérifiez son inscription professionnelle, ses informations publiques, son expérience de situations proches et le périmètre qu’il propose pour votre dossier.",
  },
  {
    question: "Quels éléments de mon activité dois-je décrire ?",
    answer: "Présentez les principaux encaissements, achats, modes de paiement, logiciels, établissements et personnes impliquées. Ajoutez les périodes fortes, les opérations inhabituelles et les échéances déjà connues. Cette vue opérationnelle aide un cabinet à expliquer comment les pièces seront collectées, contrôlées et transformées en livrables.",
  },
  {
    question: "Comment vérifier l’expérience sectorielle d’un cabinet ?",
    answer: "Demandez des exemples de processus, sans solliciter d’informations confidentielles sur d’autres clients. Un interlocuteur peut expliquer comment il organise un export de caisse, le suivi de chantiers, les flux d’une plateforme ou un calendrier associatif. Faites préciser les outils, les contrôles et les points de vigilance associés à votre propre organisation.",
  },
  {
    question: "La proximité géographique reste-t-elle importante ?",
    answer: "Elle peut compter si vous souhaitez des rendez-vous physiques, si des documents circulent localement ou si votre activité comporte plusieurs sites. Elle n’est toutefois qu’un critère parmi d’autres. Comparez aussi le fonctionnement à distance, la disponibilité de l’interlocuteur, les outils, les livrables et l’expérience des opérations propres à votre secteur.",
  },
  {
    question: "Puis-je préparer un brief sans choisir immédiatement un cabinet ?",
    answer: "Oui. Le brief sert à clarifier votre contexte avant toute prise de contact. Vous pouvez y conserver le secteur, la mission principale, votre situation et vos attentes. Il reste sous votre contrôle et n’est pas envoyé automatiquement. Utilisez-le ensuite comme ordre du jour commun lorsque vous consultez plusieurs cabinets.",
  },
];

export function SectorsHub({
  sectors,
  services,
}: {
  sectors: SectorHubEntry[];
  services: ServiceHubEntry[];
}) {
  return (
    <>
      <PageHero
        eyebrow="Expert-comptable par secteur"
        title="Votre activité a ses flux."
        titleAccent="Votre comparaison aussi."
        subtitle="Partez des opérations concrètes de votre secteur, choisissez la mission à examiner et préparez les questions qui permettront de distinguer les propositions."
        breadcrumbs={[{ name: "Accueil", url: "/" }, { name: "Secteurs", url: "/secteurs" }]}
        badges={[`${sectors.length} secteurs documentés`, `${services.length} expertises à croiser`, "Annuaire relié au parcours"]}
        cta={{ label: "Choisir mon secteur", href: "#secteurs-catalogue" }}
        ctaSecondary={{ label: "Voir les expertises", href: "/expertises" }}
        tone="apricot"
        media={{
          src: "/images/skoria-v2/editorial/restaurant.webp",
          alt: "Restaurateur préparant son activité au comptoir",
          position: "38% center",
          disclaimer: "Illustration générée par IA — personne fictive.",
        }}
      >
        <button
          type="button"
          data-open-brief
          data-profession="Mon secteur d’activité"
          className="mt-4 w-fit rounded-full border border-ink/25 px-5 py-3 text-[.8rem] font-bold text-ink transition-colors hover:bg-ink hover:text-white"
        >
          Décrire directement mon activité ↗
        </button>
      </PageHero>

      <ActivityStatBand
        items={[
          { value: String(sectors.length), label: "secteurs issus du catalogue Skoria" },
          { value: String(services.length), label: "missions à mettre en regard" },
          { value: "4", label: "repères : flux, équipe, outils, calendrier" },
        ]}
      />

      <nav aria-label="Étapes du parcours secteurs" className="sticky top-[var(--site-header-height)] z-20 border-b border-ink/10 bg-white/95 px-5 backdrop-blur sm:px-8">
        <div className="mx-auto flex max-w-[80rem] gap-7 overflow-x-auto py-4 text-[.75rem] font-semibold text-ink-muted">
          <a className="whitespace-nowrap hover:text-cobalt" href="#secteurs-catalogue">01 · Choisir</a>
          <a className="whitespace-nowrap hover:text-cobalt" href="#signaux-secteur">02 · Décrire</a>
          <a className="whitespace-nowrap hover:text-cobalt" href="#croiser-secteur">03 · Croiser</a>
          <a className="whitespace-nowrap hover:text-cobalt" href="#preparer-secteur">04 · Comparer</a>
        </div>
      </nav>

      <SectorsExplorer sectors={sectors} services={services} />

      <section id="signaux-secteur" className="bg-navy px-5 py-16 text-white sm:px-8 lg:px-14 lg:py-24 xl:px-20">
        <div className="mx-auto max-w-[80rem]">
          <ActivitySectionIntro
            eyebrow="Le secteur, côté terrain"
            title="Quatre signaux racontent"
            accent="votre organisation."
            body="Décrivez ce qui se passe avant de parler de solution. Un cabinet pourra alors relier ses outils et ses contrôles à vos opérations réelles."
            inverse
          />
          <div className="grid gap-px overflow-hidden bg-white/15 md:grid-cols-2 xl:grid-cols-4">
            {[
              ["01", "Les flux", "Origine des ventes, fréquence des achats, modes de paiement, remboursements et opérations exceptionnelles."],
              ["02", "Les rythmes", "Saisonnalité, clôtures, déclarations, paie, campagnes ou périodes de forte activité à anticiper."],
              ["03", "Les outils", "Caisse, facturation, banque, plateformes, logiciels métier et manière dont les données peuvent être récupérées."],
              ["04", "Les acteurs", "Dirigeant, équipe, prestataires et personnes qui préparent, valident ou utilisent les informations produites."],
            ].map(([number, title, body]) => (
              <article key={number} className="min-h-[19rem] bg-navy p-7 lg:p-8">
                <span className="font-editorial text-[3.2rem] text-accent-500">{number}</span>
                <h3 className="mt-10 text-[1.25rem] font-semibold">{title}</h3>
                <p className="mt-4 text-[.87rem] leading-7 text-white/65">{body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="croiser-secteur" className="bg-mint px-5 py-16 sm:px-8 lg:px-14 lg:py-24 xl:px-20">
        <div className="mx-auto grid max-w-[80rem] gap-12 lg:grid-cols-[1.05fr_.95fr] lg:items-center lg:gap-20">
          <div>
            <p className="sk-eyebrow mb-4 text-cobalt">Secteur × mission</p>
            <h2 className="sk-section-title">
              Transformez vos opérations en périmètre à comparer.
            </h2>
            <div className="sk-prose mt-7">
              <p>Le secteur fournit les exemples ; la mission organise les responsabilités. Pour la comptabilité, vous pouvez préciser les sources de ventes, la collecte des achats, les rapprochements et les restitutions. Pour le social, décrivez l’équipe, les variables et les événements à traiter. Pour le pilotage, partez des décisions qui demandent davantage de visibilité.</p>
              <p>Cette traduction évite les demandes trop générales. Elle permet de demander à chaque cabinet comment il traiterait le même circuit, quelles informations il attendrait de votre part et quels livrables seraient disponibles à chaque étape.</p>
            </div>
            <div className="mt-8 flex flex-wrap gap-2">
              {services.map((service) => (
                <Link
                  key={service.slug}
                  href={`/expertises/${service.slug}`}
                  className="rounded-full border border-ink/20 bg-white/60 px-4 py-2 text-[.76rem] font-semibold text-ink transition-colors hover:border-cobalt hover:text-cobalt"
                >
                  {service.title} ↗
                </Link>
              ))}
            </div>
          </div>
          <figure className="relative min-h-[27rem] overflow-hidden rounded-[1rem_8rem_1rem_1rem] bg-white lg:min-h-[36rem]">
            <Image
              src="/images/skoria-v2/editorial/accounting-flow.webp"
              alt="Documents comptables organisés en étapes avec registre et calculatrice"
              fill
              sizes="(max-width: 1024px) 100vw, 42vw"
              className="object-cover"
              style={{ objectPosition: "50% 50%" }}
            />
            <figcaption className="absolute bottom-5 left-5 max-w-[16rem] bg-navy px-5 py-4 text-[.75rem] leading-5 text-white">
              Vos opérations donnent le contexte. La mission répartit le travail.
            </figcaption>
          </figure>
        </div>
      </section>

      <section id="preparer-secteur" className="bg-lilac px-5 py-16 sm:px-8 lg:px-14 lg:py-24 xl:px-20">
        <div className="mx-auto max-w-[80rem]">
          <ActivitySectionIntro
            eyebrow="Trois situations"
            title="Le secteur reste le même."
            accent="La priorité change."
            body="Choisissez le scénario le plus proche de votre situation pour savoir quelles informations mettre en premier dans le brief."
          />
          <div className="grid gap-5 lg:grid-cols-3">
            {[
              ["Je lance l’activité", "Présentez le modèle d’activité, les outils prévus, la date de démarrage et les premières échéances. Demandez ce qui relève de la création et ce qui appartient ensuite à la mission récurrente.", "Création ou installation"],
              ["Je veux mieux suivre", "Décrivez les décisions que vous prenez trop tard, les informations actuellement disponibles et la fréquence utile. Un tableau ne suffit pas sans définition, calendrier et temps d’échange.", "Conseil de gestion"],
              ["Je change de cabinet", "Listez les travaux réalisés, les données disponibles, les échéances proches et les points restés ouverts. Faites détailler la reprise et la continuité du dossier.", "Reprise d’un dossier"],
            ].map(([title, body, need], index) => (
              <article key={title} className={`p-7 lg:p-9 ${index === 1 ? "rounded-[2rem] bg-cobalt text-white" : "rounded-lg bg-white"}`}>
                <span className={`font-editorial text-[3rem] ${index === 1 ? "text-accent-500" : "text-cobalt"}`}>0{index + 1}</span>
                <h3 className="mt-7 text-[1.4rem] font-semibold">{title}</h3>
                <p className={`mt-4 text-[.88rem] leading-7 ${index === 1 ? "text-white/70" : "text-ink-muted"}`}>{body}</p>
                <button
                  type="button"
                  data-open-brief
                  data-profession="Mon secteur d’activité"
                  data-need={need}
                  className={`mt-7 text-[.8rem] font-bold ${index === 1 ? "text-white" : "text-cobalt"}`}
                >
                  Partir de cette situation ↗
                </button>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-paper px-5 py-16 sm:px-8 lg:px-14 lg:py-24 xl:px-20">
        <div className="mx-auto grid max-w-[80rem] gap-10 lg:grid-cols-[.8fr_1.2fr] lg:gap-20">
          <div>
            <p className="sk-eyebrow mb-4 text-cobalt">Comparer sans surinterpréter</p>
            <h2 className="sk-section-title">L’expérience sectorielle doit devenir observable.</h2>
          </div>
          <div className="sk-prose">
            <p>Une mention de secteur sur un site ne décrit pas à elle seule la mission proposée. Demandez comment cette connaissance influence le démarrage, la collecte des pièces, les contrôles et les restitutions. Une réponse précise s’appuie sur votre organisation et indique clairement ce qui reste sous votre responsabilité.</p>
            <p>Les outils méritent la même attention. Une connexion ou un portail peut faciliter un circuit, mais il faut encore savoir qui contrôle les informations, traite les anomalies et vous alerte. Faites décrire un exemple de bout en bout, depuis l’opération dans votre entreprise jusqu’au document ou à l’indicateur que vous utiliserez.</p>
            <p>Enfin, rapprochez le prix du périmètre réel. Les honoraires peuvent dépendre du volume, du nombre d’établissements, de la complexité des flux, de l’équipe et du rythme de suivi. Conservez vos hypothèses et demandez ce qui déclencherait un travail supplémentaire : vous comparerez ainsi des propositions plus lisibles.</p>
          </div>
        </div>
      </section>

      <ActivityFaq eyebrow="Questions fréquentes" title="Choisir par secteur, avec méthode." items={SECTOR_FAQ} />

      <ActivityClosingCta
        eyebrow="Votre prochain pas"
        title="Votre secteur est posé. Ajoutez la mission et la ville."
        body="Préparez un brief commun, puis consultez les informations disponibles sur les cabinets et confirmez directement leur capacité à accompagner votre activité."
        browseHref="/annuaire/experts-comptables"
        browseLabel="Ouvrir l’annuaire"
        profession="Mon secteur d’activité"
      />
    </>
  );
}
