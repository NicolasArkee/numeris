import type {
  DirectoryEnrichmentSourceType,
  DirectoryProfileFactType,
  DirectoryQualificationSnapshot,
} from "@/libs/db";
import {
  buildServiceFactMetadata,
  getDirectoryServiceKnowledgeGraph,
  metadataToJson,
  type DirectoryServiceFamily,
} from "./service-knowledge-graph";

export type WebsiteEnrichmentInput = {
  siret: string;
  cabinetName: string;
  cityName: string;
  websiteUrl: string;
  sourcePreviewImageUrl?: string;
  retrievedAt?: string;
  professionalStatus?: DirectoryQualificationSnapshot["professional_status"];
  matchedRegistry?: boolean;
  matchedAddress?: boolean;
  matchedSirenOrSiret?: boolean;
};

export type WebsiteEnrichmentFact = {
  fact_type: DirectoryProfileFactType;
  label: string;
  value: string;
  confidence: number;
  is_displayable: boolean;
  metadata_json?: string | null;
};

export type WebsiteEnrichmentRecord = {
  siret: string;
  source: {
    source_key: string;
    source_type: Extract<DirectoryEnrichmentSourceType, "official_website">;
    source_url: string;
    retrieved_at: string;
    legal_basis: string;
    raw_excerpt: string | null;
  };
  matches: {
    professional_status: DirectoryQualificationSnapshot["professional_status"];
    matched_registry: boolean;
    matched_website: boolean;
    matched_address: boolean;
    matched_siren_or_siret: boolean;
    has_website_contact_page: boolean;
  };
  facts: WebsiteEnrichmentFact[];
};

type WebsiteFetchResponse = {
  ok: boolean;
  status: number;
  url: string;
  text: () => Promise<string>;
  headers?: {
    get: (name: string) => string | null;
  };
};

type WebsiteFetch = (
  url: string,
  init?: { headers?: Record<string, string>; signal?: AbortSignal },
) => Promise<WebsiteFetchResponse>;

export type WebsiteEnrichmentOptions = {
  fetch?: WebsiteFetch;
  maxPages?: number;
  timeoutMs?: number;
  userAgent?: string;
  /** Callback optionnel recevant les pages crawlées (texte extrait) — permet
   *  à une étape aval (ex. génération LLM du profile_summary) de consommer le
   *  contenu réel du site sans re-crawler. */
  onPages?: (pages: { url: string; role: PageRole; title: string | null; text: string }[]) => void;
};

type PageRole = "home" | "services" | "contact" | "about" | "other";

type FetchedPage = {
  url: string;
  role: PageRole;
  html: string;
  text: string;
  title: string | null;
};

type DiscoveryResult = {
  robotsAllowed: boolean | null;
  urls: string[];
};

const DEFAULT_MAX_PAGES = 8;
const DEFAULT_TIMEOUT_MS = 10_000;
const DEFAULT_USER_AGENT = "SkoriaDirectoryBot/1.0 (+https://www.skoria.fr)";

const SECTOR_SIGNALS = [
  { value: "TPE", patterns: ["tpe", "petites entreprises"] },
  { value: "PME", patterns: ["pme", "moyennes entreprises"] },
  { value: "Professions liberales", patterns: ["professions liberales", "liberaux"] },
  { value: "Createurs d'entreprise", patterns: ["createurs d'entreprise", "createurs"] },
];

function normalizeWebsiteUrl(value: string): string {
  const withProtocol = /^https?:\/\//i.test(value) ? value : `https://${value}`;
  const url = new URL(withProtocol);
  url.hash = "";
  if (!url.pathname) url.pathname = "/";
  return url.href;
}

function canonicalizeUrl(value: string): string {
  const url = new URL(value);
  url.hash = "";
  if (!url.pathname) url.pathname = "/";
  return url.href;
}

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

function extractTitle(html: string): string | null {
  const match = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return match ? compactText(decodeHtmlEntities(match[1] ?? "")) : null;
}

