// Markdown version of /about/ for AI assistants (/about.md). See src/lib/markdown.ts.
import type { APIRoute } from "astro";
import { aboutMd, markdownResponse } from "../lib/markdown";

export const GET: APIRoute = async ({ site }) => markdownResponse(await aboutMd(site));
