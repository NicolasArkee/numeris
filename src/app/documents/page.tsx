import type { Metadata } from "next";
import { AppConfig } from "@/utils/AppConfig";
import { BreadcrumbJsonLd, ItemListJsonLd, WebPageJsonLd } from "@/components/JsonLd";
import { CollectionHubV2 } from "@/components/hubs/shared/CollectionHubV2";
import {
  DOCUMENTS,
  DOC_CATEGORIES,
  DOCS_WITH_SPECIMEN,
  documentUrl,
} from "@/data/documents";

export const metadata: Metadata = {
  title: "Documents comptables expliqués et spécimens",
  description: `${DOCUMENTS.length} documents expliqués : rôle, champs, contrôles et erreurs à éviter. Chaque fiche propose des repères de lecture et, lorsqu’il existe, un spécimen.`,
  alternates: { canonical: `${AppConfig.url}/documents` },
};

const CATEGORY_LABEL = Object.fromEntries(DOC_CATEGORIES.map((category) => [category.key, category.label]));
const CHASSIS_COPY: Record<string, string> = {
  facture: "Comprendre les mentions, les montants et les contrôles avant émission.",
  lettre: "Repérer l’objet, les engagements, les dates et les conditions du document.",
  statuts: "Identifier la structure du document et les clauses qui demandent une attention particulière.",
  formulaire: "Lire les zones essentielles et réunir les informations nécessaires avant remplissage.",
  "etat-comptable": "Relier les principaux postes à l’activité et préparer les questions de lecture.",
  registre: "Comprendre l’organisation, la tenue et la conservation des informations.",
};

export default function DocumentsHub() {
  const items = DOCUMENTS
    .slice()
    .sort((a, b) => a.priorite - b.priorite || a.label.localeCompare(b.label, "fr"))
    .map((document) => ({
      href: documentUrl(document.slug),
      title: document.label,
      description: CHASSIS_COPY[document.chassis] ?? "Comprendre le rôle du document et les points à vérifier.",
      group: CATEGORY_LABEL[document.categorie] ?? document.categorie,
      meta: DOCS_WITH_SPECIMEN.has(document.slug) ? "Spécimen disponible" : "Guide expliqué",
      tag: DOCS_WITH_SPECIMEN.has(document.slug) ? "PDF" : "Guide",
    }));
  const breadcrumbs = [
    { name: "Accueil", url: "/" },
    { name: "Documents", url: "/documents" },
  ];

  return (
    <CollectionHubV2
      eyebrow="Bibliothèque documentaire"
      title="Lisez le document,"
      titleAccent="comprenez ce qu’il engage."
      intro="Factures, statuts, états comptables, déclarations et pièces sociales : repérez leur rôle, les informations clés et les questions à poser avant de signer, transmettre ou archiver."
      breadcrumbs={breadcrumbs}
      media={{
        src: "/images/skoria-v2/editorial/accounting-flow.webp",
        alt: "Composition illustrant un flux de documents comptables",
      }}
      tone="apricot"
      stats={[
        { value: String(DOCUMENTS.length), label: "documents expliqués" },
        { value: String(DOC_CATEGORIES.length), label: "familles" },
        { value: String(DOCS_WITH_SPECIMEN.size), label: "spécimens disponibles" },
        { value: "1", label: "lecture guidée" },
      ]}
      catalogEyebrow="Choisir un document"
      catalogTitle="Retrouvez une pièce par nom ou par usage."
      catalogCopy="Le catalogue distingue les guides explicatifs des spécimens réellement disponibles. Une page ne promet jamais un téléchargement lorsque le fichier n’existe pas."
      items={items}
      groups={DOC_CATEGORIES.map((category) => category.label)}
      searchPlaceholder="Rechercher facture, bilan, statuts, TVA…"
      steps={[
        { title: "Identifier le rôle", body: "Situez le document dans le cycle de création, facturation, clôture, déclaration ou gestion sociale." },
        { title: "Lire les points clés", body: "Repérez les parties utiles, les informations à contrôler et les termes qui demandent une explication." },
        { title: "Préparer l’action", body: "Rassemblez les données manquantes, notez vos questions et téléchargez le spécimen seulement s’il est disponible." },
      ]}
      methodTitle="Un spécimen sert à comprendre, pas à remplacer le document officiel."
      methodCopy="Les exemples permettent de reconnaître une structure et de visualiser les champs commentés. Ils doivent être adaptés au contexte, aux règles en vigueur et au logiciel ou formulaire utilisé. Les pages renvoient vers les sources officielles quand un modèle réglementaire existe."
      seoTitle="Mieux préparer les pièces échangées avec un cabinet."
      seoParagraphs={[
        "Un échange comptable devient plus simple lorsque chaque document est identifié, daté et rattaché à une opération. Comprendre la différence entre une pièce justificative, un état comptable, une déclaration et un document juridique aide à organiser la collecte et à repérer les éléments manquants.",
        "Les guides Skoria expliquent les documents sans attribuer au comparateur leur création ou leur validation. Selon la pièce, la rédaction, le dépôt ou le contrôle peut relever de l’entreprise, d’un expert-comptable, d’un avocat, d’un organisme ou d’une administration.",
      ]}
      faqs={[
        { question: "Tous les documents sont-ils téléchargeables ?", answer: "Non. Le catalogue indique explicitement les pages qui disposent d’un spécimen. Les autres proposent une explication structurée sans simuler un fichier absent." },
        { question: "Puis-je utiliser un spécimen tel quel ?", answer: "Un spécimen aide à comprendre la forme et les champs. Il doit être adapté à la situation, au cadre applicable et aux exigences du destinataire avant utilisation." },
        { question: "Qui peut valider un document ?", answer: "Cela dépend de sa nature. La page précise son rôle et les interlocuteurs possibles ; Skoria reste un comparateur et ne valide aucun document à la place d’un professionnel ou d’une administration." },
      ]}
      ctaNeed="Préparer les documents de mon dossier"
      variant="tools"
    >
      <BreadcrumbJsonLd items={breadcrumbs} />
      <WebPageJsonLd name="Documents comptables expliqués" description={metadata.description as string} url="/documents" />
      <ItemListJsonLd
        name="Documents expliqués par Skoria"
        url="/documents"
        items={DOCUMENTS.map((document) => ({ name: document.label, url: documentUrl(document.slug) }))}
      />
    </CollectionHubV2>
  );
}
