/**
 * scripts/generate-simulateur-content.ts
 *
 * Édito des pages outils /simulateurs/{slug} (template V2 : calculateur
 * above-the-fold + édito dessous). Blueprint FIXE 7 sections :
 *   EditoIntro → DefinitionBox → ContentSection (règle de calcul) →
 *   NumberedSteps → Checklist → AlertBox → ContentSection (H2 interrogatif).
 * PAS de section Faq : la page émet déjà FaqJsonLd depuis le registry
 * (un bloc Faq DB créerait un doublon de schéma FAQPage).
 *
 * Grounding YMYL : FAITS par outil = exactement les constantes de
 * src/libs/simulateurs/math.ts + calendrier.ts (vérifiées sources gouv le
 * 2026-07-13). QC numérique : tout nombre du texte doit figurer dans les
 * FAITS (ou être un petit entier ≤ 12) — l'édito ne peut pas contredire
 * l'outil. Tag generated_by_model='keyword-lp-v1' (même migration/rollback).
 *
 * Usage : npx tsx scripts/generate-simulateur-content.ts [--only slug] [--limit N] [--force] [--commit]
 */
import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";

const COMMIT = process.argv.includes("--commit");
const FORCE = process.argv.includes("--force");
const argVal = (name: string): string | undefined => {
  const i = process.argv.indexOf(name);
  return i >= 0 ? process.argv[i + 1] : undefined;
};
const LIMIT = Number(argVal("--limit") ?? 0);
const ONLY = argVal("--only");

const DB_PATH = path.join(process.cwd(), "numeris.db");
const ARKEE_ENV_PATH = "/Users/nicolas/ARKEE_ORG/.env";
const MODEL_TAG = "keyword-lp-v1";
const PRIMARY_MODEL = "gemini-3-flash-preview";
const FALLBACK_MODEL = "gemini-2.5-flash";
const CONCURRENCY = 3;

// ─── Gemini (pattern scripts existants) ─────────────────────────────────────
function loadEnv(p: string): Record<string, string> {
  const out: Record<string, string> = {};
  if (!fs.existsSync(p)) return out;
  for (const line of fs.readFileSync(p, "utf-8").split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const eq = t.indexOf("=");
    if (eq === -1) continue;
    let v = t.slice(eq + 1).trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
    out[t.slice(0, eq).trim()] = v;
  }
  return out;
}
const API_KEY =
  process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY
  || loadEnv(ARKEE_ENV_PATH).GEMINI_API_KEY || loadEnv(ARKEE_ENV_PATH).GOOGLE_API_KEY || "";

function stripFence(t: string): string {
  let s = t.trim();
  if (s.startsWith("```")) s = s.replace(/^```(?:json)?\s*/iu, "").replace(/```\s*$/iu, "");
  return s.trim();
}

async function callGemini(prompt: string): Promise<string> {
  let model = PRIMARY_MODEL;
  for (let attempt = 0; attempt < 4; attempt++) {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.7, topP: 0.95, responseMimeType: "application/json" },
        }),
      },
    );
    if (res.ok) {
      const json = (await res.json()) as { candidates?: { content?: { parts?: { text?: string }[] } }[] };
      const text = json.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
      if (text) return stripFence(text);
      throw new Error("Empty Gemini response");
    }
    if (res.status === 404 && model === PRIMARY_MODEL) { model = FALLBACK_MODEL; continue; }
    if (res.status === 429 || res.status >= 500) {
      await new Promise((r) => setTimeout(r, 2500 * 2 ** attempt));
      continue;
    }
    throw new Error(`Gemini status=${res.status}`);
  }
  throw new Error("Gemini retries épuisés");
}

// ─── Fiches outils : description + FAITS vérifiés (sources gouv 2026-07-13) ─
interface Citation { text: string; url: string; source: string }
interface FicheOutil {
  slug: string;
  nom: string;
  /** Ce que fait l'outil (inputs → outputs), pour ancrer l'EditoIntro. */
  outil: string;
  /** Terme à définir dans la DefinitionBox. */
  terme: string;
  /** FAITS exhaustifs — seuls chiffres autorisés dans le texte. */
  faits: string[];
  /** LE piège principal (AlertBox). */
  piege: string;
  citations: Citation[];
}

