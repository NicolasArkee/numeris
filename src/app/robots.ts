import type { MetadataRoute } from "next";
import { AppConfig } from "@/utils/AppConfig";

export default function robots(): MetadataRoute.Robots {
  // Trois sitemaps : contenu (sitemap.xml), pages annuaire villes
  // (sitemap-villes.xml) et fiches cabinet enrichies uniquement
  // (sitemap-fiches.xml — les fiches nues restent noindex et hors sitemap).
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: [
      `${AppConfig.url}/sitemap.xml`,
      `${AppConfig.url}/sitemap-villes.xml`,
      `${AppConfig.url}/sitemap-fiches.xml`,
    ],
  };
}
