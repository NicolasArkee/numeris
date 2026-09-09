import Image from "next/image";
import Link from "next/link";

export function ToolPageHero({ title, description, name, image }: {
  title: string;
  description: string;
  name: string;
  image: { src: string; alt: string; position?: string; disclaimer: string };
}) {
  return (
    <header className="bg-navy px-5 pb-9 pt-6 text-white sm:px-8 lg:px-14 lg:pb-10 xl:px-20">
      <div className="mx-auto max-w-[90rem]">
        <nav aria-label="Fil d’Ariane" className="mb-7 text-[.7rem] leading-6 text-white/60">
          <ol className="flex flex-wrap items-center gap-x-2">
            <li><Link href="/" className="hover:text-white">Accueil</Link></li>
            <li aria-hidden>·</li>
            <li><Link href="/simulateurs" className="hover:text-white">Simulateurs</Link></li>
            <li aria-hidden>·</li>
            <li aria-current="page" className="text-white/80">{name}</li>
          </ol>
        </nav>
        <div className="grid items-center gap-8 lg:grid-cols-[1fr_15rem] xl:grid-cols-[1fr_19rem]">
          <div>
            <p className="sk-eyebrow mb-4 text-accent-300">Outil en ligne · gratuit</p>
            <h1 className="max-w-[32ch] text-[clamp(2.15rem,3.8vw,3.2rem)] font-bold leading-[1.06] tracking-[-.04em]">{title}</h1>
            <p className="mt-5 max-w-[72ch] text-[.95rem] leading-7 text-white/75">{description}</p>
            <ul className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-[.7rem] font-medium text-white/75">
              <li>Sans inscription</li>
              <li>Résultat interactif</li>
              <li>Calcul dans votre navigateur</li>
            </ul>
          </div>
          <figure className="relative hidden h-52 overflow-hidden rounded-[2rem_4rem_2rem_2rem] bg-lilac lg:block">
            <Image src={image.src} alt={image.alt} fill sizes="(min-width: 1280px) 304px, 240px" className="object-cover" style={{ objectPosition: image.position }} />
            <figcaption className="absolute inset-x-3 bottom-3 rounded-full bg-white/90 px-3 py-2 text-center text-[.55rem] text-navy">{image.disclaimer}</figcaption>
          </figure>
        </div>
      </div>
    </header>
  );
}
