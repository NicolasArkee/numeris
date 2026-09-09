import { db } from "@/libs/db";

export async function getListingCabinetTotal(): Promise<number> {
  try {
    return await db.getDirectoryListingCabinetCount();
  } catch {
    return 0;
  }
}

/** Nombre de cabinets listables dans une ville selon le gate de l'annuaire. */
export async function getListingEstablishmentCountByCity(codeInsee: string): Promise<number> {
  try {
    return await db.getDirectoryListingCabinetCountByCity(codeInsee);
  } catch {
    return 0;
  }
}
