"use client";

import { useId, type ReactNode } from "react";

const fieldLabel = "mb-2 block text-[.86rem] font-semibold leading-5 text-navy";
const fieldControl = "min-h-14 w-full min-w-0 rounded-2xl border border-navy/15 bg-white px-4 py-3.5 text-base font-semibold text-navy outline-none transition-colors focus:border-cobalt focus:ring-4 focus:ring-cobalt/10";

interface FieldNumberProps {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
  suffix?: string;
  hint?: string;
}

export function FieldNumber({ label, value, onChange, min = 0, max, step = 1, suffix, hint }: FieldNumberProps) {
  const id = useId();
  const descriptionIds = [suffix && `${id}-unit`, hint && `${id}-hint`].filter(Boolean).join(" ") || undefined;
  return (
    <label className="block min-w-0" htmlFor={id}>
      <span className={fieldLabel}>{label}</span>
      <span className="flex min-h-14 items-stretch overflow-hidden rounded-2xl border border-navy/15 bg-white transition-colors focus-within:border-cobalt focus-within:ring-4 focus-within:ring-cobalt/10">
        <input
          id={id}
          type="number"
          value={Number.isFinite(value) ? value : 0}
          min={min}
          max={max}
          step={step}
          aria-describedby={descriptionIds}
          onChange={(e) => onChange(Number(e.target.value))}
          className="min-w-0 flex-1 bg-transparent px-4 py-3.5 text-lg font-semibold tabular-nums text-navy outline-none"
        />
        {suffix && <span id={`${id}-unit`} className="flex shrink-0 items-center border-l border-navy/10 bg-paper px-3 text-[.78rem] font-semibold text-ink-muted">{suffix}</span>}
      </span>
      {hint && <span id={`${id}-hint`} className="mt-2 block text-[.76rem] leading-5 text-ink-muted">{hint}</span>}
    </label>
  );
}

interface FieldSelectProps<T extends string> {
  label: string;
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
}

export function FieldSelect<T extends string>({ label, value, onChange, options }: FieldSelectProps<T>) {
  const id = useId();
  return (
    <label className="block min-w-0" htmlFor={id}>
      <span className={fieldLabel}>{label}</span>
      <span className="relative block">
        <select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value as T)}
          className={`${fieldControl} appearance-none pr-10`}
        >
          {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-cobalt"><path d="m5 7.5 5 5 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </span>
    </label>
  );
}

export function FieldDate({ label, value, onChange, hint }: { label: string; value: string; onChange: (v: string) => void; hint?: string }) {
  const id = useId();
  return (
    <label className="block min-w-0" htmlFor={id}>
      <span className={fieldLabel}>{label}</span>
      <input
        id={id}
        type="date"
        value={value}
        aria-describedby={hint ? `${id}-hint` : undefined}
        onChange={(e) => onChange(e.target.value)}
        className={fieldControl}
      />
      {hint && <span id={`${id}-hint`} className="mt-2 block text-[.76rem] leading-5 text-ink-muted">{hint}</span>}
    </label>
  );
}

export function FieldToggle({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex min-h-14 cursor-pointer items-center gap-3 rounded-2xl border border-navy/10 bg-white p-4">
      <input type="checkbox" checked={value} onChange={(e) => onChange(e.target.checked)} className="peer sr-only" />
      <span aria-hidden="true" className="relative h-6 w-11 shrink-0 rounded-full bg-navy/20 transition-colors after:absolute after:left-1 after:top-1 after:h-4 after:w-4 after:rounded-full after:bg-white after:shadow-sm after:transition-transform peer-checked:bg-cobalt peer-checked:after:translate-x-5 peer-focus-visible:ring-4 peer-focus-visible:ring-cobalt/25" />
      <span className="text-[.83rem] font-medium leading-6 text-navy">{label}</span>
    </label>
  );
}

export function SimulatorFields({ children, columns = 3 }: { children: ReactNode; columns?: 2 | 3 | 4 }) {
  const grid = columns === 4 ? "md:grid-cols-2 xl:grid-cols-4" : columns === 2 ? "md:grid-cols-2" : "md:grid-cols-3";
  return (
    <fieldset className="min-w-0 rounded-3xl bg-paper p-5 sm:p-7">
      <legend className="sr-only">Les hypothèses de votre simulation</legend>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <p className="flex items-center gap-3 text-[.96rem] font-bold text-navy"><span aria-hidden="true" className="flex h-9 w-9 items-center justify-center rounded-full bg-lilac text-[.76rem] text-cobalt">01</span> Vos hypothèses</p>
        <span className="text-[.72rem] font-medium text-ink-muted">Ajustez les champs pour explorer un scénario</span>
      </div>
      <div className={`grid min-w-0 gap-5 ${grid}`}>{children}</div>
    </fieldset>
  );
}

