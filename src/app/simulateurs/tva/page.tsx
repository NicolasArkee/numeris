import { permanentRedirect } from "next/navigation";

/** Alias court conservé pour les liens et habitudes de recherche existants. */
export default function TvaSimulatorAliasPage() {
  permanentRedirect("/simulateurs/calcul-tva");
}
