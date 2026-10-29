// Sorted access to the content collections, shared by pages, menus, the
// footer, JSON-LD, llms.txt and the .md page versions.
import { getCollection, type CollectionEntry } from "astro:content";

const byOrder = <T extends { data: { order: number } }>(a: T, b: T) => a.data.order - b.data.order;

export const getServices = async () => (await getCollection("services")).sort(byOrder);
export const getWork = async () => (await getCollection("work")).sort(byOrder);
export const getIndustries = async () => (await getCollection("industries")).sort(byOrder);
export const getTracks = async () => (await getCollection("training")).sort(byOrder);
export const getFaq = async () => (await getCollection("faq")).sort(byOrder).map((f) => f.data);
export const getBlog = async () =>
  (await getCollection("blog")).sort((a, b) => b.data.updated.valueOf() - a.data.updated.valueOf());
export const getNews = async () =>
  (await getCollection("news")).sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());

export type Track = CollectionEntry<"training">;
export type Course = Track["data"]["courses"][number] & { track: { id: string; name: string; intro: string } };

/** Every course, in track order, with its track attached. */
export async function getCourses(): Promise<Course[]> {
  return (await getTracks()).flatMap((t) =>
    t.data.courses.map((c) => ({ ...c, track: { id: t.id, name: t.data.name, intro: t.data.intro } }))
  );
}

/** Strip HTML comments (V1's TODO notes) from Markdown before reuse as plain text. */
export const stripComments = (md: string) => md.replace(/<!--[\s\S]*?-->\s*/g, "").trim();
