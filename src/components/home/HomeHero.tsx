import Link from "next/link";
import { db } from "@/libs/db";
import { HomeCitySearch } from "./HomeCitySearch";
import { getListingCabinetTotal } from "./home-data";

/** Hero V2 « comparateur » : le verbe comparer partout, compteur réel dans le
 *  H1 (claim impossible pour les concurrents vendeurs), recherche ville, et un
 *  duel comparatif honnête en visuel signature — aucun score fabriqué. */
export async function HomeHero() {
  const [cities, cabinetCount] = await Promise.all([
    db.getDirectoryListingCities().catch(() => []),
    getListingCabinetTotal(),
  ]);

  const stats: { value: string; label: string }[] = [
    { value: cabinetCount.toLocaleString("fr-FR"), label: "cabinets comparés" },
    { value: cities.length.toLocaleString("fr-FR"), label: "villes couvertes" },
    { value: "6", label: "simulateurs gratuits" },
    { value: "0 €", label: "pour vous, toujours" },
  ];

  return (
    <section className="relative overflow-hidden bg-brand-ink px-6 pt-20 pb-14 lg:px-12 lg:pt-24 lg:pb-16">
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
        <div className="grid items-center gap-14 lg:grid-cols-[1.3fr_1fr] lg:gap-20">
          <div>
            <p className="animate-fade-up mb-7 font-mono text-[0.7rem] uppercase tracking-[0.22em] text-accent-300">
              Comparateur indépendant · sources publiques RNE &amp; OEC
            </p>

            <h1 className="animate-fade-up mb-7 font-display text-[2.5rem] font-extrabold leading-[1.05] tracking-tight text-surface lg:text-[4rem]">
              <span className="relative whitespace-nowrap">
                Comparez
                <span
                  aria-hidden
                  className="absolute inset-x-0 bottom-[0.06em] -z-10 h-[0.28em] bg-accent-500"
                />
              </span>{" "}
              les{" "}
              <span className="font-mono font-semibold tabular-nums text-accent-300">
                {cabinetCount > 0 ? cabinetCount.toLocaleString("fr-FR") : ""}
              </span>{" "}
              cabinets comptables de France.
            </h1>

            <p className="animate-fade-up mb-9 max-w-xl text-[1.05rem] leading-relaxed text-white/80">
              Statut vérifié, services réels, ordres de prix : Skoria compare les
              experts-comptables sur des données publiques — jamais sur des
              classements achetés ni des commissions cachées.
            </p>

            <div className="animate-fade-up">
              <HomeCitySearch cities={cities} />
            </div>

            {/* Comparaisons fréquentes — éducation par l'exemple */}
            <div className="animate-fade-up mt-5 flex flex-wrap items-center gap-2">
              <span className="font-mono text-[0.62rem] uppercase tracking-[0.16em] text-white/40">
                Souvent comparé :
              </span>
              {[
                { label: "Cabinets à Paris", href: "/expert-comptable/paris" },
                { label: "Cabinets à Lyon", href: "/expert-comptable/lyon" },
                { label: "Tarifs 2026", href: "/ressources/prix-expert-comptable" },
                { label: "En ligne vs local", href: "/ressources/expert-comptable-en-ligne" },
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

          {/* Duel comparatif — l'artefact signature d'un comparateur */}
          <aside className="animate-fade-up relative">
            <p className="border border-b-0 border-white/15 bg-white/[0.04] px-6 py-3.5 font-mono text-[0.65rem] uppercase tracking-[0.2em] text-white/50">
              Votre premier arbitrage
            </p>
            <div className="relative grid grid-cols-2 border border-white/15">
              {/* Badge VS central */}
              <span
                aria-hidden
                className="absolute top-1/2 left-1/2 z-10 -translate-x-1/2 -translate-y-1/2 border border-accent-500 bg-brand-ink px-2.5 py-1 font-mono text-[0.7rem] font-bold tracking-widest text-accent-500"
              >
                VS
              </span>

              <div className="border-r border-white/12 bg-white/[0.05] px-5 py-6">
                <p className="font-display text-[0.95rem] font-bold text-surface">
                  Expert-comptable en ligne
                </p>
                <dl className="mt-4 space-y-3.5 text-[0.78rem]">
                  <div>
                    <dt className="text-white/45">À partir de</dt>
                    <dd className="mt-0.5 font-mono text-[1rem] font-semibold tabular-nums text-accent-300">
                      59 € HT/mois
                    </dd>
                  </div>
                  <div>
                    <dt className="text-white/45">Échanges</dt>
                    <dd className="mt-0.5 text-white/85">100 % à distance, outils temps réel</dd>
                  </div>
                  <div>
                    <dt className="text-white/45">Idéal pour</dt>
                    <dd className="mt-0.5 text-white/85">Indépendants, TPE digitalisées</dd>
                  </div>
                </dl>
              </div>

              <div className="bg-white/[0.02] px-5 py-6">
                <p className="font-display text-[0.95rem] font-bold text-surface">
                  Cabinet de proximité
                </p>
                <dl className="mt-4 space-y-3.5 text-[0.78rem]">
                  <div>
                    <dt className="text-white/45">Honoraires</dt>
                    <dd className="mt-0.5 font-mono text-[1rem] font-semibold tabular-nums text-surface">
                      Sur devis
                    </dd>
                  </div>
                  <div>
                    <dt className="text-white/45">Échanges</dt>
                    <dd className="mt-0.5 text-white/85">Rendez-vous, terrain, réseau local</dd>
                  </div>
                  <div>
                    <dt className="text-white/45">Idéal pour</dt>
                    <dd className="mt-0.5 text-white/85">Commerces, dossiers complexes</dd>
                  </div>
                </dl>
              </div>
            </div>
            <div className="border border-t-0 border-white/15 bg-white/[0.04] px-6 py-4">
              <p className="text-[0.75rem] leading-relaxed text-white/55">
                Le bon choix dépend de votre dossier — comparez les deux dans votre ville.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Link
                  href="/annuaire/experts-comptables"
                  className="inline-flex items-center gap-2 bg-accent-500 px-4 py-2 font-display text-[0.78rem] font-bold text-brand-ink transition-colors hover:bg-accent-300"
                >
                  Comparer dans ma ville →
                </Link>
                <Link
                  href="/simulateurs/honoraires"
                  className="inline-flex items-center gap-2 border border-white/20 px-4 py-2 font-display text-[0.78rem] font-semibold text-white/85 transition-colors hover:border-accent-500 hover:text-accent-300"
                >
                  Estimer le budget
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
