const ALLOWED_TOP_LEVEL_TYPES = new Set([
  "Dataset",
  "SearchResultsPage",
  "WebPage",
]);

const FORBIDDEN_PROVIDER_TYPES = new Set([
  "AccountingService",
  "FinancialService",
  "LocalBusiness",
  "ProfessionalService",
  "TaxPreparation",
]);

const PROVIDER_RELATION_KEYS = new Set(["provider", "seller", "serviceProvider"]);
const MAX_RAW_LENGTH = 200_000;
const MAX_ENTRIES = 25;
const MAX_DEPTH = 12;

type JsonLdRecord = Record<string, unknown>;

export interface ExtraJsonLdValidation {
  entries: JsonLdRecord[];
  issues: string[];
}

function isRecord(value: unknown): value is JsonLdRecord {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function getTypes(value: JsonLdRecord): string[] {
  const raw = value["@type"];
  if (typeof raw === "string") return raw.trim() ? [raw.trim()] : [];
  if (!Array.isArray(raw)) return [];
  return raw.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
}

function referencesSkoria(value: unknown): boolean {
  if (typeof value === "string") return /(?:^|[^a-z])skoria(?:[^a-z]|$)/iu.test(value);
  if (Array.isArray(value)) return value.some(referencesSkoria);
  if (!isRecord(value)) return false;
  return Object.values(value).some(referencesSkoria);
}

function inspectNestedValue(
  value: unknown,
  issues: string[],
  path: string,
  depth = 0,
): void {
  if (depth > MAX_DEPTH) {
    issues.push(`${path}: profondeur JSON-LD excessive`);
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((item, index) => inspectNestedValue(item, issues, `${path}[${index}]`, depth + 1));
    return;
  }
  if (!isRecord(value)) return;

  const types = getTypes(value);
  for (const type of types) {
    if (FORBIDDEN_PROVIDER_TYPES.has(type)) {
      issues.push(`${path}: le type ${type} est réservé aux fiches de professionnels documentées`);
    }
  }

  for (const [key, nested] of Object.entries(value)) {
    if (PROVIDER_RELATION_KEYS.has(key) && referencesSkoria(nested)) {
      issues.push(`${path}.${key}: Skoria ne peut pas être présenté comme prestataire ou vendeur`);
    }
    inspectNestedValue(nested, issues, `${path}.${key}`, depth + 1);
  }
}

function hasText(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function validateFaqPage(entry: JsonLdRecord, issues: string[], path: string): void {
  const questions = entry.mainEntity;
  if (!Array.isArray(questions) || questions.length === 0) {
    issues.push(`${path}.mainEntity: une FAQPage doit contenir des questions visibles`);
    return;
  }
  questions.forEach((question, index) => {
    const questionPath = `${path}.mainEntity[${index}]`;
    if (!isRecord(question) || !getTypes(question).includes("Question") || !hasText(question.name)) {
      issues.push(`${questionPath}: Question invalide`);
      return;
    }
    const answer = question.acceptedAnswer;
    if (!isRecord(answer) || !getTypes(answer).includes("Answer") || !hasText(answer.text)) {
      issues.push(`${questionPath}.acceptedAnswer: Answer invalide`);
    }
  });
}

function validateRequiredShape(entry: JsonLdRecord, types: string[], issues: string[], path: string): void {
  if (types.includes("FAQPage")) validateFaqPage(entry, issues, path);
  if (types.includes("Article") && !hasText(entry.headline)) {
    issues.push(`${path}.headline: un Article doit avoir un titre`);
  }
  if ((types.includes("BreadcrumbList") || types.includes("ItemList")) && !Array.isArray(entry.itemListElement)) {
    issues.push(`${path}.itemListElement: la liste doit être un tableau`);
  }
  if ((types.includes("Product") || types.includes("SoftwareApplication")) && !hasText(entry.name)) {
    issues.push(`${path}.name: le schéma doit avoir un nom`);
  }
}

function extractEntries(parsed: unknown, issues: string[]): JsonLdRecord[] {
  const candidates = Array.isArray(parsed) ? parsed : [parsed];
  const entries: JsonLdRecord[] = [];
  candidates.forEach((candidate, index) => {
    if (!isRecord(candidate)) {
      issues.push(`$[${index}]: une entrée JSON-LD doit être un objet`);
      return;
    }
    if (Array.isArray(candidate["@graph"])) {
      candidate["@graph"].forEach((entry, graphIndex) => {
        if (isRecord(entry)) entries.push(entry);
        else issues.push(`$[${index}].@graph[${graphIndex}]: entrée invalide`);
      });
      return;
    }
    entries.push(candidate);
  });
  return entries;
}

export function validateExtraJsonLdValue(parsed: unknown): ExtraJsonLdValidation {
  const issues: string[] = [];
  const candidates = extractEntries(parsed, issues);
  if (candidates.length > MAX_ENTRIES) {
    issues.push(`$: ${candidates.length} entrées dépassent la limite de ${MAX_ENTRIES}`);
  }

  const entries = candidates.slice(0, MAX_ENTRIES).filter((entry, index) => {
    const entryIssues: string[] = [];
    const path = `$[${index}]`;
    const context = entry["@context"];
    if (context !== undefined && context !== "https://schema.org" && context !== "http://schema.org") {
      entryIssues.push(`${path}.@context: contexte non autorisé`);
    }
    const types = getTypes(entry);
    if (types.length === 0 || types.some((type) => !ALLOWED_TOP_LEVEL_TYPES.has(type))) {
      entryIssues.push(`${path}.@type: type de schéma non autorisé`);
    }
    validateRequiredShape(entry, types, entryIssues, path);
    inspectNestedValue(entry, entryIssues, path);
    issues.push(...entryIssues);
    return entryIssues.length === 0;
  });

  return { entries, issues };
}

export function parseExtraJsonLd(raw: string | null | undefined): ExtraJsonLdValidation {
  if (!raw) return { entries: [], issues: [] };
  if (raw.length > MAX_RAW_LENGTH) {
    return { entries: [], issues: [`$: contenu JSON-LD supérieur à ${MAX_RAW_LENGTH} caractères`] };
  }
  try {
    return validateExtraJsonLdValue(JSON.parse(raw) as unknown);
  } catch {
    return { entries: [], issues: ["$: JSON-LD illisible"] };
  }
}

/** Escape the characters that can terminate or alter an inline script node. */
export function serializeJsonLdForHtml(entry: JsonLdRecord): string {
  return JSON.stringify(entry)
    .replace(/</g, "\\u003c")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}
