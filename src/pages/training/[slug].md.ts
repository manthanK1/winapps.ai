// Markdown version of each training page (/training/<id>.md): programmes and
// short courses alike. See src/lib/markdown.ts.
import type { APIRoute, GetStaticPaths, InferGetStaticPropsType } from "astro";
import { getCourses, getProgrammes } from "../../lib/content";
import { courseMd, markdownResponse, programmeMd } from "../../lib/markdown";

export const getStaticPaths = (async () => {
  const [programmes, courses] = await Promise.all([getProgrammes(), getCourses()]);
  return [
    ...programmes.map((programme) => ({ params: { slug: programme.id }, props: { programme, course: null } })),
    ...courses.map((course) => ({ params: { slug: course.id }, props: { programme: null, course } })),
  ];
}) satisfies GetStaticPaths;

type Props = InferGetStaticPropsType<typeof getStaticPaths>;

export const GET: APIRoute<Props> = async ({ site, props }) =>
  markdownResponse(props.programme ? await programmeMd(site, props.programme) : await courseMd(site, props.course!));
