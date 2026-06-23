import { AppConfig } from "@/utils/AppConfig";

// Reuse the same OG image composition for Twitter cards.
// Constants are declared explicitly (not re-exported) so Next.js can read them
// without resolving the source module.
export const runtime = "edge";
export const alt = `${AppConfig.name} — comparateur indépendant des experts-comptables en Europe`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export { default } from "./opengraph-image";
