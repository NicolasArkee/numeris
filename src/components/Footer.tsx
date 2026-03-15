import Link from "next/link";
import { AppConfig } from "@/utils/AppConfig";

const expertises = [
  { href: "/nos-expertises/comptabilite", label: "Comptabilité" },
  { href: "/nos-expertises/fiscalite", label: "Fiscalité" },
  { href: "/nos-expertises/social", label: "Gestion sociale" },
  { href: "/nos-expertises/creation-entreprise", label: "Création" },
  { href: "/nos-expertises/conseil-gestion", label: "Conseil en gestion" },
  { href: "/nos-expertises/audit", label: "Audit" },
];

const cabinet = [
  { href: "/equipe", label: "L'équipe" },
  { href: "/a-propos", label: "À propos" },
  { href: "/formules", label: "Nos formules" },
  { href: "/ressources", label: "Ressources" },
  { href: "/contact", label: "Contact" },
];

export function Footer() {
  return (
    <footer className="bg-encre px-6 pb-10 pt-20 lg:px-[4.5rem]">
      <div className="mx-auto max-w-[82rem]">
        {/* Top */}
        <div className="mb-10 grid gap-10 border-b border-white/[0.07] pb-16 md:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr] lg:gap-16">
          {/* Brand */}
          <div>
            <div className="mb-1 flex items-baseline gap-2 font-serif text-[1.5rem] font-normal text-blanc">
              {AppConfig.name}
              <span className="font-sans text-[0.65rem] font-light uppercase tracking-widest text-white/30">
                {AppConfig.tagline}
              </span>
            </div>
            <div className="my-4 h-px w-8 bg-or" />
            <p className="mb-6 max-w-[260px] text-[0.78rem] leading-relaxed text-white/[0.28]">
              {AppConfig.description}
            </p>
            <div className="space-y-2">
              <p className="flex items-center gap-2 text-[0.8rem] text-white/35">
                <span className="min-w-[48px] text-[0.6rem] font-bold uppercase tracking-[0.07em] text-or">
                  Tél
                </span>
                {AppConfig.phone}
              </p>
              <p className="flex items-center gap-2 text-[0.8rem] text-white/35">
                <span className="min-w-[48px] text-[0.6rem] font-bold uppercase tracking-[0.07em] text-or">
                  Email
                </span>
                {AppConfig.email}
              </p>
            </div>
          </div>

          {/* Expertises */}
          <div>
            <h4 className="mb-5 text-[0.62rem] font-bold uppercase tracking-[0.12em] text-white/25">
              Expertises
            </h4>
            <ul className="flex flex-col gap-2.5">
              {expertises.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-[0.8rem] text-white/[0.38] transition-colors hover:text-white/80"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Cabinet */}
          <div>
            <h4 className="mb-5 text-[0.62rem] font-bold uppercase tracking-[0.12em] text-white/25">
              Le cabinet
            </h4>
            <ul className="flex flex-col gap-2.5">
              {cabinet.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-[0.8rem] text-white/[0.38] transition-colors hover:text-white/80"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Certifications */}
          <div>
            <h4 className="mb-5 text-[0.62rem] font-bold uppercase tracking-[0.12em] text-white/25">
              Certifications
            </h4>
            <div className="flex flex-col gap-2.5">
              <span className="flex items-center gap-2 border border-or/20 bg-or/10 px-3 py-1.5 text-[0.65rem] font-semibold text-or-clair">
                ✓ Ordre des Experts-Comptables
              </span>
              <span className="flex items-center gap-2 border border-or/20 bg-or/10 px-3 py-1.5 text-[0.65rem] font-semibold text-or-clair">
                ✓ CNCC — Commissariat aux comptes
              </span>
              <span className="flex items-center gap-2 border border-or/20 bg-or/10 px-3 py-1.5 text-[0.65rem] font-semibold text-or-clair">
                ✓ Certification ISO 9001
              </span>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="flex flex-wrap items-center justify-between gap-4 text-[0.68rem] text-white/[0.18]">
          <span>
            © {new Date().getFullYear()} {AppConfig.name} {AppConfig.tagline}.
            Tous droits réservés.
          </span>
          <div className="flex gap-7">
            <Link
              href="/mentions-legales"
              className="text-white/[0.18] transition-colors hover:text-white/45"
            >
              Mentions légales
            </Link>
            <Link
              href="/politique-confidentialite"
              className="text-white/[0.18] transition-colors hover:text-white/45"
            >
              Politique de confidentialité
            </Link>
          </div>
          <div className="flex items-center gap-2.5">
            <span className="border border-white/15 px-2.5 py-0.5 text-[0.6rem] font-bold uppercase tracking-[0.06em] text-white/25">
              OEC
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
