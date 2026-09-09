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
import { Disclaimer, FieldNumber, FieldSelect, FieldToggle, ResultValue, SimulatorTable, SimulatorBox, SimulatorFields, ResultGrid, SimulatorCta } from "./ui";

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
      <SimulatorFields columns={3}>
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
        <div className="md:col-span-full">
          <FieldToggle label="Véhicule 100 % électrique (majoration de 20 %)" value={electrique} onChange={setElectrique} />
        </div>
      </SimulatorFields>

      <ResultGrid columns={3}>
        <ResultValue
          label="Indemnité annuelle"
          value={fmtEur(result.indemnite)}
          highlight
          detail={`Formule appliquée : ${result.formuleAppliquee}`}
        />
        <ResultValue label="Coût moyen par km" value={fmtEurPrecis(result.coutParKm)} detail="indemnité ÷ distance" />
        <ResultValue label="Équivalent mensuel" value={fmtEur(result.indemnite / 12)} detail="sur 12 mois" />
      </ResultGrid>

      <SimulatorTable title="Comparer les puissances fiscales">
        <table className="min-w-[32rem]">
          <caption className="sr-only">Indemnités et coût kilométrique par puissance fiscale</caption>
          <thead>
            <tr>
              <th scope="col">Puissance</th>
              <th scope="col">
                Indemnité pour {distance.toLocaleString("fr-FR")} km
              </th>
              <th scope="col">€/km</th>
            </tr>
          </thead>
          <tbody>
            {baremes.map((b) => {
              const r = indemniteKm(distance, b.id, type, electrique);
              const active = b.id === puissanceValide;
              return (
                <tr key={b.id} className={`border-b border-border-soft ${active ? "bg-mint" : "bg-white"}`}>
                  <td className="py-2.5 pr-4 text-ink">{b.label}</td>
                  <td className="py-2.5 pr-4 font-mono tabular-nums text-ink">{fmtEur(r.indemnite)}</td>
                  <td className="py-2.5 font-mono tabular-nums text-ink-muted">{fmtEurPrecis(r.coutParKm)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </SimulatorTable>

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
