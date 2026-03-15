import Link from "next/link";
import type { LinkGroup } from "@/libs/db";

export function InternalLinks({ groups }: { groups: LinkGroup[] }) {
  if (groups.length === 0) return null;

  return (
    <nav aria-label="Liens associés" className="border-t border-pierre-12 pt-16">
      <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
        {groups.map((group) => (
          <div key={group.title}>
            <h3 className="mb-5 flex items-center gap-3">
              <span className="block h-px w-5 bg-or" />
              <span className="text-[0.65rem] font-bold uppercase tracking-[0.14em] text-or-fonce">
                {group.title}
              </span>
            </h3>
            <ul className="flex flex-col gap-2">
              {group.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="group inline-flex items-center gap-2 text-[0.85rem] text-ardoise transition-colors hover:text-or-fonce"
                  >
                    <span className="h-1 w-1 flex-shrink-0 bg-pierre-12 transition-colors group-hover:bg-or" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </nav>
  );
}
