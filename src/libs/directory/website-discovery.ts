export type DirectoryWebsiteDiscoveryInput = {
  siret: string;
  cabinetName: string;
  cityName: string;
  addressLine1?: string | null;
  postalCode?: string | null;
};

export type DirectoryWebsiteDiscoveryCandidate = {
  url: string;
  finalUrl: string;
  score: number;
  reasons: string[];
  matchedSiret: boolean;
  status: "accepted" | "rejected" | "unreachable";
};

export type DirectoryWebsiteDiscoveryResult = {
  accepted: DirectoryWebsiteDiscoveryCandidate | null;
  candidates: DirectoryWebsiteDiscoveryCandidate[];
};

type DiscoveryFetchResponse = {
  ok: boolean;
  status: number;
  url: string;
  text: () => Promise<string>;
  headers?: {
    get: (name: string) => string | null;
  };
};

type DiscoveryFetch = (
  url: string,
  init?: { headers?: Record<string, string>; signal?: AbortSignal },
) => Promise<DiscoveryFetchResponse>;

export type DirectoryWebsiteDiscoveryOptions = {
  fetch?: DiscoveryFetch;
  candidateUrls?: string[];
  timeoutMs?: number;
  userAgent?: string;
};

const DEFAULT_TIMEOUT_MS = 5_000;
const DEFAULT_USER_AGENT = "SkoriaDirectoryBot/1.0 (+https://www.skoria.fr)";
const MAX_CANDIDATE_URLS = 12;
const ACCEPTANCE_SCORE = 65;

const COMPANY_STOP_WORDS = new Set([
  "audit",
  "aux",
  "cabinet",
  "commissariat",
  "compte",
  "comptes",
  "conseil",
  "conseils",
  "consultants",
  "de",
  "des",
  "du",
  "en",
  "expert",
  "experts",
  "expertise",
  "comptable",
  "comptables",
  "fiscal",
  "fiscale",
  "gestion",
  "administrative",
  "liberales",
  "nationale",
  "professions",
  "regionale",
  "associe",
  "associes",
  "association",
  "societe",
  "sarl",
  "sas",
  "selarl",
  "eurl",
  "sa",
  "scop",
  "groupe",
]);

const ACCOUNTING_PATTERNS = [
  "expertise comptable",
  "expert comptable",
  "experts comptables",
  "comptabilite",
  "commissariat aux comptes",
  "audit legal",
  "paie",
  "fiscalite",
  "declaration fiscale",
];

function normalizeText(value: string): string {
  return value
    .normalize("NFD")
    .replaceAll(/\p{Diacritic}/gu, "")
    .toLowerCase();
}

function compactText(value: string): string {
  return value.replaceAll(/\s+/g, " ").trim();
}

function decodeHtmlEntities(value: string): string {
  return value
    .replaceAll("&nbsp;", " ")
    .replaceAll("&amp;", "&")
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'")
    .replaceAll("&apos;", "'")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">");
}

function stripHtml(value: string): string {
  return compactText(
    decodeHtmlEntities(
      value
        .replaceAll(/<script[\s\S]*?<\/script>/gi, " ")
        .replaceAll(/<style[\s\S]*?<\/style>/gi, " ")
        .replaceAll(/<[^>]+>/g, " "),
    ),
  );
}

function toSlugTokens(value: string): string[] {
  return normalizeText(value)
    .replaceAll(/[^a-z0-9]+/g, " ")
    .split(/\s+/)
    .map((token) => token.trim())
    .filter((token) => token.length >= 2);
}

function meaningfulTokens(value: string): string[] {
  return [...new Set(toSlugTokens(value).filter((token) => !COMPANY_STOP_WORDS.has(token)))];
}

function parentheticalParts(value: string): string[] {
  return [...value.matchAll(/\(([^)]+)\)/g)]
    .map((match) => match[1]?.trim() ?? "")
    .filter(Boolean);
}

function domainRootFromTokens(tokens: string[], separator: "" | "-"): string | null {
  const filtered = tokens.filter((token) => token.length >= 2);
  if (filtered.length === 0) return null;
  return filtered.slice(0, 4).join(separator);
}

function rootsFromName(cabinetName: string): string[] {
  const parts = [cabinetName, ...parentheticalParts(cabinetName)];
  const roots: string[] = [];

  for (const part of parts) {
    const tokens = meaningfulTokens(part);
    const rawTokens = toSlugTokens(part);
    for (const sourceTokens of [tokens, rawTokens]) {
      const hyphen = domainRootFromTokens(sourceTokens, "-");
      const compact = domainRootFromTokens(sourceTokens, "");
      if (hyphen) roots.push(hyphen);
      if (compact) roots.push(compact);
      if (sourceTokens.length > 1) {
        roots.push(sourceTokens.map((token) => token[0]).join(""));
      }
    }
  }

  return [...new Set(roots)]
    .filter((root) => root.length >= 3)
    .filter((root) => !COMPANY_STOP_WORDS.has(root));
}

