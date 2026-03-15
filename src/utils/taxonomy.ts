// ─── Internal linking logic (inspired by Cars_marketplace taxonomy.ts) ───

import { db, type LinkGroup } from "@/libs/db";

/**
 * Get link groups for a service page: related secteurs + top villes
 */
export function getServiceLinks(serviceSlug: string): LinkGroup[] {
  const groups: LinkGroup[] = [];

  // Cross: service × secteur
  const secteurs = db.getServiceSecteurs(serviceSlug);
  if (secteurs.length > 0) {
    const allSecteurs = db.getSecteurs();
    const secteurMap = new Map(allSecteurs.map((s) => [s.slug, s]));
    groups.push({
      title: "Par secteur d'activité",
      links: secteurs
        .filter((ss) => secteurMap.has(ss.secteur_slug))
        .map((ss) => ({
          label: secteurMap.get(ss.secteur_slug)!.name,
          href: `/expertises/${serviceSlug}/${ss.secteur_slug}`,
        })),
    });
  }

  // Cross: service × ville
  const villes = db.getServiceVilles(serviceSlug);
  if (villes.length > 0) {
    const allVilles = db.getVilles();
    const villeMap = new Map(allVilles.map((v) => [v.slug, v]));
    groups.push({
      title: "Par ville",
      links: villes
        .filter((sv) => villeMap.has(sv.ville_slug))
        .map((sv) => ({
          label: villeMap.get(sv.ville_slug)!.name,
          href: `/expertises/${serviceSlug}/${sv.ville_slug}`,
        })),
    });
  }

  // Sibling services
  const allServices = db.getServices();
  const siblings = allServices.filter((s) => s.slug !== serviceSlug);
  if (siblings.length > 0) {
    groups.push({
      title: "Nos autres expertises",
      links: siblings.map((s) => ({
        label: s.title,
        href: `/expertises/${s.slug}`,
      })),
    });
  }

  return groups;
}

/**
 * Get link groups for a secteur page: related services + top villes
 */
export function getSecteurLinks(secteurSlug: string): LinkGroup[] {
  const groups: LinkGroup[] = [];
  const allServices = db.getServices();

  // Services available for this secteur
  groups.push({
    title: "Nos services pour votre secteur",
    links: allServices.map((s) => ({
      label: s.title,
      href: `/expertises/${s.slug}/${secteurSlug}`,
    })),
  });

  // Sibling secteurs
  const allSecteurs = db.getSecteurs();
  const siblings = allSecteurs.filter((s) => s.slug !== secteurSlug).slice(0, 8);
  if (siblings.length > 0) {
    groups.push({
      title: "Autres secteurs",
      links: siblings.map((s) => ({
        label: s.name,
        href: `/secteurs/${s.slug}`,
      })),
    });
  }

  return groups;
}

/**
 * Get link groups for a ville page: services + nearby departments
 */
export function getVilleLinks(villeSlug: string): LinkGroup[] {
  const groups: LinkGroup[] = [];
  const allServices = db.getServices();
  const ville = db.getVilleBySlug(villeSlug);

  // Services in this ville
  groups.push({
    title: "Nos services",
    links: allServices.map((s) => ({
      label: `${s.title} à ${ville?.name || villeSlug}`,
      href: `/expertises/${s.slug}/${villeSlug}`,
    })),
  });

  // Other villes
  const allVilles = db.getVilles();
  const otherVilles = allVilles.filter((v) => v.slug !== villeSlug).slice(0, 10);
  if (otherVilles.length > 0) {
    groups.push({
      title: "Autres villes",
      links: otherVilles.map((v) => ({
        label: v.name,
        href: `/villes/${v.slug}`,
      })),
    });
  }

  return groups;
}

/**
 * Get link groups for a departement page
 */
export function getDepartementLinks(deptSlug: string): LinkGroup[] {
  const groups: LinkGroup[] = [];
  const dept = db.getDepartementBySlug(deptSlug);

  // Villes in same region
  if (dept?.region) {
    const allVilles = db.getVilles();
    const regionVilles = allVilles.filter((v) => v.region === dept.region).slice(0, 10);
    if (regionVilles.length > 0) {
      groups.push({
        title: `Villes en ${dept.region}`,
        links: regionVilles.map((v) => ({
          label: v.name,
          href: `/villes/${v.slug}`,
        })),
      });
    }
  }

  // Other departments
  const allDepts = db.getDepartements();
  const otherDepts = allDepts.filter((d) => d.slug !== deptSlug).slice(0, 10);
  if (otherDepts.length > 0) {
    groups.push({
      title: "Autres départements",
      links: otherDepts.map((d) => ({
        label: `${d.name} (${d.code})`,
        href: `/departements/${d.slug}`,
      })),
    });
  }

  return groups;
}

/**
 * Get link groups for a cross-dimension page (service × secteur)
 */
