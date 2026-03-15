interface PressLogo {
  name: string;
  label?: string;
}

const defaultLogos: PressLogo[] = [
  { name: "Les Echos", label: "LES ECHOS" },
  { name: "Le Figaro", label: "LE FIGARO" },
  { name: "BFM Business", label: "BFM" },
  { name: "Capital", label: "CAPITAL" },
  { name: "L'Express", label: "L'EXPRESS" },
];

interface PressLogosProps {
  title?: string;
  logos?: PressLogo[];
  variant?: "light" | "dark";
}

export function PressLogos({
  title = "Ils parlent de nous",
  logos = defaultLogos,
  variant = "light",
}: PressLogosProps) {
  const isDark = variant === "dark";

  return (
    <section className={`px-6 py-14 lg:px-[4.5rem] ${isDark ? "bg-nuit-alt" : "border-y border-pierre-12 bg-blanc"}`}>
      <div className="mx-auto max-w-[82rem]">
        <p className={`mb-8 text-center text-[0.68rem] font-semibold uppercase tracking-[0.14em] ${isDark ? "text-white/20" : "text-ardoise"}`}>
          {title}
        </p>
        <div className="flex flex-wrap items-center justify-center gap-10 lg:gap-16">
          {logos.map((logo) => (
            <span
              key={logo.name}
              className={`text-[0.85rem] font-bold tracking-[0.08em] ${isDark ? "text-white/15" : "text-pierre-25"}`}
            >
              {logo.label || logo.name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
