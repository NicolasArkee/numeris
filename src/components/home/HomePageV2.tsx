import Image from "next/image";
import Link from "next/link";
import type { DirectoryCity, FaqItem, Profession, Secteur, Service } from "@/libs/db";
import { HomeCitySearch } from "./HomeCitySearch";
import { HomeJourneyTabs } from "./HomeJourneyTabs";

interface HomePageV2Props {
  cities: DirectoryCity[];
  cabinetCount: number;
  services: Service[];
  professions: Profession[];
  sectors: Secteur[];
  faqItems: FaqItem[];
}

function SectionHeading({
  eyebrow,
  title,
  accent,
  copy,
  inverse = false,
}: {
  eyebrow: string;
  title: string;
  accent?: string;
  copy?: string;
  inverse?: boolean;
}) {
  return (
    <div className="mb-10 grid gap-7 lg:grid-cols-[1.1fr_.9fr] lg:items-end">
      <div>
        <p className={`text-[.66rem] font-bold uppercase tracking-[.2em] ${inverse ? "text-[#ffb293]" : "text-blue"}`}>
          {eyebrow}
        </p>
        <h2 className={`mt-4 text-balance font-display text-[clamp(2.35rem,5vw,4.2rem)] font-semibold leading-[1.02] tracking-[-.04em] ${inverse ? "text-white" : "text-ink"}`}>
          {title}{" "}
          {accent}
        </h2>
      </div>
      {copy && <p className={`max-w-xl text-[1rem] leading-8 ${inverse ? "text-white/70" : "text-ink-muted"}`}>{copy}</p>}
    </div>
  );
}

const PROFILE_CARDS = [
  {
    href: "/professions/medecins",
    image: "/images/skoria-v2/editorial/doctor.webp",
    alt: "Médecin préparant ses documents dans son cabinet",
    title: "Professionnels de santé",
    copy: "Installation, remplacement ou exercice établi : un échange centré sur votre pratique.",
    disclaimer: true,
  },
  {
    href: "/secteurs/restauration",
    image: "/images/skoria-v2/editorial/restaurant.webp",
    alt: "Restaurateur préparant son activité au comptoir",
    title: "Restaurateurs",
    copy: "Caisse, achats, équipe et suivi du restaurant : rendez le périmètre lisible.",
    disclaimer: true,
  },
  {
    href: "/professions/architectes",
    image: "/images/skoria-v2/editorial/atelier.webp",
    alt: "Architecte travaillant sur une maquette dans son atelier",
    title: "Indépendants",
    copy: "Clarifiez collecte, déclarations, outils et rendez-vous avant de comparer.",
    disclaimer: true,
  },
  {
    href: "/expertises/comptabilite",
    image: "/images/skoria-v2/editorial/accounting-flow.webp",
    alt: "Documents comptables organisés en étapes avec registre et calculatrice",
    title: "Dirigeants de TPE",
    copy: "Répartissez les tâches et choisissez une organisation qui suit votre développement.",
    disclaimer: false,
  },
] as const;

const RESOURCE_CARDS = [
  {
    href: "/expertises/comptabilite",
    tag: "Mission",
    title: "Que déléguer à son expert-comptable ?",
    copy: "Une lecture concrète des tâches, livrables et échanges à discuter avant de retenir un cabinet.",
  },
  {
    href: "/ressources/lmnp-expert-comptable",
    tag: "Dossier LMNP",
    title: "Préparer la comptabilité d’un bien meublé",
    copy: "Choisissez un chapitre selon votre étape, rassemblez les pièces et identifiez les questions à approfondir.",
  },
  {
    href: "/simulateurs",
    tag: "Outils",
    title: "Chiffrer avant de solliciter un devis",
    copy: "Utilisez des calculateurs pédagogiques, puis confrontez leurs hypothèses à votre situation réelle.",
  },
] as const;

