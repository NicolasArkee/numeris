import Image from "next/image";
import Link from "next/link";
import type { PageSection, Service } from "@/libs/db";
import { DynamicSection } from "@/components/DynamicSection";
import { DirectoryFaq } from "@/components/directory/DirectoryFaq";
import { BriefTrigger } from "@/components/journey/BriefTrigger";
import type { DirectoryFaqItem } from "@/components/directory/profile-v2-helpers";
import type {
  ServiceAssetCard,
  ServiceSeoContentCard,
  ServiceSeoContentPack,
  ServiceSeoDeliverable,
  ServiceSeoInternalLink,
  ServiceSeoListBlock,
} from "@/components/expertises/service-v3-helpers";
import { ServiceScopeBuilder } from "./ServiceScopeBuilder";
import { ServiceSituationTabs } from "./ServiceSituationTabs";

type ServiceSeo = {
  h1: string;
  intro: string;
  faqs: { question: string; answer: string }[];
};

type SourceLink = { label: string; publisher: string; href: string; note: string };

const commonSources: SourceLink[] = [
  {
    label: "Exiger une lettre de mission",
    publisher: "Ordre des experts-comptables",
    href: "https://www.paysdelaloire.experts-comptables.fr/entreprises-et-associations/les-relations-avec-votre-expert-comptable-2/exigez-une-lettre-de-mission/",
    note: "Le document qui précise les travaux, les responsabilités, les délais et les conditions financières.",
  },
  {
    label: "Obligations comptables d’une entreprise",
    publisher: "Service Public Entreprendre",
    href: "https://entreprendre.service-public.fr/vosdroits/F21852",
    note: "Le cadre général des enregistrements, comptes annuels, livres et durées de conservation.",
  },
];

export function sourcesForService(slug: string): SourceLink[] {
  const specific: Record<string, SourceLink[]> = {
    fiscalite: [
      { label: "Bulletin officiel des finances publiques", publisher: "Direction générale des Finances publiques", href: "https://bofip.impots.gouv.fr/", note: "La doctrine administrative fiscale à consulter selon l’impôt et la situation." },
    ],
    social: [
      { label: "Déclaration sociale nominative", publisher: "Urssaf", href: "https://www.urssaf.fr/accueil/employeur/gerer-entreprise/declaration-sociale-nominative.html", note: "Principes, échéances et corrections de la DSN." },
      { label: "Déclaration préalable à l’embauche", publisher: "Urssaf", href: "https://www.urssaf.fr/accueil/employeur/embaucher-gerer-salaries/embaucher/declaration-prealable-embauche.html", note: "Démarche à effectuer avant la prise de poste d’un salarié." },
    ],
    "creation-entreprise": [
      { label: "Guichet unique des formalités", publisher: "INPI", href: "https://www.inpi.fr/decouvrir-inpi/formalites-dentreprises/guichet-unique-formalites-dentreprises-et-registre-national-entreprises", note: "Le point d’entrée officiel pour les créations, modifications et cessations d’entreprise." },
    ],
    audit: [
      { label: "Cadre du commissariat aux comptes", publisher: "Haute autorité de l’audit", href: "https://h2a-france.org/", note: "Normes, avis et cadre de supervision de l’audit légal en France." },
    ],
    "conseil-gestion": [
      { label: "Ressources pour les dirigeants", publisher: "Banque de France — espace entreprises", href: "https://entreprises.banque-france.fr/", note: "Repères sur le financement, la trésorerie et l’analyse financière." },
    ],
  };
  return [...commonSources, ...(specific[slug] ?? [])];
}

function SectionIntro({ eyebrow, title, body, inverse = false }: { eyebrow: string; title: string; body: string; inverse?: boolean }) {
  return (
    <div className="max-w-3xl">
      <p className={`sk-eyebrow ${inverse ? "text-orange" : "text-blue"}`}>{eyebrow}</p>
      <h2 className={`mt-4 sk-section-title ${inverse ? "text-white" : "text-ink"}`}>{title}</h2>
      <p className={`mt-5 text-[1rem] leading-8 ${inverse ? "text-white/72" : "text-ink-muted"}`}>{body}</p>
    </div>
  );
}

