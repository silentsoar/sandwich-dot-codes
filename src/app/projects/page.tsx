import type { Metadata } from "next";
import { allProjects } from "contentlayer/generated";
import { compareDesc } from "date-fns";
import { ProjectsPageContent } from "@/components/projects/ProjectsPageContent";

interface ProjectsPageProps {
  searchParams?: {
    status?: string | string[];
    tag?: string | string[];
  };
}

export const metadata: Metadata = {
  title: "Projects",
  description: "AI experiments, web toys, and strange digital artifacts.",
};

function getFirstParam(param?: string | string[]) {
  return Array.isArray(param) ? param[0] : param;
}

export default function ProjectsPage({ searchParams }: ProjectsPageProps) {
  const projects = allProjects.sort((a, b) =>
    compareDesc(new Date(a.date), new Date(b.date)),
  );

  return (
    <ProjectsPageContent
      projects={projects}
      initialStatusFilter={getFirstParam(searchParams?.status)}
      initialTagFilter={getFirstParam(searchParams?.tag)}
    />
  );
}
