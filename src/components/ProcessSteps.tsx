interface Step {
  number: string;
  title: string;
  description: string;
}

const defaultSteps: Step[] = [
  {
    number: "01",
    title: "Premier échange",
    description: "Rendez-vous gratuit de 30 min pour comprendre votre activité et vos besoins.",
  },
  {
    number: "02",
    title: "Proposition adaptée",
    description: "Nous vous envoyons un devis clair et détaillé, sans engagement.",
  },
  {
    number: "03",
    title: "Mise en place",
    description: "Récupération de vos documents, paramétrage de votre espace client et affectation de votre comptable dédié.",
  },
  {
    number: "04",
    title: "Accompagnement continu",
    description: "Suivi mensuel, conseils proactifs et disponibilité permanente de votre équipe.",
  },
];

interface ProcessStepsProps {
  title?: string;
  subtitle?: string;
  steps?: Step[];
  variant?: "light" | "dark";
}

export function ProcessSteps({
  title = "Comment ça marche ?",
  subtitle = "Un processus simple et transparent, de la première prise de contact à l'accompagnement quotidien.",
  steps = defaultSteps,
  variant = "light",
}: ProcessStepsProps) {
  const isDark = variant === "dark";

  return (
    <section className={`px-6 py-24 lg:px-[4.5rem] ${isDark ? "bg-nuit" : "bg-creme"}`}>
      <div className="mx-auto max-w-[82rem]">
        <div className="mb-14 max-w-2xl">
          <div className="mb-5 flex items-center gap-3.5">
            <span className="block h-px w-6 flex-shrink-0 bg-or" />
            <span className={`text-[0.65rem] font-bold uppercase tracking-[0.14em] ${isDark ? "text-or" : "text-or-fonce"}`}>
              Notre approche
            </span>
          </div>
          <h2 className={`mb-4 font-serif text-[2.25rem] font-light leading-[1.15] tracking-tight lg:text-[2.75rem] ${isDark ? "text-blanc" : "text-encre"}`}>
            {title}
          </h2>
          <p className={`text-[0.95rem] leading-relaxed ${isDark ? "text-white/40" : "text-ardoise"}`}>
            {subtitle}
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, i) => (
            <div key={step.number} className="relative">
              {/* Connecting line */}
              {i < steps.length - 1 && (
                <div className={`absolute right-0 top-8 hidden h-px w-full translate-x-1/2 lg:block ${isDark ? "bg-white/10" : "bg-pierre-12"}`} />
              )}

              <div className={`relative z-10 p-7 ${isDark ? "border border-white/10 bg-white/[0.04]" : "border border-pierre-12 bg-blanc"}`}>
                <span className={`mb-4 block font-serif text-[2.5rem] font-light italic leading-none ${isDark ? "text-or/40" : "text-or-clair"}`}>
                  {step.number}
                </span>
                <h3 className={`mb-2 text-[1rem] font-semibold ${isDark ? "text-blanc" : "text-encre"}`}>
                  {step.title}
                </h3>
                <p className={`text-[0.82rem] leading-relaxed ${isDark ? "text-white/40" : "text-ardoise"}`}>
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
