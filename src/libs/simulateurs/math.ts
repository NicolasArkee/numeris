// ─── Moteurs de calcul des simulateurs ───
// Fonctions pures, AUCUNE dépendance — testables et stables.
// ⚠️ Toutes les valeurs sont des ESTIMATIONS INDICATIVES (barèmes 2026
// simplifiés). Chaque page simulateur affiche le disclaimer correspondant.

export const fmtEur = (n: number): string =>
  new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(Math.round(n));

/** Variante 2 décimales — TVA et barème kilométrique se jouent au centime. */
export const fmtEurPrecis = (n: number): string =>
  new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);

// ═══════════════════════════════════════════════════════════════
// 1. Charges sociales — micro / TNS réel / assimilé salarié (SASU)
// ═══════════════════════════════════════════════════════════════

export type ActiviteMicro = "vente" | "services_bic" | "bnc";

/** Taux de cotisations micro-entreprise 2026 (hors versement libératoire). */
export const TAUX_MICRO: Record<ActiviteMicro, number> = {
  vente: 0.123,
  services_bic: 0.212,
  bnc: 0.261,
};

/** Abattement forfaitaire micro pour l'IR. */
export const ABATTEMENT_MICRO: Record<ActiviteMicro, number> = {
  vente: 0.71,
  services_bic: 0.5,
  bnc: 0.34,
};

/** Cotisations TNS au réel ≈ 45 % du revenu net (approximation usuelle). */
export const TAUX_TNS_SUR_NET = 0.45;

/** Assimilé salarié : coût employeur ≈ net × COEF (charges sal. + pat.). */
export const COEF_ASSIMILE_SALARIE = 1.8;

export interface ChargesResult {
  cotisations: number;
  net: number;
  tauxEffectif: number; // cotisations / base
}

export function chargesMicro(ca: number, activite: ActiviteMicro): ChargesResult {
  const cotisations = ca * TAUX_MICRO[activite];
  return { cotisations, net: ca - cotisations, tauxEffectif: TAUX_MICRO[activite] };
}

/** TNS au réel : à partir du bénéfice (CA - frais), net ≈ bénéfice / 1,45. */
export function chargesTnsReel(benefice: number): ChargesResult {
  const net = benefice / (1 + TAUX_TNS_SUR_NET);
  const cotisations = benefice - net;
  return { cotisations, net, tauxEffectif: benefice > 0 ? cotisations / benefice : 0 };
}

/** Assimilé salarié : à partir de l'enveloppe employeur disponible. */
export function chargesAssimile(enveloppe: number): ChargesResult {
  const net = enveloppe / COEF_ASSIMILE_SALARIE;
  const cotisations = enveloppe - net;
  return { cotisations, net, tauxEffectif: enveloppe > 0 ? cotisations / enveloppe : 0 };
}

// ═══════════════════════════════════════════════════════════════
// 2. Comparateur de statuts — micro vs EI réel (IR) vs SASU (IS)
// ═══════════════════════════════════════════════════════════════

/** IS — art. 219 CGI. Confirmé LF 2026 (impots.gouv.fr, vérifié 2026-07-13). */
export const TAUX_IS_REDUIT = 0.15;
export const TAUX_IS_NORMAL = 0.25;
export const PLAFOND_IS_TAUX_REDUIT = 42_500;
/** Éligibilité 15 % : CA HT < 10 M€ + capital libéré détenu ≥ 75 % personnes physiques. */
export const SEUIL_CA_IS_REDUIT = 10_000_000;

export interface IsDetail {
  trancheReduite: number;
  trancheNormale: number;
  total: number;
  tauxEffectif: number;
  resultatNetApresIs: number;
}

/** Décomposition de l'IS par tranche ; `eligibleTauxReduit` = les 3 conditions
 *  de l'art. 219 I-b CGI (CA, capital libéré, détention personnes physiques). */
