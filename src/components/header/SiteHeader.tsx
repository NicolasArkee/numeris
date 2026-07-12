import Link from "next/link";
import { unstable_cache } from "next/cache";
import { db } from "@/libs/db";
import { Logo } from "@/components/Logo";
import { MobileMenu } from "@/components/MobileMenu";
import { MegaMenu, type MegaMenuConfig } from "@/components/MegaMenu";
import { getListingCabinetTotal } from "@/components/home/home-data";

// ─── Header V2 « comparateur » ───────────────────────────────────────────────
// Bandeau data (compteurs réels, défile) + barre principale sticky. Le CTA
// « Comparer → » pointe vers le produit (annuaire), plus vers le formulaire.
// Réutilise MegaMenu / MobileMenu tels quels.

const TOP_PROFESSIONS: { slug: string; name: string }[] = [
  { slug: "medecins", name: "Médecins" },
  { slug: "infirmiers-liberaux", name: "Infirmiers libéraux" },
  { slug: "avocats", name: "Avocats" },
  { slug: "restaurateurs-traditionnels", name: "Restaurateurs" },
  { slug: "agents-immobiliers", name: "Agents immobiliers" },
  { slug: "macons", name: "Artisans du BTP" },
  { slug: "developpeurs-web", name: "Freelances IT" },
  { slug: "coiffeurs", name: "Coiffeurs" },
];

const TOP_SECTEURS: { slug: string; name: string }[] = [
  { slug: "restauration", name: "Restauration" },
  { slug: "immobilier", name: "Immobilier" },
  { slug: "btp", name: "BTP" },
  { slug: "commerce", name: "Commerce" },
  { slug: "profession-liberale", name: "Professions libérales" },
  { slug: "association", name: "Associations" },
  { slug: "transport", name: "Transport" },
  { slug: "start-up", name: "Start-up" },
];

const TOP_VILLES: { slug: string; name: string }[] = [
  { slug: "paris", name: "Paris" },
  { slug: "lyon", name: "Lyon" },
  { slug: "marseille", name: "Marseille" },
  { slug: "toulouse", name: "Toulouse" },
  { slug: "bordeaux", name: "Bordeaux" },
  { slug: "nantes", name: "Nantes" },
  { slug: "lille", name: "Lille" },
  { slug: "nice", name: "Nice" },
];

const simpleLinks = [
  { href: "/ressources/prix-expert-comptable", label: "Tarifs" },
  { href: "/simulateurs", label: "Simulateurs" },
  { href: "/ressources", label: "Guides" },
];

const annuaireMenu: MegaMenuConfig = {
  label: "Annuaire",
  layout: "links",
  sections: [
    {
      title: "Par ville",
      items: TOP_VILLES.map((c) => ({
        label: c.name,
        href: `/expert-comptable/${c.slug}`,
      })),
      seeAll: { label: "Comparer dans ma ville", href: "/annuaire/experts-comptables" },
    },
    {
      title: "Par profession",
      items: TOP_PROFESSIONS.map((p) => ({
        label: p.name,
        href: `/professions/${p.slug}`,
      })),
      seeAll: { label: "Toutes les professions", href: "/professions" },
    },
    {
      title: "Par secteur",
      items: TOP_SECTEURS.map((s) => ({
        label: s.name,
        href: `/secteurs/${s.slug}`,
      })),
      seeAll: { label: "Tous les secteurs", href: "/secteurs" },
    },
  ],
};

const getExpertisesMenu = unstable_cache(
  async (): Promise<MegaMenuConfig> => {
    const services = await db.getServices();
    return {
      label: "Expertises",
      layout: "cards",
      sections: [
        {
          title: "Les missions à comparer",
          items: services.map((s) => ({
            label: s.title,
            description: s.description,
            icon: s.slug,
            href: `/expertises/${s.slug}`,
          })),
          seeAll: { label: "Toutes les expertises", href: "/expertises" },
        },
      ],
    };
  },
  ["header-expertises-menu-v1"],
  { revalidate: 3600 },
);

const getHeaderCounts = unstable_cache(
  async (): Promise<{ cabinets: number; villes: number }> => {
    const [cabinets, cities] = await Promise.all([
      getListingCabinetTotal(),
      db.getDirectoryListingCities().catch(() => []),
    ]);
    return { cabinets, villes: cities.length };
  },
  ["header-counts-v1"],
  { revalidate: 86400 },
);

export async function SiteHeader() {
  const [expertisesMenu, counts] = await Promise.all([
    getExpertisesMenu(),
    getHeaderCounts().catch(() => ({ cabinets: 0, villes: 0 })),
  ]);

  const flatLinks = [
    { href: "/annuaire/experts-comptables", label: "Annuaire" },
    { href: "/expertises", label: "Expertises" },
    ...simpleLinks,
  ];

  return (
    <>
      {/* Bandeau data — défile (non sticky) */}
      <div className="bg-brand-ink px-6 lg:px-12">
        <div className="mx-auto flex h-8 max-w-328 items-center justify-between gap-4 overflow-hidden">
          <p className="truncate font-mono text-[0.62rem] uppercase tracking-[0.14em] text-white/60">
            {counts.cabinets > 0 ? (
              <>
                <span className="text-accent-300">{counts.cabinets.toLocaleString("fr-FR")}</span>{" "}
                cabinets comparés
                <span aria-hidden className="mx-2 text-white/25">·</span>
                <span className="text-accent-300">{counts.villes.toLocaleString("fr-FR")}</span>{" "}
                villes
                <span aria-hidden className="mx-2 hidden text-white/25 sm:inline">·</span>
                <span className="hidden sm:inline">Sources publiques RNE &amp; OEC</span>
              </>
            ) : (
              <span>Sources publiques RNE &amp; OEC</span>
            )}
          </p>
          <p className="shrink-0 font-mono text-[0.62rem] uppercase tracking-[0.14em] text-white/60">
            <span className="hidden md:inline">Comparateur indépendant · </span>
            <span className="text-surface">100 % gratuit</span>
          </p>
        </div>
      </div>

      {/* Barre principale — sticky */}
      <header className="sticky top-0 z-50 border-b border-border bg-surface/95 backdrop-blur supports-backdrop-filter:bg-surface/80">
        <div className="mx-auto flex h-16 max-w-328 items-center gap-6 px-6 lg:px-12">
          <Logo size="sm" />

          <MegaMenu menus={[annuaireMenu, expertisesMenu]} simpleLinks={simpleLinks} />

          <div className="ml-auto flex items-center gap-3 lg:ml-0">
            <Link
              href="/annuaire/experts-comptables"
              className="hidden items-center gap-1.5 bg-accent-500 px-5 py-2.5 font-display text-[0.875rem] font-semibold text-brand-ink shadow-sm transition-colors hover:bg-accent-300 sm:inline-flex"
              aria-label="Comparer les cabinets de ma ville"
            >
              Comparer
              <span aria-hidden>→</span>
            </Link>
            <MobileMenu links={flatLinks} />
          </div>
        </div>
      </header>
    </>
  );
}
