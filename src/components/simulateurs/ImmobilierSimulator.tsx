"use client";

import { useState } from "react";
import { compareLmnp, fmtEur } from "@/libs/simulateurs/math";
import { Disclaimer, FieldNumber, ResultValue, SimulatorBox, SimulatorCta } from "./ui";

export function ImmobilierSimulator() {
  const [loyers, setLoyers] = useState(12000);
  const [charges, setCharges] = useState(3500);
  const [bien, setBien] = useState(220000);
  const [mobilier, setMobilier] = useState(8000);

  const r = compareLmnp(loyers, charges, bien, mobilier);

  return (
    <SimulatorBox>
      <div className="grid gap-5 md:grid-cols-4">
        <FieldNumber label="Loyers annuels (CC)" value={loyers} onChange={setLoyers} step={500} suffix="€" />
        <FieldNumber label="Charges annuelles" value={charges} onChange={setCharges} step={250} suffix="€" hint="Copro, taxe foncière, intérêts d'emprunt, assurance, CGA…" />
        <FieldNumber label="Valeur du bien (hors terrain)" value={bien} onChange={setBien} step={10000} suffix="€" />
        <FieldNumber label="Valeur du mobilier" value={mobilier} onChange={setMobilier} step={500} suffix="€" />
      </div>

      <div className="mt-7 grid gap-4 md:grid-cols-3">
        <ResultValue label="Base imposable micro-BIC" value={fmtEur(r.baseMicro)} detail="abattement forfaitaire 50 %" />
        <ResultValue label="Base imposable au réel" value={fmtEur(r.baseReel)} highlight detail={`dont amortissement ${fmtEur(r.amortissementAnnuel)}/an`} />
        <ResultValue
          label="Base d'imposition économisée"
          value={fmtEur(Math.max(0, r.economieBase))}
          detail="par an, réel vs micro-BIC"
        />
      </div>

      <SimulatorCta label="Passer au réel avec un expert LMNP" />
      <Disclaimer>
        Estimation indicative : amortissement linéaire simplifié (bâti 85 % de la valeur sur 30 ans,
        mobilier sur 7 ans), hors composants, terrain, déficit reportable et plafonds micro-BIC
        (77 700 €, ou 15 000 € en meublé de tourisme non classé). La liasse fiscale LMNP au réel
        nécessite une comptabilité d&apos;engagement.
      </Disclaimer>
    </SimulatorBox>
  );
}
