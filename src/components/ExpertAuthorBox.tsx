import { AppConfig } from "@/utils/AppConfig";

interface ExpertAuthorBoxProps {
  name?: string;
  role?: string;
  credentials?: string[];
  date?: string;
}

export function ExpertAuthorBox({
  name = "L'équipe Numeris",
  role = "Experts-comptables inscrits à l'Ordre",
  credentials = [
    "Inscrits à l'Ordre des Experts-Comptables",
    `${new Date().getFullYear() - AppConfig.foundedYear} ans d'expérience`,
    "500+ clients accompagnés",
  ],
  date,
}: ExpertAuthorBoxProps) {
  const displayDate = date || new Date().toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <aside className="border border-pierre-12 bg-blanc p-6" aria-label="Auteur">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center bg-nuit text-[0.75rem] font-semibold text-or">
          {name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
        </div>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="text-[0.88rem] font-semibold text-encre">{name}</span>
            <span className="bg-or-clair px-2 py-0.5 text-[0.58rem] font-bold uppercase tracking-wide text-or-fonce">
              Vérifié OEC
            </span>
          </div>
          <p className="mt-0.5 text-[0.75rem] text-ardoise">{role}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {credentials.map((c) => (
              <span
                key={c}
                className="flex items-center gap-1 text-[0.7rem] text-ardoise"
              >
                <span className="text-or">✓</span> {c}
              </span>
            ))}
          </div>
          <p className="mt-3 text-[0.68rem] text-pierre-37">
            Mis à jour le {displayDate}
          </p>
        </div>
      </div>
    </aside>
  );
}
