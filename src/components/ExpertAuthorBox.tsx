import { legalEntity } from "@/data/legal-entity";
import { formatDateFr } from "@/libs/content/format";
import Link from "next/link";

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
    `${legalEntity.companyName} — comparateur indépendant`,
  ],
  date,
  initials = legalEntity.presidentInitials,
  photoUrl = legalEntity.presidentPhotoUrl,
}: ExpertAuthorBoxProps) {
  const displayDate = date ? formatDateFr(date) : null;

  return (
    <aside className="rounded-[1.75rem] border border-ink/10 bg-paper p-6 sm:p-8" aria-label="Auteur">
      <div className="flex flex-col items-start gap-5 sm:flex-row sm:gap-7">
        {photoUrl ? (
          <div className="flex h-20 w-20 flex-shrink-0 overflow-hidden rounded-full">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photoUrl}
              alt={name}
              width={80}
              height={80}
              loading="lazy"
              className="h-full w-full object-cover"
            />
          </div>
        ) : (
          <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-full bg-navy font-display text-[1.5rem] font-bold text-[#ffb293]">
            {initials}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="font-display text-[1.3rem] font-bold text-navy">{name}</span>
            <span className="rounded-full bg-lilac px-3 py-1.5 text-[.61rem] font-bold uppercase tracking-wide text-blue">
              Éditorial
            </span>
          </div>
          <p className="mt-2 text-[.85rem] leading-6 text-ink-muted">{role}</p>
          <div className="mt-6 grid gap-3 lg:grid-cols-3">
            {credentials.map((c) => (
              <span
                key={c}
                className="flex items-start gap-2 rounded-xl bg-white px-4 py-3 text-[.75rem] leading-6 text-ink-muted"
              >
                <span aria-hidden className="font-bold text-blue">↳</span> {c}
              </span>
            ))}
          </div>
          {displayDate && (
            <p className="mt-5 text-[.73rem] text-ink-muted">
              Mis à jour le {displayDate}
            </p>
          )}
          <Link href="/qui-sommes-nous" className="mt-4 inline-flex min-h-11 items-center gap-3 text-[.8rem] font-bold text-blue hover:underline">Découvrir notre méthode éditoriale <span aria-hidden>↗</span></Link>
        </div>
      </div>
    </aside>
  );
}
