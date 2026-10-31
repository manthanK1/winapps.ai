// schema.org JSON-LD builders. Every value comes from src/data/site.ts or the
// content collections, i.e. from text that is also visible on the page.
// Never add reviews, ratings, prices or claims that aren't on the site.
import { SITE } from "../data/site";
import { absolute } from "./url";

type Site = URL | undefined;

export const orgId = (site: Site) => absolute("/", site) + "#organization";
export const websiteId = (site: Site) => absolute("/", site) + "#website";
const orgRef = (site: Site) => ({ "@id": orgId(site) });

const AREA_SERVED = [
  { "@type": "Country", name: "India" },
  { "@type": "Country", name: "United States" },
  { "@type": "Country", name: "United Kingdom" },
  { "@type": "Continent", name: "Europe" },
];

export function contactPoints() {
  return [
    {
      "@type": "ContactPoint",
      contactType: "sales",
      email: SITE.email,
      telephone: SITE.phoneIntl,
      areaServed: ["IN", "US", "GB", "EU"],
      availableLanguage: ["English"],
    },
    {
      "@type": "ContactPoint",
      contactType: "sales",
      name: "WhatsApp",
      url: SITE.whatsappHref,
      telephone: SITE.phoneIntl,
      availableLanguage: ["English"],
    },
    {
      "@type": "ContactPoint",
      contactType: "customer service",
      email: SITE.emailInfo,
      availableLanguage: ["English"],
    },
    {
      "@type": "ContactPoint",
      contactType: "training enquiries",
      email: SITE.emailTraining,
      telephone: SITE.phoneIntl,
      availableLanguage: ["English"],
    },
  ];
}

/** Organization + ProfessionalService, on every page. */
export function organization(site: Site, logoUrl: string, imageUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": ["Organization", "ProfessionalService"],
    "@id": orgId(site),
    name: SITE.legalName,
    alternateName: [SITE.alternateName, SITE.name],
    url: absolute("/", site),
    logo: { "@type": "ImageObject", url: logoUrl, width: 512, height: 512 },
    image: imageUrl,
    description: SITE.description,
    slogan: SITE.tagline,
    foundingDate: String(SITE.founded),
    foundingLocation: { "@type": "Country", name: SITE.country },
    email: SITE.email,
    telephone: SITE.phoneIntl,
    address: SITE.address
      ? { "@type": "PostalAddress", ...SITE.address }
      : { "@type": "PostalAddress", addressCountry: "IN" },
    areaServed: AREA_SERVED,
    contactPoint: contactPoints(),
    sameAs: [SITE.linkedin, SITE.instagram, SITE.facebook],
  };
}

export function website(site: Site) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": websiteId(site),
    url: absolute("/", site),
    name: `${SITE.name}®`,
    alternateName: [SITE.alternateName, SITE.legalName],
    description: SITE.description,
    inLanguage: "en-GB",
    publisher: orgRef(site),
  };
}

export type WebPageType = "WebPage" | "AboutPage" | "ContactPage" | "CollectionPage" | "ItemPage";

export function webPage(
  site: Site,
  p: { type?: WebPageType; name: string; description: string; path: string; dateModified?: Date; extra?: object }
) {
  const url = absolute(p.path, site);
  return {
    "@context": "https://schema.org",
    "@type": p.type ?? "WebPage",
    "@id": url + "#webpage",
    url,
    name: p.name,
    description: p.description,
    inLanguage: "en-GB",
    isPartOf: { "@id": websiteId(site) },
    about: orgRef(site),
    publisher: orgRef(site),
    ...(p.dateModified ? { dateModified: p.dateModified.toISOString().slice(0, 10) } : {}),
    ...(p.extra ?? {}),
  };
}

export function breadcrumbs(site: Site, items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: absolute(item.path, site),
    })),
  };
}

/** Text must be identical to the visible FAQ on the same page. */
export function faqPage(items: readonly { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };
}

export function service(site: Site, s: { name: string; description: string; path: string; deliverables?: readonly string[] }) {
  const url = absolute(s.path, site);
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": url + "#service",
    name: s.name,
    serviceType: s.name,
    description: s.description,
    url,
    provider: orgRef(site),
    areaServed: AREA_SERVED,
    ...(s.deliverables?.length
      ? {
          hasOfferCatalog: {
            "@type": "OfferCatalog",
            name: `What you get: ${s.name}`,
            itemListElement: s.deliverables.map((d) => ({ "@type": "Offer", itemOffered: { "@type": "Service", name: d } })),
          },
        }
      : {}),
  };
}

type CourseInput = { id: string; name: string; summary: string; topics: readonly string[]; track: { name: string } };

export const coursePath = (id: string) => `/training/${id}/`;

/**
 * Course + CourseInstance. No price, schedule or course mode: V1 publishes
 * none (people enquire on WhatsApp). TODO(Winapps): add courseMode and
 * schedule once confirmed, then they can go here.
 */
export function course(site: Site, c: CourseInput) {
  const url = absolute(coursePath(c.id), site);
  return {
    "@context": "https://schema.org",
    "@type": "Course",
    "@id": url + "#course",
    name: c.name,
    description: c.summary,
    url,
    teaches: [...c.topics],
    // The training track is a subject area, not an educationalLevel (beginner, advanced…).
    about: { "@type": "Thing", name: c.track.name },
    provider: { "@type": "Organization", "@id": orgId(site), name: SITE.legalName, sameAs: absolute("/", site) },
    hasCourseInstance: {
      "@type": "CourseInstance",
      name: c.name,
      url,
      organizer: orgRef(site),
    },
  };
}

/** ItemList of courses for the training index (course carousel markup). */
export function courseList(site: Site, courses: readonly CourseInput[]) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Winapps training courses",
    itemListElement: courses.map((c, i) => {
      const { "@context": _ctx, ...item } = course(site, c);
      return { "@type": "ListItem", position: i + 1, item };
    }),
  };
}

export function article(
  site: Site,
  a: {
    type: "BlogPosting" | "NewsArticle";
    headline: string;
    description: string;
    path: string;
    datePublished: Date;
    dateModified?: Date;
    author?: string;
    imageUrl: string;
  }
) {
  const url = absolute(a.path, site);
  const day = (d: Date) => d.toISOString().slice(0, 10);
  return {
    "@context": "https://schema.org",
    "@type": a.type,
    "@id": url + "#article",
    headline: a.headline.length > 110 ? a.headline.slice(0, 109) + "…" : a.headline,
    description: a.description,
    url,
    mainEntityOfPage: { "@id": url + "#webpage" },
    image: [a.imageUrl],
    datePublished: day(a.datePublished),
    dateModified: day(a.dateModified ?? a.datePublished),
    inLanguage: "en-GB",
    author: a.author ? { "@type": "Person", name: a.author, worksFor: orgRef(site) } : orgRef(site),
    publisher: orgRef(site),
  };
}

/** ContactPage with the organisation's contact points (sales, WhatsApp). */
export function contactPage(site: Site, p: { name: string; description: string; path: string }) {
  return webPage(site, {
    type: "ContactPage",
    ...p,
    extra: {
      mainEntity: { "@type": "Organization", "@id": orgId(site), name: SITE.legalName, contactPoint: contactPoints() },
    },
  });
}
