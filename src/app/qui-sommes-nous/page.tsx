import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { AppConfig } from "@/utils/AppConfig";
import { BreadcrumbJsonLd } from "@/components/JsonLd";
import { BriefTrigger } from "@/components/journey/BriefTrigger";
import { legalEntity } from "@/data/legal-entity";

export const metadata: Metadata = {
  title: "Qui sommes-nous",
  description: `Découvrez ${legalEntity.companyName}, éditeur du comparateur indépendant Skoria : méthode, sources, limites éditoriales et demandes de correction.`,
  alternates: { canonical: `${AppConfig.url}/qui-sommes-nous` },
  robots: { index: true, follow: true },
};

const missionPillars = [
  {
    number: "01",
    label: "Comprendre",
    title: "Partir du besoin réel",
    body: "Métier, localisation, périmètre de mission et points de vigilance donnent un cadre plus précis à la recherche.",
  },
  {
    number: "02",
    label: "Comparer",
    title: "Rendre les critères lisibles",
    body: "Skoria organise les informations utiles pour comparer plusieurs options à partir des mêmes questions.",
  },
  {
    number: "03",
    label: "Préparer",
    title: "Arriver avec les bons éléments",
    body: "Documents, questions et points à confirmer aident à préparer un premier échange plus structuré.",
  },
];

const methodSteps = [
  {
    title: "Décrire la situation",
    body: "Les guides par métier, secteur ou expertise partent du contexte de l'utilisateur et de ses obligations générales.",
    detail: "Activité · localisation · besoin",
  },
  {
    title: "Structurer les questions",
    body: "Les contenus mettent en ordre les documents à préparer, les points de pilotage, les risques à clarifier et les critères de comparaison.",
    detail: "Pièces · périmètre · vigilance",
  },
  {
    title: "Distinguer les niveaux d'information",
    body: "Chaque page sépare autant que possible les faits administratifs, le contenu éditorial et ce qui doit être confirmé auprès du professionnel.",
    detail: "Faits · lecture · confirmation",
  },
];

const sourceLayers = [
  {
    label: "Public",
    title: "Données administratives",
    body: "Les pages d'annuaire s'appuient sur des données administratives publiques lorsqu'elles sont disponibles.",
    tone: "bg-mint",
  },
  {
    label: "Documenté",
    title: "Bases et corrections",
    body: "Les informations disponibles dans les bases internes et les demandes de correction reçues complètent ce socle.",
    tone: "bg-lilac",
  },
  {
    label: "À confirmer",
    title: "Échange professionnel",
    body: "Une information indisponible dans une source publique ou documentée n'est pas présentée comme certaine.",
    tone: "bg-apricot",
  },
];

const limits = [
  "Skoria n'est ni une institution professionnelle, ni une administration, ni un cabinet comptable.",
  "La plateforme ne revendique aucune affiliation officielle avec les professionnels éventuellement listés dans l'annuaire.",
  "Aucune note, aucun avis client, aucun horaire et aucun service attribué à un professionnel n'est inventé.",
  "Les classements, maillages et contenus éditoriaux facilitent la navigation et la comparaison ; ils ne constituent ni une recommandation personnalisée, ni une garantie de qualité.",
  "Les contenus préparent une comparaison et un premier échange ; ils ne remplacent pas l'analyse d'un professionnel habilité sur une situation particulière.",
];

const publisherFacts = [
  [
    "Éditeur",
    `${legalEntity.companyName}, ${legalEntity.legalForm} au capital de ${legalEntity.capital}`,
  ],
  ["Siège social", legalEntity.addressSiege],
  ["Immatriculation", legalEntity.rcs],
  ["Activité déclarée", `${legalEntity.naf} — ${legalEntity.nafLabel}`],
  ["Contact", legalEntity.emailContact],
];

