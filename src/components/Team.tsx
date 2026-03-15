import type { TeamMember } from "@/libs/db";

export function Team({ members }: { members: TeamMember[] }) {
  return (
    <section className="bg-blanc px-6 py-24 lg:px-[4.5rem]">
      <div className="mx-auto max-w-[82rem]">
        <div className="mb-5 flex items-center gap-3.5">
          <span className="block h-px w-6 flex-shrink-0 bg-or" />
          <span className="text-[0.65rem] font-bold uppercase tracking-[0.14em] text-or-fonce">
            L&apos;équipe
          </span>
        </div>
        <h2 className="mb-14 font-serif text-[2.75rem] font-light leading-[1.15] tracking-tight text-encre">
          Des experts à votre service
        </h2>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {members.map((member) => {
            const specialties: string[] = JSON.parse(member.specialties);
            return (
              <div
                key={member.slug}
                className="cursor-default overflow-hidden border border-pierre-12 bg-creme-06 transition-shadow hover:shadow-lg"
              >
                {/* Photo placeholder */}
                <div className="relative flex h-[200px] items-center justify-center bg-gradient-to-b from-nuit-25 to-nuit">
                  <span className="relative z-10 font-serif text-[2.5rem] font-light italic text-white/50">
                    {member.initials}
                  </span>
                  {member.badge && (
                    <span className="absolute bottom-3.5 left-3.5 z-20 border border-or/30 bg-nuit/80 px-2.5 py-1 text-[0.58rem] font-bold uppercase tracking-[0.09em] text-or-clair">
                      {member.badge}
                    </span>
                  )}
                </div>

                <div className="p-5">
                  <h3 className="font-serif text-[1.1rem] font-medium text-encre">
                    {member.name}
                  </h3>
                  <p className="mb-3 text-[0.72rem] font-semibold uppercase tracking-[0.07em] text-or-fonce">
                    {member.role}
                  </p>
                  <p className="text-[0.77rem] leading-relaxed text-ardoise">
                    {member.description}
                  </p>
                  <div className="mt-3.5 flex flex-wrap gap-1.5">
                    {specialties.map((spec) => (
                      <span
                        key={spec}
                        className="bg-or-clair px-2 py-0.5 text-[0.6rem] font-semibold tracking-wide text-or-fonce"
                      >
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
