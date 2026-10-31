// Sorted access to the content collections, shared by pages, menus, the
// footer, JSON-LD, llms.txt and the .md page versions.
import { getCollection, type CollectionEntry } from "astro:content";
import { TRAINING_DOMAINS, TRAINING_PAGE, type TrainingCounts } from "../data/copy";

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

export type Programme = CollectionEntry<"programmes">;
export const AUDIENCES = ["professionals", "students"] as const;
/** Programmes, working professionals first, each audience in its own order. */
export const getProgrammes = async () =>
  (await getCollection("programmes")).sort(
    (a, b) => AUDIENCES.indexOf(a.data.audience) - AUDIENCES.indexOf(b.data.audience) || a.data.order - b.data.order
  );

/** A programme as the course helpers (JSON-LD, Markdown) take it. */
export function programmeAsCourse(p: Programme) {
  const domain = TRAINING_DOMAINS.find((d) => d.id === p.data.domain);
  return {
    id: p.id,
    name: p.data.name,
    summary: p.data.summary,
    topics: p.data.topics,
    track: { name: domain?.name ?? TRAINING_PAGE.audiences[p.data.audience].label },
    months: p.data.months,
    audience: p.data.audience,
  };
}

/** The numbers in the training headlines. */
export async function trainingCounts(): Promise<TrainingCounts> {
  const [programmes, tracks] = await Promise.all([getProgrammes(), getTracks()]);
  const months = programmes.map((p) => p.data.months);
  return {
    programmes: programmes.length,
    minMonths: Math.min(...months),
    maxMonths: Math.max(...months),
    courses: tracks.reduce((n, t) => n + t.data.courses.length, 0),
    tracks: tracks.length,
  };
}

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
