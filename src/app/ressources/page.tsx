import type { Metadata } from "next";
import { AppConfig } from "@/utils/AppConfig";
import { BreadcrumbJsonLd, WebPageJsonLd } from "@/components/JsonLd";
import { CollectionHubV2 } from "@/components/hubs/shared/CollectionHubV2";
import {
  FLAGSHIP_DOSSIERS,
  INTENTION_RAILS,
  getPillarPages,
  getPublishedGuidesCount,
} from "@/libs/ressources/bibliotheque-data";

export const revalidate = 86400;

export const metadata: Metadata = {
  title: "Guides, outils et dossiers pour décider",
  description:
    "La bibliothèque du comparateur : missions comptables, facture électronique, logiciels, obligations et dossiers métier, organisés selon votre prochaine décision.",
  alternates: { canonical: `${AppConfig.url}/ressources` },
};

export default async function RessourcesPage() {
  const [guidesCount, pillars] = await Promise.all([
    getPublishedGuidesCount(),
    getPillarPages(),
  ]);

  const byHref = new Map<string, {
    href: string;
    title: string;
    description?: string | null;
    group: string;
    meta: string;
  }>();

  for (const dossier of FLAGSHIP_DOSSIERS) {
    byHref.set(dossier.href, {
      href: dossier.href,
      title: dossier.title,
      description: dossier.description,
      group: "Dossiers phares",
      meta: dossier.tag,
    });
  }
  for (const rail of INTENTION_RAILS) {
    for (const link of rail.links) {
      if (!byHref.has(link.href)) {
        byHref.set(link.href, {
          href: link.href,
          title: link.label,
          description: `Une ressource sélectionnée pour le parcours « ${rail.title.toLowerCase()} ».` ,
          group: rail.title,
          meta: "Guide de décision",
        });
      }
    }
  }
  for (const pillar of pillars) {
    const href = `/ressources/${pillar.slug}`;
    if (!byHref.has(href)) {
      byHref.set(href, {
        href,
        title: pillar.title,
        description: "Page de référence pour comprendre le sujet et accéder aux contenus associés.",
        group: "Pages de référence",
        meta: "Référence",
      });
    }
  }

  const items = [...byHref.values()];
  const groups = [...new Set(items.map((item) => item.group))];
  const breadcrumbs = [
    { name: "Accueil", url: "/" },
    { name: "Ressources", url: "/ressources" },
  ];

  return (
    <CollectionHubV2
      eyebrow="Bibliothèque du comparateur"
      title="Comprendre d’abord."
      titleAccent="Décider ensuite."
      intro="Guides, dossiers, outils et documents organisés selon la question que vous cherchez à résoudre — avec des repères concrets, des sources et une prochaine étape."
      breadcrumbs={breadcrumbs}
      media={{
        src: "/images/skoria-v2/editorial/objects.webp",
        alt: "Documents et objets de calcul disposés en composition éditoriale",
      }}
      stats={[
        { value: guidesCount.toLocaleString("fr-FR"), label: "guides publiés" },
        { value: String(FLAGSHIP_DOSSIERS.length), label: "dossiers phares" },
        { value: String(INTENTION_RAILS.length), label: "parcours de lecture" },
        { value: "Date", label: "de revue visible" },
      ]}
      catalogEyebrow="Explorer la bibliothèque"
      catalogTitle="Cherchez par sujet ou par situation."
      catalogCopy="Une bibliothèque utile ne vous demande pas de connaître le bon mot-clé. Recherchez librement ou partez de votre intention : créer, piloter, comparer un cabinet ou comprendre une obligation."
      items={items}
      groups={groups}
      searchPlaceholder="Rechercher un guide, une obligation, un outil…"
      steps={[
        { title: "Situer votre étape", body: "Création, gestion courante, changement de cabinet ou décision ponctuelle : le contexte détermine les bonnes questions." },
        { title: "Choisir un dossier", body: "Commencez par une vue d’ensemble, puis progressez vers le chapitre ou le calcul qui répond à votre cas." },
        { title: "Préparer l’échange", body: "Transformez la lecture en documents, hypothèses et critères à confirmer avec un professionnel." },
      ]}
      methodTitle="Une ressource doit vous aider à agir, pas seulement à lire."
      methodCopy="Les dossiers relient les explications, les tableaux, les simulateurs et les documents utiles. Le contenu long reste visible dans la page et les modules interactifs servent à appliquer les repères à votre situation."
      seoTitle="Des contenus reliés aux décisions de l’entreprise."
      seoParagraphs={[
        "Une obligation comptable ou fiscale s’inscrit rarement dans une page isolée. La bibliothèque relie les notions à une étape, aux documents nécessaires, aux outils de calcul et aux missions qu’un cabinet peut proposer. Cette organisation évite d’accumuler des articles sans parcours.",
        "Les contenus sensibles indiquent leur date de revue et leurs sources. Les calculs restent pédagogiques : leurs hypothèses doivent être confrontées à la situation réelle, aux textes applicables et, lorsque nécessaire, à un professionnel qualifié.",
        "Pour exploiter un guide, commencez par relever les hypothèses qui décrivent votre situation : statut, activité, calendrier, opérations inhabituelles et décisions déjà prises. Distinguez ensuite les règles générales des options qui dépendent d’un choix ou d’un seuil. Cette lecture produit une liste courte de points à vérifier plutôt qu’une conclusion automatique.",
        "Le maillage relie enfin chaque explication à une action utile. Un simulateur aide à tester une hypothèse, un modèle montre la structure d’un document, une page métier replace le sujet dans l’activité et une page service détaille le périmètre à discuter. Vous pouvez ainsi préparer un échange cohérent sans perdre le fil du dossier initial.",
      ]}
      faqs={[
        { question: "Par quel guide commencer ?", answer: "Choisissez d’abord votre situation : créer une activité, gérer une obligation, comparer une mission ou préparer un changement. Les dossiers proposent ensuite un ordre de lecture et des liens vers les outils adaptés." },
        { question: "Les guides remplacent-ils un conseil personnalisé ?", answer: "Non. Ils expliquent les mécanismes, les questions et les documents utiles. Une décision engageante doit tenir compte de votre situation et peut nécessiter l’avis d’un professionnel." },
        { question: "Comment les contenus sont-ils mis à jour ?", answer: "Chaque page affiche sa date de revue. Les règles et chiffres sensibles sont associés à des sources identifiables et sont réexaminés lorsque le cadre change." },
        { question: "Comment distinguer une règle d’une hypothèse de calcul ?", answer: "Les pages séparent la méthode, les données saisies et le résultat. Vérifiez la date du barème, les exclusions et les arrondis avant de reprendre un chiffre. Une simulation sert à explorer un scénario ; elle ne transforme pas une hypothèse en donnée certaine." },
        { question: "Que faire lorsqu’une information reste à confirmer ?", answer: "Conservez-la dans votre liste de questions et recherchez d’abord la source officielle indiquée. Si la réponse dépend de votre dossier, ajoutez le contexte et les pièces utiles au brief afin que le professionnel puisse préciser la règle, son périmètre et ses conséquences." },
      ]}
      ctaNeed="Trouver les ressources adaptées à ma situation"
      variant="editorial"
    >
      <BreadcrumbJsonLd items={breadcrumbs} />
      <WebPageJsonLd name="Guides, outils et dossiers" description={metadata.description as string} url="/ressources" />
    </CollectionHubV2>
  );
}
