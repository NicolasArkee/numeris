/**
 * scripts/check-simulateurs.ts
 *
 * Assertions de non-régression sur les moteurs purs des simulateurs
 * (pas de test runner dans le projet). À lancer après toute modification
 * de src/libs/simulateurs/ : npx tsx scripts/check-simulateurs.ts
 */
import {
  convertitTva,
  indemniteKm,
  coutSalarie,
  reductionGenerale,
  impotSocietes,
  impotSocietesDetail,
  indemniteRuptureConventionnelle,
  primeFinCdd,
  repartitionCapital,
  SMIC_MENSUEL_BRUT,
  SMIC_ANNUEL_REF_RGDU,
} from "../src/libs/simulateurs/math";
import { compterJours, datePaques, joursFeries } from "../src/libs/simulateurs/calendrier";

let failures = 0;
function check(label: string, actual: unknown, expected: unknown): void {
  const ok = JSON.stringify(actual) === JSON.stringify(expected);
  if (!ok) {
    failures++;
    console.error(`✗ ${label}\n    attendu ${JSON.stringify(expected)} — obtenu ${JSON.stringify(actual)}`);
  } else {
    console.log(`✓ ${label}`);
  }
}
const approx = (n: number, digits = 2): number => Math.round(n * 10 ** digits) / 10 ** digits;

// ── TVA ──
check("TVA 100 HT à 20 % → 120 TTC", convertitTva(100, 0.2, "ht_vers_ttc").ttc, 120);
check("TVA 120 TTC à 20 % → 100 HT (÷1,20, pas ×0,8)", convertitTva(120, 0.2, "ttc_vers_ht").ht, 100);
check("TVA 55 TTC à 5,5 % → TVA 2,87", convertitTva(55, 0.055, "ttc_vers_ht").tva, 2.87);
check("TVA montant négatif → 0", convertitTva(-50, 0.2, "ht_vers_ttc").ttc, 0);

// ── Frais kilométriques (barème voitures revenus 2022+) ──
check("KM 5 CV 4 000 km → 4000×0,636 = 2 544", approx(indemniteKm(4000, "5cv", "voiture", false).indemnite), 2544);
check("KM 5 CV 6 000 km → 6000×0,357+1395 = 3 537", approx(indemniteKm(6000, "5cv", "voiture", false).indemnite), 3537);
check("KM 5 CV 22 000 km → 22000×0,427 = 9 394", approx(indemniteKm(22000, "5cv", "voiture", false).indemnite), 9394);
check("KM 5 000 km pile = tranche 1 (5000×0,636)", approx(indemniteKm(5000, "5cv", "voiture", false).indemnite), 3180);
check("KM électrique +20 %", approx(indemniteKm(4000, "5cv", "voiture", true).indemnite), approx(2544 * 1.2));
check("KM moto 3-5 CV 4 000 km → 4000×0,082+1158 = 1 486", approx(indemniteKm(4000, "3-5cv", "moto", false).indemnite), 1486);
check("KM distance 0 → 0", indemniteKm(0, "5cv", "voiture", false).indemnite, 0);

// ── Coût salarié (RGDU 2026) ──
check(
  "RGDU nulle à 3 × SMIC (réf. 01/01/2026) et au-delà",
  reductionGenerale((3 * SMIC_ANNUEL_REF_RGDU) / 12),
  0,
);
check(
  "RGDU 2 500 €/mois <50 salariés ≈ 430 €/mois (exemple urssaf.fr)",
  Math.round(reductionGenerale(2500, false)),
  430,
);
check(
  "RGDU coefficient 0,3178 à 2 000 €/mois ≥50 salariés (exemple urssaf.fr)",
  Math.round((reductionGenerale(2000, true) / 2000) * 10000) / 10000,
  0.3178,
);
if (!(reductionGenerale(SMIC_MENSUEL_BRUT) > 0)) {
  failures++;
  console.error("✗ Réduction générale au SMIC devrait être > 0");
} else console.log("✓ Réduction générale au SMIC > 0");
if (!(coutSalarie(SMIC_MENSUEL_BRUT, "non_cadre").coutMensuel < SMIC_MENSUEL_BRUT * 1.1)) {
  failures++;
  console.error("✗ Coût au SMIC devrait être < brut × 1,10 (RGDU appliquée)");
} else console.log("✓ Coût au SMIC ≈ brut +4-8 % (RGDU)");
check("Coût salarié brut 0 → 0", coutSalarie(0, "cadre").coutMensuel, 0);

