import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { AppConfig } from "@/utils/AppConfig";
import { ToolCatalogJsonLd } from "@/components/simulateurs/hub/ToolCatalogJsonLd";
import { BriefTrigger } from "@/components/journey/BriefTrigger";
import { Icon } from "@/components/Icon";
import { SimulatorCatalog, type SimulatorCatalogItem } from "@/components/simulateurs/hub/SimulatorCatalog";
import { SIMULATEURS } from "./registry";

const HUB_TITLE = "Simulateurs et calculateurs pour entrepreneurs";
const HUB_H1 = "Des simulateurs pour chiffrer vos décisions.";
const HUB_DESCRIPTION = `Explorez ${SIMULATEURS.length} simulateurs gratuits : TVA, salaire, charges, TJM, statuts, LMNP et honoraires. Choisissez votre outil et calculez sans compte.`;
const HUB_URL = `${AppConfig.url.replace(/\/$/, "")}/simulateurs`;
const HUB_IMAGE = "/images/skoria-v2/editorial/objects.webp";
const HUB_IMAGE_ALT = "Boulier cobalt et documents dans une composition sculpturale";

export const metadata: Metadata = {
  title: HUB_TITLE,
  description: HUB_DESCRIPTION,
  alternates: { canonical: HUB_URL },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: HUB_URL,
    siteName: AppConfig.name,
    title: `${HUB_TITLE} | ${AppConfig.name}`,
    description: HUB_DESCRIPTION,
    images: [{ url: new URL(HUB_IMAGE, `${AppConfig.url.replace(/\/$/, "")}/`).href, alt: HUB_IMAGE_ALT }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${HUB_TITLE} | ${AppConfig.name}`,
    description: HUB_DESCRIPTION,
    images: [{ url: new URL(HUB_IMAGE, `${AppConfig.url.replace(/\/$/, "")}/`).href, alt: HUB_IMAGE_ALT }],
  },
};

// Présentation du hub : les montants et règles restent dans chaque outil.
const PRESENTATIONS: Record<string, { group: SimulatorCatalogItem["group"]; description: string; tags: string[] }> = {
  "calcul-tva": { group: "Fiscalité & TVA", description: "Passez du HT au TTC ou retrouvez le montant hors taxe. Visualisez séparément le prix et la TVA.", tags: ["HT / TTC", "Facturation"] },
  "frais-kilometriques": { group: "Fiscalité & TVA", description: "Estimez une indemnité à partir de la distance parcourue, du véhicule et de sa puissance fiscale.", tags: ["Déplacements", "Véhicule"] },
  "calcul-impot-societes": { group: "Fiscalité & TVA", description: "Estimez l’impôt sur les sociétés à partir du bénéfice et des conditions renseignées, avec le détail par tranche.", tags: ["IS", "Bénéfice"] },
  immobilier: { group: "Fiscalité & TVA", description: "Comparez les bases imposables d’une location meublée au micro-BIC et au réel selon vos loyers, charges et amortissements.", tags: ["LMNP", "Micro-BIC / réel"] },
  "cout-salarie": { group: "Équipe & rémunération", description: "Passez du salaire brut à une estimation du net et du coût employeur pour préparer un budget d’embauche.", tags: ["Embauche", "Brut / net"] },
  "jours-ouvres": { group: "Équipe & rémunération", description: "Comptez les jours ouvrés, ouvrables et calendaires entre deux dates selon les options du calendrier.", tags: ["Planning", "Calendrier"] },
  "rupture-conventionnelle": { group: "Équipe & rémunération", description: "Estimez le minimum légal à partir de l’ancienneté et du salaire de référence, puis identifiez les éléments à confirmer.", tags: ["Ancienneté", "Indemnité"] },
  "prime-fin-cdd": { group: "Équipe & rémunération", description: "Calculez une prime de fin de CDD et, le cas échéant, les congés payés associés aux montants renseignés.", tags: ["CDD", "Fin de contrat"] },
  "grille-salaire-expert-comptable": { group: "Équipe & rémunération", description: "Explorez les fourchettes de rémunération de la profession comptable par niveau d’expérience et zone géographique.", tags: ["Salaires", "Cabinet comptable"] },
  charges: { group: "Créer & piloter", description: "Estimez les cotisations et le revenu net avant impôt à partir de votre statut, de votre activité et de vos revenus.", tags: ["Cotisations", "Indépendant"] },
  statuts: { group: "Créer & piloter", description: "Explorez des scénarios micro-entreprise, entreprise individuelle et SASU à partir de votre activité, de votre chiffre d’affaires et de vos frais.", tags: ["Micro / EI / SASU", "Création"] },
  tjm: { group: "Créer & piloter", description: "Partez de votre objectif de revenu, de vos frais et de vos jours facturables pour estimer un taux journalier.", tags: ["Freelance", "Tarif journalier"] },
  "capital-social": { group: "Créer & piloter", description: "Visualisez les parts et pourcentages de chaque associé à partir de leurs apports, avec des repères de répartition.", tags: ["Associés", "Apports"] },
  honoraires: { group: "Créer & piloter", description: "Obtenez une fourchette mensuelle indicative pour votre budget comptable, puis comparez le détail des missions proposées.", tags: ["Budget comptable", "Devis"] },
};

const QUICK_TOOLS = [
  { slug: "calcul-tva", title: "Passer du HT au TTC", label: "Calculatrice de TVA", icon: "calculator" },
  { slug: "tjm", title: "Estimer mon tarif journalier", label: "TJM freelance", icon: "trending-up" },
  { slug: "cout-salarie", title: "Budgéter une embauche", label: "Coût employeur", icon: "users" },
];

const JOURNEYS = [
  {
    title: "Je lance mon activité.",
    body: "Mettez en regard les statuts, votre revenu et le budget du suivi comptable. Gardez les mêmes hypothèses d’activité entre les calculs.",
    tone: "bg-mint", icon: "lightbulb",
    tools: [
      { slug: "statuts", label: "Comparer les statuts", detail: "Le cadre" },
      { slug: "charges", label: "Estimer mes cotisations", detail: "Le revenu" },
      { slug: "honoraires", label: "Prévoir le budget comptable", detail: "Le suivi" },
    ],
  },
  {
    title: "Je prépare un recrutement.",
    body: "Commencez par le coût du salaire, vérifiez le calendrier et explorez les éléments d’une fin de CDD si ce contrat correspond à votre projet.",
    tone: "bg-lilac", icon: "users",
    tools: [
      { slug: "cout-salarie", label: "Estimer le coût employeur", detail: "Le budget" },
      { slug: "jours-ouvres", label: "Compter les jours ouvrés", detail: "Le planning" },
      { slug: "prime-fin-cdd", label: "Chiffrer la prime de CDD", detail: "La fin du contrat" },
    ],
  },
  {
    title: "Je prépare mes tarifs.",
    body: "Reliez votre objectif de revenu au temps réellement facturable, puis distinguez le prix de votre prestation et la TVA correspondante.",
    tone: "bg-apricot", icon: "trending-up",
    tools: [
      { slug: "tjm", label: "Construire mon TJM", detail: "L’objectif" },
      { slug: "jours-ouvres", label: "Poser mon calendrier", detail: "Le temps disponible" },
      { slug: "calcul-tva", label: "Convertir le HT et le TTC", detail: "La facture" },
    ],
  },
];

const FAQS = [
  {
    question: "Quel simulateur choisir pour commencer ?",
    answer: "Partez du résultat que vous cherchez : un montant de TVA, un coût d’embauche, un revenu net, un tarif journalier ou un budget comptable. Le catalogue permet de filtrer les outils par famille et de rechercher un besoin. Les parcours regroupent ensuite plusieurs calculs utiles pour une même situation.",
  },
  {
    question: "Les simulateurs sont-ils gratuits et sans compte ?",
    answer: "Oui. Les outils du catalogue sont accessibles gratuitement, sans créer de compte ni renseigner d’adresse e-mail pour afficher le résultat. Vous pouvez modifier les données et recommencer le calcul directement sur la page de l’outil.",
  },
  {
    question: "Les données de mes calculs sont-elles transmises ?",
    answer: "Les valeurs saisies dans les calculateurs sont traitées dans votre navigateur pour afficher le résultat. Faire une simulation n’envoie pas de demande à un cabinet. Si vous décidez ensuite de contacter un professionnel, vous choisissez les informations que vous lui communiquez.",
  },
  {
    question: "Une estimation peut-elle servir de devis ou de résultat définitif ?",
    answer: "Une estimation décrit le scénario renseigné et les hypothèses prévues par l’outil. La fourchette d’honoraires, par exemple, sert à préparer un budget ; elle ne constitue pas un devis. Pour une décision, faites confirmer le périmètre, la période et les éléments propres à votre dossier.",
  },
  {
    question: "Comment comparer plusieurs scénarios sans fausser le résultat ?",
    answer: "Gardez une même période et une même convention de montant : annuel ou mensuel, HT ou TTC, brut ou net. Notez les données du premier scénario, puis changez une variable à la fois. Un écart devient plus facile à interpréter lorsque vous savez précisément quelle hypothèse a changé.",
  },
  {
    question: "Que préparer après une simulation ?",
    answer: "Conservez le nom de l’outil, la période, les valeurs saisies et le résultat obtenu. Ajoutez les points encore incertains : dépenses absentes, volume d’activité, calendrier, options ou périmètre d’accompagnement. Vous pouvez reprendre ces éléments dans votre brief avant le premier échange.",
  },
];

export default function SimulateursPage() {
  const items: SimulatorCatalogItem[] = SIMULATEURS.map((simulator) => ({
    slug: simulator.slug,
    title: simulator.title,
    eyebrow: simulator.eyebrow,
    group: PRESENTATIONS[simulator.slug]?.group ?? "Créer & piloter",
    description: PRESENTATIONS[simulator.slug]?.description ?? simulator.metaDescription,
    tags: PRESENTATIONS[simulator.slug]?.tags,
  }));
  const breadcrumbs = [{ name: "Accueil", url: "/" }, { name: "Simulateurs", url: "/simulateurs" }];

  return (
    <>
      <ToolCatalogJsonLd
        name={HUB_H1}
        description={HUB_DESCRIPTION}
        image={HUB_IMAGE}
        items={items.map((item) => ({ name: item.title, url: `/simulateurs/${item.slug}` }))}
        breadcrumbs={breadcrumbs}
        faqs={FAQS}
      />

      <section className="relative overflow-hidden bg-navy px-5 pb-12 pt-8 text-white sm:px-8 lg:px-14 lg:pb-16 lg:pt-10 xl:px-20">
        <div className="mx-auto max-w-[80rem]">
          <nav aria-label="Fil d’Ariane" className="mb-10 text-[.72rem] text-white/60">
            <ol className="flex items-center gap-2">
              <li><Link href="/" className="hover:text-white hover:underline">Accueil</Link></li>
              <li aria-hidden>·</li>
              <li aria-current="page">Simulateurs</li>
            </ol>
          </nav>
          <div className="grid gap-10 lg:grid-cols-[1.05fr_.95fr] lg:items-center lg:gap-14">
            <div>
              <p className="sk-eyebrow mb-6 text-accent-300">Simulateurs & calculateurs</p>
              <h1 className="max-w-[12ch] text-balance text-[clamp(3.3rem,6.7vw,6.2rem)] font-semibold leading-[.97] tracking-[-.05em]">
                {HUB_H1}
              </h1>
              <p className="mt-7 max-w-xl text-[1.05rem] leading-8 text-white/72">
                Un tarif à fixer, une embauche à budgéter, un statut à comparer. Choisissez un outil, ajustez vos hypothèses et voyez ce qu’elles changent.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <a href="#catalogue" className="inline-flex min-h-13 items-center justify-center gap-4 rounded-full bg-orange px-6 py-3 text-[.87rem] font-bold text-navy transition-transform hover:-translate-y-0.5">
                  Trouver mon simulateur <span aria-hidden>↗</span>
                </a>
                <a href="#parcours" className="inline-flex min-h-13 items-center justify-center rounded-full border border-white/25 px-6 py-3 text-[.85rem] font-semibold text-white transition-colors hover:bg-white hover:text-navy">
                  Partir de mon projet
                </a>
              </div>
              <div className="mt-9 flex flex-wrap gap-x-5 gap-y-3 border-t border-white/15 pt-5 text-[.72rem] text-white/65">
                <span><strong className="text-white">{SIMULATEURS.length}</strong> outils disponibles</span>
                <span>Gratuits & sans compte</span>
                <span>Hypothèses modifiables</span>
              </div>
            </div>

            <div className="overflow-hidden rounded-[1.5rem_5rem_1.5rem_1.5rem] bg-lilac text-navy">
              <figure className="relative h-[17rem] sm:h-[20rem]">
                <Image src={HUB_IMAGE} alt={HUB_IMAGE_ALT} fill priority sizes="(min-width: 1024px) 44vw, 100vw" className="object-cover" style={{ objectPosition: "50% 57%" }} />
                <figcaption className="absolute bottom-3 left-4 rounded-full bg-white/85 px-3 py-1.5 text-[.6rem] text-navy backdrop-blur-sm">Illustration générée par IA.</figcaption>
              </figure>
              <div className="p-5 sm:p-7">
                <p className="sk-eyebrow mb-4 text-blue">Un calcul en tête ?</p>
                <div className="space-y-2">
                  {QUICK_TOOLS.map((tool) => (
                    <Link key={tool.slug} href={`/simulateurs/${tool.slug}`} className="group flex items-center gap-3 rounded-xl bg-white px-4 py-3 transition-colors hover:bg-navy hover:text-white">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-lilac text-blue"><Icon name={tool.icon} size={20} aria-hidden /></span>
                      <span className="min-w-0 flex-1"><span className="block text-[.84rem] font-bold leading-5">{tool.title}</span><span className="mt-0.5 block text-[.68rem] opacity-60">{tool.label}</span></span>
                      <span aria-hidden className="transition-transform group-hover:translate-x-1">↗</span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <nav aria-label="Parcours des simulateurs" className="sticky top-[var(--site-header-height)] z-20 border-b border-ink/10 bg-paper/95 px-5 backdrop-blur sm:px-8 lg:px-14 xl:px-20">
        <div className="mx-auto flex max-w-[80rem] gap-7 overflow-x-auto py-4 text-[.73rem] font-semibold text-ink-muted">
          <a href="#catalogue" className="whitespace-nowrap hover:text-blue">01 · Les simulateurs</a>
          <a href="#parcours" className="whitespace-nowrap hover:text-blue">02 · Votre projet</a>
          <a href="#bien-simuler" className="whitespace-nowrap hover:text-blue">03 · Lire un résultat</a>
          <a href="#questions" className="whitespace-nowrap hover:text-blue">04 · Questions fréquentes</a>
        </div>
      </nav>

      <SimulatorCatalog items={items} />

      <section id="parcours" aria-labelledby="parcours-title" className="bg-navy px-5 py-16 text-white sm:px-8 lg:px-14 lg:py-24 xl:px-20">
        <div className="mx-auto max-w-[80rem]">
          <div className="grid gap-7 lg:grid-cols-[1fr_.6fr] lg:items-end">
            <div>
              <p className="sk-eyebrow mb-5 text-accent-300">Plusieurs calculs, un même projet</p>
              <h2 id="parcours-title" className="max-w-[18ch] text-balance text-[clamp(2.3rem,4.6vw,4.1rem)] font-semibold leading-[1.03] tracking-[-.045em]">Trouvez le fil entre vos questions.</h2>
            </div>
            <p className="max-w-lg text-[.95rem] leading-7 text-white/65">Une décision peut demander plusieurs éclairages. Ces parcours relient les outils dans un ordre de lecture, à adapter à votre situation.</p>
          </div>
          <div className="mt-12 grid gap-4 lg:grid-cols-3">
            {JOURNEYS.map((journey, index) => (
              <article key={journey.title} className={`flex flex-col rounded-[1.5rem] p-6 text-navy sm:p-8 ${journey.tone}`}>
                <div className="flex items-center justify-between"><Icon name={journey.icon} size={28} aria-hidden /><span className="font-mono text-[.65rem] opacity-50">PARCOURS 0{index + 1}</span></div>
                <h3 className="mt-9 max-w-[14ch] text-[1.9rem] font-semibold leading-[1.06] tracking-[-.035em]">{journey.title}</h3>
                <p className="mb-8 mt-4 text-[.84rem] leading-7 text-ink-muted">{journey.body}</p>
                <ol className="mt-auto border-t border-ink/15">
                  {journey.tools.map((tool, toolIndex) => (
                    <li key={tool.slug} className="border-b border-ink/15 last:border-b-0">
                      <Link href={`/simulateurs/${tool.slug}`} className="group flex items-center gap-3 py-5 hover:text-blue">
                        <span className="font-mono text-[.62rem] text-blue">0{toolIndex + 1}</span>
                        <span className="flex-1"><span className="block text-[.61rem] uppercase tracking-wider opacity-55">{tool.detail}</span><span className="mt-1 block text-[.8rem] font-bold">{tool.label}</span></span>
                        <span aria-hidden className="transition-transform group-hover:translate-x-1">↗</span>
                      </Link>
                    </li>
                  ))}
                </ol>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="bien-simuler" aria-labelledby="methode-title" className="bg-apricot px-5 py-16 sm:px-8 lg:px-14 lg:py-24 xl:px-20">
        <div className="mx-auto grid max-w-[80rem] gap-12 lg:grid-cols-[.9fr_1.1fr] lg:gap-20">
          <div>
            <p className="sk-eyebrow mb-5 text-blue">Donner du sens au résultat</p>
            <h2 id="methode-title" className="max-w-[17ch] text-balance text-[clamp(2.3rem,4.6vw,4.1rem)] font-semibold leading-[1.03] tracking-[-.045em] text-navy">Un chiffre devient utile avec son contexte.</h2>
            <p className="mt-6 max-w-xl text-[.96rem] leading-8 text-ink-muted">Une estimation aide à situer un ordre de grandeur et à repérer les informations manquantes. Sa précision dépend des données saisies, de la période et du périmètre retenu.</p>
            <div className="mt-9 rounded-[1.2rem] bg-navy p-6 text-white sm:p-7">
              <p className="sk-eyebrow text-accent-300">À conserver avec votre calcul</p>
              <ul className="mt-5 grid grid-cols-2 gap-x-5 gap-y-4 text-[.79rem]">
                {["La période", "Les montants saisis", "Les options retenues", "Le résultat obtenu"].map((label) => <li key={label} className="flex gap-2"><span aria-hidden className="text-orange">↳</span>{label}</li>)}
              </ul>
            </div>
          </div>
          <ol className="divide-y divide-ink/15 border-y border-ink/15">
            {[
              ["Cadrez la même période.", "Un chiffre d’affaires annuel, un salaire mensuel et un nombre de jours facturés ne se comparent pas directement. Vérifiez les unités demandées et distinguez HT, TTC, brut et net avant de saisir vos montants."],
              ["Faites varier une donnée à la fois.", "Partez d’un scénario de référence, puis changez un volume, une dépense ou une option. L’écart obtenu devient lisible. Gardez aussi une hypothèse plus prudente pour examiner la sensibilité de votre projet."],
              ["Relisez les hypothèses et les limites.", "Un formulaire court ne décrit pas toute votre situation. Consultez les explications du calcul et les sources proposées sur la page. Une option, une convention collective ou une dépense absente peut changer l’analyse."],
              ["Préparez les questions qui restent.", "Le résultat donne une base de discussion. Notez les données encore incertaines et les points à faire confirmer. Pour des honoraires, comparez les missions, les livrables et les exclusions des propositions reçues."],
            ].map(([title, body], index) => (
              <li key={title} className="grid grid-cols-[2rem_1fr] gap-4 py-7 sm:grid-cols-[3rem_1fr]">
                <span className="pt-1 font-mono text-[.69rem] font-bold text-blue">0{index + 1}</span>
                <div><h3 className="text-[1.35rem] font-semibold leading-tight text-navy">{title}</h3><p className="mt-3 text-[.88rem] leading-7 text-ink-muted">{body}</p></div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section id="questions" aria-labelledby="questions-title" className="bg-paper px-5 py-16 sm:px-8 lg:px-14 lg:py-24 xl:px-20">
        <div className="mx-auto grid max-w-[80rem] gap-10 lg:grid-cols-[.7fr_1.3fr] lg:gap-20">
          <div>
            <p className="sk-eyebrow mb-5 text-blue">Questions fréquentes</p>
            <h2 id="questions-title" className="max-w-[15ch] text-balance text-[clamp(2.3rem,4vw,3.8rem)] font-semibold leading-[1.04] tracking-[-.04em] text-navy">Bien utiliser les simulateurs Skoria.</h2>
            <p className="mt-6 max-w-md text-[.93rem] leading-7 text-ink-muted">Du choix de l’outil à la lecture du résultat, les repères pour préparer une comparaison utile.</p>
          </div>
          <div className="space-y-3">
            {FAQS.map((faq, index) => (
              <details key={faq.question} className="group rounded-[1.2rem] border border-ink/10 bg-white open:bg-lilac">
                <summary className="flex min-h-20 list-none items-center gap-4 px-5 py-5 [&::-webkit-details-marker]:hidden sm:px-6">
                  <span className="shrink-0 font-mono text-[.62rem] text-blue">0{index + 1}</span>
                  <span className="flex-1 text-[.97rem] font-semibold leading-6 text-navy">{faq.question}</span>
                  <span aria-hidden className="text-2xl text-blue transition-transform group-open:rotate-45">+</span>
                </summary>
                <p className="px-5 pb-6 text-[.9rem] leading-7 text-ink-muted sm:pl-[3.7rem] sm:pr-8">{faq.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-mint px-5 py-12 sm:px-8 lg:px-14 lg:py-16 xl:px-20">
        <div className="mx-auto grid max-w-[80rem] gap-8 rounded-[1.75rem] bg-blue px-6 py-10 text-white sm:px-10 lg:grid-cols-[1fr_.55fr] lg:items-center lg:px-12 lg:py-14">
          <div>
            <p className="sk-eyebrow mb-5 text-white/65">Du calcul au premier échange</p>
            <h2 className="max-w-[20ch] text-balance text-[clamp(2.15rem,4vw,3.8rem)] font-semibold leading-[1.03] tracking-[-.04em]">Votre scénario est posé. Préparez la suite.</h2>
            <p className="mt-5 max-w-2xl text-[.93rem] leading-7 text-white/75">Rassemblez vos hypothèses et vos questions dans un brief, puis utilisez la même base pour échanger avec les professionnels de votre choix.</p>
          </div>
          <div className="flex flex-col items-start gap-4 lg:items-end">
            <BriefTrigger prefill={{ need: "Préparer un calcul et les questions associées" }} className="inline-flex min-h-13 items-center justify-center gap-4 rounded-full bg-orange px-7 py-4 text-[.88rem] font-bold text-navy transition-transform hover:-translate-y-0.5">Préparer mon brief <span aria-hidden>↗</span></BriefTrigger>
            <Link href="/annuaire/experts-comptables" className="inline-flex min-h-11 items-center gap-3 px-2 text-[.82rem] font-semibold text-white/85 underline-offset-4 hover:underline">Explorer l’annuaire <span aria-hidden>→</span></Link>
          </div>
        </div>
      </section>
    </>
  );
}
