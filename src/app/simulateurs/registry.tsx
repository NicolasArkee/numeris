// ─── Registre des simulateurs ───
// Source unique pour le hub /simulateurs, les pages outil et le sitemap.

import type { ReactNode } from "react";
import { ChargesSimulator } from "@/components/simulateurs/ChargesSimulator";
import { StatutsSimulator } from "@/components/simulateurs/StatutsSimulator";
import { TjmSimulator } from "@/components/simulateurs/TjmSimulator";
import { ImmobilierSimulator } from "@/components/simulateurs/ImmobilierSimulator";
import { HonorairesSimulator } from "@/components/simulateurs/HonorairesSimulator";
import { SalaireGrille } from "@/components/simulateurs/SalaireGrille";

export interface SimulateurDef {
  slug: string;
  icon: string;
  /** Nom court (cards hub + teaser). */
  title: string;
  /** H1 de la page outil. */
  h1: string;
  metaTitle: string;
  metaDescription: string;
  eyebrow: string;
  intro: string;
  render: () => ReactNode;
  faqs: { question: string; answer: string }[];
}

export const SIMULATEURS: SimulateurDef[] = [
  {
    slug: "charges",
    icon: "📊",
    title: "Simulateur de charges sociales",
    h1: "Simulateur de charges sociales 2026",
    metaTitle: "Simulateur de Charges Sociales 2026 (Micro, TNS, SASU) | Numeris",
    metaDescription:
      "Estimez vos cotisations sociales et votre net selon votre statut : micro-entreprise, TNS au réel ou assimilé salarié. Gratuit, barèmes 2026.",
    eyebrow: "Outil gratuit",
    intro:
      "Micro-entreprise, indépendant au réel ou président de SASU : estimez en quelques secondes vos cotisations sociales et votre revenu net avant impôt.",
    render: () => <ChargesSimulator />,
    faqs: [
      {
        question: "Quel est le taux de cotisations en micro-entreprise en 2026 ?",
        answer:
          "12,3 % du CA pour la vente de marchandises, 21,2 % pour les services commerciaux (BIC) et 26,1 % pour les activités libérales (BNC), hors versement libératoire de l'impôt.",
      },
      {
        question: "Pourquoi les charges TNS sont-elles calculées sur le bénéfice ?",
        answer:
          "Au réel, les cotisations sociales d'un travailleur non salarié sont assises sur le revenu professionnel (bénéfice), pas sur le chiffre d'affaires. Elles représentent environ 45 % du revenu net.",
      },
      {
        question: "L'assimilé salarié coûte-t-il vraiment plus cher ?",
        answer:
          "Oui en cotisations (environ 80 % de charges sur le net), mais le président de SASU bénéficie de la protection sociale du régime général (hors chômage). L'arbitrage dépend de votre besoin de couverture.",
      },
    ],
  },
  {
    slug: "statuts",
    icon: "⚖️",
    title: "Comparateur de statuts",
    h1: "Comparateur de statuts : micro, EI ou SASU ?",
    metaTitle: "Micro-entreprise, EI ou SASU ? Comparateur de Statuts 2026 | Numeris",
    metaDescription:
      "Comparez le revenu net selon votre statut juridique et fiscal : micro-entreprise, entreprise individuelle au réel ou SASU à l'IS. Simulation gratuite.",
    eyebrow: "Outil gratuit",
    intro:
      "À chiffre d'affaires égal, le statut juridique change votre revenu net. Comparez les trois options les plus courantes selon votre CA et vos frais réels.",
    render: () => <StatutsSimulator />,
    faqs: [
      {
        question: "Quand quitter la micro-entreprise pour le réel ?",
        answer:
          "En général dès que vos frais réels dépassent l'abattement forfaitaire (34 % en BNC, 50 % en BIC services, 71 % en vente) ou que vous approchez des plafonds de CA (77 700 € / 188 700 €).",
      },
      {
        question: "La SASU est-elle toujours plus avantageuse à haut revenu ?",
        answer:
          "Pas systématiquement : la stratégie 100 % dividendes économise des cotisations mais ne génère aucun droit à la retraite. Un mix salaire/dividendes optimisé est souvent préférable — c'est un calcul à faire au cas par cas.",
      },
      {
        question: "Ce comparateur prend-il en compte mon impôt sur le revenu ?",
        answer:
          "Non, il compare le net avant IR : votre taux d'imposition personnel dépend de votre foyer fiscal. Un expert-comptable intègre l'IR, l'ACRE et votre protection sociale dans l'arbitrage final.",
      },
    ],
  },
  {
    slug: "tjm",
    icon: "💶",
    title: "Calculateur de TJM",
    h1: "Calculateur de TJM freelance",
    metaTitle: "Calcul du TJM Freelance 2026 : quel taux journalier viser ? | Numeris",
    metaDescription:
      "Calculez le taux journalier moyen (TJM) nécessaire pour atteindre votre objectif de revenu net, selon votre statut et vos jours facturés. Gratuit.",
    eyebrow: "Outil gratuit",
    intro:
      "Votre TJM doit couvrir vos cotisations, vos frais et vos jours non facturés. Partez de votre objectif de revenu net pour fixer le bon taux journalier.",
    render: () => <TjmSimulator />,
    faqs: [
      {
        question: "Combien de jours facturables par mois en freelance ?",
        answer:
          "Comptez 15 à 18 jours par mois en moyenne : il faut déduire la prospection, l'administratif, la formation, les congés et l'intermission des 21-22 jours ouvrés.",
      },
      {
        question: "Pourquoi le TJM nécessaire est-il plus élevé en SASU ?",
        answer:
          "Parce que la ponction cotisations + structure y est plus forte (≈ 45 % du CA contre ≈ 26 % en micro-BNC). En contrepartie, la protection sociale est plus complète.",
      },
      {
        question: "Dois-je facturer mon TJM en HT ou en TTC ?",
        answer:
          "Toujours raisonner en HT : la TVA collectée (20 %) n'est pas un revenu. En micro, vérifiez votre franchise en base de TVA (37 500 € de CA pour les prestations).",
      },
    ],
  },
  {
    slug: "immobilier",
    icon: "🏠",
    title: "Simulateur LMNP",
    h1: "Simulateur LMNP : micro-BIC ou régime réel ?",
    metaTitle: "Simulateur LMNP 2026 : Micro-BIC ou Réel (amortissement) ? | Numeris",
    metaDescription:
      "Comparez la base imposable de votre location meublée au micro-BIC (abattement 50 %) et au régime réel avec amortissement. Simulation gratuite.",
    eyebrow: "Outil gratuit",
    intro:
      "Au régime réel, l'amortissement du bien et du mobilier réduit souvent la base imposable de votre location meublée à zéro. Mesurez l'écart avec le micro-BIC.",
    render: () => <ImmobilierSimulator />,
    faqs: [
      {
        question: "Qu'est-ce que l'amortissement en LMNP au réel ?",
        answer:
          "C'est la déduction comptable de la perte de valeur théorique du bien (hors terrain) et du mobilier. Il ne crée pas de déficit imposable mais se reporte sans limite de durée sur les bénéfices futurs.",
      },
      {
        question: "Le régime réel est-il toujours plus avantageux que le micro-BIC ?",
        answer:
          "Dans la grande majorité des cas dès que le bien est financé ou ancien (charges + intérêts + amortissements > 50 % des loyers). Le micro-BIC reste pertinent pour de petits loyers sans emprunt.",
      },
      {
        question: "Faut-il un expert-comptable pour le LMNP au réel ?",
        answer:
          "C'est fortement recommandé : le réel impose une comptabilité d'engagement, une liasse fiscale (2031) et un suivi des amortissements par composants. Les honoraires sont en partie compensés par la réduction d'impôt liée à l'adhésion à un OGA le cas échéant.",
      },
    ],
  },
  {
    slug: "honoraires",
    icon: "🧾",
    title: "Simulateur d'honoraires",
    h1: "Combien coûte un expert-comptable ? Estimez vos honoraires",
    metaTitle: "Tarif Expert-Comptable : Simulateur d'Honoraires 2026 | Numeris",
    metaDescription:
      "Estimez en 2 minutes le tarif mensuel de votre expert-comptable selon votre forme juridique, votre chiffre d'affaires et vos salariés. Devis ferme sous 24h.",
    eyebrow: "Outil gratuit",
    intro:
      "Le prix d'un expert-comptable dépend de trois facteurs principaux : votre forme juridique, votre volume d'activité et votre social. Obtenez une fourchette honnête, puis un devis ferme.",
    render: () => <HonorairesSimulator />,
    faqs: [
      {
        question: "Quel est le prix moyen d'un expert-comptable en 2026 ?",
        answer:
          "De 59 €/mois HT pour une micro-entreprise à 250 €+/mois HT pour une société avec salariés. La moyenne pour une TPE se situe entre 100 et 200 €/mois HT selon le volume de pièces.",
      },
      {
        question: "Qu'est-ce qui fait varier les honoraires ?",
        answer:
          "Le volume de factures et de transactions, le nombre de salariés (bulletins de paie), l'assujettissement à la TVA, le secteur (obligations spécifiques) et les missions complémentaires (prévisionnel, juridique annuel).",
      },
      {
        question: "Les honoraires d'expertise comptable sont-ils déductibles ?",
        answer:
          "Oui, ce sont des charges déductibles du résultat pour les entreprises au réel (BIC, BNC, IS). En micro-entreprise, ils sont couverts par l'abattement forfaitaire et ne se déduisent pas séparément.",
      },
    ],
  },
  {
    slug: "grille-salaire-expert-comptable",
    icon: "📈",
    title: "Grille des salaires expert-comptable",
    h1: "Salaire d'un expert-comptable : grille interactive 2026",
    metaTitle: "Salaire Expert-Comptable 2026 : Grille par Expérience et Région | Numeris",
    metaDescription:
      "Du collaborateur débutant à l'associé : explorez les salaires de la profession comptable par expérience et région, avec les minima de la CCN 787.",
    eyebrow: "Données métier",
    intro:
      "Combien gagne un expert-comptable ? Explorez les fourchettes de rémunération par niveau d'expérience et par région, ainsi que les minima conventionnels de la branche (CCN 787).",
    render: () => <SalaireGrille />,
    faqs: [
      {
        question: "Quel est le salaire d'un expert-comptable débutant ?",
        answer:
          "Un collaborateur débutant (BTS/DCG) démarre entre 26 000 et 34 000 € brut/an. Un expert-comptable fraîchement diplômé du DEC se situe entre 70 000 et 100 000 € brut/an selon la structure.",
      },
      {
        question: "Combien gagne un expert-comptable associé ?",
        answer:
          "La rémunération d'un associé combine salaire et dividendes : généralement de 100 000 à 200 000 €+ par an selon la taille du cabinet et son portefeuille clients.",
      },
      {
        question: "Qu'est-ce que la convention collective 787 ?",
        answer:
          "C'est la convention collective nationale des cabinets d'experts-comptables et de commissaires aux comptes. Elle fixe les minima de rémunération par coefficient (de 170 à 500), revalorisés régulièrement par accord de branche.",
      },
    ],
  },
];

export const getSimulateur = (slug: string) =>
  SIMULATEURS.find((s) => s.slug === slug);
