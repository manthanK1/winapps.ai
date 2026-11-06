# Deploying www.winapps.co.in

The site is static: `npm run build` writes plain HTML, CSS, a few small scripts and the SEO files to `dist/`.

- **Production:** www.winapps.co.in is hosted on cPanel and uploaded by FTP. See [Uploading to cPanel](#uploading-to-cpanel).
- **Preview:** https://manthank1.github.io/winapps.ai/, deployed by `.github/workflows/deploy.yml` on every push to `main`. The workflow builds with `SITE_URL=https://manthank1.github.io` and `BASE_PATH=/winapps.ai/` by default, so links, canonicals, the sitemap and llms.txt all point there. The IndexNow ping is skipped.

Local builds (`npm run build`) default to the production domain.

## Uploading to cPanel

1. Put the Web3Forms keys in a `.env` file in the project root (git ignores it): `PUBLIC_WEB3FORMS_KEY=...` and `PUBLIC_WEB3FORMS_HR_KEY=...`. Astro bakes them into the HTML, as Web3Forms intends for browser forms. They are not read from GitHub, so a build without this file ships forms that only open the visitor's email app.
2. In PowerShell, run `Remove-Item Env:SITE_URL, Env:BASE_PATH -ErrorAction SilentlyContinue`, then `npm run build` and `npm run qa`.
3. Check that the canonical link in `dist/index.html` shows `www.winapps.co.in` and `dist/contact/index.html` contains `data-mode="web3forms"`. A build made for the preview has the wrong URLs, so never upload one.
4. Download a backup of `public_html`.
5. Over FTPS, upload the contents of `dist/`, not the folder itself, into `public_html`: `_astro` first, then the rest. Delete nothing: leave `.htaccess`, `.well-known`, `cgi-bin` and any mail folders in place.
6. Send a test enquiry from the contact form and the footer form, and check it reaches sales@winapps.co.in. Send a test application with a resume from a page under `/careers/`, and check it reaches hr@winapps.co.in with the file attached.

### Contact forms

Both lead forms post from the visitor's browser to Web3Forms, so the server does no form processing. Enquiries go to the address the access key was created with. hCaptcha uses Web3Forms' shared free-plan site key (`src/scripts/lead-form.ts`) and must be enabled in the Web3Forms dashboard for the form.

### Job application form

The form on each `/careers/<id>/` page takes a resume (PDF, DOC or DOCX, up to 5 MB). File attachments need a paid Web3Forms Pro plan, and the file only reaches HR if the key was created with hr@winapps.co.in, so this form uses its own key, `PUBLIC_WEB3FORMS_HR_KEY`. Enable hCaptcha for it in the dashboard as well. Without the key, the form opens the applicant's email app addressed to HR and asks them to attach the resume there. To change the roles, edit `src/content/careers.yaml`.

## Build settings

All are read at build time. In GitHub, set them as repository **variables** (Settings → Secrets and variables → Actions → Variables); every one is optional.

| Repository variable | Build env | Default | What it does |
| --- | --- | --- | --- |
| `SITE_URL` | `SITE_URL` | CI: `https://manthank1.github.io` · local: `https://www.winapps.co.in` | Origin for canonicals, sitemap, Open Graph, JSON-LD, llms.txt and the .md pages |
| `BASE_PATH` | `BASE_PATH` | CI: `/winapps.ai/` · local: `/` | Sub-path the site is served from. `/` on the custom domain |
| `WEB3FORMS_KEY` | `PUBLIC_WEB3FORMS_KEY` | _(empty)_ | Web3Forms access key for the contact and footer forms (created with sales@winapps.co.in). Without it the forms open the visitor's email app. Local builds read it from `.env` |
| `WEB3FORMS_HR_KEY` | `PUBLIC_WEB3FORMS_HR_KEY` | _(empty)_ | Web3Forms Pro access key for the job application form (created with hr@winapps.co.in). Without it the form opens the applicant's email app. Local builds read it from `.env` |
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
