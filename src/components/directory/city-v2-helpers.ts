import type {
  DirectoryCabinetCard,
  DirectoryCity,
} from "@/libs/db";
import type {
  DirectoryFaqItem,
  DirectoryMapPoint,
  DirectoryProfileLink,
} from "./profile-v2-helpers";
import { isDirectoryCabinetVerified } from "./profile-v2-helpers";

export type DirectoryCityStats = {
  totalCount: number;
  displayedCount: number;
  verifiedCount: number;
  candidateCount: number;
  hasMoreResults: boolean;
};

export function buildDirectoryCityRobots(
  verifiedCount: number,
): { index: false; follow: true } | undefined {
  return verifiedCount > 0 ? undefined : { index: false, follow: true };
}

export function buildDirectoryCityStats(
  cabinets: DirectoryCabinetCard[],
  totalCount: number,
  verifiedCount = cabinets.filter(isDirectoryCabinetVerified).length,
): DirectoryCityStats {
  return {
    totalCount,
    displayedCount: cabinets.length,
    verifiedCount,
    candidateCount: Math.max(totalCount - verifiedCount, 0),
    hasMoreResults: totalCount > cabinets.length,
  };
}

export function buildDirectoryCityMapPoint(
  city: DirectoryCity,
): DirectoryMapPoint | null {
  if (city.latitude == null || city.longitude == null) return null;
  return {
    latitude: city.latitude,
    longitude: city.longitude,
    source: "city",
  };
}

export function buildNearbyDirectoryCityLinks(
  cities: DirectoryCity[],
  currentCity: DirectoryCity,
  limit = 8,
): DirectoryProfileLink[] {
  return cities
    .filter((city) => city.code_insee !== currentCity.code_insee)
    .sort((a, b) => {
      const aSameDepartment =
        a.department_code != null
        && a.department_code === currentCity.department_code;
      const bSameDepartment =
        b.department_code != null
        && b.department_code === currentCity.department_code;
      if (aSameDepartment !== bSameDepartment) return aSameDepartment ? -1 : 1;
      return b.population - a.population || a.name.localeCompare(b.name, "fr");
    })
    .slice(0, limit)
    .map((city) => ({
      label: city.name,
      href: `/expert-comptable/${city.slug}`,
    }));
}

export function buildDirectoryCityFaqItems(
  city: DirectoryCity,
  stats: DirectoryCityStats,
): DirectoryFaqItem[] {
  const countLabel = `${stats.totalCount} cabinet${stats.totalCount > 1 ? "s" : ""}`;

  return [
    {
      question: `Comment choisir un expert-comptable a ${city.name} ?`,
      answer:
        "Comparez le statut professionnel, les informations legales publiques, la proximite, les missions recherchees et les besoins de votre activite avant de contacter un cabinet.",
    },
    {
      question: `Pourquoi certaines fiches de ${city.name} sont a confirmer ?`,
      answer:
        "Une fiche a confirmer provient d'une source administrative publique, mais Skoria n'a pas documente tous les elements de statut professionnel. Cette limite est donc affichee explicitement.",
    },
    {
      question: `Quelles donnees peut-on verifier publiquement pour les cabinets a ${city.name} ?`,
      answer:
        "Selon les donnees disponibles, la page peut afficher le SIRET, le SIREN, le code NAF / APE, l'adresse publique, le statut administratif et la source de recuperation.",
    },
    {
      question: `Combien de cabinets comptables sont listes a ${city.name} ?`,
      answer: `Skoria liste actuellement ${countLabel} candidat${stats.totalCount > 1 ? "s" : ""} ou documente${stats.totalCount > 1 ? "s" : ""} a ${city.name}. Les fiches candidates restent en noindex tant que leur statut professionnel n'est pas suffisamment documente.`,
    },
  ];
}
