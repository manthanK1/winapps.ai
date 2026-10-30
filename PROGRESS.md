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
| Pause when hidden; reduced motion shows the finished W | Partly done | In code; not checked in a browser. |
| Resize, DPR capped at 2, fewer segments on mobile | Done | 2400×14 on desktop, 1200×10 on mobile |
| Fails silently without WebGL | Partly done | In code; not checked in a browser. |
| One exported config (speed, breeze, gloss, showWordmark, W width, fold radius) | Done | `RIBBON_CONFIG` |

### Step 3: The ribbon
| Item | Status | Notes |
|---|---|---|
| Colours: teal, shadow, sheen, orange → yellow, hard face edge | Done | Shaders copied verbatim |
| Intro: flows in, paper-fold accordion W (in, out, in) | Partly done | Matches the design's maths exactly in Node. Not yet compared visually in a browser. |
| W: constant width, upright, curtain breeze and bob, wordmark fade-in | Partly done | Same as above. The wordmark position against the real hero is not checked. |
| On scroll: flick, wide slow sweeps, tip below mid-screen, winds back, helix roll, soft scroll breeze | Partly done | Same as above. |
| Mouse parallax and gust | Partly done | Same as above. |

### Step 4: Design rules
| Item | Status | Notes |
|---|---|---|
| `border-radius: 0` everywhere, 1px rules, square arrow buttons | Done | No non-zero radius anywhere in `src` |
| Inter Tight 600 and Inter, self-hosted, swap, heading font preloaded | Done | |
| UI colours (ink, primary, accent, white) | Done | `global.css` tokens |
| Header: logo GIF with still fallback, nav, WhatsApp, Book a call, search, MENU overlay; nav collapses below 900px | Done | Not yet checked in a browser |
| Mobile header ≤640 and ≤400 (sizes, order, 44px targets, no wrap at 360) | Partly done | In CSS; needs a browser check at 360 and 400. |
| Mobile layouts at 360/390/414/768/1024 | Partly done | Each agent checked its own pages; the whole site hasn't been checked together. |
| Hero: eyebrow, headline bottom-left, CTA and link, SCROLL indicator | Partly done | Built. Session 1 flagged that V1's taller hero text can run into the W on 16:9 screens; not fixed yet. |
| Transparent sections; numbered near-white cards with 2px top rule | Done | |

### Step 5: V1 content
| Item | Status | Notes |
|---|---|---|
| Header menus and all submenus | Done | The brief says Training has "4 groups"; V1 renders all 5 tracks, so V2 keeps 5. |
| MENU overlay (Services, Training, site links, expandable on mobile, Close, Escape, focus trap, plain links) | Done | Modal `<dialog>` |
| Home sections 1–13 in V1's order | Done | The agent checked all 13 against V1. The intro grid of 6 service tiles was dropped as a duplicate of Practices. |
| Other V1 routes (contact, industries, work, how we work, training and courses, blog, news, about, legal) | Done | All V1 URLs, the 16 course pages and 35 legacy redirects build. Internal links and #anchors all resolve (checked by `npm run qa`). |
| Calmer ribbon on inner pages | Partly done | `inner` variant exists; not checked in a browser. |
| Footer columns, contact details, © 2013–2026 | Done | |
| Contact details exactly as given | Done | |
| Book a call → V1 booking link or /contact/ | Done | V1 has no booking link, so it goes to `/contact/`. |

