// <title> and meta description within search-result limits, without
// rewriting V1's copy: long values are trimmed at a word boundary.
import { SITE } from "../data/site";

export const TITLE_MAX = 60;
export const DESCRIPTION_MAX = 155;

const BRAND = `${SITE.name}®`;

/** Trim to `max` characters at a word boundary, adding an ellipsis if cut. */
export function clip(text: string, max: number): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max - 1);
  const atWord = cut.slice(0, cut.lastIndexOf(" ")).replace(/[\s,;:.–—-]+$/, "");
  return `${atWord || cut}…`;
}

/**
 * "Page · Winapps®". The home page reads "Winapps® · <tagline>". When the
 * branded form is too long the brand is dropped, then the title is clipped.
 */
export function pageTitle(title: string): string {
  if (title === SITE.name) return clip(`${BRAND} · ${SITE.tagline}`, TITLE_MAX);
  const branded = `${title} · ${BRAND}`;
  return branded.length <= TITLE_MAX ? branded : clip(title, TITLE_MAX);
}

export function metaDescription(text: string): string {
  return clip(text, DESCRIPTION_MAX);
}
