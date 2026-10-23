import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const root = process.cwd();
const errors = [];
const warnings = [];
const siteOrigin = "https://mass.llc";
const redirectSources = new Set(["404.html", "500.html", "aimee.html", "website.html"]);
const urlAttributes = new Set(["href", "src", "poster", "action"]);
const assetExtensions = /\.(?:avif|css|gif|ico|jpe?g|js|json|mjs|mp4|pdf|png|svg|ttf|txt|webm|webmanifest|woff2)(?:[?#]|$)/i;

const posix = path.posix;
const relative = file => file.split(path.sep).join("/");
const read = file => fs.readFileSync(path.join(root, file), "utf8");
const isHtml = file => file.toLowerCase().endsWith(".html");
const stripQueryAndHash = value => value.split("#")[0].split("?")[0];
const fragmentOf = value => value.includes("#") ? decodeURIComponent(value.slice(value.indexOf("#") + 1)) : "";
const isSameOrigin = value => value.toLowerCase().startsWith(`${siteOrigin}/`) || value.toLowerCase() === siteOrigin;
const isExternal = value => /^(?:[a-z][a-z0-9+.-]*:|\/\/)/i.test(value) && !isSameOrigin(value);
const ignoredUrl = value => !value || value === "#" || isExternal(value);
const normalizedText = value => value.replace(/<[^>]+>/g, " ").replace(/&nbsp;/gi, " ").replace(/\s+/g, " ").trim().toLowerCase();

function walk(directory = "") {
  const target = path.join(root, directory);
  return fs.readdirSync(target, { withFileTypes: true }).flatMap(entry => {
    const next = path.join(directory, entry.name);
    if (entry.isDirectory()) return [".git", "node_modules", "docs", "output", "scripts"].includes(entry.name) ? [] : walk(next);
    return [next];
  });
}

const allFiles = walk();
const allHtml = allFiles.filter(isHtml).sort();
const rootHtml = allHtml.filter(file => !file.includes(path.sep));
const publicHtml = rootHtml.filter(file => !redirectSources.has(file));

function exactFile(relPath) {
  const segments = relPath.split("/").filter(Boolean);
  let current = root;
  for (const segment of segments) {
    if (segment === "." || segment === "..") return { exists: false, detail: "invalid path segment" };
    let entries;
    try { entries = fs.readdirSync(current); } catch { return { exists: false, detail: "parent directory missing" }; }
    const exact = entries.find(entry => entry === segment);
    if (!exact) {
      const caseVariant = entries.find(entry => entry.toLowerCase() === segment.toLowerCase());
      return caseVariant
        ? { exists: false, detail: `case mismatch; expected ${caseVariant}` }
        : { exists: false, detail: "file missing" };
    }
    current = path.join(current, exact);
  }
  return { exists: fs.existsSync(current), detail: "" };
}

function resolveLocal(fromFile, raw) {
  const localRaw = isSameOrigin(raw) ? new URL(raw).pathname + new URL(raw).search + new URL(raw).hash : raw;
  const urlPath = stripQueryAndHash(localRaw.trim());
  if (ignoredUrl(urlPath)) return { ignored: true };
  let candidate;
  if (urlPath.startsWith("/")) candidate = urlPath.slice(1);
  else candidate = posix.join(posix.dirname(relative(fromFile)), urlPath);
  candidate = posix.normalize(candidate).replace(/^\.\//, "");
  if (candidate === "." || candidate === "") return { file: "index.html", fragment: fragmentOf(raw), route: true };
  if (candidate.startsWith("../") || candidate === "..") return { error: "path escapes the deployment root" };

  const direct = exactFile(candidate);
  if (direct.exists) return { file: candidate, fragment: fragmentOf(raw) };
  const noTrailingSlash = candidate.replace(/\/$/, "");
  const route = exactFile(`${noTrailingSlash}.html`);
  if (route.exists) return { file: `${noTrailingSlash}.html`, fragment: fragmentOf(raw), route: true };
  return { error: direct.detail || route.detail || "file missing", candidate };
}

function idSet(file) {
  const html = read(file);
  return new Set([...html.matchAll(/\bid=["']([^"']+)["']/gi)].map(match => match[1]));
}

function checkReference(fromFile, raw, context) {
  if (raw.startsWith("#") && raw !== "#") {
    const fragment = fragmentOf(raw);
    if (fragment && !idSet(fromFile).has(fragment)) errors.push(`${fromFile}: ${context} ${raw} targets a missing same-page fragment`);
    return;
  }
  if (ignoredUrl(raw)) return;
  const resolved = resolveLocal(fromFile, raw);
  if (resolved.error) {
    errors.push(`${fromFile}: ${context} ${raw} does not resolve (${resolved.error}${resolved.candidate ? `: ${resolved.candidate}` : ""})`);
    return;
  }
  if (resolved.fragment && isHtml(resolved.file) && !idSet(resolved.file).has(resolved.fragment)) {
    errors.push(`${fromFile}: ${context} ${raw} targets missing fragment #${resolved.fragment} in ${resolved.file}`);
  }
  if (context === "href" && /\.html(?:[?#]|$)/i.test(raw) && !resolved.file.includes("assets/") && !resolved.file.includes(".well-known/")) {
    errors.push(`${fromFile}: public link must use the extensionless route: ${raw}`);
  }
}

function valuesFromHtml(html) {
  const values = [];
  for (const tag of html.matchAll(/<[^>]+>/g)) {
    const source = tag[0];
    for (const attr of source.matchAll(/\s([:\w-]+)\s*=\s*(["'])([\s\S]*?)\2/g)) {
      const name = attr[1].toLowerCase();
      const value = attr[3].trim();
      if (urlAttributes.has(name) || (/^data-[\w-]*(?:src|href|url)$/i.test(name))) values.push({ name, value });
      if (name === "srcset") {
        for (const item of value.split(",")) {
          const candidate = item.trim().split(/\s+/)[0];
          if (candidate) values.push({ name: "srcset", value: candidate });
        }
      }
      if (name === "style") {
        for (const item of value.matchAll(/url\(\s*["']?([^"')]+)["']?\s*\)/gi)) values.push({ name: "style url", value: item[1] });
      }
    }
    if (/^<meta\b/i.test(source)) {
      const property = /\s(?:name|property)\s*=\s*["']([^"']+)["']/i.exec(source)?.[1].toLowerCase();
      const content = /\scontent\s*=\s*["']([^"']+)["']/i.exec(source)?.[1];
      if (content && ["og:image", "twitter:image", "og:url", "twitter:url"].includes(property)) values.push({ name: property, value: content });
    }
  }
  return values;
}

function metadataValues(html, name) {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return [...html.matchAll(new RegExp(`<meta\\s+[^>]*(?:name|property)=["']${escaped}["'][^>]*>`, "gi"))];
}

const canonicalOwners = new Map();
const inbound = new Map(publicHtml.map(file => [file, new Set()]));
const titleOwners = new Map();
const descriptionOwners = new Map();
for (const file of allHtml) {
  const html = read(file);
  for (const { name, value } of valuesFromHtml(html)) {
    checkReference(file, value, name);
    if (name === "href") {
      const resolved = resolveLocal(file, value);
      if (resolved.file && inbound.has(resolved.file)) inbound.get(resolved.file).add(file);
    }
  }
  for (const script of html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)) {
    for (const imported of script[1].matchAll(/\bimport\s+(?:[\s\S]*?\s+from\s+)?["']([^"']+)["']/gi)) {
      checkReference(file, imported[1], "module import");
    }
  }
}

for (const cssFile of allFiles.filter(file => file.endsWith(".css"))) {
  const css = read(cssFile);
  for (const match of css.matchAll(/(?:url\(\s*["']?([^"')]+)["']?\s*\)|@import\s+(?:url\()?\s*["']([^"')]+)["'])/gi)) {
    checkReference(cssFile, match[1] || match[2], "CSS reference");
  }
}

for (const jsFile of allFiles.filter(file => /\.(?:js|mjs)$/.test(file) && !file.includes("vendor"))) {
  const js = read(jsFile);
  for (const match of js.matchAll(/(?:["'`])((?:\.{1,2}\/|\/?assets\/|\/?css\/|\/?js\/)[^"'`\s]+?\.(?:avif|css|gif|jpe?g|js|mjs|mp4|pdf|png|svg|ttf|webm|woff2)(?:[?#][^"'`\s]*)?)(?:["'`])/gi)) {
    checkReference(jsFile, match[1], "runtime asset");
  }
}

for (const file of publicHtml) {
  const html = read(file);
  const noindex = /<meta\s+name=["']robots["'][^>]*content=["'][^"']*noindex/i.test(html);
  if (noindex) continue;
  const titles = [...html.matchAll(/<title\b[\s\S]*?>([\s\S]*?)<\/title>/gi)];
  if (titles.length !== 1) errors.push(`${file}: expected exactly one title, found ${titles.length}`);
  if (titles.length === 1) {
    const title = normalizedText(titles[0][1]);
    if (!title) errors.push(`${file}: title is empty`);
    else if (titleOwners.has(title)) errors.push(`${file}: normalized title duplicates ${titleOwners.get(title)}`);
    else titleOwners.set(title, file);
  }
  const descriptions = metadataValues(html, "description");
  if (descriptions.length !== 1) errors.push(`${file}: expected exactly one meta description, found ${descriptions.length}`);
  if (descriptions.length === 1) {
    const content = /\bcontent=["']([^"']*)["']/i.exec(descriptions[0][0])?.[1] || "";
    const description = normalizedText(content);
    if (!description) errors.push(`${file}: meta description is empty`);
    else if (descriptionOwners.has(description)) errors.push(`${file}: normalized description duplicates ${descriptionOwners.get(description)}`);
    else descriptionOwners.set(description, file);
  }
  const viewports = metadataValues(html, "viewport");
  if (viewports.length !== 1 || !/\bwidth\s*=\s*device-width\b/i.test(viewports[0]?.[0] || "")) errors.push(`${file}: expected one responsive viewport meta tag`);
  const canonicals = [...html.matchAll(/<link\s+[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["'][^>]*>/gi)].map(match => match[1]);
  if (canonicals.length !== 1) {
    errors.push(`${file}: expected exactly one canonical, found ${canonicals.length}`);
  } else {
    const canonical = canonicals[0];
    const expected = file === "index.html" ? `${siteOrigin}/` : `${siteOrigin}/${file.slice(0, -5)}`;
    if (canonical !== expected) errors.push(`${file}: canonical must be ${expected}, found ${canonical}`);
    if (canonicalOwners.has(canonical)) errors.push(`${file}: duplicate canonical ${canonical} also used by ${canonicalOwners.get(canonical)}`);
    canonicalOwners.set(canonical, file);
  }
  const h1Count = (html.match(/<h1\b/gi) || []).length;
  if (h1Count !== 1) errors.push(`${file}: expected exactly one H1, found ${h1Count}`);
  if (/<meta\s+name=["']keywords["']/i.test(html)) warnings.push(`${file}: obsolete keywords metadata remains`);
  for (const block of html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
    try { JSON.parse(block[1].trim()); } catch (error) { errors.push(`${file}: invalid JSON-LD (${error.message})`); }
  }
}

const sitemapPath = path.join(root, "sitemap.xml");
const sitemapUrls = new Set();
if (!fs.existsSync(sitemapPath)) errors.push("sitemap.xml: missing");
else {
  const xml = read("sitemap.xml");
  for (const match of xml.matchAll(/<url>\s*<loc>([^<]+)<\/loc>(?:\s*<lastmod>([^<]+)<\/lastmod>)?\s*<\/url>/gi)) {
    const url = match[1].trim();
    sitemapUrls.add(url);
    if (!url.startsWith(`${siteOrigin}/`)) errors.push(`sitemap.xml: off-domain URL ${url}`);
    const pathname = new URL(url).pathname;
    if (/\.html$|\/index$|\/$/.test(pathname) && pathname !== "/") errors.push(`sitemap.xml: noncanonical URL ${url}`);
    const resolved = resolveLocal("index.html", pathname);
    if (resolved.error) errors.push(`sitemap.xml: ${url} does not resolve (${resolved.error})`);
    if (resolved.file && (!rootHtml.includes(resolved.file) || redirectSources.has(resolved.file))) errors.push(`sitemap.xml: ${url} is not an indexable marketing page`);
  }
  for (const file of publicHtml) {
    const html = read(file);
    if (redirectSources.has(file) || /<meta\s+name=["']robots["'][^>]*content=["'][^"']*noindex/i.test(html)) continue;
    const canonical = file === "index.html" ? `${siteOrigin}/` : `${siteOrigin}/${file.slice(0, -5)}`;
    if (!sitemapUrls.has(canonical)) errors.push(`sitemap.xml: missing indexable canonical ${canonical}`);
  }
}

for (const [file, sources] of inbound) {
  if (file !== "index.html" && !/<meta\s+name=["']robots["'][^>]*content=["'][^"']*noindex/i.test(read(file)) && sources.size === 0) {
    errors.push(`${file}: public page has no inbound HTML link`);
  }
}

const robots = fs.existsSync(path.join(root, "robots.txt")) ? read("robots.txt") : "";
if (!/Sitemap:\s*https:\/\/mass\.llc\/sitemap\.xml/i.test(robots)) errors.push("robots.txt: canonical sitemap declaration missing");
if (/^Disallow:\s*\/$/mi.test(robots)) errors.push("robots.txt: site-wide crawl block found");

const manifest = fs.existsSync(path.join(root, "manifest.webmanifest")) ? JSON.parse(read("manifest.webmanifest")) : null;
if (!manifest) errors.push("manifest.webmanifest: missing");
else for (const icon of manifest.icons || []) checkReference("manifest.webmanifest", icon.src, "manifest icon");

const htaccess = fs.existsSync(path.join(root, ".htaccess")) ? read(".htaccess") : "";
for (const [label, needle] of [
  ["canonical host redirect", "https://mass.llc%{REQUEST_URI}"],
  ["AIMEE migration", "^aimee(?:\\.html)?/?$ /mims"],
  ["extensionless resolver", "%{REQUEST_FILENAME}.html -f"],
  ["reader exception", "reader.html"],
]) if (!htaccess.includes(needle)) errors.push(`.htaccess: missing ${label}`);

for (const script of allFiles.filter(file => /\.(?:js|mjs)$/.test(file))) {
  const syntax = spawnSync(process.execPath, ["--check", path.join(root, script)], { encoding: "utf8" });
  if (syntax.error || syntax.status !== 0) errors.push(`${script}: JavaScript syntax check failed${syntax.stderr ? ` (${syntax.stderr.trim()})` : ""}`);
}


// SEO hardening invariants: source-grounded structured data, social metadata, and AI directory checks.
function attribute(tag, name) {
  const match = new RegExp(String.raw`\s${name}\s*=\s*(["'])([\s\S]*?)\1`, "i").exec(tag);
  return match?.[2] || "";
}
function metaContents(html, key) {
  return [...html.matchAll(/<meta\b[^>]*>/gi)]
    .filter(match => [attribute(match[0], "name").toLowerCase(), attribute(match[0], "property").toLowerCase()].includes(key.toLowerCase()))
    .map(match => attribute(match[0], "content"));
}
function flattenJsonLd(value) {
  if (Array.isArray(value)) return value.flatMap(flattenJsonLd);
  if (!value || typeof value !== "object") return [];
  return [value, ...flattenJsonLd(value["@graph"] || [])];
}
function normalizedPhone(value) { return String(value || "").replace(/[^0-9+]/g, ""); }
function localCanonical(value) {
  try {
    const parsed = new URL(value);
    if (parsed.origin !== siteOrigin) return null;
    return `${siteOrigin}${parsed.pathname === "/" ? "/" : parsed.pathname.replace(/\/$/, "")}`;
  } catch { return null; }
}
const socialMeta = ["og:title", "og:description", "og:url", "og:image", "og:site_name", "twitter:card", "twitter:title", "twitter:description", "twitter:image"];
for (const file of allHtml) {
  const seen = new Set();
  for (const match of read(file).matchAll(/<meta\b[^>]*>/gi)) {
    for (const key of [attribute(match[0], "name"), attribute(match[0], "property")].filter(Boolean).map(value => value.toLowerCase())) {
      if (seen.has(key)) errors.push(`${file}: duplicate meta ${key}`);
      seen.add(key);
    }
  }
}
const pageSchemaTypes = new Set(["WebPage", "AboutPage", "ContactPage", "CollectionPage", "Article", "BlogPosting", "Service", "Product", "FAQPage"]);
const validOrganisationEmails = new Set(["info@mass.llc"]);
const validOrganisationPhones = new Set(["+15404887038", "+917483509091"]);
for (const file of publicHtml) {
  const html = read(file);
  const expected = file === "index.html" ? `${siteOrigin}/` : `${siteOrigin}/${file.slice(0, -5)}`;
  for (const key of socialMeta) {
    const values = metaContents(html, key);
    if (values.length !== 1 || !values[0].trim()) errors.push(`${file}: expected one nonempty ${key} meta tag`);
  }
  const ogUrl = metaContents(html, "og:url")[0];
  if (ogUrl && ogUrl !== expected) errors.push(`${file}: og:url must be ${expected}, found ${ogUrl}`);
  for (const key of ["og:image", "twitter:image"]) {
    const value = metaContents(html, key)[0];
    if (value && isSameOrigin(value)) checkReference(file, value, key);
  }
  const nodes = [];
  for (const block of html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
    try { nodes.push(...flattenJsonLd(JSON.parse(block[1].trim()))); } catch { /* existing syntax check reports this */ }
  }
  if (!nodes.length) errors.push(`${file}: expected at least one JSON-LD object`);
  for (const node of nodes) {
    const types = Array.isArray(node["@type"]) ? node["@type"] : [node["@type"]];
    const isPageNode = types.some(type => pageSchemaTypes.has(type));
    if (isPageNode && typeof node.url === "string" && node.url !== expected) errors.push(`${file}: page JSON-LD url must be ${expected}, found ${node.url}`);
    if (isPageNode && typeof node["@id"] === "string" && node["@id"].startsWith(siteOrigin) && !(node["@id"] === expected || node["@id"].startsWith(`${expected}#`))) errors.push(`${file}: page JSON-LD @id must identify its canonical page`);
    const isOrganisation = types.includes("Organization") || types.includes("ContactPoint");
    if (isOrganisation && node.email && !validOrganisationEmails.has(String(node.email).toLowerCase())) errors.push(`${file}: schema email is not the approved public contact address`);
    const phones = Array.isArray(node.telephone) ? node.telephone : node.telephone ? [node.telephone] : [];
    for (const phone of phones) if (!validOrganisationPhones.has(normalizedPhone(phone))) errors.push(`${file}: schema telephone is not an approved public MASS phone`);
    for (const key of ["url", "@id", "item"]) {
      if (typeof node[key] !== "string") continue;
      const canonical = localCanonical(node[key]);
      if (canonical) { const schemaFile = canonical === siteOrigin + "/" ? "index.html" : `${canonical.slice(siteOrigin.length + 1)}.html`; if (!rootHtml.includes(schemaFile)) errors.push(`${file}: JSON-LD ${key} points to a missing local canonical page ${node[key]}`); }
      if (node[key].startsWith("http://mass.llc") || node[key].startsWith("https://www.mass.llc")) errors.push(`${file}: JSON-LD ${key} must use the HTTPS non-www origin`);
    }
  }
}

const llmsPath = path.join(root, "llms.txt");
if (!fs.existsSync(llmsPath)) errors.push("llms.txt: missing");
else {
  const llms = read("llms.txt");
  if (/contact@mass\.llc/i.test(llms)) errors.push("llms.txt: retired public contact email remains");
  const links = [...llms.matchAll(/https:\/\/mass\.llc(?:\/[A-Za-z0-9-]*)?/g)].map(match => match[0]);
  for (const url of links) if (!sitemapUrls.has(url)) errors.push(`llms.txt: link is not a current sitemap canonical: ${url}`);
  for (const url of [`${siteOrigin}/ai-automation`, `${siteOrigin}/web-development`, `${siteOrigin}/software-development`, `${siteOrigin}/agentic-ai`, `${siteOrigin}/mims`, `${siteOrigin}/campus`, `${siteOrigin}/contact`]) if (!links.includes(url)) errors.push(`llms.txt: required factual directory link missing: ${url}`);
}

for (const [label, needle] of [
  ["PDF/MJS noindex policy", '<FilesMatch "\\.(?:pdf|mjs)$">'],
  ["PDF/MJS X-Robots policy", 'Header always set X-Robots-Tag "noindex, nofollow"'],
  ["reader noindex policy", '<Files "reader.html">'],
]) if (!htaccess.includes(needle)) errors.push(`.htaccess: missing ${label}`);

const indexableHtml = publicHtml.filter(file => !/<meta\s+name=["']robots["'][^>]*content=["'][^"']*noindex/i.test(read(file)));
console.log(`SEO audit: ${indexableHtml.length} indexable routes, ${publicHtml.length} root-page candidates, ${allHtml.length} HTML documents, ${allFiles.length} deployable files checked.`);
if (warnings.length) {
  console.log("\nWarnings:");
  warnings.forEach(warning => console.log(`- ${warning}`));
}
if (errors.length) {
  console.error("\nErrors:");
  errors.forEach(error => console.error(`- ${error}`));
  process.exitCode = 1;
} else {
  console.log("\nPASS: metadata, internal references, routes, sitemap, robots, manifest, and public-page reachability validated.");
}
