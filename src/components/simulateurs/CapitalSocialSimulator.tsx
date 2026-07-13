"use client";

import { useState } from "react";
import { fmtEur, POUVOIR_LABELS, repartitionCapital } from "@/libs/simulateurs/math";
import { Disclaimer, FieldNumber, ResultValue, SimulatorBox, SimulatorCta } from "./ui";

interface LigneAssocie {
  nom: string;
  apport: number;
}

const MAX_ASSOCIES = 8;

export function CapitalSocialSimulator() {
  const [nominal, setNominal] = useState(1);
  const [associes, setAssocies] = useState<LigneAssocie[]>([
    { nom: "", apport: 6000 },
    { nom: "", apport: 4000 },
  ]);

  const result = repartitionCapital(associes.map((a) => a.apport), nominal);
  const majAge = result.associes.some((a) => a.pouvoir === "controle_age") && associes.length > 1;

  const setLigne = (i: number, patch: Partial<LigneAssocie>): void =>
    setAssocies((prev) => prev.map((l, j) => (j === i ? { ...l, ...patch } : l)));

  return (
    <SimulatorBox>
      <div className="grid gap-5 md:grid-cols-3">
        <FieldNumber
          label="Valeur nominale d'une part"
          value={nominal}
          onChange={setNominal}
          min={0.01}
          step={1}
          suffix="€"
        />
      </div>

      <div className="mt-5 space-y-3">
        {associes.map((l, i) => (
          <div key={i} className="flex flex-wrap items-end gap-3">
            <label className="min-w-40 flex-1">
              <span className="mb-1.5 block text-[0.68rem] font-bold uppercase tracking-[0.08em] text-ink-muted">
                Associé {i + 1}
              </span>
              <input
                type="text"
                value={l.nom}
                placeholder={`Associé ${i + 1}`}
                onChange={(e) => setLigne(i, { nom: e.target.value })}
                className="w-full border border-border-soft bg-surface px-4 py-3 text-[0.95rem] text-ink outline-none transition-colors focus:border-accent-500"
              />
            </label>
            <div className="min-w-36 flex-1">
              <FieldNumber label="Apport" value={l.apport} onChange={(v) => setLigne(i, { apport: v })} step={500} suffix="€" />
            </div>
            {associes.length > 1 && (
              <button
                type="button"
                aria-label={`Retirer l'associé ${i + 1}`}
                onClick={() => setAssocies((prev) => prev.filter((_, j) => j !== i))}
                className="border border-border-soft px-4 py-3 text-[0.85rem] text-ink-muted transition-colors hover:border-accent-500 hover:text-accent-700"
              >
                Retirer
              </button>
            )}
          </div>
        ))}
        {associes.length < MAX_ASSOCIES && (
          <button
            type="button"
            onClick={() => setAssocies((prev) => [...prev, { nom: "", apport: 1000 }])}
            className="border border-border-soft px-4 py-2.5 text-[0.85rem] font-semibold text-brand-700 transition-colors hover:border-accent-500 hover:text-accent-700"
          >
            + Ajouter un associé
          </button>
        )}
      </div>

      <div className="mt-7 grid gap-4 md:grid-cols-2">
        <ResultValue label="Capital social total" value={fmtEur(result.capitalTotal)} highlight detail={associes.length === 1 ? "un seul associé : SASU ou EURL" : undefined} />
        <ResultValue label="Nombre total de parts" value={result.totalParts.toLocaleString("fr-FR")} detail={`valeur nominale ${fmtEur(nominal)}`} />
      </div>

      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[32rem] text-left text-[0.85rem]">
          <thead>
            <tr className="border-b-2 border-accent-500">
              <th className="py-2.5 pr-4 font-display text-[0.78rem] uppercase tracking-[0.08em] text-ink-muted">Associé</th>
              <th className="py-2.5 pr-4 font-display text-[0.78rem] uppercase tracking-[0.08em] text-ink-muted">Apport</th>
              <th className="py-2.5 pr-4 font-display text-[0.78rem] uppercase tracking-[0.08em] text-ink-muted">Parts</th>
              <th className="py-2.5 pr-4 font-display text-[0.78rem] uppercase tracking-[0.08em] text-ink-muted">%</th>
              <th className="py-2.5 font-display text-[0.78rem] uppercase tracking-[0.08em] text-ink-muted">Pouvoir</th>
            </tr>
          </thead>
          <tbody>
            {result.associes.map((a, i) => (
              <tr key={i} className="border-b border-border-soft">
                <td className="py-2.5 pr-4 text-ink">{associes[i]?.nom || `Associé ${i + 1}`}</td>
                <td className="py-2.5 pr-4 font-mono tabular-nums text-ink-muted">{fmtEur(a.apport)}</td>
                <td className="py-2.5 pr-4 font-mono tabular-nums text-ink-muted">{a.parts.toLocaleString("fr-FR")}</td>
                <td className="py-2.5 pr-4 font-mono tabular-nums text-ink">
                  {result.capitalTotal > 0 ? `${(a.pct * 100).toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} %` : "—"}
                </td>
                <td className="py-2.5 text-[0.78rem] text-ink-muted">{POUVOIR_LABELS[a.pouvoir]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {result.alertes.includes("egalite_50_50") && (
        <p className="mt-4 border-l-2 border-l-accent-500 pl-4 text-[0.8rem] text-ink-muted">
          Répartition égalitaire 50/50 : aucune décision ne peut être imposée — risque de blocage total en
          cas de désaccord. Prévoyez des mécanismes de sortie de crise dans un pacte d&apos;associés.
        </p>
      )}
      {majAge && (
        <p className="mt-4 border-l-2 border-l-accent-500 pl-4 text-[0.8rem] text-ink-muted">
          Un associé franchit les 2/3 : il contrôle seul les décisions ordinaires ET extraordinaires
          (modification des statuts, augmentation de capital…).
        </p>
      )}
      {result.alertes.includes("apport_non_multiple") && (
        <p className="mt-4 border-l-2 border-l-border-soft pl-4 text-[0.75rem] text-ink-muted">
          Un apport n&apos;est pas un multiple exact de la valeur nominale : le nombre de parts est arrondi
          à l&apos;inférieur — ajustez le nominal ou les apports.
        </p>
      )}

      <SimulatorCta label="Structurer mon capital avec un expert" />
      <Disclaimer>
        Outil pédagogique : les seuils affichés sont les règles générales (SARL constituées depuis 2005,
        majorité des 2/3 en AGE). Ils varient selon la forme sociale — 3/4 pour les SARL antérieures à
        2005, liberté statutaire en SAS — et peuvent être neutralisés par un pacte d&apos;associés, des
        droits de vote double ou des actions de préférence. La structuration du capital engage votre
        contrôle et votre statut social (gérant majoritaire = TNS) : faites-vous accompagner par un
        expert-comptable ou un avocat.
      </Disclaimer>
    </SimulatorBox>
  );
}
