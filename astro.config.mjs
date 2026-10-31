// @ts-check
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, statSync } from "node:fs";
import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import { LEGACY_REDIRECTS } from "./src/lib/legacy-redirects.ts";

// Production origin. Canonicals, the sitemap, Open Graph and JSON-LD all use
// it. GitHub Pages serves the site on this custom domain (public/CNAME), so
// the base path is "/". Override with SITE_URL / BASE_PATH for previews.
const SITE_URL = process.env.SITE_URL ?? "https://www.winapps.co.in";
const BASE_PATH = process.env.BASE_PATH ?? "/";
const base = BASE_PATH.replace(/\/$/, "");

// ---- Accurate <lastmod> per URL --------------------------------------------
// Posts use their own dates. Everything else uses the last git commit that
// touched the page's source files (CI checks out full history), falling back
// to the files' modification time.
const BUILD_DATE = new Date();

/** @param {string[]} files */
function gitDate(files) {
  const present = files.filter((f) => existsSync(f));
  if (!present.length) return undefined;
  try {
    const out = execFileSync("git", ["log", "-1", "--format=%cI", "--", ...present], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
    if (out) return new Date(out);
  } catch {}
  const times = present.map((f) => statSync(f).mtime.valueOf());
  return new Date(Math.max(...times));
}

/** @param {string} file @param {string} key */
function frontmatterDate(file, key) {
  if (!existsSync(file)) return undefined;
  const m = readFileSync(file, "utf8").match(new RegExp(`^${key}:\\s*["']?(\\d{4}-\\d{2}-\\d{2})`, "m"));
  return m ? new Date(`${m[1]}T00:00:00Z`) : undefined;
}

/** Source files behind a route (path without base, with trailing slash). @param {string} path */
function sourcesFor(path) {
  const shared = ["src/data/site.ts", "src/data/copy.ts"];
  if (path === "/") return ["src/pages/index.astro", "src/content", ...shared];
  const detail = path.match(/^\/(services|work|training)\/([^/]+)\/$/);
  if (detail) {
    const [, dir, slug] = detail;
    const page = `src/pages/${dir}/[slug].astro`;
    return dir === "training" ? [page, "src/content/training.yaml", "src/content/programmes.yaml"] : [page, `src/content/${dir}/${slug}.md`];
  }
  const name = path.replace(/^\/|\/$/g, "");
  const index = `src/pages/${name}/index.astro`;
  const single = `src/pages/${name}.astro`;
  const content = {
    services: ["src/content/services"],
    work: ["src/content/work"],
    training: ["src/content/training.yaml", "src/content/programmes.yaml"],
    industries: ["src/content/industries.yaml"],
    "how-we-work": ["src/content/faq.yaml"],
    blog: ["src/content/blog"],
    news: ["src/content/news"],
  }[name] ?? [];
  return [index, single, ...content, ...shared];
}

/** @param {string} path */
function lastmodFor(path) {
  const post = path.match(/^\/(blog|news)\/([^/]+)\/$/);
  if (post) {
    const [, dir, slug] = post;
    return frontmatterDate(`src/content/${dir}/${slug}.md`, dir === "blog" ? "updated" : "date");
  }
  if (path === "/blog/" || path === "/news/") {
    const dir = path.replace(/\//g, "");
    // An index changes when its newest post does.
    const dates = ["blog", "news"]
      .filter((d) => d === dir || dir === "blog")
      .flatMap((d) => {
        try {
          return execFileSync("git", ["ls-files", `src/content/${d}`], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).split("\n").filter(Boolean);
        } catch {
          return [];
        }
      })
      .map((f) => frontmatterDate(f, f.includes("/blog/") ? "updated" : "date"))
      .filter((d) => d !== undefined);
    const newest = dates.length ? new Date(Math.max(...dates.map((d) => d.valueOf()))) : undefined;
    const code = gitDate(sourcesFor(path));
    return [newest, code].filter((d) => d !== undefined).sort((a, b) => b.valueOf() - a.valueOf())[0];
  }
  return gitDate(sourcesFor(path));
}

export default defineConfig({
  site: SITE_URL,
  base: BASE_PATH,
  trailingSlash: "always",
  build: {
    format: "directory",
    // One small stylesheet per page: inlining removes a render-blocking request.
    inlineStylesheets: "always",
  },
  // V1's old-site redirects, plus V1's internal styleguide (not carried over).
  redirects: {
    ...Object.fromEntries(Object.entries(LEGACY_REDIRECTS).map(([from, to]) => [from, `${base}${to}`])),
    "/styleguide": `${base}/`,
  },
  integrations: [
    sitemap({
      filter: (page) => !/\/(404|styleguide)\/?$/.test(new URL(page).pathname),
      serialize(item) {
        const path = new URL(item.url).pathname.slice(base.length) || "/";
        item.lastmod = (lastmodFor(path) ?? BUILD_DATE).toISOString();
        return item;
      },
    }),
  ],
});
