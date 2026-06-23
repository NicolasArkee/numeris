import type { Metadata } from "next";
import { AppConfig } from "@/utils/AppConfig";
import { PageHero } from "@/components/PageHero";
import { ContentSection } from "@/components/ContentSection";
import { BreadcrumbJsonLd } from "@/components/JsonLd";
import { legalEntity } from "@/data/legal-entity";

export const metadata: Metadata = {
  title: `Qui sommes-nous | ${AppConfig.name} ${AppConfig.tagline}`,
  description: `Découvrez ${legalEntity.companyName}, éditeur du comparateur indépendant Skoria : méthode, sources, limites éditoriales et demandes de correction.`,
  alternates: { canonical: `${AppConfig.url}/qui-sommes-nous` },
  robots: { index: true, follow: true },
};

const annéesExperience = new Date().getFullYear() - legalEntity.creationYear;

export default function QuiSommesNousPage() {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Accueil", url: "/" },
          { name: "Qui sommes-nous", url: "/qui-sommes-nous" },
        ]}
      />

      <PageHero
        eyebrow="Comparateur indépendant"
        title="Qui"
        titleAccent="sommes-nous"
        subtitle={`${AppConfig.name} aide les entrepreneurs à comprendre leurs besoins, comparer les critères utiles et préparer leurs échanges avec des professionnels comptables.`}
        breadcrumbs={[
          { name: "Accueil", url: "/" },
          { name: "Qui sommes-nous", url: "/qui-sommes-nous" },
        ]}
        cta={{ label: "Demander une orientation", href: "/contact" }}
      />

      <section className="bg-bg px-6 py-20 lg:px-[4.5rem]">
        <div className="mx-auto max-w-[60rem]">
          <ContentSection
            id="mission"
            title="Notre mission"
            variant="highlighted"
            paragraphs={[
              `${legalEntity.companyName} édite Skoria, une plateforme indépendante de comparaison et d'information. Nous ne réalisons pas de mission comptable, fiscale, sociale ou juridique individualisée.`,
              `Notre rôle consiste à rendre les critères de choix plus lisibles : besoins métier, localisation, périmètre de mission, documents à préparer, points de vigilance et données administratives publiques lorsqu'elles sont disponibles.`,
              `Les contenus Skoria sont conçus pour préparer une comparaison et un premier échange. Ils ne remplacent pas l'analyse d'un professionnel habilité sur une situation particulière.`,
            ]}
          />

          <ContentSection
            id="independance"
            title="Indépendance et limites"
            paragraphs={[
              `Skoria n'est pas une institution professionnelle, une administration, ni un cabinet comptable. La plateforme ne revendique aucune affiliation officielle avec les professionnels éventuellement listés dans l'annuaire.`,
              `Aucune note, aucun avis client, aucun horaire et aucun service attribué à un professionnel n'est inventé. Lorsqu'une information n'est pas disponible dans une source publique ou documentée, elle n'est pas présentée comme certaine.`,
              `Les classements, maillages et contenus éditoriaux servent à faciliter la navigation et la comparaison. Ils ne constituent pas une recommandation personnalisée ni une garantie de qualité.`,
            ]}
          />

          <ContentSection
            id="sources"
            title="Sources et méthode"
            variant="bordered"
            paragraphs={[
              `Les pages d'annuaire s'appuient sur des données administratives publiques, sur les informations disponibles dans nos bases internes et sur les demandes de correction reçues.`,
              `Les guides par métier, secteur ou expertise sont structurés pour aider l'utilisateur à formuler les bonnes questions : obligations générales, documents à préparer, points de pilotage, risques à clarifier et critères de comparaison.`,
              `Chaque page distingue autant que possible les faits administratifs, les contenus éditoriaux et les éléments qui doivent être confirmés directement auprès du professionnel concerné.`,
            ]}
          />

          <ContentSection
            id="corrections"
            title="Correction des données"
            paragraphs={[
              `Une entreprise, un professionnel ou un utilisateur peut demander la correction, la mise à jour ou le retrait d'une information inexacte via la page contact.`,
              `Les demandes sont examinées à partir d'éléments vérifiables : SIRET, adresse, source administrative, justificatif public ou indication documentée de l'erreur signalée.`,
              `Contact : ${legalEntity.emailContact}.`,
            ]}
          />

          <ContentSection
            id="editeur"
            title="Éditeur"
            paragraphs={[
              `Le site ${legalEntity.websiteDomain} est édité par ${legalEntity.companyName}, ${legalEntity.legalForm} au capital de ${legalEntity.capital}.`,
              `Siège social : ${legalEntity.addressSiege}.`,
              `Immatriculation : ${legalEntity.rcs}.`,
              `Activité déclarée : ${legalEntity.naf} (${legalEntity.nafLabel}).`,
              `La plateforme est active depuis ${annéesExperience} ans sous la marque Skoria.`,
            ]}
          />
        </div>
      </section>
    </>
  );
}
