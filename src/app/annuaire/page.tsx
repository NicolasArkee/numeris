import { permanentRedirect } from "next/navigation";

/** Point d’entrée mémorisable vers le moteur principal de l’annuaire. */
export default function DirectoryEntryPage() {
  permanentRedirect("/annuaire/experts-comptables");
}
