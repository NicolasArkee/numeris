import type { Metadata } from "next";
import { AppConfig } from "@/utils/AppConfig";
import { CommercialHubPage } from "@/components/CommercialHubPage";

export const revalidate = 86400;

export const metadata: Metadata = {
  title: "Comparatifs d’outils et services pour entreprises",
  description: `Comparez les outils, banques et solutions pour entrepreneurs avec une grille commune : usages, coût complet, limites, date des informations et sources disponibles.`,
  alternates: { canonical: `${AppConfig.url}/comparatifs` },
};

export default function ComparatifsHubPage() {
  return <CommercialHubPage route="comparatifs" />;
}
