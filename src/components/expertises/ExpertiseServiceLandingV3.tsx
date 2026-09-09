import type {
  PageSection,
  Profession,
  ProfessionCategory,
  Secteur,
  Service,
} from "@/libs/db";
import { ServiceLandingTemplate } from "@/components/templates/service/ServiceLandingTemplate";
import {
  buildServiceLandingFaqItems,
  buildServiceProfessionCards,
  buildServiceSectorCards,
  buildServiceSeoContentPack,
} from "./service-v3-helpers";

type ServiceSeo = {
  h1: string;
  intro: string;
  faqs: { question: string; answer: string }[];
};

function mergeFaqItems(
  ...groups: Array<Array<{ question: string; answer: string }>>
) {
  const seen = new Set<string>();
  return groups.flat().filter((item) => {
    const key = item.question.trim().toLocaleLowerCase("fr");
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function ExpertiseServiceLandingV3({
  service,
  seo,
  secteurs,
  professions,
  categories,
  dbSections = [],
}: {
  service: Service;
  seo: ServiceSeo;
  secteurs: Secteur[];
  professions: Profession[];
  categories: ProfessionCategory[];
  dbSections?: PageSection[];
}) {
  const content = buildServiceSeoContentPack(service);
  const sectorCards = buildServiceSectorCards(service.slug, secteurs, 8);
  const professionCards = buildServiceProfessionCards(
    service.slug,
    professions,
    categories,
    10,
  );
  const faqItems = mergeFaqItems(
    buildServiceLandingFaqItems(service),
    seo.faqs,
  );

  return (
    <ServiceLandingTemplate
      service={service}
      seo={seo}
      content={content}
      sectorCards={sectorCards}
      professionCards={professionCards}
      faqItems={faqItems}
      dbSections={dbSections}
    />
  );
}
