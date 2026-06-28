import type { MetadataRoute } from "next";
import { AppConfig } from "@/utils/AppConfig";
import { db } from "@/libs/db";
import { expertisesSlugKey } from "@/libs/content/keys";
import { SIMULATEURS } from "@/app/simulateurs/registry";
import { getPublishedCommercialPages } from "@/libs/content/commercial";

/**
 * Convert a SQLite `datetime('now')` string ("YYYY-MM-DD HH:MM:SS" or
 * "YYYY-MM-DDTHH:MM:SS") into a real Date. Falls back to `fallback`
 * when the string is empty / invalid.
 *
 * `page_meta.reviewed_at` is stored without a timezone suffix; we treat
 * it as UTC (SQLite `datetime('now')` returns UTC by default) so the
 * sitemap exposes a stable ISO 8601 lastmod.
 */
function parsePageMetaDate(raw: string | null | undefined, fallback: Date): Date {
  if (!raw) return fallback;
  // Normalize "YYYY-MM-DD HH:MM:SS" → "YYYY-MM-DDTHH:MM:SSZ"
  const iso = raw.includes("T") ? raw : raw.replace(" ", "T");
  const withTz = /[zZ]|[+-]\d{2}:?\d{2}$/.test(iso) ? iso : `${iso}Z`;
  const d = new Date(withTz);
  return Number.isNaN(d.getTime()) ? fallback : d;
}

