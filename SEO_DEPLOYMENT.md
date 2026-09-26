# MASS SEO Deployment Checklist

This branch is the deployable SEO integration branch for mass.llc.

## Visual-system guardrail

The SEO work does **not** change the brand palette, logo, fonts, CSS design system, spacing system, or existing visual alignment. New landing pages reuse the site's existing HTML classes and existing CSS.

## Source of truth

After deployment, this GitHub repository should be treated as the production source of truth. Before replacing the Hostinger document root, back up the current production files because older production-only files previously existed outside this repository.

## Pre-deploy checks

1. Run `npm ci` and `npm run seo:audit`.
2. Confirm the audit exits successfully.
3. Confirm `.htaccess` is uploaded; Hostinger must allow Apache rewrite rules.
4. Confirm hidden files such as `.htaccess` and the `.well-known` directory are included in deployment.
5. Back up the current Hostinger production directory before synchronizing files.

## Canonical migrations included

- `/index` and `/index.html` → `/`
- `/website` and `/website.html` → `/web-development`
- `/service-web-mobile` → `/web-development`
- `/services` → `/`
- `/insight-roi-ai-automation` → `/ai-automation-roi`
- `/blog-posts/ai-document-processing-automation` → `/ai-automation`
- `/blog-posts/react-vs-nextjs-saas` → `/software-development`

Do not remove these redirects while old URLs may still exist in search indexes or external links.

## New commercial pages

- `/ai-automation`
- `/web-development`
- `/software-development`
- `/pricing`

## Market pages

- `/usa`
- `/india`
- `/uae`

The India and UAE pages explicitly describe remote/international delivery and do not claim local offices.

## Analytics events added

The site emits these GA4 events without sending form-field or personal data:

- `generate_lead`
- `contact_cta_click`
- `email_click`
- `phone_click`

After deployment, mark `generate_lead` as a GA4 key event if it is not already configured.

## Post-deploy technical verification

- `/` → 200
- `/ai-automation` → 200
- `/web-development` → 200
- `/software-development` → 200
- `/pricing` → 200
- `/usa` → 200
- `/india` → 200
- `/uae` → 200
- `/website` → 301 to `/web-development`
- `/index` and `/index.html` → 301 to `/`
- `/sitemap.xml` → 200
- `/robots.txt` → 200

## Search Console after deployment

1. Resubmit `https://mass.llc/sitemap.xml`.
2. Inspect/request indexing for `/ai-automation`, `/web-development`, `/software-development`, and `/pricing`.
3. Then inspect `/usa`, `/india`, and `/uae`.
4. Reinspect `/about`, `/blog`, and important case studies that were previously discovered/crawled but not indexed.
5. Monitor query/page/country performance weekly rather than making rapid title changes before Google has recrawled the site.

## Notes

- `llms.txt` is included as a concise factual directory for AI systems. It is not treated as a Google ranking factor.
- The internal trading research page remains `noindex,follow`; robots.txt allows Google to crawl it so the noindex directive can be observed.
- Semrush and Ahrefs ChatGPT integrations are connected, but their current account/API plans block direct MCP data pulls. This does not block deployment or first-party Google measurement.
