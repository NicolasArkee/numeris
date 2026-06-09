// ─── ServicesGrid ───
// Grille de maillage interne vers les pages expertises, contextualisée par la
// page hôte (profession, secteur, ville, département). Extraite des templates
// professions/secteurs/villes — doit être rendue dans le chemin DB ET le
// fallback statique pour ne jamais perdre le maillage /expertises/{svc}/{dim}.

import type { Service } from "@/libs/db";

interface ServicesGridProps {
  title: string;
  services: Service[];
  hrefBuilder: (svc: Service) => string;
  /** Titre de carte contextualisé (ex: "Comptabilité à Paris"). Défaut : svc.title. */
  cardTitleBuilder?: (svc: Service) => string;
}

export function ServicesGrid({ title, services, hrefBuilder, cardTitleBuilder }: ServicesGridProps) {
  if (services.length === 0) return null;
  return (
    <div className="mb-12">
      <h2 className="mb-6 font-serif text-[1.5rem] font-light text-encre">
        {title}
      </h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {services.map((svc) => (
          <a
            key={svc.slug}
            href={hrefBuilder(svc)}
            className="group border border-pierre-12 bg-blanc px-6 py-5 transition-all hover:-translate-y-0.5 hover:border-or hover:shadow-md"
          >
            <span className="mb-2 block text-[1.1rem]">{svc.icon}</span>
            <h3 className="mb-1 text-[0.95rem] font-medium text-encre group-hover:text-or-fonce">
              {cardTitleBuilder ? cardTitleBuilder(svc) : svc.title}
            </h3>
            <p className="text-[0.72rem] text-ardoise">{svc.description}</p>
          </a>
        ))}
      </div>
    </div>
  );
}
