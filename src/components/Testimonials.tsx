import type { Testimonial } from "@/libs/db";

export function Testimonials({
  testimonials,
}: {
  testimonials: Testimonial[];
}) {
  return (
    <section className="bg-blanc px-6 py-24 lg:px-[4.5rem]">
      <div className="mx-auto max-w-[82rem]">
        {/* Header */}
        <div className="mb-14 grid items-start gap-6 lg:grid-cols-2 lg:gap-24">
          <div>
            <div className="mb-5 flex items-center gap-3.5">
              <span className="block h-px w-6 flex-shrink-0 bg-or" />
              <span className="text-[0.65rem] font-bold uppercase tracking-[0.14em] text-or-fonce">
                Témoignages
              </span>
            </div>
            <h2 className="font-serif text-[2.75rem] font-light leading-[1.15] tracking-tight text-encre">
              La confiance de nos clients
            </h2>
          </div>
          <div className="mt-8 border-l-2 border-or pl-6">
            <span className="block font-serif text-[3.5rem] font-light italic leading-none text-or">
              4.9/5
            </span>
            <span className="mt-1 text-[0.78rem] text-ardoise">
              Note moyenne sur Google
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
                    ? "border-t-2 border-t-or bg-nuit"
                    : "border border-pierre-12 bg-blanc"
                }`}
              >
                {/* Guillemet */}
                <span
                  className={`pointer-events-none absolute left-7 -top-3 select-none font-serif text-[6rem] font-light italic leading-none ${
                    isFeatured ? "text-or/15" : "text-or-clair"
                  }`}
                >
                  &ldquo;
                </span>

                <p
                  className={`mb-7 pt-2 font-serif text-[1.075rem] italic leading-relaxed ${
                    isFeatured ? "text-white/75" : "text-encre-75"
                  }`}
                >
                  {testi.body}
                </p>

                <div
                  className={`flex items-center gap-3.5 border-t pt-6 ${
                    isFeatured ? "border-white/10" : "border-pierre-12"
                  }`}
                >
                  <div
                    className={`flex h-10 w-10 flex-shrink-0 items-center justify-center text-[0.72rem] font-semibold ${
                      isFeatured
                        ? "bg-white/10 text-white/55"
                        : "bg-nuit text-white/65"
                    }`}
                  >
                    {testi.author_initials}
                  </div>
                  <div className="flex-1">
                    <p
                      className={`text-[0.84rem] font-semibold ${isFeatured ? "text-white/85" : "text-encre"}`}
                    >
                      {testi.author_name}
                    </p>
                    <p
                      className={`mt-0.5 text-[0.7rem] ${isFeatured ? "text-white/30" : "text-ardoise"}`}
                    >
                      {testi.author_role}
                    </p>
                  </div>
                  <span className="ml-auto text-[0.8rem] tracking-wide text-or">
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
