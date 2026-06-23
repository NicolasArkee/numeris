"use client";

import { useState } from "react";
import {
  fmtEur,
  fourchetteSalaire,
  GRILLE_CCN,
  PROFILS_SALAIRE,
  REGIONS_SALAIRE,
} from "@/libs/simulateurs/math";
import { Disclaimer, FieldSelect, ResultValue, SimulatorBox } from "./ui";

export function SalaireGrille() {
  const [profil, setProfil] = useState("collaborateur");
  const [region, setRegion] = useState("province");

  const r = fourchetteSalaire(profil, region);
  const profilData = PROFILS_SALAIRE.find((p) => p.id === profil);

  return (
    <SimulatorBox>
      <div className="grid gap-5 md:grid-cols-2">
        <FieldSelect
          label="Profil / expérience"
          value={profil}
          onChange={setProfil}
          options={PROFILS_SALAIRE.map((p) => ({ value: p.id, label: p.label }))}
        />
        <FieldSelect
          label="Région"
          value={region}
          onChange={setRegion}
          options={REGIONS_SALAIRE.map((rg) => ({ value: rg.id, label: rg.label }))}
        />
      </div>
      {profilData && (
        <p className="mt-3 text-[0.75rem] text-ink-muted">{profilData.detail}</p>
      )}

      <div className="mt-7 grid gap-4 md:grid-cols-2">
        <ResultValue
          label="Salaire brut annuel"
          value={`${fmtEur(r.brutMin)} – ${fmtEur(r.brutMax)}`}
          highlight
        />
        <ResultValue
          label="Net mensuel approximatif"
          value={`${fmtEur(r.netMensuelMin)} – ${fmtEur(r.netMensuelMax)}`}
          detail="avant impôt sur le revenu (net ≈ 78 % du brut)"
        />
      </div>

      {/* Grille CCN 787 — minima conventionnels indicatifs */}
      <div className="mt-9">
        <h3 className="mb-4 font-display text-[1.15rem] font-bold text-ink">
          Minima conventionnels — CCN des cabinets d&apos;experts-comptables (n° 787)
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b-2 border-accent-500">
                <th className="px-4 py-2.5 text-[0.68rem] font-bold uppercase tracking-[0.08em] text-ink-muted">Coefficient</th>
                <th className="px-4 py-2.5 text-[0.68rem] font-bold uppercase tracking-[0.08em] text-ink-muted">Niveau</th>
                <th className="px-4 py-2.5 text-[0.68rem] font-bold uppercase tracking-[0.08em] text-ink-muted">Brut annuel minimum</th>
                <th className="px-4 py-2.5 text-[0.68rem] font-bold uppercase tracking-[0.08em] text-ink-muted">Brut mensuel</th>
              </tr>
            </thead>
            <tbody>
              {GRILLE_CCN.map((row) => (
                <tr key={row.coef} className="border-b border-border-soft bg-surface">
                  <td className="px-4 py-3 text-[0.85rem] font-medium text-ink">{row.coef}</td>
                  <td className="px-4 py-3 text-[0.8rem] text-ink-muted">{row.niveau}</td>
                  <td className="px-4 py-3 text-[0.85rem] font-medium text-accent-700">{fmtEur(row.brutAnnuel)}</td>
                  <td className="px-4 py-3 text-[0.8rem] text-ink-muted">{fmtEur(row.brutAnnuel / 12)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Disclaimer>
        Fourchettes de marché et minima conventionnels indicatifs 2026 (CCN 787, base 35h),
        arrondis. Les salaires réels varient selon le cabinet (taille, spécialisation),
        les primes et le 13e mois. Net mensuel approximé à 78 % du brut (statut cadre/non-cadre
        non différencié).
      </Disclaimer>
    </SimulatorBox>
  );
}