function directoryCabinetSlug(name: string, siret: string): string {
  return `${name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")}-${siret}`;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = AppConfig.url;
  const buildDate = new Date();

  // ─── Pull every page_meta row up front; build a Map keyed by `${route}/${slug}` ───
  // Sitemap routes use this Map to surface real `reviewed_at` lastmod values
  // (P3c — replaces uniform `new Date()` for all 1668 URLs).
  const allMeta = await db.getAllPageMeta();
  const metaByKey = new Map<string, Date>();
  for (const m of allMeta) {
    metaByKey.set(`${m.route}/${m.slug}`, parsePageMetaDate(m.reviewed_at, buildDate));
  }

  const lastmodFor = (route: string, slug: string): Date =>
    metaByKey.get(`${route}/${slug}`) ?? buildDate;

  const entries: MetadataRoute.Sitemap = [];

  // ─── Static pages (no slug → always buildDate) ───
  entries.push(
    { url: baseUrl, lastModified: buildDate, changeFrequency: "weekly", priority: 1 },
    { url: `${baseUrl}/expertises`, lastModified: buildDate, changeFrequency: "monthly", priority: 0.9 },
    { url: `${baseUrl}/secteurs`, lastModified: buildDate, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/villes`, lastModified: buildDate, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/professions`, lastModified: buildDate, changeFrequency: "monthly", priority: 0.9 },
    { url: `${baseUrl}/ressources`, lastModified: buildDate, changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/contact`, lastModified: buildDate, changeFrequency: "yearly", priority: 0.9 },
    { url: `${baseUrl}/annuaire/experts-comptables`, lastModified: buildDate, changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/simulateurs`, lastModified: buildDate, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/qui-sommes-nous`, lastModified: buildDate, changeFrequency: "yearly", priority: 0.6 },
    { url: `${baseUrl}/mentions-legales`, lastModified: buildDate, changeFrequency: "yearly", priority: 0.3 },
    { url: `${baseUrl}/confidentialite`, lastModified: buildDate, changeFrequency: "yearly", priority: 0.3 },
    { url: `${baseUrl}/cgu`, lastModified: buildDate, changeFrequency: "yearly", priority: 0.3 },
  );

  // ─── Simulateurs (registre = source unique) ───
  for (const sim of SIMULATEURS) {
    entries.push({
      url: `${baseUrl}/simulateurs/${sim.slug}`,
      lastModified: buildDate,
      changeFrequency: "monthly",
      priority: 0.7,
    });
  }

  // ─── Public directory pages ───
  // City and cabinet URLs are sourced only from public read methods. Those
  // methods gate on publish_status, confidence_score, documented status, and
  // active establishment status, so candidate-only records never enter the sitemap.
  for (const city of await db.getDirectoryCities()) {
    entries.push({
      url: `${baseUrl}/expert-comptable/${city.slug}`,
      lastModified: buildDate,
      changeFrequency: "weekly",
      priority: 0.6,
    });

    for (const card of await db.getDirectoryCabinetsByCity(city.code_insee, 500)) {
      const name = card.cabinet.display_name ?? card.cabinet.legal_name;
      const enrichmentDate = await db.getDirectoryLatestEnrichmentDateByEstablishment(
        card.establishment.id,
      );
      entries.push({
        url: `${baseUrl}/expert-comptable/${city.slug}/${directoryCabinetSlug(name, card.establishment.siret)}`,
        lastModified: enrichmentDate ? parsePageMetaDate(enrichmentDate, buildDate) : buildDate,
        changeFrequency: "monthly",
        priority: 0.5,
      });
    }
  }

  // ─── Service pages ───
  const services = await db.getServices();
  for (const s of services) {
    entries.push({
      url: `${baseUrl}/expertises/${s.slug}`,
      lastModified: lastmodFor("expertises", s.slug),
      changeFrequency: "monthly",
      priority: 0.8,
    });

    // Service × Secteur — lastmod lue avec la clé pipeline `{svc}__{type}__{dim}`
    const secteurs = await db.getServiceSecteurs(s.slug);
    for (const ss of secteurs) {
      entries.push({
        url: `${baseUrl}/expertises/${s.slug}/${ss.secteur_slug}`,
        lastModified: lastmodFor("expertises", expertisesSlugKey(s.slug, "secteur", ss.secteur_slug)),
        changeFrequency: "monthly",
        priority: 0.6,
      });
    }

    // Service × Ville
    const villes = await db.getServiceVilles(s.slug);
    for (const sv of villes) {
      entries.push({
        url: `${baseUrl}/expertises/${s.slug}/${sv.ville_slug}`,
        lastModified: lastmodFor("expertises", expertisesSlugKey(s.slug, "ville", sv.ville_slug)),
        changeFrequency: "monthly",
        priority: 0.6,
      });
    }

    // Service × Profession
    const professions = await db.getServiceProfessions(s.slug);
    for (const sp of professions) {
      entries.push({
        url: `${baseUrl}/expertises/${s.slug}/${sp.profession_slug}`,
        lastModified: lastmodFor("expertises", expertisesSlugKey(s.slug, "profession", sp.profession_slug)),
        changeFrequency: "monthly",
        priority: 0.6,
      });
    }
  }

  // ─── Secteur pages ───
  const secteurs = await db.getSecteurs();
  for (const s of secteurs) {
    entries.push({
      url: `${baseUrl}/secteurs/${s.slug}`,
      lastModified: lastmodFor("secteurs", s.slug),
      changeFrequency: "monthly",
      priority: 0.7,
    });
  }

  // ─── Ville pages ───
  const villes = await db.getVilles();
  for (const v of villes) {
    entries.push({
      url: `${baseUrl}/villes/${v.slug}`,
      lastModified: lastmodFor("villes", v.slug),
      changeFrequency: "monthly",
      priority: 0.7,
    });
  }

  // ─── Departement pages ───
  const departements = await db.getDepartements();
  for (const d of departements) {
    entries.push({
      url: `${baseUrl}/departements/${d.slug}`,
      lastModified: lastmodFor("departements", d.slug),
      changeFrequency: "monthly",
      priority: 0.6,
    });
  }

  // ─── Profession pages ───
  const allProfessions = await db.getProfessions();
  for (const p of allProfessions) {
    entries.push({
      url: `${baseUrl}/professions/${p.slug}`,
      lastModified: lastmodFor("professions", p.slug),
      changeFrequency: "monthly",
      priority: 0.7,
    });
  }

  // ─── Ressource pages (hubs + clusters + keywords) ───
  // `seenRessources` déduplique : un slug keyword peut coïncider avec un slug
  // hub/cluster (même règle que le Set `seen` de generateStaticParams dans
  // ressources/[theme]/page.tsx).
  const seenRessources = new Set<string>();
  const silos = await db.getSilos();
  for (const silo of silos) {
    const hubs = await db.getHubsBySilo(silo.slug);
    for (const hub of hubs) {
      if (!seenRessources.has(hub.slug)) {
        seenRessources.add(hub.slug);
        entries.push({
          url: `${baseUrl}/ressources/${hub.slug}`,
          lastModified: lastmodFor("ressources", hub.slug),
          changeFrequency: "monthly",
          priority: 0.6,
        });
      }

      const clusters = await db.getClustersByHub(hub.slug);
      for (const c of clusters) {
        if (seenRessources.has(c.slug)) continue;
        seenRessources.add(c.slug);
        entries.push({
          url: `${baseUrl}/ressources/${c.slug}`,
          lastModified: lastmodFor("ressources", c.slug),
          changeFrequency: "monthly",
          priority: 0.5,
        });
      }
    }
  }

  // Keyword pages — construites par generateStaticParams (getAllKeywords)
  // mais historiquement absentes du sitemap (couverture max).
  for (const kw of await db.getAllKeywords()) {
    if (seenRessources.has(kw.slug)) continue;
    seenRessources.add(kw.slug);
    entries.push({
      url: `${baseUrl}/ressources/${kw.slug}`,
      lastModified: lastmodFor("ressources", kw.slug),
      changeFrequency: "monthly",
      priority: 0.4,
    });
  }

  // ─── Couche commerciale / affiliation (/comparatifs, /avis, /codes-parrainage) ───
  // Gating SEO : seules les pages publish_status='published' entrent au sitemap.
  // Tant que le contenu (Gemini) n'est pas généré + publié, ce bloc est vide.
  for (const c of await getPublishedCommercialPages()) {
    entries.push({
      url: `${baseUrl}${c.url}`,
      lastModified: lastmodFor(c.route, c.slug),
      changeFrequency: "weekly",
      priority: 0.6,
    });
  }

  return entries;
}
