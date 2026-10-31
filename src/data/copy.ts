// Page-level copy, carried over word for word from V1 (manthank1/winapps-website,
// src/pages/*.astro and src/components/*.astro). Collections in src/content/
// hold the rest. Pages, llms-full.txt and the .md page versions read from
// here, so the visible text and the AI-facing text never drift apart.
//
// Titles are split into `title` + `accent`: V1's two-tone headings. The new
// design sets both in ink; keep them as one sentence when quoting.

import { SITE } from "./site";

export type Heading = { eyebrow?: string; title: string; accent?: string; intro?: string };
export type PageMeta = { title: string; description: string };

/** Join a two-part heading into plain text. */
export const headingText = (h: { title: string; accent?: string }) => (h.accent ? `${h.title} ${h.accent}` : h.title);

// ---------------------------------------------------------------- Home ----

export const HOME = {
  meta: {
    title: SITE.name,
    description:
      "Senior engineers for software that has to work. Winapps builds AI, web and mobile products, cloud platforms and modernization for companies in India, the US, the UK and Europe. Est. 2013.",
  },
  hero: {
    eyebrow: `Software engineering partner since ${SITE.founded}`,
    title: "Senior engineers for software that has to work.",
    lead: "We design, build and scale AI systems, web and mobile products and cloud platforms for companies in India, the US, the UK and Europe.",
    primary: { label: "Book a 30-min intro call", href: "/contact/" },
    secondary: { label: "See our work", href: "/work/" },
    whatsappNote: "or message us on",
  },
  // V1's intro panel heading, above the trust strip.
  intro: {
    // Rendered with the two <strong> phrases in bold.
    before: `Since ${SITE.founded}, senior engineers for companies in `,
    strong1: "India, the US, the UK and Europe",
    middle: ". Six practices, one standard, and ",
    strong2: "every commitment in writing",
    after: ".",
  },
  practices: {
    eyebrow: "What we do",
    title: "Six practices.",
    accent: "One standard of engineering.",
    intro: "We stay narrow on purpose. Each practice is run by people who have shipped it in production, more than once.",
    allLink: "All services",
  },
  build: {
    title: "What do you want to build?",
    label: "Describe what you want to build",
    placeholder: "For example: replace our dispatch spreadsheets with a real-time app for drivers and customers",
    legend: "What does it involve? (optional)",
    submitLabel: "Continue to the contact form",
    note: "Continues to the contact form with this filled in. Nothing is sent yet.",
  },
  training: {
    eyebrow: "Training",
    title: "Learn the skills",
    accent: "teams hire for.",
    intro: (courseCount: number) =>
      `${courseCount} hands-on courses, from Python and AI to cloud, mobile apps, testing and digital marketing.`,
    allLink: "See all courses",
  },
  work: {
    eyebrow: "Selected work",
    title: "Problems we've been",
    accent: "trusted with.",
    intro: "Our clients are under NDA, so we describe the work without naming them. We share specifics and references on a call.",
    allLink: "All case studies",
  },
  process: {
    eyebrow: "How we work",
    title: "Low-risk to start.",
    accent: "Predictable to scale.",
    text: "Most clients start with a fixed-fee Discovery, then move to a dedicated pod.",
    link: "How we work in detail",
  },
  engagement: {
    eyebrow: "Engagement models",
    title: "Pick how we",
    accent: "work together.",
    intro: "Clear terms, no lock-in. Every model starts with the same senior engineers and the same commitments.",
  },
  tech: {
    eyebrow: "Technology",
    title: "Tools we use",
    accent: "in production.",
    text: "Languages, frameworks and platforms our engineers work with in production.",
  },
  insights: {
    eyebrow: "Insights",
    title: "Latest guides",
    accent: "and news.",
    allLink: "All insights",
  },
  faq: {
    eyebrow: "Questions",
    title: "What buyers",
    accent: "usually ask.",
    somethingElse: "Something else?",
  },
} as const;

// ------------------------------------------------------- Shared sections ----

