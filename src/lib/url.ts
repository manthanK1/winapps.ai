// Builds internal links that respect the configured base path and the
// site's trailing-slash convention, e.g. href("/work/") → "/work/".
const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

export function href(path = "/"): string {
  const [beforeHash, hash] = path.split("#");
  const [pathPart, query] = beforeHash.split("?");
  let p = pathPart || "/";
  if (!p.startsWith("/")) p = "/" + p;
  if (!p.endsWith("/") && !/\.[a-z0-9]+$/i.test(p)) p += "/";
  return BASE + p + (query ? "?" + query : "") + (hash ? "#" + hash : "");
}

export function absolute(path: string, site: URL | undefined): string {
  return new URL(href(path), site).toString();
}

/** True when `current` is `target` or one of its sub-pages. */
export function isActive(current: string, target: string): boolean {
  const t = href(target);
  return current === t || (t !== href("/") && current.startsWith(t));
}
