// Markdown version of each service page (/services/<id>.md). See src/lib/markdown.ts.
import type { APIRoute, GetStaticPaths, InferGetStaticPropsType } from "astro";
import { getServices } from "../../lib/content";
import { markdownResponse, serviceMd } from "../../lib/markdown";

export const getStaticPaths = (async () =>
  (await getServices()).map((entry) => ({ params: { slug: entry.id }, props: { entry } }))) satisfies GetStaticPaths;

type Props = InferGetStaticPropsType<typeof getStaticPaths>;

export const GET: APIRoute<Props> = async ({ site, props }) => markdownResponse(await serviceMd(site, props.entry));
