import {
  SKORIA_V2_COVERAGE_STATES,
  SKORIA_V2_DATA_SOURCES,
  SKORIA_V2_KEY_STRATEGIES,
  SKORIA_V2_SCHEMA_TYPES,
  SKORIA_V2_TEMPLATE_FAMILIES,
  SKORIA_V2_TEMPLATE_IDS,
  type SkoriaV2MediaRegistryFile,
  type SkoriaV2TemplateId,
  type SkoriaV2TemplateRegistryFile,
  type ValidationIssue,
  type ValidationResult,
} from "./types";

const TEMPLATE_IDS = new Set<string>(SKORIA_V2_TEMPLATE_IDS);
const TEMPLATE_FAMILIES = new Set<string>(SKORIA_V2_TEMPLATE_FAMILIES);
const DATA_SOURCES = new Set<string>(SKORIA_V2_DATA_SOURCES);
const COVERAGE_STATES = new Set<string>(SKORIA_V2_COVERAGE_STATES);
const KEY_STRATEGIES = new Set<string>(SKORIA_V2_KEY_STRATEGIES);
const SCHEMA_TYPES = new Set<string>(SKORIA_V2_SCHEMA_TYPES);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every(isNonEmptyString);
}

function addIssue(issues: ValidationIssue[], path: string, message: string): void {
  issues.push({ path, message });
}

function result(issues: ValidationIssue[]): ValidationResult {
  return { valid: issues.length === 0, issues };
}

function checkStringArray(
  value: unknown,
  path: string,
  issues: ValidationIssue[],
  options: { nonEmpty?: boolean } = {},
): void {
  if (!isStringArray(value)) {
    addIssue(issues, path, "must be an array of non-empty strings");
    return;
  }
  if (options.nonEmpty && value.length === 0) {
    addIssue(issues, path, "must not be empty");
  }
}

