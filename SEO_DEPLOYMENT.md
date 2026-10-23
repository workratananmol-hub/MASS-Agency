# MASS SEO deployment

This branch is the deployable SEO integration branch for `mass.llc`. The final archive is made for a Hostinger Apache document root: its files must sit directly in the document root, including `.htaccess` and `.well-known`.

## Pre-deploy checks

1. Run `npm ci`.
2. Run `npm run seo:audit`. It validates indexable metadata, canonicals, JSON-LD syntax, sitemap coverage, local HTML/CSS/runtime asset references, fragments, robots, the manifest and inbound links to public pages.
3. Run `npm run package:release`. It writes a ZIP under the entity `output` directory and verifies that development material is excluded.
4. Inspect the archive before upload. It intentionally contains only production pages, `.htaccess`, `.well-known`, assets, CSS, JavaScript, favicons and crawl files. It excludes Git data, CI configuration, documentation, scripts, source artifacts, Node dependencies and previous archives.
5. Back up the current Hostinger document root before replacing it. Confirm Hostinger permits Apache rewrite rules and hidden files are uploaded.

## Canonical migrations

- `/index` and `/index.html` → `/`
- `/website` and `/website.html` → `/web-development`
- `/aimee`, `/aimee/`, `/aimee.html` and case variants → `/mims`
- `/service-web-mobile` → `/web-development`
- `/services` → `/`
- `/insight-roi-ai-automation` → `/ai-automation-roi`
- `/blog-posts/ai-document-processing-automation` → `/ai-automation`
- `/blog-posts/react-vs-nextjs-saas` → `/software-development`

Root marketing routes use extensionless canonical URLs; an accidental trailing slash on one of those routes redirects to the equivalent extensionless URL. Existing directories and technical assets, including the MIMS PDF reader at `/assets/mims/documents/reader.html`, are excluded from that normalization. The reader and supporting PDFs use an `X-Robots-Tag: noindex, nofollow` response header, while remaining available to visitors.

## Pages added to this release

- `/mims` — MIMS teaching-system landing page. It replaces the public AIMEE listing. The product remains clearly marked as in development and the initial CBSE scope is stated on the page.
- `/campus` — Campus AI sessions landing page.

## Post-upload verification

Use an incognito browser or `curl -I` against the deployed domain to confirm:

- `/`, `/mims` and `/campus` return `200`.
- `/aimee`, `/aimee/`, `/aimee.html` and `/AIMEE.HTML` each return a single `301` to `/mims`.
- `/mims/` and `/campus/` return a single `301` to their extensionless URLs.
- `/assets/mims/documents/reader.html?file=class10-trigonometry-test.pdf` returns `200`, loads all four pages and has the expected noindex header.
- `/assets/mims/documents/class10-trigonometry-test.pdf` and the worked key return `200` with `application/pdf` and the noindex header.
- `/sitemap.xml`, `/robots.txt`, `/llms.txt`, `/manifest.webmanifest` and `/.well-known/` resources return `200` where applicable.

## Search Console

After upload, submit `https://mass.llc/sitemap.xml` and inspect the new MIMS and Campus URLs after Google can crawl the replacement. GSC Wizard was unavailable during this release review because its connected account reported no active trial or subscription; no Search Console performance, index coverage or URL-inspection claim is made here.
