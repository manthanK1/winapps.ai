# Deploying www.winapps.co.in

The site is static: `npm run build` writes plain HTML, CSS, a few small scripts and the SEO files to `dist/`.

- **Production:** www.winapps.co.in is hosted on cPanel and uploaded by FTP. See [Uploading to cPanel](#uploading-to-cpanel).
- **Preview:** https://manthank1.github.io/winapps.ai/, deployed by `.github/workflows/deploy.yml` on every push to `main`. The workflow builds with `SITE_URL=https://manthank1.github.io` and `BASE_PATH=/winapps.ai/` by default, so links, canonicals, the sitemap and llms.txt all point there. The IndexNow ping is skipped.

Local builds (`npm run build`) default to the production domain.

## Uploading to cPanel

1. Copy `.env.example` to `.env` in the project root (git ignores it) and fill in `PUBLIC_WEB3FORMS_KEY` and `PUBLIC_TALLY_CAREERS_FORM_ID`. Astro bakes them into the HTML, as Web3Forms and Tally intend for browser forms. They are not read from GitHub, so a build without this file ships forms that only open the visitor's email app and role pages with no application form.
2. In PowerShell, run `Remove-Item Env:SITE_URL, Env:BASE_PATH -ErrorAction SilentlyContinue`, then `npm run build` and `npm run qa:release`, which fails if either value is missing.
3. Check that the canonical link in `dist/index.html` shows `www.winapps.co.in` and `dist/contact/index.html` contains `data-mode="web3forms"`. A build made for the preview has the wrong URLs, so never upload one.
4. Download a backup of `public_html`.
5. Over FTPS, upload the contents of `dist/`, not the folder itself, into `public_html`: `_astro` first, then the rest. Delete nothing: leave `.htaccess`, `.well-known`, `cgi-bin` and any mail folders in place.
6. View the source of the live `/contact/` page and check it shows `data-mode="web3forms"`.
7. Send a test enquiry from the contact form and the footer form, and check it reaches sales@winapps.co.in. Send a test application with a PDF from a page under `/careers/`, check it appears in Tally and the Google Sheet with the right position, and check the alert reaches hr@winapps.co.in with a link to the file. Delete the test entries afterwards.

### Contact forms

Both lead forms post from the visitor's browser to Web3Forms, so the server does no form processing. Enquiries go to the address the access key was created with. hCaptcha uses Web3Forms' shared free-plan site key (`src/scripts/lead-form.ts`) and must be enabled in the Web3Forms dashboard for the form.

### Job application form

Each `/careers/<id>/` page embeds one free Tally form, set by `PUBLIC_TALLY_CAREERS_FORM_ID`, and passes the role title in a hidden `position` field. The Tally form itself enforces the required fields, the PDF-only rule, the size limit and reCAPTCHA. Answers go to the Tally dashboard and a Google Sheet, and hr@winapps.co.in gets an email alert with a link to the resume, not an attachment. Anyone who can open that Sheet can open the resumes, so keep its access limited to HR. Resumes must be deleted by hand within 6 months of the role closing, from Tally, the Sheet and the alerts. Without the form ID, role pages ask applicants to email their PDF to HR. To change the roles, edit `src/content/careers.yaml`.

## Build settings

All are read at build time. In GitHub, set them as repository **variables** (Settings → Secrets and variables → Actions → Variables); every one is optional.

| Repository variable | Build env | Default | What it does |
| --- | --- | --- | --- |
| `SITE_URL` | `SITE_URL` | CI: `https://manthank1.github.io` · local: `https://www.winapps.co.in` | Origin for canonicals, sitemap, Open Graph, JSON-LD, llms.txt and the .md pages |
| `BASE_PATH` | `BASE_PATH` | CI: `/winapps.ai/` · local: `/` | Sub-path the site is served from. `/` on the custom domain |
| `WEB3FORMS_KEY` | `PUBLIC_WEB3FORMS_KEY` | _(empty)_ | Web3Forms access key for the contact and footer forms (created with sales@winapps.co.in). Without it the forms open the visitor's email app. Local builds read it from `.env` |
| `TALLY_CAREERS_FORM_ID` | `PUBLIC_TALLY_CAREERS_FORM_ID` | _(empty)_ | ID of the Tally job application form, from its share link (`tally.so/r/<id>`). Without it role pages ask applicants to email HR. Local builds read it from `.env` |
| `PLAUSIBLE_DOMAIN` | `PUBLIC_PLAUSIBLE_DOMAIN` | _(empty)_ | Turns on cookieless Plausible analytics, e.g. `www.winapps.co.in` |

## GitHub Pages setup (once)

1. Repository **Settings → Pages → Build and deployment → Source: GitHub Actions**.
2. **Actions → Deploy to GitHub Pages → Run workflow** (or push to `main`). The workflow checks out full history (the sitemap's `<lastmod>` comes from git), builds with Node 24, runs `npm run qa`, and publishes `dist/`.

## Moving www.winapps.co.in to GitHub Pages (optional)

Production runs on cPanel, so this is not needed today. These steps apply only if the site ever moves to GitHub Pages; switching DNS replaces the cPanel site.

1. **Settings → Secrets and variables → Actions → Variables**: add `SITE_URL` = `https://www.winapps.co.in` and `BASE_PATH` = `/`. This also turns on the IndexNow ping after each deploy.
2. **Custom domain**: Settings → Pages → Custom domain → `www.winapps.co.in` → Save. With an Actions workflow GitHub reads the domain from this setting; `public/CNAME` (`www.winapps.co.in`) is kept in the build for reference and for other hosts.
3. Verify the domain first (Settings of your account or organisation → Pages → Add a verified domain) to prevent takeovers.
4. **DNS** in the panel of whoever hosts the domain's nameservers (today `ns1-ls1.pwh-r1.com`). Leave MX and other mail records alone:

   | Type | Name | Value |
   | --- | --- | --- |
   | CNAME | `www` | `manthank1.github.io` (no repository name) |
   | A | `@` | `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153` |
   | AAAA | `@` | `2606:50c0:8000::153`, `2606:50c0:8001::153`, `2606:50c0:8002::153`, `2606:50c0:8003::153` |

   With both in place GitHub redirects `winapps.co.in` to `www.winapps.co.in`, and the github.io preview URL redirects to the domain as well. No wildcard records. (IPs: [GitHub docs](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site).)
5. Tick **Enforce HTTPS** once it becomes available (can take up to 24 hours after DNS resolves).

Old winapps.co.in URLs keep working: every path in `src/lib/legacy-redirects.ts` gets a small redirect page, and blog/news posts keep their slugs.

## IndexNow (Bing, Yandex and others)

- The key is `public/<32 hex chars>.txt` (served at `https://www.winapps.co.in/<key>.txt`). Keep the file; changing the key means re-confirming it in Bing Webmaster Tools.
- Once `SITE_URL` is set to the real domain, after each deploy from `main` the `indexnow` job waits a minute, reads the **live** sitemap and POSTs every URL to `https://api.indexnow.org/indexnow`. It never fails a deploy.
- By hand: `npm run indexnow -- --dry-run` shows what would be sent; `npm run indexnow` sends it.

## After launch

### Google Search Console

1. Add a **Domain** property for `winapps.co.in` and verify it with the DNS **TXT** record Google gives you.
2. Sitemaps → submit `https://www.winapps.co.in/sitemap-index.xml`.
3. URL inspection → test and request indexing for `/`, `/services/`, each `/services/<id>/`, `/work/`, `/training/`, `/about/`, `/contact/`.
4. After a few days check **Pages** (Page indexing: why any URL is not indexed) and **Enhancements**: Breadcrumbs, FAQ, Course. Fix anything flagged, then *Validate fix*.
5. Check that the old site's URLs (e.g. `/case-studies`, `/contact-us`) land on the new pages.

### Bing Webmaster Tools

1. Add the site: **Import from Google Search Console** (quickest), or verify with the DNS CNAME record, the XML file or the meta tag Bing offers.
2. Sitemaps → submit `https://www.winapps.co.in/sitemap-index.xml`.
3. IndexNow → confirm the key is recognised and submissions appear after a deploy.
4. URL inspection on the key pages, as above.

### Quick checks

- `https://www.winapps.co.in/robots.txt`, `/llms.txt`, `/index.md`, `/.well-known/security.txt` load.
- Rich Results Test on a service, a course and a blog post.
- Renew `Expires` in `public/.well-known/security.txt` before **2027-10-29**.

## Other static hosts

Build command `npm run build`, output `dist`, Node 24, `SITE_URL` and `BASE_PATH=/` set. Works on Netlify, Cloudflare Pages or Vercel without changes.
