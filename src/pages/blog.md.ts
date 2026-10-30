// Markdown version of /blog/ for AI assistants (/blog.md). See src/lib/markdown.ts.
import type { APIRoute } from "astro";
import { blogMd, markdownResponse } from "../lib/markdown";

export const GET: APIRoute = async ({ site }) => markdownResponse(await blogMd(site));
