# WinApps V2: build progress

Tracks every step and sub-item of [WINAPPS_V2_PROMPT.md](WINAPPS_V2_PROMPT.md) as **Done**, **Partly done** or **Not started**. Updated after each completion step and committed with it.

## Where things are

- **Brief:** `WINAPPS_V2_PROMPT.md`. It was never saved as a file: the brief was pasted into the first build session, so it was recovered from that session's transcript and saved here unchanged.
- **Design export:** `design-export/Main.dc.html` in this repo. It was copied from `D:\Downloads\winappsV3\Main.dc.html`, which is still on disk. The export has no `project/` folder and no `canvas.json`. Its only uploaded asset is the logo GIF (`assets/a07cd29bac08d0c3a61b0dfb38badf92.gif`), so no assets are missing.
- **V1 source:** github.com/manthanK1/winapps-website, cloned into the first session's scratchpad. `github.com/manthanK1/winapps.ai` doesn't exist publicly, so this project was created as `winapps.ai`, as the note at the end of the brief asked.
- **Toolchain:** Astro 7 needs Node 22 or later. This machine has Node 20 and `NODE_ENV=production` set globally, so builds use a portable Node 24 with `NODE_ENV` cleared. CI uses Node 24.

## How the first session stopped (2026-10-29)

1. Foundation committed (`1169a2f`, `2c57d32`): config, design tokens, fonts, V1 content collections, `site.ts` and `copy.ts`, header, footer, layout, brand icons.
2. A 6-agent build workflow ran: ribbon, SEO and AI layer, home and shared sections, two inner-page agents, then integration.
   - Four agents finished and reported.
   - The fifth (about, how we work, contact, blog, news, legal, 404) wrote all of its pages, then was cut off during its final QA. It left `.tmp-inner2/` behind.
   - **The integration agent never ran.**
   - **None of the workflow's output was committed.**
3. Never started: the planned verification pass (content fidelity, SEO, accessibility, ribbon in a real browser, Lighthouse), the hero/ribbon layout fix, and Step 8.

## Status by step

### Step 1: Inspect, then plan
| Item | Status | Notes |
|---|---|---|
| Read every file in the export; summarise layout, colours, fonts, components, ribbon maths | Done | Done in session 1. The summary was never saved as a document; its findings are in `global.css` and `ribbon.ts`. |
| Crawl V1; inventory table (route → sections → features → meta) | Partly done | V1 was read from source and ported. The table was never written; Step 8 produces a route inventory from the build instead. |
| Propose file structure, section mapping, single content source | Done | `src/data/site.ts` (facts, navigation), `src/data/copy.ts` (V1 page copy, verbatim), `src/content/*` (V1 collections). They feed the pages, JSON-LD, llms.txt and the .md twins. |
| Map `/_blob/` assets; list missing ones | Done | The only asset is the logo GIF → `public/brand/winapps-logo.gif`. Nothing is missing. |
| Stop for approval | Done | Skipped: you told session 1 to go ahead and build. |

### Step 2: Stack
| Item | Status | Notes |
|---|---|---|
| Astro SSG, plain CSS custom properties, vanilla TS, no UI framework | Done | Astro 7.4.4 with static output. |
| Ribbon in `src/scripts/ribbon.ts`, raw WebGL, no Three.js | Done | Port checked against the design's `frame()` in Node, using a mock GL. |
| Fixed canvas behind content, `pointer-events:none`, `aria-hidden` | Done | |
| Loads after first paint (`requestIdleCallback`) | Done | `BaseLayout.astro` |
| rAF loop; scroll from `scrollY` and document height | Done | |
| Pause when hidden; reduced motion shows the finished W | Done | Fixed: under reduced motion the design drew the whole ribbon, sending its descent through the hero and over the wordmark. It now rests exactly where the animation would (the finished W), then follows the scroll with no easing, idle motion, gust or parallax. **Deliberate deviation from the design** to meet the brief. |
| Resize, DPR capped at 2, fewer segments on mobile | Done | 2400×14 on desktop, 1200×10 on mobile. Added `maxPixels` (5.3M): DPR is also lowered on very large high-DPI screens, which removed 100–190 ms stalls at 1920×1080 at 2×. |
| Fails silently without WebGL | Done | Checked in Chrome with WebGL disabled: the canvas is removed, the wordmark stays hidden, no console output. |
| One exported config (speed, breeze, gloss, showWordmark, W width, fold radius) | Done | `RIBBON_CONFIG` |

