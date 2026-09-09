"use client";

import { useState } from "react";
import { fmtEur, primeFinCdd, TAUX_PRIME_PRECARITE, TAUX_PRIME_REDUIT_BRANCHE } from "@/libs/simulateurs/math";
import { Disclaimer, FieldNumber, FieldSelect, FieldToggle, ResultValue, SimulatorBox, SimulatorFields, ResultGrid, SimulatorCta } from "./ui";

export function PrimeCddSimulator() {
  const [brutTotal, setBrutTotal] = useState(10000);
  const [taux, setTaux] = useState(String(TAUX_PRIME_PRECARITE));
  const [inclureIccp, setInclureIccp] = useState(false);

  const result = primeFinCdd(brutTotal, Number(taux), inclureIccp);

  return (
    <SimulatorBox>
      <SimulatorFields columns={2}>
        <FieldNumber
          label="Rémunération brute totale du contrat"
          value={brutTotal}
          onChange={setBrutTotal}
          step={500}
          suffix="€"
          hint="Renouvellements de CDD inclus"
        />
        <FieldSelect
          label="Taux applicable"
          value={taux}
          onChange={setTaux}
          options={[
            { value: String(TAUX_PRIME_PRECARITE), label: "10 % — taux légal" },
            { value: String(TAUX_PRIME_REDUIT_BRANCHE), label: "6 % — accord de branche avec contreparties" },
          ]}
        />
        <div className="md:col-span-full">
          <FieldToggle
            label="Ajouter l'indemnité compensatrice de congés payés (congés non pris)"
            value={inclureIccp}
            onChange={setInclureIccp}
          />
        </div>
      </SimulatorFields>

      <ResultGrid columns={3}>
        <ResultValue
          label="Prime de précarité brute"
          value={fmtEur(result.prime)}
          highlight
          detail="soumise à cotisations et à l'impôt sur le revenu"
        />
        <ResultValue
          label="Prime nette estimée"
          value={fmtEur(result.primeNetteApprox)}
          detail="≈ après cotisations salariales, avant impôt"
        />
        {inclureIccp ? (
          <ResultValue label="Congés payés + total" value={fmtEur(result.totalBrutFinContrat)} detail={`dont ICCP ${fmtEur(result.iccp)} (1/10e, prime incluse)`} />
        ) : (
          <ResultValue label="Total brut de fin de contrat" value={fmtEur(result.totalBrutFinContrat)} detail="versé avec le dernier bulletin" />
        )}
      </ResultGrid>

      <SimulatorCta label="Vérifier mon solde de tout compte" />
      <Disclaimer>
        Estimation indicative : la prime de 10 % n&apos;est pas due dans plusieurs situations (CDD
        saisonnier, contrat d&apos;usage, job étudiant pendant les vacances, alternance, poursuite en CDI,
        refus d&apos;un CDI équivalent, rupture anticipée par le salarié, faute grave, force majeure…). Le
        net affiché est approximatif : la prime est soumise à cotisations sociales et à l&apos;impôt sur
        le revenu. Vérifiez votre convention collective et, en cas de doute, votre solde de tout compte
        avec un professionnel.
      </Disclaimer>
    </SimulatorBox>
  );
}
