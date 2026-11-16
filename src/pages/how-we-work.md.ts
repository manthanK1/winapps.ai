// Markdown version of /how-we-work/ for AI assistants (/how-we-work.md). See src/lib/markdown.ts.
import type { APIRoute } from "astro";
import { howWeWorkMd, markdownResponse } from "../lib/markdown";

export const GET: APIRoute = async ({ site }) => markdownResponse(await howWeWorkMd(site));