### Step 3: The ribbon
| Item | Status | Notes |
|---|---|---|
| Colours: teal, shadow, sheen, orange → yellow, hard face edge | Done | Shaders copied verbatim |
| Intro: flows in, paper-fold accordion W (in, out, in) | Done | Browser captures at t = 1.5 / 3.5 / 7.5 s match the design's own renders at 1440 and 390. |
| W: constant width, upright, curtain breeze and bob, wordmark fade-in | Done | W and wordmark land where the design puts them. The hero was re-laid out around them (Step 4). |
| On scroll: flick, wide slow sweeps, tip below mid-screen, winds back, helix roll, soft scroll breeze | Done | Scroll captures match the design's scroll-1200 reference. |
| Mouse parallax and gust | Done | Design formula; pointer normalised to the viewport. |

### Step 4: Design rules
| Item | Status | Notes |
|---|---|---|
| `border-radius: 0` everywhere, 1px rules, square arrow buttons | Done | No non-zero radius anywhere in `src` |
| Inter Tight 600 and Inter, self-hosted, swap, heading font preloaded | Done | |
| UI colours (ink, primary, accent, white) | Done | `global.css` tokens |
| Header: logo GIF with still fallback, nav, WhatsApp, Book a call, search, MENU overlay; nav collapses below 900px | Done | Checked in a browser at 7 widths (360–1920). Later, all labels were made to show only from 1140 px (was 1100) to leave slack; a re-check is deferred, after launch. |
| Mobile header ≤640 and ≤400 (sizes, order, 44px targets, no wrap at 360) | Done | Checked in a browser at 360, 390 and 414: one row; logo 58 px at ≤400 and 66 px at ≤640; WhatsApp → Book a call → MENU; every control ≥44×44. |
| Mobile layouts at 360/390/414/768/1024 | Done | Full browser run over 50 pages × 7 widths: the only overflow was long breadcrumb titles on 3 post pages, now fixed and re-checked. A re-run after the final hero, header and veil changes is deferred, after launch. |
| Hero: eyebrow, headline bottom-left, CTA and link, SCROLL indicator | Done | Fixed: V1's copy (three-line headline, lead, WhatsApp line) climbed into the W. In landscape the headline is now sized by height as well as width, and the lead moved under the WINAPPS wordmark. Checked at 1024×768 to 2560×1440: no overlap with the ribbon. |
| Transparent sections; numbered near-white cards with 2px top rule | Done | |

### Step 5: V1 content
| Item | Status | Notes |
|---|---|---|
| Header menus and all submenus | Done | The brief says Training has "4 groups"; V1 renders all 5 tracks, so V2 keeps 5. |
| MENU overlay (Services, Training, site links, expandable on mobile, Close, Escape, focus trap, plain links) | Done | Modal `<dialog>` |
| Home sections 1–13 in V1's order | Done | The agent checked all 13 against V1. The intro grid of 6 service tiles was dropped as a duplicate of Practices. |
| Other V1 routes (contact, industries, work, how we work, training and courses, blog, news, about, legal) | Done | All V1 URLs, the 16 course pages and 35 legacy redirects build. Internal links and #anchors all resolve (checked by `npm run qa`). |
| Calmer ribbon on inner pages | Done | Checked in a browser: the W sits above the viewport, and a slower, narrower descent appears on scroll. |
| Footer columns, contact details, © 2013–2026 | Done | |
| Contact details exactly as given | Done | |
| Book a call → V1 booking link or /contact/ | Done | V1 has no booking link, so it goes to `/contact/`. |

