// Markdown version of /industries/ for AI assistants (/industries.md). See src/lib/markdown.ts.
import type { APIRoute } from "astro";
import { industriesMd, markdownResponse } from "../lib/markdown";

export const GET: APIRoute = async ({ site }) => markdownResponse(await industriesMd(site));
