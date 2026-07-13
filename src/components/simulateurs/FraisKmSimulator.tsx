"use client";

import { useState } from "react";
import {
  BAREME_KM_MOTO,
  BAREME_KM_VOITURE,
  fmtEur,
  fmtEurPrecis,
  indemniteKm,
  type TypeVehicule,
} from "@/libs/simulateurs/math";
import { Disclaimer, FieldNumber, FieldSelect, FieldToggle, ResultValue, SimulatorBox, SimulatorCta } from "./ui";

export function FraisKmSimulator() {
  const [type, setType] = useState<TypeVehicule>("voiture");
  const [puissance, setPuissance] = useState("5cv");
  const [distance, setDistance] = useState(12000);
  const [electrique, setElectrique] = useState(false);

  const baremes = type === "voiture" ? BAREME_KM_VOITURE : BAREME_KM_MOTO;
  const puissanceValide = baremes.some((b) => b.id === puissance) ? puissance : baremes[0]!.id;
  const result = indemniteKm(distance, puissanceValide, type, electrique);

  return (
    <SimulatorBox>
      <div className="grid gap-5 md:grid-cols-3">
        <FieldSelect<TypeVehicule>
          label="Type de véhicule"
          value={type}
          onChange={(t) => {
            setType(t);
            setPuissance(t === "voiture" ? "5cv" : "3-5cv");
          }}
          options={[
            { value: "voiture", label: "Voiture" },
            { value: "moto", label: "Moto (> 50 cm³)" },
          ]}
        />
        <FieldSelect
          label="Puissance fiscale"
          value={puissanceValide}
          onChange={setPuissance}
          options={baremes.map((b) => ({ value: b.id, label: b.label }))}
        />
        <FieldNumber label="Distance professionnelle" value={distance} onChange={setDistance} step={500} suffix="km/an" />
      </div>
      <div className="mt-4">
        <FieldToggle label="Véhicule 100 % électrique (majoration de 20 %)" value={electrique} onChange={setElectrique} />
      </div>

      <div className="mt-7 grid gap-4 md:grid-cols-3">
        <ResultValue
          label="Indemnité annuelle"
          value={fmtEur(result.indemnite)}
          highlight
          detail={`Formule appliquée : ${result.formuleAppliquee}`}
        />
        <ResultValue label="Coût moyen par km" value={fmtEurPrecis(result.coutParKm)} detail="indemnité ÷ distance" />
        <ResultValue label="Équivalent mensuel" value={fmtEur(result.indemnite / 12)} detail="sur 12 mois" />
      </div>

      <div className="mt-7 overflow-x-auto">
        <table className="w-full min-w-[24rem] text-left text-[0.85rem]">
          <thead>
            <tr className="border-b-2 border-accent-500">
              <th className="py-2.5 pr-4 font-display text-[0.78rem] uppercase tracking-[0.08em] text-ink-muted">Puissance</th>
              <th className="py-2.5 pr-4 font-display text-[0.78rem] uppercase tracking-[0.08em] text-ink-muted">
                Indemnité pour {distance.toLocaleString("fr-FR")} km
              </th>
              <th className="py-2.5 font-display text-[0.78rem] uppercase tracking-[0.08em] text-ink-muted">€/km</th>
            </tr>
          </thead>
          <tbody>
            {baremes.map((b) => {
              const r = indemniteKm(distance, b.id, type, electrique);
              const active = b.id === puissanceValide;
              return (
                <tr key={b.id} className={`border-b border-border-soft ${active ? "bg-accent-50" : ""}`}>
                  <td className="py-2.5 pr-4 text-ink">{b.label}</td>
                  <td className="py-2.5 pr-4 font-mono tabular-nums text-ink">{fmtEur(r.indemnite)}</td>
                  <td className="py-2.5 font-mono tabular-nums text-ink-muted">{fmtEurPrecis(r.coutParKm)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <SimulatorCta label="Arbitrer frais réels vs forfait" />
      <Disclaimer>
        Barème fiscal indicatif (frais réels IR / remboursements exonérés), sous réserve de l&apos;arrêté
        publié chaque printemps. Le barème couvre dépréciation, entretien, carburant et assurance — péages,
        stationnement et intérêts d&apos;emprunt se déduisent en plus, au prorata professionnel, sur
        justificatifs. Seuls les kilomètres professionnels comptent. Faites valider votre option frais
        réels par un expert-comptable.
      </Disclaimer>
    </SimulatorBox>
  );
}
