import Link from "next/link";
import { unstable_cache } from "next/cache";
import { db } from "@/libs/db";
import { Logo } from "@/components/Logo";
import { getListingCabinetTotal } from "@/components/home/home-data";
import { BriefTrigger } from "@/components/journey/BriefTrigger";
import navigationJson from "@/data/skoria-v2/navigation.json";
import {
  DesktopNavigation,
  type DesktopNavigationMenu,
} from "./DesktopNavigation";
import { MobileHeaderMenu, type MobileHeaderGroup } from "./MobileHeaderMenu";

type NavigationConfig = {
  primary: Array<{
    id: string;
    label: string;
    href: string;
    description: string;
    links: Array<{ label: string; href: string }>;
  }>;
  briefCta: { label: string; action: "open-brief" };
};

const navigation = navigationJson as NavigationConfig;

const menus: DesktopNavigationMenu[] = navigation.primary.map((group) => ({
  label: group.label,
  href: group.href,
  layout: "links",
  sections: [
    {
      title: group.description,
      items: group.links,
      seeAll: { label: `Explorer ${group.label.toLowerCase()}`, href: group.href },
    },
  ],
}));

const mobileGroups: MobileHeaderGroup[] = navigation.primary.map((group) => ({
  id: group.id,
  href: group.href,
  label: group.label,
  description: group.description,
  links: group.links,
}));

const getHeaderCounts = unstable_cache(
  async (): Promise<{ cabinets: number; cities: number }> => {
    const [cabinets, cities] = await Promise.all([
      getListingCabinetTotal(),
      db.getDirectoryListingCities().catch(() => []),
    ]);
    return { cabinets, cities: cities.length };
  },
  ["header-counts-v2"],
  { revalidate: 86_400 },
);

export async function SiteHeader() {
  const counts = await getHeaderCounts().catch(() => ({ cabinets: 0, cities: 0 }));
  const coverageLabel = counts.cabinets > 0
    ? `${counts.cabinets.toLocaleString("fr-FR")} cabinets · ${counts.cities.toLocaleString("fr-FR")} villes`
    : "Annuaire national · Sources publiques";

  return (
    <header
      data-site-header
      className="sticky top-0 z-60 border-b border-ink/10 bg-paper/94 shadow-[0_8px_30px_rgba(7,29,60,.055)] backdrop-blur-xl supports-backdrop-filter:bg-paper/88"
    >
      <div className="mx-auto flex h-18 max-w-[90rem] items-center gap-3 px-5 sm:px-6 lg:h-22 lg:gap-4 lg:px-10">
        <div className="flex shrink-0 items-center gap-4">
          <Logo size="md" />
          <div className="hidden border-l border-ink/12 pl-4 min-[1500px]:block" aria-label="Couverture de l’annuaire">
            <p className="text-[.57rem] font-bold uppercase tracking-[.18em] text-blue">Comparateur indépendant</p>
            <p className="mt-1 font-mono text-[.58rem] text-ink-muted">{coverageLabel}</p>
          </div>
        </div>

        <DesktopNavigation menus={menus} simpleLinks={[]} />

        <div className="ml-auto flex shrink-0 items-center gap-2 lg:ml-0">
          <Link
            href="/annuaire/experts-comptables"
            className="hidden min-h-11 items-center justify-center gap-2 rounded-full border border-ink/16 bg-white px-4 font-display text-[.76rem] font-semibold text-navy transition-colors hover:border-navy hover:bg-navy hover:text-white xl:inline-flex"
          >
            <svg aria-hidden width="15" height="15" viewBox="0 0 20 20" fill="none"><circle cx="8.5" cy="8.5" r="5.5" stroke="currentColor" strokeWidth="1.5"/><path d="m13 13 4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
            Annuaire
          </Link>
          <BriefTrigger className="hidden min-h-11 items-center justify-center gap-2 rounded-full bg-orange py-1.5 pl-4 pr-1.5 font-display text-[.76rem] font-semibold text-navy transition-transform hover:-translate-y-0.5 min-[360px]:inline-flex lg:pl-5">
            <span className="lg:hidden">Mon brief</span>
            <span className="hidden lg:inline">{navigation.briefCta.label}</span>
            <span aria-hidden className="flex h-8 w-8 items-center justify-center rounded-full bg-navy text-white">↗</span>
          </BriefTrigger>
          <MobileHeaderMenu groups={mobileGroups} coverageLabel={coverageLabel} />
        </div>
      </div>
    </header>
  );
}
