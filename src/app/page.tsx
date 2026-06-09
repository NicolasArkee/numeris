import type { Metadata } from "next";
import { db } from "@/libs/db";
import { Hero } from "@/components/Hero";
import { TrustBar } from "@/components/TrustBar";
import { Services } from "@/components/Services";
import { ProcessSteps } from "@/components/ProcessSteps";
import { Team } from "@/components/Team";
import { Pricing } from "@/components/Pricing";
import { Testimonials } from "@/components/Testimonials";
import { SimulatorTeaser } from "@/components/SimulatorTeaser";
import { PressLogos } from "@/components/PressLogos";
import { Faq } from "@/components/Faq";
import { CtaContact } from "@/components/CtaContact";
import { StickyMobileCTA } from "@/components/StickyMobileCTA";
import { LocalBusinessJsonLd, FaqJsonLd, WebPageJsonLd } from "@/components/JsonLd";
import { AppConfig } from "@/utils/AppConfig";

export const metadata: Metadata = {
  title: `${AppConfig.name} Expertise Comptable à Paris | Cabinet comptable depuis ${AppConfig.foundedYear}`,
  description: AppConfig.description,
  alternates: {
    canonical: `${AppConfig.url}/`,
  },
};

export default function HomePage() {
  const services = db.getServices();
  const teamMembers = db.getTeamMembers();
  // 33 rows en DB (dont 30 fictifs gen IA) — la section homepage est bornée
  // aux témoignages featured, plafonnée à 9.
  const allTestimonials = db.getTestimonials();
  const featured = allTestimonials.filter((t) => t.featured);
  const testimonials = (featured.length > 0 ? featured : allTestimonials).slice(0, 9);
  const pricingPlans = db.getPricingPlans();
  const faqItems = db.getFaqItems();

  return (
    <>
      <LocalBusinessJsonLd />
      <WebPageJsonLd
        name={`${AppConfig.name} Expertise Comptable à Paris`}
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
      <Team members={teamMembers} />
      <Testimonials testimonials={testimonials} />
      <SimulatorTeaser />
      <Pricing plans={pricingPlans} />
      <PressLogos />
      <Faq items={faqItems} />
      <CtaContact />
      <StickyMobileCTA />
    </>
  );
}
