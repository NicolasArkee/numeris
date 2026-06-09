import type { Metadata } from "next";
import { AppConfig } from "@/utils/AppConfig";
import { PageHero } from "@/components/PageHero";
import { ContentSection } from "@/components/ContentSection";
import { BreadcrumbJsonLd } from "@/components/JsonLd";
import { legalEntity } from "@/data/legal-entity";

export const metadata: Metadata = {
  title: `Mentions légales | ${AppConfig.name} ${AppConfig.tagline}`,
  description: `Mentions légales de ${legalEntity.companyName} — éditeur, hébergeur, propriété intellectuelle, contact et données personnelles, conformément à l'article 6 de la LCEN.`,
  alternates: { canonical: `${AppConfig.url}/mentions-legales` },
  robots: { index: true, follow: true },
};

export default function MentionsLegalesPage() {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Accueil", url: "/" },
          { name: "Mentions légales", url: "/mentions-legales" },
        ]}
      />

      <PageHero
        eyebrow="Informations légales"
        title="Mentions"
        titleAccent="légales"
        subtitle={`Informations relatives à l'éditeur et à l'hébergeur du site ${legalEntity.websiteDomain}, conformément à la loi n° 2004-575 du 21 juin 2004 pour la confiance dans l'économie numérique.`}
        breadcrumbs={[
          { name: "Accueil", url: "/" },
          { name: "Mentions légales", url: "/mentions-legales" },
        ]}
      />

      <section className="bg-creme px-6 py-20 lg:px-[4.5rem]">
        <div className="mx-auto max-w-[60rem]">
          <ContentSection
            id="editeur"
            title="1. Éditeur du site"
            variant="highlighted"
            paragraphs={[
              `Le site ${legalEntity.websiteDomain} est édité par la société ${legalEntity.companyName}, ${legalEntity.legalForm} au capital de ${legalEntity.capital}.`,
              `Siège social : ${legalEntity.addressSiege}.`,
              `Immatriculée au ${legalEntity.rcs} sous le numéro SIREN ${legalEntity.sirenFormatted}.`,
              `Numéro SIRET de l'établissement principal : ${legalEntity.siretFormatted}.`,
              `Code APE / NAF : ${legalEntity.naf} (${legalEntity.nafLabel}).`,
              `Numéro de TVA intracommunautaire : ${legalEntity.tvaIntra}.`,
              `${legalEntity.presidentTitle} : ${legalEntity.presidentName}.`,
              `Téléphone : ${legalEntity.phoneSiege}.`,
              `Courriel : ${legalEntity.emailContact}.`,
            ]}
          />

          <ContentSection
            id="ordre"
            title="2. Inscription à l'Ordre et déontologie"
            paragraphs={[
              `${legalEntity.companyName} exerce sa mission d'expertise comptable dans le respect des dispositions de l'ordonnance n° 45-2138 du 19 septembre 1945 modifiée et du décret n° 2012-432 du 30 mars 2012 relatif à l'exercice de l'activité d'expertise comptable.`,
              `Cabinet inscrit au Tableau du ${legalEntity.oecRegion}. Numéro d'inscription au Tableau de l'Ordre : ${legalEntity.oecNumber}.`,
              `Les professionnels du cabinet sont tenus au respect du Code de déontologie des professionnels de l'expertise comptable annexé au décret n° 2012-432, en particulier au secret professionnel défini à l'article 21 de l'ordonnance du 19 septembre 1945.`,
              `Autorité de tutelle : Conseil supérieur de l'Ordre des Experts-Comptables — 19, rue Cognacq-Jay, 75341 Paris Cedex 07.`,
            ]}
          />

          <ContentSection
            id="rcp"
            title="3. Assurance Responsabilité Civile Professionnelle"
            paragraphs={[
              `Conformément à l'article 17 de l'ordonnance du 19 septembre 1945, ${legalEntity.companyName} a souscrit une assurance Responsabilité Civile Professionnelle.`,
              legalEntity.rcp,
            ]}
          />

          <ContentSection
            id="directeur-publication"
            title="4. Directeur de la publication"
            paragraphs={[
              `Le directeur de la publication du site ${legalEntity.websiteDomain} est ${legalEntity.publicationDirector}, en sa qualité de ${legalEntity.presidentTitle} de ${legalEntity.companyName}.`,
              `Toute demande relative au contenu éditorial du site peut être adressée à : ${legalEntity.emailContact}.`,
            ]}
          />

          <ContentSection
            id="hebergeur"
            title="5. Hébergeur"
            variant="bordered"
            paragraphs={[
              `Le site ${legalEntity.websiteDomain} est hébergé par : ${legalEntity.hostingProvider}.`,
              `L'hébergeur ne saurait être tenu pour responsable des contenus mis en ligne par l'éditeur.`,
            ]}
          />

          <ContentSection
            id="propriete-intellectuelle"
            title="6. Propriété intellectuelle"
            paragraphs={[
              `L'ensemble des éléments composant le site ${legalEntity.websiteDomain} (textes, structure, charte graphique, logos, photographies, illustrations, vidéos, code source, bases de données) est la propriété exclusive de ${legalEntity.companyName} ou de ses partenaires, et est protégé par les législations françaises et internationales relatives au droit d'auteur, au droit des marques et au droit des bases de données.`,
              `Toute reproduction, représentation, modification, publication, transmission, dénaturation, totale ou partielle, du site ou de son contenu, par quelque procédé que ce soit, et sur quelque support que ce soit, est interdite sans autorisation écrite préalable de ${legalEntity.companyName}.`,
              `Toute exploitation non autorisée du site ou de l'un quelconque des éléments qu'il contient est constitutive de contrefaçon et susceptible d'engager la responsabilité civile et pénale de son auteur, conformément aux articles L. 335-2 et suivants du Code de la propriété intellectuelle.`,
            ]}
          />

          <ContentSection
            id="donnees-personnelles"
            title="7. Données personnelles et cookies"
            paragraphs={[
              `Les données personnelles collectées sur le site ${legalEntity.websiteDomain} font l'objet d'un traitement décrit dans la Politique de confidentialité du cabinet.`,
              `Le responsable de traitement est ${legalEntity.companyName}. Conformément au Règlement (UE) 2016/679 (RGPD) et à la loi n° 78-17 du 6 janvier 1978 modifiée, vous disposez de droits d'accès, de rectification, d'effacement, de limitation, de portabilité et d'opposition sur vos données.`,
              `Pour exercer ces droits, contactez le Délégué à la Protection des Données : ${legalEntity.dpoEmail}.`,
              `Vous disposez également du droit d'introduire une réclamation auprès de la Commission nationale de l'informatique et des libertés (CNIL) — 3, place de Fontenoy — TSA 80715 — 75334 Paris Cedex 07.`,
            ]}
          />

          <ContentSection
            id="responsabilite"
            title="8. Responsabilité éditoriale"
            paragraphs={[
              `${legalEntity.companyName} s'efforce d'assurer l'exactitude et la mise à jour des informations diffusées sur le site, sans toutefois en garantir l'exhaustivité ni l'absence de modification par un tiers (piratage, virus).`,
              `Les contenus à vocation informative publiés sur le site ${legalEntity.websiteDomain} ne sauraient se substituer à une consultation personnalisée avec un expert-comptable. Aucune information ne constitue un conseil juridique, fiscal ou comptable individualisé.`,
              `${legalEntity.companyName} ne pourra être tenue pour responsable des dommages directs ou indirects résultant de l'utilisation du site ou de l'impossibilité d'y accéder.`,
            ]}
          />

          <ContentSection
            id="droit-applicable"
            title="9. Droit applicable et juridiction compétente"
            paragraphs={[
              `Les présentes mentions légales sont régies par le droit français.`,
              `En cas de litige relatif à l'utilisation du site ${legalEntity.websiteDomain} et à défaut de résolution amiable, compétence exclusive est attribuée aux tribunaux du ressort du Tribunal judiciaire de Paris.`,
            ]}
          />

          <p className="mt-12 text-[0.72rem] text-ardoise/70">
            Dernière mise à jour des présentes mentions légales : juin 2026.
          </p>
        </div>
      </section>
    </>
  );
}
