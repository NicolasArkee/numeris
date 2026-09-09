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
    <article className="group relative flex min-w-0 flex-col overflow-hidden rounded-[1.5rem] border border-ink/10 bg-white p-6 transition-colors hover:border-blue/40 sm:p-7">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <span className="text-[.63rem] font-bold uppercase tracking-[.14em] text-ink-muted">Fiche publique</span>
        <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[.65rem] font-bold ${isVerified ? "bg-mint text-[#17613b]" : "bg-apricot text-[#8b3d24]"}`}><span aria-hidden>{isVerified ? "✓" : "?"}</span>{isVerified ? "Fiche documentée" : "À confirmer"}</span>
      </div>
      <h2 className="break-words font-display text-[1.3rem] font-bold leading-7 text-ink transition-colors group-hover:text-blue">{name}</h2>
      <p className="mt-3 text-[.9rem] leading-6 text-ink-muted">{address || "Adresse publique non disponible"}</p>
      <p className="mt-4 mb-6 text-[.78rem] leading-6 text-ink-muted">{isVerified ? "Source administrative et vérification professionnelle conservées en historique." : "Source administrative publique ; statut professionnel à confirmer auprès du professionnel."}</p>
      <div className="mt-auto flex items-center justify-between gap-3 border-t border-ink/10 pt-5">
        <span className="min-w-0 break-words text-[.64rem] text-ink-muted">SIRET {card.establishment.siret}</span>
        <Link href={cabinetDirectoryPath(card)} aria-label={`Voir la fiche de ${name}`} className="inline-flex shrink-0 items-center gap-2 text-[.78rem] font-bold text-blue after:absolute after:inset-0 after:rounded-[1.5rem] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue">Voir la fiche <span aria-hidden className="flex h-9 w-9 items-center justify-center rounded-full bg-lilac transition-colors group-hover:bg-blue group-hover:text-white">↗</span></Link>
      </div>
    </article>
  );
}
