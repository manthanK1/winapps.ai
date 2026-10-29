import { defineCollection, reference } from "astro:content";
import { file, glob } from "astro/loaders";
import { z } from "astro/zod";
import { existsSync, readdirSync } from "node:fs";
import { TECH_LOGO_KEYS } from "./lib/tech-logos";

// Content lives in src/content/. Edit the Markdown/YAML files there; the
// schemas below catch missing or misspelled fields at build time.

const iconName = z.string();

// Collections that stay empty until Winapps supplies real, approved entries
// (testimonials, client logos, team). Files starting with "_" are templates.
// While a folder has no real entries this loader does nothing, so the build
// stays warning-free; the sections that use them render only when filled.
function optionalGlob(opts: { pattern: string; base: string }) {
  const hasEntries = existsSync(opts.base) && readdirSync(opts.base).some((f) => f.endsWith(".md") && !f.startsWith("_"));
  return hasEntries ? glob(opts) : { name: "optional-glob-empty", load: async () => {} };
}

const services = defineCollection({
  loader: glob({ pattern: "*.md", base: "./src/content/services" }),
  schema: z.object({
    title: z.string(),
    order: z.number(),
    icon: iconName,
    tagline: z.string(), // accent second line of two-tone headings, e.g. "shipped every two weeks."
    summary: z.string(), // one line under the title
    outcome: z.string(), // "What you get" headline outcome
    deliverables: z.array(z.string()).min(1),
    delivery: z.array(z.object({ title: z.string(), text: z.string() })).min(1),
    tech: z.array(z.string()),
    relatedWork: reference("work").optional(),
    relatedPosts: z.array(reference("blog")).default([]), // "Related guides" on the service page
    faq: z.array(z.object({ question: z.string(), answer: z.string() })).default([]),
    seoDescription: z.string().max(170),
  }),
});

const work = defineCollection({
  loader: glob({ pattern: "*.md", base: "./src/content/work" }),
  schema: ({ image }) => z.object({
    title: z.string(),
    order: z.number(),
    // Illustrative sector photo (not the client's premises). See CREDITS.md.
    image: image(),
    imageAlt: z.string(),
    sector: z.string(),
    region: z.string().optional(),
    disciplines: z.array(z.string()),
    problem: z.string(),
    delivered: z.string(),
    stack: z.array(z.string()),
    services: z.array(reference("services")).default([]),
    architecture: z.array(z.object({ layer: z.string(), nodes: z.array(z.string()) })),
    // Leave null until client-approved outcome metrics are available.
    results: z.array(z.object({ value: z.string(), label: z.string() })).nullable().default(null),
    seoDescription: z.string().max(170),
  }),
});

const faq = defineCollection({
  loader: file("src/content/faq.yaml"),
  schema: z.object({ question: z.string(), answer: z.string(), order: z.number() }),
});

const industries = defineCollection({
  loader: file("src/content/industries.yaml"),
  schema: ({ image }) => z.object({
    name: z.string(),
    order: z.number(),
    icon: iconName,
    image: image(),
    imageAlt: z.string(),
    summary: z.string(),
    focus: z.array(z.string()),
    relatedWork: z.array(reference("work")).default([]),
  }),
});

// Training tracks, each with its courses. A logo key not in
// src/lib/tech-logos.ts fails the build.
const techLogo = z.enum(TECH_LOGO_KEYS);
const training = defineCollection({
  loader: file("src/content/training.yaml"),
  schema: z.object({
    name: z.string(),
    order: z.number(),
    intro: z.string(),
    logos: z.array(techLogo).min(1),
    courses: z.array(z.object({
      id: z.string().regex(/^[a-z0-9-]+$/),
      name: z.string(),
      logos: z.array(techLogo).min(1),
      summary: z.string(),
      topics: z.array(z.string()).min(3),
    })).min(1),
  }),
});

// Real quotes only, with written permission. Files starting with "_" are ignored.
const testimonials = defineCollection({
  loader: optionalGlob({ pattern: "[!_]*.md", base: "./src/content/testimonials" }),
  schema: z.object({
    quote: z.string(),
    name: z.string(),
    role: z.string(),
    company: z.string(),
    permissionConfirmed: z.literal(true),
  }),
});

// Real client logos only, with written permission.
const clients = defineCollection({
  loader: optionalGlob({ pattern: "[!_]*.md", base: "./src/content/clients" }),
  schema: ({ image }) =>
    z.object({
      name: z.string(),
      logo: image(),
      permissionConfirmed: z.literal(true),
    }),
});

// Leadership for the About page. Real people and photos only.
const team = defineCollection({
  loader: optionalGlob({ pattern: "[!_]*.md", base: "./src/content/team" }),
  schema: ({ image }) =>
    z.object({
      name: z.string(),
      role: z.string(),
      order: z.number(),
      photo: image().optional(),
      linkedin: z.url().optional(),
    }),
});

// Blog and news posts migrated from www.winapps.co.in. File names are the live
// URL slugs, so /blog/<slug>/ and /news/<slug>/ keep working after the switch.
const blog = defineCollection({
  loader: glob({ pattern: "[!_]*.md", base: "./src/content/blog" }),
  schema: z.object({
    title: z.string(),
    description: z.string().max(170),
    updated: z.coerce.date(),
    readMinutes: z.number(),
    author: z.string(),
    faq: z.array(z.object({ question: z.string(), answer: z.string() })).default([]),
  }),
});

const news = defineCollection({
  loader: glob({ pattern: "[!_]*.md", base: "./src/content/news" }),
  schema: z.object({
    title: z.string(),
    description: z.string().max(170),
    date: z.coerce.date(),
    dateLabel: z.string(), // as published, e.g. "Feb 2026"
  }),
});

export const collections = { services, work, faq, industries, training, testimonials, clients, team, blog, news };
