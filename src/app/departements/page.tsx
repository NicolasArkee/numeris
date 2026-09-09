import type { Metadata } from "next";
import { db } from "@/libs/db";
import { AppConfig } from "@/utils/AppConfig";
import { BreadcrumbJsonLd, ItemListJsonLd, WebPageJsonLd } from "@/components/JsonLd";
import { CollectionHubV2 } from "@/components/hubs/shared/CollectionHubV2";

export const revalidate = 86400;

export const metadata: Metadata = {
  title: "Experts-comptables par département",
  description: "Explorez les départements français, leurs villes et les critères utiles pour comparer un cabinet comptable dans votre zone.",
  alternates: { canonical: `${AppConfig.url}/departements` },
};

export default async function DepartementsPage() {
  const departements = await db.getDepartements().catch(() => []);
  const items = departements
    .slice()
    .sort((a, b) => a.code.localeCompare(b.code, "fr", { numeric: true }))
    .map((departement) => ({
      href: `/departements/${departement.slug}`,
      title: `${departement.name} (${departement.code})`,
      description: `Villes, missions et repères pour préparer une comparaison dans le département ${departement.name}.`,
      group: departement.region ?? "Autres régions",
      meta: `Code ${departement.code}`,
    }));
  const groups = [...new Set(items.map((item) => item.group))].sort((a, b) => a.localeCompare(b, "fr"));
  const breadcrumbs = [
    { name: "Accueil", url: "/" },
    { name: "Départements", url: "/departements" },
  ];

  return (
    <CollectionHubV2
      eyebrow="France · par département"
      title="Élargissez la recherche,"
      titleAccent="gardez le contexte local."
      intro="Explorez les départements, rejoignez leurs villes et appliquez la même grille de comparaison aux cabinets que vous contactez."
      breadcrumbs={breadcrumbs}
      media={{
        src: "/images/skoria-v2/editorial/cityscape.webp",
        alt: "Maquette abstraite d’un quartier français",
        position: "58% center",
      }}
      tone="lilac"
      stats={[
        { value: String(departements.length), label: "départements listés" },
        { value: String(groups.length), label: "régions" },
        { value: "3", label: "étapes de comparaison" },
        { value: "1", label: "brief réutilisable" },
      ]}
      catalogEyebrow="Index départemental"
      catalogTitle="Parcourez le territoire sans perdre votre intention."
      catalogCopy="Filtrez par région ou recherchez un département. Chaque page relie les villes disponibles, les missions à comparer et les questions à préparer."
      items={items}
      groups={groups}
      searchPlaceholder="Rechercher un département, un code ou une région…"
      steps={[
        { title: "Sélectionner le département", body: "Utilisez le code, le nom ou la région pour rejoindre le bon niveau géographique." },
        { title: "Comparer les villes", body: "Repérez les zones pratiques selon vos déplacements et le mode de relation souhaité." },
        { title: "Qualifier les cabinets", body: "Vérifiez le statut des fiches, puis confirmez mission, expérience, outils et disponibilité." },
      ]}
      methodTitle="Le territoire organise l’exploration, le brief organise le choix."
      methodCopy="Le hub départemental sert de passerelle entre la vue nationale et les pages locales. Il n’attribue aucune qualité à un professionnel sur sa seule implantation. Les informations de cabinet gardent leur provenance et leur statut de qualification."
      seoTitle="Trouver un cabinet au bon niveau géographique."
      seoParagraphs={[
        "Le département convient lorsque vous souhaitez élargir une recherche au-delà d’une seule ville tout en conservant une proximité raisonnable. Il permet aussi de repérer plusieurs bassins d’activité avant de décider si des rendez-vous physiques sont réellement nécessaires.",
        "Une fois la zone définie, la comparaison revient aux éléments concrets : organisation de la collecte, interlocuteur, connaissance de l’activité, calendrier, prestations comprises et conditions du devis. Le brief Skoria conserve ces critères d’une page à l’autre.",
      ]}
      faqs={[
        { question: "Pourquoi chercher par département ?", answer: "Ce niveau élargit le choix tout en gardant une logique de proximité. Il est utile lorsque plusieurs villes restent accessibles ou lorsque vous acceptez une relation partiellement à distance." },
        { question: "Les cabinets sont-ils vérifiés ?", answer: "Chaque fiche affiche son statut. Les données administratives publiques sont distinguées des informations documentées ou encore à confirmer." },
        { question: "Puis-je comparer plusieurs départements ?", answer: "Oui. Gardez les mêmes critères dans votre brief, puis utilisez-les pour questionner des cabinets de zones différentes." },
      ]}
      ctaNeed="Comparer des cabinets par département"
      variant="geo"
    >
      <BreadcrumbJsonLd items={breadcrumbs} />
      <WebPageJsonLd name="Experts-comptables par département" description={metadata.description as string} url="/departements" />
      <ItemListJsonLd name="Départements Skoria" url="/departements" items={departements.map((departement) => ({ name: departement.name, url: `/departements/${departement.slug}` }))} />
    </CollectionHubV2>
  );
}
