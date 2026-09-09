"use client";

import { useState } from "react";
import { estimeHonoraires, fmtEur, type FormeJuridique } from "@/libs/simulateurs/math";
import { Disclaimer, FieldNumber, FieldSelect, FieldToggle, ResultValue, SimulatorBox, SimulatorFields, ResultGrid, SimulatorCta } from "./ui";

export function HonorairesSimulator({ professionLabel }: { professionLabel?: string }) {
  const [forme, setForme] = useState<FormeJuridique>("ei");
  const [ca, setCa] = useState(120000);
  const [salaries, setSalaries] = useState(0);
  const [tva, setTva] = useState(true);

  const r = estimeHonoraires({ forme, caAnnuel: ca, salaries, tva });

  return (
    <SimulatorBox>
      {professionLabel && (
        <p className="mb-5 text-[0.78rem] text-ink-muted">
          Estimation pré-paramétrée pour : <span className="font-medium text-ink">{professionLabel}</span>
        </p>
      )}
      <SimulatorFields columns={4}>
        <FieldSelect<FormeJuridique>
          label="Forme juridique"
          value={forme}
          onChange={setForme}
          options={[
            { value: "micro", label: "Micro-entreprise" },
            { value: "ei", label: "Entreprise individuelle (réel)" },
            { value: "societe", label: "Société (SARL, SAS…)" },
          ]}
        />
        <FieldNumber label="Chiffre d'affaires annuel" value={ca} onChange={setCa} step={10000} suffix="€" />
        <FieldNumber label="Salariés" value={salaries} onChange={setSalaries} min={0} max={50} />
        <div className="flex items-end pb-3">
          <FieldToggle label="Assujetti à la TVA" value={tva} onChange={setTva} />
        </div>
      </SimulatorFields>

      <ResultGrid columns={2}>
        <ResultValue
          label="Ordre de grandeur estimé"
          value={`${fmtEur(r.min)} – ${fmtEur(r.max)}`}
          highlight
          detail="par mois HT · à confirmer"
        />
        <ResultValue label="Périmètre à comparer" value={r.formule} detail="tenue + déclarations + suivi à préciser" />
      </ResultGrid>

      <SimulatorCta label="Ajouter cette estimation au brief" />
      <Disclaimer>
        Cette estimation pédagogique repose sur une grille simplifiée. Elle ne constitue ni une offre
        ni un devis. Le montant réel dépend du volume de pièces, du périmètre, des outils, du secteur
        et des travaux complémentaires ; demandez à chaque cabinet de détailler ses hypothèses.
      </Disclaimer>
    </SimulatorBox>
  );
}
