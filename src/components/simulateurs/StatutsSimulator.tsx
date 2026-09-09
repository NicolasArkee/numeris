"use client";

import { useState } from "react";
import { compareStatuts, fmtEur, type ActiviteMicro } from "@/libs/simulateurs/math";
import { Disclaimer, FieldNumber, FieldSelect, SimulatorBox, SimulatorFields, ResultGrid, SimulatorCta } from "./ui";

export function StatutsSimulator() {
  const [ca, setCa] = useState(80000);
  const [frais, setFrais] = useState(8000);
  const [activite, setActivite] = useState<ActiviteMicro>("bnc");

  const rows = compareStatuts(ca, frais, activite);
  const best = Math.max(...rows.map((r) => r.net));

  return (
    <SimulatorBox>
      <SimulatorFields columns={3}>
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
      </SimulatorFields>

      <ResultGrid columns={3}>
        {rows.map((r) => (
          <article key={r.statut} className={`flex min-w-0 flex-col rounded-3xl p-6 sm:p-7 ${r.net === best ? "bg-navy text-white" : "border border-navy/10 bg-lilac/45 text-navy"}`}>
            <div className="mb-5 min-h-7">
              {r.net === best && (
                <span className="inline-flex rounded-full bg-mint px-3 py-1 text-[.67rem] font-bold text-navy">Net le plus élevé dans ce calcul</span>
              )}
            </div>
            <h3 className="text-[1.2rem] font-bold leading-6">{r.statut}</h3>
            <dl className="mt-7">
              <dt className={`text-[.77rem] font-medium ${r.net === best ? "text-white/70" : "text-ink-muted"}`}>Net avant IR</dt>
              <dd className={`mt-2 text-[clamp(1.8rem,2.8vw,2.5rem)] font-bold not-italic leading-tight tracking-[-.04em] tabular-nums [overflow-wrap:anywhere] ${r.net === best ? "text-white" : "text-cobalt"}`}>{fmtEur(r.net)}</dd>
              <div className={`mt-6 flex flex-wrap items-center justify-between gap-2 border-t pt-4 text-[.82rem] ${r.net === best ? "border-white/20" : "border-navy/10"}`}>
                <dt>Prélèvements</dt>
                <dd className="font-semibold tabular-nums">{fmtEur(r.prelevements)}</dd>
              </div>
            </dl>
            <p className={`mt-auto pt-6 text-[.78rem] leading-6 ${r.net === best ? "text-white/70" : "text-ink-muted"}`}>{r.commentaire}</p>
          </article>
        ))}
      </ResultGrid>

      <SimulatorCta label="Valider le bon statut avec un expert" />
      <Disclaimer>
        Comparaison indicative avant impôt sur le revenu personnel, hors protection sociale
        (retraite, prévoyance), plafonds micro, ACRE et stratégies mixtes salaire/dividendes.
        Le « meilleur » statut dépend aussi de votre couverture sociale cible — pas seulement du net.
      </Disclaimer>
    </SimulatorBox>
  );
}
