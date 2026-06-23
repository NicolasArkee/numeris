import type { Metadata } from "next";
import { AppConfig } from "@/utils/AppConfig";
import { CommercialHubPage } from "@/components/CommercialHubPage";

export const revalidate = false;

export const metadata: Metadata = {
  title: `Comparatifs indépendants | ${AppConfig.name}`,
  description: `Comparatifs indépendants des outils, banques et solutions pour entrepreneurs. Critères vérifiables, classement transparent.`,
  alternates: { canonical: `${AppConfig.url}/comparatifs` },
};

export default function ComparatifsHubPage() {
  return <CommercialHubPage route="comparatifs" />;
}
