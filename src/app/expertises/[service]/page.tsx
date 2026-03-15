import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { db } from "@/libs/db";
import { AppConfig } from "@/utils/AppConfig";
import { ClusterPage } from "@/components/ClusterPage";
import { getSEOForService } from "@/data/seo";
import { getServiceLinks } from "@/utils/taxonomy";

interface Props {
  params: Promise<{ service: string }>;
}

export async function generateStaticParams() {
  return db.getServices().map((s) => ({ service: s.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { service: slug } = await params;
  const service = db.getServices().find((s) => s.slug === slug);
  if (!service) return {};
  const seo = getSEOForService(service);
  return {
    title: seo.metaTitle,
    description: seo.metaDescription,
    alternates: { canonical: `${AppConfig.url}/expertises/${slug}` },
  };
}

export default async function ServicePage({ params }: Props) {
  const { service: slug } = await params;
  const service = db.getServices().find((s) => s.slug === slug);
  if (!service) notFound();

  const seo = getSEOForService(service);
  const linkGroups = getServiceLinks(slug);
  const secteurs = db.getServiceSecteurs(slug);
  const allSecteurs = db.getSecteurs();
  const secteurMap = new Map(allSecteurs.map((s) => [s.slug, s]));
  const professions = db.getServiceProfessions(slug);
  const categories = db.getProfessionCategories();
  const categoryMap = new Map(categories.map((c) => [c.slug, c]));

  // Group professions by category for display
  const professionsByCategory = new Map<string, { name: string; slug: string }[]>();
  for (const sp of professions) {
    const prof = db.getProfessionBySlug(sp.profession_slug);
    if (!prof) continue;
    const catSlug = prof.category_slug;
    if (!professionsByCategory.has(catSlug)) {
      professionsByCategory.set(catSlug, []);
    }
    professionsByCategory.get(catSlug)!.push({ name: prof.name, slug: prof.slug });
  }

  return (
    <ClusterPage
      eyebrow={AppConfig.tagline}
      h1={seo.h1}
      intro={seo.intro}
      breadcrumbs={[
        { name: "Accueil", url: "/" },
        { name: "Expertises", url: "/expertises" },
        { name: service.title, url: `/expertises/${slug}` },
      ]}
      badges={[service.icon, service.title]}
      faqs={seo.faqs}
      linkGroups={linkGroups}
    >
      {/* Secteurs for this service */}
      {secteurs.length > 0 && (
        <div className="mb-12">
          <h2 className="mb-6 font-serif text-[1.5rem] font-light text-encre">
            {service.title} par secteur
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {secteurs.map((ss) => {
              const sec = secteurMap.get(ss.secteur_slug);
              if (!sec) return null;
              return (
                <a
                  key={ss.secteur_slug}
                  href={`/expertises/${slug}/${ss.secteur_slug}`}
                  className="border border-pierre-12 bg-blanc px-6 py-5 transition-colors hover:border-or"
                >
                  <h3 className="mb-1 text-[0.95rem] font-medium text-encre">{sec.name}</h3>
                  <p className="text-[0.72rem] text-ardoise">{sec.description}</p>
                </a>
              );
            })}
          </div>
        </div>
      )}

      {/* Professions for this service */}
      {professionsByCategory.size > 0 && (
        <div className="mb-12">
          <h2 className="mb-6 font-serif text-[1.5rem] font-light text-encre">
            {service.title} par profession
          </h2>
          <div className="space-y-8">
            {Array.from(professionsByCategory.entries()).map(([catSlug, profs]) => {
              const cat = categoryMap.get(catSlug);
              if (!cat) return null;
              return (
                <div key={catSlug}>
                  <div className="mb-3 flex items-center gap-2">
                    <span className="text-[1rem]">{cat.icon}</span>
                    <h3 className="text-[0.95rem] font-medium text-encre">{cat.name}</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {profs.slice(0, 8).map((p) => (
                      <a
                        key={p.slug}
                        href={`/expertises/${slug}/${p.slug}`}
                        className="border border-pierre-12 bg-blanc px-4 py-2 text-[0.78rem] text-encre-75 transition-colors hover:border-or hover:text-or-fonce"
                      >
                        {p.name}
                      </a>
                    ))}
                    {profs.length > 8 && (
                      <span className="px-4 py-2 text-[0.72rem] text-ardoise">
                        +{profs.length - 8} professions
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </ClusterPage>
  );
}
