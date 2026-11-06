// Markdown version of each role page (/careers/<id>.md). See src/lib/markdown.ts.
import type { APIRoute, GetStaticPaths, InferGetStaticPropsType } from "astro";
import { getCareers } from "../../lib/content";
import { careerMd, markdownResponse } from "../../lib/markdown";

export const getStaticPaths = (async () =>
  (await getCareers()).map((role) => ({ params: { slug: role.id }, props: { role } }))) satisfies GetStaticPaths;

type Props = InferGetStaticPropsType<typeof getStaticPaths>;

export const GET: APIRoute<Props> = async ({ site, props }) => markdownResponse(await careerMd(site, props.role));
