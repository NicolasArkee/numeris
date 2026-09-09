import localJourney from "@/data/skoria-v2/local-journey.json";

export function LocalComparisonGuide({ area }: { area: string }) {
  return (
    <section aria-label={`Critères de comparaison — ${area}`}>
      <div className="grid gap-6 lg:grid-cols-[1fr_.7fr] lg:items-end">
        <div>
          <p className="font-mono text-[.65rem] font-bold uppercase tracking-[.18em] text-blue">Une même grille de lecture</p>
          <h2 className="mt-4 max-w-[22ch] text-balance text-[clamp(2rem,4vw,3.5rem)] font-semibold leading-[1.05] text-navy">Comparer les réponses, au-delà de l'adresse.</h2>
        </div>
        <p className="max-w-xl text-[.92rem] leading-7 text-ink-muted">Pour votre recherche autour de {area}, utilisez les mêmes critères pour chaque cabinet. Les informations de l'annuaire donnent un premier contexte ; le contenu de la mission se précise pendant l'échange.</p>
      </div>
      <div className="mt-9 grid gap-4 md:grid-cols-2">
        {localJourney.comparison.map((item, index) => (
          <article key={item.title} className={`flex flex-col rounded-[1.5rem] border border-ink/10 p-6 sm:p-8 ${index === 0 ? "bg-lilac" : index === 3 ? "bg-apricot" : "bg-white"}`}>
            <span aria-hidden className="font-mono text-[.66rem] font-bold text-blue">CRITÈRE 0{index + 1}</span>
            <h3 className="mt-5 text-[1.45rem] font-bold leading-tight text-navy">{item.title}</h3>
            <p className="mt-4 flex-1 text-[.88rem] leading-7 text-ink-muted">{item.description}</p>
            <p className="mt-6 border-t border-ink/15 pt-4 text-[.88rem] font-semibold leading-6 text-navy"><span aria-hidden className="mr-2 text-blue">↳</span>{item.question}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
