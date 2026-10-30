// Markdown version of each blog guide, FAQ included (/blog/<slug>.md). See src/lib/markdown.ts.
import type { APIRoute, GetStaticPaths, InferGetStaticPropsType } from "astro";
import { getBlog } from "../../lib/content";
import { blogPostMd, markdownResponse } from "../../lib/markdown";

export const getStaticPaths = (async () =>
  (await getBlog()).map((entry) => ({ params: { slug: entry.id }, props: { entry } }))) satisfies GetStaticPaths;

type Props = InferGetStaticPropsType<typeof getStaticPaths>;

export const GET: APIRoute<Props> = async ({ site, props }) => markdownResponse(await blogPostMd(site, props.entry));
