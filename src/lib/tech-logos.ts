// Technology logos (training courses, tech chips): the official marks, used
// unaltered. Files live in src/assets/tech-logos/; sources and licences are
// in CREDITS.md. To add one, drop the SVG in that folder and name it here.
// Served as files (?no-inline), not data URIs: the header menu shows them on
// every page, so the browser caches them once.
const FILES = import.meta.glob<string>("../assets/tech-logos/*.svg", { query: "?no-inline", import: "default", eager: true });

export const TECH_LOGOS = {
  android: "Android",
  apple: "Apple",
  aws: "Amazon Web Services",
  azure: "Microsoft Azure",
  bigquery: "BigQuery",
  csharp: "C#",
  css3: "CSS3",
  dart: "Dart",
  docker: "Docker",
  dotnet: ".NET",
  dotnetcore: ".NET Core",
  express: "Express",
  figma: "Figma",
  firebase: "Firebase",
  flutter: "Flutter",
  go: "Go",
  google: "Google",
  googlecloud: "Google Cloud",
  html5: "HTML5",
  instagram: "Instagram",
  java: "Java",
  jenkins: "Jenkins",
  jira: "Jira",
  kafka: "Apache Kafka",
  kotlin: "Kotlin",
  kubernetes: "Kubernetes",
  laravel: "Laravel",
  meta: "Meta",
  mongodb: "MongoDB",
  mysql: "MySQL",
  nextjs: "Next.js",
  nodejs: "Node.js",
  openai: "OpenAI",
  oracle: "Oracle Cloud",
  pandas: "pandas",
  php: "PHP",
  playwright: "Playwright",
  postgresql: "PostgreSQL",
  postman: "Postman",
  python: "Python",
  pytorch: "PyTorch",
  react: "React",
  scikitlearn: "scikit-learn",
  selenium: "Selenium",
  snowflake: "Snowflake",
  spring: "Spring",
  swift: "Swift",
  tensorflow: "TensorFlow",
  terraform: "Terraform",
  typescript: "TypeScript",
  unity: "Unity",
} as const;

export type TechLogo = keyof typeof TECH_LOGOS;
export const TECH_LOGO_KEYS = Object.keys(TECH_LOGOS) as [TechLogo, ...TechLogo[]];

/** URL and name of a logo. Fails the build if its file is missing. */
export function techLogo(key: TechLogo): { src: string; name: string } {
  const src = FILES[`../assets/tech-logos/${key}.svg`];
  if (!src) throw new Error(`Missing logo file src/assets/tech-logos/${key}.svg`);
  return { src, name: TECH_LOGOS[key] };
}

// Labels in the content that don't reduce to a key on their own.
const ALIASES: Record<string, TechLogo> = { gcp: "googlecloud", amazonwebservices: "aws", microsoftazure: "azure" };

/** The logo for a free-text technology label ("Node.js", "GCP"), if we have one. */
export function logoForLabel(label: string): { src: string; name: string } | undefined {
  const norm = label.toLowerCase().replace(/[^a-z0-9#]/g, "");
  const key = norm in TECH_LOGOS ? (norm as TechLogo) : ALIASES[norm];
  return key ? techLogo(key) : undefined;
}
