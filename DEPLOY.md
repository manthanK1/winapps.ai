# Deploying www.winapps.co.in

The site is static: `npm run build` writes plain HTML, CSS, a few small scripts and the SEO files to `dist/`. Production runs on **GitHub Pages** with the custom domain **www.winapps.co.in**, deployed by `.github/workflows/deploy.yml`.

## Build settings

All are read at build time. In GitHub, set them as repository **variables** (Settings → Secrets and variables → Actions → Variables); every one is optional.

| Repository variable | Build env | Default | What it does |
| --- | --- | --- | --- |
| `SITE_URL` | `SITE_URL` | `https://www.winapps.co.in` | Origin for canonicals, sitemap, Open Graph, JSON-LD, llms.txt and the .md pages |
| `BASE_PATH` | `BASE_PATH` | `/` | Sub-path the site is served from. Keep `/` on the custom domain |
| `WEB3FORMS_KEY` | `PUBLIC_WEB3FORMS_KEY` | _(empty)_ | Web3Forms access key for the contact form (get one at web3forms.com with sales@winapps.co.in). Without it the form opens the visitor's email app |
| `PLAUSIBLE_DOMAIN` | `PUBLIC_PLAUSIBLE_DOMAIN` | _(empty)_ | Turns on cookieless Plausible analytics, e.g. `www.winapps.co.in` |

## GitHub Pages setup (once)

1. Repository **Settings → Pages → Build and deployment → Source: GitHub Actions**.
2. Push to `main` (or run the workflow by hand). The workflow checks out full history (the sitemap's `<lastmod>` comes from git), builds with Node 24, publishes `dist/`, then pings IndexNow.
3. **Custom domain**: Settings → Pages → Custom domain → `www.winapps.co.in` → Save. With an Actions workflow GitHub reads the domain from this setting; `public/CNAME` (`www.winapps.co.in`) is kept in the build for reference and for other hosts.
4. Verify the domain first (Settings of your account or organisation → Pages → Add a verified domain) to prevent takeovers.
5. **DNS** at the registrar:

   | Type | Name | Value |
   | --- | --- | --- |
   | CNAME | `www` | `<user-or-org>.github.io` (no repository name) |
   | A | `@` | `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153` |
   | AAAA | `@` | `2606:50c0:8000::153`, `2606:50c0:8001::153`, `2606:50c0:8002::153`, `2606:50c0:8003::153` |

   With both in place GitHub redirects `winapps.co.in` to `www.winapps.co.in`. No wildcard records. (IPs: [GitHub docs](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site).)
6. Tick **Enforce HTTPS** once it becomes available (can take up to 24 hours after DNS resolves).

Old winapps.co.in URLs keep working: every path in `src/lib/legacy-redirects.ts` gets a small redirect page, and blog/news posts keep their slugs.

## IndexNow (Bing, Yandex and others)

- The key is `public/<32 hex chars>.txt` (served at `https://www.winapps.co.in/<key>.txt`). Keep the file; changing the key means re-confirming it in Bing Webmaster Tools.
- After each deploy from `main`, the `indexnow` job waits a minute, reads the **live** sitemap and POSTs every URL to `https://api.indexnow.org/indexnow`. It never fails a deploy.
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