export function ResultGrid({ children, columns = 3 }: { children: ReactNode; columns?: 2 | 3 | 4 }) {
  const grid = columns === 4 ? "md:grid-cols-2 xl:grid-cols-4" : columns === 2 ? "md:grid-cols-2" : "md:grid-cols-3";
  return (
    <section aria-label="Résultat de la simulation" className="mt-8">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <p className="flex items-center gap-3 text-[.96rem] font-bold text-navy"><span aria-hidden="true" className="flex h-9 w-9 items-center justify-center rounded-full bg-mint text-[.76rem] text-cobalt">02</span> Votre estimation</p>
        <span className="inline-flex items-center gap-2 text-[.72rem] font-medium text-ink-muted"><span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-cobalt" /> Mise à jour au fil de votre saisie</span>
      </div>
      <div className={`grid min-w-0 gap-4 ${grid}`} aria-live="polite" aria-atomic="true">{children}</div>
    </section>
  );
}

export function ResultValue({ label, value, highlight, detail }: { label: string; value: string; highlight?: boolean; detail?: string }) {
  return (
    <dl className={`relative flex min-w-0 flex-col rounded-3xl p-6 sm:p-7 ${highlight ? "bg-navy text-white" : "border border-navy/10 bg-lilac/45 text-navy"}`}>
      <dt className={`text-[.79rem] font-semibold leading-5 ${highlight ? "text-white/75" : "text-ink-muted"}`}>{label}</dt>
      <dd className={`mt-5 text-[clamp(1.6rem,2.5vw,2.35rem)] font-bold not-italic leading-[1.15] tracking-[-.04em] tabular-nums [overflow-wrap:anywhere] ${highlight ? "text-white" : "text-cobalt"}`}>
        {value}
      </dd>
      {detail && <dd className={`mt-auto pt-4 text-[.76rem] leading-5 ${highlight ? "text-white/70" : "text-ink-muted"}`}>{detail}</dd>}
      {highlight && <div aria-hidden="true" className="mt-6 h-1 w-12 rounded-full bg-accent-500" />}
    </dl>
  );
}

export function SimulatorTable({ children, title, description }: { children: ReactNode; title: string; description?: string }) {
  const id = useId();
  return (
    <div className="mt-8 min-w-0">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
        <h3 id={id} className="text-[1.08rem] font-bold leading-6 text-navy">{title}</h3>
        <span className="text-[.7rem] text-ink-muted">Faites défiler le tableau si nécessaire ↔</span>
      </div>
      {description && <p className="mb-4 text-[.82rem] leading-6 text-ink-muted">{description}</p>}
      <div role="region" aria-labelledby={id} tabIndex={0} className="overflow-x-auto rounded-3xl border border-navy/10 bg-white outline-none focus-visible:ring-4 focus-visible:ring-cobalt/20 [&_table]:w-full [&_table]:border-collapse [&_table]:text-left [&_th]:bg-navy [&_th]:px-5 [&_th]:py-4 [&_th]:text-[.74rem] [&_th]:font-semibold [&_th]:leading-5 [&_th]:text-white [&_td]:px-5 [&_td]:py-4 [&_td]:text-[.84rem] [&_td]:leading-6 [&_tbody_tr]:border-b [&_tbody_tr]:border-navy/10 [&_tbody_tr:last-child]:border-0 [&_tbody_tr]:transition-colors [&_tbody_tr:hover]:bg-mint/50">
        {children}
      </div>
    </div>
  );
}

export function SimulatorBox({ children }: { children: ReactNode }) {
  return <div data-simulator-v2 className="min-w-0 rounded-[2rem] border border-navy/10 bg-white p-4 shadow-[0_20px_70px_rgba(7,29,60,.08)] sm:p-7 lg:p-8">{children}</div>;
}

export function Disclaimer({ children }: { children: ReactNode }) {
  return (
    <aside className="mt-6 rounded-3xl bg-apricot/65 p-5 sm:p-6">
      <p className="mb-2 flex items-center gap-2 text-[.75rem] font-bold text-navy"><span aria-hidden="true" className="flex h-5 w-5 items-center justify-center rounded-full border border-navy/35 text-[.65rem]">i</span> Hypothèses et limites du calcul</p>
      <p className="text-[.78rem] leading-6 text-ink-muted">{children}</p>
    </aside>
  );
}

export function SimulatorCta({ label = "Affiner avec un expert-comptable" }: { label?: string }) {
  return (
    <div className="mt-8 flex flex-col gap-4 border-t border-navy/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
      <p className="max-w-sm text-[.8rem] leading-6 text-ink-muted">Un point à faire confirmer ? Ajoutez vos questions au brief, sans envoi automatique.</p>
      <button type="button" data-open-brief data-need={label} className="inline-flex min-h-12 shrink-0 items-center justify-center gap-3 rounded-full bg-cobalt px-6 py-3.5 text-center text-[.82rem] font-semibold leading-5 text-white transition-colors hover:bg-navy focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cobalt sm:max-w-[55%]">
        {label} <span aria-hidden="true">↗</span>
      </button>
    </div>
  );
}