/** Training advice block (home training section + training page). */
export const TRAINING_ADVICE = {
  title: "Not sure where to start?",
  text: "Tell us what you know today and where you want to get to. We'll suggest a course and share batch dates, timings and fees.",
  cta: "Ask on WhatsApp",
  message: "Hi, I'd like help choosing a training course.",
} as const;

/** Discovery → Build → Launch & scale (V1 ProcessTimeline). */
export const PROCESS_STEPS = [
  {
    title: "Discovery",
    time: "1–2 weeks · fixed fee",
    text: "We map the problem, the risks and the architecture, and give you a plan and estimate you can take to any vendor.",
    more: ["Problem and success criteria agreed in writing", "Architecture and risk review", "Plan and estimate you own, whoever builds it"],
  },
  {
    title: "Build",
    time: "2-week sprints",
    text: "Working software every sprint, demoed live in your time zone. Shared backlog, your tools, transparent burn against budget.",
    more: ["Live demo at the end of every sprint", "Code in your repositories from the first commit", "Spend tracked against budget, openly"],
  },
  {
    title: "Launch & scale",
    time: "Ongoing",
    text: "Production rollout, monitoring and SLAs. Then we keep evolving the product, or hand over cleanly to your team, with docs.",
    more: ["Production rollout with monitoring", "SLAs agreed up front", "Documented handover whenever you want it"],
  },
] as const;

/** "Why teams trust us" (V1 TrustSection). */
export const TRUST = {
  eyebrow: "Why teams trust us",
  title: "Low risk is designed in,",
  accent: "not promised.",
  intro: "The commitments that procurement, legal and engineering teams ask about first, written into how we work.",
  commitments: [
    { icon: "key-round", title: "You own the code and IP", text: "Full IP assignment in every contract. Code lives in your repositories from day one." },
    { icon: "lock", title: "GDPR-aligned, DPA on request", text: "We work in your environments, with access you grant and revoke, and keep production personal data off local machines." },
    { icon: "shield-check", title: "Security as a baseline", text: "Least-privilege access, client-managed credentials, encrypted devices and offboarding checklists on every project." },
    { icon: "user-check", title: "You approve every engineer", text: "See profiles, run your own interviews, and replace anyone who isn't the right fit at no cost." },
    { icon: "globe", title: "Real time-zone overlap", text: "Standups, reviews and demos happen live in your working hours. The rest is written down and async." },
  ],
} as const;

/** Live working-hours clocks (V1 Clocks). TODO(Winapps): confirm delivery teams work 11:00–20:00 IST. */
export const CLOCKS = {
  title: "Working hours, live",
  overlapBadge: "4+ hours overlap with Europe",
  online: "Team online now",
  offline: "Replies next business day",
  zones: [
    { city: "New York", tz: "America/New_York", home: false },
    { city: "London", tz: "Europe/London", home: false },
    { city: "Berlin", tz: "Europe/Berlin", home: false },
    { city: "Winapps, India", tz: "Asia/Kolkata", home: true },
  ],
  /** Client cities show 09:00–18:00; the Winapps row the shifted 11:00–20:00 IST day. */
  homeHours: [11, 20],
  clientHours: [9, 18],
  note: {
    before: "Bars show each city's working day. Our teams shift their hours to keep ",
    strong1: "4+ hours of overlap",
    middle: " with Central Europe and ",
    strong2: "3–4 hours",
    after: " with US Eastern.",
  },
} as const;

/** Engagement models (V1 EngagementModels). Dedicated pod is the featured one. */
export const ENGAGEMENT_MODELS = [
  {
    name: "Fixed-scope project",
    fit: "Best for a well-defined product or MVP",
    points: ["Fixed price and timeline after Discovery", "Milestone-based payments", "30-day warranty after launch"],
    cta: "Discuss a project",
    featured: false,
  },
  {
    name: "Dedicated pod",
    fit: "Best for an evolving roadmap",
    points: ["3–8 engineers, a tech lead and QA", "Monthly rolling contract, 30 days' notice", "You approve every team member", "Monthly report on delivery and spend"],
    cta: "Build a pod",
    featured: true,
  },
  {
    name: "Team extension",
    fit: "Best for filling specific skills fast",
    points: ["Individual senior engineers", "Work inside your team and processes", "Start in as little as 2 weeks"],
    cta: "Extend your team",
    featured: false,
  },
] as const;
export const ENGAGEMENT_BADGE = "Most chosen";
export const ENGAGEMENT_REPLY = "Reply within 1 business day";

