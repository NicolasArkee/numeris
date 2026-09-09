import { AppConfig } from "@/utils/AppConfig";
import { BreadcrumbJsonLd, WebPageJsonLd } from "./JsonLd";
import { CollectionHubV2 } from "./hubs/shared/CollectionHubV2";
import {
  type CommercialRoute,
  getCommercialSegments,
  getCommercialPageBySegment,
} from "@/libs/content/commercial";

const META: Record<
  CommercialRoute,
  {
    label: string;
    title: string;
    accent: string;
    subtitle: string;
    metaDescription: string;
    catalogTitle: string;
    catalogCopy: string;
    search: string;
    method: string;
    seoTitle: string;
    seoParagraphs: string[];
  }
> = {
  comparatifs: {
    label: "Comparatifs",
    title: "Comparer pour décider,",
    accent: "critère par critère.",
    subtitle: "Explorez les solutions utiles aux entrepreneurs à partir de cas d’usage, de conditions documentées et d’une méthode de comparaison explicite.",
    metaDescription: "Comparatifs des outils, banques et solutions pour entrepreneurs : critères documentés, sources affichées et méthode explicite.",
    catalogTitle: "Trouvez le comparatif qui correspond à votre décision.",
    catalogCopy: "Commencez par la catégorie ou recherchez directement une solution. Chaque page doit expliquer les critères, les hypothèses, les limites et les sources utilisées.",
    search: "Rechercher un comparatif, une banque, un logiciel…",
    method: "Un classement utile commence par votre usage. Les fonctionnalités, le coût complet, les limites et la qualité du support ne pèsent pas de la même manière selon votre activité. Skoria expose les critères pour que vous puissiez les repondérer.",
    seoTitle: "Pourquoi un tableau seul ne suffit pas pour choisir.",
    seoParagraphs: [
      "Une comparaison sérieuse distingue les informations factuelles, les conditions commerciales et l’interprétation éditoriale. Recherchez la date associée aux informations et consultez les sources officielles lorsque le prix, les limites ou l’éligibilité peuvent évoluer.",
      "Le meilleur outil dépend aussi de votre organisation : nombre d’utilisateurs, opérations internationales, espèces, intégrations, besoin de financement ou accompagnement. Les pages Skoria transforment ces différences en questions concrètes plutôt qu’en score universel.",
      "Avant d’ouvrir un tableau, décrivez le scénario à couvrir. Listez les opérations fréquentes, les personnes qui utiliseront la solution, les droits nécessaires, les outils à connecter et les situations exceptionnelles. Une fonction n’a de valeur que si elle répond à une opération réelle dans votre organisation.",
      "Comparez ensuite le coût complet sur une même durée. Ajoutez au prix de base les options, utilisateurs supplémentaires, moyens de paiement, opérations hors forfait, frais internationaux et temps de mise en place. Lorsque l’information manque ou n’est plus datée, conservez-la comme question à poser au fournisseur.",
      "Gardez enfin une trace de la décision : critères prioritaires, écarts acceptés, points encore ouverts et source consultée. Cette note permet de réévaluer le choix si l’offre change, si l’équipe grandit ou si une nouvelle contrainte apparaît après le premier déploiement.",
    ],
  },
  avis: {
    label: "Avis",
    title: "Un avis utile montre",
    accent: "à qui la solution convient.",
    subtitle: "Lisez les forces, les limites, le coût et les alternatives d’une solution avant de décider si elle correspond à votre manière de travailler.",
    metaDescription: "Analyses indépendantes des solutions pour entrepreneurs : profils adaptés, limites, coûts, alternatives et sources publiques.",
    catalogTitle: "Explorez une analyse par produit ou par besoin.",
    catalogCopy: "Chaque avis sépare les caractéristiques documentées de l’analyse éditoriale et indique les sources disponibles.",
    search: "Rechercher une solution ou un avis…",
    method: "Nous confrontons la proposition du produit à des scénarios d’usage définis : activité solo, équipe, volume d’opérations, besoins internationaux ou intégrations. La conclusion indique aussi les cas où une alternative mérite d’être étudiée.",
    seoTitle: "Lire un avis sans confondre opinion et information.",
    seoParagraphs: [
      "Les offres changent. Un avis reste utile s’il date ses observations, documente ses sources et sépare les faits de son interprétation. Les prix et fonctions doivent être revérifiés sur le site officiel avant toute souscription.",
      "Les liens partenaires éventuels sont signalés sur la page concernée. La méthode et les sources affichées donnent au lecteur les éléments nécessaires pour nuancer la conclusion.",
      "Commencez par vérifier le contexte de l’analyse : profil d’entreprise, opérations examinées, période et limites du test. Une expérience fluide pour un indépendant peut devenir insuffisante pour une équipe, une activité internationale ou une organisation qui impose des validations multiples.",
      "Lisez les absences avec autant d’attention que les fonctions mises en avant. Export des données, reprise, résiliation, disponibilité du support et traitement d’un incident comptent dans la durée. Si un point n’est pas documenté, transformez-le en question plutôt que de déduire une réponse favorable.",
      "Une conclusion utile doit aussi ouvrir des alternatives. Comparez au moins une solution d’un autre modèle, puis expliquez l’écart que vous acceptez en échange d’un gain précis. Ce raisonnement rend l’avis réutilisable lorsque vos besoins ou les conditions du produit évoluent.",
    ],
  },
  "codes-parrainage": {
    label: "Offres",
    title: "Une offre n’est intéressante",
    accent: "que si ses conditions vous conviennent.",
    subtitle: "Vérifiez l’état, l’éligibilité, les dates et la source d’une offre avant de l’intégrer à votre choix de solution.",
    metaDescription: "Offres et parrainages business expliqués : statut, conditions, éligibilité, dates et source officielle lorsqu’elles sont disponibles.",
    catalogTitle: "Consultez les offres documentées et leur statut.",
    catalogCopy: "Une fiche publiée précise si l’offre est active, expirée ou à confirmer. Pour apprécier un montant, examinez les conditions et la source affichées avec la fiche.",
    search: "Rechercher une offre ou une solution…",
    method: "Commencez par vérifier que la solution répond à votre besoin hors promotion. Lisez ensuite l’éligibilité, l’action attendue, le délai et les éventuelles exclusions. Une économie ponctuelle ne compense pas un produit inadapté.",
    seoTitle: "Vérifier une promotion avant d’en tenir compte.",
    seoParagraphs: [
      "Les primes, remises et codes peuvent évoluer rapidement. La fiche affiche son statut, la date disponible et un lien vers la source lorsqu’elle est accessible. Les conditions à confirmer sont signalées comme telles.",
      "Certains liens peuvent rémunérer Skoria. Leur nature commerciale est indiquée sur la page concernée afin de les distinguer des sources d’information.",
      "Évaluez d’abord la solution sans tenir compte de l’avantage annoncé. Vérifiez qu’elle couvre les opérations, utilisateurs, moyens de paiement, intégrations et modalités de support nécessaires. Une promotion temporaire ne compense pas un produit mal adapté ou un coût récurrent trop élevé après sa fin.",
      "Reconstituez ensuite le parcours complet : personne éligible, action attendue, date limite, éventuel dépôt ou volume minimal, délai de versement et motif d’exclusion. Chaque étape doit être reliée à une condition publiée ; une formulation ambiguë reste un point à confirmer directement auprès du fournisseur.",
      "Conservez la date, le lien et les conditions consultées au moment de décider. Si l’offre n’est plus vérifiable, comparez le produit sur ses conditions ordinaires. Cette trace facilite aussi la vérification du versement et évite de confondre une estimation, un avantage potentiel et un droit acquis.",
    ],
  },
};

