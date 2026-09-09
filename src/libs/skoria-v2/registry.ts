import contentInventoryJson from "@/data/skoria-v2/content-inventory.json";
import contentPolicyJson from "@/data/skoria-v2/content-policy.json";
import mediaJson from "@/data/skoria-v2/media.json";
import templatesJson from "@/data/skoria-v2/templates.json";
import type {
  SkoriaV2MediaAsset,
  SkoriaV2TemplateConfig,
  SkoriaV2TemplateFamily,
  SkoriaV2TemplateId,
  ValidationResult,
} from "./types";
import {
  asMediaRegistry,
  asTemplateRegistry,
  assertValidRegistry,
  mergeValidationResults,
  validateContentInventory,
  validateContentPolicy,
  validateMediaRegistry,
  validateTemplateRegistry,
} from "./validation";

const rawTemplates: unknown = templatesJson;
const rawMedia: unknown = mediaJson;
const rawPolicy: unknown = contentPolicyJson;
const rawInventory: unknown = contentInventoryJson;

const templateRegistry = asTemplateRegistry(rawTemplates);
const mediaRegistry = asMediaRegistry(rawMedia);

export const SKORIA_V2_TEMPLATES: readonly SkoriaV2TemplateConfig[] =
  templateRegistry.templates;
export const SKORIA_V2_MEDIA: readonly SkoriaV2MediaAsset[] = mediaRegistry.assets;
export const SKORIA_V2_CONTENT_POLICY = contentPolicyJson;
export const SKORIA_V2_CONTENT_INVENTORY = contentInventoryJson;

const templatesById = new Map(
  SKORIA_V2_TEMPLATES.map((template) => [template.id, template]),
);
const mediaById = new Map(SKORIA_V2_MEDIA.map((asset) => [asset.id, asset]));

export const SKORIA_V2_VALIDATION: ValidationResult = mergeValidationResults(
  validateTemplateRegistry(rawTemplates),
  validateMediaRegistry(rawMedia),
  validateContentPolicy(rawPolicy),
  validateContentInventory(rawInventory),
);

assertValidRegistry("content registry", SKORIA_V2_VALIDATION);

export function getTemplateById(
  id: SkoriaV2TemplateId,
): SkoriaV2TemplateConfig | undefined {
  return templatesById.get(id);
}

export function requireTemplateById(
  id: SkoriaV2TemplateId,
): SkoriaV2TemplateConfig {
  const template = getTemplateById(id);
  if (!template) throw new Error(`Unknown Skoria V2 template: ${id}`);
  return template;
}

export function listTemplatesByFamily(
  family: SkoriaV2TemplateFamily,
): SkoriaV2TemplateConfig[] {
  return SKORIA_V2_TEMPLATES.filter((template) => template.family === family);
}

function normalizePathname(input: string): string {
  const withoutOrigin = input.replace(/^https?:\/\/[^/]+/i, "");
  const pathname = withoutOrigin.split(/[?#]/, 1)[0] || "/";
  if (pathname === "/") return pathname;
  return `/${pathname.replace(/^\/+|\/+$/g, "")}`;
}

function patternScore(pattern: string): number {
  return pattern
    .split("/")
    .filter(Boolean)
    .reduce((score, segment) => score + (segment.startsWith("{") ? 1 : 10), 0);
}

function patternToRegExp(pattern: string): RegExp {
  if (pattern === "/") return /^\/$/;
  const source = pattern
    .split("/")
    .filter(Boolean)
    .map((segment) => {
      if (/^\{[^}]+\}$/.test(segment)) return "[^/]+";
      return segment.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    })
    .join("/");
  return new RegExp(`^/${source}/?$`);
}

const templatesBySpecificity = [...SKORIA_V2_TEMPLATES].sort(
  (a, b) => patternScore(b.routePattern) - patternScore(a.routePattern),
);

/** Resolve a pathname, absolute URL, or pathname with query/hash to its V2 contract. */
export function getTemplateForPath(path: string): SkoriaV2TemplateConfig | undefined {
  const pathname = normalizePathname(path);
  return templatesBySpecificity.find((template) =>
    patternToRegExp(template.routePattern).test(pathname),
  );
}

export function getMediaById(id: string): SkoriaV2MediaAsset | undefined {
  return mediaById.get(id);
}

export function getMediaForTemplate(
  templateId: SkoriaV2TemplateId,
  options: { approvedOnly?: boolean } = {},
): SkoriaV2MediaAsset[] {
  const { approvedOnly = true } = options;
  return SKORIA_V2_MEDIA.filter(
    (asset) =>
      asset.templateIds.includes(templateId)
      && (!approvedOnly || asset.status === "approved"),
  );
}