### Step 6: SEO and AI crawlers
| Item | Status | Notes |
|---|---|---|
| 6.1 All content in static HTML | Partly done | By design; the site-wide check (QA script, GPTBot curl) is still to run. |
| 6.2 robots.txt (named crawlers, newer ones, sitemap line) | Done | 26 named agents, nothing disallowed. |
| 6.3 Sitemap with accurate lastmod | Done | 49 URLs, exactly the indexable pages (checked by `npm run qa`). lastmod comes from each page's last commit, or post dates for blog and news. |
| 6.3 Title ≤60, description ≤155, canonical, `en-GB`, OG and Twitter | Done | Checked on every page by `npm run qa` |
| 6.3 Keep V1 URLs, add redirects | Done | `legacy-redirects.ts`. The new course pages are added URLs. |
| 6.3 One h1, logical headings, descriptive links; images (alt, size, AVIF/WebP, lazy) | Done | Checked on every page by `npm run qa`. Photos are AVIF/WebP `<picture>` with JPG fallback; 311 lazy, 6 eager above the fold. |
| 6.4 JSON-LD: Organization/ProfessionalService, WebSite, BreadcrumbList | Done | V1 has no address, so the address is left out (gap). |
| 6.4 Service, Course/CourseInstance, ItemList, FAQPage, Article/BlogPosting, ContactPage | Done | |
| 6.4 Validate (Rich Results Test, validator.schema.org) | Not started | |
| 6.5 llms.txt, llms-full.txt, .md twins | Done | 46 .md files. All 202 site URLs in llms.txt and llms-full.txt resolve (checked by `npm run qa`). |
| 6.6 Plain answers up front; consistent facts; "Updated" dates; About facts section | Done | Gaps are listed below. |
| 6.7 security.txt, branded 404, favicon set, IndexNow key and ping | Done | |

### Step 7: Quality bar
| Item | Status | Notes |
|---|---|---|
| Responsive 360–1920, no horizontal scroll | Partly done | Each agent checked its own pages; the whole site hasn't been checked together. |
| Accessibility: real elements, focus, aria-labels, 44px targets, contrast ≥4.5 over the ribbon | Partly done | axe passed per agent before the real ribbon existed; contrast over the ribbon isn't checked. |
| Core Web Vitals; ribbon at 60fps | Not started | |
| Lighthouse mobile ≥90/100/100/100 | Not started | |
| Zero console errors; `npm run build` with no warnings | Partly done | Build has 0 warnings and `astro check` reports 0/0/0 (2026-10-30). Console errors not yet checked site-wide. |

### Step 8: Verify and deliver
| Item | Status | Notes |
|---|---|---|
| Dev server URL; walk the home page | Not started | |
| Show robots.txt, llms.txt, JSON-LD (home and one service), sitemap list, GPTBot curl | Not started | |
| GitHub Pages: site/base, Actions workflow, CNAME | Done | `deploy.yml` (now runs `npm run qa` before deploying), `public/CNAME`, `DEPLOY.md`. No git remote is set. |
| Search Console and Bing checklist | Done | In `DEPLOY.md`; it will be repeated in the final summary. |
| Final list: what wasn't ported, placeholders, missing assets | Not started | |
| Commit in small steps | Partly done | Session 2: the workflow output went into 7 commits by area; one commit per completion step from here. |

## Completion plan (this session)

1. ✅ Commit the workflow's uncommitted output in small commits, grouped by area.
2. ✅ Integrate: add `scripts/qa-html.mjs` (headings, images, ids, JSON-LD, meta limits, canonicals, internal links, V1 URLs, sitemap), run it, and fix every failure.
3. Browser QA of every page at 360–1920: overflow, header row, console errors, axe, tap targets.
4. Ribbon in a real browser: compare with the design references, fix the hero/W overlap, and check the inner variant, reduced motion and no-WebGL.
5. Validate the structured data.
6. Run Lighthouse on mobile and fix until the targets are met.
7. Step 8: build, serve, show the outputs, and summarise.

## Known gaps (V1 has no source text, so nothing was invented)

- No postal address: V1 never published one. It is left out of the JSON-LD, the About facts and llms.txt.
- Case-study results are `null` in V1, so V1's fallback text is shown.
- Working hours of 11:00–20:00 IST are a TODO inherited from V1.
- Client logos and testimonials: V1's collections are empty and hidden, and they stay that way.
- No course fees, dates or durations in V1, so none appear here.
- Legal pages carry V1's own TODOs (legal review, jurisdiction).

## Log

- 2026-10-30 step 2: added `scripts/qa-html.mjs` (`npm run qa`; also runs in CI) and tested it against a copy of dist with seeded faults. On the real build it reports 50 pages, 35 redirects, 6,027 internal references and 49 sitemap URLs, and every check passes. No fixes were needed. Corrected a stale comment in `legacy-redirects.ts`.
- 2026-10-30 step 1: committed the workflow output in 7 commits.
- 2026-10-30: recovered the brief, audited the repo and the session-1 agent reports, and wrote this file. `astro check` 0/0/0; `astro build` clean, 0 warnings.
