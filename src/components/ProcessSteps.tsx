import { EditorialArrow } from "./editorial/EditorialElements";

interface Step {
  number: string;
  title: string;
  description: string;
}
const defaultSteps: Step[] = [
  {
    number: "01",
    title: "Qualifier",
    description:
      "Décrire votre activité, vos échéances, vos outils et les sujets à clarifier.",
  },
  {
    number: "02",
    title: "Comparer",
    description:
      "Identifier les critères utiles : périmètre, spécialisation, disponibilité, outils et honoraires.",
  },
  {
    number: "03",
    title: "Préparer",
    description:
      "Rassembler les documents et questions à poser avant le premier échange avec un professionnel.",
  },
  {
    number: "04",
    title: "Décider",
    description:
      "Valider les informations, les habilitations et la lettre de mission avant tout engagement.",
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
  const dark = variant === "dark";
  return (
    <section
      className={`mb-12 rounded-[1.75rem] p-6 sm:p-9 ${dark ? "bg-navy" : "bg-lilac"}`}
    >
      <div className="mb-9 grid gap-5 lg:grid-cols-[1fr_.85fr] lg:items-end lg:gap-10">
        <div>
          <p
            className={`mb-4 text-xs font-bold uppercase tracking-[.14em] ${dark ? "text-mint" : "text-blue"}`}
          >
            Notre approche
          </p>
          <h2
            className={`font-display text-[clamp(1.6rem,3vw,2.5rem)] font-bold leading-[1.1] tracking-[-.04em] ${dark ? "text-white" : "text-ink"}`}
          >
            {title}
          </h2>
        </div>
        <p
          className={`max-w-xl text-base leading-7 ${dark ? "text-white/75" : "text-ink-muted"}`}
        >
          {subtitle}
        </p>
      </div>
      <ol
        className={`grid gap-3 ${steps.length === 3 ? "md:grid-cols-3" : "md:grid-cols-2 xl:grid-cols-4"}`}
      >
        {steps.map((step, i) => (
          <li
            key={`${step.number}-${i}`}
            className={`min-w-0 rounded-[1.3rem] p-5 sm:p-6 ${dark ? "bg-white/[.07]" : "bg-white/80"}`}
          >
            <div className="mb-6 flex items-center justify-between gap-4">
              <span
                className={`font-mono text-lg font-bold ${dark ? "text-mint" : "text-blue"}`}
              >
                {step.number}
              </span>
              {i < steps.length - 1 && (
                <EditorialArrow
                  className={dark ? "text-white/50" : "text-blue/50"}
                />
              )}
            </div>
            <h3
              className={`font-display text-xl font-bold leading-tight ${dark ? "text-white" : "text-ink"}`}
            >
              {step.title}
            </h3>
            <p
              className={`mt-3 text-sm leading-6 ${dark ? "text-white/75" : "text-ink-muted"}`}
            >
              {step.description}
            </p>
          </li>
        ))}
      </ol>
    </section>
  );
}
