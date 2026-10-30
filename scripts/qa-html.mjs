#!/usr/bin/env node
// Static checks over the built site (run after `npm run build`):
//
//   node scripts/qa-html.mjs [distDir]
//
// Every HTML page: one <h1>, no skipped heading levels, <img> with alt/width/
// height, unique ids, JSON-LD that parses, title ≤ 60 and description ≤ 155,
// lang="en-GB", canonical on the production origin, descriptive link text.
// Across the site: every internal link and #fragment resolves, every V1 URL
// still exists, the sitemap lists exactly the indexable pages, and nothing
// points at github.io. Exits 1 on any failure. No dependencies: the HTML is
// Astro's own output, so targeted regexes are enough.
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";

const dist = process.argv[2] ?? "dist";
const origin = (process.env.SITE_URL ?? "https://www.winapps.co.in").replace(/\/+$/, "");
const base = (process.env.BASE_PATH ?? "/").replace(/\/+$/, "");
const failures = [];
const fail = (where, msg) => failures.push(`${where}: ${msg}`);

/** @param {string} dir @returns {string[]} */
const walk = (dir) =>
  readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });

const files = walk(dist);
const urlOf = (file) => "/" + relative(dist, file).split(sep).join("/").replace(/(^|\/)index\.html$/, "$1");
const html = files.filter((f) => f.endsWith(".html"));
const strip = (s) => s.replace(/<[^>]+>/g, " ").replace(/&nbsp;|&#160;/g, " ").replace(/\s+/g, " ").trim();
const attr = (tag, name) => tag.match(new RegExp(`\\s${name}=(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`, "i"))?.slice(1).find((v) => v !== undefined);
const decode = (s) => s.replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">");

/** Ids per page, for #fragment checks. */
const idsByUrl = new Map();
/** [fromUrl, href] for every internal link or asset reference. */
const refs = [];
const pages = new Map();

