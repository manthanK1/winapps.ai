#!/usr/bin/env node
// Tells IndexNow (Bing, Yandex, Seznam, Naver and others share one endpoint)
// that the site's pages changed, right after a deploy.
//
//   node scripts/indexnow.mjs            submit every URL in the live sitemap
//   node scripts/indexnow.mjs --dry-run  print what would be sent
//
// Reads SITE_URL (default https://www.winapps.co.in) and BASE_PATH (default /),
// and the key from public/<32 hex chars>.txt, which the site serves at its
// root so IndexNow can verify ownership. Uses the LIVE sitemap, so run it
// after the new build is online. It never fails a deploy: network or API
// problems print a warning and exit 0.
import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ENDPOINT = "https://api.indexnow.org/indexnow";
// IndexNow accepts up to 10,000 URLs per request.
const BATCH = 10_000;

const dryRun = process.argv.includes("--dry-run");
const siteUrl = (process.env.SITE_URL || "https://www.winapps.co.in").replace(/\/+$/, "");
const base = (process.env.BASE_PATH || "/").replace(/\/+$/, "");
const origin = new URL(siteUrl);
const root = `${origin.origin}${base}`;

/** @param {string} message */
function warnAndExit(message) {
  console.warn(`IndexNow: ${message} Skipping (this never fails a deploy).`);
  process.exit(0);
}

function readKey() {
  const publicDir = join(dirname(fileURLToPath(import.meta.url)), "..", "public");
  const file = readdirSync(publicDir).find((f) => /^[a-f0-9]{32}\.txt$/.test(f));
  if (!file) return warnAndExit("no key file (public/<32 hex chars>.txt) found.");
  const key = readFileSync(join(publicDir, file), "utf8").trim();
  if (`${key}.txt` !== file) return warnAndExit(`key file ${file} does not contain its own name.`);
  return key;
}

/** @param {string} url */
async function fetchText(url) {
  const res = await fetch(url, { signal: AbortSignal.timeout(20_000), headers: { "User-Agent": "winapps-indexnow" } });
  if (!res.ok) throw new Error(`${url} returned HTTP ${res.status}`);
  return res.text();
}

/** <loc> values in a sitemap or sitemap index. @param {string} xml */
const locs = (xml) =>
  [...xml.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g)].map((m) =>
    m[1].replace(/&amp;/g, "&").replace(/&apos;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, "<").replace(/&gt;/g, ">")
  );

async function collectUrls() {
  const index = await fetchText(`${root}/sitemap-index.xml`);
  const children = locs(index);
  const urls = new Set();
  for (const child of children) {
    // A plain sitemap (no index) lists pages directly.
    if (!/\.xml(\?|$)/.test(child)) {
      urls.add(child);
      continue;
    }
    for (const loc of locs(await fetchText(child))) urls.add(loc);
  }
  // IndexNow only accepts URLs on the key's host.
  return [...urls].filter((u) => {
    try {
      return new URL(u).host === origin.host;
    } catch {
      return false;
    }
  });
}

async function main() {
  const key = readKey();
  let urlList;
  try {
    urlList = await collectUrls();
  } catch (err) {
    return warnAndExit(`could not read the live sitemap (${err instanceof Error ? err.message : err}).`);
  }
  if (!urlList.length) return warnAndExit("the sitemap lists no URLs on this host.");

  const keyLocation = `${root}/${key}.txt`;
  for (let i = 0; i < urlList.length; i += BATCH) {
    const body = { host: origin.host, key, keyLocation, urlList: urlList.slice(i, i + BATCH) };
    if (dryRun) {
      console.log(`IndexNow dry run: would POST ${body.urlList.length} URLs to ${ENDPOINT}`);
      console.log(JSON.stringify(body, null, 2));
      continue;
    }
    try {
      const res = await fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json; charset=utf-8" },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(30_000),
      });
      // 200 = accepted, 202 = accepted while the key is being verified.
      const note = res.ok ? "accepted" : (await res.text().catch(() => "")).slice(0, 300) || res.statusText;
      console.log(`IndexNow: HTTP ${res.status} for ${body.urlList.length} URLs (${note}).`);
    } catch (err) {
      return warnAndExit(`request failed (${err instanceof Error ? err.message : err}).`);
    }
  }
}

main().catch((err) => warnAndExit(`unexpected error (${err instanceof Error ? err.message : err}).`));
