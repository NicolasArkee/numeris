import { unstable_cache } from "next/cache";
import { ContactButton } from "./ContactButton";
import { db } from "@/libs/db";
import { Logo } from "./Logo";
import { MobileMenu } from "./MobileMenu";
import { MegaMenu, type MegaMenuConfig } from "./MegaMenu";

// Top selections are editorial picks — hardcoded for performance (no DB calls
// for every SSG page). Update this list when the editorial focus shifts.
const TOP_PROFESSIONS: { slug: string; name: string }[] = [
  { slug: "medecins-generalistes", name: "Médecins" },
  { slug: "infirmiers-liberaux", name: "Infirmiers libéraux" },
  { slug: "avocats", name: "Avocats" },
  { slug: "restaurateurs-traditionnels", name: "Restaurateurs" },
  { slug: "agences-immobilieres", name: "Agences immobilières" },
  { slug: "artisans-batiment", name: "Artisans du BTP" },
  { slug: "freelances-it", name: "Freelances IT" },
  { slug: "coiffeurs", name: "Coiffeurs" },
];

const TOP_SECTEURS: { slug: string; name: string }[] = [
  { slug: "restauration", name: "Restauration" },
  { slug: "immobilier", name: "Immobilier" },
  { slug: "btp", name: "BTP" },
  { slug: "e-commerce", name: "E-commerce" },
  { slug: "sante", name: "Santé" },
  { slug: "conseil", name: "Conseil" },
  { slug: "industrie", name: "Industrie" },
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
  { href: "/simulateurs", label: "Outils" },
  { href: "/ressources", label: "Guides" },
];

const annuaireMenu: MegaMenuConfig = {
  label: "Annuaire",
  layout: "links",
  sections: [
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
    {
      title: "Par ville",
      items: TOP_VILLES.map((c) => ({
        label: c.name,
        href: `/expert-comptable/${c.slug}`,
      })),
      seeAll: { label: "Tout l'annuaire", href: "/annuaire/experts-comptables" },
    },
  ],
};

// Services come from Supabase (only 6 rows, fast) — cached for 1h so SSG
// builds touch the DB only once.
const getComparerMenu = unstable_cache(
  async (): Promise<MegaMenuConfig> => {
    const services = await db.getServices();
    return {
      label: "Comparer",
      layout: "cards",
      sections: [
        {
          title: "Par expertise",
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
  ["nav-comparer-menu-v2"],
  { revalidate: 3600 },
);

export async function Nav() {
  const comparerMenu = await getComparerMenu();

  // Flat list for the mobile burger drawer (mega-menu items collapse to top-level hubs there).
  const flatLinks = [
    { href: "/annuaire/experts-comptables", label: "Annuaire" },
    { href: "/expertises", label: "Comparer" },
    ...simpleLinks,
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-surface/95 backdrop-blur supports-backdrop-filter:bg-surface/80">
      <div className="mx-auto flex h-16 max-w-328 items-center gap-6 px-6 lg:px-12">
        <Logo size="sm" />

        <MegaMenu menus={[annuaireMenu, comparerMenu]} simpleLinks={simpleLinks} />

        <div className="ml-auto flex items-center gap-3 lg:ml-0">
          <span className="hidden font-body text-[0.8125rem] text-ink-soft xl:inline">
            <span aria-hidden className="mr-1.5 text-brand-700">·</span>
            100 % gratuit
          </span>
          <ContactButton
            className="hidden items-center gap-1.5 rounded-md bg-accent-500 px-5 py-2.5 font-display text-[0.875rem] font-semibold text-surface shadow-sm transition-colors hover:bg-accent-700 sm:inline-flex"
            ariaLabel="Comparer — accéder au formulaire"
          >
            Comparer
            <span aria-hidden>→</span>
          </ContactButton>
          <MobileMenu links={flatLinks} />
        </div>
      </div>
    </header>
  );
}