export function impotSocietesDetail(benefice: number, eligibleTauxReduit: boolean): IsDetail {
  const b = Math.max(0, benefice);
  const baseReduite = eligibleTauxReduit ? Math.min(b, PLAFOND_IS_TAUX_REDUIT) : 0;
  const trancheReduite = baseReduite * TAUX_IS_REDUIT;
  const trancheNormale = (b - baseReduite) * TAUX_IS_NORMAL;
  const total = trancheReduite + trancheNormale;
  return {
    trancheReduite,
    trancheNormale,
    total,
    tauxEffectif: b > 0 ? total / b : 0,
    resultatNetApresIs: b - total,
  };
}

/** IS 2026 : 15 % jusqu'à 42 500 € de bénéfice, 25 % au-delà. */
export function impotSocietes(benefice: number): number {
  if (benefice <= 0) return 0;
  return impotSocietesDetail(benefice, true).total;
}

export const FLAT_TAX = 0.3;

export interface StatutComparatif {
  statut: string;
  net: number;
  prelevements: number;
  commentaire: string;
}

/**
 * Compare le net "avant IR personnel" des trois statuts usuels.
 * @param ca chiffre d'affaires annuel HT
 * @param fraisReels frais professionnels annuels (hors rémunération)
 * @param activite type d'activité micro (plafonds non vérifiés ici)
 */
export function compareStatuts(
  ca: number,
  fraisReels: number,
  activite: ActiviteMicro,
): StatutComparatif[] {
  // Micro : cotisations sur CA, frais NON déductibles (abattement forfaitaire IR).
  const micro = chargesMicro(ca, activite);
  const microNet = micro.net - fraisReels;

  // EI au réel (IR) : bénéfice = CA - frais ; cotisations TNS.
  const beneficeEI = Math.max(0, ca - fraisReels);
  const ei = chargesTnsReel(beneficeEI);

  // SASU à l'IS, 100 % dividendes : IS sur bénéfice puis flat tax 30 %.
  const beneficeSasu = Math.max(0, ca - fraisReels);
  const is = impotSocietes(beneficeSasu);
  const dividendesBruts = beneficeSasu - is;
  const sasuNet = dividendesBruts * (1 - FLAT_TAX);

  return [
    {
      statut: "Micro-entreprise",
      net: microNet,
      prelevements: micro.cotisations,
      commentaire: `Cotisations ${Math.round(TAUX_MICRO[activite] * 1000) / 10} % du CA — frais réels non déductibles, abattement IR ${ABATTEMENT_MICRO[activite] * 100} %`,
    },
    {
      statut: "EI au réel (IR)",
      net: ei.net,
      prelevements: ei.cotisations,
      commentaire: "Cotisations TNS ≈ 45 % du net — frais réels déductibles, imposé à l'IR",
    },
    {
      statut: "SASU à l'IS (100 % dividendes)",
      net: sasuNet,
      prelevements: is + dividendesBruts * FLAT_TAX,
      commentaire: "IS 15/25 % puis flat tax 30 % — pas de cotisations retraite sans salaire",
    },
  ];
}

// ═══════════════════════════════════════════════════════════════
// 3. TJM freelance
// ═══════════════════════════════════════════════════════════════

export type StatutTjm = "micro_bnc" | "ei_reel" | "sasu";

/** Part du CA absorbée par cotisations+structure, par statut (indicatif). */
export const PONCTION_CA: Record<StatutTjm, number> = {
  micro_bnc: 0.261,
  ei_reel: 0.31,
  sasu: 0.45,
};

export interface TjmResult {
  tjm: number;
  caAnnuel: number;
  joursFactures: number;
}

/**
 * TJM nécessaire pour atteindre un net mensuel cible.
 * @param netMensuel objectif net avant IR
 * @param joursParMois jours facturés par mois (≈ 15-18 en pratique)
 * @param fraisMensuels frais fixes pro mensuels
 */
export function tjmCible(
  netMensuel: number,
  joursParMois: number,
  fraisMensuels: number,
  statut: StatutTjm,
): TjmResult {
  const caMensuel = (netMensuel + fraisMensuels) / (1 - PONCTION_CA[statut]);
  const tjm = caMensuel / Math.max(1, joursParMois);
  return { tjm, caAnnuel: caMensuel * 12, joursFactures: joursParMois * 12 };
}

