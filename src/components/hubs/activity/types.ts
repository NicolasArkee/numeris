export interface ProfessionHubEntry {
  slug: string;
  name: string;
  description: string | null;
  obligations: string | null;
}

export interface ProfessionHubCategory {
  slug: string;
  name: string;
  description: string | null;
  icon: string;
  professions: ProfessionHubEntry[];
}

export interface SectorHubEntry {
  slug: string;
  name: string;
  description: string | null;
}

export interface ServiceHubEntry {
  slug: string;
  title: string;
  description: string;
  icon: string;
  orderIndex: number;
}

export interface ActivityLinkEntry {
  slug: string;
  name: string;
  description: string | null;
}
