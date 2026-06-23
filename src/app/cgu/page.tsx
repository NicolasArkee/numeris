import type { Metadata } from "next";
import { AppConfig } from "@/utils/AppConfig";
import { PageHero } from "@/components/PageHero";
import { ContentSection } from "@/components/ContentSection";
import { BreadcrumbJsonLd } from "@/components/JsonLd";
import { legalEntity } from "@/data/legal-entity";

export const metadata: Metadata = {
  title: `Conditions Générales d'Utilisation | ${AppConfig.name} ${AppConfig.tagline}`,
  description: `Conditions générales d'utilisation du site ${legalEntity.websiteDomain} édité par ${legalEntity.companyName} : accès au site, propriété intellectuelle, responsabilité, droit applicable.`,
  alternates: { canonical: `${AppConfig.url}/cgu` },
  robots: { index: true, follow: true },
};

export default function CguPage() {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Accueil", url: "/" },
          { name: "Conditions Générales d'Utilisation", url: "/cgu" },
        ]}
      />

      <PageHero
        eyebrow="Conditions d'utilisation"
        title="Conditions Générales"
        titleAccent="d'Utilisation"
        subtitle={`Règles d'accès et d'utilisation du site ${legalEntity.websiteDomain}. La consultation du site implique l'acceptation pleine et entière des présentes conditions.`}
        breadcrumbs={[
          { name: "Accueil", url: "/" },
          { name: "CGU", url: "/cgu" },
        ]}
      />

      <section className="bg-bg px-6 py-20 lg:px-[4.5rem]">
        <div className="mx-auto max-w-[60rem]">
          <ContentSection
            id="objet"
            title="1. Objet"
            variant="highlighted"
            paragraphs={[
              `Les présentes Conditions Générales d'Utilisation (ci-après « CGU ») ont pour objet de définir les modalités d'accès et d'utilisation du site internet ${legalEntity.websiteDomain} (ci-après « le Site »), édité par ${legalEntity.companyName}.`,
              `Tout accès et toute utilisation du Site sont subordonnés à l'acceptation et au respect sans réserve des présentes CGU. En naviguant sur le Site, l'utilisateur reconnaît avoir pris connaissance des présentes CGU et les accepter sans restriction.`,
              `Le Site est un service d'information et de comparaison. ${legalEntity.companyName} ne réalise pas de prestation comptable, fiscale, sociale ou juridique individualisée pour le compte des utilisateurs.`,
            ]}
          />

          <ContentSection
            id="acces"
            title="2. Accès au Site"
            paragraphs={[
              `Le Site est accessible gratuitement, 7 jours sur 7 et 24 heures sur 24, à toute personne disposant d'un accès à Internet.`,
              `Les frais d'accès et d'utilisation du réseau Internet sont à la charge exclusive de l'utilisateur.`,
              `${legalEntity.companyName} se réserve le droit, sans préavis ni indemnité, de suspendre temporairement ou de fermer définitivement l'accès au Site, notamment pour réaliser une mise à jour, des opérations de maintenance, des modifications ou changements sur les méthodes opérationnelles, les serveurs et les horaires d'accessibilité, sans que cette liste ne soit limitative.`,
              `${legalEntity.companyName} ne saurait être tenue pour responsable des conséquences éventuelles d'une indisponibilité du Site sur l'activité de l'utilisateur.`,
            ]}
          />

          <ContentSection
            id="utilisation"
            title="3. Utilisation du Site"
            paragraphs={[
              `L'utilisateur s'engage à utiliser le Site dans le respect des lois et règlements en vigueur, des présentes CGU, des bonnes mœurs et de l'ordre public.`,
              `Sont notamment interdits, sans que cette liste soit exhaustive : la diffusion de contenus illicites, diffamatoires, injurieux ou portant atteinte aux droits de tiers ; toute tentative d'intrusion, d'altération du Site ou d'extraction massive de données ; l'utilisation de robots, scripts ou tout procédé automatisé non expressément autorisé ; l'usurpation d'identité.`,
              `Tout manquement aux présentes CGU pourra entraîner la suspension immédiate de l'accès au Site et engager la responsabilité civile et pénale de l'utilisateur.`,
            ]}
          />

          <ContentSection
            id="contenu"
            title="4. Contenu du Site"
            paragraphs={[
              `Les informations diffusées sur le Site sont fournies à titre informatif et indicatif. Elles ne constituent en aucun cas un conseil juridique, fiscal, social ou comptable personnalisé.`,
              `${legalEntity.companyName} s'efforce d'assurer l'exactitude et la mise à jour des informations publiées, sans toutefois pouvoir en garantir l'exhaustivité, la pertinence ou l'adéquation à une situation particulière.`,
              `Toute décision prise sur la base d'une information publiée sur le Site relève de la responsabilité exclusive de l'utilisateur. ${legalEntity.companyName} recommande systématiquement la consultation d'un professionnel pour toute situation individuelle.`,
            ]}
          />

          <ContentSection
            id="propriete-intellectuelle"
            title="5. Propriété intellectuelle"
            paragraphs={[
              `L'ensemble du contenu du Site (textes, graphismes, logos, icônes, images, vidéos, code source, charte graphique, structure du site, bases de données) est protégé par le droit d'auteur, le droit des marques et le droit des bases de données, et demeure la propriété exclusive de ${legalEntity.companyName} ou de ses partenaires.`,
              `Toute reproduction, représentation, modification, publication, adaptation, diffusion, totale ou partielle, du Site ou de l'un de ses éléments, par quelque moyen et sur quelque support que ce soit, est strictement interdite sans autorisation écrite préalable de ${legalEntity.companyName}, à l'exception de la consultation à des fins privées et non commerciales.`,
              `Toute exploitation non autorisée est passible des sanctions civiles et pénales prévues par les articles L. 335-2 et suivants du Code de la propriété intellectuelle.`,
            ]}
          />

          <ContentSection
            id="liens"
            title="6. Liens hypertextes"
            paragraphs={[
              `Le Site peut contenir des liens hypertextes vers des sites tiers. ${legalEntity.companyName} n'exerce aucun contrôle sur ces sites et décline toute responsabilité quant à leur contenu et à leurs conditions d'utilisation.`,
              `La mise en place d'un lien hypertexte vers le Site depuis un site tiers est autorisée à condition de ne pas porter atteinte à l'image de ${legalEntity.companyName} et de ne pas créer de confusion sur l'origine du contenu lié. ${legalEntity.companyName} se réserve le droit d'exiger le retrait de tout lien jugé non conforme.`,
            ]}
          />

          <ContentSection
            id="responsabilite"
            title="7. Responsabilité"
            variant="bordered"
            paragraphs={[
              `${legalEntity.companyName} ne saurait être tenue pour responsable des dommages directs ou indirects, matériels ou immatériels, résultant de l'utilisation du Site, de l'impossibilité d'y accéder, d'une interruption de service, de la présence éventuelle de virus ou de la perte de données.`,
              `L'utilisateur reconnaît avoir connaissance des limites et contraintes du réseau Internet, notamment en termes de performance technique, de temps de réponse et de risques liés à la sécurité des communications.`,
              `${legalEntity.companyName} ne pourra être tenue pour responsable en cas d'inexécution ou de mauvaise exécution de ses obligations imputable soit à l'utilisateur, soit au fait imprévisible et insurmontable d'un tiers, soit à un cas de force majeure.`,
            ]}
          />

          <ContentSection
            id="donnees"
            title="8. Données personnelles"
            paragraphs={[
              `Les conditions de collecte et de traitement des données personnelles des utilisateurs sont détaillées dans la Politique de confidentialité du Site, accessible depuis le pied de page.`,
              `Pour toute question, l'utilisateur peut contacter le Délégué à la Protection des Données à l'adresse : ${legalEntity.dpoEmail}.`,
            ]}
          />

          <ContentSection
            id="modification-cgu"
            title="9. Modification des CGU"
            paragraphs={[
              `${legalEntity.companyName} se réserve le droit de modifier les présentes CGU à tout moment, afin notamment de les adapter aux évolutions législatives, réglementaires ou techniques.`,
              `Les CGU applicables sont celles en vigueur au jour de la consultation du Site. Il appartient à l'utilisateur de s'y référer régulièrement.`,
            ]}
          />

          <ContentSection
            id="droit-applicable"
            title="10. Droit applicable et juridiction compétente"
            paragraphs={[
              `Les présentes CGU sont régies, interprétées et exécutées conformément au droit français.`,
              `Tout litige relatif à la formation, l'interprétation ou l'exécution des présentes CGU, à défaut de résolution amiable, sera soumis à la compétence exclusive du Tribunal judiciaire de Paris, nonobstant pluralité de défendeurs ou appel en garantie.`,
              `Conformément aux articles L. 612-1 et suivants du Code de la consommation, l'utilisateur consommateur dispose de la possibilité de recourir gratuitement à un médiateur de la consommation en vue de la résolution amiable du litige qui l'opposerait à ${legalEntity.companyName}.`,
            ]}
          />

          <p className="mt-12 text-[0.72rem] text-ink-muted/70">
            Dernière mise à jour des présentes CGU : juin 2026.
          </p>
        </div>
      </section>
    </>
  );
}