const FICHES: FicheOutil[] = [
  {
    slug: "calcul-tva",
    nom: "Calculatrice de TVA (HT ⇄ TTC)",
    outil: "L'outil convertit un montant HT en TTC (et inversement) pour les 4 taux de TVA en vigueur, affiche le montant de taxe et un tableau comparatif tous taux.",
    terme: "TVA (taxe sur la valeur ajoutée)",
    faits: [
      "Quatre taux en France métropolitaine en 2026 : 20 % (taux normal), 10 % (taux intermédiaire : restauration, transport de voyageurs, travaux dans les logements de plus de 2 ans), 5,5 % (taux réduit : produits alimentaires, livres, énergie, rénovation énergétique), 2,1 % (taux super-réduit : médicaments remboursés, presse).",
      "Formules : TTC = HT × (1 + taux) ; HT = TTC ÷ (1 + taux). Le montant de TVA = TTC − HT.",
      "Retirer 20 % du TTC pour retrouver le HT est FAUX : 120 € TTC ÷ 1,20 = 100 € HT, alors que 120 € − 20 % = 96 €.",
      "Franchise en base de TVA 2026 : 85 000 € de CA pour le commerce et l'hébergement, 37 500 € pour les prestations de services et les professions libérales (le projet de seuil unique à 25 000 € a été abandonné et n'est jamais entré en vigueur).",
      "La Corse et l'outre-mer ont des taux spécifiques ; le taux applicable dépend de la nature exacte du bien ou du service.",
    ],
    piege: "Calculer le HT en retirant le pourcentage du TTC (TTC − 20 %) au lieu de diviser par 1 + taux : l'erreur surévalue la TVA déductible et fausse les prix de vente.",
    citations: [
      { text: "Quels sont les taux de TVA en vigueur ?", url: "https://www.service-public.gouv.fr/professionnels-entreprises/vosdroits/F23567", source: "service-public.gouv.fr" },
      { text: "Franchise en base de TVA", url: "https://www.service-public.gouv.fr/professionnels-entreprises/vosdroits/F21746", source: "service-public.gouv.fr" },
    ],
  },
  {
    slug: "frais-kilometriques",
    nom: "Calcul des frais kilométriques",
    outil: "L'outil calcule l'indemnité kilométrique annuelle selon la distance professionnelle, la puissance fiscale et le type de véhicule (voiture ou moto), avec majoration pour véhicule électrique et tableau comparatif par puissance.",
    terme: "Barème kilométrique fiscal",
    faits: [
      "Formule du barème : indemnité = d × a + b, où d est la distance professionnelle annuelle ; les coefficients dépendent de la puissance fiscale et de la tranche de distance.",
      "Tranches voiture : jusqu'à 5 000 km, de 5 001 à 20 000 km, au-delà de 20 000 km. Tranches moto (plus de 50 cm³) : jusqu'à 3 000 km, de 3 001 à 6 000 km, au-delà de 6 000 km.",
      "Exemple voiture 5 CV : d × 0,636 jusqu'à 5 000 km ; d × 0,357 + 1 395 de 5 001 à 20 000 km ; d × 0,427 au-delà de 20 000 km.",
      "Puissances voiture : de 3 CV et moins à 7 CV et plus (les puissances supérieures à 7 CV utilisent la ligne 7 CV).",
      "Majoration de 20 % pour les véhicules 100 % électriques (les hybrides en sont exclus).",
      "Barème en vigueur pour la déclaration 2026 (revenus 2025), inchangé depuis l'arrêté du 27 mars 2023.",
      "Le barème couvre la dépréciation, l'entretien, les réparations, les pneus, le carburant et l'assurance ; les péages, frais de stationnement et intérêts d'emprunt s'ajoutent séparément, au prorata professionnel, sur justificatifs.",
      "Trajet domicile-travail : déductible dans la limite de 40 km par trajet (80 km aller-retour par jour), sauf circonstances particulières justifiées.",
    ],
    piege: "Appliquer les tranches de distance de la voiture (5 000 / 20 000 km) à une moto : les tranches moto sont 3 000 / 6 000 km. Autre confusion fréquente : le barème « frais de carburant » est un barème distinct qui ne couvre que le carburant.",
    citations: [
      { text: "Barème kilométrique", url: "https://www.service-public.gouv.fr/particuliers/actualites/A14686", source: "service-public.gouv.fr" },
    ],
  },
  {
    slug: "cout-salarie",
    nom: "Simulateur de coût d'un salarié",
    outil: "L'outil estime le coût employeur total à partir du salaire brut (ou d'un net souhaité, reconstitué approximativement) : charges patronales moyennes, réduction générale dégressive (RGDU) et net versé au salarié.",
    terme: "Coût employeur (salaire chargé)",
    faits: [
      "Le SMIC mensuel brut est de 1 867,02 € (35 heures) depuis le 1er juin 2026, soit 12,31 € de l'heure.",
      "Charges patronales : de l'ordre de 39 à 45 % du brut hors réduction (non-cadre de l'ordre de 42 %, cadre de l'ordre de 45 %) — moyennes indicatives, les taux réels dépendent de la convention, du taux AT/MP, de la mutuelle et du versement mobilité.",
      "Charges salariales : de l'ordre de 21 à 23 % du brut.",
      "La réduction générale dégressive unique (RGDU) est en vigueur depuis le 1er janvier 2026 (fusion des allègements généraux) : elle est maximale au niveau du SMIC et décroît jusqu'à s'annuler à 3 SMIC.",
      "Au niveau du SMIC, grâce à la RGDU, le coût employeur total est de l'ordre du brut majoré de 5 à 10 % seulement.",
      "S'ajoutent au salaire chargé : mutuelle (au moins 50 % à la charge de l'employeur), médecine du travail, formation, équipement, et éventuels 13e mois ou titres-restaurant.",
    ],
    piege: "Appliquer un taux de charges patronales uniforme (« brut × 1,42 ») à tous les niveaux de salaire : sur les bas salaires, la réduction générale efface presque les charges — le coût réel d'un salarié au SMIC est proche du brut, pas 40 % au-dessus.",
    citations: [
      { text: "La réduction générale dégressive des cotisations patronales", url: "https://www.urssaf.fr/accueil/employeur/beneficier-exonerations/reduction-generale-degressive.html", source: "urssaf.fr" },
      { text: "SMIC : montants en vigueur", url: "https://www.service-public.gouv.fr/particuliers/vosdroits/F2300", source: "service-public.gouv.fr" },
    ],
  },
  {
    slug: "jours-ouvres",
    nom: "Calculateur de jours ouvrés",
    outil: "L'outil compte les jours ouvrés, ouvrables et calendaires entre deux dates (bornes incluses), en déduisant automatiquement les jours fériés légaux de France métropolitaine, et liste les fériés de la période.",
    terme: "Jours ouvrés, ouvrables et calendaires",
    faits: [
      "Jours ouvrés = du lundi au vendredi hors jours fériés ; jours ouvrables = du lundi au samedi hors fériés ; jours calendaires = tous les jours.",
      "11 jours fériés légaux en France métropolitaine (article L3133-1 du Code du travail).",
      "2026 compte 252 jours ouvrés : 9 fériés tombent en semaine (le 15 août tombe un samedi et le 1er novembre un dimanche). 2027 en compte 254.",
      "Fériés mobiles 2026 : lundi de Pâques le 6 avril, Ascension le 14 mai, lundi de Pentecôte le 25 mai.",
      "Seul le 1er mai est obligatoirement chômé (hors secteurs qui ne peuvent pas interrompre l'activité) ; les autres fériés dépendent de la convention collective ou de l'accord d'entreprise.",
      "Les congés payés s'acquièrent à raison de 2,5 jours ouvrables par mois, soit 30 jours ouvrables par an ; leur décompte se fait le plus souvent en jours ouvrables.",
      "L'Alsace-Moselle a 2 fériés supplémentaires (Vendredi saint et 26 décembre) ; l'outre-mer a des fériés propres.",
    ],
    piege: "Confondre jours ouvrés et jours ouvrables dans un décompte de congés ou un délai : sur une même période, l'écart atteint un jour par semaine (le samedi), de quoi fausser un préavis ou une date limite.",
    citations: [
      { text: "Jours fériés et ponts dans le secteur privé", url: "https://www.service-public.gouv.fr/particuliers/vosdroits/F2405", source: "service-public.gouv.fr" },
    ],
  },
  {
    slug: "calcul-impot-societes",
    nom: "Calculateur d'impôt sur les sociétés",
    outil: "L'outil décompose l'IS d'une société à partir du bénéfice imposable : part au taux réduit de 15 % (si les conditions sont remplies), part au taux normal de 25 %, taux effectif et résultat net après impôt.",
    terme: "Impôt sur les sociétés (IS)",
    faits: [
      "Taux normal de l'IS : 25 % du bénéfice imposable.",
      "Taux réduit de 15 % sur les premiers 42 500 € de bénéfice, sous 3 conditions cumulatives : CA HT inférieur à 10 M€ (10 000 000 €), capital entièrement libéré, capital détenu à au moins 75 % par des personnes physiques (directement ou via une société remplissant elle-même ces conditions).",
      "Contribution sociale de 3,3 % sur l'IS au-delà d'un abattement de 763 000 € d'IS ; les PME dont le CA est inférieur à 7,63 M€ (capital libéré, détention 75 % personnes physiques) en sont exonérées.",
      "Acomptes trimestriels : 15 mars, 15 juin, 15 septembre, 15 décembre ; dispense si l'IS de référence est inférieur ou égal à 3 000 € ; solde au plus tard le 15 du 4e mois suivant la clôture.",
      "Un déficit se reporte en avant sans limite de durée (avec plafonnement annuel d'imputation) ou, sur option, en arrière dans la limite de 1 M€ : un déficit ne crée jamais d'impôt négatif.",
      "Le bénéfice imposable diffère du résultat comptable : réintégrations et déductions fiscales s'appliquent dans la liasse fiscale.",
    ],
    piege: "Appliquer le taux de 15 % sans vérifier les 3 conditions : un capital non entièrement libéré ou détenu à moins de 75 % par des personnes physiques fait basculer TOUT le bénéfice au taux de 25 %, dès le premier euro.",
    citations: [
      { text: "Impôt sur les sociétés : entreprises concernées et taux", url: "https://entreprendre.service-public.gouv.fr/vosdroits/F23575", source: "service-public.gouv.fr" },
    ],
  },
  {
    slug: "rupture-conventionnelle",
    nom: "Calcul d'indemnité de rupture conventionnelle",
    outil: "L'outil calcule l'indemnité spécifique minimale de rupture conventionnelle à partir de l'ancienneté (années + mois) et du salaire de référence (le plus favorable entre la moyenne des 12 et des 3 derniers mois).",
    terme: "Indemnité spécifique de rupture conventionnelle",
    faits: [
      "L'indemnité minimale est au moins égale à l'indemnité légale de licenciement : 1/4 de mois de salaire de référence par année d'ancienneté jusqu'à 10 ans, 1/3 de mois par année au-delà de 10 ans.",
      "Les années incomplètes sont proratisées au nombre de mois complets.",
      "Le salaire de référence retenu est le plus favorable entre la moyenne des 12 derniers mois et celle des 3 derniers mois (primes annuelles ou exceptionnelles proratisées).",
      "Aucune ancienneté minimale n'est exigée (contrairement à l'indemnité légale de licenciement) : l'indemnité est due dès le premier mois, au prorata.",
      "Le montant est un plancher : librement négociable au-dessus ; en dessous, la Dreets refuse l'homologation. Une convention collective peut prévoir un plancher plus favorable.",
      "Régime social 2026 : exonération de cotisations dans la limite de 2 plafonds annuels de la Sécurité sociale, soit 96 120 € (PASS 2026 : 48 060 €) ; contribution patronale de 40 % sur la part exonérée (taux relevé de 30 % à 40 % par la LFSS 2026).",
      "Régime fiscal : exonération d'impôt sur le revenu dans certaines limites ; un salarié en droit de bénéficier d'une pension de retraite est imposable dès le premier euro.",
    ],
    piege: "Croire l'indemnité totalement défiscalisée et désocialisée : les exonérations sont plafonnées, la contribution patronale de 40 % s'applique sur la part exonérée, et le salarié en droit de partir à la retraite est imposé dès le premier euro.",
    citations: [
      { text: "Rupture conventionnelle : indemnité", url: "https://www.service-public.gouv.fr/particuliers/vosdroits/F19030", source: "service-public.gouv.fr" },
    ],
  },
  {
    slug: "prime-fin-cdd",
    nom: "Calcul de la prime de fin de CDD",
    outil: "L'outil calcule la prime de précarité (10 % de la rémunération brute totale du contrat, ou 6 % par accord de branche) et, en option, l'indemnité compensatrice de congés payés, pour obtenir le total brut de fin de contrat.",
    terme: "Prime de précarité (indemnité de fin de contrat)",
    faits: [
      "Taux légal : 10 % de la rémunération totale brute versée pendant le contrat, renouvellements de CDD inclus (article L1243-8 du Code du travail).",
      "Un taux réduit de 6 % est possible uniquement si une convention ou un accord de branche étendu (ou un accord d'entreprise) le prévoit, avec des contreparties, notamment un accès privilégié à la formation professionnelle.",
      "La prime n'est PAS due dans ces cas : CDD saisonnier, contrat d'usage, emploi d'un jeune pendant ses vacances scolaires ou universitaires, contrat aidé, d'apprentissage ou de professionnalisation, poursuite de la relation en CDI, refus d'un CDI pour un emploi identique à rémunération au moins équivalente, rupture anticipée à l'initiative du salarié, faute grave, force majeure, rupture pendant la période d'essai.",
      "L'indemnité compensatrice de congés payés (congés non pris) se calcule selon la méthode du 1/10e : 10 % de la rémunération totale brute, prime de précarité incluse dans l'assiette.",
      "La prime est versée à la fin du contrat, avec le dernier salaire, et figure sur le bulletin de paie et le solde de tout compte.",
      "La prime est soumise aux cotisations sociales et imposable à l'impôt sur le revenu, comme un complément de salaire.",
    ],
    piege: "Compter une prime qui n'est pas due : l'embauche en CDI à l'issue du contrat ou le refus d'un CDI équivalent font perdre le droit à la prime — deux situations très fréquentes et souvent découvertes au moment du solde de tout compte.",
    citations: [
      { text: "Fin d'un CDD : prime de précarité", url: "https://www.service-public.gouv.fr/particuliers/vosdroits/F40", source: "service-public.gouv.fr" },
    ],
  },
  {
    slug: "capital-social",
    nom: "Répartition du capital social",
    outil: "L'outil répartit le capital entre associés à partir de leurs apports et de la valeur nominale des parts : pourcentages, nombre de parts et badge de pouvoir (majorité simple, contrôle des deux tiers, minorité de blocage).",
    terme: "Capital social et seuils de contrôle",
    faits: [
      "Nombre de parts d'un associé = apport ÷ valeur nominale de la part.",
      "Seuils de contrôle (règles générales, SARL constituées depuis 2005) : plus de 50 % du capital = majorité simple en assemblée ordinaire (50 % exactement ne suffit PAS) ; au moins 2/3 (66,67 %) = contrôle des décisions extraordinaires ; plus d'1/3 (33,34 %) = minorité de blocage en assemblée extraordinaire (33,33 % exactement ne suffit pas).",
      "Les SARL constituées avant 2005 requièrent une majorité des 3/4 en assemblée extraordinaire ; en SAS, les règles de majorité sont librement fixées par les statuts.",
      "Capital minimum : 1 € en SARL et en SAS, 37 000 € en SA.",
      "Libération des apports en numéraire à la constitution : au moins 20 % en SARL, au moins 50 % en SAS (le solde dans les 5 ans).",
      "Une répartition 50/50 expose à un blocage total en cas de désaccord ; un pacte d'associés, des droits de vote double ou des actions de préférence peuvent modifier les équilibres.",
      "En SARL, le gérant majoritaire relève du régime des travailleurs non salariés (TNS).",
    ],
    piege: "Croire que 50 % des parts donnent la majorité : les seuils sont stricts. À exactement 50/50, aucune décision ordinaire ne peut être imposée ; à exactement 1/3, la minorité de blocage n'est pas atteinte. Un point de pourcentage change le contrôle de la société.",
    citations: [
      { text: "Capital social d'une société", url: "https://entreprendre.service-public.gouv.fr/vosdroits/F32886", source: "service-public.gouv.fr" },
    ],
  },
  // ─── Les 6 outils historiques (FAITS = constantes de math.ts) ───
  {
    slug: "charges",
    nom: "Simulateur de charges sociales",
    outil: "L'outil estime les cotisations sociales et le revenu net avant impôt selon le statut : micro-entreprise (sur le CA), TNS au réel (sur le bénéfice) ou assimilé salarié de SASU (sur l'enveloppe employeur).",
    terme: "Cotisations sociales des indépendants",
    faits: [
      "Micro-entreprise 2026 (hors versement libératoire) : cotisations de 12,3 % du CA pour la vente de marchandises, 21,2 % pour les services commerciaux (BIC), 26,1 % pour les activités libérales (BNC).",
      "Abattement forfaitaire micro pour l'impôt sur le revenu : 71 % (vente), 50 % (services BIC), 34 % (BNC) — les frais réels ne sont pas déductibles en micro.",
      "TNS au réel : cotisations assises sur le revenu professionnel (bénéfice), de l'ordre de 45 % du revenu net.",
      "Assimilé salarié (président de SASU) : charges salariales et patronales de l'ordre de 80 % du net — le net représente environ l'enveloppe employeur divisée par 1,8. En contrepartie, protection sociale du régime général (hors chômage).",
      "Plafonds de CA de la micro-entreprise : 77 700 € pour les services et professions libérales, 188 700 € pour la vente de marchandises.",
      "Estimations hors CFE, impôt sur le revenu et cas particuliers (ACRE, versement libératoire).",
    ],
    piege: "Comparer les statuts sur le seul taux de cotisations : la micro cotise sur le chiffre d'affaires (frais non déductibles), le TNS au réel sur le bénéfice. Avec des frais importants, un taux micro plus faible peut coûter plus cher qu'un taux TNS plus élevé sur une base réduite.",
    citations: [
      { text: "Cotisations et contributions sociales du micro-entrepreneur", url: "https://entreprendre.service-public.gouv.fr/vosdroits/F36232", source: "service-public.gouv.fr" },
    ],
  },
  {
    slug: "statuts",
    nom: "Comparateur de statuts (micro, EI, SASU)",
    outil: "L'outil compare le revenu net avant impôt personnel des trois statuts usuels — micro-entreprise, entreprise individuelle au réel, SASU à l'IS en distribution 100 % dividendes — à partir du CA, des frais réels et du type d'activité.",
    terme: "Statut juridique et fiscal de l'indépendant",
    faits: [
      "Micro-entreprise : cotisations sur le CA (12,3 % vente, 21,2 % services BIC, 26,1 % BNC), frais réels non déductibles, abattement forfaitaire pour l'IR (71 %, 50 % ou 34 %).",
      "EI au réel (IR) : bénéfice = CA moins frais ; cotisations TNS de l'ordre de 45 % du revenu net ; frais réels déductibles.",
      "SASU à l'IS en 100 % dividendes : IS de 15 % jusqu'à 42 500 € de bénéfice (sous conditions) puis 25 %, puis flat tax de 30 % sur les dividendes ; aucune cotisation retraite sans salaire.",
      "Plafonds micro : 77 700 € (services, BNC) et 188 700 € (vente).",
      "Le comparateur raisonne avant impôt sur le revenu personnel : le taux d'IR dépend du foyer fiscal.",
      "Bascule courante : le réel devient intéressant quand les frais réels dépassent l'abattement forfaitaire du régime micro.",
    ],
    piege: "Choisir la SASU 100 % dividendes pour « économiser les cotisations » : sans salaire, le dirigeant ne valide aucun droit à la retraite ni prévoyance. L'écart de net affiché ne valorise pas la protection sociale — un arbitrage salaire/dividendes se chiffre au cas par cas.",
    citations: [
      { text: "Choisir le statut juridique de son entreprise", url: "https://entreprendre.service-public.gouv.fr/vosdroits/F35926", source: "service-public.gouv.fr" },
    ],
  },
  {
    slug: "tjm",
    nom: "Calculateur de TJM freelance",
    outil: "L'outil calcule le taux journalier moyen nécessaire pour atteindre un objectif de revenu net mensuel, selon le statut (micro-BNC, EI au réel, SASU), les jours facturés par mois et les frais fixes professionnels.",
    terme: "TJM (taux journalier moyen)",
    faits: [
      "Part du CA absorbée par les cotisations et la structure, selon le statut : de l'ordre de 26,1 % en micro-BNC, 31 % en EI au réel, 45 % en SASU.",
      "Jours réellement facturables : de l'ordre de 15 à 18 jours par mois (déduction de la prospection, de l'administratif, des congés et de l'intermission) sur 21 à 22 jours ouvrés.",
      "Le TJM se raisonne toujours en HT : la TVA collectée n'est pas un revenu.",
      "Franchise en base de TVA 2026 pour les prestations de services : 37 500 € de CA.",
      "Formule de l'outil : CA mensuel nécessaire = (net visé + frais mensuels) ÷ (1 − ponction du statut) ; TJM = CA mensuel ÷ jours facturés.",
    ],
    piege: "Calculer son TJM sur 20 jours facturés par mois : entre prospection, administratif, congés et intermission, la réalité se situe plutôt entre 15 et 18 jours. Un TJM calibré sur un taux d'occupation irréaliste garantit un revenu inférieur à l'objectif.",
    citations: [
      { text: "Franchise en base de TVA", url: "https://entreprendre.service-public.gouv.fr/vosdroits/F21746", source: "service-public.gouv.fr" },
    ],
  },
  {
    slug: "immobilier",
    nom: "Simulateur LMNP (micro-BIC vs réel)",
    outil: "L'outil compare la base imposable d'une location meublée non professionnelle au micro-BIC (abattement de 50 %) et au régime réel (charges déduites et amortissement du bien et du mobilier), à partir des loyers, charges et valeurs du bien.",
    terme: "LMNP (location meublée non professionnelle)",
    faits: [
      "Micro-BIC : abattement forfaitaire de 50 % sur les loyers — la base imposable est la moitié des loyers annuels.",
      "Régime réel : base imposable = loyers − charges réelles − amortissements ; l'amortissement ne peut pas créer de déficit (la base est au minimum de 0) et l'excédent se reporte sans limite de durée.",
      "Hypothèses d'amortissement de l'outil : 85 % de la valeur du bien (part bâtie, hors terrain) amortie sur 30 ans, mobilier amorti sur 7 ans.",
      "Le régime réel impose une comptabilité d'engagement et une liasse fiscale — l'accompagnement par un expert-comptable est la pratique courante.",
      "Le réel devient généralement plus avantageux dès que charges, intérêts et amortissements dépassent 50 % des loyers (bien financé ou ancien).",
    ],
    piege: "Rester au micro-BIC par simplicité avec un bien financé à crédit : entre intérêts, charges et amortissements, la base imposable au réel tombe souvent à zéro pendant des années, quand le micro-BIC continue d'imposer la moitié des loyers.",
    citations: [
      { text: "Location meublée : régime fiscal", url: "https://www.service-public.gouv.fr/particuliers/vosdroits/F32744", source: "service-public.gouv.fr" },
    ],
  },
  {
    slug: "honoraires",
    nom: "Simulateur d'honoraires d'expert-comptable",
    outil: "L'outil estime une fourchette d'honoraires mensuels HT d'expertise comptable selon la forme juridique, le chiffre d'affaires, le nombre de salariés et l'assujettissement à la TVA, et oriente vers une formule (Essentiel, Pro, Premium).",
    terme: "Honoraires d'expertise comptable",
    faits: [
      "Bases mensuelles indicatives de la grille Skoria : 59 € HT (micro-entreprise), 99 € HT (entreprise individuelle), 129 € HT (société).",
      "Facteurs de variation : volume d'activité (majoration au-delà de 100 000 €, 300 000 € et 1 000 000 € de CA), gestion sociale (de l'ordre de 15 € par salarié et par mois), déclarations de TVA (de l'ordre de 20 € par mois).",
      "Fourchette restituée : de l'ordre de −15 % à +20 % autour de l'estimation, selon le volume de pièces et les missions annexes.",
      "Les honoraires sont des charges déductibles du résultat pour les entreprises au réel ; en micro, ils sont couverts par l'abattement forfaitaire.",
      "L'estimation ne remplace pas une lettre de mission : le devis ferme dépend du volume réel de pièces et des missions retenues.",
    ],
    piege: "Comparer les cabinets sur le seul prix mensuel affiché : le périmètre réel (TVA, social, prévisionnel, juridique annuel) varie fortement d'une lettre de mission à l'autre. Un tarif bas avec des avenants facturés coûte souvent plus cher qu'un forfait complet.",
    citations: [
      { text: "Recourir à un expert-comptable", url: "https://entreprendre.service-public.gouv.fr/vosdroits/F31214", source: "service-public.gouv.fr" },
    ],
  },
  {
    slug: "grille-salaire-expert-comptable",
    nom: "Grille des salaires de la profession comptable",
    outil: "L'outil affiche les fourchettes de rémunération de la profession comptable par niveau d'expérience (du collaborateur débutant à l'associé) et par région, ainsi que les minima conventionnels de la branche (CCN 787).",
    terme: "Convention collective des cabinets d'experts-comptables (CCN 787)",
    faits: [
      "Fourchettes de marché indicatives 2026 (brut annuel) : collaborateur débutant 26 000 à 34 000 €, collaborateur confirmé 34 000 à 45 000 €, chef de mission 45 000 à 60 000 €, manager 58 000 à 80 000 €, expert-comptable diplômé 70 000 à 100 000 €, associé 100 000 à 200 000 €.",
      "Coefficients régionaux indicatifs : Île-de-France environ +15 %, grandes métropoles environ +5 % par rapport aux autres régions.",
      "La CCN 787 (cabinets d'experts-comptables et de commissaires aux comptes) fixe des minima par coefficient, de 170 (employé débutant) à 500 (direction), revalorisés par accord de branche.",
      "Net mensuel estimé : de l'ordre de 78 % du brut pour un salarié cadre de la branche.",
      "Le parcours type : DCG, DSCG, stage de 3 ans, puis DEC (diplôme d'expertise comptable).",
    ],
    piege: "Confondre les minima conventionnels de la CCN 787 avec les salaires de marché : dans les zones tendues et pour les profils expérimentés, le marché se situe nettement au-dessus de la grille. Négocier sur la base du minimum conventionnel sous-évalue la plupart des postes.",
    citations: [
      { text: "Convention collective nationale des cabinets d'experts-comptables (IDCC 787)", url: "https://www.legifrance.gouv.fr/conv_coll/id/KALICONT000005635826", source: "legifrance.gouv.fr" },
    ],
  },
];

