// Markdown version of /training/ for AI assistants (/training.md). See src/lib/markdown.ts.
import type { APIRoute } from "astro";
import { trainingMd, markdownResponse } from "../lib/markdown";

export const GET: APIRoute = async ({ site }) => markdownResponse(await trainingMd(site));
