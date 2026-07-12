import Link from "next/link";
import { db } from "@/libs/db";
import type { Service } from "@/libs/db";
import { getListingEstablishmentCountByCity } from "./home-data";

/** En-tête de section « registre » : index mono + titre + soulignement marqueur. */
export function SectionHead({
  index,
  eyebrow,
  title,
  sub,
  dark = false,
}: {
  index: string;
  eyebrow: string;
  title: string;
  sub?: string;
  dark?: boolean;
}) {
  return (
    <header className="mb-12 max-w-3xl">
      <p
        className={`mb-4 font-mono text-[0.68rem] uppercase tracking-[0.22em] ${
          dark ? "text-accent-300" : "text-accent-700"
        }`}
      >
        {index} — {eyebrow}
      </p>
      <h2
        className={`font-display text-[1.9rem] font-extrabold leading-[1.08] tracking-tight lg:text-[2.6rem] ${
          dark ? "text-surface" : "text-ink"
        }`}
      >
        {title}
      </h2>
      {sub && (
        <p className={`mt-4 text-[0.98rem] leading-relaxed ${dark ? "text-white/70" : "text-ink-muted"}`}>
          {sub}
        </p>
      )}
    </header>
  );
}

/** Bandeau méthode : les 4 engagements du comparateur, en filets registre. */
export function HomeMethodStrip() {
  const items = [
    {
      k: "Comparaison neutre",
      v: "Aucun cabinet ne nous appartient, aucun classement n'est vendu.",
    },
    {
      k: "Sources publiques",
      v: "RNE, registre OEC, INSEE — chaque fiche affiche sa provenance.",
    },
    {
      k: "Statut explicite",
      v: "Documenté ou à confirmer : le niveau de vérification est toujours visible.",
    },
    {
      k: "Gratuit pour vous",
      v: "Comparer est gratuit, sans compte et sans engagement.",
    },
  ];
  return (
    <section aria-label="Notre méthode" className="border-b border-border bg-surface px-6 lg:px-12">
      <div className="mx-auto grid max-w-328 divide-y divide-border sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-4 lg:divide-x">
        {items.map((item, i) => (
          <div key={item.k} className="py-7 lg:px-8 lg:first:pl-0 lg:last:pr-0">
            <p className="font-mono text-[0.62rem] uppercase tracking-[0.18em] text-ink-soft">
              {String(i + 1).padStart(2, "0")}
            </p>
            <p className="mt-2 font-display text-[0.95rem] font-bold text-ink">{item.k}</p>
            <p className="mt-1.5 text-[0.82rem] leading-relaxed text-ink-muted">{item.v}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

const TOP_CITY_SLUGS = [
  "paris", "marseille", "lyon", "toulouse",
  "nice", "bordeaux", "montpellier", "strasbourg",
];

/** L'annuaire ville par ville — compteurs réels, tuiles registre. */
export async function HomeVilles() {
  const tiles = (
    await Promise.all(
      TOP_CITY_SLUGS.map(async (slug) => {
        try {
          const city = await db.getDirectoryCityBySlug(slug);
          if (!city) return null;
          const count = await getListingEstablishmentCountByCity(city.code_insee);
          return { city, count };
        } catch {
          return null;
        }
      }),
    )
  ).filter((t): t is NonNullable<typeof t> => t !== null && t.count > 0);
  let cityTotal = 0;
  try {
    cityTotal = (await db.getDirectoryListingCities()).length;
  } catch {
    cityTotal = 0;
  }

  return (
    <section className="bg-bg px-6 py-20 lg:px-12 lg:py-24">
      <div className="mx-auto max-w-328">
        <SectionHead
          index="01"
          eyebrow="Par ville"
          title="Comparez les cabinets de votre ville"
          sub="Chaque ville met ses cabinets côte à côte : adresse, SIRET, provenance administrative, et — sur les fiches enrichies — les services identifiés sur le site officiel du cabinet."
        />
        <div className="grid grid-cols-2 border-t border-l border-border lg:grid-cols-4">
          {tiles.map(({ city, count }) => (
            <Link
              key={city.code_insee}
              href={`/expert-comptable/${city.slug}`}
              className="group border-r border-b border-border bg-surface p-6 transition-colors hover:bg-brand-50 lg:p-8"
            >
              <p className="font-mono text-[1.7rem] font-semibold tabular-nums text-ink lg:text-[2.1rem]">
                {count.toLocaleString("fr-FR")}
              </p>
              <p className="mt-1 text-[0.7rem] uppercase tracking-[0.1em] text-ink-soft">
                cabinets
              </p>
              <p className="mt-3 font-display text-[1rem] font-bold text-ink group-hover:text-brand-700">
                {city.name}
                <span aria-hidden className="ml-1.5 inline-block translate-x-0 text-accent-500 opacity-0 transition-all group-hover:translate-x-1 group-hover:opacity-100">
                  →
                </span>
              </p>
            </Link>
          ))}
        </div>
        <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
          <p className="text-[0.85rem] text-ink-muted">
            {cityTotal > 0 ? `${cityTotal.toLocaleString("fr-FR")} villes comparables — et le comparateur grandit chaque semaine.` : "Le comparateur grandit chaque semaine."}
          </p>
          <Link
            href="/annuaire/experts-comptables"
            className="inline-flex items-center gap-2 bg-brand-ink px-6 py-3 font-display text-[0.82rem] font-semibold text-surface transition-colors hover:bg-brand-900"
          >
            Comparer dans ma ville →
          </Link>
        </div>
      </div>
    </section>
  );
}

/** Expertises en liste-index éditoriale (données `services`). */
export function HomeExpertises({ services }: { services: Service[] }) {
  return (
    <section className="relative overflow-hidden bg-brand-ink px-6 py-20 lg:px-12 lg:py-24">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.5]"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(255,255,255,0.04) 1px, transparent 1px)",
          backgroundSize: "96px 100%",
        }}
      />
      <div className="relative z-10 mx-auto max-w-328">
        <SectionHead
          dark
          index="02"
          eyebrow="Critères"
          title="Ce que vous comparez vraiment"
          sub="Derrière « expert-comptable », six missions aux périmètres très différents. Connaître leurs livrables, c'est comparer les offres sur les bons critères."
        />
        <ol className="border-t border-white/12">
          {services.map((service, i) => (
            <li key={service.slug}>
              <Link
                href={`/expertises/${service.slug}`}
                className="group grid items-baseline gap-2 border-b border-white/12 py-6 transition-colors hover:bg-white/[0.04] lg:grid-cols-[5rem_1fr_2fr_3rem] lg:gap-8 lg:px-4"
              >
                <span className="font-mono text-[0.85rem] tabular-nums text-accent-300">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="font-display text-[1.15rem] font-bold text-surface group-hover:text-accent-300">
                  {service.title}
                </span>
                <span className="hidden text-[0.85rem] leading-relaxed text-white/60 lg:block">
                  {service.description}
                </span>
                <span aria-hidden className="hidden text-right text-accent-500 opacity-0 transition-opacity group-hover:opacity-100 lg:block">
                  →
                </span>
              </Link>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/** Guides à forte intention — points d'entrée éditoriaux (curation stable). */
const GUIDES = [
  { href: "/ressources/prix-expert-comptable", title: "Combien coûte un expert-comptable ?", tag: "Tarifs" },
  { href: "/ressources/expert-comptable-en-ligne", title: "En ligne ou cabinet de proximité : comment trancher", tag: "Comparatif" },
  { href: "/ressources/lettre-de-mission-expert-comptable", title: "Lire une lettre de mission avant de signer", tag: "Contrat" },
  { href: "/guides/lmnp", title: "LMNP : le guide fiscal de la location meublée", tag: "Immobilier" },
  { href: "/ressources/salaire-expert-comptable", title: "Salaire d'un expert-comptable : les repères", tag: "Métier" },
  { href: "/ressources/devenir-expert-comptable", title: "Devenir expert-comptable : le parcours complet", tag: "Métier" },
];

export function HomeGuides() {
  return (
    <section className="bg-bg px-6 py-20 lg:px-12 lg:py-24">
      <div className="mx-auto max-w-328">
        <SectionHead
          index="04"
          eyebrow="Comparatifs & guides"
          title="Comparez avec les bons repères"
          sub="Des comparatifs et des guides rédigés pour chiffrer, trancher et préparer votre premier échange — pas pour vendre."
        />
        <div className="grid gap-px border border-border bg-border md:grid-cols-2 lg:grid-cols-3">
          {GUIDES.map((g) => (
            <Link
              key={g.href}
              href={g.href}
              className="group flex min-h-36 flex-col justify-between bg-surface p-6 transition-colors hover:bg-brand-50"
            >
              <p className="font-mono text-[0.62rem] uppercase tracking-[0.18em] text-accent-700">
                {g.tag}
              </p>
              <p className="mt-3 font-display text-[1.02rem] font-bold leading-snug text-ink group-hover:text-brand-700">
                {g.title}
                <span aria-hidden className="ml-1.5 text-accent-500 opacity-0 transition-opacity group-hover:opacity-100">→</span>
              </p>
            </Link>
          ))}
        </div>
        <Link
          href="/ressources"
          className="mt-8 inline-flex items-center gap-2 font-display text-[0.85rem] font-semibold text-brand-700 transition-colors hover:text-accent-700"
        >
          Tous les guides et ressources →
        </Link>
      </div>
    </section>
  );
}

/** CTA final segmenté : visiteur vs professionnel (revendication de fiche). */
export function HomeDualCta() {
  return (
    <section className="border-t border-border bg-bg-muted px-6 py-14 lg:px-12">
      <div className="mx-auto grid max-w-328 gap-px overflow-hidden border border-border bg-border md:grid-cols-2">
        <div className="bg-surface p-8 lg:p-10">
          <p className="font-mono text-[0.62rem] uppercase tracking-[0.18em] text-accent-700">
            Vous cherchez un cabinet
          </p>
          <p className="mt-3 font-display text-[1.3rem] font-extrabold leading-snug text-ink">
            Comparez les experts-comptables de votre ville.
          </p>
          <Link
            href="/annuaire/experts-comptables"
            className="mt-5 inline-flex items-center gap-2 bg-brand-ink px-6 py-3 font-display text-[0.82rem] font-semibold text-surface transition-colors hover:bg-brand-900"
          >
            Lancer la comparaison →
          </Link>
        </div>
        <div className="bg-surface p-8 lg:p-10">
          <p className="font-mono text-[0.62rem] uppercase tracking-[0.18em] text-ink-soft">
            Vous êtes expert-comptable
          </p>
          <p className="mt-3 font-display text-[1.3rem] font-extrabold leading-snug text-ink">
            Votre fiche existe déjà — complétez-la ou corrigez-la.
          </p>
          <Link
            href="/contact?objet=revendication-fiche"
            className="mt-5 inline-flex items-center gap-2 border border-brand-ink px-6 py-3 font-display text-[0.82rem] font-semibold text-ink transition-colors hover:border-accent-500 hover:text-accent-700"
          >
            Revendiquer ma fiche →
          </Link>
        </div>
      </div>
    </section>
  );
}

/** Bande professions & secteurs — entrées pSEO par métier. */
export async function HomeProfessions() {
  let professions: { slug: string; name: string }[] = [];
  let secteurs: { slug: string; name: string }[] = [];
  try {
    professions = (await db.getProfessions())
      .sort((a, b) => b.volume - a.volume)
      .slice(0, 8);
    secteurs = await db.getSecteurs();
  } catch {
    // dégradation silencieuse
  }
  if (professions.length === 0 && secteurs.length === 0) return null;

  return (
    <section className="border-t border-border bg-surface px-6 py-16 lg:px-12">
      <div className="mx-auto max-w-328">
        <SectionHead
          index="05"
          eyebrow="Par métier"
          title="Comparez à activité comparable"
          sub="Un cabinet qui connaît votre métier se compare sur d'autres critères : obligations propres, outils, conventions."
        />
        <div className="flex flex-wrap gap-2">
          {professions.map((p) => (
            <Link
              key={p.slug}
              href={`/professions/${p.slug}`}
              className="border border-border bg-bg px-4 py-2 text-[0.85rem] text-ink transition-colors hover:border-accent-500 hover:text-accent-700"
            >
              {p.name}
            </Link>
          ))}
          {secteurs.map((s) => (
            <Link
              key={s.slug}
              href={`/secteurs/${s.slug}`}
              className="border border-border bg-bg px-4 py-2 text-[0.85rem] text-ink-muted transition-colors hover:border-accent-500 hover:text-accent-700"
            >
              {s.name}
            </Link>
          ))}
          <Link
            href="/professions"
            className="border border-brand-ink bg-brand-ink px-4 py-2 font-display text-[0.85rem] font-semibold text-surface transition-colors hover:bg-brand-900"
          >
            Toutes les professions →
          </Link>
        </div>
      </div>
    </section>
  );
}
