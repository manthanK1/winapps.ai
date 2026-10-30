// Clean Markdown versions of the key pages, for AI assistants and crawlers:
// the /<page>.md twins, /llms.txt and /llms-full.txt. Built only from
// src/data (site.ts, copy.ts) and the content collections, i.e. the same words
// the HTML pages show, so the two never drift apart. Every page starts with
// "# <H1>", then a short plain answer taken from the page's own lead, then the
// content. Links are absolute on the production origin (Astro `site`).
import type { CollectionEntry } from "astro:content";
import { PROMISES, SITE, SOCIAL, STACK, BUDGETS, NEEDS, whatsappFor } from "../data/site";
import {
  ABOUT_PAGE,
  BLOG_PAGE,
  BLOG_POST,
  CLOCKS,
  CONTACT_PAGE,
  CTA,
  ENGAGEMENT_BADGE,
  ENGAGEMENT_MODELS,
  ENGAGEMENT_REPLY,
  HOME,
  HOW_PAGE,
  INDUSTRIES_PAGE,
  NEWS_PAGE,
  PROCESS_STEPS,
  SERVICES_PAGE,
  SERVICE_DETAIL,
  TRAINING_ADVICE,
  TRAINING_PAGE,
  TRUST,
  WORK_DETAIL,
  WORK_PAGE,
  headingText,
} from "../data/copy";
import {
  getBlog,
  getCourses,
  getFaq,
  getIndustries,
  getNews,
  getServices,
  getTracks,
  getWork,
  stripComments,
  type Course,
  type Track,
} from "./content";
import { coursePath } from "./schema";
import { absolute } from "./url";

type Site = URL | undefined;
type Service = CollectionEntry<"services">;
type Work = CollectionEntry<"work">;
type BlogPost = CollectionEntry<"blog">;
type NewsPost = CollectionEntry<"news">;
type Faq = readonly { question: string; answer: string }[];

// ---------------------------------------------------------------- Paths ----

/** Markdown twin of a page: "/" → "/index.md", "/about/" → "/about.md". */
export const mdPath = (path: string) => (path === "/" ? "/index.md" : `${path.replace(/\/$/, "")}.md`);

export const servicePath = (id: string) => `/services/${id}/`;
export const workPath = (id: string) => `/work/${id}/`;
export const blogPath = (id: string) => `/blog/${id}/`;
export const newsPath = (id: string) => `/news/${id}/`;
export { coursePath };

// -------------------------------------------------------------- Helpers ----

/** Join blocks with blank lines, dropping empty ones. */
const join = (...blocks: (string | false | null | undefined)[]) => blocks.filter(Boolean).join("\n\n");
const bullets = (items: readonly string[]) => items.map((i) => `- ${i}`).join("\n");
const numbered = (items: readonly string[]) => items.map((i, n) => `${n + 1}. ${i}`).join("\n");
/** Square brackets would break a link label. */
const label = (text: string) => text.replace(/([[\]])/g, "\\$1");
/** Parentheses would end a Markdown link early (WhatsApp messages, course names). */
const safeUrl = (url: string) => url.replace(/\(/g, "%28").replace(/\)/g, "%29");
/** WhatsApp chat link, optionally with the first message typed. */
const waLink = (text: string, message?: string) =>
  `[${label(text)}](${safeUrl(message ? whatsappFor(message) : SITE.whatsappHref)})`;
const telLink = () => `[${SITE.phone}](${SITE.phoneHref})`;
const mailLink = () => `[${SITE.email}](mailto:${SITE.email})`;
/** A collection entry's Markdown body: LF line endings, no HTML comments (V1's TODO notes). */
const body = (md: string | undefined) => stripComments((md ?? "").replace(/\r\n?/g, "\n"));

/**
 * Last pass over every document: plain spaces instead of the non-breaking
 * ones the HTML uses (phone number), no runs of blank lines, one final newline.
 */
const NBSP = String.fromCharCode(0xa0);
export const finish = (md: string) =>
  md.replace(/\r\n?/g, "\n").replaceAll(NBSP, " ").replace(/\n{3,}/g, "\n\n").trim() + "\n";

/** "15 February 2026", the date format the blog shows. */
export const longDate = (d: Date) =>
  d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });

