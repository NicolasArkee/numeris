import Link from "next/link";
import { FaqAccordion } from "@/components/editorial/FaqAccordion";
import { DOCUMENTS, DOCS_WITH_SPECIMEN, type DocEntry } from "@/data/documents";

type Preparation = { context: string; items: [string, string][] };

const PREPARATIONS: Record<string, Preparation> = {
  facturation: {
    context: "Une pièce de facturation se lit avec l’opération qu’elle décrit. Préparez les informations commerciales déjà connues pour distinguer ce qui est confirmé de ce qui reste à préciser avec votre interlocuteur.",
    items: [
      ["L’opération concernée", "Le produit ou la prestation, son périmètre, les quantités et les échanges commerciaux qui l’expliquent."],
      ["Les parties et les dates", "Les coordonnées dont vous disposez, les références utiles et la période de réalisation prévue ou constatée."],
      ["Les montants à rapprocher", "Le prix convenu et les éléments déjà présents dans un devis, une commande, un acompte ou une facture antérieure."],
      ["Les points à confirmer", "Les informations manquantes, les différences entre pièces et les questions à poser avant d’utiliser votre document."],
    ],
  },
  creation: {
    context: "Un document de création s’inscrit dans un projet et un dossier plus large. Rassemblez vos choix déjà discutés, les versions reçues et les questions encore ouvertes pour préparer un échange concret sur la suite.",
    items: [
      ["Le projet", "L’activité envisagée, les personnes concernées et l’étape actuelle de votre démarche."],
      ["Les choix déjà discutés", "La répartition des rôles, les apports envisagés et les points sur lesquels les participants se sont déjà accordés."],
      ["Les pièces disponibles", "Les brouillons, messages, attestations ou références du dossier que vous possédez déjà."],
      ["Les décisions à éclaircir", "Les termes que vous ne comprenez pas, les informations manquantes et les choix à faire confirmer."],
    ],
  },
  "juridique-annuel": {
    context: "Pour comprendre une pièce de la vie juridique d’une société, commencez par retrouver la décision ou l’événement auquel elle se rapporte. Le contexte permet de poser des questions précises sur le document et son adaptation.",
    items: [
      ["Le sujet du dossier", "L’événement, la réunion ou la décision que le document doit décrire."],
      ["Les personnes concernées", "Les participants et interlocuteurs déjà identifiés pour préparer ou relire les informations."],
      ["L’historique disponible", "Les précédentes versions, échanges et pièces auxquelles le dossier fait référence."],
      ["Les points à faire préciser", "Les passages ambigus et les informations qui restent à confirmer avec la personne qui accompagne le dossier."],
    ],
  },
  comptabilite: {
    context: "Un état ou un registre comptable se comprend à partir de sa période, de ses sources et des opérations qu’il rassemble. Réunissez ces repères pour pouvoir expliquer un montant et repérer ce qui demande une lecture complémentaire.",
    items: [
      ["La période observée", "Les dates de début et de fin ainsi que la version du document dont vous disposez."],
      ["L’origine des données", "Le logiciel, l’export ou les pièces à partir desquels les informations ont été regroupées."],
      ["Les rapprochements utiles", "Les justificatifs et autres états qui permettent de retrouver l’origine d’un montant."],
      ["Les écarts à comprendre", "Les libellés, mouvements ou différences qui appellent une explication de votre interlocuteur."],
    ],
  },
  fiscal: {
    context: "Pour préparer la lecture d’un document fiscal, identifiez d’abord l’activité et la période auxquelles il se rapporte. La fiche et les pièces de votre dossier peuvent alors servir de support à vos questions, sans confondre un exemple avec votre déclaration.",
    items: [
      ["Le dossier concerné", "L’entreprise ou l’activité à laquelle le document se rapporte et les références déjà connues."],
      ["La période et la version", "La période visée, le millésime du formulaire disponible et l’origine de la version consultée."],
      ["Les données à expliquer", "Les montants et justificatifs dont vous disposez, avec leur provenance."],
      ["Les questions de lecture", "Les rubriques à clarifier et les points de votre situation à faire examiner avant toute démarche."],
    ],
  },
  social: {
    context: "Une pièce sociale se lit avec la situation de travail et la période auxquelles elle correspond. Préparez les références de votre dossier pour distinguer les informations constatées des points à faire expliquer par votre interlocuteur.",
    items: [
      ["La situation concernée", "L’événement ou la relation de travail auxquels la pièce se rapporte."],
      ["Les dates et références", "La période du document et les références des pièces déjà présentes dans votre dossier."],
      ["Les éléments à rapprocher", "Les montants, libellés et informations que vous souhaitez comparer avec les autres documents disponibles."],
      ["Les questions à poser", "Les lignes difficiles à comprendre et les différences à faire préciser par la personne qui suit le dossier."],
    ],
  },
  gestion: {
    context: "Une pièce de gestion est plus facile à préparer lorsqu’elle est reliée à une opération précise. Retrouvez son objectif, ses interlocuteurs et ses justificatifs avant de chercher comment organiser les informations.",
    items: [
      ["L’objectif de la pièce", "L’opération à décrire et l’usage prévu du document dans votre organisation."],
      ["Le contexte", "Les personnes concernées, les dates et les références utiles pour retrouver l’opération."],
      ["Les informations disponibles", "Les montants, pièces et échanges qui permettent d’expliquer ce que vous souhaitez documenter."],
      ["Les points à compléter", "Les informations absentes et les questions à reprendre avec votre interlocuteur."],
    ],
  },
};

