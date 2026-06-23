import React from "react";

export function DirectoryComplianceNotice() {
  return (
    <section className="rounded-lg border border-border bg-bg-muted p-6 text-[0.875rem] leading-7 text-ink-muted">
      <h2 className="mb-2 font-display text-[1.125rem] font-semibold text-ink">
        Provenance des données
      </h2>
      <p>
        Cet annuaire distingue les données administratives publiques des
        informations professionnelles documentées. Une fiche n'est affichée
        comme documentée que lorsqu'une source fiable ou une vérification
        manuelle confirme le statut indiqué.
      </p>
      <p className="mt-2">
        Toute demande de correction ou d'opposition peut être adressée via la
        page contact du site.
      </p>
    </section>
  );
}