// ═══════════════════════════════════════════════════════════════
// 4. LMNP — micro-BIC vs réel (amortissement)
// ═══════════════════════════════════════════════════════════════

export const ABATTEMENT_MICRO_BIC_LMNP = 0.5;
/** Amortissement : bâti (85 % de la valeur) sur 30 ans + mobilier sur 7 ans. */
export const PART_BATI = 0.85;
export const DUREE_AMORT_BATI = 30;
export const DUREE_AMORT_MOBILIER = 7;

export interface LmnpResult {
  baseMicro: number;
  baseReel: number;
  amortissementAnnuel: number;
  economieBase: number; // base micro - base réel
}

export function compareLmnp(
  loyersAnnuels: number,
  chargesAnnuelles: number,
  valeurBien: number,
  valeurMobilier: number,
): LmnpResult {
  const baseMicro = loyersAnnuels * (1 - ABATTEMENT_MICRO_BIC_LMNP);
  const amortissementAnnuel =
    (valeurBien * PART_BATI) / DUREE_AMORT_BATI + valeurMobilier / DUREE_AMORT_MOBILIER;
  // Au réel : l'amortissement ne peut pas créer de déficit (report illimité) —
  // la base est plancher à 0.
  const baseReel = Math.max(0, loyersAnnuels - chargesAnnuelles - amortissementAnnuel);
  return { baseMicro, baseReel, amortissementAnnuel, economieBase: baseMicro - baseReel };
}

// ═══════════════════════════════════════════════════════════════
// 5. Honoraires d'expertise comptable (grille interne Skoria)
// ═══════════════════════════════════════════════════════════════

export type FormeJuridique = "micro" | "ei" | "societe";

export interface HonorairesParams {
  forme: FormeJuridique;
  caAnnuel: number;
  salaries: number;
  tva: boolean;
}

export interface HonorairesResult {
  min: number; // €/mois HT
  max: number;
  formule: "Essentiel" | "Pro" | "Premium";
}

/** Bases mensuelles alignées sur les pricing_tiers du site (59/99/159 €). */
const BASE_FORME: Record<FormeJuridique, number> = { micro: 59, ei: 99, societe: 129 };

export function estimeHonoraires(p: HonorairesParams): HonorairesResult {
  let m = BASE_FORME[p.forme];
  if (p.caAnnuel > 1_000_000) m *= 2.2;
  else if (p.caAnnuel > 300_000) m *= 1.7;
  else if (p.caAnnuel > 100_000) m *= 1.3;
  m += p.salaries * 15; // gestion sociale par salarié
  if (p.tva) m += 20; // déclarations TVA
  const formule = m < 90 ? "Essentiel" : m < 160 ? "Pro" : "Premium";
  return { min: Math.round(m * 0.85), max: Math.round(m * 1.2), formule };
}

// ═══════════════════════════════════════════════════════════════
// 6. Grille salaire expert-comptable (CCN 787 — indicatif 2026)
// ═══════════════════════════════════════════════════════════════

export interface ProfilSalaire {
  id: string;
  label: string;
  detail: string;
  brutMin: number; // €/an
  brutMax: number;
}

/** Fourchettes de marché indicatives 2026 (brut annuel, France). */
export const PROFILS_SALAIRE: ProfilSalaire[] = [
  { id: "debutant", label: "Assistant / collaborateur débutant", detail: "0-2 ans, BTS/DCG", brutMin: 26000, brutMax: 34000 },
  { id: "collaborateur", label: "Collaborateur confirmé", detail: "2-5 ans, DCG/DSCG", brutMin: 34000, brutMax: 45000 },
  { id: "chef-mission", label: "Chef de mission", detail: "5-10 ans, DSCG/stagiaire DEC", brutMin: 45000, brutMax: 60000 },
  { id: "manager", label: "Manager / responsable de bureau", detail: "8-15 ans", brutMin: 58000, brutMax: 80000 },
  { id: "ec-diplome", label: "Expert-comptable diplômé (DEC)", detail: "salarié ou indépendant junior", brutMin: 70000, brutMax: 100000 },
  { id: "associe", label: "Expert-comptable associé", detail: "rémunération + dividendes", brutMin: 100000, brutMax: 200000 },
];

