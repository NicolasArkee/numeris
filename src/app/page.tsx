import type { Metadata } from "next";
import { db } from "@/libs/db";
import { Hero } from "@/components/Hero";
import { TrustBar } from "@/components/TrustBar";
import { Services } from "@/components/Services";
import { ProcessSteps } from "@/components/ProcessSteps";
import { SimulatorTeaser } from "@/components/SimulatorTeaser";
import { PressLogos } from "@/components/PressLogos";
import { Faq } from "@/components/Faq";
import { CtaContact } from "@/components/CtaContact";
import { StickyMobileCTA } from "@/components/StickyMobileCTA";
import { OrganizationJsonLd, WebSiteJsonLd, FaqJsonLd, WebPageJsonLd } from "@/components/JsonLd";
import { AppConfig } from "@/utils/AppConfig";

export const metadata: Metadata = {
  title: `${AppConfig.name} | Comparateur indépendant de professionnels comptables`,
  description: AppConfig.description,
  alternates: {
    canonical: `${AppConfig.url}/`,
  },
};

export default async function HomePage() {
  const services = await db.getServices();
  const faqItems = await db.getFaqItems();

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
      <Hero />
      <TrustBar />
      <Services services={services} />
      <ProcessSteps />
      <SimulatorTeaser />
      <PressLogos />
      <Faq items={faqItems} />
      <CtaContact />
      <StickyMobileCTA />
    </>
  );
}
