// ─── ServicesGrid ───
// Grille de maillage interne vers les pages expertises, contextualisée par la
// page hôte (profession, secteur, ville, département). Extraite des templates
// professions/secteurs/villes — doit être rendue dans le chemin DB ET le
// fallback statique pour ne jamais perdre le maillage /expertises/{svc}/{dim}.

import type { Service } from "@/libs/db";
import { Icon } from "./Icon";

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
      <h2 className="mb-6 font-display text-[1.5rem] font-bold text-ink">
        {title}
      </h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {services.map((svc) => (
          <a
            key={svc.slug}
            href={hrefBuilder(svc)}
            className="group border border-border-soft bg-surface px-6 py-5 transition-all hover:-translate-y-0.5 hover:border-accent-500 hover:shadow-md"
          >
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-md border border-brand-100 bg-brand-50 text-brand-700">
              <Icon name={svc.slug} size={20} />
            </div>
            <h3 className="mb-1 text-[0.95rem] font-medium text-ink group-hover:text-accent-700">
              {cardTitleBuilder ? cardTitleBuilder(svc) : svc.title}
            </h3>
            <p className="text-[0.72rem] text-ink-muted">{svc.description}</p>
          </a>
        ))}
      </div>
    </div>
  );
}
