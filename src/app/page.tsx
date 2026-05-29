import { allProjects, allArticles } from "contentlayer/generated";
import { compareDesc } from "date-fns";
import fs from "fs";
import path from "path";
import { HeroSection } from "@/components/layout/HeroSection";
import { FeaturedProjectsSection } from "@/components/projects/FeaturedProjectsSection";
import { WritingPreviewSection } from "@/components/writing/WritingPreviewSection";
import { GitHubSection } from "@/components/layout/GitHubSection";
import { CrookedDivider } from "@/components/decorative/CrookedDivider";

interface TaggedContent {
  tags: string[];
}

interface HeroTag {
  label: string;
  href: string;
  source: "project" | "article";
}

function getMostUsedTags(items: TaggedContent[], limit = 5) {
  const counts = new Map<string, number>();

  items.forEach((item) => {
    item.tags.forEach((tag) => {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    });
  });

  return Array.from(counts.entries())
    .sort(([tagA, countA], [tagB, countB]) => countB - countA || tagA.localeCompare(tagB))
    .slice(0, limit)
    .map(([tag]) => tag);
}

function shuffleTags(tags: HeroTag[]) {
  return tags
    .map((tag) => ({ tag, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ tag }) => tag);
}

function imageExists(imagePath: string | undefined): boolean {
  if (!imagePath) return false;
  const filePath = path.join(process.cwd(), "public", imagePath);
  return fs.existsSync(filePath);
}

export default function HomePage() {
  const featuredProjects = allProjects
    .filter((p) => p.featured && imageExists(p.cover))
    .sort((a, b) => compareDesc(new Date(a.date), new Date(b.date)));

  const showcaseProjects = allProjects
    .map((p) => ({
      title: p.title,
      showcase: (p.showcase && imageExists(p.showcase) ? p.showcase : p.firstBodyImage) as string | undefined,
      url: p.url,
      date: p.date,
    }))
    .filter((p) => p.showcase)
    .sort((a, b) => compareDesc(new Date(a.date), new Date(b.date)))
    .slice(0, 3)
    .map(({ title, showcase, url }) => ({ title, showcase: showcase!, url }));

  const recentArticles = allArticles
    .sort((a, b) => compareDesc(new Date(a.date), new Date(b.date)))
    .slice(0, 6);

  const projectTags = getMostUsedTags(allProjects).map((tag) => ({
    label: tag,
    href: `/projects?tag=${encodeURIComponent(tag)}`,
    source: "project" as const,
  }));

  const articleTags = getMostUsedTags(allArticles).map((tag) => ({
    label: tag,
    href: `/writing?tag=${encodeURIComponent(tag)}`,
    source: "article" as const,
  }));

  const heroTags = shuffleTags([...projectTags, ...articleTags]);

  return (
    <>
      <HeroSection showcases={showcaseProjects} tags={heroTags} />
      <CrookedDivider variant="scribble" className="my-4" />
      <FeaturedProjectsSection projects={featuredProjects} />
      <CrookedDivider variant="wavy" color="#6F9D9A" className="my-4" />
      <WritingPreviewSection articles={recentArticles} />
      <CrookedDivider variant="zigzag" color="#D98B73" className="my-4" />
      <GitHubSection />
    </>
  );
}