### Step 6: SEO and AI crawlers
| Item | Status | Notes |
|---|---|---|
| 6.1 All content in static HTML | Partly done | `npm run qa` confirms headings, links and every FAQ answer are in the built HTML. GPTBot `curl` proof: Deferred, after launch. |
| 6.2 robots.txt (named crawlers, newer ones, sitemap line) | Done | 26 named agents, nothing disallowed. |
| 6.3 Sitemap with accurate lastmod | Done | 49 URLs, exactly the indexable pages (checked by `npm run qa`). lastmod comes from each page's last commit, or post dates for blog and news. |
| 6.3 Title ≤60, description ≤155, canonical, `en-GB`, OG and Twitter | Done | Checked on every page by `npm run qa`. On the github.io preview the canonicals point to github.io (your choice for now); they move to www.winapps.co.in when `SITE_URL` is set. |
| 6.3 Keep V1 URLs, add redirects | Done | `legacy-redirects.ts`. The new course pages are added URLs. |
| 6.3 One h1, logical headings, descriptive links; images (alt, size, AVIF/WebP, lazy) | Done | Checked on every page by `npm run qa`. Photos are AVIF/WebP `<picture>` with JPG fallback; 311 lazy, 6 eager above the fold. |
| 6.4 JSON-LD: Organization/ProfessionalService, WebSite, BreadcrumbList | Done | V1 has no address, so the address is left out (gap). |
| 6.4 Service, Course/CourseInstance, ItemList, FAQPage, Article/BlogPosting, ContactPage | Done | |
| 6.4 Validate (Rich Results Test, validator.schema.org) | Done | validator.schema.org: 0 errors and 0 warnings on all 17 page types. The Rich Results Test has no API, so its requirements were checked by hand: Breadcrumb, Article and Course list are eligible. The Course *info* result needs price and mode, which V1 doesn't publish (gap). Fixed `Course.educationalLevel`, which held the track name; it is now `about`. `npm run qa` now also checks that FAQPage text matches the visible FAQ. |
| 6.5 llms.txt, llms-full.txt, .md twins | Done | 46 .md files. All 202 site URLs in llms.txt and llms-full.txt resolve (checked by `npm run qa`). |
| 6.6 Plain answers up front; consistent facts; "Updated" dates; About facts section | Done | News posts now show "Updated Mar 2026" with a `<time>` element (V1 had the date only in the eyebrow), and so do their .md twins. Gaps are listed below. |
| 6.7 security.txt, branded 404, favicon set, IndexNow key and ping | Done | |

### Step 7: Quality bar
| Item | Status | Notes |
|---|---|---|
| Responsive 360–1920, no horizontal scroll | Done | 50 pages × 7 widths: no overflow after the breadcrumb fix. Re-run on the final build: Deferred, after launch. |
| Accessibility: real elements, focus, aria-labels, 44px targets, contrast ≥4.5 over the ribbon | Done | axe found 0 violations on all 50 pages at 390 and 1440, with the ribbon running (the full run before the final hero, header and veil changes; a re-run is deferred, after launch). Contrast over the ribbon was measured from pixels down 16 page types at 390 and 1440 (~7,000 line checks), and all lines pass. Fixes: veil on the hero text, white fill on outline buttons, feathered veil edges. Tap targets: buttons ≥44×44, and links are 44 px tall on touch widths (breadcrumbs raised from 32). |
| Core Web Vitals; ribbon at 60fps | Partly done | Ribbon on Intel Iris Xe: p95 3.6–10 ms per frame at 1440×900 (1× and 2×), 1536×864 (1.25×) and 1920×1080 (1× and 2×), so 60 fps with room to spare. Core Web Vitals: Deferred, after launch. |
| Lighthouse mobile ≥90/100/100/100 | Deferred, after launch | |
| Zero console errors; `npm run build` with no warnings | Done | On Node 24 (2026-10-30): `npm run check` 0/0/0, `npm run build` 0 warnings, `npm run qa` all pass. The full browser run saw no console errors or failed requests on any page at any width. |

### Step 8: Verify and deliver
| Item | Status | Notes |
|---|---|---|
| Dev server URL; walk the home page | Deferred, after launch | |
| Show robots.txt, llms.txt, JSON-LD (home and one service), sitemap list, GPTBot curl | Deferred, after launch | |
| GitHub Pages: site/base, Actions workflow, CNAME | Done | `deploy.yml` (now runs `npm run qa` before deploying), `public/CNAME`, `DEPLOY.md`. Remote `origin` is github.com/manthanK1/winapps.ai, and `main` was pushed on 2026-10-30. On GitHub's runner the first run passed `npm ci`, build and `npm run qa`; deploy waits for Pages to be switched to "GitHub Actions". For now CI builds for the **github.io preview** (`https://manthank1.github.io/winapps.ai/`); moving to www.winapps.co.in takes two repository variables plus DNS (`DEPLOY.md`). |
| Search Console and Bing checklist | Done | In `DEPLOY.md`; it will be repeated in the final summary. |
| Final list: what wasn't ported, placeholders, missing assets | Partly done | The known gaps are listed below. The full report comes with the deferred Step 8 proofs. |
| Commit in small steps | Done | Session 2 made small commits by area and by step. `dist/` is never committed. |

