import type { Metadata } from "next";
import Link from "next/link";
import { AppConfig } from "@/utils/AppConfig";
import { BreadcrumbJsonLd } from "@/components/JsonLd";

export const metadata: Metadata = {
  title: `Contact | ${AppConfig.name}`,
  description: `Contactez ${AppConfig.name}, cabinet d'expertise comptable à Paris. Premier rendez-vous gratuit, devis sous 24h.`,
  alternates: { canonical: `${AppConfig.url}/contact` },
};

export default function ContactPage() {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Accueil", url: "/" },
          { name: "Contact", url: "/contact" },
        ]}
      />

      {/* Hero */}
      <section className="relative overflow-hidden bg-nuit px-6 py-20 lg:px-[4.5rem] lg:py-24">
        <div className="grid-bg pointer-events-none absolute inset-0 opacity-35" />
        <div className="radial-or pointer-events-none absolute -bottom-1/4 -right-[8%] h-[560px] w-[560px]" />

        <div className="relative z-10 mx-auto max-w-[82rem]">
          <nav aria-label="Fil d'Ariane" className="mb-8">
            <ol className="flex items-center gap-1.5 text-[0.72rem] text-white/30">
              <li><Link href="/" className="hover:text-or">Accueil</Link></li>
              <li className="flex items-center gap-1.5"><span>/</span><span className="text-white/50">Contact</span></li>
            </ol>
          </nav>

          <div className="mb-6 flex items-center gap-3.5">
            <span className="block h-px w-7 bg-or" />
            <span className="text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-or">
              Parlons de votre projet
            </span>
          </div>
          <h1 className="mb-6 font-serif text-[2.75rem] font-light leading-[1.08] tracking-tight text-blanc lg:text-[4rem]">
            Contactez-nous
          </h1>
          <p className="max-w-2xl text-[0.95rem] leading-relaxed text-white/40">
            Premier entretien gratuit et sans engagement. Nous vous répondons sous 24 heures.
          </p>
        </div>
      </section>

      {/* Contact content */}
      <section className="bg-creme px-6 py-20 lg:px-[4.5rem]">
        <div className="mx-auto grid max-w-[82rem] gap-12 lg:grid-cols-2 lg:gap-20">
          {/* Form */}
          <div className="border border-pierre-12 border-t-2 border-t-or bg-blanc p-9">
            <h2 className="mb-2 font-serif text-[1.5rem] font-light text-encre">
              Demande de rendez-vous
            </h2>
            <p className="mb-7 text-[0.82rem] text-ardoise">
              Remplissez ce formulaire et nous vous recontactons rapidement.
            </p>

            <form className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-[0.68rem] font-bold uppercase tracking-[0.08em] text-ardoise">
                    Nom complet
                  </label>
                  <input
                    type="text"
                    placeholder="Votre nom"
                    className="h-11 w-full border border-pierre-12 bg-blanc px-3.5 text-[0.85rem] text-encre placeholder:text-pierre-37 focus:border-or focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-[0.68rem] font-bold uppercase tracking-[0.08em] text-ardoise">
                    Téléphone
                  </label>
                  <input
                    type="tel"
                    placeholder="06 XX XX XX XX"
                    className="h-11 w-full border border-pierre-12 bg-blanc px-3.5 text-[0.85rem] text-encre placeholder:text-pierre-37 focus:border-or focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-[0.68rem] font-bold uppercase tracking-[0.08em] text-ardoise">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="email@entreprise.fr"
                  className="h-11 w-full border border-pierre-12 bg-blanc px-3.5 text-[0.85rem] text-encre placeholder:text-pierre-37 focus:border-or focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-[0.68rem] font-bold uppercase tracking-[0.08em] text-ardoise">
                  Votre besoin
                </label>
                <select className="h-11 w-full cursor-pointer border border-pierre-12 bg-blanc px-3.5 text-[0.85rem] text-encre">
                  <option value="">Sélectionnez un service</option>
                  <option>Comptabilité générale</option>
                  <option>Conseil fiscal</option>
                  <option>Gestion sociale & paie</option>
                  <option>Création d&apos;entreprise</option>
                  <option>Conseil en gestion</option>
                  <option>Audit & commissariat</option>
                  <option>Autre</option>
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-[0.68rem] font-bold uppercase tracking-[0.08em] text-ardoise">
                  Message (optionnel)
                </label>
                <textarea
                  rows={4}
                  placeholder="Décrivez brièvement votre situation..."
                  className="w-full border border-pierre-12 bg-blanc px-3.5 py-3 text-[0.85rem] text-encre placeholder:text-pierre-37 focus:border-or focus:outline-none"
                />
              </div>
              <button
                type="submit"
                className="mt-2 w-full bg-or py-4 text-[0.88rem] font-semibold text-blanc transition-colors hover:bg-[#b08844]"
              >
                Envoyer ma demande →
              </button>
              <p className="text-center text-[0.68rem] text-ardoise">
                Réponse sous 24h · Sans engagement
              </p>
            </form>
          </div>

          {/* Info */}
          <div className="space-y-8">
            <div>
              <h2 className="mb-6 font-serif text-[1.75rem] font-light text-encre">
                Nos coordonnées
              </h2>
              <div className="space-y-5">
                <div className="border border-pierre-12 bg-blanc p-6">
                  <span className="mb-1 block text-[0.68rem] font-bold uppercase tracking-[0.1em] text-or-fonce">
                    Adresse
                  </span>
                  <p className="text-[0.92rem] text-encre">{AppConfig.address}</p>
                </div>
                <div className="border border-pierre-12 bg-blanc p-6">
                  <span className="mb-1 block text-[0.68rem] font-bold uppercase tracking-[0.1em] text-or-fonce">
                    Téléphone
                  </span>
                  <p className="text-[0.92rem] font-medium text-encre">{AppConfig.phone}</p>
                </div>
                <div className="border border-pierre-12 bg-blanc p-6">
                  <span className="mb-1 block text-[0.68rem] font-bold uppercase tracking-[0.1em] text-or-fonce">
                    Email
                  </span>
                  <p className="text-[0.92rem] text-encre">{AppConfig.email}</p>
                </div>
                <div className="border border-pierre-12 bg-blanc p-6">
                  <span className="mb-1 block text-[0.68rem] font-bold uppercase tracking-[0.1em] text-or-fonce">
                    Horaires
                  </span>
                  <p className="text-[0.92rem] text-encre">Lundi – Vendredi : 9h00 – 18h30</p>
                </div>
              </div>
            </div>

            {/* Trust */}
            <div className="border border-pierre-12 border-l-2 border-l-or bg-blanc p-7">
              <h3 className="mb-3 text-[1rem] font-semibold text-encre">
                Pourquoi choisir {AppConfig.name} ?
              </h3>
              <ul className="space-y-2 text-[0.85rem] text-ardoise">
                <li className="flex items-start gap-2">
                  <span className="mt-0.5 text-or">✓</span>
                  Inscrit à l&apos;Ordre des Experts-Comptables
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-0.5 text-or">✓</span>
                  500+ clients accompagnés depuis {AppConfig.foundedYear}
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-0.5 text-or">✓</span>
                  Équipe de 15 collaborateurs spécialisés
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-0.5 text-or">✓</span>
                  98% de taux de fidélisation client
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
