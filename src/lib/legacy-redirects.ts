// Old www.winapps.co.in URLs → pages on this site, so links, bookmarks and
// search results keep working after the switch. Paths are without the base
// path.
//
// Astro writes each entry as a small redirect page (meta refresh plus a
// canonical to the target), which works on GitHub Pages, where real 301s
// aren't available.

// Every live case study and its page on this site (src/content/work).
const caseStudies: Record<string, string> = {
  "enhancing-member-engagement-fitness-app-uk-chain": "fitness-member-app",
  "saas-modernization-pharma-manufacturer-mobile-app": "pharma-saas-replatform",
  "ai-powered-real-time-quality-inspection-automotive-parts": "ai-visual-inspection",
  "advanced-fleet-optimization-for-logistics": "fleet-route-optimisation",
  "enhancing-industrial-operations-with-ai-predictive-analytics": "ai-predictive-maintenance",
  "ai-supply-chain-optimization-manufacturing": "ai-supply-chain-optimisation",
  "ai-quality-inspection-defect-detection-factory": "ai-vision-electronics-inspection",
  "generative-ai-accelerated-product-design-heavy-machinery": "generative-design-heavy-equipment",
  "optimizing-customer-engagement-in-online-retail": "ecommerce-crm-personalisation",
  "personalized-digital-learning-for-modern-education": "adaptive-learning-platform",
  "custom-streaming-solution-for-media-distribution": "ott-streaming-platform",
  "secure-mobile-banking-for-digital-finance": "mobile-banking-app",
  "community-driven-fitness-platform-for-runners": "running-community-app",
  "cloud-based-erp-for-manufacturing-efficiency": "cloud-erp-manufacturing",
  "multi-service-on-demand-mobile-application": "on-demand-services-app",
  "enterprise-erp-for-retail-management": "retail-erp-omnichannel",
  "modernizing-legacy-saas-applications": "legacy-saas-modernisation",
  "niche-community-social-network-platform": "niche-community-network",
  "building-scalable-loan-management-platform-nbfc": "nbfc-loan-platform",
  "authentic-sneaker-ecommerce-mobile-platform": "sneaker-commerce-app",
};

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
  "/services/artificial-intelligence-development-company": "/ai/",
  "/services/ai-center-of-excellence": "/services/ai-ml/",
  ...Object.fromEntries(Object.entries(caseStudies).map(([from, to]) => [`/case-studies/${from}`, `/work/${to}/`])),
  ...Object.fromEntries(newsSlugs.flatMap((s) => [[`/blog/${s}`, `/news/${s}/`], [`/case-studies/${s}`, `/news/${s}/`]])),
};
