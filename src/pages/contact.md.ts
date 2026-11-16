// Markdown version of /contact/ for AI assistants (/contact.md). See src/lib/markdown.ts.
import type { APIRoute } from "astro";
import { contactMd, markdownResponse } from "../lib/markdown";

export const GET: APIRoute = async ({ site }) => markdownResponse(await contactMd(site));