/** Closing call to action on every page (V1 CtaBand). */
export const CTA = {
  title: "Tell us what you're building.",
  text: "A senior engineer, not a salesperson, replies within one business day. NDA available before any detailed discussion.",
  primary: "Book a 30-min intro call",
  email: "Email us",
  // "Or message us on WhatsApp, or call +91 70157 96830."
  alt: { before: "Or message us on", whatsapp: "WhatsApp", middle: ", or call", after: "." },
} as const;

// ---------------------------------------------------------- Inner pages ----

export const SERVICES_PAGE = {
  meta: {
    title: "Services",
    description:
      "AI & machine learning, product engineering, cloud & platform, legacy modernization, data & analytics and dedicated teams, delivered by senior engineers.",
  },
  hero: {
    eyebrow: "Services",
    title: "Six practices,",
    accent: "one standard of engineering.",
    lead: "We stay narrow on purpose. Each practice is run by people who have shipped it in production, more than once, and every engagement comes with the same commitments on IP, security and time-zone overlap.",
  },
  whatYouGet: "What you get",
  explore: "Explore the practice",
} as const;

/** Service detail page labels (V1 services/[slug].astro). */
export const SERVICE_DETAIL = {
  eyebrow: "Service",
  cta: "Book a 30-min intro call",
  reply: "Reply within 1 business day",
  whatItIs: "What it is",
  whatYouGet: "What you get",
  deliver: { eyebrow: "How we deliver", title: "Small, verified steps.", accent: "Your tools, your time zone." },
  relatedCase: "Related case study",
  tech: "Technology we use",
  techNote: "We work in your cloud accounts and repositories, with access you grant and can revoke.",
  guides: { eyebrow: "Related guides", title: "Read before", accent: "you scope it.", all: "All guides" },
  faqEyebrow: "Questions",
  faqTitle: (title: string) => `About ${title.toLowerCase()}`,
  // Opening answer for AI assistants / featured snippets. Built only from V1
  // wording: summary + outcome + V1's "how to start" line.
  startLine: "Most clients start with a fixed-fee Discovery, then move to a dedicated pod.",
} as const;

export const WORK_PAGE = {
  meta: {
    title: "Work",
    description:
      "Selected case studies: mobile, AI, cloud modernization and real-time platforms for companies in the UK, India and worldwide. Clients are under NDA.",
  },
  hero: {
    eyebrow: "Selected work",
    title: "Problems we've been",
    accent: "trusted with.",
    lead: "Most of our clients are under NDA, so we describe the work without naming them. We share specifics, architecture and references on a call.",
  },
  cta: {
    title: "Want the details behind these?",
    text: "We walk through architecture, team shape and references on a call, under NDA if you need one. A senior engineer replies within one business day.",
  },
  card: { problem: "Problem", delivered: "What we delivered", read: "Read the case study" },
} as const;

export const WORK_DETAIL = {
  sector: "Sector",
  region: "Region",
  disciplines: "Disciplines",
  practices: "Practices",
  client: "Client",
  clientText: "Under NDA. References available on a call.",
  photoCaption: "Illustrative photo. Client details are under NDA.",
  architecture: "Architecture",
  architectureCaption: "Illustrative architecture, simplified to protect client confidentiality.",
  results: "Results",
  resultsFallback:
    "Outcome details for this engagement are shared under NDA. We're happy to walk through results and put you in touch with a reference on a call.",
  stack: "Stack",
  next: "Next case study",
  cta: { title: "Facing something similar?" },
} as const;

