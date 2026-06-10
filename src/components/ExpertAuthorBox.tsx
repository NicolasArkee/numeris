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
  role = `${legalEntity.presidentTitle} — Expert-comptable diplômée, inscrite à l'Ordre ${legalEntity.oecNumberFormatted}`,
  credentials = [
    `Inscrite au Tableau de l'Ordre depuis ${legalEntity.oecInscriptionYear}`,
    `${new Date().getFullYear() - legalEntity.oecInscriptionYear} ans d'exercice`,
    `${legalEntity.companyName} — fondé en ${legalEntity.creationYear}`,
  ],
  date,
  initials = legalEntity.presidentInitials,
  photoUrl = legalEntity.presidentPhotoUrl,
}: ExpertAuthorBoxProps) {
  const displayDate = formatDateFr(date);

  return (
    <aside className="border border-pierre-12 bg-blanc p-6" aria-label="Auteur">
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
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center bg-nuit text-[0.75rem] font-semibold text-or">
            {initials}
          </div>
        )}
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="text-[0.88rem] font-semibold text-encre">{name}</span>
            <span className="bg-or-clair px-2 py-0.5 text-[0.58rem] font-bold uppercase tracking-wide text-or-fonce">
              Vérifié OEC
            </span>
          </div>
          <p className="mt-0.5 text-[0.75rem] text-ardoise">{role}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {credentials.map((c) => (
              <span
                key={c}
                className="flex items-center gap-1 text-[0.7rem] text-ardoise"
              >
                <span className="text-or">✓</span> {c}
              </span>
            ))}
          </div>
          <p className="mt-3 text-[0.68rem] text-pierre-37">
            Mis à jour le {displayDate}
          </p>
        </div>
      </div>
    </aside>
  );
}
