// Markdown version of /services/ for AI assistants (/services.md). See src/lib/markdown.ts.
import type { APIRoute } from "astro";
import { servicesMd, markdownResponse } from "../lib/markdown";

export const GET: APIRoute = async ({ site }) => markdownResponse(await servicesMd(site));
