import type { MetadataRoute } from "next";
import { AppConfig } from "@/utils/AppConfig";

export default function robots(): MetadataRoute.Robots {
  // Candidate directory URLs may be rendered for user exploration, but their
  // route metadata is noindex. Sitemap inclusion still uses only documented
  // directory reads gated on publish_status, confidence_score, and active status.
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: `${AppConfig.url}/sitemap.xml`,
  };
}
