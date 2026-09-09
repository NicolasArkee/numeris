"use client";

import { useEffect, useState } from "react";
import { compterJours } from "@/libs/simulateurs/calendrier";
import { Disclaimer, FieldDate, ResultValue, SimulatorBox, SimulatorFields, ResultGrid, SimulatorCta } from "./ui";

const fmtDate = (dateISO: string): string =>
  new Date(`${dateISO}T00:00:00Z`).toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });

export function JoursOuvresSimulator() {
  // Défauts posés côté client (éviter le mismatch d'hydratation sur la date du jour).
  const [debut, setDebut] = useState("");
  const [fin, setFin] = useState("");
  useEffect(() => {
    const now = Date.now();
    const iso = (ms: number): string => new Date(ms).toISOString().slice(0, 10);
    setDebut((d) => d || iso(now));
    setFin((f) => f || iso(now + 30 * 86_400_000));
  }, []);

  const result = debut && fin ? compterJours(debut, fin) : null;

  return (
    <SimulatorBox>
      <SimulatorFields columns={2}>
        <FieldDate label="Date de début (incluse)" value={debut} onChange={setDebut} />
        <FieldDate
          label="Date de fin (incluse)"
          value={fin}
          onChange={setFin}
          hint="Du lundi au vendredi d'une même semaine sans férié = 5 jours ouvrés"
        />
      </SimulatorFields>

      {result && (
        <>
          <ResultGrid columns={3}>
            <ResultValue
              label="Jours ouvrés"
              value={String(result.ouvres)}
              highlight
              detail={`lundi-vendredi hors fériés — ${result.feriesEnSemaine} férié(s) en semaine sur la période`}
            />
            <ResultValue label="Jours ouvrables" value={String(result.ouvrables)} detail="lundi-samedi hors fériés" />
            <ResultValue label="Jours calendaires" value={String(result.calendaires)} detail="tous les jours, bornes incluses" />
          </ResultGrid>
          {result.listeFeries.length > 0 && (
            <div className="mt-6 rounded-3xl bg-lilac/60 p-5 sm:p-7">
              <p className="mb-4 text-[.94rem] font-bold text-navy">
                Jours fériés sur la période
              </p>
              <ul className="grid gap-3 text-[.82rem] leading-6 text-ink-muted md:grid-cols-2">
                {result.listeFeries.map((f) => (
                  <li key={f.dateISO} className="rounded-2xl border border-navy/10 bg-white p-4">
                    <span className="block font-semibold tabular-nums text-navy">{fmtDate(f.dateISO)}</span>
                    <span className="mt-1 block">{f.nom}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}

      <SimulatorCta label="Poser vos questions paie & congés" />
      <Disclaimer>
        Calcul basé sur les jours fériés légaux de France métropolitaine — l&apos;Alsace-Moselle (Vendredi
        saint, 26 décembre) et l&apos;outre-mer ont des jours supplémentaires. Hormis le 1er mai, un jour
        férié n&apos;est pas obligatoirement chômé : cela dépend de votre convention collective. Pour le
        décompte de délais légaux ou de préavis (jours francs, calendaires ou ouvrés selon le cas),
        vérifiez la règle applicable avec un professionnel.
      </Disclaimer>
    </SimulatorBox>
  );
}
