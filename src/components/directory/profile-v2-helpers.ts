import type {
  DirectoryCabinetCard,
  Profession,
  Service,
} from "@/libs/db";

export type DirectoryMapPoint = {
  latitude: number;
  longitude: number;
  source: "establishment" | "city";
};

export type DirectoryFactRow = {
  label: string;
  value: string;
};

export type DirectoryProfileLink = {
  label: string;
  href: string;
};

export type DirectoryFaqItem = {
  question: string;
  answer: string;
};

const PROFILE_SERVICE_ORDER = [
  "comptabilite",
  "fiscalite",
  "social",
  "creation-entreprise",
  "conseil-gestion",
  "audit",
];

export function directoryDisplayName(card: DirectoryCabinetCard): string {
  return card.cabinet.display_name ?? card.cabinet.legal_name;
}

export function isDirectoryCabinetVerified(card: DirectoryCabinetCard): boolean {
  return (
    card.cabinet.oec_status === "verified"
    || card.cabinet.oec_status === "manual_verified"
  );
}

export function buildDirectoryRobots(
  card: DirectoryCabinetCard,
): { index: false; follow: true } | undefined {
  return isDirectoryCabinetVerified(card)
    ? undefined
    : { index: false, follow: true };
}

export function buildDirectoryMapPoint(
  card: DirectoryCabinetCard,
): DirectoryMapPoint | null {
  const establishmentLatitude = card.establishment.latitude;
  const establishmentLongitude = card.establishment.longitude;
  if (establishmentLatitude != null && establishmentLongitude != null) {
    return {
      latitude: establishmentLatitude,
      longitude: establishmentLongitude,
      source: "establishment",
    };
  }

  if (card.city?.latitude != null && card.city.longitude != null) {
    return {
      latitude: card.city.latitude,
      longitude: card.city.longitude,
      source: "city",
    };
  }

  return null;
}

export function buildOpenStreetMapDirectionsUrl(point: DirectoryMapPoint): string {
  const encoded = encodeURIComponent(`${point.latitude},${point.longitude}`);
  return `https://www.openstreetmap.org/directions?to=${encoded}`;
}

export function buildOpenStreetMapViewUrl(point: DirectoryMapPoint): string {
  const delta = 0.006;
  const left = point.longitude - delta;
  const right = point.longitude + delta;
  const top = point.latitude + delta;
  const bottom = point.latitude - delta;
  return `https://www.openstreetmap.org/export/embed.html?bbox=${left}%2C${bottom}%2C${right}%2C${top}&layer=mapnik&marker=${point.latitude}%2C${point.longitude}`;
}

export function formatDirectoryDate(value: string | null): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value.split("T")[0]?.replaceAll("-", "/") ?? value;
  }
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

export function buildDirectoryAddress(card: DirectoryCabinetCard): string {
  return [
    card.establishment.address_line1,
    card.establishment.address_line2,
    [card.establishment.postal_code, card.establishment.city_name]
      .filter(Boolean)
      .join(" "),
  ]
    .filter(Boolean)
    .join(", ");
}

function sourceLabel(sourceKey: string | null): string {
  if (sourceKey === "api-recherche-entreprises") {
    return "Recherche Entreprises / Sirene";
  }
  return sourceKey ?? "Source administrative publique";
}

export function buildDirectoryFactRows(
  card: DirectoryCabinetCard,
): DirectoryFactRow[] {
  const rows: Array<DirectoryFactRow | null> = [
    { label: "SIRET", value: card.establishment.siret },
    card.cabinet.siren ? { label: "SIREN", value: card.cabinet.siren } : null,
    card.cabinet.naf_code
      ? { label: "Code NAF / APE", value: card.cabinet.naf_code }
      : null,
    card.cabinet.legal_form
      ? { label: "Forme juridique", value: card.cabinet.legal_form }
      : null,
    {
      label: "Statut administratif",
      value:
        card.cabinet.is_active === 1 && card.establishment.is_active === 1
          ? "Actif"
          : "Inactif",
    },
    { label: "Source", value: sourceLabel(card.establishment.source_key) },
    card.establishment.retrieved_at
      ? {
          label: "Date de recuperation",
          value: formatDirectoryDate(card.establishment.retrieved_at)
            ?? card.establishment.retrieved_at,
        }
      : null,
  ];

  return rows.filter((row): row is DirectoryFactRow => Boolean(row?.value));
}

export function buildDirectoryProfileServiceLinks(
  services: Service[],
): DirectoryProfileLink[] {
  const bySlug = new Map(services.map((service) => [service.slug, service]));
  return PROFILE_SERVICE_ORDER.flatMap((slug) => {
    const service = bySlug.get(slug);
    return service
      ? [{ label: service.title, href: `/expertises/${service.slug}` }]
      : [];
  });
}

export function buildDirectoryProfileProfessionLinks(
  professions: Profession[],
  limit = 8,
): DirectoryProfileLink[] {
  return [...professions]
    .sort((a, b) => b.volume - a.volume || a.name.localeCompare(b.name, "fr"))
    .slice(0, limit)
    .map((profession) => ({
      label: profession.name,
      href: `/professions/${profession.slug}`,
    }));
}

export function buildDirectoryFaqItems(
  card: DirectoryCabinetCard,
): DirectoryFaqItem[] {
  const cityName = card.city?.name ?? card.establishment.city_name ?? "cette ville";
  const verified = isDirectoryCabinetVerified(card);

  return [
    {
      question: verified
        ? "Que signifie fiche documentee ?"
        : "Que signifie statut a confirmer ?",
      answer: verified
        ? "Skoria affiche ce statut lorsqu'une source fiable ou une verification manuelle documentee confirme les informations principales de la fiche."
        : "Ce statut signifie que la fiche provient d'une source administrative publique, mais que le statut professionnel doit etre confirme aupres du professionnel concerne.",
    },
    {
      question: `Comment choisir un expert-comptable a ${cityName} ?`,
      answer:
        "Comparez le statut professionnel, les informations legales, la proximite, les missions recherchees et les besoins de votre activite avant de contacter un cabinet.",
    },
    {
      question: "Quelles informations legales sont affichees sur cette fiche ?",
      answer:
        "La fiche peut afficher le SIRET, le SIREN, le code NAF / APE, l'adresse publique, le statut administratif et la source de recuperation lorsque ces donnees sont disponibles.",
    },
    {
      question:
        "Une information est incorrecte ou je souhaite supprimer ma fiche, comment faire ?",
      answer:
        "Vous pouvez demander une correction, une mise a jour ou une opposition en contactant Skoria avec le SIRET de la fiche concernee.",
    },
  ];
}
