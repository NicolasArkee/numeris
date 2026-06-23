"use client";

// ─── TestimonialSlider ───
// Carousel inline pour ClusterPage/DynamicSection (section_type
// "TestimonialSlider", lookup DB par profession/secteur/ville). Pour la
// section statique homepage, voir Testimonials.

import { useState } from "react";

interface TestimonialItem {
  body: string;
  author: string;
  role: string;
  stars: number;
  profession?: string;
}

interface TestimonialSliderProps {
  title?: string;
  rating?: string;
  ratingSource?: string;
  testimonials: TestimonialItem[];
  variant?: "light" | "dark";
}

export function TestimonialSlider({
  title = "Repères de méthode",
  rating = "Éditorial",
  ratingSource = "Aucun avis client affiché",
  testimonials,
  variant = "light",
}: TestimonialSliderProps) {
  const [current, setCurrent] = useState(0);
  const isDark = variant === "dark";

  const visibleCount = 3;
  const maxPage = Math.max(0, Math.ceil(testimonials.length / visibleCount) - 1);

  const handlePrev = () => setCurrent((c) => Math.max(0, c - 1));
  const handleNext = () => setCurrent((c) => Math.min(maxPage, c + 1));

  const visibleTestimonials = testimonials.slice(
    current * visibleCount,
    current * visibleCount + visibleCount
  );

  return (
    <section className={`px-6 py-24 lg:px-[4.5rem] ${isDark ? "bg-brand-ink" : "bg-surface"}`}>
      <div className="mx-auto max-w-[82rem]">
        {/* Header */}
        <div className="mb-14 flex flex-wrap items-end justify-between gap-6">
          <div>
            <div className="mb-5 flex items-center gap-3.5">
              <span className="block h-px w-6 flex-shrink-0 bg-accent-500" />
              <span className={`text-[0.65rem] font-bold uppercase tracking-[0.14em] ${isDark ? "text-accent-500" : "text-accent-700"}`}>
                Méthode
              </span>
            </div>
            <h2 className={`font-display text-[2.25rem] font-bold leading-[1.15] tracking-tight lg:text-[2.75rem] ${isDark ? "text-surface" : "text-ink"}`}>
              {title}
            </h2>
          </div>
          <div className="flex items-center gap-5">
            <div className={`border-l-2 border-accent-500 pl-4 ${isDark ? "" : ""}`}>
              <span className={`block font-display text-[2.5rem] font-bold italic leading-none ${isDark ? "text-accent-500" : "text-accent-700"}`}>
                {rating}
              </span>
              <span className={`mt-1 text-[0.72rem] ${isDark ? "text-white/40" : "text-ink-muted"}`}>
                {ratingSource}
              </span>
            </div>
            {testimonials.length > visibleCount && (
              <div className="flex gap-2">
                <button
                  onClick={handlePrev}
                  disabled={current === 0}
                  className={`flex h-10 w-10 items-center justify-center border transition-colors disabled:opacity-30 ${
                    isDark
                      ? "border-white/15 text-white/50 hover:border-accent-500 hover:text-accent-500"
                      : "border-border-soft text-ink-muted hover:border-accent-500 hover:text-accent-700"
                  }`}
                  aria-label="Précédent"
                >
                  ←
                </button>
                <button
                  onClick={handleNext}
                  disabled={current >= maxPage}
                  className={`flex h-10 w-10 items-center justify-center border transition-colors disabled:opacity-30 ${
                    isDark
                      ? "border-white/15 text-white/50 hover:border-accent-500 hover:text-accent-500"
                      : "border-border-soft text-ink-muted hover:border-accent-500 hover:text-accent-700"
                  }`}
                  aria-label="Suivant"
                >
                  →
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Testimonials grid */}
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {visibleTestimonials.map((t, i) => (
            <div
              key={`${current}-${i}`}
              className={`relative p-9 transition-shadow hover:shadow-md ${
                isDark
                  ? "border border-white/10 bg-white/[0.04]"
                  : "border border-border-soft bg-surface"
              }`}
            >
              {/* Quote mark */}
              <span
                className={`pointer-events-none absolute -top-3 left-7 select-none font-display text-[5rem] font-bold italic leading-none ${
                  isDark ? "text-accent-500/15" : "text-accent-300"
                }`}
              >
                &ldquo;
              </span>

              {/* Stars */}
              <div className="mb-4 text-[0.8rem] tracking-wide text-accent-500">
                {"★".repeat(t.stars)}
              </div>

              <p
                className={`mb-7 font-display text-[1rem] italic leading-relaxed ${
                  isDark ? "text-white/70" : "text-ink-muted"
                }`}
              >
                {t.body}
              </p>

              <div className={`flex items-center gap-3 border-t pt-5 ${isDark ? "border-white/10" : "border-border-soft"}`}>
                <div
                  className={`flex h-10 w-10 flex-shrink-0 items-center justify-center text-[0.72rem] font-semibold ${
                    isDark ? "bg-white/10 text-white/55" : "bg-brand-ink text-white/65"
                  }`}
                >
                  {t.author.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                </div>
                <div>
                  <p className={`text-[0.84rem] font-semibold ${isDark ? "text-white/85" : "text-ink"}`}>
                    {t.author}
                  </p>
                  <p className={`text-[0.7rem] ${isDark ? "text-white/30" : "text-ink-muted"}`}>
                    {t.role}
                    {t.profession && ` · ${t.profession}`}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination dots */}
        {testimonials.length > visibleCount && (
          <div className="mt-8 flex justify-center gap-2">
            {Array.from({ length: maxPage + 1 }).map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`h-1.5 transition-all ${
                  i === current
                    ? "w-6 bg-accent-500"
                    : `w-1.5 ${isDark ? "bg-white/15" : "bg-border"}`
                }`}
                aria-label={`Page ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
