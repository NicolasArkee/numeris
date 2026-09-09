import Image from "next/image";
import type { EditorialTocItem } from "./EditorialToc";

export const EDITORIAL_DECISION_TOC: readonly EditorialTocItem[] = [
  { id: "adapter-le-guide", label: "Adapter le guide" },
  { id: "tester-les-scenarios", label: "Tester les scénarios" },
  { id: "verifier-la-decision", label: "Vérifier la décision" },
];

function subjectLabel(subject: string): string {
  return subject.replace(/[?.!]\s*$/u, "").trim();
}

/**
 * Complément de profondeur pour les anciens articles dont le contenu publié est
 * encore court. Ces blocs apportent une méthode réutilisable sans inventer de
 * règle, de tarif ou de promesse propre au sujet traité.
 */
export function EditorialContextWorkshop({ subject }: { subject: string }) {
  const label = subjectLabel(subject);

  return (
    <div id="adapter-le-guide" className="scroll-mt-36">
      <div className="grid items-start gap-10 lg:grid-cols-[.82fr_1.18fr] lg:gap-20">
        <div className="lg:sticky lg:top-36">
          <p className="text-[.65rem] font-bold uppercase tracking-[.2em] text-blue">
            Passer du principe au cas concret
          </p>
          <h2 className="mt-4 text-balance text-[clamp(2.25rem,5vw,4.2rem)] font-semibold leading-[1.02] tracking-[-.045em] text-ink">
            Adapter ce guide à votre situation.
          </h2>
          <p className="mt-6 max-w-xl text-[.96rem] leading-7 text-ink-muted">
            Une réponse utile sur « {label} » dépend rarement d’un seul critère. Avant de retenir une option,
            replacez les explications du guide dans le calendrier, les documents et les choix propres à votre activité.
            Cette mise à plat évite de transformer un principe général en décision automatique.
          </p>
        </div>

        <div className="space-y-4">
          {[
            {
              number: "01",
              title: "Délimiter le point de départ",
              body: "Notez la forme de l’activité, la date de début ou de changement, les options déjà exercées et les échéances à venir. Ajoutez les événements qui ont modifié la situation : nouvel investissement, associé, salarié, changement de régime, financement ou variation sensible du volume. Cette photographie datée permet de distinguer ce qui est certain de ce qui reste à confirmer.",
            },
            {
              number: "02",
              title: "Rassembler les pièces qui racontent le même dossier",
              body: "Regroupez les contrats, déclarations, factures, tableaux de suivi et échanges antérieurs qui éclairent le sujet. Donnez à chaque document une période et une origine. Si deux pièces se contredisent, conservez les deux et formulez la question à résoudre : une divergence visible est plus simple à traiter qu’une hypothèse oubliée.",
            },
            {
              number: "03",
              title: "Séparer objectif, contrainte et préférence",
              body: "Votre objectif décrit le résultat recherché. La contrainte fixe ce qui ne peut pas être déplacé, par exemple une échéance ou un engagement existant. La préférence indique la manière dont vous souhaitez travailler : autonomie, fréquence des échanges, outil ou niveau d’accompagnement. En les séparant, vous rendez les arbitrages comparables et vous évitez qu’une préférence soit présentée comme une obligation.",
            },
          ].map((item) => (
            <article
              key={item.number}
              className="group grid gap-5 rounded-[1.25rem] border border-ink/12 bg-white p-6 transition-transform hover:-translate-y-1 sm:grid-cols-[4.5rem_1fr] sm:p-8"
            >
              <span className="font-serif text-[2.65rem] leading-none text-blue/45 group-hover:text-blue">
                {item.number}
              </span>
              <div>
                <h3 className="text-[1.2rem] font-semibold text-ink">{item.title}</h3>
                <p className="mt-3 text-[.91rem] leading-7 text-ink-muted">{item.body}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}

export function EditorialScenarioLab({ subject }: { subject: string }) {
  const label = subjectLabel(subject);

  return (
    <div id="tester-les-scenarios" className="scroll-mt-36">
      <div className="grid gap-8 lg:grid-cols-[1.08fr_.92fr] lg:items-end">
        <div>
          <p className="text-[.65rem] font-bold uppercase tracking-[.2em] text-blue">Atelier de comparaison</p>
          <h2 className="mt-4 max-w-4xl text-balance text-[clamp(2.35rem,5vw,4.4rem)] font-semibold leading-[1.01] tracking-[-.05em] text-ink">
            Testez trois scénarios avant de figer votre réponse.
          </h2>
        </div>
        <p className="max-w-xl text-[.95rem] leading-7 text-ink-muted">
          Pour « {label} », un scénario n’est pas une prédiction. C’est une façon de rendre visibles les hypothèses,
          les conséquences pratiques et les points qui nécessitent une validation professionnelle.
        </p>
      </div>

      <div className="mt-10 grid overflow-hidden rounded-[1.4rem] border border-ink/14 bg-ink lg:grid-cols-3">
        {[
          {
            tag: "Scénario A",
            title: "La situation actuelle",
            body: "Décrivez ce qui se passe si vous ne modifiez rien à court terme. Listez les tâches, les échéances et les documents déjà prévus. Ce scénario sert de référence : il montre le coût organisationnel réel du statu quo et les questions qui existent même sans nouveau choix.",
            prompt: "À consigner : ce qui fonctionne, ce qui bloque et la prochaine date irréversible.",
          },
          {
            tag: "Scénario B",
            title: "L’option envisagée",
            body: "Reprenez le même horizon de temps en appliquant l’option étudiée. Identifiez les nouvelles démarches, les responsabilités transférées ou conservées, les outils à adapter et les informations à produire. Comparez le périmètre complet plutôt qu’un bénéfice isolé ou un intitulé commercial.",
            prompt: "À consigner : conditions d’entrée, effort de mise en place et résultat attendu.",
          },
          {
            tag: "Scénario C",
            title: "Le cas qui dévie",
            body: "Ajoutez une variation plausible : activité plus forte ou plus faible, retard de document, changement de calendrier, besoin ponctuel ou donnée encore inconnue. Vérifiez alors ce qui tient, ce qui doit être recalculé et qui prendra la décision si cette variation survient.",
            prompt: "À consigner : seuil d’alerte, solution de repli et personne à contacter.",
          },
        ].map((scenario, index) => (
          <article
            key={scenario.tag}
            className={`p-7 text-white sm:p-9 ${index < 2 ? "border-b border-white/14 lg:border-b-0 lg:border-r" : ""}`}
          >
            <p className="text-[.63rem] font-bold uppercase tracking-[.19em] text-[#ffb293]">{scenario.tag}</p>
            <h3 className="mt-7 text-[1.55rem] font-semibold leading-tight">{scenario.title}</h3>
            <p className="mt-4 text-[.88rem] leading-7 text-white/68">{scenario.body}</p>
            <p className="mt-7 border-t border-white/14 pt-5 text-[.75rem] font-semibold leading-6 text-white/88">
              {scenario.prompt}
            </p>
          </article>
        ))}
      </div>

      <div className="mt-7 rounded-[1.1rem] border border-ink/12 bg-white p-6 sm:flex sm:items-center sm:justify-between sm:gap-8 sm:p-8">
        <p className="max-w-4xl text-[.9rem] leading-7 text-ink-muted">
          Utilisez exactement les mêmes critères pour les trois colonnes : délais, pièces à produire, personnes responsables,
          fréquence de suivi, marge d’incertitude et conditions de révision. Si une donnée manque, inscrivez « à confirmer »
          au lieu de choisir une valeur par défaut. Le tableau devient alors une liste de questions prête pour l’échange.
        </p>
        <button
          type="button"
          data-open-brief
          data-need={subject}
          className="mt-5 inline-flex min-h-12 shrink-0 items-center rounded-full bg-orange px-6 text-[.82rem] font-bold text-navy sm:mt-0"
        >
          Mettre mes critères au propre&nbsp; ↗
        </button>
      </div>
    </div>
  );
}

export function EditorialVerificationPlan({ subject }: { subject: string }) {
  const label = subjectLabel(subject);

  return (
    <div id="verifier-la-decision" className="scroll-mt-36">
      <div className="grid gap-10 lg:grid-cols-[.92fr_1.08fr] lg:gap-16">
        <figure className="relative min-h-[25rem] overflow-hidden rounded-[1.4rem] bg-navy">
          <Image
            src="/images/skoria-v2/editorial/objects.webp"
            alt="Documents, repères et objets de calcul organisés pour une vérification"
            fill
            sizes="(max-width: 1024px) 100vw, 44vw"
            className="object-cover"
          />
          <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-navy/60 via-transparent to-transparent" />
          <figcaption className="absolute inset-x-5 bottom-5 rounded-[.9rem] bg-white/92 p-4 text-[.76rem] leading-5 text-ink backdrop-blur-sm">
            Une décision traçable relie chaque hypothèse à une source, une date et une personne chargée de la confirmer.
          </figcaption>
        </figure>

        <div>
          <p className="text-[.65rem] font-bold uppercase tracking-[.2em] text-blue">Grille de vérification</p>
          <h2 className="mt-4 text-balance text-[clamp(2.3rem,5vw,4.15rem)] font-semibold leading-[1.02] tracking-[-.045em] text-ink">
            Fermer les zones grises avant d’agir.
          </h2>
          <p className="mt-6 text-[.94rem] leading-7 text-ink-muted">
            Relisez la conclusion retenue sur « {label} » en la séparant de ses preuves. Une page peut expliquer une méthode,
            mais elle ne connaît ni l’intégralité de vos pièces ni les changements intervenus après sa date de revue.
            Le dernier contrôle consiste donc à attribuer chaque vérification et à conserver la réponse obtenue.
          </p>

          <div className="mt-8 divide-y divide-ink/12 border-y border-ink/14">
            {[
              [
                "Ce que vous apportez",
                "Les faits, dates, volumes, contrats, choix antérieurs et objectifs. Signalez les informations estimées ou incomplètes afin qu’elles ne soient pas traitées comme des données certaines.",
              ],
              [
                "Ce que le professionnel confirme",
                "La règle applicable au moment de la décision, les exceptions qui concernent le dossier, les calculs à reprendre, le périmètre de sa mission et les démarches qui restent sous votre responsabilité.",
              ],
              [
                "Ce que vous conservez",
                "La source utilisée, sa date de consultation, la question posée, la réponse reçue et la version du document envoyé. Ce journal bref facilite une revue ultérieure et évite de reconstruire le raisonnement.",
              ],
            ].map(([title, body], index) => (
              <div key={title} className="grid gap-3 py-5 sm:grid-cols-[2.1rem_1fr]">
                <span className="font-serif text-[1.45rem] text-blue">{index + 1}</span>
                <div>
                  <h3 className="text-[1rem] font-semibold text-ink">{title}</h3>
                  <p className="mt-2 text-[.86rem] leading-6 text-ink-muted">{body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-12 grid gap-px overflow-hidden rounded-[1.25rem] bg-ink/12 md:grid-cols-4">
        {[
          ["Source", "Qui publie l’information et sur quel document repose-t-elle ?"],
          ["Date", "À quelle date la page, le barème ou la réponse a-t-il été revu ?"],
          ["Portée", "Le contenu vise-t-il votre cas ou seulement une situation voisine ?"],
          ["Décision", "Quelle action, quel responsable et quelle prochaine vérification en découlent ?"],
        ].map(([title, body]) => (
          <article key={title} className="bg-white p-6">
            <h3 className="text-[.95rem] font-semibold text-ink">{title}</h3>
            <p className="mt-3 text-[.8rem] leading-6 text-ink-muted">{body}</p>
          </article>
        ))}
      </div>

      <aside className="mt-8 overflow-hidden rounded-[1.25rem] bg-blue text-white">
        <div className="grid gap-8 p-7 sm:p-9 lg:grid-cols-[.72fr_1.28fr] lg:items-start lg:p-11">
          <div>
            <p className="text-[.63rem] font-bold uppercase tracking-[.2em] text-white/62">Revue à froid</p>
            <h3 className="mt-4 text-balance text-[clamp(1.8rem,4vw,3rem)] font-semibold leading-[1.06]">
              Relire la décision comme si elle concernait quelqu’un d’autre.
            </h3>
          </div>
          <div className="space-y-5 text-[.88rem] leading-7 text-white/76">
            <p>
              Une fois la réponse préparée, laissez apparaître son raisonnement sur une seule page : contexte, option retenue,
              hypothèses, points confirmés et prochaine échéance. Relisez-la ensuite sans les documents ouverts. Si une phrase
              ne permet pas de comprendre d’où vient une conclusion, rattachez-la à sa pièce ou transformez-la en question.
            </p>
            <p>
              Vérifiez aussi le sens inverse : quelle information nouvelle vous ferait changer d’avis ? Cette question révèle
              les critères décisifs et les données qui méritent un suivi. Elle évite de défendre une solution par habitude alors
              que le contexte, le calendrier ou le périmètre a évolué.
            </p>
            <div className="grid gap-3 border-t border-white/16 pt-5 sm:grid-cols-3">
              {[
                ["Compréhensible", "Une personne extérieure peut-elle suivre les étapes sans explication orale ?"],
                ["Réversible", "Savez-vous jusqu’à quand le choix peut être ajusté et avec quelles conséquences ?"],
                ["Révisable", "Une date et un déclencheur sont-ils prévus pour contrôler à nouveau la décision ?"],
              ].map(([title, body]) => (
                <div key={title}>
                  <p className="font-semibold text-white">{title}</p>
                  <p className="mt-2 text-[.75rem] leading-5 text-white/62">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