function ContentCard({ card, index }: { card: ServiceSeoContentCard; index: number }) {
  return (
    <article className="group min-h-full rounded-[1.25rem] border border-ink/10 bg-white p-6 transition-transform hover:-translate-y-1">
      <span className="font-mono text-[.66rem] font-bold text-orange">{String(index + 1).padStart(2, "0")}</span>
      <h3 className="mt-6 text-[1.05rem] font-bold text-ink">{card.title}</h3>
      <p className="mt-3 text-[.84rem] leading-7 text-ink-muted">{card.body}</p>
    </article>
  );
}

function ListBlock({ block }: { block: ServiceSeoListBlock }) {
  return (
    <article className="rounded-[1.25rem] border border-ink/10 bg-white p-6">
      <h3 className="text-[1rem] font-bold text-ink">{block.title}</h3>
      <p className="mt-3 text-[.84rem] leading-7 text-ink-muted">{block.body}</p>
      <ul className="mt-5 space-y-3">
        {block.items.map((item) => (
          <li key={item} className="grid grid-cols-[.55rem_1fr] gap-3 text-[.82rem] leading-6 text-ink">
            <span aria-hidden className="mt-2 h-2 w-2 rounded-full bg-orange" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </article>
  );
}

function Deliverable({ item }: { item: ServiceSeoDeliverable }) {
  return (
    <article className="grid gap-3 border-t border-white/16 py-6 md:grid-cols-[8rem_.75fr_1fr]">
      <p className="font-display font-semibold text-[1.6rem] text-orange">{item.rhythm}</p>
      <h3 className="text-[.95rem] font-bold text-white">{item.title}</h3>
      <p className="text-[.82rem] leading-6 text-white/68">{item.body}</p>
    </article>
  );
}

function AssetCard({ card, kind }: { card: ServiceAssetCard; kind: "sector" | "profession" }) {
  return (
    <Link href={card.href} className="group overflow-hidden rounded-[1.25rem] border border-ink/10 bg-white transition-transform hover:-translate-y-1">
      <img src={card.asset.src} alt={card.asset.alt} data-asset-kind={kind} loading="lazy" className="aspect-[16/9] w-full object-cover" />
      <div className="p-5">
        {card.categoryLabel && <p className="sk-eyebrow text-blue">{card.categoryLabel}</p>}
        <h3 className="mt-2 text-[.98rem] font-bold text-ink">{card.label}</h3>
        <p className="mt-2 line-clamp-3 text-[.78rem] leading-6 text-ink-muted">{card.description}</p>
        <span className="mt-4 inline-flex text-[.74rem] font-bold text-blue group-hover:underline">Voir ce contexte&nbsp; ↗</span>
      </div>
    </Link>
  );
}

function InternalLinkCard({ item }: { item: ServiceSeoInternalLink }) {
  return (
    <Link href={item.href} className="group rounded-[1.1rem] border border-white/16 bg-white/7 p-5 text-white hover:bg-white/12">
      <h3 className="text-[.93rem] font-bold">{item.label}</h3>
      <p className="mt-3 text-[.78rem] leading-6 text-white/65">{item.body}</p>
      <span className="mt-4 inline-flex text-[.72rem] font-bold text-orange group-hover:underline">Explorer&nbsp; ↗</span>
    </Link>
  );
}

const responsibilityRows = [
  ["Pièces et informations", "Transmettre des données complètes, valider les éléments sensibles et signaler les changements.", "Définir les formats attendus, contrôler la cohérence et relancer selon le circuit convenu."],
  ["Production et déclarations", "Répondre aux demandes, arbitrer les options et respecter les dates de transmission internes.", "Réaliser les travaux inclus, signaler les réserves et déposer les déclarations prévues dans la mission."],
  ["Décisions de gestion", "Choisir et engager l’entreprise après avoir compris les effets de la décision.", "Présenter les chiffres, hypothèses et alertes si le conseil correspondant figure au périmètre."],
  ["Accès et sécurité", "Gérer les habilitations, prévenir les départs et protéger les moyens de validation.", "Limiter les accès, organiser la traçabilité et préciser les règles d’échange de documents."],
];

const toolQuestions = [
  ["Collecte", "Quels formats, quelles automatisations et quel traitement pour les pièces qui ne remontent pas correctement ?"],
  ["Facturation", "Les ventes, avoirs, acomptes et exports restent-ils lisibles et récupérables en cas de changement ?"],
  ["Banque et caisse", "Qui rapproche les flux, explique les écarts et contrôle les comptes d’attente ?"],
  ["Pilotage", "Quels indicateurs sont disponibles, avec quelle fraîcheur et à partir de quelles données validées ?"],
];

const collaborationModes = [
  { title: "Proximité", body: "Échanges physiques possibles et connaissance du tissu local. Vérifiez la disponibilité réelle, le canal pour les urgences et la continuité lorsque votre interlocuteur est absent.", fit: "Utile si les rendez-vous en face à face structurent vos décisions." },
  { title: "Hybride", body: "Rendez-vous clés en présentiel et production partagée à distance. Clarifiez les outils, les délais de réponse et la personne qui pilote chaque sujet.", fit: "Adapté aux équipes qui veulent garder un contact nommé avec un flux numérique." },
  { title: "À distance", body: "Collecte et échanges organisés en ligne. Testez l’accompagnement, l’accessibilité des données et la capacité à traiter une situation qui sort du parcours standard.", fit: "Pertinent pour un dossier déjà numérisé et une organisation autonome." },
];

const selectionQuestions = [
  "Le devis décrit-il les tâches incluses, les options et les causes possibles de facturation complémentaire ?",
  "La lettre de mission répartit-elle clairement les responsabilités et les dates de transmission ?",
  "Les livrables, leur fréquence et les temps de restitution sont-ils nommés ?",
  "L’interlocuteur qui suit le dossier est-il identifié, ainsi que son délai habituel de réponse ?",
  "Les outils permettent-ils l’export, la traçabilité et une reprise du dossier sans dépendance excessive ?",
  "Le cabinet comprend-il les contraintes du secteur, du statut, de l’équipe et du niveau de conseil attendu ?",
];

export function ServiceLandingTemplate({
  service,
  seo,
  content,
  sectorCards,
  professionCards,
  faqItems,
  dbSections = [],
}: {
  service: Service;
  seo: ServiceSeo;
  content: ServiceSeoContentPack;
  sectorCards: ServiceAssetCard[];
  professionCards: ServiceAssetCard[];
  faqItems: DirectoryFaqItem[];
  dbSections?: PageSection[];
}) {
  const serviceName = service.title.toLowerCase();
  const sources = sourcesForService(service.slug);

  return (
    <div className="bg-paper text-ink">
      <section className="overflow-hidden bg-navy text-white">
        <div className="mx-auto grid max-w-[90rem] lg:min-h-[43rem] lg:grid-cols-[1.04fr_.96fr]">
          <div className="flex flex-col justify-center px-5 py-14 sm:px-8 lg:px-14 lg:py-20 xl:pl-20">
            <nav aria-label="Fil d’Ariane" className="text-[.7rem] text-white/58">
              <Link href="/" className="hover:text-white">Accueil</Link><span aria-hidden className="px-2">·</span>
              <Link href="/expertises" className="hover:text-white">Expertises</Link><span aria-hidden className="px-2">·</span>
              <span aria-current="page">{service.title}</span>
            </nav>
            <p className="mt-10 sk-eyebrow text-orange">Mission comptable · guide de décision</p>
            <h1 className="mt-5 max-w-[13ch] text-balance font-display text-[clamp(3rem,6.5vw,5.8rem)] font-semibold leading-[.95] tracking-[-.055em]">{seo.h1}</h1>
            <p className="mt-7 max-w-[42rem] text-[1.03rem] leading-8 text-white/74" data-speakable="true">{seo.intro}</p>
            <div className="mt-8 flex flex-wrap gap-2 text-[.7rem] text-white/75">
              <span className="rounded-full border border-white/20 px-3 py-2">Périmètre comparable</span>
              <span className="rounded-full border border-white/20 px-3 py-2">Responsabilités explicites</span>
              <span className="rounded-full border border-white/20 px-3 py-2">Sans prix inventé</span>
            </div>
            <div className="mt-9 flex flex-wrap gap-3">
              <BriefTrigger prefill={{ need: service.title }} className="inline-flex min-h-12 items-center rounded-full bg-orange px-6 text-[.82rem] font-bold text-navy transition-transform hover:-translate-y-0.5">Préparer mon brief&nbsp; ↗</BriefTrigger>
              <a href="#perimetre" className="inline-flex min-h-12 items-center rounded-full border border-white/25 px-6 text-[.8rem] font-bold text-white hover:bg-white hover:text-navy">Voir le périmètre</a>
            </div>
          </div>
          <figure className="relative min-h-[28rem] overflow-hidden lg:min-h-full">
            <Image src="/images/skoria-v2/editorial/workspace.webp" alt="Bureau avec ordinateur et documents de travail" fill priority sizes="(max-width: 1024px) 100vw, 48vw" className="object-cover" data-asset-kind="hero" />
            <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-navy/45 via-transparent to-transparent" />
          </figure>
        </div>
      </section>

      <section className="border-b border-ink/10 bg-apricot px-5 py-6 sm:px-8" aria-label="Rôle de Skoria">
        <div className="mx-auto grid max-w-7xl gap-4 md:grid-cols-[auto_1fr] md:items-center md:gap-8">
          <p className="font-display font-semibold text-[1.7rem] text-navy">Comparer la mission avant le cabinet.</p>
          <p className="max-w-3xl text-[.82rem] leading-6 text-ink-muted">Skoria vous aide à préciser le besoin, les responsabilités et les critères de comparaison. Le professionnel retenu confirme sa capacité d’intervention, ses honoraires et ses engagements dans sa lettre de mission.</p>
        </div>
      </section>

      <nav aria-label="Sommaire de la page" className="sticky top-[var(--site-header-height)] z-20 overflow-x-auto border-b border-ink/10 bg-white/95 px-5 backdrop-blur">
        <div className="mx-auto flex min-w-max max-w-7xl gap-7 py-4 text-[.7rem] font-bold text-ink-muted">
          <a href="#situations" className="hover:text-blue">Situation</a><a href="#perimetre" className="hover:text-blue">Périmètre</a><a href="#responsabilites" className="hover:text-blue">Responsabilités</a><a href="#livrables" className="hover:text-blue">Livrables</a><a href="#collaboration" className="hover:text-blue">Collaboration</a><a href="#honoraires" className="hover:text-blue">Honoraires</a><a href="#faq" className="hover:text-blue">FAQ</a>
        </div>
      </nav>

      <section id="situations" className="sk-section bg-paper">
        <div className="sk-container">
          <SectionIntro eyebrow="01 · Situation" title="Commencez par le changement que vous devez gérer" body="Une création, une délégation et une reprise de dossier ne demandent ni les mêmes documents ni le même calendrier. Choisissez votre cas pour voir les points à faire apparaître dans la demande." />
          <div className="mt-10"><ServiceSituationTabs serviceTitle={service.title} /></div>
        </div>
      </section>

      <section id="perimetre" className="sk-section bg-navy text-white">
        <div className="sk-container">
          <SectionIntro inverse eyebrow="02 · Mission" title={content.coverageTitle} body={content.coverageIntro} />
          <div className="mt-10"><ServiceScopeBuilder serviceTitle={service.title} options={content.coverageCards} /></div>
        </div>
      </section>

      <section id="responsabilites" className="sk-section bg-lilac">
        <div className="sk-container">
          <SectionIntro eyebrow="03 · Responsabilités" title="Qui fait quoi pendant la mission ?" body={`Externaliser ${serviceName} demande une répartition lisible. Cette matrice sert de base de discussion : la lettre de mission du cabinet choisi reste le document qui fixe le périmètre réel.`} />
          <div className="mt-10 overflow-hidden rounded-[1.25rem] border border-ink/12 bg-white">
            <div className="hidden grid-cols-[.55fr_1fr_1fr] gap-px bg-ink/12 text-[.68rem] font-bold uppercase tracking-[.12em] md:grid"><p className="bg-navy p-5 text-white">Sujet</p><p className="bg-navy p-5 text-white">Entreprise</p><p className="bg-navy p-5 text-white">Cabinet retenu</p></div>
            {responsibilityRows.map(([topic, company, firm]) => (
              <div key={topic} className="grid gap-4 border-t border-ink/10 p-5 first:border-t-0 md:grid-cols-[.55fr_1fr_1fr] md:gap-7">
                <h3 className="text-[.9rem] font-bold text-blue">{topic}</h3><p className="text-[.8rem] leading-6 text-ink-muted"><span className="font-bold text-ink md:hidden">Entreprise — </span>{company}</p><p className="text-[.8rem] leading-6 text-ink-muted"><span className="font-bold text-ink md:hidden">Cabinet — </span>{firm}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="sk-section bg-white">
        <div className="sk-container grid gap-10 lg:grid-cols-[.82fr_1.18fr] lg:items-start">
          <div className="lg:sticky lg:top-36">
            <SectionIntro eyebrow="04 · Cadre" title={content.obligationsTitle} body={content.obligationsIntro} />
            <figure className="relative mt-8 aspect-[3/2] overflow-hidden rounded-[1.25rem]"><Image src="/images/skoria-v2/editorial/accounting-flow.webp" alt="Documents comptables organisés en étapes avec registre et calculatrice" fill sizes="(max-width: 1024px) 100vw, 38vw" className="object-cover" data-asset-kind="seo" /></figure>
          </div>
          <div className="grid gap-5">{content.obligationsBlocks.map((block) => <ListBlock key={block.title} block={block} />)}</div>
        </div>
      </section>

      <section className="sk-section bg-mint">
        <div className="sk-container">
          <SectionIntro eyebrow="05 · Documents" title={content.documentsTitle} body={content.documentsIntro} />
          <div className="mt-10 grid gap-5 md:grid-cols-2">{content.documentBlocks.map((block) => <ListBlock key={block.title} block={block} />)}</div>
        </div>
      </section>

      <section className="sk-section bg-paper">
        <div className="sk-container">
          <SectionIntro eyebrow="06 · Déclencheurs" title={content.triggersTitle} body={content.triggersIntro} />
          <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">{content.triggerCards.map((card, index) => <ContentCard key={card.title} card={card} index={index} />)}</div>
        </div>
      </section>

      <section id="livrables" className="sk-section bg-navy text-white">
        <div className="sk-container">
          <SectionIntro inverse eyebrow="07 · Résultats" title={content.deliverablesTitle} body={content.deliverablesIntro} />
          <div className="mt-9">{content.deliverables.map((item) => <Deliverable key={`${item.rhythm}-${item.title}`} item={item} />)}</div>
        </div>
      </section>

      <section className="sk-section bg-apricot">
        <div className="sk-container grid gap-10 lg:grid-cols-[.85fr_1.15fr]">
          <SectionIntro eyebrow="08 · Outils" title="Évaluez le circuit, pas la liste de logiciels" body="Un outil n’améliore la mission que si les responsabilités, les contrôles et la récupération des données sont clairs. Demandez une démonstration du chemin complet, de la pièce au livrable." />
          <div className="grid gap-px overflow-hidden rounded-[1.25rem] bg-ink/12 sm:grid-cols-2">{toolQuestions.map(([title, body]) => <article key={title} className="bg-white p-5"><h3 className="text-[.92rem] font-bold text-ink">{title}</h3><p className="mt-3 text-[.8rem] leading-6 text-ink-muted">{body}</p></article>)}</div>
        </div>
      </section>

      <section id="collaboration" className="sk-section bg-white">
        <div className="sk-container">
          <SectionIntro eyebrow="09 · Collaboration" title="Choisissez un mode de travail soutenable" body="La proximité géographique ne suffit pas à décrire la relation. Comparez le rythme, les canaux, le niveau d’autonomie attendu et l’accès à une personne capable d’expliquer les chiffres." />
          <div className="mt-10 grid gap-5 lg:grid-cols-3">{collaborationModes.map((mode, index) => <article key={mode.title} className={`rounded-[1.25rem] p-6 ${index === 1 ? "bg-blue text-white" : "border border-ink/12 bg-paper text-ink"}`}><p className={`sk-eyebrow ${index === 1 ? "text-orange" : "text-blue"}`}>Mode {index + 1}</p><h3 className="mt-4 text-[1.3rem] font-bold">{mode.title}</h3><p className={`mt-4 text-[.84rem] leading-7 ${index === 1 ? "text-white/75" : "text-ink-muted"}`}>{mode.body}</p><p className={`mt-5 border-t pt-4 text-[.76rem] font-bold leading-6 ${index === 1 ? "border-white/20" : "border-ink/12"}`}>{mode.fit}</p></article>)}</div>
        </div>
      </section>

      <section className="sk-section bg-lilac">
        <div className="sk-container">
          <SectionIntro eyebrow="10 · Mise en place" title="Un processus de reprise visible dès le devis" body="Le premier mois sert à rendre le dossier exploitable et les échéances prévisibles. Chaque étape doit avoir une sortie observable, un responsable et une date cible adaptée à votre situation." />
          <ol className="mt-10 grid gap-px overflow-hidden rounded-[1.25rem] bg-ink/12 lg:grid-cols-4">{[
            ["Cadrer", "Volumes, statut, outils, historique, urgences et livrables attendus."],
            ["Vérifier", "État des données, pièces manquantes, accès, qualité des soldes et échéances proches."],
            ["Organiser", "Calendrier, rôles, canaux de collecte, validations et procédure en cas de blocage."],
            ["Restituer", "Premiers livrables, anomalies, décisions à prendre et ajustement du rythme."],
          ].map(([title, body], index) => <li key={title} className="bg-white p-6"><span className="font-display font-semibold text-[2.2rem] text-orange">0{index + 1}</span><h3 className="mt-5 text-[1rem] font-bold text-ink">{title}</h3><p className="mt-3 text-[.8rem] leading-6 text-ink-muted">{body}</p></li>)}</ol>
        </div>
      </section>

      <section id="honoraires" className="sk-section bg-mint">
        <div className="sk-container grid gap-10 lg:grid-cols-[.8fr_1.2fr]">
          <SectionIntro eyebrow="11 · Honoraires" title="Comparez un prix relié à un périmètre" body="Sans volume, fréquence, état du dossier et niveau de conseil, un montant isolé ne permet pas de comparer. Demandez une présentation séparée du socle récurrent, des options et des travaux exceptionnels." />
          <div className="rounded-[1.25rem] border border-ink/12 bg-white p-6 lg:p-8"><h3 className="text-[1.05rem] font-bold text-ink">Ce qui fait varier une proposition</h3><ul className="mt-5 grid gap-3 sm:grid-cols-2">{["Volume et variété des opérations", "Fréquence de production et de restitution", "Qualité de l’historique à reprendre", "Nombre de déclarations et d’entités", "Niveau d’autonomie de l’entreprise", "Conseil, urgence et travaux hors cycle"].map((item) => <li key={item} className="flex gap-3 rounded-xl bg-paper p-4 text-[.8rem] leading-6"><span aria-hidden className="text-orange">●</span>{item}</li>)}</ul><p className="mt-5 text-[.75rem] leading-6 text-ink-muted">Les honoraires sont confirmés par chaque professionnel selon le dossier. Skoria ne publie ici ni tarif fictif ni promesse de prix uniforme.</p></div>
        </div>
      </section>

      <section className="sk-section bg-white">
        <div className="sk-container">
          <SectionIntro eyebrow="12 · Sélection" title="Six questions pour départager les propositions" body="Utilisez les mêmes questions avec chaque professionnel. Les réponses deviennent comparables et les différences de périmètre apparaissent avant la signature." />
          <ol className="mt-10 grid gap-4 md:grid-cols-2">{selectionQuestions.map((question, index) => <li key={question} className="grid grid-cols-[2.5rem_1fr] gap-4 rounded-[1.1rem] border border-ink/10 bg-paper p-5"><span className="font-mono text-[.68rem] font-bold text-blue">0{index + 1}</span><p className="text-[.84rem] leading-7 text-ink">{question}</p></li>)}</ol>
        </div>
      </section>

      {dbSections.length > 0 && (
        <section className="sk-section bg-paper" aria-labelledby="analyse-detaillee">
          <div className="sk-container"><SectionIntro eyebrow="13 · Analyse" title="Approfondir votre décision" body="Ces repères éditoriaux détaillent les sujets propres à la mission. Ils complètent le cadre de comparaison avec les règles, cas pratiques et points de vigilance disponibles pour cette expertise." /><div id="analyse-detaillee" className="mt-10 space-y-10">{dbSections.map((section) => <DynamicSection key={section.id} section={section} />)}</div></div>
        </section>
      )}

      <section id="secteurs" className="sk-section bg-apricot">
        <div className="sk-container"><SectionIntro eyebrow={`${dbSections.length > 0 ? "14" : "13"} · Contextes`} title="Voir la mission par secteur" body="Les cycles de vente, les justificatifs, la TVA et les contrôles diffèrent selon l’activité. Ouvrez un contexte proche du vôtre pour préparer les questions spécifiques." /><div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{sectorCards.map((card) => <AssetCard key={card.href} card={card} kind="sector" />)}</div></div>
      </section>

      <section className="sk-section bg-mint">
        <div className="sk-container"><SectionIntro eyebrow="Par métier" title="Voir la mission pour votre profession" body="Une profession apporte ses habitudes de facturation, ses obligations et ses documents. Ces parcours croisés relient la mission au quotidien du métier." /><div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">{professionCards.map((card) => <AssetCard key={card.href} card={card} kind="profession" />)}</div></div>
      </section>

      <section className="sk-section bg-navy text-white">
        <div className="sk-container"><SectionIntro inverse eyebrow="Missions liées" title={content.internalLinksTitle} body={content.internalLinksIntro} /><div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-5">{content.internalLinks.map((item) => <InternalLinkCard key={item.href} item={item} />)}</div></div>
      </section>

      <section className="sk-section bg-white">
        <div className="sk-container"><SectionIntro eyebrow="Sources" title="Textes et repères à vérifier" body="Ces sources institutionnelles aident à contrôler les règles générales. Leur contenu peut évoluer et votre situation peut demander une lecture professionnelle spécifique." /><div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">{sources.map((source) => <a key={source.href} href={source.href} target="_blank" rel="noreferrer" className="group rounded-[1.1rem] border border-ink/10 bg-paper p-5 hover:border-blue"><p className="sk-eyebrow text-blue">{source.publisher}</p><h3 className="mt-3 text-[.92rem] font-bold text-ink group-hover:underline">{source.label}&nbsp; ↗</h3><p className="mt-3 text-[.77rem] leading-6 text-ink-muted">{source.note}</p></a>)}</div></div>
      </section>

      <section id="faq" className="sk-section bg-lilac">
        <div className="sk-container max-w-5xl"><DirectoryFaq items={faqItems} /></div>
      </section>

      <section className="relative overflow-hidden bg-blue px-5 py-16 text-white sm:px-8 lg:py-24">
        <div aria-hidden className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-orange/90 blur-[1px]" />
        <div className="relative mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1fr_auto] lg:items-end"><div><p className="sk-eyebrow text-white/65">Votre prochaine étape</p><h2 className="mt-5 max-w-3xl text-balance text-[clamp(2.4rem,5vw,4.8rem)] font-semibold leading-[.98]">Transformez cette lecture en brief comparable.</h2><p className="mt-5 max-w-2xl text-[.95rem] leading-8 text-white/76">Indiquez votre situation, le périmètre envisagé, les outils et l’échéance. Vous pourrez ensuite rechercher des professionnels et poser les mêmes questions à chacun.</p></div><div className="flex flex-col gap-3 sm:flex-row lg:flex-col"><BriefTrigger prefill={{ need: service.title }} className="inline-flex min-h-12 items-center justify-center rounded-full bg-orange px-7 text-[.82rem] font-bold text-navy">Préparer mon brief&nbsp; ↗</BriefTrigger><Link href="/annuaire/experts-comptables" className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/35 px-7 text-[.8rem] font-bold text-white hover:bg-white hover:text-blue">Ouvrir l’annuaire</Link></div></div>
      </section>
    </div>
  );
}