function extractVisibleText(html: string): string {
  const withoutHidden = html
    .replaceAll(/<script[\s\S]*?<\/script>/gi, " ")
    .replaceAll(/<style[\s\S]*?<\/style>/gi, " ")
    .replaceAll(/<noscript[\s\S]*?<\/noscript>/gi, " ");
  return compactText(decodeHtmlEntities(withoutHidden.replaceAll(/<[^>]+>/g, " ")));
}

function classifyUrl(value: string, baseUrl: string): PageRole {
  const url = new URL(value);
  const base = new URL(baseUrl);
  const path = normalizeText(url.pathname.replaceAll(/[-_/]+/g, " "));

  if (url.origin === base.origin && (url.pathname === "/" || url.pathname === "")) {
    return "home";
  }
  if (/\b(contact|coordonnees|rendez vous|rdv|nous contacter)\b/u.test(path)) {
    return "contact";
  }
  if (/\b(equipe|cabinet|about|a propos|qui sommes nous|notre histoire)\b/u.test(path)) {
    return "about";
  }
  if (/\b(service|services|prestation|prestations|mission|missions|expertise|expertises|paie|fiscalite|comptable)\b/u.test(path)) {
    return "services";
  }
  return "other";
}

function rolePriority(role: PageRole): number {
  if (role === "home") return 0;
  if (role === "services") return 1;
  if (role === "contact") return 2;
  if (role === "about") return 3;
  return 4;
}

function prioritizeUrls(urls: string[], baseUrl: string): string[] {
  return [...new Set(urls)]
    .filter((url) => isSameOrigin(url, baseUrl))
    .sort((first, second) => {
      const roleDelta =
        rolePriority(classifyUrl(first, baseUrl)) - rolePriority(classifyUrl(second, baseUrl));
      if (roleDelta !== 0) return roleDelta;
      return first.length - second.length;
    });
}

function isSameOrigin(value: string, baseUrl: string): boolean {
  try {
    return new URL(value).origin === new URL(baseUrl).origin;
  } catch {
    return false;
  }
}

function isLikelyHtmlPath(url: URL): boolean {
  return !/\.(pdf|jpg|jpeg|png|webp|gif|svg|zip|rar|doc|docx|xls|xlsx|ics)$/i.test(
    url.pathname,
  );
}

function resolveInternalUrl(href: string, pageUrl: string, baseUrl: string): string | null {
  const trimmed = href.trim();
  if (
    !trimmed ||
    trimmed.startsWith("#") ||
    /^(mailto|tel|javascript):/i.test(trimmed)
  ) {
    return null;
  }

  try {
    const url = new URL(trimmed, pageUrl);
    if (url.origin !== new URL(baseUrl).origin || !isLikelyHtmlPath(url)) {
      return null;
    }
    url.hash = "";
    return canonicalizeUrl(url.href);
  } catch {
    return null;
  }
}

function extractInternalLinks(html: string, pageUrl: string, baseUrl: string): string[] {
  const links: string[] = [];
  const linkRegex = /<a\b[^>]*\bhref=["']([^"']+)["'][^>]*>/gi;
  let match: RegExpExecArray | null;
  while ((match = linkRegex.exec(html)) !== null) {
    const resolved = resolveInternalUrl(match[1] ?? "", pageUrl, baseUrl);
    if (resolved) links.push(resolved);
  }
  return links;
}

function extractSitemapUrls(xml: string): string[] {
  const urls: string[] = [];
  const locRegex = /<loc>\s*([^<]+?)\s*<\/loc>/gi;
  let match: RegExpExecArray | null;
  while ((match = locRegex.exec(xml)) !== null) {
    urls.push(decodeHtmlEntities(match[1] ?? "").trim());
  }
  return urls;
}

