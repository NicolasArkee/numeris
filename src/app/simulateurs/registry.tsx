// ─── Registre des simulateurs ───
// Source unique pour le hub /simulateurs, les pages outil et le sitemap.

import type { ReactNode } from "react";
import { ChargesSimulator } from "@/components/simulateurs/ChargesSimulator";
import { StatutsSimulator } from "@/components/simulateurs/StatutsSimulator";
import { TjmSimulator } from "@/components/simulateurs/TjmSimulator";
import { ImmobilierSimulator } from "@/components/simulateurs/ImmobilierSimulator";
import { HonorairesSimulator } from "@/components/simulateurs/HonorairesSimulator";
import { SalaireGrille } from "@/components/simulateurs/SalaireGrille";
import { TvaSimulator } from "@/components/simulateurs/TvaSimulator";
import { FraisKmSimulator } from "@/components/simulateurs/FraisKmSimulator";
import { CoutSalarieSimulator } from "@/components/simulateurs/CoutSalarieSimulator";
import { JoursOuvresSimulator } from "@/components/simulateurs/JoursOuvresSimulator";
import { ImpotSocietesSimulator } from "@/components/simulateurs/ImpotSocietesSimulator";
import { RuptureConventionnelleSimulator } from "@/components/simulateurs/RuptureConventionnelleSimulator";
import { PrimeCddSimulator } from "@/components/simulateurs/PrimeCddSimulator";
import { CapitalSocialSimulator } from "@/components/simulateurs/CapitalSocialSimulator";

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
    slug: "calcul-tva",
    icon: "🧮",
    title: "Calculatrice de TVA",
    h1: "Calculatrice de TVA : convertir HT ⇄ TTC",
    metaTitle: "Calcul TVA 2026 : HT en TTC et TTC en HT (20 %, 10 %, 5,5 %, 2,1 %)",
    metaDescription:
      "Convertissez un montant HT en TTC (et inversement) pour les quatre taux de TVA en vigueur, avec le détail du montant de taxe. Gratuit et instantané.",
    eyebrow: "Outil gratuit",
    intro:
      "Passez du HT au TTC (et inversement) pour les quatre taux de TVA en vigueur, avec le détail du montant de taxe et le comparatif tous taux.",
    render: () => <TvaSimulator />,
    faqs: [
      {
        question: "Comment calculer un prix HT à partir du TTC ?",
        answer:
          "On divise le TTC par 1 + le taux : 120 € TTC à 20 % = 120 ÷ 1,20 = 100 € HT. Retirer 20 % du TTC est une erreur classique qui fausse le résultat.",
      },
      {
        question: "Quels sont les taux de TVA en France ?",
        answer:
          "Quatre taux en métropole : 20 % (taux normal), 10 % (restauration, transport, travaux), 5,5 % (produits alimentaires, livres, énergie) et 2,1 % (médicaments remboursés, presse). Le taux dépend de la nature précise de l'opération.",
      },
      {
        question: "Dois-je facturer la TVA en micro-entreprise ?",
        answer:
          "Non tant que vous bénéficiez de la franchise en base de TVA, sous conditions de seuils de chiffre d'affaires. Au-delà, vous facturez la TVA et pouvez la déduire sur vos achats.",
      },
    ],
  },
  {
    slug: "frais-kilometriques",
    icon: "🚗",
    title: "Calcul des frais kilométriques",
    h1: "Frais kilométriques : calculez votre indemnité",
    metaTitle: "Barème Kilométrique 2026 : Calcul des Frais de Voiture et Moto",
    metaDescription:
      "Distance annuelle, puissance fiscale : calculez l'indemnité kilométrique déductible selon le barème fiscal, pour voiture et deux-roues. Gratuit.",
    eyebrow: "Outil gratuit",
    intro:
      "Distance annuelle, puissance fiscale : calculez l'indemnité kilométrique déductible selon le barème fiscal, pour voiture et deux-roues, avec la majoration électrique.",
    render: () => <FraisKmSimulator />,
    faqs: [
      {
        question: "Que couvre le barème kilométrique ?",
        answer:
          "La dépréciation du véhicule, l'entretien, les réparations, les pneus, le carburant et l'assurance. Les frais de péage, de stationnement et les intérêts d'emprunt (part professionnelle) s'ajoutent sur justificatifs.",
      },
      {
        question: "Quelle distance domicile-travail puis-je déduire ?",
        answer:
          "En principe 40 km par trajet au maximum (80 km aller-retour par jour), sauf circonstances particulières justifiées, comme la mutation du conjoint. Au-delà, la fraction excédentaire n'est pas déductible.",
      },
      {
        question: "Le barème s'applique-t-il aux dirigeants et indépendants ?",
        answer:
          "Les salariés (dont dirigeants assimilés salariés) l'utilisent pour les frais réels ou les remboursements exonérés ; les BNC peuvent l'utiliser sur option. Les sociétés à l'IS ont des règles propres pour les véhicules — un point à arbitrer avec votre expert-comptable.",
      },
    ],
  },
  {
    slug: "cout-salarie",
    icon: "👥",
    title: "Simulateur de coût d'un salarié",
    h1: "Combien coûte un salarié ? Coût employeur complet",
    metaTitle: "Coût d'un Salarié pour l'Employeur 2026 : Simulateur Brut → Coût Total",
    metaDescription:
      "Du salaire brut au coût total employeur : charges patronales estimées, réduction générale sur les bas salaires et net versé au salarié. Gratuit.",
    eyebrow: "Outil gratuit",
    intro:
      "Du salaire brut au coût total employeur : charges patronales estimées, réduction générale sur les bas salaires et net versé au salarié.",
    render: () => <CoutSalarieSimulator />,
    faqs: [
      {
        question: "Combien coûte un salarié au SMIC ?",
        answer:
          "Grâce à la réduction générale de cotisations (RGDU depuis 2026), les charges patronales au niveau du SMIC sont presque effacées : le coût total est de l'ordre du brut majoré de 5 à 10 %, contre plus de 40 % pour des salaires élevés. La réduction décroît ensuite jusqu'à s'annuler vers 3 SMIC.",
      },
      {
        question: "Quelle différence de coût entre un cadre et un non-cadre ?",
        answer:
          "À brut égal, un cadre coûte un peu plus cher : cotisation APEC et prévoyance obligatoire (au moins 1,5 % de la tranche A à la charge de l'employeur) s'ajoutent. L'écart reste de l'ordre de quelques points.",
      },
      {
        question: "Quels coûts s'ajoutent au salaire chargé ?",
        answer:
          "Mutuelle (au moins 50 % employeur), médecine du travail, formation, équipement, congés payés et éventuels 13e mois ou titres-restaurant. Comptez ces coûts périphériques dans votre budget de recrutement.",
      },
    ],
  },
  {
    slug: "jours-ouvres",
    icon: "📅",
    title: "Calculateur de jours ouvrés",
    h1: "Jours ouvrés entre deux dates (France)",
    metaTitle: "Calcul des Jours Ouvrés et Ouvrables entre 2 Dates (France 2026)",
    metaDescription:
      "Nombre de jours ouvrés, ouvrables et calendaires entre deux dates, jours fériés de métropole déduits. Calcul instantané et gratuit.",
    eyebrow: "Outil gratuit",
    intro:
      "Nombre de jours ouvrés, ouvrables et calendaires entre deux dates, jours fériés de France métropolitaine automatiquement déduits.",
    render: () => <JoursOuvresSimulator />,
    faqs: [
      {
        question: "Quelle différence entre jours ouvrés, ouvrables et calendaires ?",
        answer:
          "Les jours ouvrés vont du lundi au vendredi hors fériés (jours effectivement travaillés dans la plupart des entreprises) ; les jours ouvrables incluent aussi le samedi ; les jours calendaires comptent tous les jours. Les congés payés se décomptent le plus souvent en jours ouvrables.",
      },
      {
        question: "Combien y a-t-il de jours ouvrés en 2026 ?",
        answer:
          "252 jours ouvrés en France métropolitaine : 2026 compte 11 jours fériés, dont 9 tombent en semaine (le 15 août tombe un samedi et le 1er novembre un dimanche). Le chiffre exact pour votre entreprise dépend des ponts pratiqués.",
      },
      {
        question: "Un jour férié est-il forcément chômé et payé ?",
        answer:
          "Seul le 1er mai est obligatoirement chômé (hors secteurs qui ne peuvent pas interrompre l'activité). Pour les autres fériés, tout dépend de l'accord d'entreprise ou de la convention collective.",
      },
    ],
  },
  {
    slug: "rupture-conventionnelle",
    icon: "🤝",
    title: "Indemnité de rupture conventionnelle",
    h1: "Indemnité de rupture conventionnelle : calcul du minimum légal",
    metaTitle: "Rupture Conventionnelle 2026 : Calcul de l'Indemnité Minimale",
    metaDescription:
      "Ancienneté et salaire de référence : calculez l'indemnité spécifique minimale de rupture conventionnelle (au moins l'indemnité légale de licenciement).",
    eyebrow: "Outil gratuit",
    intro:
      "Ancienneté et salaire de référence : calculez l'indemnité spécifique minimale de rupture conventionnelle — le plancher légal en dessous duquel la convention n'est pas homologuée.",
    render: () => <RuptureConventionnelleSimulator />,
    faqs: [
      {
        question: "Peut-on négocier plus que l'indemnité minimale ?",
        answer:
          "Oui, le montant calculé est un plancher légal : employeur et salarié peuvent convenir librement d'un montant supérieur. En dessous du minimum, la Dreets refuse l'homologation.",
      },
      {
        question: "L'indemnité de rupture conventionnelle est-elle imposable ?",
        answer:
          "Elle est exonérée d'impôt sur le revenu et de cotisations dans certaines limites (notamment le montant de l'indemnité légale ou conventionnelle, et deux plafonds annuels de la Sécurité sociale pour les cotisations). Au-delà, la fraction excédentaire est soumise à l'impôt et aux cotisations.",
      },
      {
        question: "Quel salaire de référence est retenu ?",
        answer:
          "Le plus favorable entre la moyenne des 12 derniers mois et celle des 3 derniers mois (les primes annuelles étant alors proratisées). C'est ce salaire qui sert de base au calcul du quart ou du tiers de mois par année d'ancienneté.",
      },
    ],
  },
  {
    slug: "calcul-impot-societes",
    icon: "🏛️",
    title: "Calculateur d'impôt sur les sociétés",
    h1: "Calcul de l'IS : taux réduit 15 % et taux normal 25 %",
    metaTitle: "Calcul Impôt sur les Sociétés (IS) 2026 : 15 % ou 25 %",
    metaDescription:
      "Estimez l'IS de votre société : taux réduit de 15 % jusqu'à 42 500 € de bénéfice sous conditions, 25 % au-delà, avec le détail par tranche. Gratuit.",
    eyebrow: "Outil gratuit",
    intro:
      "Estimez l'impôt sur les sociétés : taux réduit de 15 % jusqu'à 42 500 € de bénéfice sous conditions, taux normal de 25 % au-delà, avec le détail par tranche.",
    render: () => <ImpotSocietesSimulator />,
    faqs: [
      {
        question: "Quelles conditions pour bénéficier du taux réduit de 15 % ?",
        answer:
          "Trois conditions cumulatives : chiffre d'affaires HT inférieur à 10 M€, capital entièrement libéré, et détention d'au moins 75 % par des personnes physiques (directement ou via une société elle-même détenue à 75 % par des personnes physiques). Le taux de 15 % ne s'applique qu'aux premiers 42 500 € de bénéfice.",
      },
      {
        question: "Quand l'IS se paie-t-il ?",
        answer:
          "Par quatre acomptes trimestriels (15 mars, 15 juin, 15 septembre, 15 décembre), puis un solde après la clôture. Les petites sociétés dont l'IS de référence est faible peuvent être dispensées d'acomptes.",
      },
      {
        question: "Que devient un déficit à l'IS ?",
        answer:
          "Il se reporte en avant sans limite de durée (avec un plafonnement annuel d'imputation) ou, sur option, en arrière sur le bénéfice de l'exercice précédent dans la limite de 1 M€. Un déficit ne donne jamais lieu à un IS négatif.",
      },
    ],
  },
  {
    slug: "prime-fin-cdd",
    icon: "📃",
    title: "Prime de fin de CDD",
    h1: "Prime de précarité : calculez votre indemnité de fin de CDD",
    metaTitle: "Prime de Précarité CDD 2026 : Calcul des 10 % et Cas d'Exclusion",
    metaDescription:
      "10 % de la rémunération brute totale du contrat : calculez la prime de fin de CDD, avec l'indemnité de congés payés le cas échéant. Gratuit.",
    eyebrow: "Outil gratuit",
    intro:
      "10 % de la rémunération brute totale du contrat : calculez la prime de fin de CDD, avec l'indemnité compensatrice de congés payés le cas échéant.",
    render: () => <PrimeCddSimulator />,
    faqs: [
      {
        question: "Dans quels cas la prime de précarité n'est-elle pas due ?",
        answer:
          "Principalement : CDD saisonnier ou d'usage, job étudiant pendant les vacances, contrat aidé ou en alternance, embauche en CDI à l'issue du contrat, refus d'un CDI pour un emploi identique à rémunération équivalente, rupture anticipée du fait du salarié, faute grave ou force majeure.",
      },
      {
        question: "La prime de fin de CDD est-elle imposable ?",
        answer:
          "Oui : elle est soumise aux cotisations sociales et à l'impôt sur le revenu comme un complément de salaire. C'est une différence majeure avec l'indemnité de rupture conventionnelle, en partie exonérée.",
      },
      {
        question: "Quand la prime est-elle versée ?",
        answer:
          "À la fin du contrat, avec le dernier salaire : elle figure sur le dernier bulletin de paie et dans le solde de tout compte. Elle se calcule sur la totalité de la rémunération brute perçue, renouvellements de CDD inclus.",
      },
    ],
  },
  {
    slug: "capital-social",
    icon: "🥧",
    title: "Répartition du capital social",
    h1: "Répartition du capital social : parts, pourcentages et seuils de contrôle",
    metaTitle: "Capital Social : Simulateur de Répartition entre Associés",
    metaDescription:
      "Saisissez les apports de chaque associé : pourcentages, nombre de parts et seuils de contrôle (majorité, minorité de blocage) calculés instantanément.",
    eyebrow: "Outil gratuit",
    intro:
      "Saisissez les apports de chaque associé : pourcentages, nombre de parts et seuils de contrôle (majorité simple, deux tiers, minorité de blocage) calculés instantanément.",
    render: () => <CapitalSocialSimulator />,
    faqs: [
      {
        question: "Qu'est-ce que la minorité de blocage ?",
        answer:
          "Détenir plus d'un tiers du capital (33,34 % et plus) permet de bloquer les décisions extraordinaires (modification des statuts, augmentation de capital…) qui requièrent une majorité des deux tiers. C'est une protection classique de l'associé minoritaire significatif.",
      },
      {
        question: "Une répartition 50/50 est-elle une bonne idée ?",
        answer:
          "Elle est risquée : aucune décision ne peut être imposée et un désaccord peut paralyser la société, parfois jusqu'à la dissolution judiciaire. Si vous y tenez, prévoyez des mécanismes de sortie de crise dans un pacte d'associés.",
      },
      {
        question: "Quel capital social minimum faut-il ?",
        answer:
          "1 € suffit juridiquement en SARL et en SAS (37 000 € en SA), mais un capital trop faible fragilise la crédibilité bancaire et la trésorerie. Les apports en numéraire peuvent n'être libérés que partiellement à la constitution (20 % en SARL, 50 % en SAS).",
      },
    ],
  },
  {
    slug: "charges",
    icon: "📊",
    title: "Simulateur de charges sociales",
    h1: "Simulateur de charges sociales 2026",
    metaTitle: "Simulateur de Charges Sociales 2026 (Micro, TNS, SASU)",
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
    metaTitle: "Micro-entreprise, EI ou SASU ? Comparateur de Statuts 2026",
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
          "Le traitement diffère selon le scénario : les résultats micro-entreprise et EI sont affichés avant impôt personnel. Le scénario SASU retranche l’IS puis un prélèvement sur les dividendes. Le calcul ne modélise pas votre foyer fiscal ; les trois résultats ne représentent donc pas tous un revenu après impôt comparable.",
      },
    ],
  },
  {
    slug: "tjm",
    icon: "💶",
    title: "Calculateur de TJM",
    h1: "Calculateur de TJM freelance",
    metaTitle: "Calcul du TJM Freelance 2026 : quel taux journalier viser ?",
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
    metaTitle: "Simulateur LMNP 2026 : Micro-BIC ou Réel (amortissement) ?",
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
    metaTitle: "Tarif Expert-Comptable : Simulateur d'Honoraires 2026",
    metaDescription:
      "Estimez un ordre de grandeur mensuel selon votre forme juridique, votre chiffre d'affaires et vos salariés, puis préparez des demandes comparables.",
    eyebrow: "Outil gratuit",
    intro:
      "Le prix d'un expert-comptable dépend notamment de votre forme juridique, de votre volume d'activité et du nombre de salariés. Obtenez une fourchette indicative, puis confrontez-la à des propositions détaillées.",
    render: () => <HonorairesSimulator />,
    faqs: [
      {
        question: "Quel est le prix moyen d'un expert-comptable en 2026 ?",
        answer:
          "Il n'existe pas de tarif universel : le périmètre, le volume de pièces, les déclarations, la paie, les outils et le niveau de suivi font varier les propositions. Utilisez la fourchette comme point de départ et demandez le détail de chaque devis.",
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
    metaTitle: "Salaire Expert-Comptable 2026 : Grille par Expérience et Région",
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
