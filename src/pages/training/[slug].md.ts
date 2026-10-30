// Markdown version of each course page (/training/<course-id>.md). See src/lib/markdown.ts.
import type { APIRoute, GetStaticPaths, InferGetStaticPropsType } from "astro";
import { getCourses } from "../../lib/content";
import { courseMd, markdownResponse } from "../../lib/markdown";

export const getStaticPaths = (async () =>
  (await getCourses()).map((course) => ({ params: { slug: course.id }, props: { course } }))) satisfies GetStaticPaths;

type Props = InferGetStaticPropsType<typeof getStaticPaths>;

export const GET: APIRoute<Props> = async ({ site, props }) => markdownResponse(await courseMd(site, props.course));