export const INDUSTRIES_PAGE = {
  meta: {
    title: "Industries",
    description:
      "Software engineering for healthcare, fintech, manufacturing, logistics, retail, media, education and travel companies in India, the US, the UK and Europe.",
  },
  hero: {
    eyebrow: "Industries",
    title: "Domains",
    accent: "we know well.",
    lead: "Every industry brings its own constraints: regulation, uptime, data sensitivity, peak load. We bring engineers who have worked within them.",
  },
  caseStudy: "Case study:",
  discuss: (name: string) => `Discuss a ${name.toLowerCase()} project`,
  cta: { title: "Working in a regulated or high-stakes domain?" },
} as const;

export const TRAINING_PAGE = {
  meta: {
    title: "Training",
    description: (courseCount: number) =>
      `Hands-on training in ${courseCount} courses: AI & ML, Python, MERN, Java, .NET, PHP, Flutter, iOS & Android, Unity, cloud, AWS DevOps, QA testing and digital marketing.`,
  },
  hero: {
    eyebrow: "Training",
    title: "Practical training",
    accent: "in the skills teams hire for.",
    lead: (courseCount: number, trackCount: number) =>
      `${courseCount} courses in ${trackCount} tracks, from Python and AI to cloud, mobile apps, testing and digital marketing. Pick a course and message us on WhatsApp for the next batch, timings and fees.`,
  },
  askMessage: "Hi, I'd like to know about your training courses.",
  trackEyebrow: (n: number) => `Track 0${n}`,
  learn: "What you'll learn",
  enquire: "Enquire on WhatsApp",
  courseMessage: (name: string) => `Hi, I'm interested in the ${name} training. Could you share the next batch, timings and fees?`,
  cta: {
    title: "Not sure which course fits?",
    text: "Tell us what you know today and where you want to get to. We'll suggest a starting point and share batch dates, timings and fees.",
  },
} as const;

export const HOW_PAGE = {
  meta: {
    title: "How we work",
    description:
      "Discovery, two-week build sprints and launch: how Winapps delivers, the engagement models we offer, and our commitments on IP, GDPR and security.",
  },
  hero: {
    eyebrow: "How we work",
    title: "Low-risk to start.",
    accent: "Predictable to scale.",
    lead: "A fixed-fee Discovery, working software every two weeks, and a clean handover whenever you want one. Here is exactly how an engagement runs.",
  },
  process: { eyebrow: "Process", title: "Three phases,", accent: "no surprises." },
  principles: {
    eyebrow: "Principles",
    title: "How our",
    accent: "engineers work.",
    // TODO(Winapps): confirm "8+ years" is true for every engagement lead.
    items: [
      { title: "Senior by default", text: "Every engagement is led by an engineer with 8+ years of experience. No bait-and-switch after the sales call." },
      { title: "Written communication", text: "Decisions, trade-offs and status are written down. Async-first, so time zones help rather than hurt." },
      { title: "Security as a baseline", text: "Least-privilege access, client-managed credentials, encrypted devices and offboarding checklists on every project." },
    ],
  },
  engagement: {
    eyebrow: "Engagement models",
    title: "Pick how we",
    accent: "work together.",
    intro: "Clear terms, no lock-in. Most clients start with Discovery and move to a pod.",
  },
  faq: { eyebrow: "Questions", title: "Contracts, IP", accent: "and logistics." },
} as const;

