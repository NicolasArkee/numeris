import Link from "next/link";
import { db } from "@/libs/db";
import { cabinetDirectoryPath } from "@/components/directory/CabinetCard";
import {
  buildDirectoryAddress,
  directoryDisplayName,
  isDirectoryCabinetVerified,
} from "@/components/directory/profile-v2-helpers";
import { HomeCitySearch } from "./HomeCitySearch";
import { getListingCabinetTotal } from "./home-data";

/** Hero « registre » : promesse données publiques, recherche ville instantanée,
 *  compteurs réels (annuaire vivant), extrait de fiche réelle — aucun score
 *  fabriqué, aucun logo presse. */
export async function HomeHero() {
  const [cities, cabinetCount, topCards] = await Promise.all([
    db.getDirectoryListingCities().catch(() => []),
    getListingCabinetTotal(),
    db.getTopDirectoryListingCabinets(1).catch(() => []),
  ]);
  const sample = topCards[0];

  const stats: { value: string; label: string }[] = [
    { value: cabinetCount.toLocaleString("fr-FR"), label: "cabinets recensés" },
    { value: cities.length.toLocaleString("fr-FR"), label: "villes couvertes" },
    { value: "6", label: "simulateurs gratuits" },
    { value: "0 €", label: "pour vous, toujours" },
  ];

  return (
    <section className="relative overflow-hidden bg-brand-ink px-6 pt-20 pb-14 lg:px-12 lg:pt-28 lg:pb-16">
      {/* Texture registre : colonnes hairline + halo orange discret */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.55]"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(255,255,255,0.045) 1px, transparent 1px)",
          backgroundSize: "96px 100%",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-40 -bottom-48 h-130 w-130 rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(255,107,53,0.16) 0%, rgba(255,107,53,0) 62%)",
        }}
      />

      <div className="relative z-10 mx-auto max-w-328">
        <div className="grid items-start gap-14 lg:grid-cols-[1.35fr_1fr] lg:gap-20">
          <div>
            <p className="animate-fade-up mb-7 font-mono text-[0.7rem] uppercase tracking-[0.22em] text-accent-300">
              Comparateur indépendant · sources publiques RNE &amp; OEC
            </p>

            <h1 className="animate-fade-up mb-7 font-display text-[2.6rem] font-extrabold leading-[1.04] tracking-tight text-surface lg:text-[4.4rem]">
              Choisissez votre expert-comptable{" "}
              <span className="relative whitespace-nowrap">
                sur des faits
                <span
                  aria-hidden
                  className="absolute inset-x-0 bottom-[0.06em] -z-10 h-[0.28em] bg-accent-500"
                />
              </span>
              .
            </h1>

            <p className="animate-fade-up mb-9 max-w-xl text-[1.05rem] leading-relaxed text-white/80">
              Skoria recense les cabinets de toute la France à partir de données
              administratives publiques, compare les offres et affiche sa méthode.
              Pas de classement acheté, pas de commission cachée.
            </p>

            <div className="animate-fade-up">
              <HomeCitySearch cities={cities} />
            </div>

            {/* Recherches fréquentes — pattern annuaire (éducation par l'exemple) */}
            <div className="animate-fade-up mt-5 flex flex-wrap items-center gap-2">
              <span className="font-mono text-[0.62rem] uppercase tracking-[0.16em] text-white/40">
                Fréquent :
              </span>
              {[
                { label: "Expert-comptable Paris", href: "/expert-comptable/paris" },
                { label: "Expert-comptable Lyon", href: "/expert-comptable/lyon" },
                { label: "Tarifs 2026", href: "/ressources/prix-expert-comptable" },
                { label: "LMNP", href: "/guides/lmnp" },
              ].map((c) => (
                <Link
                  key={c.href}
                  href={c.href}
                  className="border border-white/15 px-3 py-1 text-[0.72rem] text-white/70 transition-colors hover:border-accent-500 hover:text-accent-300"
                >
                  {c.label}
                </Link>
              ))}
            </div>

            <dl className="animate-fade-up mt-9 grid max-w-xl grid-cols-2 gap-x-8 gap-y-5 border-t border-white/12 pt-6 sm:grid-cols-4">
              {stats.map((s) => (
                <div key={s.label}>
                  <dt className="sr-only">{s.label}</dt>
                  <dd className="font-mono text-[1.35rem] font-semibold tabular-nums text-surface">
                    {s.value}
                  </dd>
                  <dd className="mt-0.5 text-[0.7rem] uppercase tracking-[0.08em] text-white/55">
                    {s.label}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Extrait du registre — une fiche RÉELLE, pas un score inventé */}
          <aside className="animate-fade-up border border-white/15 bg-white/[0.04]">
            <p className="border-b border-white/12 px-6 py-3.5 font-mono text-[0.65rem] uppercase tracking-[0.2em] text-white/50">
              Extrait du registre
            </p>
            {sample ? (
              <div className="px-6 py-6">
                <p className="font-display text-[1.15rem] font-bold leading-snug text-surface">
                  {directoryDisplayName(sample)}
                </p>
                <p className="mt-1.5 text-[0.82rem] text-white/65">
                  {buildDirectoryAddress(sample)}
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <span
                    className={`border px-2.5 py-1 font-mono text-[0.62rem] uppercase tracking-[0.1em] ${
                      isDirectoryCabinetVerified(sample)
                        ? "border-success-500/50 text-success-500"
                        : "border-warning-500/50 text-warning-500"
                    }`}
                  >
                    {isDirectoryCabinetVerified(sample) ? "✓ Fiche documentée" : "? À confirmer"}
                  </span>
                  <span className="border border-white/15 px-2.5 py-1 font-mono text-[0.62rem] uppercase tracking-[0.1em] text-white/55">
                    SIRET {sample.establishment.siret}
                  </span>
                </div>
                <dl className="mt-5 space-y-2 border-t border-white/10 pt-4 text-[0.8rem]">
                  <div className="flex justify-between gap-4">
                    <dt className="text-white/50">Provenance</dt>
                    <dd className="text-right text-white/80">Registre administratif public</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-white/50">Statut affiché</dt>
                    <dd className="text-right text-white/80">Explicite sur chaque fiche</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-white/50">Avis fabriqués</dt>
                    <dd className="text-right font-semibold text-accent-300">Aucun</dd>
                  </div>
                </dl>
                <Link
                  href={cabinetDirectoryPath(sample)}
                  className="mt-6 inline-flex items-center gap-2 font-display text-[0.82rem] font-semibold text-accent-300 transition-colors hover:text-accent-500"
                >
                  Voir cette fiche →
                </Link>
              </div>
            ) : (
              <div className="px-6 py-6 text-[0.85rem] text-white/60">
                Annuaire en cours de constitution.
              </div>
            )}
            <Link
              href="/annuaire/experts-comptables"
              className="block border-t border-white/12 px-6 py-4 text-center font-display text-[0.82rem] font-semibold text-surface transition-colors hover:bg-white/[0.06]"
            >
              Parcourir tout l&apos;annuaire →
            </Link>
          </aside>
        </div>
      </div>
    </section>
  );
}
