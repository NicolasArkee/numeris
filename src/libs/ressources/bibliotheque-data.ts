import { unstable_cache } from "next/cache";
import { sanitizeLegacyPublicText } from "@/libs/skoria-v2/content-safety";
import { db } from "@/libs/db";

// Données de la « bibliothèque » /ressources (index V2 + tous-les-dossiers V2).

/** Dossiers phares — curation éditoriale stable (titres propres, pas les
 *  labels machine du maillage-v3). Le premier est « à la une ». */
export interface FlagshipDossier {
  href: string;
  title: string;
  description: string;
  tag: string;
  hot?: boolean;
}

export const FLAGSHIP_DOSSIERS: FlagshipDossier[] = [
  {
    href: "/ressources/facturation-electronique",
    title: "Facture électronique 2026-2027",
    description:
      "Réception obligatoire pour toutes les entreprises le 1er septembre 2026 : calendrier, PDP, formats, sanctions — le dossier pour s'y préparer avec son expert-comptable.",
    tag: "Réforme · échéance 01/09/2026",
    hot: true,
  },
  {
    href: "/ressources/prix-expert-comptable",
    title: "Combien coûte un expert-comptable ?",
    description: "Grille de référence, facteurs de prix et simulateur pour chiffrer VOTRE dossier avant le premier rendez-vous.",
    tag: "Tarifs",
  },
  {
    href: "/ressources/expert-comptable-en-ligne",
    title: "En ligne ou cabinet de proximité",
    description: "Le premier arbitrage : périmètres, échanges, budgets — comment trancher selon votre activité.",
    tag: "Comparatif",
  },
  {
    href: "/ressources/logiciels-comptables",
    title: "Logiciels de comptabilité",
    description: "Sage, Cegid, Pennylane, Silae… ce que votre cabinet utilise et ce que ça change pour vous.",
    tag: "Outils",
  },
  {
    href: "/ressources/lmnp-expert-comptable",
    title: "LMNP : la location meublée",
    description: "Le guide fiscal complet du loueur en meublé : régimes, amortissement, obligations.",
    tag: "Immobilier",
  },
  {
    href: "/ressources/convention-collective-expert-comptable",
    title: "Convention collective (IDCC 787)",
    description: "Salaires, congés, préavis : le pilier CCN des cabinets, sous-thèmes consolidés.",
    tag: "Social",
  },
  {
    href: "/ressources/salaire-expert-comptable",
    title: "Salaire d'un expert-comptable",
    description: "Les repères de rémunération du métier, du stagiaire à l'associé.",
    tag: "Métier",
  },
  {
    href: "/ressources/devenir-expert-comptable",
    title: "Devenir expert-comptable",
    description: "DCG, DSCG, stage, DEC : le parcours complet vers le diplôme.",
    tag: "Métier",
  },
  {
    href: "/ressources/code-de-deontologie-expert-comptable",
    title: "Déontologie de la profession",
    description: "Ce que le code impose aux cabinets — et ce que ça garantit à leurs clients.",
    tag: "Cadre légal",
  },
];

/** Rails « par intention » — curation stable de LP fortes. */
export const INTENTION_RAILS: { title: string; links: { label: string; href: string }[] }[] = [
  {
    title: "Chiffrer",
    links: [
      { label: "Prix d'un expert-comptable", href: "/ressources/prix-expert-comptable" },
      { label: "Tarifs : la grille 2026", href: "/ressources/tarif-expert-comptable" },
      { label: "Simulateur d'honoraires", href: "/simulateurs/honoraires" },
      { label: "Calculatrice de TVA (HT ⇄ TTC)", href: "/simulateurs/calcul-tva" },
      { label: "Coût d'un salarié pour l'employeur", href: "/simulateurs/cout-salarie" },
      { label: "Frais kilométriques : le barème", href: "/simulateurs/frais-kilometriques" },
    ],
  },
  {
    title: "Choisir",
    links: [
      { label: "En ligne vs cabinet local", href: "/ressources/expert-comptable-en-ligne" },
      { label: "Lire une lettre de mission", href: "/ressources/lettre-de-mission-expert-comptable" },
      { label: "Choisir sa PDP", href: "/ressources/choisir-sa-pdp" },
      { label: "Comparer les cabinets de ma ville", href: "/annuaire/experts-comptables" },
    ],
  },
  {
    title: "Se mettre en conformité",
    links: [
      { label: "Facture électronique : le calendrier", href: "/ressources/calendrier-facturation-electronique" },
      { label: "Mentions obligatoires", href: "/ressources/mentions-obligatoires-facture-electronique" },
      { label: "Obligations comptables", href: "/ressources/obligation-expert-comptable" },
      { label: "E-reporting", href: "/ressources/e-reporting" },
    ],
  },
  {
    title: "Le métier",
    links: [
      { label: "Salaire d'un expert-comptable", href: "/ressources/salaire-expert-comptable" },
      { label: "Devenir expert-comptable", href: "/ressources/devenir-expert-comptable" },
      { label: "Le métier au quotidien", href: "/ressources/metier-expert-comptable" },
      { label: "Offres d'emploi du secteur", href: "/ressources/postes-expert-comptable" },
    ],
  },
];

