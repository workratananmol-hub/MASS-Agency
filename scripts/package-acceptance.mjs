import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";

const [archiveArg, manifestArg] = process.argv.slice(2);
if (!archiveArg || !manifestArg) throw new Error("Usage: node scripts/package-acceptance.mjs <archive.zip> <package-verification.json>");
const archive = path.resolve(archiveArg);
const manifestPath = path.resolve(manifestArg);
const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
const root = process.cwd();
const sha256 = value => createHash("sha256").update(value).digest("hex");
if (!fs.existsSync(archive)) throw new Error(`Archive missing: ${archive}`);
if (!Array.isArray(manifest.entries) || !manifest.release || !manifest.sha256) throw new Error("Manifest must contain release, sha256, and entries");
if (manifest.archive && path.basename(manifest.archive) !== path.basename(archive)) throw new Error("Manifest archive name does not match supplied archive");
if (sha256(fs.readFileSync(archive)) !== manifest.sha256.toLowerCase()) throw new Error("Archive SHA-256 does not match manifest");
const python = process.env.PYTHON || "python";
const validator = String.raw`
import hashlib, json, os, subprocess, sys, zipfile
archive, manifest_path, root = sys.argv[1:]
with open(manifest_path, encoding="utf-8") as stream: manifest = json.load(stream)
records = {item['path']: item for item in manifest['entries']}
allowed_root = {'.htaccess','404.html','500.html','favicon.svg','llms.txt','manifest.webmanifest','robots.txt','sitemap.xml'}
allowed_dirs = {'.well-known','assets','css','js'}
with zipfile.ZipFile(archive) as z:
    bad_crc = z.testzip()
    if bad_crc: raise SystemExit('CRC validation failed: ' + bad_crc)
    names = [item.filename for item in z.infolist() if not item.is_dir()]
    if len(names) != len(set(names)): raise SystemExit('Archive has duplicate paths')
    if set(names) != set(records): raise SystemExit('Archive paths do not exactly match manifest entries')
    for name in names:
        first = name.split('/')[0]
        if name.startswith(('/', '../')) or '/..' in name or (first not in allowed_dirs and not (first in allowed_root or name.endswith('.html') and '/' not in name)):
            raise SystemExit('Archive path outside deploy allowlist: ' + name)
        record = records[name]; data = z.read(name)
        if len(data) != record.get('bytes') or hashlib.sha256(data).hexdigest() != record.get('sha256'):
            raise SystemExit('Manifest mismatch: ' + name)
        blob = subprocess.check_output(['git','-C',root,'cat-file','-p',record['git_blob']])
        if data != blob: raise SystemExit('Committed blob mismatch: ' + name)
print(json.dumps({'release': manifest['release'], 'files': len(records), 'sha256': manifest['sha256']}))
`;
const result = spawnSync(python, ["-c", validator, archive, manifestPath, root], { encoding: "utf8" });
if (result.error || result.status !== 0) throw result.error || new Error(result.stderr.trim() || "Package acceptance failed");
console.log(`Package acceptance passed: ${result.stdout.trim()}`);
