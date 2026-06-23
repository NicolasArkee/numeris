interface Step {
  number: string;
  title: string;
  description: string;
}

const defaultSteps: Step[] = [
  {
    number: "01",
    title: "Qualifier",
    description: "Décrire votre activité, vos échéances, vos outils et les sujets à clarifier.",
  },
  {
    number: "02",
    title: "Comparer",
    description: "Identifier les critères utiles : périmètre, spécialisation, disponibilité, outils et honoraires.",
  },
  {
    number: "03",
    title: "Préparer",
    description: "Rassembler les documents et questions à poser avant le premier échange avec un professionnel.",
  },
  {
    number: "04",
    title: "Décider",
    description: "Valider les informations, les habilitations et la lettre de mission avant tout engagement.",
  },
];

interface ProcessStepsProps {
  title?: string;
  subtitle?: string;
  steps?: Step[];
  variant?: "light" | "dark";
}

export function ProcessSteps({
  title = "Comment comparer ?",
  subtitle = "Un parcours simple pour clarifier votre besoin, comparer les options et préparer un échange utile.",
  steps = defaultSteps,
  variant = "light",
}: ProcessStepsProps) {
  const isDark = variant === "dark";

  return (
    <section className={`px-6 py-24 lg:px-[4.5rem] ${isDark ? "bg-brand-ink" : "bg-bg"}`}>
      <div className="mx-auto max-w-[82rem]">
        <div className="mb-14 max-w-2xl">
          <div className="mb-5 flex items-center gap-3.5">
            <span className="block h-px w-6 flex-shrink-0 bg-accent-500" />
            <span className={`text-[0.65rem] font-bold uppercase tracking-[0.14em] ${isDark ? "text-accent-500" : "text-accent-700"}`}>
              Notre approche
            </span>
          </div>
          <h2 className={`mb-4 font-display text-[2.25rem] font-bold leading-[1.15] tracking-tight lg:text-[2.75rem] ${isDark ? "text-surface" : "text-ink"}`}>
            {title}
          </h2>
          <p className={`text-[0.95rem] leading-relaxed ${isDark ? "text-white/40" : "text-ink-muted"}`}>
            {subtitle}
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, i) => (
            <div key={step.number} className="relative">
              {/* Connecting line */}
              {i < steps.length - 1 && (
                <div className={`absolute right-0 top-8 hidden h-px w-full translate-x-1/2 lg:block ${isDark ? "bg-white/10" : "bg-border-soft"}`} />
              )}

              <div className={`relative z-10 p-7 ${isDark ? "border border-white/10 bg-white/[0.04]" : "border border-border-soft bg-surface"}`}>
                <span className={`mb-4 block font-display text-[2.5rem] font-bold italic leading-none ${isDark ? "text-accent-500/40" : "text-accent-300"}`}>
                  {step.number}
                </span>
                <h3 className={`mb-2 text-[1rem] font-semibold ${isDark ? "text-surface" : "text-ink"}`}>
                  {step.title}
                </h3>
                <p className={`text-[0.82rem] leading-relaxed ${isDark ? "text-white/40" : "text-ink-muted"}`}>
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