// ── IS ──
check("IS 42 500 € éligible → 6 375 (tout à 15 %)", impotSocietes(42500), 6375);
check("IS 60 000 € éligible → 6375 + 17500×0,25 = 10 750", impotSocietes(60000), 10750);
check("IS 60 000 € NON éligible → 15 000 (tout à 25 %)", impotSocietesDetail(60000, false).total, 15000);
check("IS bénéfice ≤ 0 → 0", impotSocietes(-5000), 0);
check("IS deficit detail → net après IS = 0", impotSocietesDetail(-5000, true).resultatNetApresIs, 0);

// ── Rupture conventionnelle ──
check(
  "RC 10 ans pile, réf 2 000 € → 2,5 mois = 5 000 €",
  indemniteRuptureConventionnelle(2000, 2000, 10, 0).indemnite,
  5000,
);
check(
  "RC 12 ans, réf 3 000 € → (10/4 + 2/3) × 3000 = 9 500 €",
  approx(indemniteRuptureConventionnelle(3000, 3000, 12, 0).indemnite),
  9500,
);
check(
  "RC salaire de référence = max(12 mois, 3 mois)",
  indemniteRuptureConventionnelle(2000, 2400, 4, 0).salaireReference,
  2400,
);
check(
  "RC 0 an 6 mois → prorata 2400×0,5/4 = 300 €",
  approx(indemniteRuptureConventionnelle(2400, 2400, 0, 6).indemnite),
  300,
);

// ── Prime fin de CDD ──
check("Prime CDD 10 000 € à 10 % → 1 000 €", primeFinCdd(10000, 0.1, false).prime, 1000);
check("Prime CDD ICCP sur (brut+prime) → 1 100 €", primeFinCdd(10000, 0.1, true).iccp, 1100);
check("Prime CDD taux branche 6 % → 600 €", primeFinCdd(10000, 0.06, false).prime, 600);

// ── Capital social ──
const cap5050 = repartitionCapital([5000, 5000], 1);
check("Capital 50/50 → aucun majoritaire (seuil strict)", cap5050.associes.map((a) => a.pouvoir), ["blocage", "blocage"]);
check("Capital 50/50 → alerte égalité", cap5050.alertes.includes("egalite_50_50"), true);
const capTiers = repartitionCapital([6667, 3333], 100);
check("33,33 % pile ≠ blocage", capTiers.associes[1]!.pouvoir, "minoritaire");
check("≥ 2/3 → contrôle total", repartitionCapital([67, 33], 1).associes[0]!.pouvoir, "controle_age");
check("Parts = floor(apport/nominal)", repartitionCapital([1050], 100).associes[0]!.parts, 10);
check("Apport non multiple → alerte", repartitionCapital([1050], 100).alertes.includes("apport_non_multiple"), true);

// ── Calendrier ──
check("Pâques 2026 = 5 avril", datePaques(2026), { mois: 4, jour: 5 });
check("Pâques 2027 = 28 mars", datePaques(2027), { mois: 3, jour: 28 });
check("Pâques 2028 = 16 avril", datePaques(2028), { mois: 4, jour: 16 });
const feries2026 = joursFeries(2026);
check("11 fériés en 2026", feries2026.length, 11);
check(
  "Mobiles 2026 : lundi Pâques 06/04, Ascension 14/05, Pentecôte 25/05",
  feries2026.filter((f) => ["Lundi de Pâques", "Ascension", "Lundi de Pentecôte"].includes(f.nom)).map((f) => f.dateISO),
  ["2026-04-06", "2026-05-14", "2026-05-25"],
);
const annee2026 = compterJours("2026-01-01", "2026-12-31");
check("2026 : 365 jours calendaires", annee2026.calendaires, 365);
check("2026 : 252 jours ouvrés (9 fériés en semaine)", annee2026.ouvres, 252);
check("2026 : 9 fériés en semaine (15/08 samedi, 01/11 dimanche)", annee2026.feriesEnSemaine, 9);
check("2027 : 254 jours ouvrés (7 fériés en semaine)", compterJours("2027-01-01", "2027-12-31").ouvres, 254);
check("Lun-ven même semaine = 5 ouvrés", compterJours("2026-07-13", "2026-07-17").ouvres, 4); // 14/07 férié
check("Semaine sans férié = 5 ouvrés", compterJours("2026-07-20", "2026-07-24").ouvres, 5);
check("Bornes inversées → inversion silencieuse", compterJours("2026-07-24", "2026-07-20").ouvres, 5);
check("Même jour ouvré → 1", compterJours("2026-07-15", "2026-07-15").ouvres, 1);
check("Même jour samedi → 0 ouvré, 1 ouvrable", (() => { const r = compterJours("2026-07-18", "2026-07-18"); return [r.ouvres, r.ouvrables]; })(), [0, 1]);

console.log(failures === 0 ? "\nTOUT PASSE" : `\n${failures} ÉCHEC(S)`);
process.exit(failures === 0 ? 0 : 1);
