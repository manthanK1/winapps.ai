// Markdown version of each news post (/news/<slug>.md). See src/lib/markdown.ts.
import type { APIRoute, GetStaticPaths, InferGetStaticPropsType } from "astro";
import { getNews } from "../../lib/content";
import { markdownResponse, newsPostMd } from "../../lib/markdown";

export const getStaticPaths = (async () =>
  (await getNews()).map((entry) => ({ params: { slug: entry.id }, props: { entry } }))) satisfies GetStaticPaths;

type Props = InferGetStaticPropsType<typeof getStaticPaths>;

export const GET: APIRoute<Props> = async ({ site, props }) => markdownResponse(await newsPostMd(site, props.entry));
