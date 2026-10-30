// Markdown version of each case study (/work/<id>.md). See src/lib/markdown.ts.
import type { APIRoute, GetStaticPaths, InferGetStaticPropsType } from "astro";
import { getWork } from "../../lib/content";
import { caseStudyMd, markdownResponse } from "../../lib/markdown";

export const getStaticPaths = (async () =>
  (await getWork()).map((entry) => ({ params: { slug: entry.id }, props: { entry } }))) satisfies GetStaticPaths;

type Props = InferGetStaticPropsType<typeof getStaticPaths>;

export const GET: APIRoute<Props> = async ({ site, props }) => markdownResponse(await caseStudyMd(site, props.entry));