// ─── Prompt ──────────────────────────────────────────────────────────────────
const STRUCTURE = `STRUCTURE (exactement 7 sections, dans cet ordre) :
1. {"section_type":"EditoIntro","title":"...","body":"100-130 mots : ce que calcule l'outil ci-dessus, pour qui, ce qu'il ne remplace pas"}
2. {"section_type":"DefinitionBox","title":"<le terme défini>","body":"60-80 mots : définition précise et sourcée du terme"}
3. {"section_type":"ContentSection","title":"La règle de calcul","body":"220-280 mots en 2-3 paragraphes séparés par \\n\\n : la règle reformulée en prose, uniquement avec les chiffres des FAITS"}
4. {"section_type":"NumberedSteps","title":"Comment utiliser le résultat","body":"","items":[{"title":"...","description":"30-45 mots"},... 4 à 5 étapes concrètes]}
5. {"section_type":"Checklist","title":"Cas particuliers et points de vigilance","body":"1 phrase d'intro","items":["...", ... 6 à 8 points, 10-20 mots chacun]}
6. {"section_type":"AlertBox","title":"Le piège classique","body":"60-80 mots sur LE piège indiqué"}
7. {"section_type":"ContentSection","title":"<une question fréquente en H2 interrogatif, finissant par ?>","body":"150-200 mots qui y répondent"}

Ajoute aussi : "key_takeaways": [3 ou 4 phrases courtes et factuelles résumant l'essentiel]

Output JSON strict : {"sections":[...], "key_takeaways":[...]}`;

