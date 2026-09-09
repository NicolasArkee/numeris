/**
 * Vue « devanture » d'un établissement.
 *
 * - Avec NEXT_PUBLIC_GOOGLE_MAPS_EMBED_KEY : iframe Maps Embed API en mode
 *   Street View (gratuit, usage illimité, conforme ToS Google — les images
 *   Street View ne doivent PAS être stockées/servies depuis nos serveurs).
 * - Sans clé : lien profond Google Maps ouvrant le panorama à la position de
 *   l'établissement (aucune clé requise).
 *
 * Rend null si l'établissement n'est pas géocodé.
 */
import type { DirectoryEstablishment } from "@/libs/db";

export function DirectoryStreetView({
  establishment,
  cabinetName,
}: {
  establishment: DirectoryEstablishment;
  cabinetName: string;
}) {
  const { latitude, longitude } = establishment;
  if (latitude == null || longitude == null) return null;

  const embedKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_EMBED_KEY;
  const panoDeepLink = `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${latitude},${longitude}`;

  return (
    <div className="mt-6 rounded-[1.5rem] bg-lilac p-5 sm:p-6">
      <h3 className="mb-3 font-display text-[0.95rem] font-bold text-ink">
        Devanture et environnement
      </h3>
      {embedKey ? (
        <div className="overflow-hidden rounded-[1.25rem] border border-ink/10">
          <iframe
            title={`Vue de la devanture de ${cabinetName}`}
            src={`https://www.google.com/maps/embed/v1/streetview?key=${embedKey}&location=${latitude},${longitude}&fov=80`}
            className="h-64 w-full lg:h-80"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
          />
        </div>
      ) : (
        <a
          href={panoDeepLink}
          target="_blank"
          rel="nofollow noopener noreferrer"
          className="group flex items-center justify-between gap-4 rounded-xl border border-ink/10 bg-white px-5 py-5 transition-colors hover:border-blue"
        >
          <span>
            <span className="block text-[0.9rem] font-medium text-ink">
              Voir la devanture sur Google&nbsp;Maps
            </span>
            <span className="mt-1 block text-[0.75rem] text-ink-muted">
              Street View à l&apos;adresse de l&apos;établissement — s&apos;ouvre dans un nouvel onglet.
            </span>
          </span>
          <span aria-hidden className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue text-white">→</span>
        </a>
      )}
    </div>
  );
}
