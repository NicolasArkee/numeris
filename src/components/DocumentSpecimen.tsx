import Link from "next/link";
import { specimenPdfPath, DOCS_WITH_SPECIMEN } from "@/data/documents";

function DocumentMark() {
  return (
    <svg aria-hidden="true" viewBox="0 0 64 72" fill="none" className="h-20 w-18 text-cobalt">
      <path d="M14 5h25l13 13v45a4 4 0 0 1-4 4H14a4 4 0 0 1-4-4V9a4 4 0 0 1 4-4Z" fill="white" stroke="currentColor" strokeWidth="2" />
      <path d="M38 5v14h14M20 32h22M20 41h22M20 50h13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="49" cy="58" r="11" fill="var(--color-navy)" />
      <path d="m44 58 3 3 6-6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Un lecteur V2 pour les PDF existants, et une disponibilité explicite pour les autres fiches. */
export function DocumentSpecimen({ slug, label, hasGuide = true }: { slug: string; label: string; hasGuide?: boolean }) {
  if (!DOCS_WITH_SPECIMEN.has(slug)) {
    return (
      <section aria-labelledby={`specimen-${slug}`} className="overflow-hidden rounded-[2rem] border border-navy/10 bg-mint p-6 sm:p-9 lg:p-11">
        <div className="grid gap-8 md:grid-cols-[auto_1fr] md:items-start">
          <div className="flex h-28 w-28 items-center justify-center rounded-3xl bg-white/65"><DocumentMark /></div>
          <div>
            <p className="mb-4 text-[.7rem] font-bold uppercase tracking-[.15em] text-cobalt">Disponibilité du document</p>
            <h2 id={`specimen-${slug}`} className="max-w-[25ch] text-[clamp(1.8rem,3.5vw,2.7rem)] font-bold leading-[1.1] tracking-[-.04em] text-navy">Cette fiche ne propose pas de PDF à télécharger.</h2>
            <p className="mt-5 max-w-2xl text-[.94rem] leading-7 text-ink-muted">
              {hasGuide
                ? `Les repères ci-dessous vous aident à préparer la lecture du document « ${label} » et les questions à poser. Aucun spécimen PDF n’est actuellement disponible pour cette fiche.`
                : `Aucun spécimen PDF n’est actuellement disponible pour « ${label} ». Retrouvez les autres fiches dans la bibliothèque de documents.`}
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              {hasGuide && <a href="#document-guide" className="inline-flex min-h-12 items-center justify-center gap-3 rounded-full bg-cobalt px-6 py-3 text-[.83rem] font-semibold text-white transition-colors hover:bg-navy">Consulter les explications <span aria-hidden="true">↓</span></a>}
              <Link href="/documents" className="inline-flex min-h-12 items-center justify-center rounded-full border border-navy/20 px-6 py-3 text-[.83rem] font-semibold text-navy transition-colors hover:bg-white">Tous les documents</Link>
            </div>
          </div>
        </div>
      </section>
    );
  }

  const pdf = specimenPdfPath(slug);
  return (
    <section aria-labelledby={`specimen-${slug}`} className="overflow-hidden rounded-[2rem] border border-navy/10 bg-white shadow-[0_20px_70px_rgba(7,29,60,.08)]">
      <div className="grid gap-7 bg-navy p-6 text-white sm:p-9 lg:grid-cols-[1fr_auto] lg:items-end">
        <div>
          <span className="inline-flex rounded-full border border-white/25 px-3 py-1.5 text-[.68rem] font-semibold tracking-[.08em]">PDF · SPÉCIMEN ANNOTÉ</span>
          <h2 id={`specimen-${slug}`} className="mt-5 max-w-[26ch] text-[clamp(1.8rem,3.6vw,3rem)] font-bold leading-[1.1] tracking-[-.04em]">{label}</h2>
          <p className="mt-4 max-w-xl text-[.88rem] leading-7 text-white/70">Un exemple à parcourir avec les explications du guide pour repérer les informations du document.</p>
        </div>
        <div className="flex flex-wrap gap-3 lg:max-w-64">
          <a href={pdf} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-12 items-center justify-center gap-3 rounded-full bg-accent-500 px-6 py-3 text-[.82rem] font-bold text-navy transition-colors hover:bg-apricot">Ouvrir le PDF <span aria-hidden="true">↗</span><span className="sr-only"> dans un nouvel onglet</span></a>
          <a href={pdf} download className="inline-flex min-h-12 items-center justify-center gap-3 rounded-full border border-white/35 px-6 py-3 text-[.82rem] font-semibold text-white transition-colors hover:bg-white hover:text-navy">Télécharger le PDF <span aria-hidden="true">↓</span></a>
        </div>
      </div>

      <div className="grid min-w-0 lg:grid-cols-[minmax(0,1fr)_16rem]">
        <div className="min-w-0 bg-paper p-4 sm:p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2 px-1">
            <p className="text-[.78rem] font-semibold text-navy">Aperçu du document</p>
            <span className="rounded-full bg-lilac px-3 py-1 text-[.65rem] font-bold text-cobalt">Données fictives</span>
          </div>
          <div className="hidden overflow-hidden rounded-2xl border border-navy/10 bg-white md:block">
            <object data={`${pdf}#view=FitH`} type="application/pdf" aria-label={`Aperçu PDF : ${label}`} className="h-[min(75vh,52rem)] min-h-[30rem] w-full">
              <div className="flex min-h-72 flex-col items-center justify-center gap-5 p-7 text-center">
                <DocumentMark />
                <p className="max-w-sm text-[.9rem] leading-7 text-ink-muted">L’aperçu intégré n’est pas disponible dans ce navigateur. Le PDF reste accessible directement.</p>
                <a href={pdf} target="_blank" rel="noopener noreferrer" className="rounded-full bg-cobalt px-6 py-3 text-[.82rem] font-semibold text-white">Ouvrir le PDF dans un nouvel onglet ↗</a>
              </div>
            </object>
          </div>
          <div className="rounded-3xl border border-navy/10 bg-white p-6 md:hidden">
            <DocumentMark />
            <h3 className="mt-6 text-[1.35rem] font-bold leading-tight tracking-[-.025em] text-navy">Votre document, en plein écran.</h3>
            <p className="mt-3 text-[.86rem] leading-7 text-ink-muted">Sur mobile, ouvrez le PDF dans le lecteur de votre navigateur pour le parcourir et zoomer confortablement.</p>
            <a href={pdf} target="_blank" rel="noopener noreferrer" className="mt-6 inline-flex min-h-12 items-center justify-center gap-3 rounded-full bg-cobalt px-6 py-3 text-[.82rem] font-semibold text-white">Lire le spécimen <span aria-hidden="true">↗</span><span className="sr-only"> dans un nouvel onglet</span></a>
          </div>
        </div>

        <aside aria-label="Comment utiliser ce spécimen" className="border-t border-navy/10 bg-lilac/50 p-6 lg:border-l lg:border-t-0">
          <p className="text-[.72rem] font-bold uppercase tracking-[.12em] text-cobalt">Un repère de lecture</p>
          <ol className="mt-6 grid gap-6 sm:grid-cols-3 lg:grid-cols-1">
            {[
              ["01", "Repérez les rubriques", "Parcourez la structure et les annotations présentes sur le spécimen."],
              ["02", "Lisez les explications", "Rapprochez chaque information des points expliqués dans la fiche."],
              ["03", "Faites vérifier votre cas", "Le contenu de votre document doit être adapté à votre situation réelle."],
            ].map(([number, title, body]) => (
              <li key={number}>
                <span aria-hidden="true" className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-[.72rem] font-bold text-cobalt">{number}</span>
                <h3 className="mt-3 text-[.92rem] font-bold leading-6 text-navy">{title}</h3>
                <p className="mt-2 text-[.78rem] leading-6 text-ink-muted">{body}</p>
              </li>
            ))}
          </ol>
          {hasGuide && <a href="#document-guide" className="mt-7 inline-flex items-center gap-3 text-[.8rem] font-bold text-cobalt hover:underline">Lire le guide <span aria-hidden="true">↓</span></a>}
        </aside>
      </div>

      <div className="border-t border-navy/10 bg-apricot/65 px-6 py-5 sm:px-9">
        <p className="text-[.77rem] leading-6 text-ink-muted"><strong className="font-semibold text-navy">Un document d’illustration édité par Skoria.</strong> Données fictives et invalides, filigrane « SPECIMEN ». Ce document ne constitue ni un modèle contractuel ni un conseil. Faites valider vos documents par un professionnel inscrit à l’Ordre des experts-comptables.</p>
      </div>
    </section>
  );
}