export function validateTemplateRegistry(input: unknown): ValidationResult {
  const issues: ValidationIssue[] = [];
  if (!isRecord(input)) {
    return result([{ path: "$", message: "must be an object" }]);
  }
  if (!Number.isInteger(input.schemaVersion) || Number(input.schemaVersion) < 1) {
    addIssue(issues, "$.schemaVersion", "must be a positive integer");
  }
  if (!Array.isArray(input.templates)) {
    addIssue(issues, "$.templates", "must be an array");
    return result(issues);
  }

  const seenIds = new Set<string>();
  const seenPatterns = new Set<string>();

  input.templates.forEach((raw, index) => {
    const path = `$.templates[${index}]`;
    if (!isRecord(raw)) {
      addIssue(issues, path, "must be an object");
      return;
    }

    if (!isNonEmptyString(raw.id) || !TEMPLATE_IDS.has(raw.id)) {
      addIssue(issues, `${path}.id`, "is not a registered template id");
    } else if (seenIds.has(raw.id)) {
      addIssue(issues, `${path}.id`, "must be unique");
    } else {
      seenIds.add(raw.id);
    }

    if (!isNonEmptyString(raw.title)) {
      addIssue(issues, `${path}.title`, "must be a non-empty string");
    }
    if (!isNonEmptyString(raw.routePattern) || !raw.routePattern.startsWith("/")) {
      addIssue(issues, `${path}.routePattern`, "must be an absolute site path");
    } else if (seenPatterns.has(raw.routePattern)) {
      addIssue(issues, `${path}.routePattern`, "must be unique");
    } else {
      seenPatterns.add(raw.routePattern);
    }
    if (!isNonEmptyString(raw.examplePath) || !raw.examplePath.startsWith("/")) {
      addIssue(issues, `${path}.examplePath`, "must be an absolute site path");
    }
    if (!isNonEmptyString(raw.family) || !TEMPLATE_FAMILIES.has(raw.family)) {
      addIssue(issues, `${path}.family`, "is not a supported family");
    }

    if (!isRecord(raw.dataBinding)) {
      addIssue(issues, `${path}.dataBinding`, "must be an object");
    } else {
      const binding = raw.dataBinding;
      if (!isNonEmptyString(binding.source) || !DATA_SOURCES.has(binding.source)) {
        addIssue(issues, `${path}.dataBinding.source`, "is not supported");
      }
      if (binding.route !== null && !isNonEmptyString(binding.route)) {
        addIssue(issues, `${path}.dataBinding.route`, "must be null or a non-empty string");
      }
      if (!isNonEmptyString(binding.keyStrategy) || !KEY_STRATEGIES.has(binding.keyStrategy)) {
        addIssue(issues, `${path}.dataBinding.keyStrategy`, "is not supported");
      }
      if (!isNonEmptyString(binding.currentCoverage) || !COVERAGE_STATES.has(binding.currentCoverage)) {
        addIssue(issues, `${path}.dataBinding.currentCoverage`, "is not supported");
      }
      checkStringArray(binding.existingFields, `${path}.dataBinding.existingFields`, issues);
      checkStringArray(binding.missingFields, `${path}.dataBinding.missingFields`, issues);
    }

    if (!isRecord(raw.content)) {
      addIssue(issues, `${path}.content`, "must be an object");
    } else {
      const content = raw.content;
      const minWords = Number(content.minWords);
      const maxWords = Number(content.maxWords);
      if (!Number.isInteger(minWords) || minWords < 0) {
        addIssue(issues, `${path}.content.minWords`, "must be a non-negative integer");
      }
      if (!Number.isInteger(maxWords) || maxWords < minWords) {
        addIssue(issues, `${path}.content.maxWords`, "must be an integer greater than or equal to minWords");
      }
      checkStringArray(content.requiredBlocks, `${path}.content.requiredBlocks`, issues, { nonEmpty: true });
      checkStringArray(content.recommendedBlocks, `${path}.content.recommendedBlocks`, issues);
      if (!Number.isInteger(content.faqMinItems) || Number(content.faqMinItems) < 0) {
        addIssue(issues, `${path}.content.faqMinItems`, "must be a non-negative integer");
      }
      if (typeof content.requiresCitations !== "boolean") {
        addIssue(issues, `${path}.content.requiresCitations`, "must be a boolean");
      }
    }

    if (!isRecord(raw.seo)) {
      addIssue(issues, `${path}.seo`, "must be an object");
    } else {
      const seo = raw.seo;
      if (!Array.isArray(seo.schemaTypes) || seo.schemaTypes.length === 0) {
        addIssue(issues, `${path}.seo.schemaTypes`, "must be a non-empty array");
      } else {
        seo.schemaTypes.forEach((schemaType, schemaIndex) => {
          if (!isNonEmptyString(schemaType) || !SCHEMA_TYPES.has(schemaType)) {
            addIssue(issues, `${path}.seo.schemaTypes[${schemaIndex}]`, "is not supported");
          }
          if (schemaType === "Article" && raw.id !== "article") {
            addIssue(issues, `${path}.seo.schemaTypes[${schemaIndex}]`, "Article is reserved for the article template");
          }
        });
      }
      for (const key of [
        "indexRequiresPublished",
        "commercialDisclosure",
        "forbidSkoriaProviderClaim",
      ]) {
        if (typeof seo[key] !== "boolean") {
          addIssue(issues, `${path}.seo.${key}`, "must be a boolean");
        }
      }
    }

    checkStringArray(raw.mediaRoles, `${path}.mediaRoles`, issues);
    checkStringArray(raw.interactions, `${path}.interactions`, issues);
    if (!Array.isArray(raw.journeyTargets)) {
      addIssue(issues, `${path}.journeyTargets`, "must be an array");
    } else {
      raw.journeyTargets.forEach((target, targetIndex) => {
        if (!isNonEmptyString(target) || !TEMPLATE_IDS.has(target)) {
          addIssue(issues, `${path}.journeyTargets[${targetIndex}]`, "must reference a registered template id");
        }
      });
    }
  });

  for (const id of SKORIA_V2_TEMPLATE_IDS) {
    if (!seenIds.has(id)) addIssue(issues, "$.templates", `missing template ${id}`);
  }
  if (input.templates.length !== SKORIA_V2_TEMPLATE_IDS.length) {
    addIssue(
      issues,
      "$.templates",
      `must contain exactly ${SKORIA_V2_TEMPLATE_IDS.length} V2 templates`,
    );
  }

  return result(issues);
}

export function validateMediaRegistry(input: unknown): ValidationResult {
  const issues: ValidationIssue[] = [];
  if (!isRecord(input)) {
    return result([{ path: "$", message: "must be an object" }]);
  }
  if (!Number.isInteger(input.schemaVersion) || Number(input.schemaVersion) < 1) {
    addIssue(issues, "$.schemaVersion", "must be a positive integer");
  }
  if (!Array.isArray(input.assets)) {
    addIssue(issues, "$.assets", "must be an array");
    return result(issues);
  }

  const ids = new Set<string>();
  input.assets.forEach((raw, index) => {
    const path = `$.assets[${index}]`;
    if (!isRecord(raw)) {
      addIssue(issues, path, "must be an object");
      return;
    }
    if (!isNonEmptyString(raw.id)) {
      addIssue(issues, `${path}.id`, "must be a non-empty string");
    } else if (ids.has(raw.id)) {
      addIssue(issues, `${path}.id`, "must be unique");
    } else {
      ids.add(raw.id);
    }
    if (!isNonEmptyString(raw.status)) {
      addIssue(issues, `${path}.status`, "must be set");
    }
    if (!isNonEmptyString(raw.src) || !raw.src.startsWith("/")) {
      addIssue(issues, `${path}.src`, "must be an absolute site asset path");
    }
    if (!isNonEmptyString(raw.alt)) addIssue(issues, `${path}.alt`, "must be non-empty");
    if (!Number.isInteger(raw.width) || Number(raw.width) <= 0) {
      addIssue(issues, `${path}.width`, "must be a positive integer");
    }
    if (!Number.isInteger(raw.height) || Number(raw.height) <= 0) {
      addIssue(issues, `${path}.height`, "must be a positive integer");
    }
    checkStringArray(raw.roles, `${path}.roles`, issues, { nonEmpty: true });
    if (!Array.isArray(raw.templateIds) || raw.templateIds.length === 0) {
      addIssue(issues, `${path}.templateIds`, "must be a non-empty array");
    } else {
      raw.templateIds.forEach((id, idIndex) => {
        if (!isNonEmptyString(id) || !TEMPLATE_IDS.has(id)) {
          addIssue(issues, `${path}.templateIds[${idIndex}]`, "must reference a registered template id");
        }
      });
    }
  });
  return result(issues);
}