export const ABOUT_PAGE = {
  meta: {
    title: "About",
    description: `Winapps® is a software engineering partner founded in India in ${SITE.founded}, working with companies in India, the US, the UK and Europe.`,
  },
  hero: {
    eyebrow: `About Winapps · Est. ${SITE.founded}`,
    title: "A senior engineering partner,",
    accent: `since ${SITE.founded}.`,
    lead: "We build and scale software for companies in India, the US, the UK and Europe: AI systems, web and mobile products, cloud platforms and the modernization of systems that run the business.",
  },
  story: {
    eyebrow: "Our story",
    title: "Built on engineers",
    accent: "clients can rely on.",
    paragraphs: [
      `Winapps® was founded in India in ${SITE.founded}. Since then we have worked as an engineering partner to companies in India, the US, the UK and Europe, across AI and machine learning, product engineering, cloud, legacy modernization and data.`,
      "Most of our work is under NDA, which is why you will find the problems we solved on this site, but not our clients' names. We are happy to share references on a call.",
    ],
    // TODO(Winapps): founding story in your own words: who started Winapps, why, and the milestones since 2013.
  },
  values: {
    eyebrow: "What we value",
    title: "Principles that",
    accent: "show up in the work.",
    items: [
      { title: "Senior by default", text: "Every engagement is led by an experienced engineer. The people you meet on the sales call are the people who do the work." },
      { title: "Written communication", text: "Decisions, trade-offs and status are written down, so nothing depends on who was in which meeting." },
      { title: "Security as a baseline", text: "Least-privilege access, client-managed credentials and offboarding checklists on every project, not just the regulated ones." },
      { title: "Your code, your IP", text: "Work is committed to your repositories from day one, and every contract assigns the intellectual property to you." },
    ],
  },
  where: {
    eyebrow: "Where we work",
    title: "Based in India.",
    accent: "Working in your hours.",
    intro: "Our teams shift their day to keep at least 4 hours of overlap with Central Europe and 3–4 hours with US Eastern, so standups, reviews and demos happen live.",
  },
  // Plain facts block for AI assistants and buyers (spec 6.6). Every line is
  // a V1 fact; nothing new.
  facts: {
    eyebrow: "Facts",
    title: "Winapps at a glance",
  },
} as const;

export const CONTACT_PAGE = {
  meta: {
    title: "Contact",
    description:
      "Tell us what you're building. A senior engineer replies within one business day. Email sales@winapps.co.in or call +91 70157 96830.",
  },
  hero: {
    eyebrow: "Contact",
    title: "Tell us what",
    accent: "you're building.",
    lead: "A senior engineer, not a salesperson, replies within one business day. NDA available before any detailed discussion.",
  },
  formTitle: "Send us an inquiry",
  direct: "Talk to us directly",
  alsoOn: "Also on",
  basedIn: "Based in India, working with clients in India, the US, the UK and Europe.",
  nextTitle: "What happens next",
  next: [
    { title: "A senior engineer replies", text: "Within one business day, with questions or times for a 30-minute call." },
    { title: "NDA, if you want one", text: "Signed before any detailed technical discussion." },
    { title: "Intro call", text: "We talk through what you're building and whether we're the right fit." },
    { title: "Discovery", text: "If it makes sense, a short fixed-fee Discovery gives you a plan and estimate you own." },
  ],
  form: {
    name: "Name",
    nameError: "Please enter your name.",
    email: "Work email",
    emailError: "Please enter a valid email address.",
    company: "Company",
    country: "Country",
    phone: "Phone or WhatsApp",
    budget: "Budget",
    optional: "(optional)",
    needs: "What do you need?",
    message: "Project details",
    messageError: "Please tell us a little about the project.",
    messagePlaceholder: "What are you building, and where are you stuck?",
    submit: "Send inquiry",
    privacy: "We use your details only to reply to this inquiry. NDA available before any detailed discussion.",
    preferEmail: "Prefer email? Write to",
    checkFields: "Please check the highlighted fields.",
    opening: "Opening your email app. If nothing happens, write to",
    sending: "Sending…",
    thanks: "Thanks, your inquiry is in.",
    thanksText: "A senior engineer will reply within one business day.",
    failed: "Something went wrong sending the form. Please",
    failedLink: "send it by email instead",
    failedOr: "or write to",
  },
} as const;

export const BLOG_PAGE = {
  meta: {
    title: "Blog",
    description: "Guides from Winapps on software development costs, agentic AI and logistics automation, plus short industry news.",
  },
  hero: {
    eyebrow: "Insights",
    title: "Guides for",
    accent: "planning your build.",
    lead: "Cost ranges, delivery stages and the questions to ask before you scope a project, written by the people who estimate them.",
  },
  news: { eyebrow: "News", title: "Short updates", accent: "from the industry.", all: "All news" },
  cta: {
    title: "Want a number for your project?",
    text: "Every guide gives ranges. A fixed-fee Discovery gives you a plan and estimate you own, whoever builds it.",
  },
} as const;

