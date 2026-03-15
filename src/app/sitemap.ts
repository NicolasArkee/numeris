import type { MetadataRoute } from "next";
import { AppConfig } from "@/utils/AppConfig";
import { db } from "@/libs/db";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = AppConfig.url;
  const now = new Date();

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${baseUrl}/nos-expertises`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/equipe`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/formules`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.9,
    },
  ];

  // Dynamic service pages
  const services = db.getServices();
  const servicePages: MetadataRoute.Sitemap = services.map((s) => ({
    url: `${baseUrl}/nos-expertises/${s.slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [...staticPages, ...servicePages];
}