export function validateContentPolicy(input: unknown): ValidationResult {
  const issues: ValidationIssue[] = [];
  if (!isRecord(input)) return result([{ path: "$", message: "must be an object" }]);
  if (!Number.isInteger(input.schemaVersion) || Number(input.schemaVersion) < 1) {
    addIssue(issues, "$.schemaVersion", "must be a positive integer");
  }
  if (!isRecord(input.publication)) {
    addIssue(issues, "$.publication", "must be an object");
  } else {
    if (input.publication.publicStatus !== "published") {
      addIssue(issues, "$.publication.publicStatus", "must be published");
    }
    for (const key of [
      "pageMetaRequired",
      "denyWhenPageMetaMissing",
      "hideSectionsWhenNonPublic",
      "hideSeoOverridesWhenNonPublic",
      "commercialPageRequiresPublishedStatus",
    ]) {
      if (input.publication[key] !== true) {
        addIssue(issues, `$.publication.${key}`, "must be true for fail-closed publication");
      }
    }
  }
  for (const key of ["databaseContract", "sectionPayloads", "seo", "commercialFacts"]) {
    if (!isRecord(input[key])) addIssue(issues, `$.${key}`, "must be an object");
  }
  return result(issues);
}

export function validateContentInventory(input: unknown): ValidationResult {
  const issues: ValidationIssue[] = [];
  if (!isRecord(input)) return result([{ path: "$", message: "must be an object" }]);
  if (!Number.isInteger(input.schemaVersion) || Number(input.schemaVersion) < 1) {
    addIssue(issues, "$.schemaVersion", "must be a positive integer");
  }
  if (!isRecord(input.snapshot) || !isRecord(input.snapshot.counts)) {
    addIssue(issues, "$.snapshot.counts", "must be an object");
  }
  if (!Array.isArray(input.sourceMap) || input.sourceMap.length === 0) {
    addIssue(issues, "$.sourceMap", "must be a non-empty array");
  }
  if (!Array.isArray(input.representativePages)) {
    addIssue(issues, "$.representativePages", "must be an array");
  } else {
    input.representativePages.forEach((raw, index) => {
      const path = `$.representativePages[${index}]`;
      if (!isRecord(raw) || !isNonEmptyString(raw.templateId) || !TEMPLATE_IDS.has(raw.templateId)) {
        addIssue(issues, `${path}.templateId`, "must reference a registered template id");
      }
    });
  }
  if (!Array.isArray(input.migrationOrder) || input.migrationOrder.length === 0) {
    addIssue(issues, "$.migrationOrder", "must be a non-empty array");
  } else {
    input.migrationOrder.forEach((raw, index) => {
      const path = `$.migrationOrder[${index}]`;
      if (!isRecord(raw)) {
        addIssue(issues, path, "must be an object");
        return;
      }
      if (raw.order !== index + 1) addIssue(issues, `${path}.order`, "must be contiguous and one-based");
      if (!isNonEmptyString(raw.name)) addIssue(issues, `${path}.name`, "must be non-empty");
      if (typeof raw.writesRuntimeDatabase !== "boolean") {
        addIssue(issues, `${path}.writesRuntimeDatabase`, "must be a boolean");
      }
      checkStringArray(raw.requirements, `${path}.requirements`, issues, { nonEmpty: true });
    });
  }
  return result(issues);
}

export function mergeValidationResults(...results: ValidationResult[]): ValidationResult {
  return result(results.flatMap((entry) => entry.issues));
}

export function assertValidRegistry(
  name: string,
  validation: ValidationResult,
): asserts validation is ValidationResult & { valid: true } {
  if (validation.valid) return;
  const detail = validation.issues
    .map((issue) => `${issue.path}: ${issue.message}`)
    .join("\n");
  throw new Error(`Invalid Skoria V2 ${name}:\n${detail}`);
}

/** Cast only after its corresponding validator has passed. */
export function asTemplateRegistry(input: unknown): SkoriaV2TemplateRegistryFile {
  const validation = validateTemplateRegistry(input);
  assertValidRegistry("template registry", validation);
  return input as SkoriaV2TemplateRegistryFile;
}

/** Cast only after its corresponding validator has passed. */
export function asMediaRegistry(input: unknown): SkoriaV2MediaRegistryFile {
  const validation = validateMediaRegistry(input);
  assertValidRegistry("media registry", validation);
  return input as SkoriaV2MediaRegistryFile;
}

export function isSkoriaV2TemplateId(value: string): value is SkoriaV2TemplateId {
  return TEMPLATE_IDS.has(value);
}