function buildPrompt(fiche: FicheOutil): string {
  return `Tu écris l'édito qui accompagne un CALCULATEUR INTERACTIF sur skoria.fr, comparateur indépendant d'experts-comptables. La page "${fiche.nom}" affiche l'outil en haut ; ton texte se place SOUS l'outil pour l'expliquer et l'approfondir.

CE QUE FAIT L'OUTIL : ${fiche.outil}

FAITS VÉRIFIÉS (sources officielles, juillet 2026) — les SEULS chiffres, taux, seuils et dates autorisés dans ton texte :
${fiche.faits.map((f) => `- ${f}`).join("\n")}

LE PIÈGE PRINCIPAL (pour la section AlertBox) : ${fiche.piege}

RÈGLES ABSOLUES :
- AUCUN chiffre, taux, montant, seuil ou date qui ne figure pas dans les FAITS ci-dessus. Si un chiffre te manque, reformule sans chiffre.
- Aucun conseil individualisé ("vous devriez opter pour...") : les arbitrages se renvoient vers un expert-comptable.
- Skoria est un comparateur indépendant : pas de "nos experts", pas de promesse de prestation, pas d'avis clients, pas de note.
- Aucune promesse d'exonération ou d'économie sans réserve ; conditionnel sur tout ce qui dépend de la situation.
- Texte brut : pas de liens, pas de markdown, pas de gras. Français impeccable, direct, zéro remplissage.
- Ne crée PAS de section Faq (la page en a déjà une).

${STRUCTURE}`;
}

