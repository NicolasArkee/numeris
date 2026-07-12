import type { Metadata } from "next";
import { db } from "@/libs/db";
import { AppConfig } from "@/utils/AppConfig";
import { ClusterPage } from "@/components/ClusterPage";
import { DirectoryComplianceNotice } from "@/components/directory/DirectoryComplianceNotice";
import { DirectorySearch } from "@/components/directory/DirectorySearch";
import { ItemListJsonLd } from "@/components/JsonLd";
import { getListingCabinetTotal } from "@/components/home/home-data";

// ISR: regenerated at most every hour. Keeps this page out of the synchronous
// SSG batch that saturates Supabase when 30k pages build concurrently.
export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Annuaire comparatif des cabinets comptables | Skoria",
  description:
    "Recherche de cabinets comptables avec provenance administrative, sources publiques et statut de fiche documente lorsqu'il existe.",
  alternates: { canonical: `${AppConfig.url}/annuaire/experts-comptables` },
};

export default async function ExpertsComptablesDirectoryPage() {
  const cities = await db.getDirectoryListingCities();
  // Head-count exact — l'ancien getDirectoryListingCabinetCount post-filtrait
  // une fenêtre PostgREST tronquée à 1 000 rows : chiffre faux ET requête
  // lourde qui timeoutait le prerender (57014) sous charge.
  const count = await getListingCabinetTotal();
  const verifiedCount = await db.getPublishedDirectoryCabinetCount();

  return (
    <ClusterPage
      eyebrow="Annuaire"
      h1="Annuaire comparatif des cabinets comptables"
      intro={`${count} cabinet${count > 1 ? "s" : ""} candidat${count > 1 ? "s" : ""} ou documente${count > 1 ? "s" : ""} avec provenance publique, dont ${verifiedCount} fiche${verifiedCount > 1 ? "s" : ""} documentee${verifiedCount > 1 ? "s" : ""}.`}
      breadcrumbs={[
        { name: "Accueil", url: "/" },
        { name: "Annuaire", url: "/annuaire/experts-comptables" },
      ]}
      linkGroups={[]}
      canonicalUrl={`${AppConfig.url}/annuaire/experts-comptables`}
      articleSchema={false}
      reviewLabel="Statut annuaire explicite"
    >
      <ItemListJsonLd
        name={`Annuaire ${AppConfig.name} — experts-comptables par ville`}
        description="Liste des villes pour lesquelles au moins une fiche cabinet est publiée ou en cours de qualification."
        url="/annuaire/experts-comptables"
        numberOfItems={cities.length}
        items={cities.slice(0, 50).map((city) => ({
          name: city.name,
          url: `/expert-comptable/${city.slug}`,
        }))}
      />
      <DirectoryComplianceNotice />
      <div className="mt-10">
        <DirectorySearch cities={cities} />
      </div>
    </ClusterPage>
  );
}