export const REGIONS_SALAIRE = [
  { id: "idf", label: "Île-de-France", coef: 1.15 },
  { id: "metropole", label: "Grande métropole (Lyon, Bordeaux...)", coef: 1.05 },
  { id: "province", label: "Autre région", coef: 1.0 },
] as const;

export function fourchetteSalaire(profilId: string, regionId: string) {
  const profil = PROFILS_SALAIRE.find((p) => p.id === profilId) ?? PROFILS_SALAIRE[0]!;
  const region = REGIONS_SALAIRE.find((r) => r.id === regionId) ?? REGIONS_SALAIRE[2];
  return {
    brutMin: Math.round((profil.brutMin * region.coef) / 500) * 500,
    brutMax: Math.round((profil.brutMax * region.coef) / 500) * 500,
    netMensuelMin: Math.round((profil.brutMin * region.coef * 0.78) / 12 / 50) * 50,
    netMensuelMax: Math.round((profil.brutMax * region.coef * 0.78) / 12 / 50) * 50,
  };
}

/** Minima conventionnels CCN 787 (indicatifs, base 35h, arrondis 2026). */
export const GRILLE_CCN: { coef: number; niveau: string; brutAnnuel: number }[] = [
  { coef: 170, niveau: "N1 — employé débutant", brutAnnuel: 23200 },
  { coef: 180, niveau: "N1 — employé", brutAnnuel: 24100 },
  { coef: 200, niveau: "N2 — assistant confirmé", brutAnnuel: 25600 },
  { coef: 220, niveau: "N2 — technicien", brutAnnuel: 27200 },
  { coef: 260, niveau: "N3 — collaborateur autonome", brutAnnuel: 30400 },
  { coef: 280, niveau: "N3 — chef de groupe", brutAnnuel: 32100 },
  { coef: 330, niveau: "N4 — chef de mission", brutAnnuel: 36800 },
  { coef: 385, niveau: "N4 — encadrement", brutAnnuel: 41900 },
  { coef: 450, niveau: "N5 — cadre supérieur", brutAnnuel: 48700 },
  { coef: 500, niveau: "N5 — direction", brutAnnuel: 53900 },
];

// ═══════════════════════════════════════════════════════════════
// 7. TVA — conversion HT ⇄ TTC (CGI art. 278 et s.)
// ═══════════════════════════════════════════════════════════════

export type TauxTva = 0.2 | 0.1 | 0.055 | 0.021;

export const TAUX_TVA: { value: TauxTva; label: string }[] = [
  { value: 0.2, label: "20 % — taux normal" },
  { value: 0.1, label: "10 % — intermédiaire (restauration, travaux…)" },
  { value: 0.055, label: "5,5 % — réduit (alimentaire, livres, énergie…)" },
  { value: 0.021, label: "2,1 % — super-réduit (médicaments remboursés, presse)" },
];

export type SensTva = "ht_vers_ttc" | "ttc_vers_ht";

export interface TvaResult {
  ht: number;
  tva: number;
  ttc: number;
}

const centimes = (n: number): number => Math.round(n * 100) / 100;

/** TTC→HT = TTC ÷ (1+t) — jamais TTC × (1−t), l'erreur classique. */
export function convertitTva(montant: number, taux: number, sens: SensTva): TvaResult {
  const m = Math.max(0, montant);
  const ht = sens === "ht_vers_ttc" ? m : m / (1 + taux);
  const ttc = sens === "ht_vers_ttc" ? m * (1 + taux) : m;
  return { ht: centimes(ht), tva: centimes(ttc - ht), ttc: centimes(ttc) };
}

