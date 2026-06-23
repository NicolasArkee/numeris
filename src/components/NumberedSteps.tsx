interface Step {
  title: string;
  description: string;
}

interface NumberedStepsProps {
  title?: string;
  steps: Step[];
}

export function NumberedSteps({ title, steps }: NumberedStepsProps) {
  return (
    <div className="mb-12">
      {title && (
        <h2 className="mb-6 font-display text-[1.25rem] font-bold text-ink">
          {title}
        </h2>
      )}
      <div className="space-y-0">
        {steps.map((step, i) => (
          <div key={i} className="relative flex gap-5 pb-8 last:pb-0">
            {/* Vertical line */}
            {i < steps.length - 1 && (
              <div className="absolute left-[15px] top-9 h-full w-px bg-border-soft" />
            )}
            {/* Number circle */}
            <div className="relative z-10 flex h-8 w-8 flex-shrink-0 items-center justify-center border border-accent-500 bg-accent-50">
              <span className="text-[0.72rem] font-bold text-accent-700">
                {String(i + 1).padStart(2, "0")}
              </span>
            </div>
            {/* Content */}
            <div className="pt-0.5">
              <h3 className="mb-1 text-[0.9rem] font-semibold text-ink">
                {step.title}
              </h3>
              <p className="text-[0.82rem] leading-relaxed text-ink-muted">
                {step.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
