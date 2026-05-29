import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { existsSync } from "fs";
import { join } from "path";
import { allProjects } from "contentlayer/generated";
import { ProjectPageContent } from "@/components/projects/ProjectPageContent";

interface ProjectPageProps {
  params: { slug: string };
}

function resolveShowcase(project: (typeof allProjects)[number]): string | undefined {
  if (project.showcase) {
    const filePath = join(process.cwd(), "public", project.showcase);
    if (existsSync(filePath)) return project.showcase;
  }
  return project.firstBodyImage;
}

export function generateStaticParams() {
  return allProjects.map((project) => ({
    slug: project.slug,
  }));
}

export function generateMetadata({ params }: ProjectPageProps): Metadata {
  const project = allProjects.find((p) => p.slug === params.slug);
  if (!project) return {};
  return {
    title: project.title,
    description: project.description,
    openGraph: {
      title: project.title,
      description: project.description,
      type: "article",
      publishedTime: project.date,
      tags: project.tags,
    },
  };
}

export default function ProjectPage({ params }: ProjectPageProps) {
  const project = allProjects.find((p) => p.slug === params.slug);
  if (!project) notFound();

  const showcase = resolveShowcase(project);

  return <ProjectPageContent project={project} resolvedShowcase={showcase} />;
}
