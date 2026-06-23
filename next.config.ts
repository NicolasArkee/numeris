import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  serverExternalPackages: ["better-sqlite3"],
  // Les routes commerciales + le sitemap lisent numeris.db en direct (better-sqlite3,
  // process.cwd()/numeris.db) avec dynamicParams=true + ISR revalidate → exécution au
  // runtime. En serverless le fichier n'est pas tracé par défaut → on l'embarque dans
  // ces fonctions pour que les lectures sqlite runtime fonctionnent sur Vercel.
  // (Band-aid : à retirer quand la couche commerciale lira Supabase comme le reste.)
  outputFileTracingIncludes: {
    "/comparatifs": ["./numeris.db"],
    "/comparatifs/**": ["./numeris.db"],
    "/avis": ["./numeris.db"],
    "/avis/**": ["./numeris.db"],
    "/codes-parrainage": ["./numeris.db"],
    "/codes-parrainage/**": ["./numeris.db"],
    "/sitemap.xml": ["./numeris.db"],
  },
};

export default nextConfig;
