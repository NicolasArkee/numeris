"use client";

import { useState } from "react";
import {
  fmtEur,
  impotSocietesDetail,
  PLAFOND_IS_TAUX_REDUIT,
  SEUIL_CA_IS_REDUIT,
} from "@/libs/simulateurs/math";
import { Disclaimer, FieldNumber, FieldToggle, ResultValue, SimulatorBox, SimulatorCta } from "./ui";

export function ImpotSocietesSimulator() {
  const [benefice, setBenefice] = useState(60000);
  const [ca, setCa] = useState(300000);
  const [conditionsCapital, setConditionsCapital] = useState(true);

  const eligible = ca < SEUIL_CA_IS_REDUIT && conditionsCapital;
  const result = impotSocietesDetail(benefice, eligible);
  const deficit = benefice <= 0;

  return (
    <SimulatorBox>
      <div className="grid gap-5 md:grid-cols-2">
        <FieldNumber label="Bénéfice imposable" value={benefice} onChange={setBenefice} min={-10_000_000} step={1000} suffix="€" />
        <FieldNumber label="Chiffre d'affaires annuel HT" value={ca} onChange={setCa} step={10000} suffix="€" />
      </div>
      <div className="mt-4">
        <FieldToggle
          label="Capital entièrement libéré et détenu à au moins 75 % par des personnes physiques"
          value={conditionsCapital}
          onChange={setConditionsCapital}
        />
      </div>

      <div className="mt-7 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <ResultValue
          label="IS total"
          value={fmtEur(result.total)}
          highlight
          detail={deficit ? "Déficit : aucun IS dû, reportable en avant" : `Taux effectif ${(result.tauxEffectif * 100).toLocaleString("fr-FR", { maximumFractionDigits: 1 })} %`}
        />
        <ResultValue
          label="Part à 15 %"
          value={fmtEur(result.trancheReduite)}
          detail={eligible ? `sur les premiers ${fmtEur(PLAFOND_IS_TAUX_REDUIT)} de bénéfice` : "conditions du taux réduit non remplies"}
        />
        <ResultValue label="Part à 25 %" value={fmtEur(result.trancheNormale)} detail="taux normal" />
        <ResultValue label="Résultat net après IS" value={fmtEur(result.resultatNetApresIs)} detail="avant distribution" />
      </div>

      <SimulatorCta label="Optimiser mon résultat avec un expert" />
      <Disclaimer>
        Estimation avant contribution sociale de 3,3 % (due au-delà de 763 000 € d&apos;IS), crédits
        d&apos;impôt, acomptes et régimes particuliers (intégration fiscale, contributions exceptionnelles
        éventuelles). Le bénéfice imposable diffère du résultat comptable (réintégrations, déductions).
        Le calcul définitif relève de la liasse fiscale établie par votre expert-comptable.
      </Disclaimer>
    </SimulatorBox>
  );
}