// ─── QC ──────────────────────────────────────────────────────────────────────
interface GenSection { section_type: string; title: string; body: string; items?: unknown }
interface GenPayload { sections?: GenSection[]; key_takeaways?: unknown }

const EXPECTED_TYPES = "EditoIntro,DefinitionBox,ContentSection,NumberedSteps,Checklist,AlertBox,ContentSection";

/** Extrait les tokens numériques normalisés ("42 500" → "42500", "0,636" → "0.636"). */
function numTokens(text: string): string[] {
  const normalized = text.normalize("NFKC").replace(/[   ]/gu, " ");
  const matches = normalized.match(/\d[\d  ]*(?:[.,]\d+)?/gu) ?? [];
  return matches.map((t) => t.replace(/ /gu, "").replace(",", ".").replace(/\.$/u, ""));
}

function qc(payload: GenPayload, fiche: FicheOutil): string | null {
  const sections = payload.sections ?? [];
  if (!Array.isArray(sections) || sections.length !== 7) return `structure ≠ 7 sections (${sections.length})`;
  const types = sections.map((s) => s.section_type).join(",");
  if (types !== EXPECTED_TYPES) return `types inattendus: ${types}`;

  const fullText = JSON.stringify(sections) + JSON.stringify(payload.key_takeaways ?? []);
  const words = sections.reduce((n, s) => {
    let t = `${s.title ?? ""} ${s.body ?? ""}`;
    if (Array.isArray(s.items)) {
      for (const it of s.items) t += ` ${typeof it === "string" ? it : Object.values(it as object).join(" ")}`;
    }
    return n + t.split(/\s+/u).filter(Boolean).length;
  }, 0);
  if (words < 650) return `${words} mots < 650`;

  if (/nos experts|avis (client|vérifié|certifié)|étoile|not[ée] \d|vous devriez/iu.test(fullText)) return "blacklist";

  // Contrat YMYL : tout nombre du texte doit exister dans les FAITS (ou ≤ 12).
  const allowed = new Set(numTokens(fiche.faits.join(" ") + " " + fiche.piege + " 2026"));
  for (let i = 0; i <= 12; i++) allowed.add(String(i));
  const offenders = [...new Set(numTokens(fullText))].filter((t) => !allowed.has(t));
  if (offenders.length > 0) return `chiffres hors FAITS: ${offenders.slice(0, 6).join(", ")}`;

  const steps = sections[3];
  if (!Array.isArray(steps.items) || (steps.items as unknown[]).length < 4) return "NumberedSteps < 4 étapes";
  const checklist = sections[4];
  if (!Array.isArray(checklist.items) || (checklist.items as unknown[]).length < 5) return "Checklist < 5 items";
  const kt = payload.key_takeaways;
  if (!Array.isArray(kt) || kt.length < 3) return "key_takeaways < 3";
  const lastTitle = sections[6].title ?? "";
  if (!lastTitle.includes("?")) return "section 7 : H2 non interrogatif";
  return null;
}

