import React from "react";
import Link from "next/link";

export function DirectoryComplianceNotice() {
  return (
    <section className="rounded-[1.5rem] bg-mint p-6 text-[.9rem] leading-7 text-ink-muted sm:p-8">
      <p className="mb-3 text-[.65rem] font-bold uppercase tracking-[.16em] text-blue">Des informations traçables</p>
      <h2 className="mb-4 font-display text-[1.5rem] font-bold leading-tight text-ink">Provenance des données</h2>
      <p>Cet annuaire distingue les données administratives publiques des informations professionnelles documentées. Une fiche n'est affichée comme documentée que lorsqu'une source fiable ou une vérification manuelle confirme le statut indiqué.</p>
      <p className="mt-3">Toute demande de correction ou d'opposition peut être adressée via la page contact du site.</p>
      <Link href="/contact?objet=correction-annuaire" className="mt-5 inline-flex items-center gap-3 font-bold text-blue underline underline-offset-4">Signaler une information <span aria-hidden>↗</span></Link>
    </section>
  );
}