function parseRobotsTxt(text: string): { robotsAllowed: boolean | null; sitemapUrls: string[] } {
  const sitemapUrls: string[] = [];
  let appliesToAll = false;
  let disallowsAll = false;

  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.split("#")[0]?.trim() ?? "";
    const sitemap = line.match(/^sitemap:\s*(.+)$/i);
    if (sitemap) {
      sitemapUrls.push(sitemap[1].trim());
      continue;
    }

    const userAgent = line.match(/^user-agent:\s*(.+)$/i);
    if (userAgent) {
      appliesToAll = userAgent[1].trim() === "*";
      continue;
    }

    const disallow = line.match(/^disallow:\s*(.*)$/i);
    if (appliesToAll && disallow && disallow[1].trim() === "/") {
      disallowsAll = true;
    }
  }

  return {
    robotsAllowed: text.trim() ? !disallowsAll : null,
    sitemapUrls,
  };
}

async function fetchText(
  url: string,
  options: Required<Pick<WebsiteEnrichmentOptions, "fetch" | "timeoutMs" | "userAgent">>,
): Promise<{ body: string; responseUrl: string; contentType: string } | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), options.timeoutMs);
  try {
    const response = await options.fetch(url, {
      headers: { "user-agent": options.userAgent },
      signal: controller.signal,
    });
    if (!response.ok) return null;
    return {
      body: await response.text(),
      responseUrl: response.url || url,
      contentType: response.headers?.get("content-type") ?? "",
    };
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

async function discoverUrls(
  baseUrl: string,
  options: Required<Pick<WebsiteEnrichmentOptions, "fetch" | "timeoutMs" | "userAgent">>,
): Promise<DiscoveryResult> {
  const base = new URL(baseUrl);
  const robotsUrl = new URL("/robots.txt", base.origin).href;
  const urls = [baseUrl];
  let robotsAllowed: boolean | null = null;
  let sitemapUrls = [new URL("/sitemap.xml", base.origin).href];

  const robots = await fetchText(robotsUrl, options);
  if (robots) {
    const parsedRobots = parseRobotsTxt(robots.body);
    robotsAllowed = parsedRobots.robotsAllowed;
    sitemapUrls = [...parsedRobots.sitemapUrls, ...sitemapUrls];
  }

  for (const sitemapUrl of [...new Set(sitemapUrls)].slice(0, 3)) {
    if (!isSameOrigin(sitemapUrl, baseUrl)) continue;
    const sitemap = await fetchText(sitemapUrl, options);
    if (!sitemap) continue;
    for (const url of extractSitemapUrls(sitemap.body)) {
      if (isSameOrigin(url, baseUrl)) urls.push(canonicalizeUrl(url));
    }
  }

  return {
    robotsAllowed,
    urls: prioritizeUrls(urls, baseUrl),
  };
}

async function fetchHtmlPage(
  url: string,
  baseUrl: string,
  options: Required<Pick<WebsiteEnrichmentOptions, "fetch" | "timeoutMs" | "userAgent">>,
): Promise<FetchedPage | null> {
  const fetched = await fetchText(url, options);
  if (!fetched || !isSameOrigin(fetched.responseUrl, baseUrl)) return null;

  const contentType = fetched.contentType.toLowerCase();
  if (
    contentType &&
    !contentType.includes("text/html") &&
    !contentType.includes("application/xhtml")
  ) {
    return null;
  }

  const finalUrl = canonicalizeUrl(fetched.responseUrl);
  return {
    url: finalUrl,
    role: classifyUrl(finalUrl, baseUrl),
    html: fetched.body,
    text: extractVisibleText(fetched.body),
    title: extractTitle(fetched.body),
  };
}

async function crawlWebsitePages(
  baseUrl: string,
  discovery: DiscoveryResult,
  options: Required<Pick<WebsiteEnrichmentOptions, "fetch" | "maxPages" | "timeoutMs" | "userAgent">>,
): Promise<FetchedPage[]> {
  if (discovery.robotsAllowed === false) return [];

  const pages: FetchedPage[] = [];
  const seen = new Set<string>();
  const queued = new Set<string>();
  let queue = prioritizeUrls([baseUrl, ...discovery.urls], baseUrl);
  for (const url of queue) queued.add(url);

  while (queue.length > 0 && pages.length < options.maxPages) {
    const url = queue.shift();
    if (!url || seen.has(url)) continue;
    seen.add(url);

    const page = await fetchHtmlPage(url, baseUrl, options);
    if (!page) continue;

    pages.push(page);
    for (const link of extractInternalLinks(page.html, page.url, baseUrl)) {
      if (!seen.has(link) && !queued.has(link)) {
        queue.push(link);
        queued.add(link);
      }
    }
    queue = prioritizeUrls(queue, baseUrl);
  }

  return pages;
}

function firstMatch(pattern: RegExp, value: string): string | null {
  const match = value.match(pattern);
  return match ? compactText(match[0]) : null;
}

function extractEmail(text: string): string | null {
  return firstMatch(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i, text);
}

function extractPhone(text: string): string | null {
  const phone = firstMatch(/(?:\+33|0)\s?[1-9](?:[\s.-]?\d{2}){4}/, text);
  return phone ? phone.replaceAll(/[.-]/g, " ").replaceAll(/\s+/g, " ").trim() : null;
}

function includesAny(normalizedText: string, patterns: string[]): boolean {
  return patterns.some((pattern) => normalizedText.includes(pattern));
}

function unique<T>(values: T[]): T[] {
  return [...new Set(values)];
}

function addFact(
  facts: WebsiteEnrichmentFact[],
  fact: WebsiteEnrichmentFact,
): void {
  if (
    facts.some(
      (existing) =>
        existing.fact_type === fact.fact_type &&
        normalizeText(existing.value) === normalizeText(fact.value),
    )
  ) {
    return;
  }
  facts.push(fact);
}

function joinFrench(items: string[]): string {
  if (items.length === 0) return "";
  if (items.length === 1) return items[0];
  return `${items.slice(0, -1).join(", ")} et ${items[items.length - 1]}`;
}

function buildProfileSummary(input: WebsiteEnrichmentInput, facts: WebsiteEnrichmentFact[]): string {
  const services = facts
    .filter((fact) => fact.fact_type === "service")
    .map((fact) => fact.value)
    .slice(0, 5);
  const serviceText = joinFrench(services);
  const sectors = facts
    .filter((fact) => fact.fact_type === "sector")
    .map((fact) => fact.value)
    .slice(0, 3);
  const software = facts
    .filter((fact) => fact.fact_type === "software")
    .map((fact) => fact.value)
    .slice(0, 3);
  const email = facts.find((fact) => fact.fact_type === "email")?.value;
  const phone = facts.find((fact) => fact.fact_type === "phone")?.value;
  const contactParts = [phone ? `par téléphone au ${phone}` : "", email ? `par email à ${email}` : ""]
    .filter(Boolean);
  const contactText = contactParts.length
    ? ` Une prise de contact est possible ${joinFrench(contactParts)}.`
    : "";
  const sectorText = sectors.length
    ? ` Le cabinet fait aussi ressortir un positionnement auprès de ${joinFrench(sectors)}, ce qui peut orienter les entreprises qui recherchent un interlocuteur habitué à leur taille ou à leur contexte.`
    : "";
  const softwareText = software.length
    ? ` Des outils comme ${joinFrench(software)} sont également mentionnés, un point utile pour les dirigeants qui veulent fluidifier les échanges de pièces, la paie ou le suivi administratif.`
    : "";
  const teamMention = facts.some((fact) => fact.fact_type === "team_signal")
    ? " La présentation du cabinet évoque aussi une équipe, ce qui donne un premier repère sur l'organisation humaine derrière la relation client."
    : "";

  if (serviceText) {
    return `${input.cabinetName} accompagne les entreprises et les dirigeants à ${input.cityName} sur des missions d'expertise comptable présentées publiquement. Son positionnement couvre notamment ${serviceText}, avec une lecture orientée vers les besoins concrets d'une entreprise : organiser la comptabilité, préparer les échéances, sécuriser les obligations déclaratives, structurer la paie ou disposer d'un appui de pilotage. Le cabinet apparaît ainsi comme un interlocuteur de proximité pour les professionnels qui veulent comparer une offre avant de prendre rendez-vous, vérifier les domaines d'intervention annoncés et repérer les informations pratiques disponibles.${sectorText}${softwareText}${teamMention}${contactText} Les prestations restent à confirmer directement avec le cabinet, mais ces éléments donnent déjà une base claire pour comprendre son positionnement et préparer un échange utile.`;
  }

  return `${input.cabinetName} est présenté comme un cabinet d'expertise comptable à ${input.cityName}. Les informations disponibles donnent une première base pour comprendre son ancrage local, ses coordonnées et la manière dont le cabinet se rend accessible aux entreprises. Même lorsque les pages publiques ne détaillent pas encore précisément chaque mission, ces informations permettent de situer le professionnel, d'identifier les moyens de contact disponibles et de préparer les questions à poser avant un rendez-vous : tenue comptable, déclarations, accompagnement du dirigeant, paie, conseil ou création d'entreprise selon les besoins.${sectorText}${softwareText}${teamMention}${contactText} Les informations doivent être validées directement auprès du cabinet avant toute mission, mais elles offrent une présentation plus utile qu'une simple ligne administrative.`;
}

function matchingKeywords(normalizedText: string, keywords: string[]): string[] {
  return unique(
    keywords.filter((keyword) => normalizedText.includes(normalizeText(keyword))),
  );
}

function pageMatchesService(page: FetchedPage, service: DirectoryServiceFamily): string[] {
  const normalized = normalizeText(`${page.title ?? ""} ${page.text}`);
  const keywords = [
    ...service.keywords,
    ...service.offers.flatMap((offer) => offer.keywords),
  ];
  return matchingKeywords(normalized, keywords);
}

function buildServiceFactsFromKnowledgeGraph(pages: FetchedPage[]): WebsiteEnrichmentFact[] {
  const graph = getDirectoryServiceKnowledgeGraph();
  const facts: WebsiteEnrichmentFact[] = [];

  for (const service of graph.serviceFamilies) {
    const matchingPages = pages
      .map((page) => ({ page, keywords: pageMatchesService(page, service) }))
      .filter((match) => match.keywords.length > 0);
    if (matchingPages.length === 0) continue;

    const metadata = buildServiceFactMetadata({
      service,
      displayMode: "sourced",
      offerIds: service.offers.map((offer) => offer.id),
      evidenceSnippets: unique(matchingPages.flatMap((match) => match.keywords)).slice(0, 8),
      sourcePageUrls: unique(matchingPages.map((match) => match.page.url)),
      confidenceReason: "Mention relevée sur les pages publiques du cabinet.",
    });

    addFact(facts, {
      fact_type: "service",
      label: "Service identifié",
      value: service.factValue,
      confidence: service.id === "audit" ? 82 : 86,
      is_displayable: true,
      metadata_json: metadataToJson(metadata),
    });
  }

  return facts;
}

function extractFacts(
  input: WebsiteEnrichmentInput,
  baseUrl: string,
  pages: FetchedPage[],
): WebsiteEnrichmentFact[] {
  const facts: WebsiteEnrichmentFact[] = [];
  const allText = compactText(pages.map((page) => `${page.title ?? ""} ${page.text}`).join(" "));
  const normalizedAllText = normalizeText(allText);
  const contactPage = pages.find((page) => page.role === "contact");
  const aboutPage = pages.find((page) => page.role === "about");

  addFact(facts, {
    fact_type: "website",
    label: "Site officiel",
    value: baseUrl,
    confidence: pages.length > 0 ? 95 : 70,
    is_displayable: true,
  });

  if (input.sourcePreviewImageUrl) {
    addFact(facts, {
      fact_type: "source_preview_image",
      label: "Apercu source",
      value: input.sourcePreviewImageUrl,
      confidence: 80,
      is_displayable: true,
    });
  }

  if (contactPage) {
    addFact(facts, {
      fact_type: "contact_url",
      label: "Page contact",
      value: contactPage.url,
      confidence: 92,
      is_displayable: true,
    });
  }

  const email = extractEmail(allText);
  if (email) {
    addFact(facts, {
      fact_type: "email",
      label: "Email public",
      value: email,
      confidence: 88,
      is_displayable: true,
    });
  }

  const phone = extractPhone(allText);
  if (phone) {
    addFact(facts, {
      fact_type: "phone",
      label: "Telephone public",
      value: phone,
      confidence: 88,
      is_displayable: true,
    });
  }

  for (const serviceFact of buildServiceFactsFromKnowledgeGraph(pages)) {
    addFact(facts, serviceFact);
  }

  for (const signal of SECTOR_SIGNALS) {
    if (includesAny(normalizedAllText, signal.patterns)) {
      addFact(facts, {
        fact_type: "sector",
        label: "Clientele mentionnee",
        value: signal.value,
        confidence: 76,
        is_displayable: true,
      });
    }
  }

  for (const software of getDirectoryServiceKnowledgeGraph().specificities.software) {
    if (normalizedAllText.includes(normalizeText(software))) {
      addFact(facts, {
        fact_type: "software",
        label: "Logiciel mentionne",
        value: software,
        confidence: 78,
        is_displayable: true,
      });
    }
  }

  if (aboutPage && /\b(equipe|collaborateur|collaborateurs|expert comptable|experts comptables)\b/u.test(
    normalizeText(aboutPage.text),
  )) {
    addFact(facts, {
      fact_type: "team_signal",
      label: "Equipe",
      value: "Equipe d'experts-comptables mentionnee",
      confidence: 80,
      is_displayable: true,
    });
  }

  addFact(facts, {
    fact_type: "profile_summary",
    label: "Présentation",
    value: buildProfileSummary(input, facts),
    confidence: pages.length > 0 ? 86 : 55,
    is_displayable: pages.length > 0,
  });

  return facts;
}

function buildRawExcerpt(pages: FetchedPage[]): string | null {
  const excerpt = compactText(
    pages
      .slice(0, 4)
      .map((page) => `[${page.role}] ${page.title ?? page.url}: ${page.text}`)
      .join(" "),
  ).slice(0, 900);
  return excerpt || null;
}

export async function buildDirectoryWebsiteEnrichment(
  input: WebsiteEnrichmentInput,
  options: WebsiteEnrichmentOptions = {},
): Promise<WebsiteEnrichmentRecord> {
  const baseUrl = normalizeWebsiteUrl(input.websiteUrl);
  const resolvedOptions = {
    fetch: options.fetch ?? fetch,
    maxPages: options.maxPages ?? DEFAULT_MAX_PAGES,
    timeoutMs: options.timeoutMs ?? DEFAULT_TIMEOUT_MS,
    userAgent: options.userAgent ?? DEFAULT_USER_AGENT,
  };
  const retrievedAt = input.retrievedAt ?? new Date().toISOString();
  const discovery = await discoverUrls(baseUrl, resolvedOptions);
  const pages = await crawlWebsitePages(baseUrl, discovery, resolvedOptions);
  options.onPages?.(pages.map((p) => ({ url: p.url, role: p.role, title: p.title, text: p.text })));
  const facts = extractFacts(input, baseUrl, pages);

  return {
    siret: input.siret,
    source: {
      source_key: `website-crawl-${input.siret}`,
      source_type: "official_website",
      source_url: baseUrl,
      retrieved_at: retrievedAt,
      legal_basis:
        "Site officiel public du cabinet, collecte limitee au contenu publiquement accessible.",
      raw_excerpt: buildRawExcerpt(pages),
    },
    matches: {
      professional_status: input.professionalStatus ?? "unverified",
      matched_registry: input.matchedRegistry ?? false,
      matched_website: pages.length > 0,
      matched_address: input.matchedAddress ?? false,
      matched_siren_or_siret: input.matchedSirenOrSiret ?? false,
      has_website_contact_page: facts.some((fact) => fact.fact_type === "contact_url"),
    },
    facts,
  };
}
