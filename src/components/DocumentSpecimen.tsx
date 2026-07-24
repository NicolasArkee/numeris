import { specimenPdfPath, DOCS_WITH_SPECIMEN } from "@/data/documents";

/**
 * Bloc « spécimen annoté » d'un document : aperçu du PDF (fac-similé watermark SPECIMEN,
 * badges d'annotation → guide champ par champ) + téléchargement. Rendu seulement si un
 * spécimen a été construit pour ce slug (public/specimens/{slug}.fr.pdf).
 */
export function DocumentSpecimen({ slug, label }: { slug: string; label: string }) {
  if (!DOCS_WITH_SPECIMEN.has(slug)) return null;
  const pdf = specimenPdfPath(slug);

  return (
    <section className="mb-12" aria-labelledby={`specimen-${slug}`}>
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-3">
        <h2 id={`specimen-${slug}`} className="font-display text-[1.25rem] font-bold text-ink">
          Spécimen annoté — {label}
        </h2>
        <a
          href={pdf}
          download
          className="inline-flex items-center gap-2 border border-brand-500 px-4 py-2 text-[0.85rem] font-semibold text-brand-700 transition-colors hover:bg-brand-50"
        >
          Télécharger le PDF
        </a>
      </div>
      <div className="overflow-hidden border border-border-soft bg-surface">
        <object data={`${pdf}#view=FitH`} type="application/pdf" className="h-[820px] w-full">
          <div className="border border-dashed border-border bg-bg p-7 text-center">
            <p className="text-[0.85rem] text-ink-muted">
              Aperçu indisponible dans ce navigateur.{" "}
              <a href={pdf} download className="font-semibold text-brand-700 underline">
                Télécharger le spécimen PDF
              </a>
              .
            </p>
          </div>
        </object>
      </div>
      <p className="mt-3 text-[0.78rem] leading-relaxed text-ink-muted">
        Document d'illustration édité par Skoria (comparateur indépendant). Données fictives et invalides,
        filigrane « SPECIMEN ». Ne constitue ni un modèle contractuel ni un conseil : faites valider vos
        documents par un professionnel inscrit à l'Ordre des experts-comptables.
      </p>
    </section>
  );
}
