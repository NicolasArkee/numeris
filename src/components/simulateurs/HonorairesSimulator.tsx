"use client";

import { useState } from "react";
import { estimeHonoraires, fmtEur, type FormeJuridique } from "@/libs/simulateurs/math";
import { Disclaimer, FieldNumber, FieldSelect, FieldToggle, ResultValue, SimulatorBox, SimulatorCta } from "./ui";

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
      <div className="grid gap-5 md:grid-cols-4">
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
      </div>

      <div className="mt-7 grid gap-4 md:grid-cols-2">
        <ResultValue
          label="Fourchette d'honoraires estimée"
          value={`${fmtEur(r.min)} – ${fmtEur(r.max)}`}
          highlight
          detail="par mois HT"
        />
        <ResultValue label="Formule recommandée" value={r.formule} detail="tenue + déclarations + accompagnement" />
      </div>

      <SimulatorCta label="Obtenir un devis ferme sous 24h" />
      <Disclaimer>
        Estimation fondée sur notre grille tarifaire standard ({fmtEur(59)}–{fmtEur(159)}/mois HT
        selon formule). Le devis ferme dépend du volume de pièces, des spécificités sectorielles
        et des missions complémentaires (prévisionnel, social, juridique).
      </Disclaimer>
    </SimulatorBox>
  );
}