// ═══════════════════════════════════════════════════════════════
// 8. Frais kilométriques — barème fiscal, formule I = d × a + b.
//    Barème en vigueur (déclaration 2026 des revenus 2025), gelé depuis
//    l'arrêté du 27/03/2023 (art. 6 B ann. IV CGI) — service-public.gouv.fr
//    /particuliers/actualites/A14686 + Légifrance, vérifié 2026-07-13.
//    ⚠️ Tranches voiture 5 000/20 000 km mais moto 3 000/6 000 km.
// ═══════════════════════════════════════════════════════════════

export type TypeVehicule = "voiture" | "moto";

interface TrancheKm {
  jusqua: number; // borne haute incluse (Infinity pour la dernière)
  a: number; // €/km
  b: number; // part fixe €
}

export interface BaremeKm {
  id: string;
  label: string;
  tranches: [TrancheKm, TrancheKm, TrancheKm];
}

export const BAREME_KM_VOITURE: BaremeKm[] = [
  { id: "3cv", label: "3 CV et moins", tranches: [{ jusqua: 5000, a: 0.529, b: 0 }, { jusqua: 20000, a: 0.316, b: 1065 }, { jusqua: Infinity, a: 0.37, b: 0 }] },
  { id: "4cv", label: "4 CV", tranches: [{ jusqua: 5000, a: 0.606, b: 0 }, { jusqua: 20000, a: 0.34, b: 1330 }, { jusqua: Infinity, a: 0.407, b: 0 }] },
  { id: "5cv", label: "5 CV", tranches: [{ jusqua: 5000, a: 0.636, b: 0 }, { jusqua: 20000, a: 0.357, b: 1395 }, { jusqua: Infinity, a: 0.427, b: 0 }] },
  { id: "6cv", label: "6 CV", tranches: [{ jusqua: 5000, a: 0.665, b: 0 }, { jusqua: 20000, a: 0.374, b: 1457 }, { jusqua: Infinity, a: 0.447, b: 0 }] },
  { id: "7cv", label: "7 CV et plus", tranches: [{ jusqua: 5000, a: 0.697, b: 0 }, { jusqua: 20000, a: 0.394, b: 1515 }, { jusqua: Infinity, a: 0.47, b: 0 }] },
];

export const BAREME_KM_MOTO: BaremeKm[] = [
  { id: "1-2cv", label: "1 ou 2 CV", tranches: [{ jusqua: 3000, a: 0.395, b: 0 }, { jusqua: 6000, a: 0.099, b: 891 }, { jusqua: Infinity, a: 0.248, b: 0 }] },
  { id: "3-5cv", label: "3, 4 ou 5 CV", tranches: [{ jusqua: 3000, a: 0.468, b: 0 }, { jusqua: 6000, a: 0.082, b: 1158 }, { jusqua: Infinity, a: 0.275, b: 0 }] },
  { id: "6cv-plus", label: "Plus de 5 CV", tranches: [{ jusqua: 3000, a: 0.606, b: 0 }, { jusqua: 6000, a: 0.079, b: 1583 }, { jusqua: Infinity, a: 0.343, b: 0 }] },
];

/** Majoration véhicule 100 % électrique (hybrides exclus) — art. 6 B ann. IV
 *  CGI en vigueur (« majoré de 20 % »), Légifrance, vérifié 2026-07-13. */
export const MAJORATION_ELECTRIQUE = 0.2;

export interface IndemniteKmResult {
  indemnite: number;
  formuleAppliquee: string;
  coutParKm: number;
}

