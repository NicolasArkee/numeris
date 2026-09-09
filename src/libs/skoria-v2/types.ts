/**
 * Stable, framework-agnostic contracts for the Skoria V2 page registry.
 *
 * The JSON files deliberately describe content and UX requirements rather
 * than React component props. A route can therefore change its visual
 * implementation without forcing a content migration.
 */

export const SKORIA_V2_TEMPLATE_IDS = [
  "home",
  "profession",
  "service",
  "cross",
  "sector",
  "directory",
  "city",
  "profile",
  "hub",
  "article",
  "comparison",
  "review",
  "offer",
  "professions-hub",
  "sectors-hub",
  "services-hub",
  "guides-hub",
  "sub-hub",
  "resources-hub",
  "reviews-hub",
  "offers-hub",
  "tools-hub",
  "documents-hub",
  "geo-hub",
] as const;

export type SkoriaV2TemplateId = (typeof SKORIA_V2_TEMPLATE_IDS)[number];

export const SKORIA_V2_TEMPLATE_FAMILIES = [
  "home",
  "landing",
  "directory",
  "editorial",
  "commercial",
  "hub",
] as const;

export type SkoriaV2TemplateFamily =
  (typeof SKORIA_V2_TEMPLATE_FAMILIES)[number];

export const SKORIA_V2_DATA_SOURCES = [
  "static",
  "taxonomy",
  "page_sections",
  "directory",
  "commercial_pages",
  "registry",
  "hybrid",
] as const;

export type SkoriaV2DataSource = (typeof SKORIA_V2_DATA_SOURCES)[number];

export const SKORIA_V2_COVERAGE_STATES = [
  "live",
  "complete",
  "partial",
  "missing",
  "draft-only",
] as const;

export type SkoriaV2CoverageState =
  (typeof SKORIA_V2_COVERAGE_STATES)[number];

export const SKORIA_V2_KEY_STRATEGIES = [
  "fixed",
  "slug",
  "expertise-composite",
  "guide-segments",
  "commercial-slug",
  "directory-siret",
  "registry",
] as const;

export type SkoriaV2KeyStrategy =
  (typeof SKORIA_V2_KEY_STRATEGIES)[number];

export const SKORIA_V2_SCHEMA_TYPES = [
  "WebPage",
  "CollectionPage",
  "ItemList",
  "SearchResultsPage",
  "ProfilePage",
  "Article",
  "FAQPage",
  "HowTo",
  "SoftwareApplication",
  "Offer",
  "BreadcrumbList",
] as const;

export type SkoriaV2SchemaType = (typeof SKORIA_V2_SCHEMA_TYPES)[number];

export interface SkoriaV2DataBinding {
  source: SkoriaV2DataSource;
  /** Value used in page_sections/page_meta/seo_overrides when applicable. */
  route: string | null;
  keyStrategy: SkoriaV2KeyStrategy;
  currentCoverage: SkoriaV2CoverageState;
  /** Concrete fields already available in the audited data stores. */
  existingFields: string[];
  /** Fields or datasets that must be added before the V2 template is complete. */
  missingFields: string[];
}

export interface SkoriaV2ContentRequirements {
  /** Editorial body target; UI labels and navigation are excluded. */
  minWords: number;
  maxWords: number;
  requiredBlocks: string[];
  recommendedBlocks: string[];
  faqMinItems: number;
  requiresCitations: boolean;
}

export interface SkoriaV2SeoRequirements {
  schemaTypes: SkoriaV2SchemaType[];
  indexRequiresPublished: boolean;
  commercialDisclosure: boolean;
  /** Prevents Skoria being presented as the regulated professional/provider. */
  forbidSkoriaProviderClaim: boolean;
}

export interface SkoriaV2TemplateConfig {
  id: SkoriaV2TemplateId;
  title: string;
  routePattern: string;
  examplePath: string;
  family: SkoriaV2TemplateFamily;
  dataBinding: SkoriaV2DataBinding;
  content: SkoriaV2ContentRequirements;
  seo: SkoriaV2SeoRequirements;
  mediaRoles: string[];
  interactions: string[];
  journeyTargets: SkoriaV2TemplateId[];
}

export interface SkoriaV2TemplateRegistryFile {
  schemaVersion: number;
  templates: SkoriaV2TemplateConfig[];
}

export interface SkoriaV2MediaAsset {
  id: string;
  status: string;
  src: string;
  alt: string;
  width: number;
  height: number;
  roles: string[];
  templateIds: SkoriaV2TemplateId[];
  [key: string]: unknown;
}

export interface SkoriaV2MediaRegistryFile {
  schemaVersion: number;
  assets: SkoriaV2MediaAsset[];
}

export interface ValidationIssue {
  path: string;
  message: string;
}

export interface ValidationResult {
  valid: boolean;
  issues: ValidationIssue[];
}
