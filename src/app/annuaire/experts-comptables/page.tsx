import type { Metadata } from "next";
import { db } from "@/libs/db";
import { AppConfig } from "@/utils/AppConfig";
import { ClusterPage } from "@/components/ClusterPage";
import { DirectoryComplianceNotice } from "@/components/directory/DirectoryComplianceNotice";
import { DirectorySearch } from "@/components/directory/DirectorySearch";
import { ItemListJsonLd } from "@/components/JsonLd";
import { getListingCabinetTotal } from "@/components/home/home-data";
import { withRetry } from "@/libs/db/withRetry";

// ISR: regenerated at most every hour. Keeps this page out of the synchronous
// SSG batch that saturates Supabase when 30k pages build concurrently.
export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Annuaire comparatif des cabinets comptables",
  description:
    "Recherche de cabinets comptables avec provenance administrative, sources publiques et statut de fiche documenté lorsqu’il existe.",
  alternates: { canonical: `${AppConfig.url}/annuaire/experts-comptables` },
};

interface Props {
  searchParams: Promise<{ q?: string | string[] }>;
}

function normalize(value: string): string {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

export default async function ExpertsComptablesDirectoryPage({ searchParams }: Props) {
  // Un timeout Supabase transitoire (57014) sur cette page SSG faisait
  // échouer TOUT le build : retry puis dégradation gracieuse (withRetry
  // partagé avec les sitemaps villes/fiches, même classe de bug).
  const cities = await withRetry(() => db.getDirectoryListingCities(), [], 2);
  // Head-count exact — l'ancien getDirectoryListingCabinetCount post-filtrait
  // une fenêtre PostgREST tronquée à 1 000 rows : chiffre faux ET requête
  // lourde qui timeoutait le prerender (57014) sous charge.
  const count = await withRetry(() => getListingCabinetTotal(), 0, 2);
  const verifiedCount = await withRetry(() => db.getPublishedDirectoryCabinetCount(), 0, 2);
  const rawQuery = (await searchParams).q;
  const query = (Array.isArray(rawQuery) ? rawQuery[0] : rawQuery)?.trim() ?? "";
  const needle = normalize(query);
  const displayedCities = cities
    .filter((city) => {
      if (!needle) return true;
      return normalize(`${city.name} ${city.department_code ?? ""} ${city.department_name ?? ""}`).includes(needle);
    })
    .sort((a, b) => b.population - a.population)
    .slice(0, 60);
  const directoryIntro = count > 0
    ? `${count.toLocaleString("fr-FR")} cabinet${count > 1 ? "s" : ""} candidat${count > 1 ? "s" : ""} ou documenté${count > 1 ? "s" : ""} avec provenance publique, dont ${verifiedCount.toLocaleString("fr-FR")} fiche${verifiedCount > 1 ? "s" : ""} documentée${verifiedCount > 1 ? "s" : ""}.`
    : "Explorez les cabinets par ville, vérifiez la provenance des informations disponibles et préparez les mêmes questions pour chaque premier échange.";

  return (
    <ClusterPage
      eyebrow="Annuaire"
      h1="Annuaire comparatif des cabinets comptables"
      intro={directoryIntro}
      breadcrumbs={[
        { name: "Accueil", url: "/" },
        { name: "Annuaire", url: "/annuaire/experts-comptables" },
      ]}
      linkGroups={[]}
      keyTakeaways={[
        "La présence administrative et la vérification professionnelle sont affichées séparément.",
        "La position dans la liste ne constitue pas une recommandation individuelle.",
        "Mission, interlocuteur, outils, disponibilité et honoraires restent à confirmer directement.",
      ]}
      faqs={[
        {
          question: "Comment les cabinets entrent-ils dans l’annuaire ?",
          answer: "Les fiches partent de données administratives publiques. Leur statut indique ensuite si des informations professionnelles ont été documentées ou si elles restent à confirmer.",
        },
        {
          question: "Le premier résultat est-il le meilleur cabinet ?",
          answer: "Non. L’ordre d’affichage ne constitue pas un conseil personnalisé. Utilisez les fiches pour préparer vos vérifications et confrontez plusieurs propositions avec les mêmes critères.",
        },
        {
          question: "Quelles questions poser avant de choisir ?",
          answer: "Décrivez votre activité, les volumes, les outils et les échéances. Demandez ensuite qui réalise chaque tâche, quels livrables sont inclus, comment se passent les échanges et comment le prix peut évoluer.",
        },
        {
          question: "Comment comparer plusieurs établissements d’une même ville ?",
          answer: "Ouvrez la page locale, ajoutez jusqu’à trois établissements à votre sélection et examinez leurs repères publics côte à côte. Exportez ensuite cette base de travail, complétez-la pendant vos échanges et notez séparément les informations confirmées par chaque cabinet : disponibilité, expérience métier, organisation, exclusions, livrables et honoraires.",
        },
      ]}
      canonicalUrl={`${AppConfig.url}/annuaire/experts-comptables`}
      articleSchema={false}
      reviewLabel="Statut annuaire explicite"
    >
      <ItemListJsonLd
        name={`Annuaire ${AppConfig.name} — experts-comptables par ville`}
        description="Liste des villes pour lesquelles au moins une fiche cabinet est publiée ou en cours de qualification."
        url="/annuaire/experts-comptables"
        numberOfItems={displayedCities.length}
        items={displayedCities.slice(0, 50).map((city) => ({
          name: city.name,
          url: `/expert-comptable/${city.slug}`,
        }))}
      />
      <DirectoryComplianceNotice />
      <div className="mt-10">
        <DirectorySearch
          cities={displayedCities}
          initialQuery={query}
          totalAvailable={cities.length}
        />
      </div>
      <section className="grid gap-8 lg:grid-cols-2">
        <div>
          <p className="text-[.65rem] font-bold uppercase tracking-[.18em] text-blue">Avant d’ouvrir une fiche</p>
          <h2 className="mt-4 text-[clamp(2rem,4vw,3.2rem)] font-semibold leading-tight text-ink">
            Définissez ce que vous attendez de la relation.
          </h2>
        </div>
        <div className="space-y-4 text-[.95rem] leading-8 text-ink-muted">
          <p>La proximité peut faciliter les rendez-vous, mais elle ne suffit pas à qualifier un accompagnement. Décidez si vous attendez des échanges physiques, une organisation à distance ou un fonctionnement hybride.</p>
          <p>Précisez ensuite les tâches à déléguer, les outils déjà utilisés, les échéances proches et le niveau de suivi souhaité. Ces éléments permettent de comparer des propositions sur un périmètre réellement comparable.</p>
        </div>
      </section>
      <section>
        <p className="text-[.65rem] font-bold uppercase tracking-[.18em] text-blue">Lire une fiche</p>
        <h2 className="mt-4 max-w-4xl text-[clamp(2rem,4vw,3.2rem)] font-semibold leading-tight text-ink">Ce qui est public, ce qui est documenté, ce qui reste à demander.</h2>
        <div className="mt-8 grid gap-px bg-ink/12 md:grid-cols-3">
          {[
            ["Données administratives", "Identité, établissement, adresse et identifiants sont rattachés à leur provenance publique."],
            ["Informations documentées", "Site, coordonnées, services ou secteurs ne sont affichés que selon leur source et leur statut."],
            ["Éléments à confirmer", "Disponibilité, expérience exacte, périmètre, honoraires et qualité de la relation se vérifient lors de l’échange."],
          ].map(([title, body]) => (
            <article key={title} className="bg-white p-6">
              <h3 className="text-lg font-semibold text-ink">{title}</h3>
              <p className="mt-3 text-[.84rem] leading-7 text-ink-muted">{body}</p>
            </article>
          ))}
        </div>
      </section>
    </ClusterPage>
  );
}
