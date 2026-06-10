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

/** IS 2026 : 15 % jusqu'à 42 500 € de bénéfice, 25 % au-delà. */
export function impotSocietes(benefice: number): number {
  if (benefice <= 0) return 0;
  const seuil = 42500;
  return Math.min(benefice, seuil) * 0.15 + Math.max(0, benefice - seuil) * 0.25;
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
// 5. Honoraires d'expertise comptable (grille interne Numeris)
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
