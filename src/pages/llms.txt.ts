// /llms.txt (llmstxt.org): who Winapps is and a link to every key page and
// its Markdown version, built from src/data and the content collections.
import type { APIRoute } from "astro";
import { llmsTxt, textResponse } from "../lib/markdown";

export const GET: APIRoute = async ({ site }) => textResponse(await llmsTxt(site));
