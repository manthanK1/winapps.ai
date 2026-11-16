// Markdown version of / for AI assistants (/index.md). See src/lib/markdown.ts.
import type { APIRoute } from "astro";
import { homeMd, markdownResponse } from "../lib/markdown";

export const GET: APIRoute = async ({ site }) => markdownResponse(await homeMd(site));
