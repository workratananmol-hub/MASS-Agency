import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";

const root = process.cwd();
const output = path.resolve(root, "../../output");
const runGit = args => {
  const result = spawnSync("git", args, { cwd: root, encoding: "utf8" });
  if (result.error || result.status !== 0) throw result.error || new Error(result.stderr.trim() || `git ${args.join(" ")} failed`);
  return result.stdout.trim();
};
const release = runGit(["rev-parse", "HEAD"]);
const shortRelease = release.slice(0, 12);
const date = new Date().toISOString().slice(0, 10);
const archive = path.join(output, `MASS-seo-deploy-ready-${date}-${shortRelease}.zip`);
const manifestPath = archive.replace(/\.zip$/i, ".package-verification.json");
const includedRootFiles = new Set([".htaccess", "404.html", "500.html", "favicon.svg", "llms.txt", "manifest.webmanifest", "robots.txt", "sitemap.xml"]);
const includedDirectories = new Set([".well-known", "assets", "css", "js"]);
const required = [".htaccess", "index.html", "robots.txt", "sitemap.xml", "manifest.webmanifest", "favicon.svg", "llms.txt"];
const isAllowed = file => {
  const segments = file.split("/");
  if (segments.some(segment => !segment || segment === "." || segment === "..")) return false;
  if (segments.length === 1) return includedRootFiles.has(file) || file.endsWith(".html");
  return includedDirectories.has(segments[0]);
};
if (fs.existsSync(archive) || fs.existsSync(manifestPath)) throw new Error(`Refusing to overwrite an existing release artifact: ${archive}`);
const files = runGit(["ls-tree", "-r", "--name-only", release]).split("\n").filter(Boolean).filter(isAllowed).sort();
for (const file of required) if (!files.includes(file)) throw new Error(`Required deploy file missing from committed release: ${file}`);
if (!files.length) throw new Error("No deployable committed files found");
fs.mkdirSync(output, { recursive: true });
const python = process.env.PYTHON || "python";
const builder = String.raw`
import datetime, hashlib, json, os, subprocess, sys, zipfile
root, archive, release, *files = sys.argv[1:]
now = datetime.datetime.now(datetime.timezone.utc).replace(microsecond=0)
zip_time = (max(now.year, 1980), now.month, now.day, now.hour, now.minute, now.second - (now.second % 2))
records = []
with zipfile.ZipFile(archive, "x", compression=zipfile.ZIP_DEFLATED, compresslevel=9, strict_timestamps=True) as z:
    for rel in files:
        data = subprocess.check_output(["git", "-C", root, "show", f"{release}:{rel}"])
        blob = subprocess.check_output(["git", "-C", root, "rev-parse", f"{release}:{rel}"], text=True).strip()
        info = zipfile.ZipInfo(rel, date_time=zip_time)
        info.compress_type = zipfile.ZIP_DEFLATED
        info.external_attr = 0o100644 << 16
        z.writestr(info, data, compress_type=zipfile.ZIP_DEFLATED, compresslevel=9)
        records.append({"path": rel, "git_blob": blob, "bytes": len(data), "sha256": hashlib.sha256(data).hexdigest(), "zip_utc_timestamp": now.isoformat()})
with open(archive, "rb") as stream: archive_sha = hashlib.sha256(stream.read()).hexdigest()
manifest = {"release": release, "archive": archive, "sha256": archive_sha, "bytes": os.path.getsize(archive), "files": len(records), "created_at_utc": now.isoformat(), "source": "Exact committed Git blobs with fresh UTC ZIP timestamps", "entries": records}
with open(archive[:-4] + ".package-verification.json", "w", encoding="utf-8", newline="\n") as stream: json.dump(manifest, stream, indent=2)
`;
const build = spawnSync(python, ["-c", builder, root, archive, release, ...files], { encoding: "utf8" });
if (build.error || build.status !== 0) throw build.error || new Error(build.stderr.trim() || "Release archive creation failed");
const check = spawnSync(process.execPath, ["scripts/package-acceptance.mjs", archive, manifestPath], { cwd: root, encoding: "utf8" });
if (check.error || check.status !== 0) throw check.error || new Error(check.stderr.trim() || "Release package acceptance failed");
console.log(check.stdout.trim());
console.log(`Release archive: ${archive}`);
console.log(`Release manifest: ${manifestPath}`);
