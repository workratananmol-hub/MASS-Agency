import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const root = process.cwd();
const output = path.resolve(root, "../../output");
const date = new Date().toISOString().slice(0, 10);
const archive = path.join(output, `MASS-seo-deploy-ready-${date}.zip`);
const includedRootFiles = new Set([".htaccess", "404.html", "500.html", "favicon.svg", "llms.txt", "manifest.webmanifest", "robots.txt", "sitemap.xml"]);
const includedRootExtensions = new Set([".html"]);
const includedDirectories = new Set([".well-known", "assets", "css", "js"]);
const excludedSegments = new Set([".git", ".github", "docs", "node_modules", "output", "scripts", "src"]);

function walk(directory = "") {
  const target = path.join(root, directory);
  return fs.readdirSync(target, { withFileTypes: true }).flatMap(entry => {
    if (excludedSegments.has(entry.name)) return [];
    const next = path.join(directory, entry.name);
    if (entry.isDirectory()) return directory === "" && !includedDirectories.has(entry.name) ? [] : walk(next);
    if (directory === "" && !includedRootFiles.has(entry.name) && !includedRootExtensions.has(path.extname(entry.name).toLowerCase())) return [];
    return [next.split(path.sep).join("/")];
  });
}

const files = walk().sort();
const required = [".htaccess", "index.html", "robots.txt", "sitemap.xml", "manifest.webmanifest", "favicon.svg"];
for (const file of required) if (!files.includes(file)) throw new Error(`Required deploy file missing from package: ${file}`);
if (files.some(file => file.split("/").some(segment => excludedSegments.has(segment)))) throw new Error("Package allowlist included a development-only path");

fs.mkdirSync(output, { recursive: true });
const python = process.env.PYTHON || "python";
const builder = String.raw`
import os, sys, zipfile
root, archive, *files = sys.argv[1:]
temp = archive + ".tmp"
with zipfile.ZipFile(temp, "w", compression=zipfile.ZIP_DEFLATED, compresslevel=9) as z:
    for rel in files:
        z.write(os.path.join(root, rel.replace("/", os.sep)), rel)
os.replace(temp, archive)
`;
const result = spawnSync(python, ["-c", builder, root, archive, ...files], { stdio: "inherit" });
if (result.error || result.status !== 0) throw result.error || new Error(`Zip creation failed with exit code ${result.status}`);

const zipCheck = String.raw`
import hashlib, os, sys, zipfile
archive, root, *expected = sys.argv[1:]
with zipfile.ZipFile(archive) as z:
    corrupt = z.testzip()
    if corrupt: raise SystemExit("CRC validation failed for: " + corrupt)
    bad = [n for n in z.namelist() if n.startswith((".git/", "node_modules/", "docs/", "scripts/", "src/")) or n.endswith("/")]
    if bad: raise SystemExit("Unexpected archive entries: " + ", ".join(bad))
    if ".htaccess" not in z.namelist(): raise SystemExit(".htaccess missing from archive")
    actual = sorted(z.namelist())
    if actual != sorted(expected): raise SystemExit("Archive entry set differs from the allowlisted source set")
    for rel in expected:
        with open(os.path.join(root, rel.replace("/", os.sep)), "rb") as source:
            source_hash = hashlib.sha256(source.read()).digest()
        if source_hash != hashlib.sha256(z.read(rel)).digest():
            raise SystemExit("Archived content differs from source: " + rel)
print(f"Package verified: {len(z.namelist())} files")
`;
const verified = spawnSync(python, ["-c", zipCheck, archive, root, ...files], { encoding: "utf8" });
if (verified.error || verified.status !== 0) throw verified.error || new Error(verified.stderr || "Zip verification failed");
console.log(verified.stdout.trim());
console.log(`Release archive: ${archive}`);
