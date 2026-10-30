// Markdown version of /work/ for AI assistants (/work.md). See src/lib/markdown.ts.
import type { APIRoute } from "astro";
import { workMd, markdownResponse } from "../lib/markdown";

export const GET: APIRoute = async ({ site }) => markdownResponse(await workMd(site));