const STEPS = [
  { title: "Décrire votre usage", body: "Précisez les opérations, utilisateurs, outils et contraintes qui structurent réellement votre choix." },
  { title: "Vérifier les faits", body: "Consultez les conditions, les dates et les sources officielles associées aux points décisifs." },
  { title: "Comparer les écarts", body: "Confrontez le coût complet, les limites et les alternatives avec la même grille de lecture." },
];

const DECISION_CARDS = [
  {
    eyebrow: "01 · Usage",
    title: "Décrire le travail à accomplir",
    body: "Listez les opérations, leur fréquence, les personnes concernées et les moments où une validation est nécessaire. Cette base évite de comparer des fonctions séduisantes qui ne répondent à aucun besoin concret.",
  },
  {
    eyebrow: "02 · Conditions",
    title: "Repérer ce qui ouvre ou ferme l’accès",
    body: "Vérifiez les statuts juridiques acceptés, la zone géographique, les volumes, les justificatifs, les délais et les exclusions. Une condition inconnue reste à confirmer avant de compter sur la solution ou l’avantage.",
  },
  {
    eyebrow: "03 · Coût complet",
    title: "Additionner ce qui sera réellement payé",
    body: "Rapprochez le prix de base, les options, les dépassements, les utilisateurs, les opérations particulières et le temps de mise en place. Utilisez la même période et le même scénario pour chaque solution.",
  },
  {
    eyebrow: "04 · Fonctionnement",
    title: "Tester l’organisation quotidienne",
    body: "Examinez les droits, validations, exports, intégrations, notifications et moyens de joindre le support. Le bon critère est celui qui réduit une difficulté observable dans votre manière de travailler.",
  },
  {
    eyebrow: "05 · Preuve",
    title: "Relier chaque fait à une date et une source",
    body: "Distinguez une condition officielle, une observation éditoriale et un point encore ouvert. Plus une information influence le prix, l’éligibilité ou la continuité d’activité, plus sa provenance doit être facile à retrouver.",
  },
  {
    eyebrow: "06 · Limites",
    title: "Prévoir le cas qui sort du parcours idéal",
    body: "Interrogez la reprise des données, un incident, un refus, un changement d’offre ou une résiliation. Les exceptions révèlent souvent les différences que les listes de fonctionnalités laissent de côté.",
  },
  {
    eyebrow: "07 · Décision",
    title: "Consigner les écarts que vous acceptez",
    body: "Notez vos priorités, les réponses confirmées, les compromis et les points à revoir. Vous pourrez ainsi expliquer le choix, préparer le déploiement et réexaminer la solution si le contexte change.",
  },
];