export function indemniteKm(
  distance: number,
  baremeId: string,
  type: TypeVehicule,
  electrique: boolean,
): IndemniteKmResult {
  const d = Math.max(0, distance);
  const baremes = type === "voiture" ? BAREME_KM_VOITURE : BAREME_KM_MOTO;
  const bareme = baremes.find((x) => x.id === baremeId) ?? baremes[0]!;
  const tranche = bareme.tranches.find((t) => d <= t.jusqua) ?? bareme.tranches[2];
  const brut = d * tranche.a + (d > 0 ? tranche.b : 0);
  const indemnite = electrique ? brut * (1 + MAJORATION_ELECTRIQUE) : brut;
  const formuleAppliquee =
    tranche.b > 0
      ? `d × ${tranche.a.toLocaleString("fr-FR")} + ${tranche.b.toLocaleString("fr-FR")} €`
      : `d × ${tranche.a.toLocaleString("fr-FR")}`;
  return {
    indemnite,
    formuleAppliquee: electrique ? `(${formuleAppliquee}) × 1,20` : formuleAppliquee,
    coutParKm: d > 0 ? indemnite / d : 0,
  };
}

// ═══════════════════════════════════════════════════════════════
// 9. Coût employeur d'un salarié — APPROXIMATION ASSUMÉE
//    Taux moyens dérivés du moteur officiel URSSAF (hypothèses par
//    défaut, hors versement mobilité/mutuelle/AT réel) — jamais
//    présenter comme exact. Réduction = RGDU (LFSS 2025, en vigueur
//    01/01/2026) : urssaf.fr + service-public.gouv.fr, vérifié 2026-07-13.
// ═══════════════════════════════════════════════════════════════

export type StatutSalarie = "non_cadre" | "cadre";

/** Charges patronales moyennes hors réduction (≈ 39-45 % selon niveau ; indicatif). */
export const TAUX_PATRONAL: Record<StatutSalarie, number> = { non_cadre: 0.42, cadre: 0.45 };
/** Charges salariales moyennes (≈ 21-23 % ; indicatif). */
export const TAUX_SALARIAL: Record<StatutSalarie, number> = { non_cadre: 0.22, cadre: 0.23 };
/** SMIC mensuel brut 35 h depuis le 01/06/2026 (12,31 €/h) — service-public.gouv.fr. */
export const SMIC_MENSUEL_BRUT = 1867.02;
/** Base de la formule RGDU 2026 = SMIC annuel VALEUR 01/01/2026 (1 823,03 × 12). */
export const SMIC_ANNUEL_REF_RGDU = 21_876.4;
/** RGDU (réduction générale dégressive unique) : sortie à 3 × SMIC (réf. 01/01/2026),
 *  coef = TMIN + TDELTA × [½ × (3 × SMICref ÷ rému annuelle − 1)]^P — urssaf.fr. */
export const RGDU_TMIN = 0.02;
export const RGDU_P = 1.75;
export const RGDU_TDELTA_MOINS_50 = 0.3781; // coef max 0,3981
export const RGDU_TDELTA_50_PLUS = 0.3821; // coef max 0,4021

/** Brut reconstitué depuis un net souhaité — approximation affichée comme telle. */
export function brutDepuisNet(net: number, statut: StatutSalarie): number {
  return Math.max(0, net) / (1 - TAUX_SALARIAL[statut]);
}

/** RGDU 2026 : réduction mensuelle estimée (0 dès 3 × SMIC réf. 01/01/2026). */
export function reductionGenerale(brutMensuel: number, plus50Salaries = false): number {
  const brut = Math.max(0, brutMensuel);
  const remuAnnuelle = brut * 12;
  const sortie = 3 * SMIC_ANNUEL_REF_RGDU;
  if (brut <= 0 || remuAnnuelle >= sortie) return 0;
  const tdelta = plus50Salaries ? RGDU_TDELTA_50_PLUS : RGDU_TDELTA_MOINS_50;
  const coef = Math.min(
    RGDU_TMIN + tdelta,
    RGDU_TMIN + tdelta * Math.pow(0.5 * (sortie / remuAnnuelle - 1), RGDU_P),
  );
  return coef * brut;
}

export interface CoutSalarieResult {
  chargesPatronalesBrutes: number;
  reduction: number;
  chargesPatronales: number;
  coutMensuel: number;
  coutAnnuel: number;
  netAvantImpot: number;
}