export function HomePageV2({
  cities,
  cabinetCount,
  services,
  professions,
  sectors,
  faqItems,
}: HomePageV2Props) {
  const cityLinks = [...cities]
    .sort((a, b) => b.population - a.population)
    .slice(0, 5);
  const highlightedProfessions = [...professions]
    .sort((a, b) => b.volume - a.volume)
    .slice(0, 10);
  const coverageLabel = services.length > 0 && professions.length > 0 && sectors.length > 0
    ? `${services.length} familles de missions · ${professions.length} professions · ${sectors.length} secteurs`
    : "Des missions, plus de 100 professions et des secteurs variés";

  return (
    <>
      <section className="overflow-hidden bg-navy text-white">
        <div className="mx-auto grid max-w-[90rem] lg:min-h-[42rem] lg:grid-cols-[1.08fr_.92fr]">
          <div className="flex flex-col justify-center px-5 py-16 sm:px-8 lg:px-14 lg:py-24 xl:pl-20">
            <p className="text-[.68rem] font-bold uppercase tracking-[.2em] text-[#ffb293]">
              Un comparateur · votre activité au centre
            </p>
            <h1 className="mt-5 max-w-[48rem] text-balance font-display text-[clamp(3.45rem,7.4vw,6.4rem)] font-semibold leading-[.94] tracking-[-.055em]">
              Votre entreprise mérite le{" "}
              <span className="text-[#ffb293]">bon interlocuteur.</span>
            </h1>
            <p className="mt-7 max-w-[40rem] text-[1.05rem] leading-8 text-white/76 lg:text-[1.17rem]">
              Trouvez l’expert-comptable adapté à votre métier. Comparez les missions, explorez les cabinets et préparez un premier échange qui fait avancer votre projet.
            </p>
            <div className="mt-8">
              <HomeCitySearch cities={cities} />
            </div>
            <button
              type="button"
              data-open-brief
              className="mt-4 w-fit rounded-full border border-white/25 px-5 py-3 text-[.8rem] font-bold text-white transition-colors hover:border-white hover:bg-white hover:text-navy"
            >
              Je précise d’abord mon besoin
            </button>
          </div>

          <figure className="relative min-h-[32rem] overflow-hidden lg:min-h-full">
            <Image
              src="/images/skoria-v2/editorial/workspace.webp"
              alt="Bureau avec ordinateur et documents de travail"
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 46vw"
              className="object-cover"
            />
            <div className="absolute inset-x-5 bottom-5 rounded-[1.2rem] bg-white p-6 text-ink shadow-2xl sm:inset-x-8 sm:bottom-8 lg:p-7">
              <p className="text-[.62rem] font-bold uppercase tracking-[.18em] text-blue">Votre premier échange, mieux préparé</p>
              <p className="mt-3 text-[1.45rem] font-semibold leading-tight">
                Vous gardez la main sur le choix du cabinet.
              </p>
              <div className="mt-5 flex gap-1.5" aria-hidden>
                <span className="h-1 flex-1 rounded-full bg-blue" />
                <span className="h-1 flex-1 rounded-full bg-ink/12" />
                <span className="h-1 flex-1 rounded-full bg-ink/12" />
              </div>
              <button
                type="button"
                data-open-brief
                className="mt-5 inline-flex rounded-full bg-blue px-5 py-3 text-[.78rem] font-bold text-white"
              >
                Construire mon brief&nbsp; ↗
              </button>
            </div>
          </figure>
        </div>
      </section>

      <section className="bg-apricot px-5 py-7 sm:px-8">
        <div className="mx-auto grid max-w-7xl gap-5 sm:grid-cols-3">
          {[
            ["Une consultation libre", "Explorez les fiches sans créer de compte."],
            ["Des sources identifiables", "L’information disponible et son statut restent visibles."],
            ["Un choix qui vous appartient", "Vous échangez directement avec les cabinets retenus."],
          ].map(([title, copy]) => (
            <div key={title} className="border-l border-ink/18 pl-4 first:border-l-0 first:pl-0">
              <strong className="text-[.86rem] text-ink">{title}</strong>
              <p className="mt-1 text-[.78rem] leading-5 text-ink-muted">{copy}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-paper px-5 py-16 sm:px-8 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <SectionHeading
            eyebrow="À chaque activité, ses questions"
            title="Le même métier ?"
            accent="Pas toujours les mêmes besoins."
            copy="Votre organisation, votre situation et vos outils comptent autant que le nom de votre profession. Commencez par le parcours qui vous ressemble, puis précisez les missions à comparer."
          />
          <div className="grid border-l border-t border-ink/14 sm:grid-cols-2 xl:grid-cols-4">
            {PROFILE_CARDS.map((card, index) => (
              <Link
                key={card.href}
                href={card.href}
                className="group border-b border-r border-ink/14 bg-white transition-colors hover:bg-lilac"
              >
                <figure className="relative aspect-[4/3] overflow-hidden">
                  <Image
                    src={card.image}
                    alt={card.alt}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 25vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.025]"
                  />
                </figure>
                <div className="p-6">
                  <span className="font-serif text-[2.5rem] leading-none text-blue">0{index + 1}</span>
                  <h3 className="mt-4 text-[1.28rem] font-semibold leading-tight text-ink">{card.title}&nbsp; ↗</h3>
                  <p className="mt-3 text-[.83rem] leading-6 text-ink-muted">{card.copy}</p>
                  {card.disclaimer && (
                    <p className="mt-4 text-[.62rem] leading-5 text-ink-soft">Illustration générée par IA, personne fictive.</p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-lilac px-5 py-16 sm:px-8 lg:py-24">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[.86fr_1.14fr] lg:items-center">
          <div>
            <p className="text-[.66rem] font-bold uppercase tracking-[.2em] text-blue">Votre situation change le parcours</p>
            <h2 className="mt-4 text-balance font-display text-[clamp(2.45rem,5vw,4.4rem)] font-semibold leading-[1.01] tracking-[-.045em] text-ink">
              Choisissez votre point de départ.
            </h2>
            <p className="mt-6 max-w-xl text-[1rem] leading-8 text-ink-muted">
              Un premier cabinet, un changement d’interlocuteur ou une mission ciblée ne se préparent pas de la même manière. Ces repères organisent votre recherche sans réduire votre choix à un prix d’appel.
            </p>
          </div>
          <HomeJourneyTabs />
        </div>
      </section>

      <section className="bg-navy px-5 py-16 text-white sm:px-8 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <SectionHeading
            eyebrow="Ce que vous comparez vraiment"
            title="Une mission se définit"
            accent="dans les détails."
            copy="Les intitulés se ressemblent. Le contenu et l’organisation varient. Posez les mêmes questions à chaque cabinet pour rapprocher des propositions comparables."
            inverse
          />
          <div className="border-t border-white/20">
            {[
              ["La comptabilité au quotidien", "Qui transmet les pièces et selon quel rythme ? Comment les opérations sont-elles rapprochées des justificatifs ? Précisez les tâches réalisées par le cabinet, les vérifications attendues de votre part et les outils qui simplifient les échanges."],
              ["Les documents et les échéances", "Demandez quels livrables correspondent à votre situation, comment ils vous sont présentés et quelles prestations donnent lieu à un chiffrage séparé. Un bilan ou une déclaration ne résume pas toujours tout le travail nécessaire."],
              ["Le suivi et l’interlocuteur", "Décrivez les moments où vous avez besoin d’un échange : recrutement, investissement, changement d’organisation ou lecture des résultats. Comparez les rendez-vous prévus et le traitement des questions ponctuelles."],
            ].map(([title, copy], index) => (
              <div key={title} className="grid gap-5 border-b border-white/20 py-8 md:grid-cols-[5rem_.75fr_1.25fr] md:gap-10">
                <span className="font-serif text-[3.5rem] leading-none text-[#ffb293]">0{index + 1}</span>
                <h3 className="text-[1.45rem] font-semibold leading-tight text-white">{title}</h3>
                <p className="text-[.94rem] leading-7 text-white/68">{copy}</p>
              </div>
            ))}
          </div>
          <Link href="/expertises" className="mt-8 inline-flex rounded-full bg-orange px-6 py-3 text-[.84rem] font-bold text-navy">
            Explorer les missions&nbsp; ↗
          </Link>
        </div>
      </section>

      <section className="bg-white px-5 py-16 sm:px-8 lg:py-24">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1.05fr_.95fr] lg:gap-20">
          <div>
            <p className="text-[.66rem] font-bold uppercase tracking-[.2em] text-blue">Un cabinet proche, ou à distance</p>
            <h2 className="mt-4 text-balance font-display text-[clamp(2.5rem,5vw,4.4rem)] font-semibold leading-[1.02] tracking-[-.04em] text-ink">
              La ville ouvre la recherche. Vos critères font le choix.
            </h2>
            <p className="mt-6 max-w-xl text-[1rem] leading-8 text-ink-muted">
              L’annuaire identifie des établissements et expose leurs informations publiques. Une adresse locale facilite certains échanges, mais elle ne décrit pas à elle seule la disponibilité, l’expérience métier ou la façon de travailler.
            </p>
            <Link href="/annuaire/experts-comptables" className="mt-7 inline-flex border-b border-ink pb-1 text-[.86rem] font-bold text-ink">
              Explorer l’annuaire national&nbsp; ↗
            </Link>
          </div>
          <div className="border-t border-ink/18">
            {cityLinks.map((city) => (
              <Link
                key={city.code_insee}
                href={`/expert-comptable/${city.slug}`}
                className="group flex items-center justify-between gap-5 border-b border-ink/18 py-5"
              >
                <strong className="text-[1.25rem] font-medium text-ink group-hover:text-blue">{city.name}</strong>
                <span className="text-right text-[.72rem] leading-5 text-ink-muted">
                  {city.department_name ?? city.department_code}<br />Explorer les établissements ↗
                </span>
              </Link>
            ))}
            <p className="mt-5 text-[.72rem] leading-6 text-ink-muted">
              Le statut de chaque fiche accompagne les coordonnées. La position dans la liste ne constitue pas une recommandation individuelle.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-apricot px-5 py-16 sm:px-8 lg:py-24">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-2 lg:gap-20">
          <div>
            <p className="text-[.66rem] font-bold uppercase tracking-[.2em] text-blue">Prix, outils, relation</p>
            <h2 className="mt-4 text-balance font-display text-[clamp(2.5rem,5vw,4.4rem)] font-semibold leading-[1.02] tracking-[-.04em] text-ink">
              Le bon devis se lit ligne par ligne.
            </h2>
          </div>
          <div className="space-y-5 text-[1rem] leading-8 text-ink-muted">
            <p>Le montant devient utile quand vous savez ce qu’il inclut. Repérez les travaux récurrents, les interventions ponctuelles, les hypothèses de volume et les conditions de révision.</p>
            <p>Demandez un exemple de calendrier et de livrables. Conservez la même grille pour confronter plusieurs propositions sans perdre les différences qui comptent.</p>
            <p>Notez enfin les accès aux outils, la disponibilité de l’interlocuteur et les modalités de sortie. Ces éléments influencent le travail quotidien et doivent rester lisibles au même titre que le chiffrage.</p>
            <button type="button" data-open-brief data-need="Comparer plusieurs devis" className="inline-flex rounded-full bg-blue px-6 py-3 text-[.84rem] font-bold text-white">
              Créer ma grille de discussion&nbsp; ↗
            </button>
          </div>
        </div>
      </section>

      <section className="bg-paper px-5 py-16 sm:px-8 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <SectionHeading eyebrow="Comprendre avant de décider" title="Des ressources" accent="qui prolongent votre réflexion." />
          <div className="grid gap-8 lg:grid-cols-3">
            {RESOURCE_CARDS.map((card) => (
              <article key={card.href} className="border-t-2 border-ink pt-6">
                <p className="text-[.65rem] font-bold uppercase tracking-[.18em] text-blue">{card.tag}</p>
                <h3 className="mt-4 text-[1.55rem] font-semibold leading-tight text-ink">{card.title}</h3>
                <p className="mt-4 text-[.92rem] leading-7 text-ink-muted">{card.copy}</p>
                <Link href={card.href} className="mt-6 inline-flex border-b border-ink pb-1 text-[.8rem] font-bold text-ink">Continuer&nbsp; ↗</Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-mint px-5 py-16 sm:px-8 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <SectionHeading
            eyebrow={coverageLabel}
            title="Entrez par votre métier,"
            accent="puis affinez la mission."
            copy="Les pages professionnelles expliquent les obligations et les situations à discuter. Les pages service détaillent le périmètre, les responsabilités et les livrables à comparer."
          />
          <div className="flex flex-wrap gap-2">
            {highlightedProfessions.map((profession) => (
              <Link key={profession.slug} href={`/professions/${profession.slug}`} className="rounded-full border border-ink/20 bg-white/55 px-4 py-2 text-[.8rem] text-ink hover:border-blue hover:text-blue">
                {profession.name}
              </Link>
            ))}
            <Link href="/professions" className="rounded-full bg-ink px-4 py-2 text-[.8rem] font-bold text-white">Toutes les professions&nbsp; ↗</Link>
          </div>
        </div>
      </section>

      <section className="bg-white px-5 py-16 sm:px-8 lg:py-24" id="questions">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[.72fr_1.28fr] lg:gap-20">
          <div>
            <p className="text-[.66rem] font-bold uppercase tracking-[.2em] text-blue">Questions fréquentes</p>
            <h2 className="mt-4 text-balance font-display text-[clamp(2.5rem,5vw,4.1rem)] font-semibold leading-[1.02] tracking-[-.04em] text-ink">
              Ce qu’il faut savoir avant de comparer.
            </h2>
            <p className="mt-5 text-[.88rem] leading-7 text-ink-muted">
              {cabinetCount > 0 ? `${cabinetCount.toLocaleString("fr-FR")} cabinets sont actuellement listables selon les règles de qualification de l’annuaire.` : "Les compteurs de l’annuaire sont recalculés depuis les données disponibles."}
            </p>
          </div>
          <div className="border-t border-ink/18">
            {faqItems.slice(0, 8).map((faq) => (
              <details key={`${faq.id}-${faq.question}`} className="group border-b border-ink/18 py-1">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-5 text-[1rem] font-semibold text-ink">
                  {faq.question}
                  <span aria-hidden className="text-xl font-light transition-transform group-open:rotate-45">+</span>
                </summary>
                <p className="max-w-2xl pb-6 text-[.92rem] leading-7 text-ink-muted">{faq.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-blue px-5 py-14 text-white sm:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-7 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-[.65rem] font-bold uppercase tracking-[.2em] text-white/65">Votre prochain pas</p>
            <h2 className="mt-3 max-w-3xl text-balance text-[clamp(2rem,4vw,3.45rem)] font-semibold leading-tight">
              Un brief clair pour des échanges plus utiles.
            </h2>
          </div>
          <button type="button" data-open-brief className="inline-flex min-h-12 shrink-0 items-center justify-center rounded-full bg-orange px-7 text-[.86rem] font-bold text-navy">
            Construire mon brief&nbsp; ↗
          </button>
        </div>
      </section>
    </>
  );
}