export async function CommercialHubPage({ route }: { route: CommercialRoute }) {
  const copy = META[route];
  const segments = await getCommercialSegments(route);
  const pages = (
    await Promise.all(segments.map((segment) => getCommercialPageBySegment(route, segment)))
  ).filter((page): page is NonNullable<typeof page> => Boolean(page));

  const items = pages.map((page) => ({
    href: page.url,
    title: page.label,
    description: page.target_query,
    group: page.hub_label ?? "Autres",
    meta: "Méthode et sources",
  }));
  const groups = [...new Set(items.map((item) => item.group))].sort((a, b) => a.localeCompare(b, "fr"));
  const publicationStats = items.length > 0
    ? [
        { value: String(items.length), label: "pages publiées" },
        { value: String(groups.length), label: "catégories disponibles" },
      ]
    : [
        { value: String(DECISION_CARDS.length), label: "angles de décision" },
        { value: String(STEPS.length), label: "étapes de méthode" },
      ];
  const breadcrumbs = [
    { name: "Accueil", url: "/" },
    { name: copy.label, url: `/${route}` },
  ];

  return (
    <CollectionHubV2
      eyebrow={`${copy.label} · méthode indépendante`}
      title={copy.title}
      titleAccent={copy.accent}
      intro={copy.subtitle}
      breadcrumbs={breadcrumbs}
      media={{
        src: "/images/skoria-v2/editorial/fintech-tools.webp",
        alt: "Carte de paiement sans marque, terminal et carnet sur une table",
      }}
      stats={[
        ...publicationStats,
        { value: "Statut", label: "visible sur chaque fiche" },
        { value: "Liens", label: "partenaires signalés" },
      ]}
      catalogEyebrow={`${copy.label} publiés`}
      catalogTitle={copy.catalogTitle}
      catalogCopy={copy.catalogCopy}
      items={items}
      groups={groups}
      searchPlaceholder={copy.search}
      emptyMessage="Les contenus de cette collection sont encore en revue. Ils apparaîtront ici après vérification des faits, des sources et du statut de publication."
      decisionEyebrow="Avant de comparer"
      decisionTitle="Construisez une grille qui résiste aux promesses commerciales."
      decisionIntro="Ces sept angles s’appliquent à un comparatif, à un avis comme à une offre. Utilisez-les pour transformer une page en décision traçable et en questions concrètes à poser au fournisseur."
      decisionCards={DECISION_CARDS}
      steps={STEPS}
      methodTitle="La méthode reste visible jusque dans la conclusion."
      methodCopy={copy.method}
      seoTitle={copy.seoTitle}
      seoParagraphs={copy.seoParagraphs}
      faqs={[
        { question: "Comment Skoria choisit-il les critères ?", answer: "Les critères partent des usages professionnels, des conditions publiées par les fournisseurs et des différences susceptibles de modifier une décision. La méthode et les sources doivent rester consultables sur chaque page." },
        { question: "Comment repérer un lien partenaire ?", answer: `Lorsqu’un lien partenaire est identifié, ${AppConfig.name} le signale à proximité de l’action concernée. Vous pouvez ainsi distinguer le lien commercial des sources utilisées pour examiner la solution.` },
        { question: "Pourquoi certaines pages n’apparaissent-elles pas ?", answer: "Une page en brouillon ou en revue reste exclue de la collection publique jusqu’à la vérification de ses informations, de ses sources et de ses données structurées." },
        { question: "Que faire lorsqu’un prix ou une condition n’est pas daté ?", answer: "Traitez l’information comme étant à confirmer. Consultez la source officielle, notez la date de votre vérification et demandez au fournisseur de préciser les options, exclusions ou seuils qui peuvent modifier le coût ou l’éligibilité." },
        { question: "Comment comparer deux solutions de modèles différents ?", answer: "Partez d’un scénario d’usage commun et d’une période identique. Comparez ensuite le résultat obtenu, le coût complet, le travail restant à votre charge, les limites et la facilité de sortie. Le format de l’offre peut différer ; la question à résoudre reste la même." },
      ]}
      ctaNeed={`Comparer des ${copy.label.toLowerCase()}`}
      variant="commercial"
    >
      <BreadcrumbJsonLd items={breadcrumbs} />
      <WebPageJsonLd name={`${copy.label} ${AppConfig.name}`} description={copy.metaDescription} url={`/${route}`} />
    </CollectionHubV2>
  );
}
