import { getSupabaseClient } from "@/libs/db/supabase";

// Compteurs HP en head-count exact PostgREST (count:'exact', head:true) —
// les méthodes listing de l'adaptateur post-filtrent en JS une fenêtre
// tronquée à 1 000 rows (filtre embed sans !inner) et sous-comptent
// massivement (constaté : Marseille 3, total 1 000). Ici : jointure !inner
// avec le même gate métier, comptage côté Postgres, zéro troncature.

const LISTING_GATE =
  "and(publish_status.eq.published,confidence_score.gte.85,oec_status.in.(verified,manual_verified)),and(publish_status.eq.review,confidence_score.gte.50,oec_status.in.(unverified,not_found,ambiguous))";

export async function getListingCabinetTotal(): Promise<number> {
  try {
    const { count, error } = await getSupabaseClient()
      .from("directory_cabinets")
      .select("*", { count: "exact", head: true })
      .eq("is_active", true)
      .or(LISTING_GATE);
    if (error) return 0;
    return count ?? 0;
  } catch {
    return 0;
  }
}

/** Nombre d'établissements listables d'une ville (gate cabinet en !inner). */
export async function getListingEstablishmentCountByCity(codeInsee: string): Promise<number> {
  try {
    const { count, error } = await getSupabaseClient()
      .from("directory_establishments")
      .select("id, cabinet:directory_cabinets!inner(id)", { count: "exact", head: true })
      .eq("city_code_insee", codeInsee)
      .eq("is_active", true)
      .eq("cabinet.is_active", true)
      .or(LISTING_GATE, { referencedTable: "cabinet" });
    if (error) return 0;
    return count ?? 0;
  } catch {
    return 0;
  }
}
