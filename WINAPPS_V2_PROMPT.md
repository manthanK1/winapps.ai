<!-- Recovered 2026-10-30 from the original build session's first message (it was pasted, never saved as a file). Text unchanged. -->


# Task: Build WinApps website V2
New UI and 3D ribbon from the design export, all content and features from V1, fully SEO and AI-crawler ready.

## Inputs
1. **New design (the UI and motion we want)**: unzipped at `<./design-export>`.
   - It's a Claude Design export: `project/Main.dc.html`, `project/canvas.json`, plus assets such as the animated logo GIF.
   - `Main.dc.html` uses a proprietary component format: markup inside `<x-dc>`, `{{holes}}` bound from `renderVals()`, `<sc-if>`/`<sc-for>`, and a `class Component extends DCLogic` script. **Do not ship this runtime.** Treat the file as the exact visual and behavioural spec, and port it to normal code.
   - Images referenced as `/_blob/<id>` are the uploaded assets. Map each one to the matching file in the export, e.g. the header logo is `winapps-logo.gif`. If any are missing, list them and stop to ask me.
2. **Old website V1 (menus, content and features we keep)**: https://manthank1.github.io/winapps-website/
   - Built with Astro, hosted on GitHub Pages. If the source is available at `<path or github.com/manthank1/winapps-website>`, read it directly; otherwise crawl the live pages.
3. **Production domain**: `<https://www.winapps.co.in>` — confirm with me before using it in canonicals, sitemaps and structured data.
## Goal
A production site that:
- **looks and moves exactly like the new design**
- carries **every menu, page, section, piece of copy, feature and contact detail from V1**
- is **fully crawlable by search engines and AI assistants** (Google, Bing, ChatGPT, Claude, Perplexity, Gemini, Copilot), so they can understand, cite and recommend WinApps
New design = look and motion. V1 = content. Static HTML + structured data = discoverability.

---

## Step 1 — Inspect, then plan (wait for my OK)
- Read every file in the export. Summarise:
  - the layout, colours and fonts
  - every component
  - exactly how the WebGL ribbon works: `initGL()`, `frame()`, the shader, control points, the fold maths, the scroll mapping
- Crawl V1 and make an inventory table: route → sections → interactive features (all menus and submenus, mobile drawer, footer, forms, widgets) → existing title/description/meta.
- Propose the file structure, a section-by-section mapping, and a single content data source (e.g. `src/content/` collections + `src/data/site.ts`) that feeds the pages, the JSON-LD and `llms.txt`.
- **Stop and wait for my approval before building.**
## Step 2 — Stack
- **Astro, static output (SSG)** — same as V1, same GitHub Pages deploy. Plain CSS with custom properties, vanilla TypeScript. No UI framework unless a V1 feature truly needs one.
- Port the ribbon to `src/scripts/ribbon.ts` as **raw WebGL (no Three.js)**. Copy the shader, colours and all motion maths from `Main.dc.html` exactly. Replace the `DCLogic`/`renderVals`/`ref` plumbing with a plain class:
  - `<canvas>` fixed to the viewport, behind all content, `pointer-events: none`, `aria-hidden="true"`
  - load it after first paint (deferred / `requestIdleCallback`); it must never delay the hero text
  - `requestAnimationFrame` loop; scroll from `window.scrollY` and the document height
  - pause when the tab is hidden; respect `prefers-reduced-motion` (show the finished W, no idle motion)
  - handle resize and devicePixelRatio (cap at 2); fewer segments on mobile
  - fail silently if WebGL is unavailable (the page must still look complete)
- Put the tweakable values in one exported config object: `speed`, `breeze`, `gloss`, `showWordmark`, the W width, and the fold radius.
## Step 3 — The ribbon (must match the design exactly)
- **Colours** (taken from the logo; no blending between the two faces, the switch is a sharp edge):
  - outer face teal `#278990`
  - shadow `#065C6B`
  - sheen `#62ADB4`
  - inner face orange `#ED9D39` → yellow `#F5C120`
- **Intro**:
  - a teal ribbon flows in from the left and forms the W as a **paper-fold accordion**, not a twist
  - first bottom point: folds INTO the screen, yellow side rises
  - middle top: folds back OUT, teal goes down
  - second bottom point: folds INTO the screen again, yellow rises to the top-right tip
- **W shape**:
  - the width stays horizontal and **constant from the start of the W to its end**
  - the W is upright, with no tilt or rotation
  - it has a very light curtain breeze: soft waves along the fabric plus a gentle bob
  - the WINAPPS wordmark fades in under the W once it has formed
- **On scroll**:
  - after the W the ribbon flicks up-right, then falls down the page in wide, slow sweeps, like a curtain in a summer breeze
  - the tip follows just below the middle of the screen, and the ribbon winds back in when you scroll up
  - it rolls slowly as a helix, so the teal and orange sides take turns with a clean edge
  - scroll speed only adds a soft breeze that fades out; nothing jerky
