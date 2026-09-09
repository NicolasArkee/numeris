import Image from "next/image";
import Link from "next/link";

const ILLUSTRATED_CITIES = new Set([
  "paris", "marseille", "lyon", "toulouse", "nice", "nantes", "montpellier", "strasbourg", "bordeaux", "lille", "rennes", "reims",
]);

export function directoryCityImage(slug: string): string | null {
  return ILLUSTRATED_CITIES.has(slug) ? `/images/skoria-v2/cities/${slug}.webp` : null;
}

export function DirectoryCityTile({ name, slug, detail }: { name: string; slug: string; detail?: string | null }) {
  const src = directoryCityImage(slug);
  return (
    <Link href={`/expert-comptable/${slug}`} className="group flex min-w-0 flex-col overflow-hidden rounded-[1.4rem] border border-ink/10 bg-white text-ink transition-colors hover:border-blue/40 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue">
      {src ? <div className="relative aspect-[16/9] overflow-hidden bg-lilac">
        <Image src={src} alt={`Maquette architecturale évoquant ${name}`} fill sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 25vw" className="object-cover transition-transform duration-500 motion-safe:group-hover:scale-105" />
        <span className="absolute bottom-2 left-2 rounded-full bg-white/90 px-2.5 py-1 text-[.55rem] font-medium text-ink-muted">Illustration générée par IA</span>
      </div> : <div aria-hidden className="relative flex min-h-24 items-center overflow-hidden bg-lilac px-5 py-6">
        <span className="relative z-10 font-display text-3xl font-bold text-blue">{name.slice(0, 2).toUpperCase()}</span>
        <span className="absolute -right-4 -top-6 h-32 w-32 rounded-full border-[18px] border-white/50" />
      </div>}
      <div className="flex flex-1 items-center gap-4 p-5">
        <span className="min-w-0 flex-1"><strong className="block font-display text-[1.1rem] font-bold leading-6 group-hover:text-blue">{name}</strong><span className="mt-1.5 block text-[.75rem] leading-5 text-ink-muted">{detail || "Explorer les cabinets référencés"}</span></span>
        <span aria-hidden className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-paper text-blue transition-colors group-hover:bg-blue group-hover:text-white">↗</span>
      </div>
    </Link>
  );
}
