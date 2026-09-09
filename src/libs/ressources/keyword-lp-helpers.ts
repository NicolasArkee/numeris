// ─── Keyword LP helpers ──────────────────────────────────────────────────────
// Fonctions pures partagées entre le rendu runtime (src/app/ressources/[theme])
// et les scripts CLI (triage-keyword-pages / generate-keyword-lp-content /
// check-keyword-lp-helpers). Aucun accès DB direct ici : les callers passent
// un résolveur ville (adapter async côté Next, better-sqlite3 côté scripts).

export type KeywordClass =
  | "geo"          // intent "expert comptable + ville" pur → 301 annuaire
  | "geo-theme"    // ville × thème résolu (obernai×agriculture) → LP locale
  | "commercial"
  | "informational"
  | "navigational"; // marque/plateforme → fiche neutre + alternatives

export type KeywordDisposition = "enrich" | "redirect" | "noindex" | "hidden";

export interface CityLite {
  slug: string;
  name: string;
  code_insee: string;
  population: number;
  department_code: string | null;
  department_name: string | null;
}

export interface GeoParse<C extends CityLite = CityLite> {
  city: C;
  /** Tokens restants après extraction ville (candidats thème). */
  themeTokens: string[];
  /** Forme du slug : ville après le préfixe métier, ou ville en tête. */
  form: "prefix" | "suffix";
}

// ─── Tokenisation / normalisation ───────────────────────────────────────────

export const KEYWORD_STOPWORDS = new Set([
  "de", "des", "du", "d", "la", "le", "l", "les", "un", "une",
  "en", "et", "a", "au", "aux", "pour", "par", "sur", "sans",
  "entre", "avec", "chez", "comment", "quel", "quelle", "quels",
]);

const YEAR_RE = /^(19|20)\d{2}$/u;

export function slugTokens(slug: string): string[] {
  return slug.split("-").filter(Boolean);
}

/** Clé de dédup par permutation : stopwords retirés, pluriels et millésimes
 *  neutralisés, tokens triés. Deux slugs avec la même clé portent le même
 *  intent (`salaire-expert-comptable` ≡ `expert-comptable-salaire`). */
export function normalizeForDedup(slug: string): string {
  return slugTokens(slug)
    .filter((t) => !KEYWORD_STOPWORDS.has(t))
    .filter((t) => !YEAR_RE.test(t))
    .map((t) => (t.length > 3 && t.endsWith("s") ? t.slice(0, -1) : t))
    .sort()
    .join("-");
}

/** Slugs "bruit" : ≥2 tokens purement numériques (téléphones, adresses,
 *  dates d'événements) — aucun contenu défendable. */
export function isNumericJunk(slug: string): boolean {
  return slugTokens(slug).filter((t) => /^\d+$/u.test(t)).length >= 2;
}

// ─── Extraction géo ──────────────────────────────────────────────────────────
// Formes couvertes : `{prefixe}-{ville}[-{reste}]` et `{ville}-{suffixe}`.
// La fenêtre ville est ANCRÉE (immédiatement après le préfixe, ou en tête de
// slug) et testée longest-match-first — `clermont-ferrand` gagne sur
// `clermont`, et `expert-comptable-en-ligne` ne matche jamais la commune
// « Ligné » (la fenêtre devrait commencer à `en`).

export const GEO_PREFIXES = [
  "agence-expert-comptable",
  "avis-expert-comptable-lmnp",
  "avis-expert-comptable",
  "bon-expert-comptable",
  "annuaire-expert-comptable",
  "annuaire-des-experts-comptables",
  "experts-comptables",
  "expert-comptable",
];

export const GEO_SUFFIXES = [
  "expert-comptable",
  "experts-comptables",
  "expert-comptabilite",
];

export interface CityWindowCandidate {
  citySlug: string;
  rest: string[];
  form: "prefix" | "suffix";
  /** "start" : ville immédiatement après le préfixe (sûr). "end" : ville en
   *  fin de slug (`{prefix}-{thème}-{ville}`) — accepté uniquement si le
   *  reliquat de tête résout un thème connu (anti faux positif type
   *  `expert-comptable-en-ligne` vs la commune Ligné). */
  anchor: "start" | "end";
}

/** Fenêtres ville candidates, ordonnées : forme préfixe avant suffixe,
 *  ancre début avant ancre fin, fenêtre la plus longue d'abord. Le caller
 *  résout chaque candidate contre cities_official et s'arrête au premier hit
 *  accepté (cf. `acceptGeoCandidate`). */
