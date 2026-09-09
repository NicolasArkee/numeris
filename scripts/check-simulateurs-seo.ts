import assert from "node:assert/strict";
import { SIMULATEURS } from "../src/app/simulateurs/registry";
import content from "../src/data/skoria-v2/tools-seo.json";
import { buildToolSchema, getToolSeo, serializeToolSchema } from "../src/libs/simulateurs/seo";
import { AppConfig } from "../src/utils/AppConfig";

type Node = Record<string, any>;
const slugs = SIMULATEURS.map((tool) => tool.slug);
assert.deepEqual(Object.keys(content).sort(), [...slugs].sort(), "Every working tool needs a content configuration");
assert.equal(new Set(Object.values(content).map((item) => item.title)).size, slugs.length, "Tool titles must be distinct");

function checkGraph(nodes: Node[], slug: string) {
  const only = (type: string) => {
    const matches = nodes.filter((node) => node["@type"] === type);
    assert.equal(matches.length, 1, `${slug}: one ${type}`);
    return matches[0]!;
  };
  const app = only("WebApplication");
  const page = only("WebPage");
  const faq = only("FAQPage");
  const breadcrumb = only("BreadcrumbList");
  const url = `${AppConfig.url.replace(/\/$/, "")}/simulateurs/${slug}`;
  assert.equal(page.url, url);
  assert.equal(app.url, `${url}#outil`);
  assert.equal(page.mainEntity["@id"], app["@id"]);
  assert.equal(app.mainEntityOfPage["@id"], page["@id"]);
  assert.equal(page.breadcrumb["@id"], breadcrumb["@id"]);
  assert.equal(page.hasPart["@id"], faq["@id"]);
  assert.equal(faq.isPartOf["@id"], page["@id"]);
  const ids = nodes.map((node) => node["@id"]);
  assert.equal(ids.length, new Set(ids).size, `${slug}: no duplicate entities`);
  assert.equal(app.offers.price, 0);
  assert.equal(app.offers.priceCurrency, "EUR");
  assert.equal(app.isAccessibleForFree, true);
  assert.equal(app.applicationCategory, slug === "jours-ouvres" ? "UtilitiesApplication" : "FinanceApplication");
  assert.deepEqual(app.featureList, getToolSeo(slug).outputs);
  assert.equal(app.inLanguage, "fr-FR");
  assert.equal(app.operatingSystem, "Any");
  assert.equal(app.review, undefined);
  assert.equal(app.aggregateRating, undefined);
  assert.equal(app.screenshot, undefined, "An editorial image is not an application screenshot");
  assert.equal(page.speakable, undefined);
  assert(!nodes.some((node) => ["Article", "BlogPosting", "Product"].includes(node["@type"])), "The page describes a working tool");
  const expectedFaqs = SIMULATEURS.find((tool) => tool.slug === slug)!.faqs;
  assert.deepEqual(faq.mainEntity.map((q: Node) => ({ question: q.name, answer: q.acceptedAnswer.text })), expectedFaqs);
  return { page, app, faq };
}

for (const tool of SIMULATEURS) {
  const config = getToolSeo(tool.slug);
  assert(config.title.length <= 60 && config.title.length > 10);
  assert(config.description.length <= 155 && config.description.length > 70);
  assert(config.inputs.length >= 2 && config.outputs.length >= 2);
  assert(config.relatedSlugs.every((slug) => slugs.includes(slug) && slug !== tool.slug));
  assert.equal(new Set(config.relatedSlugs).size, config.relatedSlugs.length);
  const schema = buildToolSchema({ slug: tool.slug, name: tool.title, pageTitle: config.h1, description: config.description, image: "/images/skoria-v2/editorial/objects.webp", features: config.outputs, faqs: tool.faqs });
  checkGraph(JSON.parse(serializeToolSchema(schema))["@graph"], tool.slug);
  const hostileSchema = buildToolSchema({ slug: tool.slug, name: "</script><script>alert(1)</script>", pageTitle: config.h1, description: config.description, image: "/image.webp", features: config.outputs, faqs: tool.faqs });
  assert(!serializeToolSchema(hostileSchema).includes("</script>"), "Escape script delimiters in structured data");
  assert.equal(JSON.parse(serializeToolSchema(hostileSchema))["@graph"][3].name, "</script><script>alert(1)</script>");
}
console.log(`PASS: configuration and connected application graph for ${slugs.length} tools`);

function decode(text: string) {
  return text.replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#x27;|&#39;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)));
}

// Opt-in HTTP verification against a running local preview; run sequentially
// to avoid parallel cold compilations in next dev. No writes to application DB.
async function checkHttp(origin: string) {
  for (const slug of slugs) {
    const response = await fetch(`${origin}/simulateurs/${slug}`);
    assert.equal(response.status, 200, slug);
    const html = await response.text();
    const graphs = [...html.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].map((match) => JSON.parse(match[1]!));
    const nodes = graphs.flatMap((schema) => schema["@graph"] || [schema]);
    const { page, app, faq } = checkGraph(nodes, slug);
    const body = decode(html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, "").replace(/<[^>]*>/g, " ")).replace(/\s+/g, " ");
    const h1s = [...html.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/g)];
    assert.equal(h1s.length, 1, `${slug}: one visible H1`);
    assert.equal(decode(h1s[0]![1]!.replace(/<[^>]*>/g, "")), page.name);
    const tags = [...html.matchAll(/<(?:meta|link)\b[^>]*>/g)].map(([tag]) => Object.fromEntries([...tag.matchAll(/([\w:-]+)="([^"]*)"/g)].map((match) => [match[1], decode(match[2]!)])));
    assert.equal(tags.find((tag) => tag.rel === "canonical")?.href, page.url);
    assert.equal(tags.find((tag) => tag.property === "og:url")?.content, page.url);
    assert.equal(tags.find((tag) => tag.property === "og:type")?.content, "website");
    assert.equal(tags.find((tag) => tag.name === "description")?.content, page.description);
    assert.equal(tags.find((tag) => tag.property === "og:description")?.content, page.description);
    assert.equal(tags.find((tag) => tag.name === "twitter:description")?.content, page.description);
    assert(tags.find((tag) => tag.property === "og:title")?.content?.includes(getToolSeo(slug).title));
    assert(html.includes('id="outil"'));
    assert(html.includes('id="faq"'));
    for (const feature of app.featureList) assert(body.includes(feature), `${slug}: marked-up feature visible: ${feature}`);
    for (const question of faq.mainEntity) assert(body.includes(question.name), `${slug}: marked-up FAQ visible`);
    for (const related of getToolSeo(slug).relatedSlugs) assert(html.includes(`href="/simulateurs/${related}"`));
    console.log(`PASS HTTP: ${slug}`);
  }
}

if (process.env.SKORIA_TEST_ORIGIN) {
  checkHttp(process.env.SKORIA_TEST_ORIGIN).catch((error) => { console.error(error); process.exitCode = 1; });
}