export function getDocumentSupportFaqs(doc: DocEntry) {
  const hasSpecimen = DOCS_WITH_SPECIMEN.has(doc.slug);
  return [
    {
      question: "Un PDF est-il disponible pour cette fiche ?",
      answer: hasSpecimen
        ? `Oui. Cette fiche « ${doc.label} » propose un spécimen annoté au format PDF. Les boutons du lecteur permettent de l’ouvrir dans un nouvel onglet ou de le télécharger. Sur mobile, l’ouverture directe permet de zoomer dans le document.`
        : `Non. Aucun spécimen PDF n’est actuellement disponible pour cette fiche « ${doc.label} ». Les repères de préparation restent accessibles sur la page. Les autres fiches de la bibliothèque indiquent elles aussi explicitement si elles proposent un PDF.`,
    },
    {
      question: "La fiche crée-t-elle un document adapté à mon entreprise ?",
      answer: "Non. Cette page apporte des repères de lecture ; elle ne remplit pas un document à partir de vos informations. Lorsqu’un spécimen est proposé, ses données sont fictives. Préparez vos questions et votre contexte pour faire examiner l’adaptation du document à votre situation.",
    },
    {
      question: "Comment préparer un échange à partir de cette fiche ?",
      answer: "Notez le nom du document, la période concernée, l’usage envisagé et les rubriques que vous souhaitez comprendre. Retrouvez les pièces et versions dont vous disposez déjà, puis distinguez les informations confirmées des points incertains. Le brief Skoria permet de formuler vos besoins et vos questions ; il ne génère ni ne transmet automatiquement ce document.",
    },
  ];
}

