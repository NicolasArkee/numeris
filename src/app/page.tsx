import type { Metadata } from "next";
import { db } from "@/libs/db";
import { HomeHero } from "@/components/home/HomeHero";
import {
  HomeMethodStrip,
  HomeVilles,
  HomeExpertises,
  HomeGuides,
  HomeProfessions,
  HomeDualCta,
} from "@/components/home/HomeSections";
import { HomeTarifs } from "@/components/home/HomeTarifs";
import { Faq } from "@/components/Faq";
import { CtaContact } from "@/components/CtaContact";
import { StickyMobileCTA } from "@/components/StickyMobileCTA";
import { OrganizationJsonLd, WebSiteJsonLd, FaqJsonLd, WebPageJsonLd } from "@/components/JsonLd";
import { AppConfig } from "@/utils/AppConfig";

// HP « registre » (redesign 2026-07) : hero recherche + compteurs réels,
// méthode/indépendance, annuaire par ville, missions, tarifs+simulateurs,
// guides, professions, FAQ. Plus de classement fabriqué ni de logos presse.
export const revalidate = 86400;

export const metadata: Metadata = {
  title: `${AppConfig.name} | Comparateur indépendant d'experts-comptables`,
  description:
    "Comparez les experts-comptables de votre ville à partir de données publiques : annuaire national, statut de vérification explicite, ordres de prix et simulateurs gratuits.",
  alternates: {
    canonical: `${AppConfig.url}/`,
  },
};

// FAQ « désamorçage » — les 2 objections frontales du modèle comparateur,
// affichées avant les questions génériques de la DB.
const OBJECTION_FAQ = [
  {
    question: "Pourquoi Skoria est-il gratuit ?",
    answer:
      "La consultation de l'annuaire, des comparatifs et des simulateurs est gratuite et sans compte. Skoria se finance par des partenariats clairement identifiés sur les pages concernées — jamais par la vente de classements ni par des commissions cachées sur votre mise en relation.",
  },
  {
    question: "Skoria est-il vraiment indépendant ?",
    answer:
      "Oui. Aucun cabinet ne détient Skoria, aucune fiche n'est payante et l'ordre d'affichage n'est pas sponsorisé. Les fiches proviennent de sources administratives publiques (RNE, registre OEC, INSEE) et affichent explicitement leur statut de vérification.",
  },
];

export default async function HomePage() {
  const services = await db.getServices();
  const dbFaqItems = await db.getFaqItems();
  const faqItems = [
    ...OBJECTION_FAQ.map((f, i) => ({ id: -1 - i, order_index: -2 + i, ...f })),
    ...dbFaqItems,
  ];

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
      <HomeHero />
      <HomeMethodStrip />
      <HomeVilles />
      <HomeExpertises services={services} />
      <HomeTarifs />
      <HomeGuides />
      <HomeProfessions />
      <Faq items={faqItems} />
      <HomeDualCta />
      <CtaContact />
      <StickyMobileCTA />
    </>
  );
}
