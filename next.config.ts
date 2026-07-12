import type { NextConfig } from "next";
import fs from "node:fs";
import path from "node:path";

// 301 générés par scripts/triage-keyword-pages.ts (keyword_pages /ressources
// redirigées vers leur cible canonique : annuaire ville, secteur, profession,
// keeper de fusion). Régénérer via `npx tsx scripts/triage-keyword-pages.ts`.
function loadRessourcesRedirects(): { source: string; destination: string; permanent: boolean }[] {
  const p = path.join(process.cwd(), "data", "redirects-ressources.json");
  if (!fs.existsSync(p)) return [];
  return JSON.parse(fs.readFileSync(p, "utf-8"));
}

const nextConfig: NextConfig = {
  devIndicators: false,
  // better-sqlite3 reste pour les scripts CLI (seed / migrate-supabase) ; l'app
  // (routes + sitemap + couche commerciale) lit désormais 100% Supabase → plus
  // aucune lecture de numeris.db au build/runtime (tracing supprimé, db dé-uploadée).
  serverExternalPackages: ["better-sqlite3"],
  async redirects() {
    return loadRessourcesRedirects();
  },
};

export default nextConfig;
