// Markdown version of /news/ for AI assistants (/news.md). See src/lib/markdown.ts.
import type { APIRoute } from "astro";
import { newsMd, markdownResponse } from "../lib/markdown";

export const GET: APIRoute = async ({ site }) => markdownResponse(await newsMd(site));
