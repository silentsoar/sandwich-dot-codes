import fs from "fs";
import path from "path";
import { execSync } from "child_process";

function detectGitHubUsername(): string {
  if (process.env.GITHUB_USERNAME) return process.env.GITHUB_USERNAME;

  try {
    const remote = execSync("git remote get-url origin", { encoding: "utf-8" }).trim();
    const match = remote.match(/github\.com[:/]([^/]+)/);
    if (match) return match[1];
  } catch {}

  console.error("Could not detect GitHub username. Set GITHUB_USERNAME env var.");
  process.exit(1);
}

const GITHUB_USERNAME = detectGitHubUsername();
const CONTENT_DIR = path.join(process.cwd(), "content", "projects");
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

interface GitHubRepo {
  name: string;
  description: string | null;
  html_url: string;
  homepage: string | null;
  stargazers_count: number;
  forks_count: number;
  language: string | null;
  topics: string[];
  archived: boolean;
  fork: boolean;
  updated_at: string;
  pushed_at: string;
  created_at: string;
}

async function fetchRepos(): Promise<GitHubRepo[]> {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github.v3+json",
  };
  if (GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${GITHUB_TOKEN}`;
  }

  const repos: GitHubRepo[] = [];
  let page = 1;

  while (true) {
    const res = await fetch(
      `https://api.github.com/users/${GITHUB_USERNAME}/repos?per_page=100&page=${page}&sort=pushed`,
      { headers },
    );

    if (!res.ok) {
      throw new Error(`GitHub API error: ${res.status} ${res.statusText}`);
    }

    const data: GitHubRepo[] = await res.json();
    if (data.length === 0) break;
    repos.push(...data);
    page++;
  }

  return repos;
}

function getExistingSlugs(): Set<string> {
  if (!fs.existsSync(CONTENT_DIR)) {
    fs.mkdirSync(CONTENT_DIR, { recursive: true });
    return new Set();
  }

  const files = fs.readdirSync(CONTENT_DIR).filter((f) => f.endsWith(".mdx"));
  return new Set(files.map((f) => f.replace(/\.mdx$/, "")));
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function deriveTags(repo: GitHubRepo): string[] {
  const tags = new Set<string>();

  if (repo.language) tags.add(repo.language);
  if (repo.topics) repo.topics.forEach((t) => tags.add(t));

  return Array.from(tags).slice(0, 6);
}

function deriveStatus(repo: GitHubRepo): "active" | "experimental" | "archived" {
  if (repo.archived) return "archived";
  if (repo.fork) return "archived";

  const stars = repo.stargazers_count;
  if (stars >= 10) return "active";
  return "experimental";
}

function deriveTech(repo: GitHubRepo): string[] {
  const tech = new Set<string>();
  if (repo.language) tech.add(repo.language);

  const topicToTech: Record<string, string> = {
    react: "React",
    nextjs: "Next.js",
    "next-js": "Next.js",
    typescript: "TypeScript",
    javascript: "JavaScript",
    rust: "Rust",
    python: "Python",
    tailwindcss: "Tailwind CSS",
    "tailwind-css": "Tailwind CSS",
    threejs: "Three.js",
    "three-js": "Three.js",
    webgl: "WebGL",
    webgpu: "WebGPU",
    wasm: "WebAssembly",
    webassembly: "WebAssembly",
    tensorflow: "TensorFlow.js",
    "tensorflow-js": "TensorFlow.js",
    vite: "Vite",
    docker: "Docker",
    postgresql: "PostgreSQL",
    prisma: "Prisma",
    graphql: "GraphQL",
    api: "REST API",
    ai: "AI",
    ml: "Machine Learning",
    "machine-learning": "Machine Learning",
    "deep-learning": "Deep Learning",
    llm: "LLM",
    gpt: "GPT",
    openai: "OpenAI",
    vercel: "Vercel",
    next: "Next.js",
    node: "Node.js",
    "nodejs": "Node.js",
    "node-js": "Node.js",
    d3: "D3.js",
    d3js: "D3.js",
    canvas: "Canvas API",
    "web-audio": "Web Audio API",
    webaudio: "Web Audio API",
    svelte: "Svelte",
    vue: "Vue.js",
    angular: "Angular",
    go: "Go",
    golang: "Go",
    java: "Java",
    swift: "Swift",
    kotlin: "Kotlin",
    csharp: "C#",
    "c-sharp": "C#",
    cpp: "C++",
    "c-plus-plus": "C++",
    c: "C",
    php: "PHP",
    ruby: "Ruby",
    elixir: "Elixir",
    haskell: "Haskell",
    ocaml: "OCaml",
    zig: "Zig",
    deno: "Deno",
    bun: "Bun",
  };

  for (const topic of repo.topics || []) {
    const mapped = topicToTech[topic];
    if (mapped) tech.add(mapped);
  }

  return Array.from(tech).slice(0, 6);
}

function generateMDX(repo: GitHubRepo, slug: string): string {
  const tags = deriveTags(repo);
  const tech = deriveTech(repo);
  const status = deriveStatus(repo);
  const date = new Date(repo.pushed_at).toISOString().split("T")[0];

  const frontmatter = [
    "---",
    `title: "${repo.name.replace(/"/g, '\\"')}"`,
    `description: "${(repo.description || "A GitHub project.").replace(/"/g, '\\"')}"`,
    `date: "${date}"`,
    `tags: [${tags.map((t) => `"${t}"`).join(", ")}]`,
    `featured: false`,
    `github: "${repo.html_url}"`,
    ...(repo.homepage ? [`demo: "${repo.homepage}"`] : []),
    `status: "${status}"`,
    `cover: "/images/projects/${slug}.jpg"`,
    `tech: [${tech.map((t) => `"${t}"`).join(", ")}]`,
    "---",
    "",
    "## Overview",
    "",
    repo.description || "A GitHub project.",
    "",
    `> This file was auto-generated by \`npm run sync-github\`. Edit it to add a proper write-up.`,
    "",
    "## Links",
    "",
    `- [GitHub Repository](${repo.html_url})`,
    ...(repo.homepage ? [`- [Live Demo](${repo.homepage})`] : []),
    "",
  ].join("\n");

  return frontmatter;
}

async function main() {
  console.log("Fetching repos from GitHub...");
  const repos = await fetchRepos();
  console.log(`Found ${repos.length} repos.`);

  const existingSlugs = getExistingSlugs();
  let created = 0;
  let skipped = 0;

  for (const repo of repos) {
    const slug = slugify(repo.name);

    if (existingSlugs.has(slug)) {
      skipped++;
      continue;
    }

    const mdx = generateMDX(repo, slug);
    const filePath = path.join(CONTENT_DIR, `${slug}.mdx`);
    fs.writeFileSync(filePath, mdx, "utf-8");
    console.log(`  Created: content/projects/${slug}.mdx`);
    created++;
  }

  console.log(`\nDone. Created ${created} new files, skipped ${skipped} existing.`);
}

main().catch((err) => {
  console.error("Sync failed:", err.message);
  process.exit(1);
});