- **Mouse**: slight camera parallax plus a small gust.
## Step 4 — Design rules (keep the new UI)
- **Sharp, Bain.com style**: `border-radius: 0` on everything (buttons, inputs, cards, chips, menus, images). Thin 1px rules, square buttons with arrow icons.
- **Fonts**: Inter Tight (headings, 600, tight tracking) and Inter (body). Self-host them with `font-display: swap` and preload the heading font.
- **UI colours**:
  - ink `#0F1416`
  - primary button `#134F53`
  - accent orange `#ED9D39`
  - white background
- **Header**, left to right:
  - animated logo GIF (use a still-image fallback under `prefers-reduced-motion`)
  - nav links
  - **WhatsApp** button: square outline, crisp green WhatsApp icon + label; icon only under 640px
  - **Book a call** button: solid `#134F53`, with arrow
  - search icon
  - black square **MENU** button opening the full-screen dark-teal `#0E2E31` overlay
  - nav links collapse into MENU below 900px
- **Mobile header (≤ 640px)** — one tidy row, nothing else:
  - logo (smaller, ~66px tall) on the left
  - on the right, in this order: **WhatsApp** (icon only), **Book a call** (text only, compact), **MENU**
  - search and nav links are hidden; their links live inside the MENU overlay
  - ≤ 400px: MENU shows the icon only (keep `aria-label="Menu"`) and the logo shrinks to ~58px
  - every button stays at least 44×44px; the row never wraps or scrolls sideways at 360px
- **Mobile layout in general**: test at 360, 390, 414, 768 and 1024px. Hero headline, CTAs, cards, forms, the MENU overlay and the footer must all fit and read well; the ribbon uses its narrow (centred W) layout.
- **Hero**:
  - eyebrow with orange rule
  - large headline bottom-left
  - square primary CTA + underlined secondary link
  - "SCROLL" indicator bottom-right
- **Sections**: transparent so the ribbon shows through. Cards are near-white panels with a 2px black top rule, numbered 01, 02, 03… as in the design.
## Step 5 — Bring over from V1 (word for word, restyled)
Use V1's real copy. **Never invent text, stats, clients, reviews or prices.**
- **Header menu with all submenus**:
  - What we do → Industries (8 + All industries)
  - Work
  - How we work
  - Insights
  - About
  - Training → 4 groups + All training
- **MENU overlay** = V1's expanded drawer:
  - Services (6)
  - Training (5 groups + All courses)
  - Site links (Industries, Work, How we work, Blog, News, About, Contact)
  - expandable groups on mobile, a Close control, Escape closes it, focus is trapped while open
  - the links must also exist as plain `<a href>` in the HTML (crawlable)
- **Home sections in V1's order**:
  1. Hero with V1's headline, subtext and buttons
  2. Trust strip (Est. 2013, NDA first, reply in 1 business day, your IP from day one)
  3. Six practices (case-study link, tech tags, Explore / Discuss a project)
  4. "What do you want to build?" intake form with square chips, handing off to /contact/
  5. Training (16 courses in 5 groups + the WhatsApp advice block)
  6. Selected work (4 case studies)
  7. How we work (3 steps)
  8. Why teams trust us + working-hours clocks, live via `Intl.DateTimeFormat` for New York, London, Berlin and India
  9. Engagement models (3 cards, "Most chosen" badge)
  10. Technology
  11. Insights (guides + news)
  12. FAQ as an accessible accordion (`<details>`/`<summary>`; answers present in the HTML)
  13. Closing CTA "Tell us what you're building." with call / email / WhatsApp / phone
- **All other V1 routes**: contact, industries, work, how we work, training and course pages, blog, news, about, privacy, terms, disclaimer. Same header, footer and design system; a calmer ribbon on inner pages.
- **Footer**: all V1 columns (Services, Training, Explore, Company, Legal, Social), contact details, © 2013–2026 Winapps®.
- **Contact details, exactly**:
  - sales@winapps.co.in
  - +91 70157 96830
  - https://wa.me/917015796830
  - Winapps Software Solutions Pvt. Ltd.
- **"Book a call"** links wherever V1's booking link goes (or /contact/ if V1 has none).
## Step 6 — SEO + AI crawler readiness (required)

### 6.1 Content must exist without JavaScript
- Every page is pre-rendered static HTML. All text, links, menus, FAQ answers, courses and contact details must be in the HTML source. Most AI crawlers do not run JavaScript.
- The ribbon is decoration only; no content inside or behind it.
### 6.2 robots.txt (`public/robots.txt`)
- Allow all normal search engines and these AI crawlers explicitly:
  - Googlebot, Bingbot, Applebot, DuckDuckBot
  - OAI-SearchBot, ChatGPT-User, GPTBot (OpenAI)
  - Claude-SearchBot, Claude-User, ClaudeBot (Anthropic)
  - PerplexityBot, Perplexity-User
  - Google-Extended, Applebot-Extended, CCBot, meta-externalagent