for (const file of html) {
  const url = urlOf(file);
  const src = readFileSync(file, "utf8");
  const isRedirect = /<meta http-equiv="refresh"/i.test(src);
  pages.set(url, { src, isRedirect, noindex: /<meta name="robots" content="noindex/i.test(src) });

  const ids = [...src.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]);
  idsByUrl.set(url, new Set(ids));
  for (const [path, a] of [...src.matchAll(/<(?:a|link|img|source|script)\b[^>]*>/gi)].flatMap((m) =>
    ["href", "src", "srcset"].map((n) => [url, attr(m[0], n)])
  )) {
    if (!a) continue;
    for (const part of a.split(",").map((s) => s.trim().split(/\s+/)[0])) if (part.startsWith("/") && !part.startsWith("//")) refs.push([path, decode(part)]);
  }
  if (/github\.io/i.test(src)) fail(url, "mentions github.io");
  if (isRedirect) continue;

  // ---- Document basics ----------------------------------------------------
  if (!/<html lang="en-GB"/.test(src)) fail(url, 'missing <html lang="en-GB">');
  const title = decode(src.match(/<title>([^<]*)<\/title>/)?.[1] ?? "");
  if (!title) fail(url, "missing <title>");
  else if (title.length > 60) fail(url, `title is ${title.length} chars: "${title}"`);
  const desc = decode(src.match(/<meta name="description" content="([^"]*)"/)?.[1] ?? "");
  if (!desc) fail(url, "missing meta description");
  else if (desc.length > 155) fail(url, `description is ${desc.length} chars`);
  const canon = src.match(/<link rel="canonical" href="([^"]*)"/g) ?? [];
  if (canon.length !== 1) fail(url, `${canon.length} canonical links`);
  else if (!attr(canon[0], "href").startsWith(`${origin}/`)) fail(url, `canonical not on ${origin}`);
  for (const p of ["og:title", "og:description", "og:image", "og:url"]) if (!src.includes(`property="${p}"`)) fail(url, `missing ${p}`);

  // ---- Headings -----------------------------------------------------------
  const levels = [...src.matchAll(/<h([1-6])\b/g)].map((m) => Number(m[1]));
  const h1 = levels.filter((l) => l === 1).length;
  if (h1 !== 1) fail(url, `${h1} <h1> elements`);
  levels.reduce((prev, l) => {
    if (prev && l > prev + 1) fail(url, `heading jumps h${prev} → h${l}`);
    return l;
  }, 0);

  // ---- Ids, images, JSON-LD, links ---------------------------------------
  const seen = new Set();
  for (const id of ids) {
    if (seen.has(id)) fail(url, `duplicate id "${id}"`);
    seen.add(id);
  }
  for (const [img] of src.matchAll(/<img\b[^>]*>/gi)) {
    for (const n of ["alt", "width", "height"]) if (attr(img, n) === undefined) fail(url, `<img> without ${n}: ${img.slice(0, 90)}`);
  }
  const visible = decode(strip(src.replace(/<(script|style|head)\b[\s\S]*?<\/\1>/gi, " "))).replace(/[‘’]/g, "'").replace(/[“”]/g, '"');
  const same = (s) => visible.includes(s.replace(/\s+/g, " ").replace(/[‘’]/g, "'").replace(/[“”]/g, '"').trim());
  for (const [, json] of src.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    let data;
    try {
      data = JSON.parse(json);
    } catch (e) {
      fail(url, `JSON-LD does not parse: ${e.message}`);
      continue;
    }
    // FAQPage must repeat the visible questions and answers word for word.
    if (data["@type"] === "FAQPage") {
      for (const q of data.mainEntity ?? []) {
        if (!same(q.name)) fail(url, `FAQPage question not visible: "${q.name}"`);
        if (!same(q.acceptedAnswer?.text ?? "")) fail(url, `FAQPage answer not visible for "${q.name}"`);
      }
    }
  }
  for (const [a, open, inner] of src.matchAll(/(<a\b[^>]*>)([\s\S]*?)<\/a>/gi)) {
    const name = (attr(open, "aria-label") ?? strip(inner.replace(/<img\b[^>]*alt="([^"]*)"[^>]*>/gi, " $1 "))).toLowerCase();
    if (!name && !/aria-hidden="true"|tabindex="-1"/.test(open)) fail(url, `link with no accessible name: ${a.slice(0, 90)}`);
    if (/^(click here|here|learn more|read more|more)$/.test(name)) fail(url, `generic link text "${name}"`);
  }
}

// ---- Internal links and fragments -------------------------------------------
const exists = (path) => {
  const p = join(dist, path.slice(base.length));
  if (existsSync(p) && statSync(p).isFile()) return true;
  return existsSync(join(p, "index.html"));
};
const broken = new Set();
for (const [from, ref] of refs) {
  const [pathPart, frag] = ref.split("#");
  const path = pathPart.split("?")[0];
  if (!exists(path)) {
    broken.add(`${from} → ${ref}`);
    continue;
  }
  if (frag) {
    const target = path.endsWith("/") ? path.slice(base.length) : null;
    const ids = target !== null ? idsByUrl.get(target) : null;
    if (ids && !ids.has(decodeURIComponent(frag))) broken.add(`${from} → ${ref} (no #${frag})`);
  }
}
for (const b of broken) fail("link", b);

// ---- V1 URLs and the extra V2 routes ----------------------------------------
const slugs = (dir) => readdirSync(join("src/content", dir)).filter((f) => f.endsWith(".md") && !f.startsWith("_")).map((f) => f.replace(/\.md$/, ""));
const courseIds = [...readFileSync("src/content/training.yaml", "utf8").matchAll(/^[ \t]+- id:[ \t]*["']?([\w-]+)/gm)].map((m) => m[1]);
const required = [
  "/", "/services/", "/work/", "/how-we-work/", "/industries/", "/training/", "/blog/", "/news/", "/about/", "/contact/",
  "/privacy/", "/terms/", "/disclaimer/", "/404.html",
  ...slugs("services").map((s) => `/services/${s}/`),
  ...slugs("work").map((s) => `/work/${s}/`),
  ...slugs("blog").map((s) => `/blog/${s}/`),
  ...slugs("news").map((s) => `/news/${s}/`),
  ...courseIds.map((c) => `/training/${c}/`),
  "/llms.txt", "/llms-full.txt", "/robots.txt", "/sitemap-index.xml", "/search.json", "/site.webmanifest",
  "/.well-known/security.txt", "/favicon.ico", "/brand/og.png", "/index.md", "/about.md", "/services/ai-ml.md",
];
for (const r of required) if (!exists(base + r)) fail("route", `missing ${r}`);

// Every on-site URL that llms.txt / llms-full.txt hands to AI assistants.
for (const f of ["llms.txt", "llms-full.txt"]) {
  const text = existsSync(join(dist, f)) ? readFileSync(join(dist, f), "utf8") : "";
  const urls = new Set([...text.matchAll(/https?:\/\/[^\s)<>"]+/g)].map((m) => m[0].replace(/[.,;:]+$/, "")));
  for (const u of urls) if (u.startsWith(`${origin}${base}/`) && !exists(new URL(u).pathname)) fail(f, `dead link ${u}`);
}
if (courseIds.length !== 16) fail("route", `expected 16 courses in training.yaml, found ${courseIds.length}`);

// ---- Sitemap: exactly the indexable pages -----------------------------------
const sitemapFiles = files.filter((f) => /sitemap-\d+\.xml$/.test(f));
const entries = sitemapFiles.flatMap((f) => [...readFileSync(f, "utf8").matchAll(/<url>([\s\S]*?)<\/url>/g)].map((m) => m[1]));
const listed = new Set(entries.map((e) => e.match(/<loc>([^<]+)<\/loc>/)?.[1] ?? ""));
for (const e of entries) if (!/<lastmod>\d{4}-\d{2}-\d{2}/.test(e)) fail("sitemap", `no lastmod: ${e.slice(0, 90)}`);
const indexable = [...pages].filter(([url, p]) => !p.isRedirect && !p.noindex && !url.endsWith(".html")).map(([url]) => `${origin}${base}${url}`);
for (const u of indexable) if (!listed.has(u)) fail("sitemap", `indexable page not listed: ${u}`);
for (const u of listed) if (!indexable.includes(u)) fail("sitemap", `listed but not an indexable page: ${u}`);

// ---- Report ---------------------------------------------------------------------
const real = [...pages.values()].filter((p) => !p.isRedirect).length;
console.log(`qa-html: ${real} pages, ${pages.size - real} redirects, ${refs.length} internal references, ${listed.size} sitemap URLs`);
if (failures.length) {
  for (const f of failures) console.log(`  ✗ ${f}`);
  console.log(`qa-html: ${failures.length} failure(s)`);
  process.exit(1);
}
console.log("qa-html: all checks passed");