export interface EditorialDossier {
  slug: string;
  title: string;
  description: string | null;
}

/** Nettoie les labels machine du maillage-v3 : « Dossier Alliance Expert
 *  Alliance » → « Alliance expert ». */
function normalizeDossierTitle(raw: string): string {
  const words = raw
    .replace(/^Dossier\s*/iu, "")
    .replace(/^[\s:–—-]+/u, "")
    .split(/\s+/u);
  const seen = new Set<string>();
  const out: string[] = [];
  for (const w of words) {
    const k = w.toLowerCase();
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(w.toLowerCase());
  }
  const joined = out.join(" ");
  return joined.charAt(0).toUpperCase() + joined.slice(1);
}

/** Dossiers éditoriaux maillage-v3 (pages DB-only `dossier-*`), labels
 *  normalisés — affichés uniquement dans la vue exhaustive. */
export const getEditorialDossiers = unstable_cache(
  async (): Promise<EditorialDossier[]> => {
    try {
      const publishedSlugs = (await db.getAllPageMeta())
        .filter(
          (meta) =>
            meta.route === "ressources"
            && meta.publish_status === "published"
            && meta.slug.startsWith("dossier-"),
        )
        .map((meta) => meta.slug);
      const data = (
        await Promise.all(
          publishedSlugs.map((slug) => db.getPageSections("ressources", slug)),
        )
      ).flat();
      const bySlug = new Map<string, string>();
      for (const row of data) {
        if (!bySlug.has(row.slug) && row.section_type === "Hero" && row.title) {
          bySlug.set(row.slug, row.title);
        }
      }
      for (const row of data) {
        if (!bySlug.has(row.slug)) bySlug.set(row.slug, row.slug.replace(/^dossier-/u, "").replace(/-/gu, " "));
      }
      return [...bySlug.entries()]
        .map(([slug, title]) => ({
          slug,
          title: normalizeDossierTitle(sanitizeLegacyPublicText(title)),
          description: null,
        }))
        .sort((a, b) => a.title.localeCompare(b.title, "fr"));
    } catch {
      return [];
    }
  },
  ["bibliotheque-editorial-dossiers-v1"],
  { revalidate: 3600 },
);

export interface PillarPage {
  slug: string;
  title: string;
}

/** Pages de référence de la bibliothèque : les LP têtes de requête (critère
 *  interne volume ≥ 1000, jamais affiché) — titres propres via seo_overrides.
 *  Remplace l'ancien dump de taxonomie interne (silos/hubs d'import). */
export const getPillarPages = unstable_cache(
  async (): Promise<PillarPage[]> => {
    try {
      const [keywords, allMeta] = await Promise.all([
        db.getAllKeywords(),
        db.getAllPageMeta(),
      ]);
      const published = new Set(
        allMeta
          .filter(
            (meta) => meta.route === "ressources" && meta.publish_status === "published",
          )
          .map((meta) => meta.slug),
      );
      const rows = keywords
        .filter(
          (keyword) =>
            keyword.disposition === "enrich"
            && keyword.volume >= 1000
            && published.has(keyword.slug),
        )
        .slice(0, 60);
      return Promise.all(
        rows.map(async (row) => {
          const seo = await db.getSeoOverride("ressources", row.slug).catch(() => null);
          return {
            slug: row.slug,
            title:
              seo?.h1
              || row.label.charAt(0).toUpperCase() + row.label.slice(1),
          };
        }),
      );
    } catch {
      return [];
    }
  },
  ["bibliotheque-pillar-pages-v1"],
  { revalidate: 86400 },
);

/** Compteur réel de guides publiés sur /ressources. */
export const getPublishedGuidesCount = unstable_cache(
  async (): Promise<number> => {
    try {
      return (await db.getAllPageMeta()).filter(
        (meta) => meta.route === "ressources" && meta.publish_status === "published",
      ).length;
    } catch {
      return 0;
    }
  },
  ["bibliotheque-guides-count-v1"],
  { revalidate: 86400 },
);
