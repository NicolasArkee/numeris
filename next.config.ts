import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  // better-sqlite3 reste pour les scripts CLI (seed / migrate-supabase) ; l'app
  // (routes + sitemap + couche commerciale) lit désormais 100% Supabase → plus
  // aucune lecture de numeris.db au build/runtime (tracing supprimé, db dé-uploadée).
  serverExternalPackages: ["better-sqlite3"],
};

export default nextConfig;
