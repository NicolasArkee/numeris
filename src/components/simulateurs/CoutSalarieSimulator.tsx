"use client";

import { useState } from "react";
import {
  brutDepuisNet,
  coutSalarie,
  fmtEur,
  SMIC_MENSUEL_BRUT,
  type StatutSalarie,
} from "@/libs/simulateurs/math";
import { Disclaimer, FieldNumber, FieldSelect, FieldToggle, ResultValue, SimulatorBox, SimulatorFields, ResultGrid, SimulatorCta } from "./ui";

type PointDepart = "brut" | "net";

export function CoutSalarieSimulator() {
  const [depart, setDepart] = useState<PointDepart>("brut");
  const [montant, setMontant] = useState(2500);
  const [statut, setStatut] = useState<StatutSalarie>("non_cadre");
  const [plus50, setPlus50] = useState(false);

  const brut = depart === "brut" ? Math.max(0, montant) : brutDepuisNet(montant, statut);
  const result = coutSalarie(brut, statut, plus50);
  const sousSmic = brut > 0 && brut < SMIC_MENSUEL_BRUT;

  return (
    <SimulatorBox>
      <SimulatorFields columns={3}>
        <FieldSelect<PointDepart>
          label="Point de départ"
          value={depart}
          onChange={setDepart}
          options={[
            { value: "brut", label: "Salaire brut" },
            { value: "net", label: "Salaire net souhaité (approximation)" },
          ]}
        />
        <FieldNumber
          label={depart === "brut" ? "Salaire brut mensuel" : "Salaire net mensuel visé"}
          value={montant}
          onChange={setMontant}
          step={100}
          suffix="€/mois"
          hint={sousSmic ? `Montant inférieur au SMIC (≈ ${fmtEur(SMIC_MENSUEL_BRUT)} brut)` : undefined}
        />
        <FieldSelect<StatutSalarie>
          label="Statut"
          value={statut}
          onChange={setStatut}
          options={[
            { value: "non_cadre", label: "Non-cadre" },
            { value: "cadre", label: "Cadre" },
          ]}
        />
        <div className="md:col-span-full">
          <FieldToggle label="Entreprise de 50 salariés et plus" value={plus50} onChange={setPlus50} />
        </div>
      </SimulatorFields>

      <ResultGrid columns={3}>
        <ResultValue
          label="Coût employeur mensuel"
          value={fmtEur(result.coutMensuel)}
          highlight
          detail={`dont ${fmtEur(result.chargesPatronales)} de charges patronales${depart === "net" ? ` — brut reconstitué ≈ ${fmtEur(brut)}` : ""}`}
        />
        <ResultValue label="Coût annuel" value={fmtEur(result.coutAnnuel)} detail="hors 13e mois, primes et avantages" />
        <ResultValue label="Net versé au salarié" value={fmtEur(result.netAvantImpot)} detail="avant impôt sur le revenu" />
      </ResultGrid>
      {result.reduction > 0 && (
        <p className="mt-5 rounded-2xl bg-mint px-5 py-4 text-[.82rem] leading-6 text-navy">
          Réduction générale de cotisations (RGDU 2026) estimée :{" "}
          <strong className="font-mono tabular-nums">−{fmtEur(result.reduction)}</strong> par mois
          (dégressive jusqu&apos;à 3 SMIC), déjà déduite du coût affiché.
        </p>
      )}

      <SimulatorCta label="Chiffrer une embauche avec un expert" />
      <Disclaimer>
        Estimation volontairement simplifiée : les taux réels dépendent de la convention collective, du
        taux AT/MP notifié, de la mutuelle, de la prévoyance, du versement mobilité et des exonérations
        applicables. La réduction générale appliquée est la formule RGDU 2026 (allègements fusionnés,
        dégressive jusqu&apos;à 3 SMIC), calculée sur des hypothèses standard. Ce simulateur ne remplace
        ni un bulletin de paie ni un chiffrage par un expert-comptable ou un gestionnaire de paie.
      </Disclaimer>
    </SimulatorBox>
  );
}
