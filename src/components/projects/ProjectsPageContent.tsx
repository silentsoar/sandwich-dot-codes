"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import type { Project } from "contentlayer/generated";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { StickerTag } from "@/components/decorative/StickerTag";
import { DoodleAccent } from "@/components/decorative/DoodleAccent";
import { cn } from "@/lib/utils";

interface ProjectsPageContentProps {
  projects: Project[];
  initialStatusFilter?: string;
  initialTagFilter?: string;
}

const allStatuses = ["all", "active", "experimental", "archived"] as const;
type ProjectStatusFilter = (typeof allStatuses)[number];

function getStatusFilter(status?: string): ProjectStatusFilter {
  return allStatuses.includes(status as ProjectStatusFilter)
    ? (status as ProjectStatusFilter)
    : "all";
}

export function ProjectsPageContent({
  projects,
  initialStatusFilter,
  initialTagFilter,
}: ProjectsPageContentProps) {
  const router = useRouter();
  const initialStatus = getStatusFilter(initialStatusFilter);
  const initialTag = initialTagFilter || "all";
  const [activeStatusFilter, setActiveStatusFilter] = useState<ProjectStatusFilter>(initialStatus);
  const [activeTagFilter, setActiveTagFilter] = useState(initialTag);

  const allTags = Array.from(new Set(projects.flatMap((p) => [...p.tags, ...p.tech]))).sort(
    (a, b) => a.localeCompare(b),
  );

  useEffect(() => {
    setActiveStatusFilter(initialStatus);
    setActiveTagFilter(initialTag);
  }, [initialStatus, initialTag]);

  const updateFilters = (status: ProjectStatusFilter, tag: string) => {
    setActiveStatusFilter(status);
    setActiveTagFilter(tag);

    const params = new URLSearchParams();
    if (status !== "all") params.set("status", status);
    if (tag !== "all") params.set("tag", tag);

    const query = params.toString();
    router.replace(query ? `/projects?${query}` : "/projects", { scroll: false });
  };

  const filteredProjects = projects.filter((project) => {
    const matchesStatus = activeStatusFilter === "all" || project.status === activeStatusFilter;
    const matchesTag =
      activeTagFilter === "all" ||
      project.tags.includes(activeTagFilter) ||
      project.tech.includes(activeTagFilter);

    return matchesStatus && matchesTag;
  });

  const hasActiveFilters = activeStatusFilter !== "all" || activeTagFilter !== "all";

  return (
    <Section spacing="loose">
      <Container>
        <div className="relative mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
          >
            <StickerTag variant="mustard" rotation={-2} className="mb-4">
              Projects
            </StickerTag>
            <h1 className="font-heading text-display font-black leading-[0.95] tracking-tighter rotate-[-0.3deg]">
              The Works
            </h1>
            <p className="mt-4 max-w-lg text-lg text-muted rotate-[0.2deg]">
              Everything I&apos;ve built, broken, and rebuilt. Filter by vibe.
            </p>
          </motion.div>
          <div className="absolute -right-2 top-0 rotate-12 sm:right-4">
            <DoodleAccent variant="star" color="#D6B347" size={36} />
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 20 }}
          className="mb-8 space-y-4"
        >
          <div className="flex flex-wrap gap-2" aria-label="Filter projects by status">
            {allStatuses.map((status) => (
              <button
                key={status}
                onClick={() => updateFilters(status, activeTagFilter)}
                aria-pressed={activeStatusFilter === status}
                className={cn(
                  "border-3 border-border px-4 py-2 font-heading text-sm font-bold uppercase tracking-wider",
                  "transition-all duration-200 hover:scale-105",
                  activeStatusFilter === status
                    ? "bg-foreground text-background shadow-tactile"
                    : "bg-background hover:bg-mustard/20",
                )}
              >
                {status}
              </button>
            ))}
          </div>

          {allTags.length > 0 && (
            <div className="flex flex-wrap gap-2" aria-label="Filter projects by tag">
              <button
                onClick={() => updateFilters(activeStatusFilter, "all")}
                aria-pressed={activeTagFilter === "all"}
                className={cn(
                  "border-2 border-border px-3 py-1.5 font-heading text-xs font-bold uppercase tracking-wider",
                  "transition-all duration-200 hover:scale-105",
                  activeTagFilter === "all"
                    ? "bg-teal text-background shadow-tactile-sm"
                    : "bg-background hover:bg-teal/20",
                )}
              >
                All Tags
              </button>
              {allTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => updateFilters(activeStatusFilter, tag)}
                  aria-pressed={activeTagFilter === tag}
                  className={cn(
                    "border-2 border-border px-3 py-1.5 font-heading text-xs font-bold uppercase tracking-wider",
                    "transition-all duration-200 hover:scale-105",
                    activeTagFilter === tag
                      ? "bg-teal text-background shadow-tactile-sm"
                      : "bg-background hover:bg-teal/20",
                  )}
                >
                  #{tag}
                </button>
              ))}
            </div>
          )}
        </motion.div>

        <AnimatePresence mode="wait">
          <motion.div
            key={`${activeStatusFilter}-${activeTagFilter}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="grid grid-cols-1 gap-6 md:grid-cols-2"
          >
            {filteredProjects.map((project, i) => (
              <ProjectCard key={project.slug} project={project} index={i} />
            ))}
          </motion.div>
        </AnimatePresence>

        {filteredProjects.length === 0 && (
          <div className="py-16 text-center">
            <DoodleAccent variant="circle" color="#7C736C" size={48} className="mb-4" />
            <p className="font-heading text-lg font-bold text-muted">
              No projects found for this filter.
            </p>
            {hasActiveFilters && (
              <button
                onClick={() => updateFilters("all", "all")}
                className={cn(
                  "mt-4 border-3 border-border bg-background px-4 py-2 font-heading text-sm font-bold uppercase tracking-wider",
                  "shadow-tactile transition-all hover:scale-105 hover:bg-mustard/20",
                )}
              >
                Clear Filters
              </button>
            )}
          </div>
        )}
      </Container>
    </Section>
  );
}