export default function QuiSommesNousPage() {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Accueil", url: "/" },
          { name: "Qui sommes-nous", url: "/qui-sommes-nous" },
        ]}
      />

      <div className="overflow-hidden">
        <section className="relative isolate bg-navy text-white">
          <div
            aria-hidden
            className="absolute inset-0 -z-10 opacity-60"
            style={{
              backgroundImage:
                "linear-gradient(90deg,rgba(255,255,255,.07) 1px,transparent 1px),linear-gradient(rgba(255,255,255,.05) 1px,transparent 1px)",
              backgroundSize: "96px 96px",
              maskImage: "linear-gradient(100deg,black,transparent 72%)",
            }}
          />

          <div className="mx-auto grid min-h-[44rem] max-w-[90rem] lg:grid-cols-[1.05fr_.95fr]">
            <div className="flex flex-col justify-center px-5 py-14 sm:px-8 lg:px-14 lg:py-20 xl:pl-20">
              <nav aria-label="Fil d'Ariane" className="mb-10">
                <ol className="flex items-center gap-2 text-[.72rem] text-white/58">
                  <li>
                    <Link
                      href="/"
                      className="underline-offset-4 hover:underline"
                    >
                      Accueil
                    </Link>
                  </li>
                  <li aria-hidden>·</li>
                  <li aria-current="page">Qui sommes-nous</li>
                </ol>
              </nav>

              <p className="text-[.68rem] font-bold uppercase tracking-[.2em] text-[#ffb293]">
                Comparateur indépendant
              </p>
              <h1 className="mt-5 max-w-[12ch] text-balance text-[clamp(3.4rem,7.2vw,6.7rem)] font-semibold leading-[.92] tracking-[-.055em]">
                Comprendre le besoin avant de comparer.
              </h1>
              <p className="mt-8 max-w-[42rem] text-[1.05rem] leading-8 text-white/75 lg:text-[1.15rem]">
                {AppConfig.name} aide les entrepreneurs à comprendre leurs
                besoins, comparer les critères utiles et préparer leurs échanges
                avec des professionnels comptables.
              </p>

              <div className="mt-9 flex flex-wrap gap-3">
                <Link
                  href="/annuaire/experts-comptables"
                  className="inline-flex min-h-12 items-center justify-center rounded-full bg-orange px-6 py-3 text-[.86rem] font-bold text-navy transition-transform hover:-translate-y-0.5"
                >
                  Explorer l'annuaire&nbsp; ↗
                </Link>
                <BriefTrigger className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/28 px-6 py-3 text-[.86rem] font-bold text-white transition-colors hover:bg-white hover:text-navy">
                  Construire mon brief
                </BriefTrigger>
              </div>

              <div className="mt-12 grid max-w-[38rem] grid-cols-3 border-t border-white/16 pt-5 text-[.64rem] font-bold uppercase tracking-[.14em] text-white/58">
                <span>Comprendre</span>
                <span>Comparer</span>
                <span>Préparer</span>
              </div>
            </div>

            <div className="relative min-h-[30rem] px-5 pb-8 sm:px-8 lg:min-h-full lg:px-0 lg:pb-0 lg:pt-12">
              <figure className="relative h-full min-h-[30rem] overflow-hidden rounded-t-[2rem] bg-paper lg:rounded-tl-[3rem]">
                <Image
                  src="/images/skoria-v2/editorial/accounting-flow.webp"
                  alt="Documents comptables organisés en étapes avec registre et calculatrice"
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 48vw"
                  className="object-cover"
                />
                <div
                  aria-hidden
                  className="absolute inset-0 bg-gradient-to-t from-navy/45 via-transparent to-transparent"
                />
                <figcaption className="absolute bottom-5 left-5 rounded-full bg-white/90 px-4 py-2 text-[.66rem] font-semibold text-navy backdrop-blur-sm">
                  Illustration éditoriale générée par IA
                </figcaption>
              </figure>
              <div className="absolute right-8 top-8 flex h-28 w-28 rotate-6 items-center justify-center rounded-full bg-orange p-4 text-center text-[.7rem] font-bold uppercase leading-5 tracking-[.12em] text-navy lg:right-12 lg:top-16">
                Choisir avec méthode
              </div>
            </div>
          </div>
        </section>

        <section className="bg-paper px-5 py-20 sm:px-8 lg:py-28">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-10 lg:grid-cols-[.68fr_1fr] lg:gap-20">
              <div>
                <p className="text-[.66rem] font-bold uppercase tracking-[.2em] text-blue">
                  Notre mission
                </p>
                <h2 className="mt-5 max-w-[13ch] text-balance text-[clamp(2.7rem,5vw,4.8rem)] font-semibold leading-[.98] tracking-[-.05em] text-ink">
                  Rendre les critères de choix plus lisibles.
                </h2>
              </div>
              <div className="max-w-2xl self-end border-l-2 border-orange pl-6 text-[1.02rem] leading-8 text-ink-muted lg:pl-8">
                <p>
                  Skoria est une plateforme indépendante de comparaison et
                  d'information. Notre rôle consiste à organiser les besoins
                  métier, la localisation, le périmètre de mission, les
                  documents à préparer et les points de vigilance.
                </p>
                <p className="mt-5">
                  Skoria ne réalise pas de mission comptable, fiscale, sociale
                  ou juridique individualisée.
                </p>
              </div>
            </div>

            <div className="mt-16 grid gap-px overflow-hidden rounded-[1.6rem] bg-border lg:grid-cols-3">
              {missionPillars.map((pillar, index) => (
                <article
                  key={pillar.number}
                  className={`flex min-h-[21rem] flex-col p-7 sm:p-9 ${
                    index === 0
                      ? "bg-white"
                      : index === 1
                        ? "bg-lilac"
                        : "bg-mint"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[.7rem] font-bold text-blue">
                      {pillar.number}
                    </span>
                    <span className="rounded-full border border-ink/12 px-3 py-1.5 text-[.62rem] font-bold uppercase tracking-[.14em] text-ink-muted">
                      {pillar.label}
                    </span>
                  </div>
                  <h3 className="mt-auto max-w-[14ch] text-[1.6rem] font-semibold leading-[1.05] text-ink">
                    {pillar.title}
                  </h3>
                  <p className="mt-4 text-[.9rem] leading-7 text-ink-muted">
                    {pillar.body}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-blue px-5 py-20 text-white sm:px-8 lg:py-28">
          <div className="mx-auto grid max-w-7xl gap-14 lg:grid-cols-[.8fr_1.2fr] lg:gap-24">
            <div className="lg:sticky lg:top-32 lg:self-start">
              <p className="text-[.66rem] font-bold uppercase tracking-[.2em] text-white/65">
                Notre méthode
              </p>
              <h2 className="mt-5 max-w-[12ch] text-balance text-[clamp(2.7rem,5vw,4.8rem)] font-semibold leading-[.98] tracking-[-.05em]">
                Une comparaison se prépare étape par étape.
              </h2>
              <p className="mt-6 max-w-lg text-[.98rem] leading-8 text-white/72">
                Les guides Skoria donnent une structure commune aux questions,
                sans transformer une information générale en conseil
                individualisé.
              </p>
            </div>

            <ol className="space-y-4">
              {methodSteps.map((step, index) => (
                <li
                  key={step.title}
                  className="rounded-[1.4rem] bg-white p-7 text-ink sm:p-9"
                >
                  <div className="grid gap-7 sm:grid-cols-[5rem_1fr]">
                    <span className="font-mono text-[2.6rem] font-medium leading-none text-orange">
                      0{index + 1}
                    </span>
                    <div>
                      <p className="text-[.62rem] font-bold uppercase tracking-[.16em] text-blue">
                        {step.detail}
                      </p>
                      <h3 className="mt-3 text-[1.6rem] font-semibold leading-tight">
                        {step.title}
                      </h3>
                      <p className="mt-4 text-[.92rem] leading-7 text-ink-muted">
                        {step.body}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="bg-white px-5 py-20 sm:px-8 lg:py-28">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-8 lg:grid-cols-[1fr_.75fr] lg:items-end">
              <div>
                <p className="text-[.66rem] font-bold uppercase tracking-[.2em] text-blue">
                  Sources et transparence
                </p>
                <h2 className="mt-5 max-w-[15ch] text-balance text-[clamp(2.7rem,5vw,4.8rem)] font-semibold leading-[.98] tracking-[-.05em] text-ink">
                  Dire d'où vient l'information et ce qu'elle permet de
                  conclure.
                </h2>
              </div>
              <p className="max-w-xl border-t border-ink/15 pt-5 text-[.96rem] leading-8 text-ink-muted">
                Les pages distinguent autant que possible les faits
                administratifs, les contenus éditoriaux et les éléments à
                confirmer directement auprès du professionnel concerné.
              </p>
            </div>

            <div className="mt-14 grid gap-5 lg:grid-cols-3">
              {sourceLayers.map((layer) => (
                <article
                  key={layer.label}
                  className={`min-h-[19rem] rounded-[1.4rem] p-7 sm:p-8 ${layer.tone}`}
                >
                  <p className="text-[.64rem] font-bold uppercase tracking-[.18em] text-blue">
                    {layer.label}
                  </p>
                  <h3 className="mt-20 text-[1.55rem] font-semibold leading-tight text-ink">
                    {layer.title}
                  </h3>
                  <p className="mt-4 text-[.9rem] leading-7 text-ink-muted">
                    {layer.body}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-apricot px-5 py-20 sm:px-8 lg:py-28">
          <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[.76fr_1.24fr] lg:gap-20">
            <div>
              <p className="text-[.66rem] font-bold uppercase tracking-[.2em] text-blue">
                Notre cadre
              </p>
              <h2 className="mt-5 max-w-[12ch] text-balance text-[clamp(2.7rem,5vw,4.8rem)] font-semibold leading-[.98] tracking-[-.05em] text-ink">
                Comparer ne signifie pas recommander.
              </h2>
              <p className="mt-6 max-w-md text-[.96rem] leading-8 text-ink-muted">
                La valeur de Skoria tient aussi à la clarté de ses limites.
              </p>
            </div>

            <div className="overflow-hidden rounded-[1.5rem] bg-navy px-6 text-white sm:px-9">
              {limits.map((limit, index) => (
                <div
                  key={limit}
                  className="grid gap-4 border-b border-white/12 py-7 last:border-0 sm:grid-cols-[3rem_1fr]"
                >
                  <span className="font-mono text-[.68rem] font-bold text-orange">
                    0{index + 1}
                  </span>
                  <p className="text-[.9rem] leading-7 text-white/76">
                    {limit}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-mint px-5 py-20 sm:px-8 lg:py-24">
          <div className="mx-auto grid max-w-7xl gap-12 rounded-[1.8rem] border border-ink/10 bg-white p-7 sm:p-10 lg:grid-cols-[1fr_.9fr] lg:items-center lg:p-14">
            <div>
              <p className="text-[.66rem] font-bold uppercase tracking-[.2em] text-blue">
                Correction des données
              </p>
              <h2 className="mt-5 max-w-[14ch] text-balance text-[clamp(2.4rem,4.6vw,4rem)] font-semibold leading-[1] tracking-[-.045em] text-ink">
                Une information inexacte peut être signalée.
              </h2>
              <p className="mt-6 max-w-xl text-[.96rem] leading-8 text-ink-muted">
                Une entreprise, un professionnel ou un utilisateur peut demander
                la correction, la mise à jour ou le retrait d'une information
                inexacte.
              </p>
              <Link
                href="/contact"
                className="mt-8 inline-flex min-h-12 items-center justify-center rounded-full bg-orange px-6 py-3 text-[.84rem] font-bold text-navy transition-transform hover:-translate-y-0.5"
              >
                Signaler une information&nbsp; ↗
              </Link>
            </div>

            <div className="rounded-[1.2rem] bg-paper p-6 sm:p-8">
              <p className="text-[.64rem] font-bold uppercase tracking-[.17em] text-blue">
                Éléments vérifiables
              </p>
              <p className="mt-4 text-[1.15rem] font-semibold leading-7 text-ink">
                Chaque demande est examinée à partir d'éléments documentés.
              </p>
              <ul className="mt-6 grid gap-3 text-[.86rem] text-ink-muted sm:grid-cols-2">
                {[
                  "SIRET",
                  "Adresse",
                  "Source administrative",
                  "Justificatif public",
                  "Indication documentée de l'erreur",
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-center gap-3 border-t border-ink/10 pt-3"
                  >
                    <span
                      aria-hidden
                      className="h-2 w-2 flex-none rounded-full bg-orange"
                    />
                    {item}
                  </li>
                ))}
              </ul>
              <a
                href={`mailto:${legalEntity.emailContact}`}
                className="mt-7 inline-flex text-[.82rem] font-bold text-blue underline underline-offset-4"
              >
                {legalEntity.emailContact}
              </a>
            </div>
          </div>
        </section>

        <section className="bg-paper px-5 py-20 sm:px-8 lg:py-24">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-12 lg:grid-cols-[.62fr_1.38fr] lg:gap-20">
              <div>
                <p className="text-[.66rem] font-bold uppercase tracking-[.2em] text-blue">
                  L'éditeur
                </p>
                <h2 className="mt-5 text-[clamp(2.5rem,4.6vw,4.1rem)] font-semibold leading-[1] tracking-[-.045em] text-ink">
                  Skoria en clair.
                </h2>
                <p className="mt-6 text-[.9rem] leading-7 text-ink-muted">
                  Année de création de l'éditeur : {legalEntity.creationYear}.
                </p>
              </div>

              <dl className="border-t border-ink/20">
                {publisherFacts.map(([term, description]) => (
                  <div
                    key={term}
                    className="grid gap-2 border-b border-ink/12 py-5 sm:grid-cols-[10rem_1fr] sm:gap-8"
                  >
                    <dt className="text-[.64rem] font-bold uppercase tracking-[.15em] text-blue">
                      {term}
                    </dt>
                    <dd className="text-[.9rem] leading-6 text-ink-muted">
                      {description}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </section>

        <section className="bg-navy px-5 py-20 text-white sm:px-8 lg:py-24">
          <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1fr_.75fr] lg:items-end lg:gap-20">
            <div>
              <p className="text-[.66rem] font-bold uppercase tracking-[.2em] text-[#ffb293]">
                Votre prochaine étape
              </p>
              <h2 className="mt-5 max-w-[15ch] text-balance text-[clamp(2.7rem,5vw,4.8rem)] font-semibold leading-[.98] tracking-[-.05em]">
                Passez de l'information à une comparaison structurée.
              </h2>
            </div>
            <div>
              <p className="max-w-xl text-[.96rem] leading-8 text-white/70">
                Explorez les informations publiques de l'annuaire ou préparez un
                brief réutilisable pour poser les mêmes questions à plusieurs
                professionnels.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link
                  href="/annuaire/experts-comptables"
                  className="inline-flex min-h-12 items-center justify-center rounded-full bg-orange px-6 py-3 text-[.84rem] font-bold text-navy"
                >
                  Voir l'annuaire&nbsp; ↗
                </Link>
                <BriefTrigger className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/25 px-6 py-3 text-[.84rem] font-bold text-white hover:bg-white hover:text-navy">
                  Préparer mon brief
                </BriefTrigger>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