export function cityWindowCandidates(slug: string): CityWindowCandidate[] {
  const out: CityWindowCandidate[] = [];

  for (const prefix of GEO_PREFIXES) {
    if (!slug.startsWith(`${prefix}-`)) continue;
    const rest = slugTokens(slug.slice(prefix.length + 1));
    for (let k = rest.length; k >= 1; k--) {
      out.push({
        citySlug: rest.slice(0, k).join("-"),
        rest: rest.slice(k),
        form: "prefix",
        anchor: "start",
      });
    }
    // Forme `{prefix}-{thème}-{ville}` : ville ancrée en fin de slug.
    for (let i = 1; i < rest.length; i++) {
      out.push({
        citySlug: rest.slice(i).join("-"),
        rest: rest.slice(0, i),
        form: "prefix",
        anchor: "end",
      });
    }
    break; // premier préfixe (le plus long) uniquement
  }

  for (const suffix of GEO_SUFFIXES) {
    if (!slug.endsWith(`-${suffix}`)) continue;
    const head = slugTokens(slug.slice(0, slug.length - suffix.length - 1));
    // Ancrée en tête ET consommant tout l'avant-suffixe : `paris-expert-comptable`
    // matche, `salaire-expert-comptable` ne matche pas une fenêtre partielle
    // → pas de faux positif sur les slugs informationnels.
    if (head.length > 0) {
      out.push({
        citySlug: head.join("-"),
        rest: [],
        form: "suffix",
        anchor: "start",
      });
    }
    break;
  }

  return out;
}

/** Gate anti faux positif : une ville ancrée en fin de slug n'est acceptée
 *  que si le reliquat de tête est un thème connu. */
export function acceptGeoCandidate(cand: CityWindowCandidate): boolean {
  if (cand.anchor === "start") return true;
  return resolveTheme(cand.rest) !== null;
}

/** Résout la première fenêtre ville existante via le résolveur fourni. */
export async function resolveGeoKeyword<C extends CityLite>(
  slug: string,
  getCityBySlug: (citySlug: string) => Promise<C | null | undefined>,
): Promise<GeoParse<C> | null> {
  for (const cand of cityWindowCandidates(slug)) {
    if (!acceptGeoCandidate(cand)) continue;
    const city = await getCityBySlug(cand.citySlug);
    if (city) return { city, themeTokens: cand.rest, form: cand.form };
  }
  return null;
}

/** Variante synchrone pour les scripts CLI (better-sqlite3). */
export function resolveGeoKeywordSync<C extends CityLite>(
  slug: string,
  getCityBySlug: (citySlug: string) => C | null | undefined,
): GeoParse<C> | null {
  for (const cand of cityWindowCandidates(slug)) {
    if (!acceptGeoCandidate(cand)) continue;
    const city = getCityBySlug(cand.citySlug);
    if (city) return { city, themeTokens: cand.rest, form: cand.form };
  }
  return null;
}

// ─── Thèmes (reliquat après ville) ──────────────────────────────────────────

export interface ThemeResolution {
  key: string;
  /** Libellé prêt à insérer après « pour » : « pour l'agriculture ». */
  label: string;
  /** Route interne riche à mailler depuis la LP (si elle existe). */
  href?: string;
}

const THEME_ALIASES: Record<string, ThemeResolution> = {
  "agriculture": { key: "agriculture", label: "l'agriculture", href: "/professions/agriculteurs" },
  "agricole": { key: "agriculture", label: "l'agriculture", href: "/professions/agriculteurs" },
  "tpe": { key: "tpe", label: "les TPE" },
  "pme": { key: "pme", label: "les PME" },
  "lmnp": { key: "lmnp", label: "la location meublée (LMNP)", href: "/professions/loueurs-en-meuble-lmnp-lmp" },
  "immobilier": { key: "immobilier", label: "l'immobilier", href: "/secteurs/immobilier" },
  "immoblier": { key: "immobilier", label: "l'immobilier", href: "/secteurs/immobilier" },
  "restauration": { key: "restauration", label: "la restauration", href: "/secteurs/restauration" },
  "btp": { key: "btp", label: "le BTP", href: "/secteurs/btp" },
  "commerce": { key: "commerce", label: "le commerce", href: "/secteurs/commerce" },
  "transport": { key: "transport", label: "le transport", href: "/secteurs/transport" },
  "association": { key: "association", label: "les associations", href: "/secteurs/association" },
  "start-up": { key: "start-up", label: "les start-ups", href: "/secteurs/start-up" },
  "startup": { key: "start-up", label: "les start-ups", href: "/secteurs/start-up" },
  "creation-entreprise": { key: "creation-entreprise", label: "la création d'entreprise", href: "/expertises/creation-entreprise" },
};

