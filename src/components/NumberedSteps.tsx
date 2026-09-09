import { EDITORIAL_HEADING } from "./editorial/EditorialElements";

interface Step {
  title: string;
  description: string;
}
interface NumberedStepsProps {
  title?: string;
  intro?: string;
  steps: Step[];
}

export function NumberedSteps({ title, intro, steps }: NumberedStepsProps) {
  return (
    <section className="mb-12 min-w-0">
      {title && <h2 className={`mb-7 ${EDITORIAL_HEADING}`}>{title}</h2>}
      {intro && (
        <p className="mb-7 max-w-3xl text-base leading-7 text-ink-muted">
          {intro}
        </p>
      )}
      <ol className="grid gap-3">
        {steps.map((step, i) => (
          <li
            key={i}
            className="grid min-w-0 gap-4 rounded-[1.5rem] border border-ink/10 bg-white p-5 sm:grid-cols-[4rem_1fr] sm:gap-6 sm:p-7"
          >
            <span
              aria-hidden="true"
              className={`flex h-12 w-12 items-center justify-center rounded-2xl font-mono text-lg font-bold ${i === 0 ? "bg-blue text-white" : "bg-lilac text-blue"}`}
            >
              {String(i + 1).padStart(2, "0")}
            </span>
            <div className="min-w-0">
              <h3 className="font-display text-[1.2rem] font-bold leading-tight tracking-[-.02em] text-ink">
                {step.title}
              </h3>
              {step.description && step.description !== step.title && (
                <p className="mt-3 text-base leading-7 text-ink-muted">
                  {step.description}
                </p>
              )}
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
