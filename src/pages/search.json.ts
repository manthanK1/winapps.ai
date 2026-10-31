// Client-side search index for the header's search dialog: one entry per
// page, plus each industry and training track as an anchor on its page.
// Shape matches the `Entry` type in Header.astro. URLs go through href() so
// they respect the base path.
import type { APIRoute } from "astro";
import { FOOTER, PROMISES, SITE } from "../data/site";
import {
  ABOUT_PAGE,
  AI_PAGE,
  BLOG_PAGE,
  CONTACT_PAGE,
  HOME,
  HOW_PAGE,
  INDUSTRIES_PAGE,
  NEWS_PAGE,
  SERVICES_PAGE,
  TRAINING_DOMAINS,
  TRAINING_PAGE,
  WORK_PAGE,
} from "../data/copy";
import { getBlog, getCourses, getIndustries, getNews, getProgrammes, getServices, getTracks, getWork, trainingCounts } from "../lib/content";
import { coursePath } from "../lib/schema";
import { href } from "../lib/url";

type Entry = { title: string; description: string; url: string; kind: string; keywords?: string };

/** Space-separated keywords, without repeats. */
const words = (...parts: (string | readonly string[] | undefined)[]) =>
  [...new Set(parts.flat().filter((p): p is string => Boolean(p)))].join(" ");

export const GET: APIRoute = async () => {
  const [services, work, industries, tracks, courses, programmes, counts, blog, news] = await Promise.all([
    getServices(),
    getWork(),
    getIndustries(),
    getTracks(),
    getCourses(),
    getProgrammes(),
    trainingCounts(),
    getBlog(),
    getNews(),
  ]);

  const pages: Entry[] = [
    { title: "Home", description: HOME.meta.description, url: href("/"), kind: "Page", keywords: words(SITE.tagline, PROMISES.map((p) => p.label)) },
    { title: SERVICES_PAGE.meta.title, description: SERVICES_PAGE.meta.description, url: href("/services/"), kind: "Page" },
    { title: WORK_PAGE.meta.title, description: WORK_PAGE.meta.description, url: href("/work/"), kind: "Page", keywords: "case studies" },
    {
      title: AI_PAGE.meta.title,
      description: AI_PAGE.meta.description,
      url: href("/ai/"),
      kind: "Page",
      keywords: words("artificial intelligence machine learning", AI_PAGE.services.items, AI_PAGE.solutions.items.map((s) => s.title)),
    },
    { title: INDUSTRIES_PAGE.meta.title, description: INDUSTRIES_PAGE.meta.description, url: href("/industries/"), kind: "Page" },
    {
      title: TRAINING_PAGE.meta.title,
      description: TRAINING_PAGE.meta.description(counts),
      url: href("/training/"),
      kind: "Page",
      keywords: words("courses programmes", TRAINING_DOMAINS.map((d) => d.name)),
    },
    { title: HOW_PAGE.meta.title, description: HOW_PAGE.meta.description, url: href("/how-we-work/"), kind: "Page", keywords: "process engagement models FAQ" },
    { title: ABOUT_PAGE.meta.title, description: ABOUT_PAGE.meta.description, url: href("/about/"), kind: "Page", keywords: words(SITE.legalName, SITE.alternateName) },
    { title: CONTACT_PAGE.meta.title, description: CONTACT_PAGE.meta.description, url: href("/contact/"), kind: "Page", keywords: "book a call WhatsApp email phone" },
    { title: BLOG_PAGE.meta.title, description: BLOG_PAGE.meta.description, url: href("/blog/"), kind: "Page", keywords: "insights guides" },
    { title: NEWS_PAGE.meta.title, description: NEWS_PAGE.meta.description, url: href("/news/"), kind: "Page", keywords: "insights" },
    // Legal pages carry no summary of their own; the title is enough to find them.
    ...FOOTER.legal.map((l) => ({ title: l.label, description: "", url: href(l.href), kind: "Page" })),
  ];

  const entries: Entry[] = [
    ...pages,
    ...services.map((s) => ({
      title: s.data.title,
      description: s.data.summary,
      url: href(`/services/${s.id}/`),
      kind: "Service",
      keywords: words(s.data.tagline, s.data.tech),
    })),
    ...work.map((w) => ({
      title: w.data.title,
      description: w.data.delivered,
      url: href(`/work/${w.id}/`),
      kind: "Case study",
      keywords: words(w.data.sector, w.data.region, w.data.disciplines, w.data.stack),
    })),
    ...industries.map((i) => ({
      title: i.data.name,
      description: i.data.summary,
      url: href(`/industries/#${i.id}`),
      kind: "Industry",
      keywords: words(i.data.focus),
    })),
    ...tracks.map((t) => ({
      title: t.data.name,
      description: t.data.intro,
      url: href(`/training/#${t.id}`),
      kind: "Training track",
      keywords: words(t.data.courses.map((c) => c.name)),
    })),
    ...programmes.map((p) => ({
      title: p.data.name,
      description: `${TRAINING_PAGE.months(p.data.months)}, ${TRAINING_PAGE.audiences[p.data.audience].label.toLowerCase()}. ${p.data.summary}`,
      url: href(coursePath(p.id)),
      kind: "Programme",
      keywords: words("programme", p.data.topics),
    })),
    ...courses.map((c) => ({
      title: c.name,
      description: c.summary,
      url: href(coursePath(c.id)),
      kind: "Course",
      keywords: words(c.track.name, c.topics),
    })),
    ...blog.map((p) => ({
      title: p.data.title,
      description: p.data.description,
      url: href(`/blog/${p.id}/`),
      kind: "Guide",
      keywords: words(p.data.author),
    })),
    ...news.map((p) => ({
      title: p.data.title,
      description: p.data.description,
      url: href(`/news/${p.id}/`),
      kind: "News",
      keywords: p.data.dateLabel,
    })),
  ];

  return new Response(JSON.stringify(entries), { headers: { "Content-Type": "application/json; charset=utf-8" } });
};
