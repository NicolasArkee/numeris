// ─── Testimonials ───
// Section homepage full-width (grille statique 3 colonnes, rows DB
// `testimonials`). Pour les témoignages inline dans une page pSEO
// (carousel, lookup par profession/secteur/ville), voir TestimonialSlider.

import type { Testimonial } from "@/libs/db";

export function Testimonials({
  testimonials,
}: {
  testimonials: Testimonial[];
}) {
  return (
    <section className="bg-surface px-6 py-24 lg:px-[4.5rem]">
      <div className="mx-auto max-w-[82rem]">
        {/* Header */}
        <div className="mb-14 grid items-start gap-6 lg:grid-cols-2 lg:gap-24">
          <div>
            <div className="mb-5 flex items-center gap-3.5">
              <span className="block h-px w-6 flex-shrink-0 bg-accent-500" />
              <span className="text-[0.65rem] font-bold uppercase tracking-[0.14em] text-accent-700">
                Méthode
              </span>
            </div>
            <h2 className="font-display text-[2.75rem] font-bold leading-[1.15] tracking-tight text-ink">
              Repères de comparaison
            </h2>
          </div>
          <div className="mt-8 border-l-2 border-accent-500 pl-6">
            <span className="block font-display text-[3.5rem] font-bold italic leading-none text-accent-500">
              0
            </span>
            <span className="mt-1 text-[0.78rem] text-ink-muted">
              Avis client inventé
            </span>
          </div>
        </div>

        {/* Grid */}
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testi) => {
            const isFeatured = Boolean(testi.featured);
            return (
              <div
                key={testi.id}
                className={`relative p-9 transition-shadow hover:shadow-md ${
                  isFeatured
                    ? "border-t-2 border-t-accent-500 bg-brand-ink"
                    : "border border-border-soft bg-surface"
                }`}
              >
                {/* Guillemet */}
                <span
                  className={`pointer-events-none absolute left-7 -top-3 select-none font-display text-[6rem] font-bold italic leading-none ${
                    isFeatured ? "text-accent-500/15" : "text-accent-300"
                  }`}
                >
                  &ldquo;
                </span>

                <p
                  className={`mb-7 pt-2 font-display text-[1.075rem] italic leading-relaxed ${
                    isFeatured ? "text-white/75" : "text-ink-muted"
                  }`}
                >
                  {testi.body}
                </p>

                <div
                  className={`flex items-center gap-3.5 border-t pt-6 ${
                    isFeatured ? "border-white/10" : "border-border-soft"
                  }`}
                >
                  <div
                    className={`flex h-10 w-10 flex-shrink-0 items-center justify-center text-[0.72rem] font-semibold ${
                      isFeatured
                        ? "bg-white/10 text-white/55"
                        : "bg-brand-ink text-white/65"
                    }`}
                  >
                    {testi.author_initials}
                  </div>
                  <div className="flex-1">
                    <p
                      className={`text-[0.84rem] font-semibold ${isFeatured ? "text-white/85" : "text-ink"}`}
                    >
                      {testi.author_name}
                    </p>
                    <p
                      className={`mt-0.5 text-[0.7rem] ${isFeatured ? "text-white/30" : "text-ink-muted"}`}
                    >
                      {testi.author_role}
                    </p>
                  </div>
                  <span className="ml-auto text-[0.8rem] tracking-wide text-accent-500">
                    {"★".repeat(testi.stars)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
