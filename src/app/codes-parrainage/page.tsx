import type { Metadata } from "next";
import { AppConfig } from "@/utils/AppConfig";
import { CommercialHubPage } from "@/components/CommercialHubPage";

export const revalidate = 86400;

export const metadata: Metadata = {
  title: "Codes et offres pour solutions business",
  description: "Codes et offres pour les solutions business : statut affiché, conditions à examiner et lien vers la source lorsqu’elle est disponible.",
  alternates: { canonical: `${AppConfig.url}/codes-parrainage` },
};

export default function CodesParrainageHubPage() {
  return <CommercialHubPage route="codes-parrainage" />;
}