export function coutSalarie(
  brutMensuel: number,
  statut: StatutSalarie,
  plus50Salaries = false,
): CoutSalarieResult {
  const brut = Math.max(0, brutMensuel);
  const chargesPatronalesBrutes = brut * TAUX_PATRONAL[statut];
  const reduction = reductionGenerale(brut, plus50Salaries);
  const chargesPatronales = Math.max(0, chargesPatronalesBrutes - reduction);
  const coutMensuel = brut + chargesPatronales;
  return {
    chargesPatronalesBrutes,
    reduction,
    chargesPatronales,
    coutMensuel,
    coutAnnuel: coutMensuel * 12,
    netAvantImpot: brut * (1 - TAUX_SALARIAL[statut]),
  };
}

// ═══════════════════════════════════════════════════════════════
// 10. Rupture conventionnelle — indemnité spécifique minimale
//     (= indemnité légale de licenciement, art. R. 1234-2 et R. 1234-4).
//     Formule + régime : service-public.gouv.fr (màj 26/06/2026) +
//     Légifrance, vérifié 2026-07-13.
// ═══════════════════════════════════════════════════════════════

export const TAUX_INDEMNITE_JUSQUA_10_ANS = 1 / 4; // mois par année
export const TAUX_INDEMNITE_APRES_10_ANS = 1 / 3;
/** PASS 2026 = 48 060 €/an (arrêté du 22/12/2025) ; exonération de cotisations
 *  dans la limite de 2 PASS. */
export const PASS_ANNUEL = 48_060;
/** Contribution patronale (art. L.137-12 CSS) sur la part exonérée :
 *  30 % → 40 % depuis le 31/12/2025 (LFSS 2026, loi n° 2025-1403 art. 15). */
export const TAUX_CONTRIBUTION_PATRONALE_RC = 0.4;

export interface RuptureConventionnelleResult {
  salaireReference: number;
  anciennete: number; // années décimales
  indemnite: number;
  equivalentMois: number;
}

/** Salaire de référence = le plus favorable entre moyenne 12 mois et 3 mois ;
 *  années incomplètes proratisées ; pas d'ancienneté minimale requise. */
export function indemniteRuptureConventionnelle(
  salaireMoyen12: number,
  salaireMoyen3: number,
  annees: number,
  mois: number,
): RuptureConventionnelleResult {
  const salaireReference = Math.max(0, Math.max(salaireMoyen12, salaireMoyen3));
  const anciennete = Math.max(0, annees) + Math.min(11, Math.max(0, mois)) / 12;
  const indemnite =
    salaireReference *
    (Math.min(anciennete, 10) * TAUX_INDEMNITE_JUSQUA_10_ANS +
      Math.max(0, anciennete - 10) * TAUX_INDEMNITE_APRES_10_ANS);
  return {
    salaireReference,
    anciennete,
    indemnite,
    equivalentMois: salaireReference > 0 ? indemnite / salaireReference : 0,
  };
}

// ═══════════════════════════════════════════════════════════════
// 11. Prime de fin de CDD — indemnité de précarité
//     (art. L. 1243-8 à L. 1243-10 du Code du travail).
// ═══════════════════════════════════════════════════════════════

export const TAUX_PRIME_PRECARITE = 0.1; // art. L. 1243-8, vérifié 2026-07-13
/** Taux réduit possible UNIQUEMENT par convention/accord de branche étendu (ou
 *  accord d'entreprise) avec contreparties formation — art. L. 1243-9. */
export const TAUX_PRIME_REDUIT_BRANCHE = 0.06;
/** ICCP méthode du 1/10e — assiette salaires + prime (fiche ministère du
 *  Travail + jurisprudence constante ; ordre : prime d'abord, ICCP ensuite). */
export const TAUX_ICCP = 0.1;
/** Approximation charges salariales pour le net estimé (indicatif). */
export const CHARGES_SALARIALES_APPROX = 0.22;

/** Cas d'exclusion de la prime — art. L. 1243-10 + fiche service-public F40,
 *  vérifié 2026-07-13. Réserve : dispositions conventionnelles plus favorables. */