/** Reliquat "junk" toléré derrière une ville : code postal, arrondissement,
 *  qualificatifs SERP locaux — la page cible reste l'annuaire ville. */
const GEO_JUNK_TOKENS = new Set([
  "les", "mieux", "notes", "note", "ouvert", "actuellement", "pres",
  "proximite", "polygone", "nord", "sud", "est", "ouest", "boulevard",
  "kennedy", "centre", "ville",
]);

export function resolveTheme(tokens: string[]): ThemeResolution | null {
  const cleaned = tokens.filter((t) => !KEYWORD_STOPWORDS.has(t));
  if (cleaned.length === 0) return null;
  const joined = cleaned.join("-");
  if (THEME_ALIASES[joined]) return THEME_ALIASES[joined];
  if (cleaned.length === 1 && THEME_ALIASES[cleaned[0]]) {
    return THEME_ALIASES[cleaned[0]];
  }
  return null;
}

/** true si le reliquat post-ville est purement décoratif (CP, "mieux notés"…)
 *  → le slug est traité comme géo pur (redirect annuaire), pas geo-theme. */
export function isGeoJunkRemainder(tokens: string[]): boolean {
  const cleaned = tokens.filter((t) => !KEYWORD_STOPWORDS.has(t));
  if (cleaned.length === 0) return true;
  return cleaned.every((t) => /^\d{4,5}$/u.test(t) || GEO_JUNK_TOKENS.has(t));
}

// ─── Classification ──────────────────────────────────────────────────────────

const INFORMATIONAL_HINTS = [
  "salaire", "salaires", "etude", "etudes", "diplome", "formation",
  "stage", "stagiaire", "memorialiste", "metier", "devenir", "combien",
  "difference", "deontologie", "convention", "ccn", "definition",
  "mission", "missions", "obligation", "retraite", "reconversion",
  "parcours", "cursus", "bts", "concours", "ecole", "examen",
];

export function classifyKeyword(
  kw: { slug: string; intent: string | null },
  geo: GeoParse | null,
): KeywordClass {
  if (geo) {
    if (isGeoJunkRemainder(geo.themeTokens)) return "geo";
    return "geo-theme";
  }
  const intent = (kw.intent ?? "").toLowerCase();
  if (intent.startsWith("navigational")) return "navigational";
  const tokens = slugTokens(kw.slug);
  if (tokens.some((t) => INFORMATIONAL_HINTS.includes(t))) return "informational";
  if (intent.startsWith("informational")) return "informational";
  return "commercial";
}

// ─── Meta déterministes ──────────────────────────────────────────────────────

/** Variance déterministe par slug (anti-footprint, stable entre builds). */
export function hashVariant(slug: string, n: number): number {
  let h = 0;
  for (let i = 0; i < slug.length; i++) {
    h = (h * 31 + slug.charCodeAt(i)) | 0;
  }
  return Math.abs(h) % n;
}

