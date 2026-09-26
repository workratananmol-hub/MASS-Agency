import fs from "node:fs";
import path from "node:path";

const root=process.cwd();
const files=fs.readdirSync(root);
const htmlFiles=files.filter(name=>name.endsWith(".html")).sort();
const errors=[];
const warnings=[];
const canonicalToFile=new Map();

const read=file=>fs.readFileSync(path.join(root,file),"utf8");
const stripHashAndQuery=value=>value.split("#")[0].split("?")[0];
const publicUrlFor=file=>file==="index.html"?"https://mass.llc/":`https://mass.llc/${file.replace(/\.html$/,"")}`;
const isNoindex=html=>/<meta\s+name=["']robots["'][^>]*content=["'][^"']*noindex/i.test(html);
const getMatches=(html,re)=>[...html.matchAll(re)].map(m=>m[1]??m[0]);

const routeExists=route=>{
  const clean=stripHashAndQuery(route);
  if(clean==="/"||clean==="") return true;
  if(clean.startsWith("/assets/")||clean.startsWith("/css/")||clean.startsWith("/js/")||clean.startsWith("/.well-known/")) return true;
  const trimmed=clean.replace(/^\//,"").replace(/\/$/,"");
  if(!trimmed) return true;
  if(fs.existsSync(path.join(root,trimmed))) return true;
  if(fs.existsSync(path.join(root,`${trimmed}.html`))) return true;
  return false;
};

for(const file of htmlFiles){
  const html=read(file);
  const noindex=isNoindex(html);

  const titles=getMatches(html,/<title>([\s\S]*?)<\/title>/gi);
  if(titles.length!==1) errors.push(`${file}: expected exactly one <title>, found ${titles.length}`);

  const descriptions=getMatches(html,/<meta\s+name=["']description["'][^>]*content=["']([^"']*)["'][^>]*>/gi);
  if(!noindex && descriptions.length!==1) errors.push(`${file}: expected one meta description, found ${descriptions.length}`);

  const canonicals=getMatches(html,/<link\s+rel=["']canonical["'][^>]*href=["']([^"']+)["'][^>]*>/gi);
  if(!noindex && canonicals.length!==1) errors.push(`${file}: expected one canonical, found ${canonicals.length}`);
  if(canonicals.length===1){
    const canonical=canonicals[0];
    if(!canonical.startsWith("https://mass.llc/")) errors.push(`${file}: canonical is off-domain: ${canonical}`);
    if(/\.html(?:$|[?#])/.test(canonical)||/\/index(?:$|[?#])/.test(canonical)) errors.push(`${file}: canonical is not extensionless/root-normalized: ${canonical}`);
    if(!noindex){
      const expected=publicUrlFor(file);
      // website.html is retained only as a redirect source and canonicals to /web-development.
      if(file!=="website.html" && canonical!==expected) errors.push(`${file}: canonical ${canonical} does not match expected ${expected}`);
      if(canonicalToFile.has(canonical) && canonicalToFile.get(canonical)!==file && file!=="website.html"){
        errors.push(`${file}: duplicate canonical also used by ${canonicalToFile.get(canonical)}: ${canonical}`);
      } else canonicalToFile.set(canonical,file);
    }
  }

  const h1Count=(html.match(/<h1\b/gi)||[]).length;
  if(!noindex && h1Count!==1) errors.push(`${file}: expected exactly one H1, found ${h1Count}`);

  if(/<meta\s+name=["']keywords["']/i.test(html)) warnings.push(`${file}: obsolete meta keywords tag remains`);

  for(const block of html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)){
    const raw=block[1].trim();
    if(!raw) continue;
    try{JSON.parse(raw)}catch(error){errors.push(`${file}: invalid JSON-LD: ${error.message}`)}
  }

  for(const href of getMatches(html,/<a\b[^>]*href=["']([^"']+)["'][^>]*>/gi)){
    if(!href||href.startsWith("#")||href.startsWith("mailto:")||href.startsWith("tel:")||href.startsWith("javascript:")) continue;
    if(/^https?:\/\//i.test(href)) continue;
    if(!href.startsWith("/")) continue;
    if(!routeExists(href)) errors.push(`${file}: internal link does not resolve in repo: ${href}`);
    if(/^\/website(?:[/?#]|$)/.test(href)) errors.push(`${file}: stale /website internal link remains: ${href}`);
    if(/\.html(?:[?#]|$)/.test(href)) warnings.push(`${file}: internal link uses .html: ${href}`);
  }
}

const sitemapPath=path.join(root,"sitemap.xml");
if(!fs.existsSync(sitemapPath)) errors.push("sitemap.xml: missing");
else{
  const xml=read("sitemap.xml");
  const urls=getMatches(xml,/<loc>([^<]+)<\/loc>/gi);
  const seen=new Set();
  for(const url of urls){
    if(seen.has(url)) errors.push(`sitemap.xml: duplicate URL: ${url}`);
    seen.add(url);
    if(!url.startsWith("https://mass.llc/")) errors.push(`sitemap.xml: off-domain URL: ${url}`);
    if(/\.html(?:$|[?#])/.test(url)||/\/index(?:$|[?#])/.test(url)||url==="https://mass.llc/website") errors.push(`sitemap.xml: noncanonical URL: ${url}`);
    const route=new URL(url).pathname;
    if(!routeExists(route)) errors.push(`sitemap.xml: URL has no deployable file: ${url}`);
    const file=route==="/"
      ?"index.html"
      :`${route.replace(/^\//,"").replace(/\/$/,"")}.html`;
    if(fs.existsSync(path.join(root,file)) && isNoindex(read(file))) errors.push(`sitemap.xml: noindex page included: ${url}`);
  }
  for(const [canonical,file] of canonicalToFile.entries()){
    if(file==="404.html"||file==="500.html"||file==="website.html") continue;
    if(!isNoindex(read(file)) && !seen.has(canonical)) warnings.push(`sitemap.xml: indexable canonical missing from sitemap: ${canonical} (${file})`);
  }
}

const robotsPath=path.join(root,"robots.txt");
if(!fs.existsSync(robotsPath)) errors.push("robots.txt: missing");
else{
  const robots=read("robots.txt");
  if(!/Sitemap:\s*https:\/\/mass\.llc\/sitemap\.xml/i.test(robots)) errors.push("robots.txt: canonical sitemap declaration missing");
  if(/Disallow:\s*\//i.test(robots)) warnings.push("robots.txt: broad Disallow directive detected; verify intentionally");
}

const htaccessPath=path.join(root,".htaccess");
if(!fs.existsSync(htaccessPath)) errors.push(".htaccess: missing");
else{
  const ht=read(".htaccess");
  const required=[
    ["HTTP→HTTPS/canonical host","https://mass.llc%{REQUEST_URI}"],
    ["/index redirect","RewriteRule ^index/?$ /"],
    ["/website migration","RewriteRule ^website"],
    ["extensionless resolver","%{REQUEST_FILENAME}.html -f"]
  ];
  for(const [label,needle] of required) if(!ht.includes(needle)) errors.push(`.htaccess: missing ${label}`);
}

console.log(`SEO audit: ${htmlFiles.length} HTML files checked`);
if(warnings.length){
  console.log("\nWarnings:");
  for(const warning of warnings) console.log(`- ${warning}`);
}
if(errors.length){
  console.error("\nErrors:");
  for(const error of errors) console.error(`- ${error}`);
  process.exitCode=1;
}else{
  console.log("\nPASS: no blocking SEO validation errors.");
}
