import type { MetadataRoute } from "next";
import { AppConfig } from "@/utils/AppConfig";
import { db } from "@/libs/db";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = AppConfig.url;
  const now = new Date();

  const entries: MetadataRoute.Sitemap = [];

  // ─── Static pages ───
  entries.push(
    { url: baseUrl, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${baseUrl}/expertises`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${baseUrl}/secteurs`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/villes`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/professions`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${baseUrl}/ressources`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/contact`, lastModified: now, changeFrequency: "yearly", priority: 0.9 },
  );

  // ─── Service pages ───
  const services = db.getServices();
  for (const s of services) {
    entries.push({
      url: `${baseUrl}/expertises/${s.slug}`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    });

    // Service × Secteur
    const secteurs = db.getServiceSecteurs(s.slug);
    for (const ss of secteurs) {
      entries.push({
        url: `${baseUrl}/expertises/${s.slug}/${ss.secteur_slug}`,
        lastModified: now,
        changeFrequency: "monthly",
        priority: 0.6,
      });
    }

    // Service × Ville
    const villes = db.getServiceVilles(s.slug);
    for (const sv of villes) {
      entries.push({
        url: `${baseUrl}/expertises/${s.slug}/${sv.ville_slug}`,
        lastModified: now,
        changeFrequency: "monthly",
        priority: 0.6,
      });
    }

    // Service × Profession
    const professions = db.getServiceProfessions(s.slug);
    for (const sp of professions) {
      entries.push({
        url: `${baseUrl}/expertises/${s.slug}/${sp.profession_slug}`,
        lastModified: now,
        changeFrequency: "monthly",
        priority: 0.6,
      });
    }
  }

  // ─── Secteur pages ───
  const secteurs = db.getSecteurs();
  for (const s of secteurs) {
    entries.push({
      url: `${baseUrl}/secteurs/${s.slug}`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    });
  }

  // ─── Ville pages ───
  const villes = db.getVilles();
  for (const v of villes) {
    entries.push({
      url: `${baseUrl}/villes/${v.slug}`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    });
  }

  // ─── Departement pages ───
  const departements = db.getDepartements();
  for (const d of departements) {
    entries.push({
      url: `${baseUrl}/departements/${d.slug}`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    });
  }

  // ─── Profession pages ───
  const allProfessions = db.getProfessions();
  for (const p of allProfessions) {
    entries.push({
      url: `${baseUrl}/professions/${p.slug}`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    });
  }

  // ─── Ressource pages (hubs + clusters) ───
  const silos = db.getSilos();
  for (const silo of silos) {
    const hubs = db.getHubsBySilo(silo.slug);
    for (const hub of hubs) {
      entries.push({
        url: `${baseUrl}/ressources/${hub.slug}`,
        lastModified: now,
        changeFrequency: "monthly",
        priority: 0.6,
      });

      const clusters = db.getClustersByHub(hub.slug);
      for (const c of clusters) {
        entries.push({
          url: `${baseUrl}/ressources/${c.slug}`,
          lastModified: now,
          changeFrequency: "monthly",
          priority: 0.5,
        });
      }
    }
  }

  return entries;
}
