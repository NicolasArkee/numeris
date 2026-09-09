"use client";

import { useState } from "react";
import {
  fmtEur,
  fourchetteSalaire,
  GRILLE_CCN,
  PROFILS_SALAIRE,
  REGIONS_SALAIRE,
} from "@/libs/simulateurs/math";
import { Disclaimer, FieldSelect, ResultValue, SimulatorTable, SimulatorBox, SimulatorFields, ResultGrid } from "./ui";

export function SalaireGrille() {
  const [profil, setProfil] = useState("collaborateur");
  const [region, setRegion] = useState("province");

  const r = fourchetteSalaire(profil, region);
  const profilData = PROFILS_SALAIRE.find((p) => p.id === profil);

  return (
    <SimulatorBox>
      <SimulatorFields columns={2}>
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
      </SimulatorFields>
      {profilData && (
        <p className="mt-3 text-[0.75rem] text-ink-muted">{profilData.detail}</p>
      )}

      <ResultGrid columns={2}>
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
      </ResultGrid>

      {/* Grille CCN 787 — minima conventionnels indicatifs */}
      <SimulatorTable title="Minima conventionnels — CCN des cabinets d’experts-comptables (n° 787)">
          <table className="min-w-[34rem]">
          <caption className="sr-only">Grille des minima conventionnels par coefficient</caption>
            <thead>
              <tr>
                <th scope="col">Coefficient</th>
                <th scope="col">Niveau</th>
                <th scope="col">Brut annuel minimum</th>
                <th scope="col">Brut mensuel</th>
              </tr>
            </thead>
            <tbody>
              {GRILLE_CCN.map((row) => (
                <tr key={row.coef} className="even:bg-paper">
                  <td className="px-4 py-3 text-[0.85rem] font-medium text-ink">{row.coef}</td>
                  <td className="px-4 py-3 text-[0.8rem] text-ink-muted">{row.niveau}</td>
                  <td className="px-4 py-3 text-[0.85rem] font-medium text-cobalt">{fmtEur(row.brutAnnuel)}</td>
                  <td className="px-4 py-3 text-[0.8rem] text-ink-muted">{fmtEur(row.brutAnnuel / 12)}</td>
                </tr>
              ))}
            </tbody>
          </table>
      </SimulatorTable>

      <Disclaimer>
        Fourchettes de marché et minima conventionnels indicatifs 2026 (CCN 787, base 35h),
        arrondis. Les salaires réels varient selon le cabinet (taille, spécialisation),
        les primes et le 13e mois. Net mensuel approximé à 78 % du brut (statut cadre/non-cadre
        non différencié).
      </Disclaimer>
    </SimulatorBox>
  );
}
