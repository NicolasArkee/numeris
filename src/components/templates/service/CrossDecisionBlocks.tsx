import type { Service } from "@/libs/db";
import { buildServiceSeoContentPack } from "@/components/expertises/service-v3-helpers";
import { sourcesForService } from "./ServiceLandingTemplate";
import { ServiceScopeBuilder } from "./ServiceScopeBuilder";
import { ServiceSituationTabs } from "./ServiceSituationTabs";

export type CrossBlockKind =
  | "diagnostic"
  | "obligations"
  | "scope"
  | "deliverables"
  | "timeline"
  | "documents"
  | "collaboration"
  | "selection"
  | "sources";

export type CrossDimensionContext = {
  type: "secteur" | "ville" | "profession";
  name: string;
  description?: string | null;
  obligations?: string | null;
  region?: string | null;
};

function contextPhrase(dimension: CrossDimensionContext) {
  if (dimension.type === "ville") return `à ${dimension.name}`;
  if (dimension.type === "secteur") return `dans le secteur ${dimension.name}`;
  return `pour les ${dimension.name}`;
}

function Heading({ eyebrow, title, body }: { eyebrow: string; title: string; body: string }) {
  return (
    <div className="max-w-3xl">
      <p className="sk-eyebrow text-blue">{eyebrow}</p>
      <h2 className="mt-4 text-[clamp(2rem,4vw,3.2rem)] font-semibold leading-[1.05] text-ink">{title}</h2>
      <p className="mt-5 text-[.96rem] leading-8 text-ink-muted">{body}</p>
    </div>
  );
}

