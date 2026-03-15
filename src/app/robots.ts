import type { MetadataRoute } from "next";
import { AppConfig } from "@/utils/AppConfig";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: `${AppConfig.url}/sitemap.xml`,
  };
}
