// Single source of truth for company facts. Pages, JSON-LD, llms.txt and the
// .md page versions all read from here, so every fact is worded the same way
// everywhere. Only facts supplied by Winapps (carried over from V1) belong
// here. Never add invented figures.

export const SITE = {
  name: "Winapps",
  /** Brand spelling used by the new design (logo, wordmark). */
  alternateName: "WinApps",
  legalName: "Winapps Software Solutions Pvt. Ltd.",
  tagline: "Senior engineers for software that has to work.",
  description:
    "Winapps is a software engineering partner to companies in India, the US, the UK and Europe since 2013: AI & machine learning, web and mobile products, cloud, modernization and dedicated teams.",
  founded: 2013,
  country: "India",
  areaServed: ["India", "United States", "United Kingdom", "Europe"],
  regionsText: "India, the US, the UK and Europe",
  /** New projects and quotes: the default address everywhere. */
  email: "sales@winapps.co.in",
  /** General enquiries, privacy and legal questions. */
  emailInfo: "info@winapps.co.in",
  /** Training courses: batches, timings and fees. */
  emailTraining: "training@winapps.co.in",
  // Non-breaking spaces keep the number on one line.
  phone: "+91 70157 96830",
  /** schema.org / llms.txt form */
  phoneIntl: "+91-70157-96830",
  phoneHref: "tel:+917015796830",
  whatsappHref: "https://wa.me/917015796830",
  /** Where every "Book a call" button goes (V1 had no external booking tool). */
  bookingPath: "/contact/",
  linkedin: "https://www.linkedin.com/company/winapps.co.in/",
  instagram: "https://www.instagram.com/winapps_software/",
  facebook: "https://www.facebook.com/profile.php?id=100063887836935",
  // TODO(Winapps): registered office address. V1 never published one, so it
  // stays null until supplied. JSON-LD then carries the country only.
  address: null as null | { street: string; city: string; region: string; postalCode: string; country: string },
} as const;

/** Every published address, labelled for the contact page, footer and llms.txt. */
export const EMAILS = [
  { label: "New projects", address: SITE.email },
  { label: "General enquiries", address: SITE.emailInfo },
  { label: "Training", address: SITE.emailTraining },
] as const;

export const SOCIAL = [
  { label: "LinkedIn", href: SITE.linkedin },
  { label: "Instagram", href: SITE.instagram },
  { label: "Facebook", href: SITE.facebook },
] as const;

// Primary navigation (header). Items with `menu` open a dropdown built from
// the content collections; `href` is where the item itself leads.
export const NAV = [
  { label: "What we do", href: "/services/", menu: "what-we-do" },
  { label: "Work", href: "/work/" },
  { label: "AI", href: "/ai/" },
  { label: "How we work", href: "/how-we-work/" },
  { label: "Insights", href: "/blog/", menu: "insights" },
  { label: "About", href: "/about/" },
  { label: "Training", href: "/training/", menu: "training" },
] as const;

export const INSIGHTS = [
  { label: "Blog", href: "/blog/", text: "Guides on costs, AI and logistics software." },
  { label: "News", href: "/news/", text: "Short updates on where the industry is heading." },
] as const;

/** "Site links" group of the MENU overlay (V1's mobile drawer). */
export const MENU_LINKS = [
  { label: "Industries", href: "/industries/" },
  { label: "Work", href: "/work/" },
  { label: "AI", href: "/ai/" },
  { label: "How we work", href: "/how-we-work/" },
  { label: "Blog", href: "/blog/" },
  { label: "News", href: "/news/" },
  { label: "About", href: "/about/" },
  { label: "Contact", href: "/contact/" },
] as const;

export const FOOTER = {
  explore: [
    { label: "Work", href: "/work/" },
    { label: "AI", href: "/ai/" },
    { label: "Industries", href: "/industries/" },
    { label: "How we work", href: "/how-we-work/" },
    { label: "Blog", href: "/blog/" },
    { label: "News", href: "/news/" },
  ],
  company: [
    { label: "About", href: "/about/" },
    { label: "Contact", href: "/contact/" },
  ],
  legal: [
    { label: "Privacy", href: "/privacy/" },
    { label: "Terms", href: "/terms/" },
    { label: "Disclaimer", href: "/disclaimer/" },
  ],
  blurb: `Senior software engineering partner to companies in India, the US, the UK and Europe. Est. 2013.`,
} as const;

// "What do you need?" options on the contact form, keyed to the practice they
// belong to. Links like /contact/?interest=AI%20%2F%20ML pre-select one.
export const NEEDS = [
  { label: "AI / ML", service: "ai-ml" },
  { label: "Web or mobile product", service: "product-engineering" },
  { label: "Cloud", service: "cloud-platform" },
  { label: "Modernization", service: "legacy-modernization" },
  { label: "Data & analytics", service: "data-analytics" },
  { label: "Dedicated team", service: "dedicated-teams" },
] as const;

export const BUDGETS = ["Not sure yet", "$5,000 – $10,000", "$10,000 – $25,000", "$25,000 – $50,000", "$50,000+"] as const;

export const COUNTRIES = ["United States", "United Kingdom", "Germany", "Netherlands", "Sweden", "France", "Other in Europe", "India", "Other"] as const;

/** WhatsApp chat link with the first message already typed. */
export function whatsappFor(message: string): string {
  return `${SITE.whatsappHref}?text=${encodeURIComponent(message)}`;
}

/** Contact page link that pre-selects the need for a practice. */
export function contactFor(serviceId: string): string {
  const need = NEEDS.find((n) => n.service === serviceId);
  return need ? `/contact/?interest=${encodeURIComponent(need.label)}` : "/contact/";
}

/** The four commitments in the home trust strip. */
export const PROMISES = [
  { icon: "calendar", label: "Est. 2013" },
  { icon: "file-lock", label: "NDA before the first call" },
  { icon: "clock", label: "Reply within 1 business day" },
  { icon: "key-round", label: "Your IP from day one" },
] as const;

export const STACK = {
  Languages: ["Python", "TypeScript", "Go", "Swift", "Kotlin"],
  "Web & mobile": ["React", "Next.js", "Node.js", "Flutter"],
  "AI & data": ["PyTorch", "LangGraph", "PostgreSQL", "Kafka"],
  "Cloud & platform": ["AWS", "Azure", "GCP", "Kubernetes", "Terraform"],
} as const;

/** Short labels for the practices (V1 home "practice stack" pills). */
export const PRACTICE_LABELS: Record<string, string> = {
  "ai-ml": "AI",
  "product-engineering": "Product",
  "cloud-platform": "Cloud",
  "legacy-modernization": "Modernize",
  "data-analytics": "Data",
  "dedicated-teams": "Teams",
};
