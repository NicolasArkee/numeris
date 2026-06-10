"use client";

// ─── Atoms UI partagés des simulateurs (tokens V2) ───

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
  return (
    <label className="block">
      <span className="mb-1.5 block text-[0.68rem] font-bold uppercase tracking-[0.08em] text-ardoise">
        {label}
      </span>
      <span className="flex items-center gap-2">
        <input
          type="number"
          value={Number.isFinite(value) ? value : 0}
          min={min}
          max={max}
          step={step}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full border border-pierre-12 bg-blanc px-4 py-3 text-[0.95rem] text-encre outline-none transition-colors focus:border-or"
        />
        {suffix && <span className="whitespace-nowrap text-[0.78rem] text-ardoise">{suffix}</span>}
      </span>
      {hint && <span className="mt-1 block text-[0.7rem] text-ardoise">{hint}</span>}
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
  return (
    <label className="block">
      <span className="mb-1.5 block text-[0.68rem] font-bold uppercase tracking-[0.08em] text-ardoise">
        {label}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        className="w-full border border-pierre-12 bg-blanc px-4 py-3 text-[0.95rem] text-encre outline-none transition-colors focus:border-or"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export function FieldToggle({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex cursor-pointer items-center gap-3">
      <input
        type="checkbox"
        checked={value}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 accent-[#c2a15c]"
      />
      <span className="text-[0.85rem] text-encre">{label}</span>
    </label>
  );
}

export function ResultValue({ label, value, highlight, detail }: { label: string; value: string; highlight?: boolean; detail?: string }) {
  return (
    <div className={`px-6 py-5 ${highlight ? "border-t-2 border-t-or bg-nuit" : "border border-pierre-12 bg-blanc"}`}>
      <span className={`block text-[0.68rem] font-bold uppercase tracking-[0.1em] ${highlight ? "text-white/60" : "text-ardoise"}`}>
        {label}
      </span>
      <span className={`mt-1 block font-serif text-[1.9rem] font-light italic leading-none ${highlight ? "text-or" : "text-or-fonce"}`}>
        {value}
      </span>
      {detail && (
        <span className={`mt-1.5 block text-[0.72rem] ${highlight ? "text-white/60" : "text-ardoise"}`}>
          {detail}
        </span>
      )}
    </div>
  );
}

export function SimulatorBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="border border-pierre-12 border-t-2 border-t-or bg-blanc p-7 lg:p-9">
      {children}
    </div>
  );
}

export function Disclaimer({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-5 border-l-2 border-l-pierre-12 pl-4 text-[0.7rem] leading-relaxed text-ardoise">
      {children}
    </p>
  );
}

export function SimulatorCta({ label = "Affiner avec un expert-comptable" }: { label?: string }) {
  return (
    <div className="mt-6 flex flex-wrap items-center gap-4">
      <a
        href="/contact"
        className="inline-flex items-center gap-2 bg-or px-7 py-3.5 font-sans text-[0.85rem] font-semibold text-nuit transition-colors hover:bg-[#b08844]"
      >
        {label} →
      </a>
      <span className="text-[0.75rem] text-ardoise">Premier échange gratuit, sans engagement.</span>
    </div>
  );
}
