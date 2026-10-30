// /llms-full.txt: the llms.txt header plus the full text of the main pages,
// each preceded by its source URL.
import type { APIRoute } from "astro";
import { llmsFullTxt, textResponse } from "../lib/markdown";

export const GET: APIRoute = async ({ site }) => textResponse(await llmsFullTxt(site));
