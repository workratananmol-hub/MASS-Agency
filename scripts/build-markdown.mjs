// Builds the Markdown representation of every indexable public page into md/.
// Apache serves md/<page>.md when a client sends "Accept: text/markdown"
// (see .htaccess), and at the direct URL https://mass.llc/<page>.md.
//
// Usage:  node scripts/build-markdown.mjs          (write md/)
//         node scripts/build-markdown.mjs --check  (fail if md/ is stale)
import fs from "node:fs";
import path from "node:path";
import TurndownService from "turndown";

const root = process.cwd();
const origin = "https://mass.llc";
const outDir = path.join(root, "md");
const check = process.argv.includes("--check");

// Redirect-only sources and noindex pages get no Markdown twin.
const redirectSources = new Set(["aimee.html", "website.html"]);
const isNoindex = html => /<meta\s+name=["']robots["'][^>]*content=["'][^"']*noindex/i.test(html);

const td = new TurndownService({ headingStyle: "atx", codeBlockStyle: "fenced", bulletListMarker: "-" });
// Decorative and interactive-only markup carries no content for an agent.
td.remove(["script", "style", "noscript", "svg", "canvas", "iframe", "template", "form", "button", "video", "picture source"]);
td.addRule("ariaHidden", {
  filter: node => node.nodeType === 1 && node.getAttribute("aria-hidden") === "true",
  replacement: () => ""
});
// Tag lists such as .capability-list are runs of bare <span>s; give them
// bullets so the items do not run together.
td.addRule("spanList", {
  filter: node => node.nodeType === 1 && /\bcapability-list\b/.test(node.getAttribute("class") || ""),
  replacement: (_content, node) => "\n\n" + Array.from(node.childNodes).filter(c => c.nodeType === 1).map(c => `- ${c.textContent.replace(/\s+/g, " ").trim()}`).join("\n") + "\n\n"
});
td.addRule("hidden", {
  filter: node => node.nodeType === 1 && node.hasAttribute("hidden"),
  replacement: () => ""
});

const decode = s => s
  .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
  .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, " ");

const meta = (html, re) => { const m = html.match(re); return m ? decode(m[1].replace(/\s+/g, " ").trim()) : ""; };

function toMarkdown(file, html) {
  const title = meta(html, /<title>([\s\S]*?)<\/title>/i);
  const description = meta(html, /<meta\s+name=["']description["']\s+content=["']([\s\S]*?)["']/i);
  const canonical = meta(html, /<link\s+[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["']/i)
    || `${origin}/${file === "index.html" ? "" : file.replace(/\.html$/, "")}`;
  const mainMatch = html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i);
  if (!mainMatch) throw new Error(`${file}: no <main> element`);
  // Agents read Markdown out of context, so make site-relative URLs absolute.
  const body = mainMatch[1]
    .replace(/(href|src)=(["'])\/(?!\/)/g, `$1=$2${origin}/`)
    .replace(/(href)=(["'])#/g, `$1=$2${canonical}#`)
    // Inline siblings with no whitespace between them would otherwise merge
    // into one word ("Custom designMobile ...").
    .replace(/(<\/(?:span|a|strong|em|b|small|i)>)(?=<(?:span|a|strong|em|b|small|i)\b)/g, "$1 ");
  let md = td.turndown(body)
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]+\n/g, "\n")
    .trim();
  const front = [
    "---",
    `title: ${JSON.stringify(title)}`,
    description ? `description: ${JSON.stringify(description)}` : null,
    `canonical: ${canonical}`,
    "---"
  ].filter(Boolean).join("\n");
  const contact = file === "contact.html"
    ? "\n\n## Contact\n\nEmail [info@mass.llc](mailto:info@mass.llc) or use the form at " + canonical + "."
    : "";
  return `${front}\n\n${md}${contact}\n\n---\n\nSite directory: ${origin}/llms.txt\n`;
}

const pages = fs.readdirSync(root)
  .filter(f => f.endsWith(".html") && !/^(404|500)\.html$/.test(f) && !redirectSources.has(f))
  .filter(f => !isNoindex(fs.readFileSync(path.join(root, f), "utf8")))
  .sort();

if (!check) fs.mkdirSync(outDir, { recursive: true });
const stale = [];
const expected = new Set();
for (const file of pages) {
  const name = file.replace(/\.html$/, ".md");
  expected.add(name);
  const md = toMarkdown(file, fs.readFileSync(path.join(root, file), "utf8"));
  const target = path.join(outDir, name);
  const current = fs.existsSync(target) ? fs.readFileSync(target, "utf8") : null;
  if (current === md) continue;
  if (check) stale.push(name);
  else fs.writeFileSync(target, md);
}
const extra = fs.existsSync(outDir) ? fs.readdirSync(outDir).filter(f => !expected.has(f)) : [];
if (check) {
  if (stale.length || extra.length) {
    console.error(`md/ is stale. Run: npm run md:build\n  outdated: ${stale.join(", ") || "-"}\n  orphaned: ${extra.join(", ") || "-"}`);
    process.exit(1);
  }
  console.log(`PASS: md/ matches ${pages.length} pages.`);
} else {
  for (const f of extra) fs.rmSync(path.join(outDir, f));
  console.log(`Wrote ${pages.length} Markdown pages to md/${extra.length ? `, removed ${extra.length}` : ""}.`);
}