function capitalizeFirst(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** Libellé nettoyé depuis keyword_pages.label (accents conservés). */
export function cleanLabel(label: string): string {
  return capitalizeFirst(
    label
      .replace(/\bexpert comptable\b/giu, "expert-comptable")
      .replace(/\bexperts comptables\b/giu, "experts-comptables")
      .trim(),
  );
}

export interface KeywordMetaContext {
  cityName?: string;
  cabinetCount?: number;
  departmentName?: string | null;
  themeLabel?: string;
}

export interface KeywordMeta {
  title: string;
  description: string;
  h1: string;
  intro: string;
}

// NB : le layout racine applique déjà le template `%s | Skoria` — les titles
// construits ici ne doivent PAS ré-ajouter le suffixe marque.
const SITE = "Skoria";

export function buildKeywordMeta(
  kw: { slug: string; label: string },
  cls: KeywordClass,
  ctx: KeywordMetaContext = {},
): KeywordMeta {
  const label = cleanLabel(kw.label);

  if ((cls === "geo" || cls === "geo-theme") && ctx.cityName) {
    const ville = ctx.cityName;
    const dept = ctx.departmentName ? ` (${ctx.departmentName})` : "";
    const n = ctx.cabinetCount && ctx.cabinetCount > 0 ? ctx.cabinetCount : undefined;
    const pour = cls === "geo-theme" && ctx.themeLabel ? ` pour ${ctx.themeLabel}` : "";
    const compare = n ? `comparez ${n} cabinet${n > 1 ? "s" : ""}` : "comparatif des cabinets";
    return {
      title: pour
        ? `Expert-comptable à ${ville}${pour}`
        : `Expert-comptable à ${ville} : ${compare}`,
      description: `Trouvez un expert-comptable à ${ville}${dept}${pour} : ${n ? `${n} cabinets recensés, ` : ""}données publiques disponibles, critères de comparaison et préparation du périmètre de mission.`,
      h1: `Expert-comptable à ${ville}${pour}`,
      intro: `Skoria recense les cabinets d'expertise comptable à ${ville}${dept} à partir de sources administratives publiques${pour ? ` et vous aide à comparer les options pertinentes${pour}` : ""}. Comparez les cabinets, les périmètres de mission et les ordres de prix avant de vous engager.`,
    };
  }

  switch (cls) {
    case "informational": {
      const t = hashVariant(kw.slug, 3);
      const title = [
        `${label} : chiffres et repères 2026`,
        `${label} : ce qu'il faut savoir`,
        `${label} — le point complet`,
      ][t];
      return {
        title,
        description: `${label} : repères concrets, ordres de grandeur et démarches, par ${SITE}, comparateur indépendant d'experts-comptables.`,
        h1: label,
        intro: `${label} : voici les repères utiles réunis par l'équipe ${SITE} — comparateur indépendant — pour comprendre le sujet et préparer vos décisions.`,
      };
    }
    case "navigational": {
      return {
        title: `${label} : présentation et alternatives`,
        description: `${label} : positionnement, périmètre et alternatives à comparer. Analyse indépendante par ${SITE}.`,
        h1: `${label} : présentation et alternatives`,
        intro: `${SITE} est un comparateur indépendant, sans lien avec ${label}. Cette page présente le positionnement de cette offre et les critères pour la comparer aux autres options du marché.`,
      };
    }
    default: {
      const t = hashVariant(kw.slug, 3);
      const title = [
        `${label} : comparer les offres et honoraires`,
        `${label} : comparer les offres`,
        `${label} — comparatif indépendant`,
      ][t];
      return {
        title,
        description: `${label} : périmètre, critères d'honoraires et points de vigilance pour demander puis comparer des propositions équivalentes. Par ${SITE}.`,
        h1: label,
        intro: `Vous cherchez ${kw.label.toLowerCase()} ? ${SITE} structure les critères à examiner : périmètre de mission, niveau d'accompagnement, outils, exclusions et honoraires à confirmer.`,
      };
    }
  }
}

// ─── FAQ data-driven (LP géo) ────────────────────────────────────────────────

export function buildGeoKeywordFaqItems(
  cityName: string,
  cabinetCount: number,
  departmentName?: string | null,
  themeLabel?: string,
): { question: string; answer: string }[] {
  const items: { question: string; answer: string }[] = [
    {
      question: `Combien coûte un expert-comptable à ${cityName} ?`,
      answer:
        "Les honoraires dépendent du statut juridique, du volume de pièces, des échéances et du périmètre de mission. Demandez des propositions détaillées puis comparez les inclusions, les exclusions et les hypothèses à périmètre équivalent.",
    },
    {
      question: `Comment choisir un expert-comptable à ${cityName}${themeLabel ? ` pour ${themeLabel}` : ""} ?`,
      answer: `Comparez le périmètre exact de la lettre de mission, l'expérience sur votre activité${themeLabel ? ` (${themeLabel})` : ""}, les outils proposés et la proximité. Vérifiez les informations légales publiques du cabinet avant de vous engager.`,
    },
  ];
  if (cabinetCount > 0) {
    items.push({
      question: `Combien de cabinets d'expertise comptable à ${cityName} ?`,
      answer: `Skoria recense actuellement ${cabinetCount} cabinet${cabinetCount > 1 ? "s" : ""} à ${cityName}${departmentName ? ` (${departmentName})` : ""}, à partir de sources administratives publiques. Les fiches précisent leur statut de vérification.`,
    });
  }
  items.push({
    question: `Peut-on travailler avec un expert-comptable hors de ${cityName} ?`,
    answer:
      "Oui. La tenue comptable est aujourd'hui largement dématérialisée : un cabinet situé ailleurs en France peut suivre votre dossier. La proximité reste utile pour les rendez-vous de bilan et le conseil de terrain.",
  });
  return items;
}
