import type { Metadata } from "next";
import { db } from "@/libs/db";
import { HomePageV2 } from "@/components/home/HomePageV2";
import { getListingCabinetTotal } from "@/components/home/home-data";
import { OrganizationJsonLd, WebSiteJsonLd, FaqJsonLd, WebPageJsonLd } from "@/components/JsonLd";
import { AppConfig } from "@/utils/AppConfig";
import type { FaqItem } from "@/libs/db";

// HP « registre » (redesign 2026-07) : hero recherche + compteurs réels,
// méthode/indépendance, annuaire par ville, missions, tarifs+simulateurs,
// guides, professions, FAQ. Plus de classement fabriqué ni de logos presse.
export const revalidate = 86400;

export const metadata: Metadata = {
  title: { absolute: "Comparateur indépendant d'experts-comptables | Skoria" },
  description:
    "Trouvez l'expert-comptable adapté à votre activité. Comparez les missions, explorez l'annuaire et préparez un premier échange à partir de données sourcées.",
  alternates: {
    canonical: `${AppConfig.url}/`,
  },
};

// FAQ éditoriale de la page d'accueil. Elle reste locale au template pour que
// le contenu visible et le schéma FAQPage partagent exactement la même source.
// Les anciennes FAQ globales du CMS mélangeaient information comparative et
// promesses de prestation : elles ne sont donc pas injectées ici.
const HOME_FAQ_ITEMS: FaqItem[] = [
  {
    id: -1,
    order_index: 0,
    question: "À quoi sert Skoria ?",
    answer:
      "Skoria rassemble des informations, des critères de comparaison et des outils de préparation. Le site aide à décrire un besoin et à examiner plusieurs options ; la mission et ses conditions se confirment directement avec le cabinet retenu.",
  },
  {
    id: -2,
    order_index: 1,
    question: "Comment comparer deux cabinets d’expertise comptable ?",
    answer:
      "Utilisez le même périmètre pour chaque échange : tâches incluses, livrables, calendrier, interlocuteur, outils, modalités de reprise et éléments facturés séparément. Vous pourrez alors rapprocher les propositions sans réduire le choix à un montant global.",
  },
  {
    id: -3,
    order_index: 2,
    question: "D’où viennent les informations de l’annuaire ?",
    answer:
      "Les fiches distinguent les données administratives disponibles, les informations issues de sources publiques ou de sites professionnels et les éléments qui restent à confirmer. La source et le statut affichés permettent d’évaluer chaque information.",
  },
  {
    id: -4,
    order_index: 3,
    question: "Un cabinet proche est-il toujours préférable ?",
    answer:
      "La proximité peut faciliter certains rendez-vous, mais elle ne renseigne pas à elle seule sur les missions traitées, les outils, les délais ou la disponibilité. Comparez ces critères avec le mode de collaboration à distance proposé par chaque cabinet.",
  },
  {
    id: -5,
    order_index: 4,
    question: "Peut-on connaître les honoraires avant le premier échange ?",
    answer:
      "Un montant dépend notamment du volume de pièces, de la fréquence de suivi, des déclarations, des outils et des travaux ponctuels. Les simulateurs donnent des repères pédagogiques ; seul un devis détaillé permet de confirmer le périmètre et son prix.",
  },
  {
    id: -6,
    order_index: 5,
    question: "Que faut-il préparer avant de contacter un cabinet ?",
    answer:
      "Rassemblez votre statut, votre activité, vos volumes, vos échéances, vos outils actuels et les livrables attendus. Le brief Skoria organise ces éléments pour vous aider à poser les mêmes questions à plusieurs interlocuteurs.",
  },
  {
    id: -7,
    order_index: 6,
    question: "Comment utiliser le brief préparé sur Skoria ?",
    answer:
      "Le brief reste dans votre navigateur et peut être téléchargé. Relisez-le avant chaque rendez-vous, complétez les volumes ou échéances manquants, puis partagez uniquement les éléments utiles avec les cabinets que vous contactez. Conservez la même base pour comparer les réponses, les exclusions et les prochaines étapes proposées.",
  },
];

export default async function HomePage() {
  const [services, cities, professions, sectors, cabinetCount] = await Promise.all([
    db.getServices().catch(() => []),
    db.getDirectoryListingCities().catch(() => []),
    db.getProfessions().catch(() => []),
    db.getSecteurs().catch(() => []),
    getListingCabinetTotal(),
  ]);
  const faqItems = HOME_FAQ_ITEMS;

  return (
    <>
      <OrganizationJsonLd />
      <WebSiteJsonLd />
      <WebPageJsonLd
        name={`${AppConfig.name} — comparateur indépendant`}
        description={AppConfig.description}
        url="/"
      />
      <FaqJsonLd
        items={faqItems.map((f) => ({
          question: f.question,
          answer: f.answer,
        }))}
      />
      <HomePageV2
        cities={cities}
        cabinetCount={cabinetCount}
        services={services}
        professions={professions}
        sectors={sectors}
        faqItems={faqItems}
      />
    </>
  );
}
