// Old www.winapps.co.in URLs → pages on this site, so links, bookmarks and
// search results keep working after the switch. Paths are without the base
// path. The full journey map behind these choices is in PAGE-JOURNEYS.md.
//
// Astro writes each entry as a small redirect page (works on any static
// host); astro.config.mjs also emits them as a Netlify/Cloudflare
// `_redirects` file for real 301s.

// Live case studies that are the same engagement as one of ours.
const sameCaseStudy: Record<string, string> = {
  "enhancing-member-engagement-fitness-app-uk-chain": "fitness-member-app",
  "saas-modernization-pharma-manufacturer-mobile-app": "pharma-saas-replatform",
  "ai-powered-real-time-quality-inspection-automotive-parts": "ai-visual-inspection",
  "advanced-fleet-optimization-for-logistics": "fleet-route-optimisation",
};

// Live case studies not (yet) cleared for this site: send to the Work index.
// TODO: if Winapps confirms one, add it to src/content/work and move it above.
const otherCaseStudies = [
  "enhancing-industrial-operations-with-ai-predictive-analytics",
  "ai-supply-chain-optimization-manufacturing",
  "ai-quality-inspection-defect-detection-factory",
  "generative-ai-accelerated-product-design-heavy-machinery",
  "optimizing-customer-engagement-in-online-retail",
  "personalized-digital-learning-for-modern-education",
  "custom-streaming-solution-for-media-distribution",
  "secure-mobile-banking-for-digital-finance",
  "community-driven-fitness-platform-for-runners",
  "cloud-based-erp-for-manufacturing-efficiency",
  "multi-service-on-demand-mobile-application",
  "enterprise-erp-for-retail-management",
  "modernizing-legacy-saas-applications",
  "niche-community-social-network-platform",
  "building-scalable-loan-management-platform-nbfc",
  "authentic-sneaker-ecommerce-mobile-platform",
];

// News posts the live site also linked under /blog/ and /case-studies/,
// where they returned "not found".
const newsSlugs = [
  "ai-transforming-construction",
  "ai-powered-project-management",
  "startup-scaling-with-ai",
  "legacy-website-modernization",
  "ai-healthcare-digital-transformation",
];

export const LEGACY_REDIRECTS: Record<string, string> = {
  "/case-studies": "/work/",
  "/contact-us": "/contact/",
  "/services/artificial-intelligence-development-company": "/services/ai-ml/",
  "/services/ai-center-of-excellence": "/services/ai-ml/",
  ...Object.fromEntries(Object.entries(sameCaseStudy).map(([from, to]) => [`/case-studies/${from}`, `/work/${to}/`])),
  ...Object.fromEntries(otherCaseStudies.map((s) => [`/case-studies/${s}`, "/work/"])),
  ...Object.fromEntries(newsSlugs.flatMap((s) => [[`/blog/${s}`, `/news/${s}/`], [`/case-studies/${s}`, `/news/${s}/`]])),
};
