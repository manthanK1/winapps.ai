// Markdown version of /careers/. See src/lib/markdown.ts.
import type { APIRoute } from "astro";
import { careersMd, markdownResponse } from "../lib/markdown";

export const GET: APIRoute = async ({ site }) => markdownResponse(await careersMd(site));
