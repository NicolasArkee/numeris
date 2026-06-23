import Link from "next/link";
import type { DirectoryCabinetCard } from "@/libs/db";

export function cabinetDirectorySlug(card: DirectoryCabinetCard): string {
  const name = card.cabinet.display_name ?? card.cabinet.legal_name;
  return `${name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")}-${card.establishment.siret}`;
}

export function cabinetDirectoryPath(card: DirectoryCabinetCard): string {
  const citySlug = card.city?.slug ?? "ville";
  return `/expert-comptable/${citySlug}/${cabinetDirectorySlug(card)}`;
}

export function CabinetCard({ card }: { card: DirectoryCabinetCard }) {
  const name = card.cabinet.display_name ?? card.cabinet.legal_name;
  const isVerified =
    card.cabinet.oec_status === "verified"
    || card.cabinet.oec_status === "manual_verified";
  const address = [
    card.establishment.address_line1,
    [card.establishment.postal_code, card.establishment.city_name]
      .filter(Boolean)
      .join(" "),
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <article className="rounded-lg border border-border bg-surface p-6 shadow-sm transition-shadow hover:shadow-md">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <h2 className="font-display text-[1.25rem] font-semibold text-ink">
          {name}
        </h2>
        <span
          className={
            isVerified
              ? "inline-flex items-center gap-1 rounded-md border border-success-500/30 bg-success-50 px-2 py-0.5 font-display text-[0.6875rem] font-semibold uppercase tracking-wider text-success-700"
              : "inline-flex items-center gap-1 rounded-md border border-warning-500/30 bg-warning-50 px-2 py-0.5 font-display text-[0.6875rem] font-semibold uppercase tracking-wider text-warning-700"
          }
        >
          <span aria-hidden>{isVerified ? "✓" : "?"}</span>
          {isVerified ? "Fiche documentée" : "À confirmer"}
        </span>
      </div>
      <p className="text-[0.9375rem] text-ink-muted">{address}</p>
      <p className="mt-3 text-[0.8125rem] text-ink-soft">
        {isVerified
          ? "Source administrative et vérification professionnelle conservées en historique."
          : "Source administrative publique ; statut professionnel à confirmer auprès du professionnel."}
      </p>
      <Link
        href={cabinetDirectoryPath(card)}
        className="mt-4 inline-flex items-center gap-1.5 font-display text-[0.875rem] font-semibold text-brand-700 transition-colors hover:text-brand-500"
      >
        Voir la fiche
        <span aria-hidden>→</span>
      </Link>
    </article>
  );
}