## Completion plan (this session)

1. ✅ Commit the workflow's uncommitted output in small commits, grouped by area.
2. ✅ Integrate: add `scripts/qa-html.mjs` (headings, images, ids, JSON-LD, meta limits, canonicals, internal links, V1 URLs, sitemap), run it, and fix every failure.
3. ✅ Browser QA of every page at 360–1920 (overflow, header row, console errors, axe, tap targets), with fixes. A re-run on the final build is deferred, after launch.
4. ✅ Ribbon in a real browser: compared with the design references; fixed the hero/W overlap and reduced motion; checked the inner variant and no-WebGL; measured frame times.
5. ✅ Structured data validated (validator.schema.org) and the Course markup fixed.
6. ⏸ Lighthouse on mobile: Deferred, after launch.
7. ⏸ Step 8 proofs (dev server walk-through, robots/llms/JSON-LD/sitemap outputs, GPTBot curl): Deferred, after launch.
8. ✅ Shipped: checks re-run on Node 24, committed, pushed to GitHub for the Pages deploy.

## Known gaps (V1 has no source text, so nothing was invented)

- No postal address: V1 never published one. It is left out of the JSON-LD, the About facts and llms.txt.
- Case-study results are `null` in V1, so V1's fallback text is shown.
- Working hours of 11:00–20:00 IST are a TODO inherited from V1.
- Client logos and testimonials: V1's collections are empty and hidden, and they stay that way.
- No course fees, dates or durations in V1, so none appear here.
- Legal pages carry V1's own TODOs (legal review, jurisdiction).

## Log

- 2026-10-30 preview: you chose to view the site on github.io for now, with no DNS change. CI now defaults to `SITE_URL=https://manthank1.github.io` and `BASE_PATH=/winapps.ai/`, and IndexNow is skipped until the real domain is set. `npm run qa` checks links against the base path and applies its "no github.io" rule only to real-domain builds. Both builds (preview and production) pass `npm run qa` locally. `DEPLOY.md` describes the preview and the later switch.
- 2026-10-30 ship: plan changed to launch now. Stopped the in-flight browser QA run (it changes no files). On Node 24: `npm run check` 0/0/0, `npm run build` 0 warnings (50 pages), `npm run qa` all pass. Committed steps 3–5 and pushed `main` to github.com/manthanK1/winapps.ai, which triggers the Pages workflow. Shipped in this step:
  - header labels shed only at 900–1139 px; breadcrumbs 44 px tall and no overflow on long titles
  - home hero re-laid out around the W (headline sized by height and width, lead under the wordmark), with veils on its text
  - ribbon: reduced motion shows the finished W; `maxPixels` budget against GPU stalls
  - feathered veil edges, a veil that hugs short labels, white-filled outline buttons
  - Course JSON-LD uses `about` for the track; news posts show "Updated <month>" in the page and its .md twin
  - `npm run qa` checks that FAQPage text matches the visible FAQ
- 2026-10-30 steps 3–5: full browser QA (50 pages × 7 widths, axe at 390 and 1440), pixel contrast over the ribbon (16 page types), ribbon captures against the design references, no-WebGL and reduced-motion checks, GPU frame times, and validator.schema.org (17 page types, 0 errors). The fixes are the ones listed under "ship".
- 2026-10-30 step 2: added `scripts/qa-html.mjs` (`npm run qa`; also runs in CI) and tested it against a copy of dist with seeded faults. On the real build it reports 50 pages, 35 redirects, 6,027 internal references and 49 sitemap URLs, and every check passes. No fixes were needed. Corrected a stale comment in `legacy-redirects.ts`.
- 2026-10-30 step 1: committed the workflow output in 7 commits.
- 2026-10-30: recovered the brief, audited the repo and the session-1 agent reports, and wrote this file. `astro check` 0/0/0; `astro build` clean, 0 warnings.