export const BLOG_POST = {
  eyebrow: "Guide",
  contents: "Contents",
  faq: "Frequently asked questions",
  talk: {
    title: "Planning a build like this?",
    accent: "Get a number you can use.",
    text: "These ranges are a starting point. A fixed-fee Discovery gives you a plan and estimate for your scope, which you own whoever builds it.",
    cta: "Book a 30-min intro call",
  },
  more: { eyebrow: "Keep reading", title: "More guides", all: "All insights" },
  card: { meta: (min: number) => `Guide · ${min} min read`, updated: "Updated", read: "Read the guide" },
} as const;

export const NEWS_PAGE = {
  meta: {
    title: "News",
    description: "Short updates from Winapps on AI, modernization and where software delivery is heading.",
  },
  hero: {
    eyebrow: "News",
    title: "Short updates",
    accent: "from the industry.",
    lead: "Where AI, modernization and delivery practice are heading, in a few lines each.",
  },
  blogLink: "Looking for in-depth guides? Read the blog",
  more: "More news",
  all: "All news",
  postFooter: { before: "Read our in-depth guides", middle: " or ", after: "see what we build" },
  card: { meta: "News", read: "Read more" },
} as const;

// AI development page (/ai/). Copy carried over from the pre-V1 page at
// /services/artificial-intelligence-development-company. Its unsourced figures
// (market size, accuracy rates, cost savings) and the unnamed-client case study
// were left out under the "no invented statistics or clients" rule.
// TODO(Winapps): supply sources before adding any figure back.
export const AI_PAGE = {
  meta: {
    title: "AI development company",
    description:
      "Artificial intelligence development services: machine learning, NLP, computer vision, generative AI, virtual assistants and predictive analytics, built by Winapps since 2013.",
  },
  hero: {
    eyebrow: "AI development",
    title: "Artificial Intelligence",
    accent: "Development Company",
    lead: "Facing workflow inefficiencies, poor data handling, cyber threats or high customer loss? Partner with our AI development services to build intelligent solutions that automate your processes, enable smooth data operations and deliver robust security.",
    primary: "Consult our AI experts",
    secondary: "Our AI & ML practice",
  },
  services: {
    eyebrow: "Services",
    title: "Our artificial intelligence",
    accent: "development services.",
    intro: "As an AI development firm, we convert data into valuable intelligence, streamline operations and support smarter business choices.",
    items: [
      "Bespoke AI solutions",
      "AI strategy consulting",
      "Personalization engines",
      "Conversational AI chatbots",
      "Creative AI tools",
      "AI system integration",
      "Self-learning AI systems",
      "Computer vision AI",
      "Natural language processing",
      "Predictive analytics AI",
    ],
    featured: {
      title: "Bespoke AI solutions",
      text: "We craft tailored AI systems designed for your unique business challenges and goals. From intelligent apps to workflow automation, we deliver scalable solutions that drive real results.",
    },
  },
  why: {
    eyebrow: "Why Winapps",
    title: "An AI development partner",
    accent: "for real business results.",
    intro: "Our AI development services align your operations with emerging market demands and fuel data-backed decision-making.",
    points: [
      "Automate tasks with increased efficiency",
      "Build brand loyalty with personalized experiences",
      "Optimize how resources are used",
      "Reduce cost with predictive maintenance",
      "Make data-driven decisions",
    ],
    cta: "Start your AI project",
  },
  expertise: {
    eyebrow: "Expertise",
    title: "Our areas of expertise in",
    accent: "AI development.",
    intro: "Since 2013 our specialists have built software in the core AI technologies that automate and optimize business processes.",
    items: [
      { title: "Machine learning solutions", text: "We build systems that process large datasets to support data-informed strategies and predictive insights for businesses." },
      { title: "Natural language processing", text: "Our NLP platforms analyze speech patterns and customer sentiment across large data volumes, powering rapid insights and personalized interactions." },
      { title: "Computer vision technology", text: "We deliver complete vision systems featuring text recognition, object identification, visual search and intelligent image processing." },
      { title: "Deep learning systems", text: "Using neural networks, we develop tools for image analysis, anomaly detection, conversational AI and voice processing applications." },
      { title: "Smart assistant technologies", text: "We build virtual assistants for workforce support, technical helpdesk automation, intelligent calendars, process streamlining and smart device integration." },
    ],
    quote: { title: "Have an AI use case in mind?", label: "Request a quote" },
  },
  benefits: {
    eyebrow: "Benefits",
    title: "Benefits of AI in",
    accent: "business operations.",
    intro: "Deployed well, AI and machine learning improve operations, raise customer satisfaction and drive revenue growth.",
    items: [
      { title: "Smarter business decisions", text: "AI gives companies data-backed insights to predict outcomes and guide strategic choices. It processes complex variables to reveal opportunities and risks ahead of time." },
      { title: "Competitive innovation edge", text: "AI drives innovations that position businesses as market pioneers. From launching new offerings to improving customer support, AI unlocks lasting advantages." },
      { title: "Streamlined operations", text: "AI removes repetitive tasks and optimizes how resources are allocated. Routine activities like manual data processing are automated to free up valuable time." },
      { title: "Tailored customer journeys", text: "By analyzing user preferences and behavior patterns, AI delivers personalized experiences that build stronger customer relationships and loyalty." },
      { title: "Reduced operating costs", text: "Automation, fewer errors and intelligent forecasting cut expenses. Accurate demand prediction minimizes inventory waste and overstocking." },
      { title: "Early threat detection", text: "Continuous AI monitoring identifies irregularities and potential issues before they escalate, safeguarding finances and sensitive data." },
    ],
  },
  solutions: {
    eyebrow: "Solutions",
    title: "Intelligent AI solutions",
    accent: "for business growth.",
    intro: "Our AI-powered platforms optimize workflows, boost operational efficiency and deliver precise insights. We turn raw data into strategic advantages, enabling smarter decisions and scalable growth.",
    items: [
      { title: "Generative AI platform", text: "Create visuals, marketing campaigns, blog content and personalized messaging, adapted to your brand voice and guidelines. Built for content teams that need scalable, high-quality creative output." },
      { title: "Predictive analytics engine", text: "Forecast market trends, customer behavior and operational needs. Analyze historical patterns to inform inventory, pricing and expansion strategies, with real-time dashboards for leadership." },
      { title: "Facial recognition system", text: "Secure biometric authentication for employee check-ins, facility access and user verification, with anti-spoofing technology. Privacy-compliant and integrated with your existing security infrastructure." },
      { title: "AI content automation", text: "Generate SEO-optimized sales copy, email sequences, social posts and newsletters automatically, keeping brand consistency across every channel while scaling content production." },
      { title: "Sentiment analysis platform", text: "Monitor brand perception across social media, reviews and support tickets in real time. Extract actionable insights from customer interactions and track campaigns and competitive positioning automatically." },
      { title: "Personalized recommendation engine", text: "Lift eCommerce conversion with intelligent product suggestions, and power OTT content discovery and enterprise knowledge recommendations that adapt to each user while serving business objectives." },
      { title: "Advanced threat detection", text: "Identify fraud patterns and cybersecurity risks with real-time anomaly detection across transactions, networks and user behavior, and fewer false positives through machine-learning pattern recognition." },
      { title: "Computer vision processing", text: "Automate quality control, defect detection and inventory management visually, with object recognition that holds up across lighting conditions, for warehouse and manufacturing operations." },
      { title: "Intelligent virtual assistants", text: "Deploy 24/7 conversational AI for customer service, sales and internal support. Handle complex queries across multiple channels, lowering support costs and improving response times." },
      { title: "Financial intelligence suite", text: "AI-powered tools for cash-flow prediction, investment analysis and risk assessment, processing large volumes of financial data for treasury, compliance and planning teams." },
      { title: "Smart demand forecasting", text: "Predict inventory needs to avoid stockouts and overstock. Factor in seasonality, market trends and external events automatically, and optimize supply chains across product categories." },
      { title: "Voice recognition AI", text: "Accurate speech-to-text across many languages and accents, powering call-center analytics, voice authentication and transcription, even in noisy environments or with technical terminology." },
      { title: "HR talent analytics", text: "Identify top candidates, predict employee turnover and optimize hiring pipelines. Analyze performance patterns to inform training and promotion decisions and shorten time-to-hire." },
      { title: "Supply chain optimization", text: "Real-time route optimization, supplier risk assessment and delivery predictions. Cut logistics costs while meeting service levels, and handle disruptions with AI-driven scenario planning." },
      { title: "Marketing personalization", text: "Dynamic campaign optimization based on real-time customer behavior signals. Improve ROI through audience segmentation and content variation testing, and scale personalized marketing to millions of users." },
    ],
  },
  stack: {
    eyebrow: "Tech stack",
    title: "Our tech stack for",
    accent: "AI development.",
    intro: "We select the right technologies to build customized AI software for each client. Our stack helps us deliver scalable, flexible digital products.",
    libraries: ["OpenAI", "Neuroph", "Sonnet", "LangGraph"],
  },
  challenges: {
    eyebrow: "Challenges",
    title: "Business challenges of",
    accent: "AI implementation.",
    intro: "AI implementation is a complex process that needs expert guidance and planned mitigation to reduce project risk.",
    items: [
      { title: "Data quality", text: "AI depends heavily on data quality. Bias or inaccuracy in the data can produce incorrect outputs. Sourcing, collecting and refining data remains a major challenge in AI implementation." },
      { title: "Infrastructure requirements", text: "AI needs robust computing infrastructure, including high-end processors, storage and scalable systems. Small and mid-sized businesses often struggle with these costs." },
      { title: "Integration complexity", text: "Integrating AI into legacy enterprise systems is complex. It takes real expertise to integrate cleanly and get the expected results." },
      { title: "Ethical challenges", text: "Poorly implemented AI can produce biased or discriminatory results. Ethical concerns arise from flawed training data or badly designed algorithms." },
    ],
  },
  competencies: {
    eyebrow: "Competencies",
    title: "What we bring",
    accent: "to your AI project.",
    intro: "We serve as a reliable AI implementation partner for enterprises and international companies. Our mix of technical expertise and collaborative approach delivers AI solutions tailored to client success.",
    // TODO(Winapps): confirm "10+ years" (carried over from the old page).
    items: [
      { title: "Deep AI technical mastery", text: "We implement leading AI technologies, including machine learning, neural networks and natural language processing, to build intelligent solutions customized to your needs." },
      { title: "Custom-tailored solutions", text: "Our specialists identify operational inefficiencies and design targeted solutions that deliver measurable productivity gains." },
      { title: "Seasoned AI professionals", text: "Our team of AI specialists brings 10+ years of expertise across domains: AI architects, developers, data scientists and dedicated quality assurance experts." },
      { title: "Complimentary AI consultation", text: "Businesses exploring AI get a free expert consultation. We clarify technology options, resource requirements, timelines, essential features and implementation strategy." },
      { title: "Comprehensive support", text: "After deployment we provide ongoing maintenance: bug fixes, feature enhancements, performance optimization and regular security updates." },
      { title: "Team collaboration model", text: "Our collaborative approach keeps stakeholders engaged throughout development. Regular milestone updates and continuous feedback keep the work aligned with project goals." },
    ],
  },
  cta: { title: "Ready to put AI to work?" },
} as const;

export const NOT_FOUND = {
  meta: { title: "Page not found", description: "The page you were looking for doesn't exist or has moved." },
  eyebrow: "Error 404",
  title: "This page doesn't exist,",
  accent: "or it has moved.",
  lead: "Links from the old winapps.co.in site redirect automatically. If this one didn't, pick up from here:",
  links: [
    { label: "Home", href: "/" },
    { label: "Services", href: "/services/" },
    { label: "Work", href: "/work/" },
    { label: "Insights", href: "/blog/" },
  ],
  contact: "Contact us",
} as const;