/** Link builders bound to the production origin. */
function linker(site: Site) {
  const url = (path: string) => safeUrl(absolute(path, site));
  const link = (text: string, path: string) => `[${label(text)}](${url(path)})`;
  /** "[Title](page)" plus its Markdown twin. */
  const page = (text: string, path: string) => `${link(text, path)} ([Markdown](${url(mdPath(path))}))`;
  return { url, link, page };
}
type Links = ReturnType<typeof linker>;

/** Leading sentences of a Markdown body, up to `min` sentences, and the rest. */
function splitLead(md: string, min = 2): { lead: string; rest: string } {
  const blocks = md.split(/\n{2,}/);
  const lead: string[] = [];
  let sentences = 0;
  while (blocks.length && sentences < min) {
    const next = blocks[0].trim();
    // Stop at the first heading, list, table or quote: only prose makes a lead.
    if (!next || /^(#|[-*+] |\d+\. |\||>)/.test(next)) break;
    lead.push(next.replace(/\s*\n\s*/g, " "));
    sentences += next.split(/[.!?…](?:\s|$)/).filter((s) => s.trim()).length;
    blocks.shift();
  }
  return { lead: lead.join(" "), rest: blocks.join("\n\n").trim() };
}

// ------------------------------------------------------ Shared sections ----

/** Contact facts, worded as in src/data/site.ts. */
function contactList(L: Links) {
  return bullets([
    `Email: ${mailLink()}`,
    `Phone: ${telLink()}`,
    `WhatsApp: ${SITE.whatsappHref}`,
    `${CTA.primary}: ${L.url(SITE.bookingPath)}`,
  ]);
}

/** Closing call to action (V1 CtaBand). */
function ctaBlock(L: Links, title: string = CTA.title, text: string = CTA.text) {
  return join(
    `## ${title}`,
    text,
    bullets([
      L.link(CTA.primary, SITE.bookingPath),
      `${CTA.email}: ${mailLink()}`,
      `${CTA.alt.before} ${waLink(CTA.alt.whatsapp)}${CTA.alt.middle} ${telLink()}${CTA.alt.after}`,
    ])
  );
}

function faqBlock(items: Faq) {
  return items.map((f) => join(`### ${f.question}`, f.answer)).join("\n\n");
}

function processBlock() {
  return PROCESS_STEPS.map((s) => join(`### ${s.title}`, `*${s.time}*`, s.text, bullets(s.more))).join("\n\n");
}

/** Clocks note without its first sentence, which describes the visual bars. */
function overlapNote() {
  const n = CLOCKS.note;
  return `${n.before}${n.strong1}${n.middle}${n.strong2}${n.after}`.replace(/^[^.]*\.\s+/, "");
}

function trustBlock() {
  return join(
    `## ${headingText(TRUST)}`,
    TRUST.intro,
    bullets(TRUST.commitments.map((c) => `**${c.title}**: ${c.text}`)),
    overlapNote()
  );
}

function engagementBlock(L: Links, intro: string) {
  return join(
    `## ${headingText(HOME.engagement)}`,
    intro,
    ...ENGAGEMENT_MODELS.map((m) =>
      join(`### ${m.name}${m.featured ? ` (${ENGAGEMENT_BADGE})` : ""}`, m.fit, bullets(m.points), L.link(m.cta, SITE.bookingPath))
    ),
    ENGAGEMENT_REPLY + "."
  );
}

function postLine(L: Links, p: BlogPost) {
  return `${L.page(p.data.title, blogPath(p.id))}: ${BLOG_POST.card.meta(p.data.readMinutes)} · ${BLOG_POST.card.updated} ${longDate(p.data.updated)}`;
}

function newsLine(L: Links, p: NewsPost) {
  return `${L.page(p.data.title, newsPath(p.id))} (${p.data.dateLabel}): ${p.data.description}`;
}

/**
 * One-line summary of a guide. The old site clipped descriptions with "…", so
 * those use the article's opening sentences instead.
 */
function postSummary(p: BlogPost) {
  return p.data.description.endsWith("…") ? splitLead(body(p.body)).lead || p.data.description : p.data.description;
}

const courseCount = (tracks: readonly Track[]) => tracks.reduce((n, t) => n + t.data.courses.length, 0);

// ------------------------------------------------------------------ Home ----

export async function homeMd(site: Site) {
  const L = linker(site);
  const [services, work, tracks, faq, blog, news] = await Promise.all([
    getServices(),
    getWork(),
    getTracks(),
    getFaq(),
    getBlog(),
    getNews(),
  ]);
  const i = HOME.intro;
  return finish(
    join(
      `# ${HOME.hero.title}`,
      // Who we are (site.ts) plus the intro panel's closing sentence.
      `${SITE.description} ${i.middle.replace(/^[.\s]+/, "")}${i.strong2}${i.after}`,
      HOME.hero.lead,
      bullets([
        L.link(HOME.hero.primary.label, SITE.bookingPath),
        L.link(HOME.hero.secondary.label, HOME.hero.secondary.href),
        `${CTA.alt.before} ${waLink(CTA.alt.whatsapp)}`,
      ]),
      // V1's label for the promise tiles under the hero.
      `## Our commitments`,
      bullets(PROMISES.map((p) => p.label)),

      `## ${headingText(HOME.practices)}`,
      HOME.practices.intro,
      bullets(services.map((s) => `${L.page(s.data.title, servicePath(s.id))}: ${s.data.summary}`)),
      L.link(HOME.practices.allLink, "/services/"),

      `## ${headingText(HOME.training)}`,
      HOME.training.intro(courseCount(tracks)),
      bullets(
        tracks.map(
          (t) =>
            `${L.link(t.data.name, `/training/#${t.id}`)}: ${t.data.courses.map((c) => L.link(c.name, coursePath(c.id))).join(", ")}`
        )
      ),
      L.link(HOME.training.allLink, "/training/"),
      `### ${TRAINING_ADVICE.title}`,
      TRAINING_ADVICE.text,
      waLink(TRAINING_ADVICE.cta, TRAINING_ADVICE.message),

      `## ${headingText(HOME.work)}`,
      HOME.work.intro,
      bullets(work.map((w) => `${L.page(w.data.title, workPath(w.id))} (${w.data.sector}): ${w.data.delivered}`)),
      L.link(HOME.work.allLink, "/work/"),

      `## ${headingText(HOME.process)}`,
      HOME.process.text,
      processBlock(),
      L.link(HOME.process.link, "/how-we-work/"),

      trustBlock(),
      engagementBlock(L, HOME.engagement.intro),

      `## ${headingText(HOME.tech)}`,
      HOME.tech.text,
      bullets(Object.entries(STACK).map(([group, tools]) => `**${group}**: ${tools.join(", ")}`)),

      `## ${headingText(HOME.insights)}`,
      bullets([...blog.slice(0, 3).map((p) => postLine(L, p)), ...news.slice(0, 2).map((p) => newsLine(L, p))]),
      L.link(HOME.insights.allLink, "/blog/"),

      `## ${headingText(HOME.faq)}`,
      faqBlock(faq),
      `${HOME.faq.somethingElse} ${mailLink()}`,

      ctaBlock(L)
    )
  );
}

// ------------------------------------------------------------- Services ----

export async function servicesMd(site: Site) {
  const L = linker(site);
  const services = await getServices();
  return finish(
    join(
      `# ${headingText(SERVICES_PAGE.hero)}`,
      SERVICES_PAGE.hero.lead,
      ...services.map((s, n) =>
        join(
          `## ${String(n + 1).padStart(2, "0")} ${s.data.title}`,
          s.data.summary,
          `**${SERVICES_PAGE.whatYouGet}**: ${s.data.outcome}`,
          `${L.page(`${SERVICES_PAGE.explore}: ${s.data.title}`, servicePath(s.id))}`
        )
      ),
      ctaBlock(L)
    )
  );
}

export async function serviceMd(site: Site, entry: Service) {
  const L = linker(site);
  const d = entry.data;
  const [work, blog] = await Promise.all([getWork(), getBlog()]);
  const related = d.relatedWork ? work.find((w) => w.id === d.relatedWork?.id) : undefined;
  const posts = d.relatedPosts.map((r) => blog.find((p) => p.id === r.id)).filter((p): p is BlogPost => p !== undefined);
  return finish(
    join(
      `# ${headingText({ title: d.title, accent: d.tagline })}`,
      `${d.summary} ${d.outcome} ${SERVICE_DETAIL.startLine}`,
      `${L.link(SERVICE_DETAIL.cta, SITE.bookingPath)} · ${SERVICE_DETAIL.reply}`,

      `## ${SERVICE_DETAIL.whatItIs}`,
      body(entry.body),

      `## ${SERVICE_DETAIL.whatYouGet}`,
      d.outcome,
      bullets(d.deliverables),

      `## ${headingText(SERVICE_DETAIL.deliver)}`,
      numbered(d.delivery.map((s) => `**${s.title}**: ${s.text}`)),

      related &&
        join(`## ${SERVICE_DETAIL.relatedCase}`, `${L.page(related.data.title, workPath(related.id))}: ${related.data.delivered}`),

      `## ${SERVICE_DETAIL.tech}`,
      bullets(d.tech),
      SERVICE_DETAIL.techNote,

      posts.length > 0 &&
        join(`## ${headingText(SERVICE_DETAIL.guides)}`, bullets(posts.map((p) => postLine(L, p))), L.link(SERVICE_DETAIL.guides.all, "/blog/")),

      d.faq.length > 0 && join(`## ${BLOG_POST.faq}`, faqBlock(d.faq)),

      ctaBlock(L)
    )
  );
}

// ----------------------------------------------------------------- Work ----

export async function workMd(site: Site) {
  const L = linker(site);
  const work = await getWork();
  return finish(
    join(
      `# ${headingText(WORK_PAGE.hero)}`,
      WORK_PAGE.hero.lead,
      ...work.map((w) =>
        join(
          `## ${w.data.title}`,
          [w.data.sector, w.data.region].filter(Boolean).join(" · "),
          bullets([`**${WORK_PAGE.card.problem}**: ${w.data.problem}`, `**${WORK_PAGE.card.delivered}**: ${w.data.delivered}`]),
          L.page(`${WORK_PAGE.card.read}: ${w.data.title}`, workPath(w.id))
        )
      ),
      ctaBlock(L, WORK_PAGE.cta.title, WORK_PAGE.cta.text)
    )
  );
}

export async function caseStudyMd(site: Site, entry: Work) {
  const L = linker(site);
  const d = entry.data;
  const [work, services] = await Promise.all([getWork(), getServices()]);
  const index = work.findIndex((w) => w.id === entry.id);
  const next = work[(index + 1) % work.length];
  const practices = d.services.map((r) => services.find((s) => s.id === r.id)).filter((s): s is Service => s !== undefined);
  return finish(
    join(
      `# ${d.title}`,
      `${d.problem} ${d.delivered}`,
      bullets([
        `**${WORK_DETAIL.sector}**: ${d.sector}`,
        ...(d.region ? [`**${WORK_DETAIL.region}**: ${d.region}`] : []),
        `**${WORK_DETAIL.disciplines}**: ${d.disciplines.join(" · ")}`,
        ...(practices.length ? [`**${WORK_DETAIL.practices}**: ${practices.map((s) => L.link(s.data.title, servicePath(s.id))).join(", ")}`] : []),
        `**${WORK_DETAIL.client}**: ${WORK_DETAIL.clientText}`,
      ]),
      body(entry.body),

      `## ${WORK_DETAIL.architecture}`,
      bullets(d.architecture.map((a) => `**${a.layer}**: ${a.nodes.join(", ")}`)),
      WORK_DETAIL.architectureCaption,

      `## ${WORK_DETAIL.results}`,
      d.results?.length ? bullets(d.results.map((r) => `**${r.value}**: ${r.label}`)) : WORK_DETAIL.resultsFallback,

      `## ${WORK_DETAIL.stack}`,
      bullets(d.stack),

      next && next.id !== entry.id && `${WORK_DETAIL.next}: ${L.page(next.data.title, workPath(next.id))}`,

      ctaBlock(L, WORK_DETAIL.cta.title)
    )
  );
}

// ----------------------------------------------------------- Industries ----

export async function industriesMd(site: Site) {
  const L = linker(site);
  const [industries, work] = await Promise.all([getIndustries(), getWork()]);
  return finish(
    join(
      `# ${headingText(INDUSTRIES_PAGE.hero)}`,
      INDUSTRIES_PAGE.hero.lead,
      ...industries.map((ind) => {
        const cases = ind.data.relatedWork.map((r) => work.find((w) => w.id === r.id)).filter((w): w is Work => w !== undefined);
        return join(
          `## ${L.link(ind.data.name, `/industries/#${ind.id}`)}`,
          ind.data.summary,
          bullets(ind.data.focus),
          // Paragraphs, not a second list: two lists in a row would merge.
          ...cases.map((w) => `${INDUSTRIES_PAGE.caseStudy} ${L.page(w.data.title, workPath(w.id))}`),
          L.link(INDUSTRIES_PAGE.discuss(ind.data.name), SITE.bookingPath)
        );
      }),
      ctaBlock(L, INDUSTRIES_PAGE.cta.title)
    )
  );
}

// ------------------------------------------------------------- Training ----

export async function trainingMd(site: Site) {
  const L = linker(site);
  const tracks = await getTracks();
  return finish(
    join(
      `# ${headingText(TRAINING_PAGE.hero)}`,
      TRAINING_PAGE.hero.lead(courseCount(tracks), tracks.length),
      bullets([waLink(TRAINING_ADVICE.cta, TRAINING_PAGE.askMessage), telLink()]),
      ...tracks.map((t, n) =>
        join(
          `## ${TRAINING_PAGE.trackEyebrow(n + 1)}: ${L.link(t.data.name, `/training/#${t.id}`)}`,
          t.data.intro,
          ...t.data.courses.map((c) =>
            join(
              `### ${L.link(c.name, coursePath(c.id))}`,
              c.summary,
              `${TRAINING_PAGE.learn}:`,
              bullets(c.topics),
              `${waLink(TRAINING_PAGE.enquire, TRAINING_PAGE.courseMessage(c.name))} · [Markdown](${L.url(mdPath(coursePath(c.id)))})`
            )
          )
        )
      ),
      `## ${TRAINING_PAGE.cta.title}`,
      TRAINING_PAGE.cta.text,
      bullets([waLink(TRAINING_ADVICE.cta, TRAINING_ADVICE.message), telLink()])
    )
  );
}

export async function courseMd(site: Site, course: Course) {
  const L = linker(site);
  const tracks = await getTracks();
  const n = tracks.findIndex((t) => t.id === course.track.id);
  // The training lead's closing sentence: how to get batch dates, timings and fees.
  const howToJoin = TRAINING_PAGE.hero.lead(courseCount(tracks), tracks.length).replace(/^.*\.\s+(?=[A-Z])/, "");
  const siblings = tracks[n]?.data.courses.filter((c) => c.id !== course.id) ?? [];
  return finish(
    join(
      `# ${course.name}`,
      `${course.summary} ${howToJoin}`,
      `${TRAINING_PAGE.trackEyebrow(n + 1)}: ${L.link(course.track.name, `/training/#${course.track.id}`)}. ${course.track.intro}`,
      `## ${TRAINING_PAGE.learn}`,
      bullets(course.topics),
      `${waLink(TRAINING_PAGE.enquire, TRAINING_PAGE.courseMessage(course.name))} · ${telLink()} · ${mailLink()}`,
      siblings.length > 0 && join(`## ${course.track.name}`, bullets(siblings.map((c) => `${L.page(c.name, coursePath(c.id))}: ${c.summary}`))),
      L.link(HOME.training.allLink, "/training/"),
      `## ${TRAINING_ADVICE.title}`,
      TRAINING_ADVICE.text,
      waLink(TRAINING_ADVICE.cta, TRAINING_ADVICE.message)
    )
  );
}

// --------------------------------------------------------- How we work ----

export async function howWeWorkMd(site: Site) {
  const L = linker(site);
  const faq = await getFaq();
  return finish(
    join(
      `# ${headingText(HOW_PAGE.hero)}`,
      HOW_PAGE.hero.lead,
      `## ${headingText(HOW_PAGE.process)}`,
      processBlock(),
      `## ${headingText(HOW_PAGE.principles)}`,
      bullets(HOW_PAGE.principles.items.map((p) => `**${p.title}**: ${p.text}`)),
      trustBlock(),
      engagementBlock(L, HOW_PAGE.engagement.intro),
      `## ${headingText(HOW_PAGE.faq)}`,
      faqBlock(faq),
      ctaBlock(L)
    )
  );
}

// ---------------------------------------------------------------- About ----

/** Plain facts, every one from src/data/site.ts. */
function factsList() {
  return bullets([
    `Legal name: ${SITE.legalName}`,
    `Alternate name: ${SITE.alternateName}`,
    ...PROMISES.map((p) => p.label),
    CONTACT_PAGE.basedIn,
    `Email: ${SITE.email}`,
    `Phone: ${SITE.phone}`,
    `WhatsApp: ${SITE.whatsappHref}`,
    ...SOCIAL.map((s) => `${s.label}: ${s.href}`),
  ]);
}

export async function aboutMd(site: Site) {
  const L = linker(site);
  return finish(
    join(
      `# ${headingText(ABOUT_PAGE.hero)}`,
      ABOUT_PAGE.hero.lead,
      `## ${headingText(ABOUT_PAGE.story)}`,
      ...ABOUT_PAGE.story.paragraphs,
      `## ${headingText(ABOUT_PAGE.values)}`,
      bullets(ABOUT_PAGE.values.items.map((v) => `**${v.title}**: ${v.text}`)),
      `## ${headingText(ABOUT_PAGE.where)}`,
      ABOUT_PAGE.where.intro,
      `## ${ABOUT_PAGE.facts.title}`,
      factsList(),
      ctaBlock(L)
    )
  );
}

// -------------------------------------------------------------- Contact ----

export async function contactMd(site: Site) {
  const L = linker(site);
  const f = CONTACT_PAGE.form;
  return finish(
    join(
      `# ${headingText(CONTACT_PAGE.hero)}`,
      CONTACT_PAGE.hero.lead,
      `## ${CONTACT_PAGE.direct}`,
      contactList(L),
      `${CONTACT_PAGE.alsoOn} ${SOCIAL.map((s) => `[${s.label}](${s.href})`).join(", ")}.`,
      CONTACT_PAGE.basedIn,
      `## ${CONTACT_PAGE.nextTitle}`,
      numbered(CONTACT_PAGE.next.map((s) => `**${s.title}**: ${s.text}`)),
      `## ${CONTACT_PAGE.formTitle}`,
      bullets([
        f.name,
        f.email,
        `${f.company} ${f.optional}`,
        `${f.country} ${f.optional}`,
        `${f.phone} ${f.optional}`,
        `${f.budget} ${f.optional}: ${BUDGETS.join(", ")}`,
        `${f.needs} ${NEEDS.map((n) => n.label).join(", ")}`,
        f.message,
      ]),
      f.privacy,
      `${f.preferEmail} ${mailLink()}.`
    )
  );
}

// ------------------------------------------------------------- Insights ----

export async function blogMd(site: Site) {
  const L = linker(site);
  const [blog, news] = await Promise.all([getBlog(), getNews()]);
  return finish(
    join(
      `# ${headingText(BLOG_PAGE.hero)}`,
      BLOG_PAGE.hero.lead,
      `## Guides`,
      ...blog.map((p) => join(`### ${p.data.title}`, postLine(L, p), postSummary(p))),
      `## ${headingText(BLOG_PAGE.news)}`,
      bullets(news.slice(0, 3).map((p) => newsLine(L, p))),
      L.link(BLOG_PAGE.news.all, "/news/"),
      ctaBlock(L, BLOG_PAGE.cta.title, BLOG_PAGE.cta.text)
    )
  );
}

export async function blogPostMd(site: Site, entry: BlogPost) {
  const L = linker(site);
  const d = entry.data;
  const [blog, services] = await Promise.all([getBlog(), getServices()]);
  // The practice this guide belongs to (services list their guides in relatedPosts).
  const service = services.find((s) => s.data.relatedPosts.some((p) => p.id === entry.id));
  const more = blog.filter((p) => p.id !== entry.id).slice(0, 3);
  // Descriptions were clipped with "…" on the old site, so the answer comes
  // from the opening of the article itself.
  const { lead, rest } = splitLead(body(entry.body));
  return finish(
    join(
      `# ${d.title}`,
      lead || d.description,
      `${BLOG_POST.card.updated} ${longDate(d.updated)} · ${d.readMinutes} min read · By ${d.author}`,
      rest,
      d.faq.length > 0 && join(`## ${BLOG_POST.faq}`, faqBlock(d.faq)),
      `## ${headingText(BLOG_POST.talk)}`,
      BLOG_POST.talk.text,
      bullets([
        L.link(BLOG_POST.talk.cta, SITE.bookingPath),
        ...(service ? [L.page(service.data.title, servicePath(service.id))] : []),
      ]),
      more.length > 0 && join(`## ${BLOG_POST.more.title}`, bullets(more.map((p) => postLine(L, p))), L.link(BLOG_POST.more.all, "/blog/")),
      ctaBlock(L)
    )
  );
}

export async function newsMd(site: Site) {
  const L = linker(site);
  const news = await getNews();
  return finish(
    join(
      `# ${headingText(NEWS_PAGE.hero)}`,
      NEWS_PAGE.hero.lead,
      bullets(news.map((p) => newsLine(L, p))),
      L.link(NEWS_PAGE.blogLink, "/blog/"),
      ctaBlock(L)
    )
  );
}

export async function newsPostMd(site: Site, entry: NewsPost) {
  const L = linker(site);
  const d = entry.data;
  const more = (await getNews()).filter((n) => n.id !== entry.id).slice(0, 4);
  const pf = NEWS_PAGE.postFooter;
  return finish(
    join(
      `# ${d.title}`,
      `${NEWS_PAGE.card.meta} · ${BLOG_POST.card.updated} ${d.dateLabel}`,
      body(entry.body) || d.description,
      `${L.link(pf.before, "/blog/")}${pf.middle}${L.link(pf.after, "/services/")}.`,
      more.length > 0 && join(`## ${NEWS_PAGE.more}`, bullets(more.map((p) => newsLine(L, p))), L.link(NEWS_PAGE.all, "/news/")),
      ctaBlock(L)
    )
  );
}

// ------------------------------------------------------ llms.txt family ----

/** Every page with a Markdown twin, in reading order (llms-full.txt, links). */
export async function markdownPages(site: Site): Promise<{ path: string; title: string; md: string }[]> {
  const [services, work, courses, blog, news] = await Promise.all([getServices(), getWork(), getCourses(), getBlog(), getNews()]);
  const pages: { path: string; title: string; build: () => Promise<string> }[] = [
    { path: "/", title: "Home", build: () => homeMd(site) },
    { path: "/services/", title: SERVICES_PAGE.meta.title, build: () => servicesMd(site) },
    ...services.map((s) => ({ path: servicePath(s.id), title: s.data.title, build: () => serviceMd(site, s) })),
    { path: "/how-we-work/", title: HOW_PAGE.meta.title, build: () => howWeWorkMd(site) },
    { path: "/about/", title: ABOUT_PAGE.meta.title, build: () => aboutMd(site) },
    { path: "/contact/", title: CONTACT_PAGE.meta.title, build: () => contactMd(site) },
    { path: "/industries/", title: INDUSTRIES_PAGE.meta.title, build: () => industriesMd(site) },
    { path: "/training/", title: TRAINING_PAGE.meta.title, build: () => trainingMd(site) },
    ...courses.map((c) => ({ path: coursePath(c.id), title: c.name, build: () => courseMd(site, c) })),
    { path: "/work/", title: WORK_PAGE.meta.title, build: () => workMd(site) },
    ...work.map((w) => ({ path: workPath(w.id), title: w.data.title, build: () => caseStudyMd(site, w) })),
    { path: "/blog/", title: BLOG_PAGE.meta.title, build: () => blogMd(site) },
    ...blog.map((p) => ({ path: blogPath(p.id), title: p.data.title, build: () => blogPostMd(site, p) })),
    { path: "/news/", title: NEWS_PAGE.meta.title, build: () => newsMd(site) },
    ...news.map((p) => ({ path: newsPath(p.id), title: p.data.title, build: () => newsPostMd(site, p) })),
  ];
  return Promise.all(pages.map(async (p) => ({ path: p.path, title: p.title, md: await p.build() })));
}

/** H1, summary and key facts shared by llms.txt and llms-full.txt. */
function llmsHeader(site: Site) {
  return join(
    `# ${SITE.name}`,
    `> ${SITE.description}`,
    SITE.tagline,
    bullets([`Legal name: ${SITE.legalName}`, `Alternate name: ${SITE.alternateName}`, `Website: ${absolute("/", site)}`])
  );
}

/** /llms.txt in the llmstxt.org format. */
export async function llmsTxt(site: Site) {
  const L = linker(site);
  const [services, industries, tracks, work, blog, news] = await Promise.all([
    getServices(),
    getIndustries(),
    getTracks(),
    getWork(),
    getBlog(),
    getNews(),
  ]);
  return finish(
    join(
      llmsHeader(site),

      `## About`,
      bullets([
        `${L.page(ABOUT_PAGE.meta.title, "/about/")}: ${ABOUT_PAGE.meta.description}`,
        `${L.page(HOW_PAGE.meta.title, "/how-we-work/")}: ${HOW_PAGE.meta.description}`,
        ...PROMISES.map((p) => p.label),
        CONTACT_PAGE.basedIn,
      ]),

      `## Services`,
      bullets([
        `${L.page(SERVICES_PAGE.meta.title, "/services/")}: ${SERVICES_PAGE.meta.description}`,
        ...services.map((s) => `${L.page(s.data.title, servicePath(s.id))}: ${s.data.summary}`),
      ]),

      `## Industries`,
      bullets([
        `${L.page(INDUSTRIES_PAGE.meta.title, "/industries/")}: ${INDUSTRIES_PAGE.meta.description}`,
        ...industries.map((i) => `${L.link(i.data.name, `/industries/#${i.id}`)}: ${i.data.summary}`),
      ]),

      `## Training`,
      `${L.page(TRAINING_PAGE.meta.title, "/training/")}: ${TRAINING_PAGE.meta.description(courseCount(tracks))}`,
      ...tracks.map((t) =>
        join(
          `### ${L.link(t.data.name, `/training/#${t.id}`)}`,
          t.data.intro,
          bullets(t.data.courses.map((c) => `${L.page(c.name, coursePath(c.id))}: ${c.summary}`))
        )
      ),

      `## Engagement models`,
      bullets([
        ...ENGAGEMENT_MODELS.map((m) => `**${m.name}** (${m.fit}): ${m.points.join("; ")}`),
        `${L.page(HOME.process.link, "/how-we-work/")}: ${HOME.process.text}`,
      ]),

      `## Case studies`,
      bullets([
        `${L.page(WORK_PAGE.meta.title, "/work/")}: ${WORK_PAGE.meta.description}`,
        ...work.map((w) => `${L.page(w.data.title, workPath(w.id))}: ${w.data.delivered}`),
      ]),

      `## Insights`,
      bullets([
        `${L.page(BLOG_PAGE.meta.title, "/blog/")}: ${BLOG_PAGE.meta.description}`,
        ...blog.map((p) => `${L.page(p.data.title, blogPath(p.id))}: ${postSummary(p)} (${BLOG_POST.card.updated} ${longDate(p.data.updated)})`),
        `${L.page(NEWS_PAGE.meta.title, "/news/")}: ${NEWS_PAGE.meta.description}`,
        ...news.map((p) => `${L.page(p.data.title, newsPath(p.id))}: ${p.data.dateLabel}. ${p.data.description}`),
      ]),

      `## How to contact`,
      bullets([
        `Email: ${mailLink()}`,
        `Phone: ${SITE.phoneIntl}`,
        `WhatsApp: ${SITE.whatsappHref}`,
        `${CTA.primary}: ${L.url(SITE.bookingPath)}`,
        `${L.page(CONTACT_PAGE.meta.title, "/contact/")}: ${CONTACT_PAGE.meta.description}`,
      ]),

      `## Optional`,
      bullets([
        `[llms-full.txt](${L.url("/llms-full.txt")}): the full text of the main pages in one file`,
        `[Home page (Markdown)](${L.url(mdPath("/"))}): ${HOME.meta.description}`,
        `[Sitemap](${L.url("/sitemap-index.xml")})`,
      ])
    )
  );
}

/** /llms-full.txt: the llms.txt header, then every main page in full. */
export async function llmsFullTxt(site: Site) {
  const L = linker(site);
  // Index pages for blog and news only list posts; the posts themselves follow.
  const pages = (await markdownPages(site)).filter((p) => p.path !== "/blog/" && p.path !== "/news/");
  return finish(
    join(
      llmsHeader(site),
      ...pages.map((p) => join("---", `Source: ${L.url(p.path)}`, p.md.trim()))
    )
  );
}

// ------------------------------------------------------------ Responses ----

export const markdownResponse = (md: string) =>
  new Response(md, { headers: { "Content-Type": "text/markdown; charset=utf-8" } });

export const textResponse = (text: string) =>
  new Response(text, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