export function generateDirectoryWebsiteCandidateUrls({
  cabinetName,
}: {
  cabinetName: string;
}): string[] {
  const roots = rootsFromName(cabinetName).slice(0, 6);
  const urls: string[] = [];
  for (const root of roots) {
    urls.push(`https://${root}.fr/`);
    urls.push(`https://${root}.com/`);
  }
  return [...new Set(urls)].slice(0, MAX_CANDIDATE_URLS);
}

function tokenCoverage(tokens: string[], normalizedTextValue: string): number {
  if (tokens.length === 0) return 0;
  const matched = tokens.filter((token) => normalizedTextValue.includes(token));
  return matched.length / tokens.length;
}

function includesAccountingSignal(normalizedTextValue: string): boolean {
  return ACCOUNTING_PATTERNS.some((pattern) => normalizedTextValue.includes(normalizeText(pattern)));
}

function normalizedHostname(value: string): string {
  try {
    return normalizeText(new URL(value).hostname.replace(/^www\./, ""));
  } catch {
    return "";
  }
}

async function fetchCandidateText(
  url: string,
  options: Required<Pick<DirectoryWebsiteDiscoveryOptions, "fetch" | "timeoutMs" | "userAgent">>,
): Promise<{ finalUrl: string; text: string } | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), options.timeoutMs);
  try {
    const response = await options.fetch(url, {
      headers: { "user-agent": options.userAgent },
      signal: controller.signal,
    });
    if (!response.ok) return null;
    const contentType = response.headers?.get("content-type")?.toLowerCase() ?? "";
    if (contentType && !contentType.includes("text/html") && !contentType.includes("application/xhtml")) {
      return null;
    }
    return {
      finalUrl: response.url || url,
      text: stripHtml(await response.text()).slice(0, 80_000),
    };
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

function scoreCandidate(
  input: DirectoryWebsiteDiscoveryInput,
  url: string,
  finalUrl: string,
  text: string,
): DirectoryWebsiteDiscoveryCandidate {
  const normalizedTextValue = normalizeText(text);
  const hostname = normalizedHostname(finalUrl || url);
  const allDomainText = `${hostname} ${normalizeText(finalUrl)}`;
  const tokens = meaningfulTokens(input.cabinetName);
  const nameCoverage = tokenCoverage(tokens, normalizedTextValue);
  const domainCoverage = tokenCoverage(tokens, allDomainText);
  const cityMatched = normalizedTextValue.includes(normalizeText(input.cityName));
  const postalMatched = input.postalCode
    ? normalizedTextValue.includes(normalizeText(input.postalCode))
    : false;
  const matchedSiret = normalizedTextValue.includes(input.siret);
  const accountingMatched = includesAccountingSignal(normalizedTextValue);
  const reasons: string[] = [];
  let score = 0;

  if (matchedSiret) {
    score += 35;
    reasons.push("siret");
  }
  if (nameCoverage >= 0.6) {
    score += 35;
    reasons.push("name");
  } else if (nameCoverage >= 0.4) {
    score += 18;
    reasons.push("partial-name");
  }
  if (domainCoverage >= 0.5) {
    score += 18;
    reasons.push("domain");
  }
  if (cityMatched) {
    score += 12;
    reasons.push("city");
  }
  if (postalMatched) {
    score += 6;
    reasons.push("postal-code");
  }
  if (accountingMatched) {
    score += 25;
    reasons.push("accounting");
  }

  const status = score >= ACCEPTANCE_SCORE && accountingMatched
    ? "accepted"
    : "rejected";

  return {
    url,
    finalUrl,
    score,
    reasons,
    matchedSiret,
    status,
  };
}

export async function discoverDirectoryWebsite(
  input: DirectoryWebsiteDiscoveryInput,
  options: DirectoryWebsiteDiscoveryOptions = {},
): Promise<DirectoryWebsiteDiscoveryResult> {
  const resolvedOptions = {
    fetch: options.fetch ?? fetch,
    timeoutMs: options.timeoutMs ?? DEFAULT_TIMEOUT_MS,
    userAgent: options.userAgent ?? DEFAULT_USER_AGENT,
  };
  const urls = [
    ...new Set(options.candidateUrls ?? generateDirectoryWebsiteCandidateUrls(input)),
  ].slice(0, MAX_CANDIDATE_URLS);
  const candidates: DirectoryWebsiteDiscoveryCandidate[] = [];

  await Promise.all(
    urls.map(async (url) => {
      const fetched = await fetchCandidateText(url, resolvedOptions);
      if (!fetched) {
        candidates.push({
          url,
          finalUrl: url,
          score: 0,
          reasons: [],
          matchedSiret: false,
          status: "unreachable",
        });
        return;
      }

      candidates.push(scoreCandidate(input, url, fetched.finalUrl, fetched.text));
    }),
  );

  candidates.sort((first, second) => {
    if (first.score !== second.score) return second.score - first.score;
    return first.url.localeCompare(second.url);
  });

  return {
    accepted: candidates.find((candidate) => candidate.status === "accepted") ?? null,
    candidates,
  };
}
