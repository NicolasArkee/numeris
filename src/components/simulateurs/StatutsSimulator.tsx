"use client";

import { useState } from "react";
import { compareStatuts, fmtEur, type ActiviteMicro } from "@/libs/simulateurs/math";
import { Disclaimer, FieldNumber, FieldSelect, SimulatorBox, SimulatorCta } from "./ui";

export function StatutsSimulator() {
  const [ca, setCa] = useState(80000);
  const [frais, setFrais] = useState(8000);
  const [activite, setActivite] = useState<ActiviteMicro>("bnc");

  const rows = compareStatuts(ca, frais, activite);
  const best = Math.max(...rows.map((r) => r.net));

  return (
    <SimulatorBox>
      <div className="grid gap-5 md:grid-cols-3">
        <FieldNumber label="Chiffre d'affaires annuel HT" value={ca} onChange={setCa} step={5000} suffix="€" />
        <FieldNumber label="Frais professionnels annuels" value={frais} onChange={setFrais} step={1000} suffix="€" hint="Matériel, déplacements, locaux, sous-traitance…" />
        <FieldSelect<ActiviteMicro>
          label="Nature de l'activité"
          value={activite}
          onChange={setActivite}
          options={[
            { value: "bnc", label: "Libérale (BNC)" },
            { value: "services_bic", label: "Services commerciaux (BIC)" },
            { value: "vente", label: "Vente de marchandises" },
          ]}
        />
      </div>

      <div className="mt-7 overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b-2 border-or">
              <th className="px-4 py-3 text-[0.68rem] font-bold uppercase tracking-[0.08em] text-ardoise">Statut</th>
              <th className="px-4 py-3 text-[0.68rem] font-bold uppercase tracking-[0.08em] text-ardoise">Net avant IR</th>
              <th className="px-4 py-3 text-[0.68rem] font-bold uppercase tracking-[0.08em] text-ardoise">Prélèvements</th>
              <th className="hidden px-4 py-3 text-[0.68rem] font-bold uppercase tracking-[0.08em] text-ardoise md:table-cell">À savoir</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.statut} className={`border-b border-pierre-12 ${r.net === best ? "bg-or-pale" : "bg-blanc"}`}>
                <td className="px-4 py-4 text-[0.88rem] font-medium text-encre">
                  {r.statut}
                  {r.net === best && (
                    <span className="ml-2 bg-or px-1.5 py-0.5 text-[0.58rem] font-bold uppercase text-nuit">Optimal</span>
                  )}
                </td>
                <td className="px-4 py-4 font-serif text-[1.25rem] font-light italic text-or-fonce">{fmtEur(r.net)}</td>
                <td className="px-4 py-4 text-[0.85rem] text-ardoise">{fmtEur(r.prelevements)}</td>
                <td className="hidden px-4 py-4 text-[0.72rem] leading-relaxed text-ardoise md:table-cell">{r.commentaire}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <SimulatorCta label="Valider le bon statut avec un expert" />
      <Disclaimer>
        Comparaison indicative avant impôt sur le revenu personnel, hors protection sociale
        (retraite, prévoyance), plafonds micro, ACRE et stratégies mixtes salaire/dividendes.
        Le « meilleur » statut dépend aussi de votre couverture sociale cible — pas seulement du net.
      </Disclaimer>
    </SimulatorBox>
  );
}