- Check for any newer AI crawler names at build time and include them.
- Disallow only private or utility paths, if any.
- End with `Sitemap: https://<domain>/sitemap-index.xml`.
### 6.3 Sitemaps, canonicals, meta
- Use `@astrojs/sitemap` with an accurate `lastmod` on every URL.
- Every page gets:
  - a unique `<title>` (≤ 60 chars) and meta description (≤ 155 chars), taken from V1 where it exists
  - `<link rel="canonical">` on the production domain, never github.io
  - `<html lang="en-GB">`
  - Open Graph and Twitter tags with a 1200×630 image (`/brand/og.png` from V1)
- **Keep V1's URLs.** If any must change, add redirects.
- Exactly one `<h1>` per page and a logical H2/H3 order; descriptive link text.
- Images: meaningful `alt`, explicit width/height, WebP/AVIF, lazy below the fold.
### 6.4 Structured data (JSON-LD in `<head>`, generated from the content source)
- Every page:
  - `Organization` (+ `ProfessionalService`): name "Winapps Software Solutions Pvt. Ltd.", alternateName "WinApps", url, logo, foundingDate 2013, email, telephone +91-70157-96830, address from V1, areaServed (India, US, UK, Europe), `sameAs` → LinkedIn / Instagram / Facebook URLs from V1's footer
  - `WebSite`
  - `BreadcrumbList`
- Service pages: `Service` (provider = the Organization), one per practice.
- Training: `Course` + `CourseInstance` per course; an `ItemList` on the training index.
- FAQ sections: `FAQPage`, with text identical to what's visible on the page.
- Insights / blog / news: `Article` or `BlogPosting` with headline, datePublished, dateModified, author, image.
- Contact page: `ContactPage` + `ContactPoint` (sales, WhatsApp).
- Never add `Review`, `AggregateRating`, prices or claims that aren't on the page.
- Validate with Google's Rich Results Test and validator.schema.org, and fix all errors.
### 6.5 AI-friendly files (generated at build time from the same content source)
- `/llms.txt`: a short Markdown summary for AI assistants. It covers:
  - who WinApps is
  - services, with one line each and links
  - industries
  - training courses
  - engagement models
  - how to contact (email, phone, WhatsApp, booking link)
  - key facts (est. 2013, based in India, clients in India/US/UK/Europe)
- `/llms-full.txt`: the same, plus the full text of the main pages.
- A clean `.md` version of each key page (e.g. `/services/ai-ml.md`), linked from `llms.txt`.
### 6.6 Write so AI can quote it
- Start each service, industry and course page with a 2–3 sentence plain answer: what it is, who it's for, what's included, how to start. Use V1's wording where it exists; flag any gaps for me instead of inventing.
- Keep facts consistent everywhere (name, phone, email, address, founding year) — same wording on the site, in JSON-LD and in `llms.txt`.
- Show "Updated <date>" on insights; keep `dateModified` accurate.
- Add an About page section of plain facts: company name, founding year, location, team approach, IP/NDA/GDPR commitments (from V1).
### 6.7 Extras
- `public/.well-known/security.txt`, a branded `404` page, and a favicon/app-icon set from the logo.
- An IndexNow key file plus a post-deploy step that pings IndexNow (Bing, Yandex).
## Step 7 — Quality bar
- Responsive from 360px to 1920px; no horizontal scroll.
- Accessibility:
  - real `<a>`/`<button>` elements
  - visible focus
  - `aria-label` on icon buttons
  - text contrast ≥ 4.5:1, including over the ribbon (add a subtle white backing where needed)
- Performance: Core Web Vitals green on mobile — LCP < 2.5s, CLS < 0.1, INP < 200ms. Ribbon at 60fps on a mid-range laptop.
- Lighthouse mobile targets:
  - Performance ≥ 90
  - Accessibility 100
  - Best Practices 100
  - SEO 100
- Zero console errors. `npm run build` with no warnings.
## Step 8 — Verify and deliver
- Start the dev server and give me the URL. Walk the home page and confirm each V1 section is present.
- Show me:
  - `robots.txt`
  - `llms.txt`
  - the JSON-LD of the home page and one service page
  - the sitemap URL list
  - `curl -A "GPTBot" <page> | grep "<headline>"` output proving the content is in the HTML
- Set up the GitHub Pages deploy: Astro `site`/`base`, a GitHub Actions workflow, and a custom domain via a CNAME file.
- Give me a post-launch checklist for Google Search Console and Bing Webmaster Tools: verify the domain, submit the sitemap.
- End with: anything from V1 you couldn't port, every placeholder left, and every asset you were missing.
- Commit in small steps with clear messages.

make it like as https://github.com/manthanK1/winapps.ai
