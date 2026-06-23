import { legalEntity } from "@/data/legal-entity";
import { formatDateFr } from "@/libs/content/format";

interface ExpertAuthorBoxProps {
  name?: string;
  role?: string;
  credentials?: string[];
  date?: string;
  initials?: string;
  /** Public path to the author photo. Falls back to initials square if empty. */
  photoUrl?: string;
}

export function ExpertAuthorBox({
  name = legalEntity.presidentName,
  role = `${legalEntity.presidentTitle} — comparateur indépendant`,
  credentials = [
    "Contenus informatifs, non individualisés",
    "Sources publiques et méthodologie éditoriale",
    `${legalEntity.companyName} — comparateur fondé en ${legalEntity.creationYear}`,
  ],
  date,
  initials = legalEntity.presidentInitials,
  photoUrl = legalEntity.presidentPhotoUrl,
}: ExpertAuthorBoxProps) {
  const displayDate = formatDateFr(date);

  return (
    <aside className="border border-border-soft bg-surface p-6" aria-label="Auteur">
      <div className="flex items-start gap-4">
        {photoUrl ? (
          <div className="flex h-12 w-12 flex-shrink-0 overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photoUrl}
              alt={name}
              width={48}
              height={48}
              loading="lazy"
              className="h-full w-full object-cover"
            />
          </div>
        ) : (
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center bg-brand-ink text-[0.75rem] font-semibold text-accent-500">
            {initials}
          </div>
        )}
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="text-[0.88rem] font-semibold text-ink">{name}</span>
            <span className="bg-accent-300 px-2 py-0.5 text-[0.58rem] font-bold uppercase tracking-wide text-accent-700">
              Éditorial
            </span>
          </div>
          <p className="mt-0.5 text-[0.75rem] text-ink-muted">{role}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {credentials.map((c) => (
              <span
                key={c}
                className="flex items-center gap-1 text-[0.7rem] text-ink-muted"
              >
                <span className="text-accent-500">✓</span> {c}
              </span>
            ))}
          </div>
          <p className="mt-3 text-[0.68rem] text-ink-soft">
            Mis à jour le {displayDate}
          </p>
        </div>
      </div>
    </aside>
  );
}