// ─── Main ────────────────────────────────────────────────────────────────────
async function main(): Promise<void> {
  if (!API_KEY) throw new Error("GEMINI_API_KEY manquante");
  const db = new Database(DB_PATH);
  db.pragma("journal_mode = WAL");

  const hasSections = db.prepare(
    "SELECT 1 FROM page_sections WHERE route='simulateurs' AND slug = ? LIMIT 1",
  );
  let fiches = FICHES.filter((f) => FORCE || !hasSections.get(f.slug));
  if (ONLY) fiches = FICHES.filter((f) => f.slug === ONLY);
  if (LIMIT > 0) fiches = fiches.slice(0, LIMIT);

  console.log(`[simulateurs] ${fiches.length} éditos à générer ${COMMIT ? "COMMIT" : "DRY-RUN"} : ${fiches.map((f) => f.slug).join(", ")}`);
  if (!COMMIT || fiches.length === 0) { db.close(); return; }

  const insSection = db.prepare(`
    INSERT INTO page_sections (route, slug, section_type, section_order, title, body, items, citations, generated_at, generated_by_model)
    VALUES ('simulateurs', @slug, @type, @ord, @title, @body, @items, @citations, datetime('now'), '${MODEL_TAG}')
    ON CONFLICT(route, slug, section_order) DO UPDATE SET
      section_type = excluded.section_type, title = excluded.title, body = excluded.body,
      items = excluded.items, citations = excluded.citations,
      generated_at = excluded.generated_at, generated_by_model = excluded.generated_by_model`);
  const upsertSeo = db.prepare(`
    INSERT INTO seo_overrides (route, slug, key_takeaways, generated_at, generated_by_model)
    VALUES ('simulateurs', @slug, @kt, datetime('now'), '${MODEL_TAG}')
    ON CONFLICT(route, slug) DO UPDATE SET
      key_takeaways = excluded.key_takeaways,
      generated_at = excluded.generated_at, generated_by_model = excluded.generated_by_model`);
  const upsertMeta = db.prepare(`
    INSERT INTO page_meta (route, slug, publish_status, published_at, pipeline_run_id, reviewed_at)
    VALUES ('simulateurs', @slug, 'published', datetime('now'), 'keyword-lp-simulateurs', datetime('now'))
    ON CONFLICT(route, slug) DO UPDATE SET
      publish_status = 'published', published_at = excluded.published_at,
      pipeline_run_id = excluded.pipeline_run_id, reviewed_at = excluded.reviewed_at`);

  let ok = 0; let failed = 0;
  const issues: string[] = [];

  const processOne = async (fiche: FicheOutil): Promise<void> => {
    let lastErr = "";
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const feedback = attempt > 0 ? `\n\nTA TENTATIVE PRÉCÉDENTE A ÉTÉ REJETÉE : ${lastErr}. Corrige précisément ce point.` : "";
        const raw = await callGemini(buildPrompt(fiche) + feedback);
        const parsed = JSON.parse(raw) as GenPayload;
        const err = qc(parsed, fiche);
        if (err) { lastErr = err; continue; }
        const citationsJson = JSON.stringify(fiche.citations);
        const tx = db.transaction(() => {
          parsed.sections!.forEach((s, i) => {
            insSection.run({
              slug: fiche.slug, type: s.section_type, ord: i + 1,
              title: s.title ?? null, body: s.body ?? null,
              items: s.items != null ? JSON.stringify(s.items) : null,
              // Citations officielles posées par le script (pas par le modèle)
              // sur la définition et la règle de calcul.
              citations: i === 1 || i === 2 ? citationsJson : null,
            });
          });
          upsertSeo.run({ slug: fiche.slug, kt: JSON.stringify(parsed.key_takeaways) });
          upsertMeta.run({ slug: fiche.slug });
        });
        tx();
        ok++;
        console.log(`  ✓ ${fiche.slug}`);
        return;
      } catch (e) {
        lastErr = (e as Error).message.slice(0, 140);
      }
    }
    failed++;
    issues.push(`${fiche.slug}: ${lastErr}`);
  };

  for (let i = 0; i < fiches.length; i += CONCURRENCY) {
    await Promise.all(fiches.slice(i, i + CONCURRENCY).map(processOne));
  }

  console.log(`\n[simulateurs] terminé : ok=${ok} failed=${failed}`);
  for (const s of issues) console.log(`   - ${s}`);
  db.close();
  if (failed > 0) process.exit(1);
}

main().catch((e) => { console.error("[generate-simulateur-content] FATAL", e); process.exit(1); });
