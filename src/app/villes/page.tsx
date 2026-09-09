import type { Metadata } from "next";
import { db } from "@/libs/db";
import { AppConfig } from "@/utils/AppConfig";
import { BreadcrumbJsonLd, ItemListJsonLd, WebPageJsonLd } from "@/components/JsonLd";
import { CollectionHubV2 } from "@/components/hubs/shared/CollectionHubV2";

export const metadata: Metadata = {
  title: "Experts-comptables par ville",
  description: "Explorez les pages locales et préparez vos critères avant de comparer les cabinets comptables référencés dans votre zone.",
  alternates: { canonical: `${AppConfig.url}/villes` },
};

export default async function VillesPage() {
  const [villes, departements] = await Promise.all([
    db.getVilles().catch(() => []),
    db.getDepartements().catch(() => []),
  ]);
  const items = villes
    .slice()
    .sort((a, b) => b.population - a.population)
    .map((ville) => ({
      href: `/villes/${ville.slug}`,
      title: ville.name,
      description: `Repères pour comparer les missions et les professionnels comptables à ${ville.name}.`,
      group: ville.region ?? "Autres régions",
      meta: ville.departement ? `Département ${ville.departement}` : "Page locale",
    }));
  const groups = [...new Set(items.map((item) => item.group))].sort((a, b) => a.localeCompare(b, "fr"));
  const breadcrumbs = [
    { name: "Accueil", url: "/" },
    { name: "Villes", url: "/villes" },
  ];

  return (
    <CollectionHubV2
      eyebrow="Parcours géographique"
      title="Commencez près de chez vous,"
      titleAccent="choisissez avec vos critères."
      intro="La proximité ouvre la recherche. Votre activité, la mission, les outils et le mode d’échange permettent ensuite de comparer des options réellement pertinentes."
      breadcrumbs={breadcrumbs}
      media={{
        src: "/images/skoria-v2/editorial/cityscape.webp",
        alt: "Maquette abstraite d’un quartier français",
      }}
      tone="mint"
      stats={[
        { value: String(villes.length), label: "villes éditoriales" },
        { value: String(departements.length), label: "départements" },
        { value: "Public", label: "source des fiches" },
        { value: "Visible", label: "statut de qualification" },
      ]}
      catalogEyebrow="Explorer les villes"
      catalogTitle="Trouvez une page locale et préparez la comparaison."
      catalogCopy="Les pages ci-dessous donnent des repères locaux et renvoient vers l’annuaire qualifié. Pour une recherche plus large, utilisez l’annuaire national et sa recherche par ville."
      items={items}
      groups={groups}
      searchPlaceholder="Rechercher une ville ou une région…"
      steps={[
        { title: "Choisir une zone", body: "Repérez une ville ou un département compatible avec le mode d’échange que vous recherchez." },
        { title: "Ouvrir l’annuaire", body: "Consultez l’identité, la provenance, le statut et les informations documentées des établissements." },
        { title: "Comparer le périmètre", body: "Confirmez l’expérience métier, les livrables, les outils, la disponibilité et les honoraires directement avec les cabinets." },
      ]}
      methodTitle="La proximité est un critère. Elle n’est pas une recommandation."
      methodCopy="Une adresse locale peut faciliter un rendez-vous, la connaissance d’un réseau ou le traitement de certaines pièces. Elle ne prouve ni une spécialisation ni la qualité de l’accompagnement. Skoria distingue les données administratives, les enrichissements et les éléments encore à confirmer."
      seoTitle="Comparer un expert-comptable dans sa ville."
      seoParagraphs={[
        "Une recherche locale commence par le format de relation attendu : rendez-vous physiques, échanges à distance ou combinaison des deux. La zone géographique devient alors un filtre pratique, à compléter par les besoins de l’activité et par l’organisation de la mission.",
        "Avant de retenir un cabinet, demandez qui sera votre interlocuteur, comment les documents circulent, quels travaux sont inclus et comment une demande ponctuelle est traitée. Les pages locales et les guides métier vous aident à préparer la même grille pour plusieurs échanges.",
      ]}
      faqs={[
        { question: "La première fiche est-elle recommandée par Skoria ?", answer: "Non. La position dans une liste ne constitue pas une recommandation individuelle. Consultez le statut, les sources et confirmez les critères importants avec chaque cabinet." },
        { question: "Puis-je choisir un cabinet à distance ?", answer: "Oui, si son organisation, ses outils et sa disponibilité correspondent à vos attentes. Comparez le mode d’échange et la gestion des documents aussi attentivement que la distance." },
        { question: "Quelle différence entre page ville et annuaire ?", answer: "La page ville apporte des repères et du contexte. L’annuaire présente les établissements disponibles avec leur provenance et leur statut de qualification." },
      ]}
      ctaNeed="Comparer des cabinets dans ma zone"
      variant="geo"
    >
      <BreadcrumbJsonLd items={breadcrumbs} />
      <WebPageJsonLd name="Experts-comptables par ville" description={metadata.description as string} url="/villes" />
      <ItemListJsonLd name="Villes Skoria" url="/villes" items={villes.map((ville) => ({ name: ville.name, url: `/villes/${ville.slug}` }))} />
    </CollectionHubV2>
  );
}