export function DocumentPreparation({ doc }: { doc: DocEntry }) {
  const preparation = PREPARATIONS[doc.categorie] ?? PREPARATIONS.gestion!;
  return (
    <section id="document-guide" aria-labelledby="document-preparation-title" className="scroll-mt-36 overflow-hidden rounded-[2rem] bg-navy p-6 text-white sm:p-9 lg:p-12">
      <div className="grid gap-10 lg:grid-cols-[.85fr_1.15fr] lg:gap-14">
        <div>
          <p className="sk-eyebrow mb-5 text-accent-300">Préparer votre dossier</p>
          <h2 id="document-preparation-title" className="text-[clamp(2rem,3.8vw,3.3rem)] font-bold leading-[1.06] tracking-[-.04em]">Les bonnes informations avant la rédaction.</h2>
          <p className="mt-6 text-[.94rem] leading-7 text-white/75">{preparation.context}</p>
          <p className="mt-6 inline-flex max-w-full rounded-2xl border border-white/20 px-4 py-3 text-[.8rem] font-semibold leading-6 text-white/85">Votre point de départ : {doc.label}</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {preparation.items.map(([title, body], index) => (
            <article key={title} className="rounded-3xl border border-white/15 bg-white/[.06] p-5 sm:p-6">
              <span aria-hidden="true" className="flex h-9 w-9 items-center justify-center rounded-full bg-mint text-[.76rem] font-bold text-navy">0{index + 1}</span>
              <h3 className="mt-5 text-[1rem] font-bold leading-6">{title}</h3>
              <p className="mt-3 text-[.82rem] leading-6 text-white/70">{body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function DocumentReadingSteps() {
  return (
    <section aria-labelledby="document-reading-title">
      <div className="mb-9 grid gap-5 lg:grid-cols-[1fr_1fr] lg:items-end">
        <div>
          <p className="sk-eyebrow mb-4 text-cobalt">De la lecture à l’usage</p>
          <h2 id="document-reading-title" className="sk-section-title">Repérez. Rapprochez. Faites préciser.</h2>
        </div>
        <p className="text-[.94rem] leading-7 text-ink-muted">Gardez votre dossier à portée de main pendant la lecture. L’objectif est de comprendre à quoi correspondent les informations et de préparer les questions qui permettront de les adapter.</p>
      </div>
      <ol className="grid gap-5 md:grid-cols-3">
        {[
          ["01", "Comprendre la structure", "Parcourez les intitulés avant de vous arrêter sur un montant ou une formulation. Repérez l’émetteur, le destinataire, les références et l’objet lorsqu’ils sont présents. Notez les termes dont vous souhaitez obtenir une explication.", "bg-lilac"],
          ["02", "Rapprocher les informations", "Comparez les références et les données avec les pièces que vous possédez. Conservez la version utilisée pour votre lecture et relevez les différences, plutôt que de chercher à les expliquer sans connaître leur origine.", "bg-mint"],
          ["03", "Préparer l’adaptation", "Précisez l’usage que vous attendez du document, les informations déjà confirmées et les questions encore ouvertes. Vous disposerez ainsi d’une base concrète pour faire relire une version ou demander comment compléter votre dossier.", "bg-apricot"],
        ].map(([number, title, body, background]) => (
          <li key={number} className={`rounded-3xl p-6 sm:p-8 ${background}`}>
            <span aria-hidden="true" className="text-[2rem] font-bold leading-none tracking-[-.05em] text-cobalt">{number}</span>
            <h3 className="mt-8 text-[1.2rem] font-bold leading-6 text-navy">{title}</h3>
            <p className="mt-4 text-[.86rem] leading-7 text-ink-muted">{body}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

export function DocumentSupport({ doc }: { doc: DocEntry }) {
  const related = DOCUMENTS.filter((entry) => entry.categorie === doc.categorie && entry.slug !== doc.slug).slice(0, 3);
  return (
    <section aria-labelledby="document-support-title" className="grid gap-10 lg:grid-cols-[.8fr_1.2fr] lg:gap-14">
      <div>
        <p className="sk-eyebrow mb-4 text-cobalt">Continuer votre lecture</p>
        <h2 id="document-support-title" className="sk-section-title">Les repères utiles pour la suite.</h2>
        <p className="mt-5 text-[.9rem] leading-7 text-ink-muted">Retrouvez les fiches de la même famille documentaire pour replacer votre besoin dans son contexte.</p>
        <div className="mt-7 grid gap-3">
          {related.map((entry) => (
            <Link key={entry.slug} href={`/documents/${entry.slug}`} className="group flex items-center justify-between gap-4 rounded-2xl border border-navy/10 bg-white px-5 py-4 text-[.86rem] font-semibold leading-6 text-navy transition-colors hover:bg-mint focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cobalt">
              {entry.label}<span aria-hidden="true" className="text-cobalt transition-transform group-hover:translate-x-1">↗</span>
            </Link>
          ))}
          <Link href="/documents" className="mt-2 inline-flex items-center gap-3 text-[.84rem] font-bold text-cobalt hover:underline">Explorer tous les documents <span aria-hidden="true">→</span></Link>
        </div>
      </div>
      <div>
        <h3 className="mb-5 text-[1.25rem] font-bold text-navy">Utiliser cette fiche sur Skoria</h3>
        <FaqAccordion items={getDocumentSupportFaqs(doc)} />
      </div>
    </section>
  );
}