export const EXCLUSIONS_PRIME_CDD: string[] = [
  "CDD saisonnier",
  "Contrat d'usage (extra, intermittent…)",
  "Emploi d'un jeune pendant ses vacances scolaires ou universitaires",
  "Contrat aidé, d'apprentissage ou de professionnalisation",
  "Poursuite de la relation de travail en CDI",
  "Refus d'un CDI pour un emploi identique à rémunération au moins équivalente",
  "Rupture anticipée à l'initiative du salarié",
  "Faute grave du salarié",
  "Force majeure",
  "Rupture pendant la période d'essai",
];

export interface PrimeCddResult {
  prime: number;
  primeNetteApprox: number;
  iccp: number;
  totalBrutFinContrat: number;
}

export function primeFinCdd(brutTotal: number, taux: number, inclureIccp: boolean): PrimeCddResult {
  const brut = Math.max(0, brutTotal);
  const prime = brut * taux;
  const iccp = inclureIccp ? (brut + prime) * TAUX_ICCP : 0;
  return {
    prime,
    primeNetteApprox: prime * (1 - CHARGES_SALARIALES_APPROX),
    iccp,
    totalBrutFinContrat: prime + iccp,
  };
}

// ═══════════════════════════════════════════════════════════════
// 12. Capital social — répartition et seuils de contrôle
//     Seuils STRICTS : 50 % pile ≠ majorité ; 33,33 % pile ≠ blocage.
//     Règles générales (SARL post-2005) — la SAS relève des statuts.
// ═══════════════════════════════════════════════════════════════

export const SEUIL_MAJORITE_SIMPLE = 0.5; // contrôle AGO : STRICTEMENT > 50 %
export const SEUIL_MAJORITE_AGE = 2 / 3; // ≥ 2/3 : contrôle AGE
export const SEUIL_MINORITE_BLOCAGE = 1 / 3; // STRICTEMENT > 1/3 : blocage AGE

export type PouvoirAssocie = "controle_age" | "majoritaire" | "blocage" | "minoritaire";

export const POUVOIR_LABELS: Record<PouvoirAssocie, string> = {
  controle_age: "Contrôle total (AGO + AGE)",
  majoritaire: "Majorité simple (AGO)",
  blocage: "Minorité de blocage (AGE)",
  minoritaire: "Minoritaire",
};

export interface AssocieResult {
  apport: number;
  parts: number;
  pct: number; // 0-1, valeur exacte (arrondir à l'affichage seulement)
  pouvoir: PouvoirAssocie;
}

export interface RepartitionCapitalResult {
  capitalTotal: number;
  totalParts: number;
  associes: AssocieResult[];
  alertes: ("egalite_50_50" | "apport_non_multiple")[];
}

export function repartitionCapital(apports: number[], valeurNominale: number): RepartitionCapitalResult {
  const nominal = Math.max(0.01, valeurNominale);
  const clean = apports.map((a) => Math.max(0, a));
  const capitalTotal = clean.reduce((s, a) => s + a, 0);
  const associes: AssocieResult[] = clean.map((apport) => {
    const pct = capitalTotal > 0 ? apport / capitalTotal : 0;
    const pouvoir: PouvoirAssocie =
      pct >= SEUIL_MAJORITE_AGE
        ? "controle_age"
        : pct > SEUIL_MAJORITE_SIMPLE
          ? "majoritaire"
          : pct > SEUIL_MINORITE_BLOCAGE
            ? "blocage"
            : "minoritaire";
    return { apport, parts: Math.floor(apport / nominal), pct, pouvoir };
  });
  const alertes: RepartitionCapitalResult["alertes"] = [];
  if (associes.filter((a) => Math.abs(a.pct - 0.5) < 1e-9).length === 2) alertes.push("egalite_50_50");
  if (clean.some((a) => a > 0 && Math.abs(a / nominal - Math.round(a / nominal)) > 1e-9)) {
    alertes.push("apport_non_multiple");
  }
  return {
    capitalTotal,
    totalParts: associes.reduce((s, a) => s + a.parts, 0),
    associes,
    alertes,
  };
}
