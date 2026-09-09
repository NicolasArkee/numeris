import React from "react";
import Link from "next/link";
import type { DirectoryCabinetCard } from "@/libs/db";
import { buildDirectoryAddress, directoryDisplayName, isDirectoryCabinetVerified } from "./profile-v2-helpers";
import { cabinetDirectoryPath } from "./CabinetCard";

export function DirectoryRelatedCabinets({ cityName, citySlug, cabinets }: { cityName: string; citySlug: string; cabinets: DirectoryCabinetCard[] }) {
  if (cabinets.length === 0) return null;
  return (
    <section className="rounded-[2rem] bg-apricot p-6 sm:p-8 lg:p-10">
      <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
        <div className="max-w-2xl"><p className="text-[.68rem] font-bold uppercase tracking-[.16em] text-blue">Poursuivre la comparaison</p><h2 className="mt-4 font-display text-[clamp(1.8rem,3.5vw,2.6rem)] font-bold leading-[1.15] tracking-tight text-ink">Autres cabinets comptables à {cityName}</h2></div>
        <Link href={`/expert-comptable/${citySlug}`} prefetch={false} className="inline-flex w-fit shrink-0 items-center gap-3 rounded-full bg-navy px-5 py-3 text-[.8rem] font-bold text-white transition-colors hover:bg-blue">Voir plus de cabinets à {cityName}<span aria-hidden>↗</span></Link>
      </div>
      <div className="mt-8 grid gap-5 md:grid-cols-3">
        {cabinets.map((card) => {
          const verified = isDirectoryCabinetVerified(card);
          const name = directoryDisplayName(card);
          const initials = name.split(/\s+/).filter(Boolean).slice(0, 2).map((word) => word[0]).join("");
          return <Link key={card.establishment.siret} href={cabinetDirectoryPath(card)} aria-label={`Voir la fiche de ${name}`} className="group flex min-w-0 flex-col overflow-hidden rounded-[1.4rem] border border-ink/10 bg-white transition-colors hover:border-blue/40 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue">
            <div className="relative aspect-[16/9] overflow-hidden bg-navy">
              {card.sourcePreviewImageUrl ? <img src={card.sourcePreviewImageUrl} alt={`Aperçu du site de ${name}`} className="h-full w-full object-cover object-top transition-transform duration-500 motion-safe:group-hover:scale-105" loading="lazy" /> : <div className="flex h-full flex-col justify-between p-6"><span className="font-display text-4xl font-bold tracking-tight text-lilac" aria-hidden>{initials}</span><span className="text-[.6rem] font-bold uppercase tracking-[.12em] text-white/65">Fiche publique · {cityName}</span></div>}
            </div>
            <div className="flex flex-1 flex-col p-5 sm:p-6">
              <span className={`mb-4 w-fit rounded-full px-3 py-1 text-[.64rem] font-bold ${verified ? "bg-mint text-[#17613b]" : "bg-apricot text-[#8b3d24]"}`}>{verified ? "Documentée" : "À confirmer"}</span>
              <h3 className="break-words font-display text-[1.2rem] font-bold leading-6 text-ink transition-colors group-hover:text-blue">{name}</h3>
              <p className="mt-3 text-[.86rem] leading-6 text-ink-muted">{buildDirectoryAddress(card) || "Adresse publique non disponible"}</p>
              <div className="mt-auto flex items-center justify-between gap-3 pt-6 text-[.8rem] font-bold text-blue">Voir la fiche<span aria-hidden className="flex h-9 w-9 items-center justify-center rounded-full bg-lilac transition-colors group-hover:bg-blue group-hover:text-white">↗</span></div>
            </div>
          </Link>;
        })}
      </div>
    </section>
  );
}
