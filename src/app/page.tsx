import type { Metadata } from "next";
import { db } from "@/libs/db";
import { Nav } from "@/components/Nav";
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
import { Footer } from "@/components/Footer";
import { StickyMobileCTA } from "@/components/StickyMobileCTA";
import { LocalBusinessJsonLd, FaqJsonLd } from "@/components/JsonLd";
import { AppConfig } from "@/utils/AppConfig";

export const metadata: Metadata = {
  title: `${AppConfig.name} Expertise Comptable à Paris | Cabinet comptable depuis ${AppConfig.foundedYear}`,
  description: AppConfig.description,
  alternates: {
    canonical: "/",
  },
};

export default function HomePage() {
  const services = db.getServices();
  const teamMembers = db.getTeamMembers();
  const testimonials = db.getTestimonials();
  const pricingPlans = db.getPricingPlans();
  const faqItems = db.getFaqItems();

  return (
    <>
      <LocalBusinessJsonLd />
      <FaqJsonLd
        items={faqItems.map((f) => ({
          question: f.question,
          answer: f.answer,
        }))}
      />
      <Nav />
      <main>
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
      </main>
      <Footer />
      <StickyMobileCTA />
    </>
  );
}
