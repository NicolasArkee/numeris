"use client";

import { useState } from "react";
import { fmtEur, tjmCible, type StatutTjm } from "@/libs/simulateurs/math";
import { Disclaimer, FieldNumber, FieldSelect, ResultValue, SimulatorBox, SimulatorCta } from "./ui";

export function TjmSimulator() {
  const [net, setNet] = useState(4000);
  const [jours, setJours] = useState(16);
  const [frais, setFrais] = useState(300);
  const [statut, setStatut] = useState<StatutTjm>("micro_bnc");

  const r = tjmCible(net, jours, frais, statut);

  return (
    <SimulatorBox>
      <div className="grid gap-5 md:grid-cols-4">
        <FieldNumber label="Net mensuel souhaité" value={net} onChange={setNet} step={250} suffix="€" hint="avant impôt sur le revenu" />
        <FieldNumber label="Jours facturés / mois" value={jours} onChange={setJours} min={1} max={22} hint="15-18 jours en pratique (intermission, admin…)" />
        <FieldNumber label="Frais pro mensuels" value={frais} onChange={setFrais} step={50} suffix="€" />
        <FieldSelect<StatutTjm>
          label="Statut"
          value={statut}
          onChange={setStatut}
          options={[
            { value: "micro_bnc", label: "Micro-BNC" },
            { value: "ei_reel", label: "EI au réel" },
            { value: "sasu", label: "SASU (assimilé salarié)" },
          ]}
        />
      </div>

      <div className="mt-7 grid gap-4 md:grid-cols-3">
        <ResultValue label="TJM recommandé" value={fmtEur(r.tjm)} highlight detail="hors taxes" />
        <ResultValue label="CA annuel correspondant" value={fmtEur(r.caAnnuel)} />
        <ResultValue label="Jours facturés / an" value={String(r.joursFactures)} detail="congés et intermission déduits de votre saisie" />
      </div>

      <SimulatorCta />
      <Disclaimer>
        Estimation indicative : la ponction cotisations+structure retenue est de 26,1 % (micro-BNC),
        31 % (EI réel) et 45 % (SASU) du chiffre d&apos;affaires. Hors IR, TVA et négociation client.
        Pensez à vérifier le plafond micro-BNC (77 700 € de CA).
      </Disclaimer>
    </SimulatorBox>
  );
}
