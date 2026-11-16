// Markdown version of /ai/ for AI assistants (/ai.md). See src/lib/markdown.ts.
import type { APIRoute } from "astro";
import { aiMd, markdownResponse } from "../lib/markdown";

export const GET: APIRoute = async ({ site }) => markdownResponse(await aiMd(site));
