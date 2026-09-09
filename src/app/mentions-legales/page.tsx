import type { Metadata } from "next";
import { AppConfig } from "@/utils/AppConfig";
import { BreadcrumbJsonLd } from "@/components/JsonLd";
import { LegalDocumentPage, type LegalDocumentSection } from "@/components/legal/LegalDocumentPage";
import { legalEntity } from "@/data/legal-entity";

export const metadata: Metadata = {
  title: "Mentions légales",
  description: `Mentions légales de ${legalEntity.companyName} — éditeur, hébergeur, propriété intellectuelle, contact et données personnelles, conformément à l'article 6 de la LCEN.`,
  alternates: { canonical: `${AppConfig.url}/mentions-legales` },
  robots: { index: true, follow: true },
};

const sections: LegalDocumentSection[] = [
  {
    id: "editeur",
    title: "1. Éditeur du site",
    paragraphs: [
      `Le site ${legalEntity.websiteDomain} est édité par la société ${legalEntity.companyName}, ${legalEntity.legalForm} au capital de ${legalEntity.capital}.`,
      `Siège social : ${legalEntity.addressSiege}.`,
      `Immatriculée au ${legalEntity.rcs} sous le numéro SIREN ${legalEntity.sirenFormatted}.`,
      `Numéro SIRET de l'établissement principal : ${legalEntity.siretFormatted}.`,
      `Code APE / NAF : ${legalEntity.naf} (${legalEntity.nafLabel}).`,
      `Numéro de TVA intracommunautaire : ${legalEntity.tvaIntra}.`,
      `${legalEntity.presidentTitle} : ${legalEntity.presidentName}.`,
      `Téléphone : ${legalEntity.phoneSiege}.`,
      `Courriel : ${legalEntity.emailContact}.`,
    ],
  },
  {
    id: "independance",
    title: "2. Positionnement du service",
    paragraphs: [
      `${legalEntity.companyName} édite un comparateur indépendant et des contenus informatifs. La société ne réalise pas de mission comptable, fiscale, sociale ou juridique individualisée pour le compte des utilisateurs du site.`,
      `Les informations publiées aident à préparer une comparaison, à identifier des critères de choix et à comprendre des obligations générales. Elles ne remplacent pas une consultation personnalisée auprès d'un professionnel habilité.`,
      `Skoria n'est pas affilié à une institution professionnelle, à une administration, ni aux professionnels éventuellement référencés dans l'annuaire, sauf mention contractuelle explicite.`,
    ],
  },
  {
    id: "rcp",
    title: "3. Responsabilité civile",
    paragraphs: [legalEntity.rcp],
  },
  {
    id: "directeur-publication",
    title: "4. Directeur de la publication",
    paragraphs: [
      `Le directeur de la publication du site ${legalEntity.websiteDomain} est ${legalEntity.publicationDirector}, en sa qualité de ${legalEntity.presidentTitle} de ${legalEntity.companyName}.`,
      `Toute demande relative au contenu éditorial du site peut être adressée à : ${legalEntity.emailContact}.`,
    ],
  },
  {
    id: "hebergeur",
    title: "5. Hébergeur",
    paragraphs: [
      `Le site ${legalEntity.websiteDomain} est hébergé par : ${legalEntity.hostingProvider}.`,
      `L'hébergeur ne saurait être tenu pour responsable des contenus mis en ligne par l'éditeur.`,
    ],
  },
  {
    id: "propriete-intellectuelle",
    title: "6. Propriété intellectuelle",
    paragraphs: [
      `L'ensemble des éléments composant le site ${legalEntity.websiteDomain} (textes, structure, charte graphique, logos, photographies, illustrations, vidéos, code source, bases de données) est la propriété exclusive de ${legalEntity.companyName} ou de ses partenaires, et est protégé par les législations françaises et internationales relatives au droit d'auteur, au droit des marques et au droit des bases de données.`,
      `Toute reproduction, représentation, modification, publication, transmission, dénaturation, totale ou partielle, du site ou de son contenu, par quelque procédé que ce soit, et sur quelque support que ce soit, est interdite sans autorisation écrite préalable de ${legalEntity.companyName}.`,
      `Toute exploitation non autorisée du site ou de l'un quelconque des éléments qu'il contient est constitutive de contrefaçon et susceptible d'engager la responsabilité civile et pénale de son auteur, conformément aux articles L. 335-2 et suivants du Code de la propriété intellectuelle.`,
    ],
  },
  {
    id: "donnees-personnelles",
    title: "7. Données personnelles et cookies",
    paragraphs: [
      `Les données personnelles collectées sur le site ${legalEntity.websiteDomain} font l'objet d'un traitement décrit dans la Politique de confidentialité de la plateforme.`,
      `Le responsable de traitement est ${legalEntity.companyName}. Conformément au Règlement (UE) 2016/679 (RGPD) et à la loi n° 78-17 du 6 janvier 1978 modifiée, vous disposez de droits d'accès, de rectification, d'effacement, de limitation, de portabilité et d'opposition sur vos données.`,
      `Pour exercer ces droits, contactez le Délégué à la Protection des Données : ${legalEntity.dpoEmail}.`,
      `Vous disposez également du droit d'introduire une réclamation auprès de la Commission nationale de l'informatique et des libertés (CNIL) — 3, place de Fontenoy — TSA 80715 — 75334 Paris Cedex 07.`,
    ],
  },
  {
    id: "responsabilite",
    title: "8. Responsabilité éditoriale",
    paragraphs: [
      `${legalEntity.companyName} s'efforce d'assurer l'exactitude et la mise à jour des informations diffusées sur le site, sans toutefois en garantir l'exhaustivité ni l'absence de modification par un tiers (piratage, virus).`,
      `Les contenus à vocation informative publiés sur le site ${legalEntity.websiteDomain} ne sauraient se substituer à une consultation personnalisée avec un professionnel habilité. Aucune information ne constitue un conseil juridique, fiscal, social ou comptable individualisé.`,
      `${legalEntity.companyName} ne pourra être tenue pour responsable des dommages directs ou indirects résultant de l'utilisation du site ou de l'impossibilité d'y accéder.`,
    ],
  },
  {
    id: "droit-applicable",
    title: "9. Droit applicable et juridiction compétente",
    paragraphs: [
      `Les présentes mentions légales sont régies par le droit français.`,
      `En cas de litige relatif à l'utilisation du site ${legalEntity.websiteDomain} et à défaut de résolution amiable, compétence exclusive est attribuée aux tribunaux du ressort du Tribunal judiciaire de Paris.`,
    ],
  },
];

export default function MentionsLegalesPage() {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Accueil", url: "/" },
          { name: "Mentions légales", url: "/mentions-legales" },
        ]}
      />
      <LegalDocumentPage
        eyebrow="Informations légales"
        title="Mentions légales"
        subtitle={`Informations relatives à l'éditeur et à l'hébergeur du site ${legalEntity.websiteDomain}, conformément à la loi n° 2004-575 du 21 juin 2004 pour la confiance dans l'économie numérique.`}
        breadcrumbLabel="Mentions légales"
        currentPath="/mentions-legales"
        updatedAt="Dernière mise à jour des présentes mentions légales : juin 2026."
        sections={sections}
      />
    </>
  );
}
