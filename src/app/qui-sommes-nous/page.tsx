import type { Metadata } from "next";
import { AppConfig } from "@/utils/AppConfig";
import { PageHero } from "@/components/PageHero";
import { ContentSection } from "@/components/ContentSection";
import { BreadcrumbJsonLd } from "@/components/JsonLd";
import { legalEntity } from "@/data/legal-entity";

export const metadata: Metadata = {
  title: `Qui sommes-nous | ${AppConfig.name} ${AppConfig.tagline}`,
  description: `Découvrez ${legalEntity.companyName}, cabinet d'expertise comptable parisien fondé en ${legalEntity.creationYear}. Notre histoire, nos valeurs, notre équipe et notre code de déontologie.`,
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
        eyebrow={`Cabinet fondé en ${legalEntity.creationYear}`}
        title="Qui"
        titleAccent="sommes-nous"
        subtitle={`${annéesExperience} ans d'expérience au service des entrepreneurs, professions libérales et dirigeants de PME — depuis notre siège parisien et auprès de toutes les entreprises françaises.`}
        breadcrumbs={[
          { name: "Accueil", url: "/" },
          { name: "Qui sommes-nous", url: "/qui-sommes-nous" },
        ]}
        cta={{ label: "Prendre rendez-vous", href: "/contact" }}
      />

      <section className="bg-creme px-6 py-20 lg:px-[4.5rem]">
        <div className="mx-auto max-w-[60rem]">
          <ContentSection
            id="histoire"
            title={`Notre histoire — depuis ${legalEntity.creationYear}`}
            variant="highlighted"
            paragraphs={[
              `Fondé en ${legalEntity.creationYear} à Paris, ${legalEntity.companyName} accompagne depuis près de trente ans les entrepreneurs, dirigeants de PME et professions libérales dans la gestion comptable, fiscale et sociale de leur activité.`,
              `Né d'une volonté simple — rendre l'expertise comptable accessible, transparente et orientée conseil plutôt que tenue de livres — le cabinet a progressivement élargi son périmètre d'intervention à l'ensemble du territoire français tout en conservant son ancrage parisien.`,
              `Aujourd'hui, ${legalEntity.companyName} intervient auprès de plusieurs centaines de clients sur l'ensemble des expertises du métier : comptabilité, fiscalité, gestion sociale, conseil en gestion, création d'entreprise et audit.`,
            ]}
          />

          <ContentSection
            id="valeurs"
            title="Nos valeurs"
            paragraphs={[
              `Indépendance — Conformément à l'article 145 du Code de déontologie des professionnels de l'expertise comptable, nous exerçons notre mission en toute indépendance, à l'abri de toute pression susceptible d'altérer notre jugement professionnel.`,
              `Compétence — Nos collaborateurs sont engagés dans une démarche continue de formation et de mise à jour de leurs connaissances, en particulier sur les évolutions législatives, fiscales et sociales qui impactent nos clients.`,
              `Confidentialité — Le secret professionnel défini à l'article 21 de l'ordonnance du 19 septembre 1945 s'impose à l'ensemble de nos collaborateurs. Toute information confiée par un client est protégée et n'est partagée qu'avec son accord explicite.`,
              `Transparence tarifaire — Nos honoraires sont fixés avant le démarrage de toute mission, par lettre de mission écrite, conformément à l'article 151 du Code de déontologie.`,
            ]}
          />

          <ContentSection
            id="equipe"
            title="Notre équipe"
            variant="bordered"
            paragraphs={[
              `Le cabinet est dirigé par ${legalEntity.presidentName}, ${legalEntity.presidentTitle} de ${legalEntity.companyName}.`,
              `L'équipe rassemble des experts-comptables inscrits au Tableau de l'Ordre, des collaborateurs comptables confirmés et des spécialistes en fiscalité, gestion sociale et conseil aux dirigeants. La présentation détaillée de l'équipe (parcours, spécialisations et certifications individuelles) est disponible sur demande lors d'un premier rendez-vous.`,
              `Nous attachons une importance particulière à la stabilité du binôme client / collaborateur — chaque dossier est suivi par un interlocuteur dédié, sous la supervision d'un expert-comptable inscrit à l'Ordre.`,
            ]}
          />

          <ContentSection
            id="ordre"
            title="Notre cadre déontologique"
            paragraphs={[
              `${legalEntity.companyName} est inscrit au Tableau du ${legalEntity.oecRegion}.`,
              `Numéro d'inscription au Tableau de l'Ordre : ${legalEntity.oecNumber}.`,
              `Nous exerçons notre mission dans le strict respect du Code de déontologie des professionnels de l'expertise comptable, annexé au décret n° 2012-432 du 30 mars 2012. Ce code, dont l'intégralité est consultable sur le site du Conseil supérieur de l'Ordre (experts-comptables.fr), encadre notre indépendance, notre secret professionnel, notre devoir de conseil et nos relations avec nos clients et confrères.`,
              `Toute mission est formalisée par une lettre de mission écrite, conformément à l'article 151 du Code de déontologie.`,
            ]}
          />

          <ContentSection
            id="engagements"
            title="Nos engagements qualité"
            paragraphs={[
              `Premier rendez-vous gratuit et sans engagement, sur place ou en visioconférence.`,
              `Devis chiffré sous 24 à 48 heures ouvrées après le rendez-vous de cadrage.`,
              `Lettre de mission systématique avant tout démarrage d'intervention.`,
              `Réponse à toute sollicitation client sous 48 heures ouvrées maximum.`,
              `Restitution annuelle des comptes accompagnée d'un entretien de conseil avec un expert-comptable.`,
            ]}
          />

          <ContentSection
            id="contact"
            title="Nous rencontrer"
            paragraphs={[
              `Siège social : ${legalEntity.addressSiege}.`,
              `Téléphone : ${legalEntity.phoneSiege}.`,
              `Courriel : ${legalEntity.emailContact}.`,
              `Vous pouvez également prendre rendez-vous directement via notre formulaire de contact.`,
            ]}
          />
        </div>
      </section>
    </>
  );
}
