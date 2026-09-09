import type { Metadata } from "next";
import { AppConfig } from "@/utils/AppConfig";
import { CommercialHubPage } from "@/components/CommercialHubPage";

export const revalidate = 86400;

export const metadata: Metadata = {
  title: "Avis sur les solutions pour entrepreneurs",
  description: `Consultez les analyses de solutions pour entrepreneurs publiées sur ${AppConfig.name} : usages, limites, conditions et sources disponibles sont distingués avant comparaison.`,
  alternates: { canonical: `${AppConfig.url}/avis` },
};

export default function AvisHubPage() {
  return <CommercialHubPage route="avis" />;
}
