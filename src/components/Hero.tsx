import Link from "next/link";
import { db } from "@/libs/db";
import {
  cabinetDirectoryPath,
} from "@/components/directory/CabinetCard";
import {
  buildDirectoryAddress,
  directoryDisplayName,
  isDirectoryCabinetVerified,
} from "@/components/directory/profile-v2-helpers";

const TOP_LIMIT = 3;

function formatScore(confidence: number): string {
  return (confidence / 10).toFixed(1);
}

/**
 * Hero homepage Skoria — comparateur. Search bar prominent + Top 3 classement
 * en card droite branché sur la DB (getTopDirectoryListingCabinets).
 * Pour les pages secondaires, utiliser PageHero.
 */
export async function Hero() {
  const topCabinets = await db.getTopDirectoryListingCabinets(TOP_LIMIT);
  const publishedCount = await db.getPublishedDirectoryCabinetCount();
  const hasRanking = topCabinets.length >= TOP_LIMIT;

  return (
    <section className="relative overflow-hidden bg-brand-ink px-6 py-20 lg:px-12 lg:py-28">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-32 -bottom-32 h-130 w-130 rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(255,107,53,0.18) 0%, rgba(255,107,53,0) 60%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 -left-20 h-105 w-105 rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(44,93,184,0.32) 0%, rgba(44,93,184,0) 60%)",
        }}
      />

      <div className="relative z-10 mx-auto grid max-w-328 items-center gap-14 lg:grid-cols-[1.3fr_1fr] lg:gap-20">
        <div>
          <div className="animate-fade-up mb-7 inline-flex items-center gap-2 rounded-full border border-accent-500/30 bg-accent-500/10 px-4 py-1.5">
            <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-accent-500" />
            <span className="font-display text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-accent-300">
              Comparateur indépendant · 100 % gratuit
            </span>
          </div>

          <h1 className="animate-fade-up mb-6 font-display text-[2.5rem] font-extrabold leading-[1.05] tracking-tight text-surface lg:text-[4.25rem]">
            Comparez les{" "}
            <span className="text-accent-500">experts-comptables</span> vérifiés en Europe
          </h1>

          <p className="animate-fade-up mb-8 max-w-xl text-[1.0625rem] leading-relaxed text-white/75">
            Notation indépendante, sources publiques (RNE, registre OEC), méthode éditoriale documentée. Trouvez le bon professionnel pour votre activité, sans engagement.
          </p>

          <form
            action="/annuaire/experts-comptables"
            method="get"
            className="animate-fade-up mb-7 flex flex-col gap-2 rounded-xl bg-surface p-2 shadow-lg sm:flex-row"
          >
            <div className="flex flex-1 items-center gap-3 px-4">
              <span aria-hidden className="font-mono text-[1.125rem] text-brand-700">
                ⌕
              </span>
              <input
                type="text"
                name="q"
                placeholder="Code postal, ville ou activité"
                className="w-full bg-transparent py-3 font-body text-[0.9375rem] text-ink placeholder:text-ink-soft focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-accent-500 px-6 py-3 font-display text-[0.9375rem] font-semibold text-surface transition-colors hover:bg-accent-700"
            >
              Comparer
              <span aria-hidden>→</span>
            </button>
          </form>

          <div className="animate-fade-up flex flex-wrap items-center gap-x-6 gap-y-2 text-[0.8125rem] text-white/65">
            <span className="inline-flex items-center gap-1.5">
              <span aria-hidden className="text-[0.875rem] text-success-500">✓</span>
              <span>Sources <strong className="font-mono font-semibold text-surface">RNE + OEC</strong></span>
            </span>
            <span aria-hidden className="hidden h-3 w-px bg-white/20 sm:block" />
            <span>
              <strong className="font-mono font-semibold text-surface">
                {publishedCount > 0 ? publishedCount.toLocaleString("fr-FR") : "—"}
              </strong>{" "}
              cabinets vérifiés
            </span>
            <span aria-hidden className="hidden h-3 w-px bg-white/20 sm:block" />
            <span><strong className="font-mono font-semibold text-surface">95</strong> départements couverts</span>
          </div>
        </div>

        <aside className="relative rounded-2xl border border-white/10 bg-white/5 p-7 backdrop-blur-sm">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <p className="font-display text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-accent-300">
                Top classement
              </p>
              <h3 className="mt-1 font-display text-[1.125rem] font-semibold text-surface">
                {hasRanking ? "Les mieux notés cette semaine" : "Annuaire en construction"}
              </h3>
            </div>
            <span className="rounded-md bg-accent-500 px-2.5 py-1 font-display text-[0.625rem] font-bold uppercase tracking-wider text-surface">
              TOP {TOP_LIMIT}
            </span>
          </div>

          {hasRanking ? (
            <ol className="space-y-3">
              {topCabinets.map((card, index) => {
                const rank = String(index + 1).padStart(2, "0");
                const name = directoryDisplayName(card);
                const city = card.city?.name ?? card.establishment.city_name ?? "";
                const verified = isDirectoryCabinetVerified(card);
                const score = formatScore(card.cabinet.confidence_score);

                return (
                  <li key={card.establishment.siret}>
                    <Link
                      href={cabinetDirectoryPath(card)}
                      className="flex items-center gap-4 rounded-lg border border-white/10 bg-white/4 p-4 transition-colors hover:border-white/25 hover:bg-white/10"
                    >
                      <span className="font-mono text-[1.5rem] font-bold text-accent-300">
                        {rank}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="truncate font-display text-[0.9375rem] font-semibold text-surface">
                          {name}
                        </p>
                        <p className="mt-0.5 flex items-center gap-1.5 text-[0.75rem] text-white/55">
                          {city && <span className="truncate">{city}</span>}
                          {verified && (
                            <>
                              <span aria-hidden>·</span>
                              <span className="inline-flex items-center gap-0.5 text-success-500">
                                <span aria-hidden>✓</span>OEC
                              </span>
                            </>
                          )}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="font-mono text-[1.25rem] font-bold leading-none text-surface">
                          {score}
                        </div>
                        <div className="font-display text-[0.625rem] uppercase tracking-wider text-white/50">
                          /10
                        </div>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ol>
          ) : (
            <div className="space-y-4 rounded-lg border border-dashed border-white/15 bg-white/5 p-5">
              <p className="text-[0.875rem] leading-6 text-white/75">
                Le comparateur est en cours d'enrichissement. La méthode éditoriale et les sources sont déjà publiées ; le classement complet sera disponible dès la fin de la qualification des fiches.
              </p>
              <Link
                href="/contact?objet=cabinet-listing"
                className="inline-flex items-center gap-1.5 font-display text-[0.875rem] font-semibold text-accent-300 transition-colors hover:text-accent-500"
              >
                Demander à être listé
                <span aria-hidden>→</span>
              </Link>
            </div>
          )}

          <Link
            href="/annuaire/experts-comptables"
            className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-white/15 bg-white/5 px-4 py-3 font-display text-[0.875rem] font-semibold text-surface transition-colors hover:border-white/30 hover:bg-white/10"
          >
            Voir tout l'annuaire
            <span aria-hidden>→</span>
          </Link>
        </aside>
      </div>
    </section>
  );
}
