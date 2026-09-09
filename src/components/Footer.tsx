import Link from "next/link";
import { ContactButton } from "./ContactButton";
import { AppConfig } from "@/utils/AppConfig";
import { legalEntity } from "@/data/legal-entity";
import { Logo } from "./Logo";

const compare = [
  { href: "/annuaire/experts-comptables", label: "Annuaire complet" },
  { href: "/expertises", label: "Par expertise" },
  { href: "/secteurs", label: "Par secteur" },
  { href: "/professions", label: "Par profession" },
  { href: "/villes", label: "Par ville" },
  { href: "/departements", label: "Par département" },
];

const platform = [
  { href: "/qui-sommes-nous", label: "Qui sommes-nous" },
  { href: "/ressources", label: "Guides & ressources" },
  { href: "/simulateurs", label: "Simulateurs" },
  { href: "/contact", label: "Contact" },
];

const legal = [
  { href: "/mentions-legales", label: "Mentions légales" },
  { href: "/confidentialite", label: "Confidentialité" },
  { href: "/cgu", label: "CGU" },
];

const trustBadges = [
  "Comparateur indépendant",
  "Données publiques sourcées",
  "Statut des informations visible",
  "Consultation libre et sans compte",
];

export function Footer() {
  return (
    <footer className="bg-brand-ink text-surface">
      <div className="mx-auto max-w-328 px-6 pb-12 pt-20 lg:px-12">
        <div className="mb-12 grid gap-12 border-b border-white/10 pb-16 md:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr_1fr]">
          <div>
            <Logo variant="onDark" size="md" />
            <p className="mt-3 font-display text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-accent-300">
              {AppConfig.tagline}
            </p>
            <p className="mt-5 max-w-sm text-[0.8125rem] leading-relaxed text-white/65">
              {AppConfig.description}
            </p>

            <div className="mt-7 grid grid-cols-1 gap-2.5">
              {trustBadges.map((badge) => (
                <span
                  key={badge}
                  className="inline-flex items-center gap-2 px-1 py-1 text-[0.75rem] font-medium text-white/80"
                >
                  <span aria-hidden className="text-accent-500">✓</span>
                  {badge}
                </span>
              ))}
            </div>
          </div>

          <div>
            <h4 className="mb-5 font-display text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-white/50">
              Comparer
            </h4>
            <ul className="flex flex-col gap-2.5">
              {compare.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-[0.875rem] text-white/70 transition-colors hover:text-surface"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-5 font-display text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-white/50">
              Plateforme
            </h4>
            <ul className="flex flex-col gap-2.5">
              {platform.map((link) =>
                link.href === "/contact" ? (
                  // TECH-03 : /contact en bouton non-crawlable (découverte via sitemap)
                  <li key={link.href}>
                    <ContactButton
                      ariaLabel="Contact — formulaire"
                      className="text-left text-[0.875rem] text-white/70 transition-colors hover:text-surface"
                    >
                      {link.label}
                    </ContactButton>
                  </li>
                ) : (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-[0.875rem] text-white/70 transition-colors hover:text-surface"
                    >
                      {link.label}
                    </Link>
                  </li>
                ),
              )}
            </ul>
          </div>

          <div>
            <h4 className="mb-5 font-display text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-white/50">
              Légal
            </h4>
            <ul className="flex flex-col gap-2.5">
              {legal.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-[0.875rem] text-white/70 transition-colors hover:text-surface"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>

            <div className="mt-7">
              <p className="font-display text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-white/50">
                Contact
              </p>
              <a href={`mailto:${AppConfig.email}`} className="mt-2 block font-mono text-[0.8125rem] text-white/70 transition-colors hover:text-surface">
                {AppConfig.email}
              </a>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 text-[0.75rem] text-white/45">
          <span>
            © {new Date().getFullYear()} {legalEntity.companyName} — Tous droits réservés.
          </span>
        </div>
      </div>
    </footer>
  );
}
