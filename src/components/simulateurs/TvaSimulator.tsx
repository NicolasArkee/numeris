"use client";

import { useState } from "react";
import { convertitTva, fmtEurPrecis, TAUX_TVA, type SensTva } from "@/libs/simulateurs/math";
import { Disclaimer, FieldNumber, FieldSelect, ResultValue, SimulatorTable, SimulatorBox, SimulatorFields, ResultGrid, SimulatorCta } from "./ui";

export function TvaSimulator() {
  const [montant, setMontant] = useState(1000);
  const [sens, setSens] = useState<SensTva>("ht_vers_ttc");
  const [taux, setTaux] = useState("0.2");

  const result = convertitTva(montant, Number(taux), sens);

  return (
    <SimulatorBox>
      <SimulatorFields columns={3}>
        <FieldNumber
          label={sens === "ht_vers_ttc" ? "Montant HT" : "Montant TTC"}
          value={montant}
          onChange={setMontant}
          step={10}
          suffix="€"
        />
        <FieldSelect<SensTva>
          label="Sens de conversion"
          value={sens}
          onChange={setSens}
          options={[
            { value: "ht_vers_ttc", label: "HT → TTC" },
            { value: "ttc_vers_ht", label: "TTC → HT" },
          ]}
        />
        <FieldSelect
          label="Taux de TVA"
          value={taux}
          onChange={setTaux}
          options={TAUX_TVA.map((t) => ({ value: String(t.value), label: t.label }))}
        />
      </SimulatorFields>

      <ResultGrid columns={3}>
        <ResultValue label="Montant HT" value={fmtEurPrecis(result.ht)} highlight={sens === "ttc_vers_ht"} />
        <ResultValue label="Montant de TVA" value={fmtEurPrecis(result.tva)} detail={`au taux de ${(Number(taux) * 100).toLocaleString("fr-FR")} %`} />
        <ResultValue label="Montant TTC" value={fmtEurPrecis(result.ttc)} highlight={sens === "ht_vers_ttc"} />
      </ResultGrid>

      <SimulatorTable title="Comparer les taux de TVA">
        <table className="min-w-[28rem]">
          <caption className="sr-only">Tableau des montants HT, TVA et TTC par taux</caption>
          <thead>
            <tr>
              <th scope="col">Taux</th>
              <th scope="col">HT</th>
              <th scope="col">TVA</th>
              <th scope="col">TTC</th>
            </tr>
          </thead>
          <tbody>
            {TAUX_TVA.map((t) => {
              const r = convertitTva(montant, t.value, sens);
              const active = String(t.value) === taux;
              return (
                <tr key={t.value} className={`border-b border-border-soft ${active ? "bg-mint" : "bg-white"}`}>
                  <td className="py-2.5 pr-4 font-mono tabular-nums text-ink">{(t.value * 100).toLocaleString("fr-FR")} %</td>
                  <td className="py-2.5 pr-4 font-mono tabular-nums text-ink-muted">{fmtEurPrecis(r.ht)}</td>
                  <td className="py-2.5 pr-4 font-mono tabular-nums text-ink-muted">{fmtEurPrecis(r.tva)}</td>
                  <td className="py-2.5 font-mono tabular-nums text-ink">{fmtEurPrecis(r.ttc)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </SimulatorTable>

      <SimulatorCta label="Faire valider mon régime de TVA" />
      <Disclaimer>
        Outil indicatif : le taux applicable dépend de la nature exacte du bien ou du service (règles
        particulières en restauration, presse, travaux, Corse et outre-mer). Le calcul ne vaut pas
        facturation. En cas de doute sur le taux ou votre régime (franchise en base, réel simplifié,
        réel normal), faites valider par un expert-comptable.
      </Disclaimer>
    </SimulatorBox>
  );
}
