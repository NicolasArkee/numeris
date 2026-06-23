import type { Metadata } from "next";
import { AppConfig } from "@/utils/AppConfig";
import { CommercialHubPage } from "@/components/CommercialHubPage";

export const revalidate = 86400;

export const metadata: Metadata = {
  title: `Avis indépendants | ${AppConfig.name}`,
  description: `Avis et synthèses neutres des solutions populaires pour entrepreneurs, par ${AppConfig.name}.`,
  alternates: { canonical: `${AppConfig.url}/avis` },
};

export default function AvisHubPage() {
  return <CommercialHubPage route="avis" />;
}
