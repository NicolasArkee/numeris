import Link from "next/link";
import { Logo } from "@/components/Logo";
import { legalEntity } from "@/data/legal-entity";
import navigationJson from "@/data/skoria-v2/navigation.json";
import { AppConfig } from "@/utils/AppConfig";

type FooterLink = { href: string; label: string };
type FooterNavigation = {
  footer: Array<{ title: string; links: FooterLink[] }>;
  legal: FooterLink[];
};

const footerNavigation = navigationJson as FooterNavigation;

function FooterLinks({ links }: { links: { href: string; label: string }[] }) {
  return (
    <ul className="space-y-2.5">
      {links.map((link) => (
        <li key={link.href}>
          <Link
            href={link.href}
            className="text-[0.86rem] leading-6 text-white/66 transition-colors hover:text-white"
          >
            {link.label}
          </Link>
        </li>
      ))}
    </ul>
  );
}

export function SiteFooter() {
  return (
    <footer className="bg-brand-ink text-white">
      <div className="sk-container pb-9 pt-14 lg:pt-18">
        <div className="grid gap-12 border-b border-white/12 pb-14 md:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">
          <div>
            <Logo variant="onDark" size="md" />
            <p className="mt-4 max-w-sm text-[0.86rem] leading-7 text-white/65">
              Skoria aide à comparer les experts-comptables à partir de besoins métier, de critères explicites et de données publiques lorsqu’elles sont disponibles.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {["Comparateur indépendant", "Données publiques sourcées", "Gratuit et sans compte"].map((label) => (
                <span key={label} className="rounded-full border border-white/14 px-3 py-1.5 text-[0.68rem] text-white/68">
                  {label}
                </span>
              ))}
            </div>
          </div>
          {footerNavigation.footer.map((group) => (
            <div key={group.title}>
              <h3 className="sk-eyebrow mb-5 text-white/42">{group.title}</h3>
              <FooterLinks links={group.links} />
            </div>
          ))}
          <div>
            <h3 className="sk-eyebrow mb-5 text-white/42">Skoria</h3>
            <FooterLinks links={footerNavigation.legal} />
            <a
              href={`mailto:${AppConfig.email}`}
              className="mt-6 block font-mono text-[0.76rem] text-white/66 transition-colors hover:text-white"
            >
              {AppConfig.email}
            </a>
          </div>
        </div>

        <div className="flex flex-col gap-3 pt-7 text-[0.7rem] leading-5 text-white/42 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} {legalEntity.companyName} — Tous droits réservés.</p>
          <p>Les informations inconnues restent signalées comme étant à confirmer.</p>
        </div>
      </div>
    </footer>
  );
}