export function getCrossServiceSecteurLinks(serviceSlug: string, secteurSlug: string): LinkGroup[] {
  const groups: LinkGroup[] = [];
  const allVilles = db.getVilles();

  // Add geo dimension
  groups.push({
    title: "Par ville",
    links: allVilles.slice(0, 8).map((v) => ({
      label: v.name,
      href: `/expertises/${serviceSlug}/${v.slug}`,
    })),
  });

  // Other secteurs for same service
  const allSecteurs = db.getSecteurs();
  const otherSecteurs = allSecteurs.filter((s) => s.slug !== secteurSlug);
  if (otherSecteurs.length > 0) {
    groups.push({
      title: "Autres secteurs",
      links: otherSecteurs.map((s) => ({
        label: s.name,
        href: `/expertises/${serviceSlug}/${s.slug}`,
      })),
    });
  }

  // Other services for same secteur
  const allServices = db.getServices();
  const otherServices = allServices.filter((s) => s.slug !== serviceSlug);
  if (otherServices.length > 0) {
    groups.push({
      title: "Autres expertises",
      links: otherServices.map((s) => ({
        label: s.title,
        href: `/expertises/${s.slug}/${secteurSlug}`,
      })),
    });
  }

  return groups;
}

/**
 * Get link groups for a profession page
 */
export function getProfessionLinks(professionSlug: string): LinkGroup[] {
  const groups: LinkGroup[] = [];
  const allServices = db.getServices();
  const profession = db.getProfessionBySlug(professionSlug);

  // Services for this profession
  groups.push({
    title: "Nos services",
    links: allServices.map((s) => ({
      label: `${s.title} pour ${profession?.name || professionSlug}`,
      href: `/expertises/${s.slug}/${professionSlug}`,
    })),
  });

  // Same category professions
  if (profession) {
    const siblings = db.getProfessionsByCategory(profession.category_slug);
    const others = siblings.filter((p) => p.slug !== professionSlug).slice(0, 8);
    if (others.length > 0) {
      const cat = db.getProfessionCategoryBySlug(profession.category_slug);
      groups.push({
        title: cat?.name || "Professions similaires",
        links: others.map((p) => ({
          label: p.name,
          href: `/professions/${p.slug}`,
        })),
      });
    }
  }

  // Link to profession categories hub
  const categories = db.getProfessionCategories();
  groups.push({
    title: "Tous les métiers",
    links: categories.slice(0, 8).map((c) => ({
      label: c.name,
      href: `/professions#${c.slug}`,
    })),
  });

  return groups;
}

/**
 * Get link groups for a cross service × profession page
 */
export function getCrossServiceProfessionLinks(serviceSlug: string, professionSlug: string): LinkGroup[] {
  const groups: LinkGroup[] = [];

  // Other services for same profession
  const allServices = db.getServices();
  const otherServices = allServices.filter((s) => s.slug !== serviceSlug);
  if (otherServices.length > 0) {
    groups.push({
      title: "Autres expertises",
      links: otherServices.map((s) => ({
        label: s.title,
        href: `/expertises/${s.slug}/${professionSlug}`,
      })),
    });
  }

  // Same category professions for same service
  const profession = db.getProfessionBySlug(professionSlug);
  if (profession) {
    const siblings = db.getProfessionsByCategory(profession.category_slug);
    const others = siblings.filter((p) => p.slug !== professionSlug).slice(0, 8);
    if (others.length > 0) {
      groups.push({
        title: "Autres métiers",
        links: others.map((p) => ({
          label: p.name,
          href: `/expertises/${serviceSlug}/${p.slug}`,
        })),
      });
    }
  }

  // Link to profession detail
  groups.push({
    title: "En savoir plus",
    links: [
      { label: profession?.name || professionSlug, href: `/professions/${professionSlug}` },
    ],
  });

  return groups;
}

/**
 * Get link groups for ressource pages (silos, hubs, clusters)
 */
export function getRessourceLinks(slug: string, type: "silo" | "hub" | "cluster"): LinkGroup[] {
  const groups: LinkGroup[] = [];

  if (type === "silo") {
    const hubs = db.getHubsBySilo(slug);
    if (hubs.length > 0) {
      groups.push({
        title: "Sujets",
        links: hubs.map((h) => ({
          label: h.label,
          href: `/ressources/${h.slug}`,
        })),
      });
    }
  }

  if (type === "hub") {
    const hub = db.getHubBySlug(slug);
    const clusters = db.getClustersByHub(slug);
    if (clusters.length > 0) {
      groups.push({
        title: "Articles",
        links: clusters.map((c) => ({
          label: c.label,
          href: `/ressources/${c.slug}`,
        })),
      });
    }
    // Parent silo
    if (hub) {
      const silo = db.getSiloBySlug(hub.silo_slug);
      if (silo) {
        groups.push({
          title: "Catégorie",
          links: [{ label: silo.label, href: `/ressources/${silo.slug}` }],
        });
      }
    }
  }

  if (type === "cluster") {
    const cluster = db.getClusterBySlug(slug);
    const keywords = db.getKeywordsByCluster(slug);
    if (keywords.length > 0) {
      groups.push({
        title: "Articles liés",
        links: keywords.slice(0, 10).map((kw) => ({
          label: kw.label,
          href: `/ressources/${kw.slug}`,
        })),
      });
    }
    // Parent hub
    if (cluster) {
      const hub = db.getHubBySlug(cluster.hub_slug);
      if (hub) {
        groups.push({
          title: "Thème",
          links: [{ label: hub.label, href: `/ressources/${hub.slug}` }],
        });
      }
    }
  }

  // Always link to services
  const allServices = db.getServices();
  groups.push({
    title: "Nos expertises",
    links: allServices.slice(0, 4).map((s) => ({
      label: s.title,
      href: `/expertises/${s.slug}`,
    })),
  });

  return groups;
}
