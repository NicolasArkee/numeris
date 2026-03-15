import Link from "next/link";
import { AppConfig } from "@/utils/AppConfig";

const links = [
  { href: "/nos-expertises", label: "Nos expertises" },
  { href: "/equipe", label: "L'équipe" },
  { href: "/formules", label: "Formules" },
  { href: "/ressources", label: "Ressources" },
  { href: "/a-propos", label: "À propos" },
];

export function Nav() {
  return (
    <header className="sticky top-0 z-50 flex h-[72px] items-center justify-between border-b border-white/5 bg-nuit px-6 lg:px-[4.5rem]">
      <Link
        href="/"
        className="flex items-baseline gap-2 font-serif text-[1.375rem] font-normal tracking-tight text-blanc no-underline"
      >
        {AppConfig.name}
        <span className="font-sans text-[0.65rem] font-light uppercase tracking-widest text-white/30">
          {AppConfig.tagline}
        </span>
      </Link>

      <nav className="hidden items-center gap-10 lg:flex">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="text-[0.8rem] font-normal text-white/45 transition-colors hover:text-white/85"
          >
            {link.label}
          </Link>
        ))}
      </nav>

      <div className="flex items-center gap-5">
        <span className="hidden text-[0.78rem] text-white/45 transition-colors hover:text-or md:inline">
          <span className="mr-1 text-or">☎</span>
          {AppConfig.phone}
        </span>
        <Link
          href="/contact"
          className="bg-or px-5 py-2.5 font-sans text-[0.75rem] font-semibold text-blanc transition-colors hover:bg-[#b08844]"
        >
          Prendre rendez-vous
        </Link>
      </div>
    </header>
  );
}
