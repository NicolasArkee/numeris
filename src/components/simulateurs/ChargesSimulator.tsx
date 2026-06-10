"use client";

import { useState } from "react";
import {
  chargesAssimile,
  chargesMicro,
  chargesTnsReel,
  fmtEur,
  type ActiviteMicro,
} from "@/libs/simulateurs/math";
import { Disclaimer, FieldNumber, FieldSelect, ResultValue, SimulatorBox, SimulatorCta } from "./ui";

type Statut = "micro" | "tns" | "assimile";

export function ChargesSimulator() {
  const [statut, setStatut] = useState<Statut>("micro");
  const [activite, setActivite] = useState<ActiviteMicro>("bnc");
  const [montant, setMontant] = useState(50000);

  const result =
    statut === "micro"
      ? chargesMicro(montant, activite)
      : statut === "tns"
        ? chargesTnsReel(montant)
        : chargesAssimile(montant);

  const baseLabel =
    statut === "micro"
      ? "Chiffre d'affaires annuel"
      : statut === "tns"
        ? "Bénéfice annuel (CA - frais)"
        : "Enveloppe employeur annuelle";

  return (
    <SimulatorBox>
      <div className="grid gap-5 md:grid-cols-3">
        <FieldSelect<Statut>
          label="Statut"
          value={statut}
          onChange={setStatut}
          options={[
            { value: "micro", label: "Micro-entreprise" },
            { value: "tns", label: "TNS au réel (EI, gérant maj.)" },
            { value: "assimile", label: "Assimilé salarié (SASU)" },
          ]}
        />
        {statut === "micro" && (
          <FieldSelect<ActiviteMicro>
            label="Activité"
            value={activite}
            onChange={setActivite}
            options={[
              { value: "bnc", label: "Libérale (BNC)" },
              { value: "services_bic", label: "Services commerciaux (BIC)" },
              { value: "vente", label: "Vente de marchandises" },
            ]}
          />
        )}
        <FieldNumber label={baseLabel} value={montant} onChange={setMontant} step={1000} suffix="€" />
      </div>

      <div className="mt-7 grid gap-4 md:grid-cols-3">
        <ResultValue label="Cotisations sociales" value={fmtEur(result.cotisations)} detail={`Taux effectif ≈ ${Math.round(result.tauxEffectif * 100)} %`} />
        <ResultValue label="Net avant impôt" value={fmtEur(result.net)} highlight />
        <ResultValue label="Net mensuel" value={fmtEur(result.net / 12)} detail="avant impôt sur le revenu" />
      </div>

      <SimulatorCta />
      <Disclaimer>
        Estimation indicative (barèmes 2026 simplifiés) : micro 12,3 % / 21,2 % / 26,1 % du CA,
        TNS au réel ≈ 45 % du net, assimilé salarié ≈ 80 % de charges sur le net. Hors CFE, IR,
        versement libératoire et cas particuliers — un chiffrage précis demande l&apos;analyse de votre situation.
      </Disclaimer>
    </SimulatorBox>
  );
}
