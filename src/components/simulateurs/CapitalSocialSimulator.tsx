"use client";

import { useState } from "react";
import { fmtEur, POUVOIR_LABELS, repartitionCapital } from "@/libs/simulateurs/math";
import { Disclaimer, FieldNumber, ResultValue, SimulatorTable, SimulatorBox, SimulatorFields, ResultGrid, SimulatorCta } from "./ui";

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
      <SimulatorFields columns={2}>
        <FieldNumber
          label="Valeur nominale d'une part"
          value={nominal}
          onChange={setNominal}
          min={0.01}
          step={1}
          suffix="€"
        />
        <div className="space-y-3 md:col-span-full">
          <p className="mb-4 text-[.86rem] font-semibold text-navy">Les apports de vos associés</p>
          {associes.map((l, i) => (
            <div key={i} className="flex flex-wrap items-end gap-3 rounded-2xl border border-navy/10 bg-white p-4 sm:p-5">
              <label className="min-w-40 flex-1">
                <span className="mb-2 block text-[.86rem] font-semibold leading-5 text-navy">
                  Associé {i + 1}
                </span>
                <input
                  type="text"
                  value={l.nom}
                  placeholder={`Associé ${i + 1}`}
                  onChange={(e) => setLigne(i, { nom: e.target.value })}
                  className="min-h-14 w-full rounded-2xl border border-navy/15 bg-paper px-4 py-3.5 text-base font-semibold text-navy outline-none focus:border-cobalt focus:ring-4 focus:ring-cobalt/10"
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
                  className="min-h-14 rounded-2xl border border-navy/15 px-4 py-3 text-[.8rem] font-semibold text-ink-muted transition-colors hover:bg-apricot hover:text-navy"
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
              className="mt-2 inline-flex min-h-12 items-center rounded-full bg-cobalt px-5 py-3 text-[.8rem] font-semibold text-white transition-colors hover:bg-navy"
            >
              + Ajouter un associé
            </button>
          )}
        </div>
      </SimulatorFields>

      <ResultGrid columns={2}>
        <ResultValue label="Capital social total" value={fmtEur(result.capitalTotal)} highlight detail={associes.length === 1 ? "un seul associé : SASU ou EURL" : undefined} />
        <ResultValue label="Nombre total de parts" value={result.totalParts.toLocaleString("fr-FR")} detail={`valeur nominale ${fmtEur(nominal)}`} />
      </ResultGrid>

      {result.capitalTotal > 0 && (
        <div aria-hidden="true" className="mt-6 rounded-3xl bg-paper p-5 sm:p-6">
          <p className="mb-4 text-[.83rem] font-semibold text-navy">Vos apports en un coup d’œil</p>
          <div className="flex h-5 overflow-hidden rounded-full bg-navy/10">
            {result.associes.map((a, i) => (
              <div key={i} className={`${["bg-cobalt", "bg-navy", "bg-accent-500", "bg-[#8577c2]", "bg-[#438b79]", "bg-[#536bc9]", "bg-[#b65f47]", "bg-[#8b7890]"][i]} border-r border-white/50 transition-[width] duration-300 motion-reduce:transition-none`} style={{ width: `${a.pct * 100}%` }} />
            ))}
          </div>
          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
            {result.associes.map((a, i) => (
              <span key={i} className="inline-flex items-center gap-2 text-[.73rem] text-ink-muted">
                <span className={`h-2 w-2 shrink-0 rounded-full ${["bg-cobalt", "bg-navy", "bg-accent-500", "bg-[#8577c2]", "bg-[#438b79]", "bg-[#536bc9]", "bg-[#b65f47]", "bg-[#8b7890]"][i]}`} />
                {associes[i]?.nom || `Associé ${i + 1}`}
              </span>
            ))}
          </div>
        </div>
      )}

      <SimulatorTable title="La répartition entre associés">
        <table className="min-w-[38rem]">
          <caption className="sr-only">Apports, parts et pouvoirs de chaque associé</caption>
          <thead>
            <tr>
              <th scope="col">Associé</th>
              <th scope="col">Apport</th>
              <th scope="col">Parts</th>
              <th scope="col">%</th>
              <th scope="col">Pouvoir</th>
            </tr>
          </thead>
          <tbody>
            {result.associes.map((a, i) => (
              <tr key={i} className="even:bg-paper">
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
      </SimulatorTable>

      {result.alertes.includes("egalite_50_50") && (
        <p className="mt-5 rounded-2xl bg-mint px-5 py-4 text-[.82rem] leading-6 text-navy">
          Répartition égalitaire 50/50 : aucune décision ne peut être imposée — risque de blocage total en
          cas de désaccord. Prévoyez des mécanismes de sortie de crise dans un pacte d&apos;associés.
        </p>
      )}
      {majAge && (
        <p className="mt-5 rounded-2xl bg-mint px-5 py-4 text-[.82rem] leading-6 text-navy">
          Un associé franchit les 2/3 : il contrôle seul les décisions ordinaires ET extraordinaires
          (modification des statuts, augmentation de capital…).
        </p>
      )}
      {result.alertes.includes("apport_non_multiple") && (
        <p className="mt-5 rounded-2xl bg-paper px-5 py-4 text-[.8rem] leading-6 text-ink-muted">
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
