import Link from "next/link";
import { db } from "@/libs/db";
import type { DirectoryCity } from "@/libs/db";
import { CabinetCard, cabinetDirectoryPath } from "@/components/directory/CabinetCard";
import { ItemListJsonLd } from "@/components/JsonLd";

/** Bloc annuaire local des LP keyword géo : extrait de cabinets réels
 *  (sources administratives publiques) + lien fort vers la page annuaire
 *  ville. Rend null si la ville n'a aucun établissement listable. */
export async function KeywordLocalCabinets({
  city,
  limit = 6,
}: {
  city: DirectoryCity;
  limit?: number;
}) {
  let cards: Awaited<ReturnType<typeof db.getDirectoryListingCabinetsByCity>> = [];
  let totalCount = 0;
  try {
    cards = await db.getDirectoryListingCabinetsByCity(city.code_insee, limit);
    totalCount = await db.getDirectoryListingCabinetCountByCity(city.code_insee);
  } catch {
    return null;
  }
  if (cards.length === 0) return null;

  const annuaireUrl = `/expert-comptable/${city.slug}`;

  return (
    <section className="mb-12" id="cabinets">
      <ItemListJsonLd
        name={`Cabinets d'expertise comptable à ${city.name}`}
        description={`Extrait des cabinets comptables recensés à ${city.name} à partir de sources administratives publiques.`}
        items={cards.map((card) => ({
          name: card.cabinet.display_name ?? card.cabinet.legal_name,
          url: cabinetDirectoryPath(card),
        }))}
        numberOfItems={totalCount}
        url={annuaireUrl}
      />
      <div className="mb-8 flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="font-mono text-[.65rem] font-bold uppercase tracking-[.18em] text-blue">Explorer les établissements</p>
          <h2 className="mt-4 max-w-3xl text-balance text-[clamp(2rem,4vw,3.3rem)] font-semibold leading-tight text-navy">
            Cabinets d&apos;expertise comptable à {city.name}
          </h2>
        </div>
        <p className="rounded-full bg-mint px-4 py-2 text-[.75rem] font-semibold text-navy">
          {totalCount} cabinet{totalCount > 1 ? "s" : ""} recensé{totalCount > 1 ? "s" : ""} · sources publiques
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <CabinetCard key={card.establishment.siret} card={card} />
        ))}
      </div>
      <div className="mt-6">
        <Link
          href={annuaireUrl}
          className="inline-flex min-h-12 items-center justify-center gap-3 rounded-full bg-blue px-6 py-3 text-[.82rem] font-bold text-white transition-colors hover:bg-navy"
        >
          {totalCount > 1 ? `Voir les ${totalCount} cabinets` : "Voir la fiche cabinet"} à {city.name} →
        </Link>
      </div>
    </section>
  );
}
