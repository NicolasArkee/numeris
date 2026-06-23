import type { Metadata } from "next";
import { AppConfig } from "@/utils/AppConfig";
import { PageHero } from "@/components/PageHero";
import { ContentSection } from "@/components/ContentSection";
import { BreadcrumbJsonLd } from "@/components/JsonLd";
import { legalEntity } from "@/data/legal-entity";

export const metadata: Metadata = {
  title: `Politique de confidentialité | ${AppConfig.name} ${AppConfig.tagline}`,
  description: `Politique de protection des données personnelles de ${legalEntity.companyName} : responsable de traitement, finalités, base légale, durées de conservation, droits RGPD et contact DPO.`,
  alternates: { canonical: `${AppConfig.url}/confidentialite` },
  robots: { index: true, follow: true },
};

export default function ConfidentialitePage() {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Accueil", url: "/" },
          { name: "Politique de confidentialité", url: "/confidentialite" },
        ]}
      />

      <PageHero
        eyebrow="Protection des données"
        title="Politique de"
        titleAccent="confidentialité"
        subtitle={`Comment ${legalEntity.companyName} collecte, utilise et protège vos données personnelles, conformément au RGPD et à la loi Informatique et Libertés.`}
        breadcrumbs={[
          { name: "Accueil", url: "/" },
          { name: "Confidentialité", url: "/confidentialite" },
        ]}
      />

      <section className="bg-bg px-6 py-20 lg:px-[4.5rem]">
        <div className="mx-auto max-w-[60rem]">
          <ContentSection
            id="preambule"
            title="Préambule"
            variant="highlighted"
            paragraphs={[
              `La présente politique de confidentialité décrit la manière dont ${legalEntity.companyName} collecte, utilise, conserve et protège les données à caractère personnel des utilisateurs du site ${legalEntity.websiteDomain} et des personnes qui sollicitent la plateforme.`,
              `Elle s'applique aux demandes d'information, d'orientation, de correction d'annuaire et à la navigation sur la plateforme Skoria.`,
              `Elle est établie en conformité avec le Règlement (UE) 2016/679 du 27 avril 2016 (RGPD) et la loi n° 78-17 du 6 janvier 1978 modifiée, dite « Informatique et Libertés ».`,
            ]}
          />

          <ContentSection
            id="responsable-traitement"
            title="1. Responsable de traitement"
            paragraphs={[
              `Le responsable de traitement des données collectées est : ${legalEntity.companyName}, ${legalEntity.legalForm} au capital de ${legalEntity.capital}, dont le siège social est situé ${legalEntity.addressSiege}.`,
              `${legalEntity.rcs} — SIREN ${legalEntity.sirenFormatted}.`,
              `Représenté par ${legalEntity.presidentName}, ${legalEntity.presidentTitle}.`,
            ]}
          />

          <ContentSection
            id="dpo"
            title="2. Délégué à la Protection des Données (DPO)"
            paragraphs={[
              `Pour toute question relative à la protection de vos données personnelles, vous pouvez contacter notre Délégué à la Protection des Données :`,
              `Par courriel : ${legalEntity.dpoEmail}.`,
              `Par courrier : ${legalEntity.companyName} — À l'attention du DPO — ${legalEntity.addressSiege}.`,
            ]}
          />

          <ContentSection
            id="finalites"
            title="3. Finalités, bases légales et données collectées"
            paragraphs={[
              `Gestion des demandes de contact et de devis (formulaires du site, courriels, appels téléphoniques). Base légale : intérêt légitime du responsable de traitement à répondre aux sollicitations entrantes (article 6.1.f RGPD). Données collectées : nom, prénom, courriel, téléphone, raison sociale, message libre.`,
              `Gestion des demandes de correction ou d'opposition concernant une fiche d'annuaire. Base légale : intérêt légitime à maintenir des informations exactes et à répondre aux demandes des personnes concernées. Données collectées : identité du demandeur, SIRET ou fiche concernée, justificatifs transmis volontairement.`,
              `Gestion de la relation commerciale et information éditoriale. Base légale : consentement (article 6.1.a RGPD) pour les communications électroniques à des prospects non clients, intérêt légitime pour les informations adressées aux clients existants.`,
              `Mesure d'audience du site et amélioration continue. Base légale : consentement (cookies non strictement nécessaires) ou intérêt légitime (mesure d'audience anonymisée).`,
            ]}
          />

          <ContentSection
            id="destinataires"
            title="4. Destinataires des données"
            paragraphs={[
              `Les données collectées sont destinées aux collaborateurs habilités de ${legalEntity.companyName} dans la stricte limite de leurs attributions.`,
              `Elles peuvent être communiquées à nos sous-traitants techniques (hébergeur, outil de formulaire, outil de mesure d'audience ou prestataire d'e-mail) liés par contrat et soumis à des obligations équivalentes en matière de protection des données.`,
              `Aucune donnée n'est cédée, louée ou vendue à des tiers à des fins commerciales.`,
              `Aucun transfert hors Union européenne n'est réalisé sans encadrement contractuel approprié (clauses contractuelles types de la Commission européenne) — à l'exception de l'hébergement du site, assuré par ${legalEntity.hostingProviderShort} et susceptible d'impliquer un transfert encadré vers les États-Unis sur la base des clauses contractuelles types.`,
            ]}
          />

          <ContentSection
            id="duree"
            title="5. Durée de conservation"
            paragraphs={[
              `Données issues de demandes de contact non converties : 3 ans à compter du dernier contact.`,
              `Données liées aux demandes de correction d'annuaire : 3 ans à compter du dernier échange, sauf nécessité de conservation plus longue pour établir la preuve d'une demande ou d'une opposition.`,
              `Données de prospection commerciale électronique : jusqu'au retrait du consentement et au maximum 3 ans à compter du dernier contact.`,
              `Données de connexion (logs serveur) : 12 mois maximum, conformément aux recommandations de la CNIL.`,
            ]}
          />

          <ContentSection
            id="droits"
            title="6. Vos droits"
            variant="bordered"
            paragraphs={[
              `Conformément aux articles 15 à 22 du RGPD, vous disposez des droits suivants sur vos données personnelles : droit d'accès, droit de rectification, droit à l'effacement, droit à la limitation du traitement, droit à la portabilité, droit d'opposition, droit de retirer votre consentement à tout moment (lorsque le traitement repose sur le consentement) et droit de définir des directives relatives au sort de vos données après votre décès.`,
              `Pour exercer ces droits, adressez votre demande accompagnée d'un justificatif d'identité à : ${legalEntity.dpoEmail}.`,
              `Nous nous engageons à répondre à toute demande dans le délai d'un mois prévu par l'article 12 du RGPD, prolongeable de deux mois en cas de demande complexe.`,
              `Vous disposez également du droit d'introduire une réclamation auprès de la Commission nationale de l'informatique et des libertés (CNIL) — 3, place de Fontenoy — TSA 80715 — 75334 Paris Cedex 07 — www.cnil.fr.`,
            ]}
          />

          <ContentSection
            id="securite"
            title="7. Sécurité des données"
            paragraphs={[
              `${legalEntity.companyName} met en œuvre les mesures techniques et organisationnelles appropriées afin de garantir un niveau de sécurité adapté au risque, conformément à l'article 32 du RGPD.`,
              `Ces mesures incluent notamment : le chiffrement des échanges via TLS, le contrôle des accès, la sauvegarde régulière des données et la sensibilisation de l'équipe à la sécurité des systèmes d'information.`,
            ]}
          />

          <ContentSection
            id="cookies"
            title="8. Cookies et traceurs"
            paragraphs={[
              `Le site ${legalEntity.websiteDomain} peut utiliser des cookies strictement nécessaires à son bon fonctionnement, qui ne requièrent pas votre consentement préalable, ainsi que des cookies de mesure d'audience configurés pour respecter les recommandations de la CNIL.`,
              `Tout dépôt de cookie non strictement nécessaire requiert votre consentement préalable, exprimé via le bandeau de consentement affiché lors de votre première visite et révocable à tout moment depuis le pied de page du site.`,
            ]}
          />

          <ContentSection
            id="modifications"
            title="9. Modifications de la politique"
            paragraphs={[
              `La présente politique de confidentialité peut être modifiée à tout moment pour s'adapter aux évolutions législatives, réglementaires ou techniques.`,
              `La date de dernière mise à jour figure ci-dessous. Nous vous invitons à la consulter régulièrement.`,
            ]}
          />

          <p className="mt-12 text-[0.72rem] text-ink-muted/70">
            Dernière mise à jour de la présente politique : juin 2026.
          </p>
        </div>
      </section>
    </>
  );
}
