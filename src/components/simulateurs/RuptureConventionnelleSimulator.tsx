"use client";

import { useState } from "react";
import { fmtEur, indemniteRuptureConventionnelle } from "@/libs/simulateurs/math";
import { Disclaimer, FieldNumber, ResultValue, SimulatorBox, SimulatorCta } from "./ui";

export function RuptureConventionnelleSimulator() {
  const [salaire12, setSalaire12] = useState(2500);
  const [salaire3, setSalaire3] = useState(2500);
  const [annees, setAnnees] = useState(5);
  const [mois, setMois] = useState(0);

  const result = indemniteRuptureConventionnelle(salaire12, salaire3, annees, mois);

  return (
    <SimulatorBox>
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        <FieldNumber
          label="Salaire brut moyen — 12 derniers mois"
          value={salaire12}
          onChange={setSalaire12}
          step={100}
          suffix="€/mois"
        />
        <FieldNumber
          label="Salaire brut moyen — 3 derniers mois"
          value={salaire3}
          onChange={setSalaire3}
          step={100}
          suffix="€/mois"
          hint="Primes annuelles proratisées sur 3 mois"
        />
        <FieldNumber label="Ancienneté — années" value={annees} onChange={setAnnees} step={1} suffix="ans" />
        <FieldNumber
          label="Mois supplémentaires"
          value={mois}
          onChange={setMois}
          max={11}
          step={1}
          suffix="mois"
          hint="Indemnité due dès le premier mois, au prorata"
        />
      </div>

      <div className="mt-7 grid gap-4 md:grid-cols-3">
        <ResultValue
          label="Indemnité minimale"
          value={fmtEur(result.indemnite)}
          highlight
          detail="plancher légal — librement négociable au-dessus"
        />
        <ResultValue
          label="Salaire de référence retenu"
          value={fmtEur(result.salaireReference)}
          detail="moyenne la plus favorable entre 12 et 3 mois"
        />
        <ResultValue
          label="Équivalent en mois de salaire"
          value={result.equivalentMois.toLocaleString("fr-FR", { maximumFractionDigits: 2 })}
          detail="¼ de mois/an jusqu'à 10 ans, ⅓ au-delà"
        />
      </div>
      <p className="mt-4 border-l-2 border-l-border-soft pl-4 text-[0.75rem] leading-relaxed text-ink-muted">
        Régime indicatif : indemnité exonérée de cotisations dans la limite de 2 plafonds annuels de la
        Sécurité sociale (96 120 € en 2026), avec contribution patronale de 40 % sur la part exonérée
        (taux relevé par la LFSS 2026), et exonérée d&apos;impôt sur le revenu dans certaines limites.
      </p>

      <SimulatorCta label="Faire chiffrer mon départ" />
      <Disclaimer>
        Montant minimum légal : votre convention collective peut prévoir une indemnité de licenciement
        plus favorable, qui s&apos;applique alors comme plancher. Le salaire de référence exact dépend de
        tous les éléments de rémunération (primes, avantages en nature) et la convention doit être
        homologuée par la Dreets. Le régime fiscal et social comporte des plafonds — faites chiffrer
        votre situation par un expert-comptable ou un avocat avant de signer.
      </Disclaimer>
    </SimulatorBox>
  );
}
