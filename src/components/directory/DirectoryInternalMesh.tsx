import React from "react";
import Link from "next/link";
import type { Profession, Service } from "@/libs/db";
import { AppConfig } from "@/utils/AppConfig";
import { buildDirectoryProfileProfessionLinks, buildDirectoryProfileServiceLinks } from "./profile-v2-helpers";

export function DirectoryInternalMesh({ cityName, services, professions }: { cityName: string; services: Service[]; professions: Profession[] }) {
  const serviceLinks = buildDirectoryProfileServiceLinks(services);
  const professionLinks = buildDirectoryProfileProfessionLinks(professions, 8);
  if (!serviceLinks.length && !professionLinks.length) return null;

  return (
    <div id="preparer-sa-recherche" className="scroll-mt-32 space-y-6">
      {serviceLinks.length > 0 && <section className="rounded-[2rem] bg-navy p-6 text-white sm:p-8 lg:p-10">
        <div className="grid gap-5 lg:grid-cols-[1.1fr_.9fr] lg:items-end">
          <div>
            <p className="text-[.68rem] font-bold uppercase tracking-[.16em] text-mint">Définir votre mission</p>
            <h2 className="mt-4 font-display text-[clamp(1.8rem,3.5vw,2.6rem)] font-bold leading-[1.15] tracking-tight text-white">Missions comptables souvent recherchées à {cityName}</h2>
          </div>
          <p className="max-w-xl text-[.92rem] leading-7 text-white/75">Ces liens aident à explorer les besoins comptables courants. Ils ne constituent pas une promesse de service du cabinet listé.</p>
        </div>
        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {serviceLinks.map((link, index) => (
            <Link key={link.href} href={link.href} className="group flex min-h-28 items-center gap-4 rounded-[1.25rem] border border-white/15 bg-white/5 p-5 transition-colors hover:border-mint hover:bg-mint hover:text-navy focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-mint">
              <span aria-hidden className="self-start text-[.65rem] font-bold text-white/45 group-hover:text-navy/60">{String(index + 1).padStart(2, "0")}</span>
              <span className="min-w-0 flex-1 font-display text-[1.05rem] font-bold leading-6">{link.label}</span>
              <span aria-hidden className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10 text-lg transition-transform group-hover:-rotate-45 group-hover:bg-navy group-hover:text-mint">→</span>
            </Link>
          ))}
        </div>
        <Link href="/expertises" className="mt-7 inline-flex items-center gap-3 text-[.84rem] font-bold text-mint underline decoration-mint/40 underline-offset-4 hover:decoration-mint">Explorer toutes les expertises <span aria-hidden>↗</span></Link>
      </section>}
      {professionLinks.length > 0 && <section className="grid gap-7 rounded-[2rem] bg-mint p-6 sm:p-8 lg:grid-cols-[.8fr_1.2fr] lg:p-10">
        <div>
          <p className="text-[.68rem] font-bold uppercase tracking-[.16em] text-blue">Partir de votre métier</p>
          <h2 className="mt-4 font-display text-[clamp(1.8rem,3.5vw,2.6rem)] font-bold leading-[1.15] tracking-tight text-ink">Professions accompagnées par un expert-comptable</h2>
          <p className="mt-4 text-[.92rem] leading-7 text-ink-muted">Retrouvez les guides {AppConfig.name} par métier pour préparer vos questions avant de contacter un cabinet.</p>
          <Link href="/professions" className="mt-6 inline-flex items-center gap-3 text-[.84rem] font-bold text-blue underline underline-offset-4">Voir tous les métiers <span aria-hidden>↗</span></Link>
        </div>
        <div className="grid content-start gap-3 sm:grid-cols-2">
          {professionLinks.map((link) => (
            <Link key={link.href} href={link.href} className="group flex min-h-20 items-center justify-between gap-3 rounded-2xl border border-ink/10 bg-white/80 p-5 font-display text-[.93rem] font-bold leading-6 text-ink transition-colors hover:bg-blue hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue">
              {link.label}<span aria-hidden className="shrink-0 text-blue group-hover:text-white">↗</span>
            </Link>
          ))}
        </div>
      </section>}
    </div>
  );
}