export function CrossDecisionBlock({
  kind,
  service,
  dimension,
}: {
  kind: CrossBlockKind;
  service: Service;
  dimension: CrossDimensionContext;
}) {
  const content = buildServiceSeoContentPack(service);
  const where = contextPhrase(dimension);
  const mission = service.title.toLowerCase();

  if (kind === "diagnostic") {
    const scenarios = dimension.type === "ville"
      ? ["Je veux pouvoir rencontrer le cabinet", "Mon équipe travaille déjà à distance", "Je change de cabinet avec une échéance proche", "Je cherche une compétence précise dans la région"]
      : dimension.type === "secteur"
        ? ["L’activité a un cycle d’encaissement particulier", "La TVA ou les justificatifs demandent un traitement spécifique", "La marge et la trésorerie manquent de visibilité", "L’entreprise change de taille ou de modèle"]
        : ["Je démarre mon activité", "Je veux déléguer une partie de la production", "Je reprends un dossier existant", "J’ai une opération ou une échéance inhabituelle"];
    return (
      <div>
        <Heading eyebrow="01 · Diagnostic" title={`Votre besoin de ${mission} ${where}`} body="Le contexte affine le besoin, mais il ne remplace pas le périmètre. Identifiez d’abord le changement à gérer, l’échéance la plus proche et le résultat attendu du professionnel." />
        <div className="mt-9 grid gap-4 md:grid-cols-2">{scenarios.map((item, index) => <article key={item} className="grid grid-cols-[2.5rem_1fr] gap-4 rounded-[1.15rem] border border-ink/10 bg-white p-5"><span className="font-display font-semibold text-[1.55rem] text-orange">0{index + 1}</span><div><h3 className="text-[.92rem] font-bold text-ink">{item}</h3><p className="mt-2 text-[.78rem] leading-6 text-ink-muted">Notez les volumes, outils, personnes concernées et contraintes de calendrier pour que les réponses restent comparables.</p></div></article>)}</div>
        <div className="mt-7"><ServiceSituationTabs serviceTitle={`${service.title} ${where}`} /></div>
      </div>
    );
  }

  if (kind === "obligations") {
    const contextDetail = dimension.obligations || dimension.description || (dimension.region ? `${dimension.name} se situe en ${dimension.region}. La localisation peut compter pour les rendez-vous, tandis que les obligations dépendent d’abord du statut et de l’activité.` : null);
    return (
      <div className="grid gap-10 lg:grid-cols-[.82fr_1.18fr]">
        <Heading eyebrow="02 · Contexte" title="Distinguer la règle générale du point spécifique" body={`Pour cadrer ${mission} ${where}, reliez chaque obligation à une donnée, une personne responsable et une date. Une affirmation générale devient alors un contrôle concret à prévoir dans la mission.`} />
        <div className="rounded-[1.25rem] border border-ink/12 bg-white p-6 lg:p-8"><p className="sk-eyebrow text-orange">Point de départ</p>{contextDetail && <p className="mt-4 text-[.9rem] leading-7 text-ink">{contextDetail}</p>}<p className="mt-5 text-[.82rem] leading-7 text-ink-muted">Vérifiez avec le professionnel les textes applicables, les seuils, le calendrier et les pièces justificatives. Demandez aussi ce qui reste à la charge de l’entreprise et la procédure prévue lorsqu’une information arrive en retard.</p></div>
      </div>
    );
  }

  if (kind === "scope") {
    return (
      <div>
        <Heading eyebrow="03 · Périmètre" title={content.coverageTitle} body={`${content.coverageIntro} Pour ce contexte, faites confirmer les tâches récurrentes, les travaux de clôture, le conseil inclus et les exclusions.`} />
        <div className="mt-9"><ServiceScopeBuilder serviceTitle={`${service.title} ${where}`} options={content.coverageCards} /></div>
        <div className="mt-6 rounded-[1.15rem] bg-navy p-6 text-white"><h3 className="text-[1rem] font-bold">À inscrire dans la lettre de mission</h3><p className="mt-3 text-[.82rem] leading-7 text-white/70">Les tâches des deux parties, les dates de transmission, les contrôles, les livrables, les limites de la mission et les conditions d’un travail supplémentaire. Ce document permet de confronter la promesse commerciale à un engagement précis.</p></div>
      </div>
    );
  }

  if (kind === "deliverables") {
    return (
      <div>
        <Heading eyebrow="04 · Livrables" title={content.deliverablesTitle} body={`${content.deliverablesIntro} Un livrable utile précise sa fréquence, son format, sa date cible et la personne qui l’explique.`} />
        <div className="mt-9 overflow-hidden rounded-[1.25rem] border border-ink/12 bg-white">{content.deliverables.map((item) => <article key={`${item.rhythm}-${item.title}`} className="grid gap-3 border-t border-ink/10 p-5 first:border-t-0 md:grid-cols-[8rem_.75fr_1fr]"><p className="font-display font-semibold text-[1.45rem] text-orange">{item.rhythm}</p><h3 className="text-[.9rem] font-bold text-ink">{item.title}</h3><p className="text-[.78rem] leading-6 text-ink-muted">{item.body}</p></article>)}</div>
      </div>
    );
  }

  if (kind === "timeline") {
    const steps = [
      ["Avant l’échange", "Rassembler le dernier exercice, les échéances proches, les volumes, les outils et les incidents connus."],
      ["Pendant le cadrage", "Faire décrire les responsabilités, les contrôles, les dépendances et le calendrier de reprise."],
      ["Avant la signature", "Relire les livrables, exclusions, délais de réponse, honoraires complémentaires et modalités de sortie."],
      ["Premier cycle", "Contrôler les accès, la collecte, les anomalies reprises et la date de la première restitution."],
    ];
    return (
      <div>
        <Heading eyebrow="05 · Délais" title="Construire un calendrier à partir de la prochaine échéance" body={`Une mission de ${mission} ${where} commence rarement sur une page blanche. Le calendrier doit absorber l’historique, les travaux en cours et les validations internes sans masquer les zones encore incertaines.`} />
        <ol className="mt-9 grid gap-px overflow-hidden rounded-[1.25rem] bg-ink/12 lg:grid-cols-4">{steps.map(([title, body], index) => <li key={title} className="bg-white p-5"><span className="font-display font-semibold text-[2rem] text-orange">0{index + 1}</span><h3 className="mt-4 text-[.92rem] font-bold text-ink">{title}</h3><p className="mt-3 text-[.78rem] leading-6 text-ink-muted">{body}</p></li>)}</ol>
      </div>
    );
  }

  if (kind === "documents") {
    return (
      <div className="grid gap-10 lg:grid-cols-[.72fr_1.28fr]">
        <Heading eyebrow="06 · Données et outils" title={content.documentsTitle} body={`${content.documentsIntro} Demandez qui vérifie les exports, comment sont traitées les pièces manquantes et comment récupérer l’historique.`} />
        <div className="grid gap-4 sm:grid-cols-2">{content.documentBlocks.map((block) => <article key={block.title} className="rounded-[1.1rem] border border-ink/10 bg-white p-5"><h3 className="text-[.9rem] font-bold text-ink">{block.title}</h3><p className="mt-3 text-[.78rem] leading-6 text-ink-muted">{block.body}</p><ul className="mt-4 space-y-2">{block.items.slice(0, 4).map((item) => <li key={item} className="flex gap-2 text-[.75rem] leading-6 text-ink"><span aria-hidden className="text-orange">●</span>{item}</li>)}</ul></article>)}</div>
      </div>
    );
  }

  if (kind === "collaboration") {
    const modes = [
      ["Présentiel", "À comparer si les rendez-vous physiques facilitent vos arbitrages ou la reprise d’un dossier complexe."],
      ["Hybride", "À cadrer autour d’un interlocuteur, d’outils partagés et de rendez-vous réservés aux décisions importantes."],
      ["À distance", "À tester sur la qualité du support, l’accès aux données, les exports et le traitement des cas inhabituels."],
    ];
    return (
      <div>
        <Heading eyebrow="07 · Collaboration" title={`Trouver le bon mode de travail ${where}`} body="Le lieu compte avec la disponibilité, les canaux, le rythme de restitution et le niveau d’autonomie demandé à l’entreprise. Comparez l’organisation vécue, pas seulement l’étiquette du cabinet." />
        <div className="mt-9 grid gap-4 lg:grid-cols-3">{modes.map(([title, body], index) => <article key={title} className={`rounded-[1.2rem] p-6 ${index === 1 ? "bg-blue text-white" : "border border-ink/10 bg-white"}`}><p className={`sk-eyebrow ${index === 1 ? "text-orange" : "text-blue"}`}>Option {index + 1}</p><h3 className="mt-4 text-[1.1rem] font-bold">{title}</h3><p className={`mt-4 text-[.82rem] leading-7 ${index === 1 ? "text-white/72" : "text-ink-muted"}`}>{body}</p></article>)}</div>
      </div>
    );
  }

  if (kind === "selection") {
    return (
      <div className="grid gap-10 lg:grid-cols-[.8fr_1.2fr]">
        <Heading eyebrow="08 · Honoraires et choix" title="Faire apparaître ce que couvre chaque proposition" body="Le montant dépend du volume, de la fréquence, de la complexité, de l’état du dossier, des outils et du niveau de conseil. Comparez le socle, les options et les travaux exceptionnels sur une même grille." />
        <div className="rounded-[1.25rem] bg-navy p-6 text-white lg:p-8"><h3 className="text-[1.05rem] font-bold">Grille de décision</h3><ul className="mt-5 space-y-3">{["Périmètre et exclusions explicités", "Interlocuteur et délais de réponse", "Livrables et fréquence de restitution", "Traitement de la reprise et des anomalies", "Accès, export et réversibilité des données", "Conditions des travaux complémentaires"].map((item) => <li key={item} className="grid grid-cols-[.6rem_1fr] gap-3 text-[.8rem] leading-6 text-white/76"><span aria-hidden className="mt-2 h-2 w-2 rounded-full bg-orange" />{item}</li>)}</ul><p className="mt-6 border-t border-white/15 pt-5 text-[.72rem] leading-6 text-white/55">Chaque cabinet confirme ses propres honoraires après étude du besoin. Aucun tarif standard ne peut remplacer ce cadrage.</p></div>
      </div>
    );
  }

  const sources = sourcesForService(service.slug);
  return (
    <div>
      <Heading eyebrow="09 · Sources" title="Contrôler les règles auprès des sources institutionnelles" body="Les pages officielles donnent le cadre général. Vérifiez leur date, les seuils applicables et les particularités de votre situation avec le professionnel retenu." />
      <div className="mt-9 grid gap-4 md:grid-cols-2 lg:grid-cols-3">{sources.map((source) => <a key={source.href} href={source.href} target="_blank" rel="noreferrer" className="group rounded-[1.1rem] border border-ink/10 bg-white p-5 hover:border-blue"><p className="sk-eyebrow text-blue">{source.publisher}</p><h3 className="mt-3 text-[.9rem] font-bold text-ink group-hover:underline">{source.label}&nbsp; ↗</h3><p className="mt-3 text-[.76rem] leading-6 text-ink-muted">{source.note}</p></a>)}</div>
    </div>
  );
}
