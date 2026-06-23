import type { Metadata } from "next";
import { AppConfig } from "@/utils/AppConfig";
import { CommercialHubPage } from "@/components/CommercialHubPage";

export const revalidate = 86400;

export const metadata: Metadata = {
  title: `Codes parrainage business | ${AppConfig.name}`,
  description: `Codes parrainage vérifiés et à jour pour les solutions business : néobanques, comptabilité, paie, outils marketing.`,
  alternates: { canonical: `${AppConfig.url}/codes-parrainage` },
};

export default function CodesParrainageHubPage() {
  return <CommercialHubPage route="codes-parrainage" />;
}
