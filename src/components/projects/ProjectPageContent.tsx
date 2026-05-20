"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Github, ExternalLink, ArrowLeft, Clock } from "lucide-react";
import type { Project } from "contentlayer/generated";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { MDXRenderer } from "@/components/writing/MDXRenderer";
import { StickerTag } from "@/components/decorative/StickerTag";
import { DoodleAccent } from "@/components/decorative/DoodleAccent";
import { CrookedDivider } from "@/components/decorative/CrookedDivider";
import { PhoneShowcase } from "@/components/decorative/PhoneShowcase";
import { cn } from "@/lib/utils";

interface ProjectPageContentProps {
  project: Project;
}

const statusColors: Record<string, "slime" | "mustard" | "muted"> = {
  active: "slime",
  experimental: "mustard",
  archived: "muted",
};

export function ProjectPageContent({ project }: ProjectPageContentProps) {
  const hasShowcase = !!project.showcase;

  return (
    <>
      <Section spacing="default">
        <Container size={hasShowcase ? "default" : "narrow"}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
          >
            <Link
              href="/projects"
              className="mb-8 inline-flex items-center gap-2 font-heading text-sm font-bold uppercase tracking-widest text-muted transition-colors hover:text-foreground"
            >
              <ArrowLeft size={16} />
              All Projects
            </Link>

            <div className={cn(hasShowcase && "flex items-start gap-8 lg:gap-12")}>
              <div className={cn(hasShowcase && "min-w-0 flex-1")}>
                <div className="mb-6 flex items-center gap-3">
                  <StickerTag variant={statusColors[project.status]}>
                    {project.status}
                  </StickerTag>
                  {project.readingTime && (
                    <span className="flex items-center gap-1 text-sm text-muted">
                      <Clock size={14} />
                      {project.readingTime}
                    </span>
                  )}
                </div>

                <h1 className="font-heading text-headline font-black leading-[0.95] tracking-tighter rotate-[-0.3deg]">
                  {project.title}
                </h1>

                <p className="mt-4 max-w-2xl text-lg text-muted rotate-[0.2deg]">
                  {project.description}
                </p>

                <div className="mt-6 flex flex-wrap gap-3">
                  {project.tech.map((t, i) => (
                    <span
                      key={t}
                      className="border-3 border-border px-3 py-1 font-heading text-sm font-bold uppercase tracking-wider shadow-tactile-sm"
                      style={{ transform: `rotate(${i % 2 === 0 ? -1 : 1}deg)` }}
                    >
                      {t}
                    </span>
                  ))}
                </div>

                <div className="mt-6 flex items-center gap-4">
                  {project.github && (
                    <a
                      href={project.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 border-3 border-border bg-foreground px-4 py-2 font-heading text-sm font-bold text-background shadow-tactile transition-all hover:shadow-tactile-lg hover:translate-x-[-2px] hover:translate-y-[-2px]"
                    >
                      <Github size={16} />
                      View Source
                    </a>
                  )}
                  {project.demo && (
                    <a
                      href={project.demo}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 border-3 border-border bg-mustard px-4 py-2 font-heading text-sm font-bold text-foreground shadow-tactile transition-all hover:shadow-tactile-lg hover:translate-x-[-2px] hover:translate-y-[-2px]"
                    >
                      <ExternalLink size={16} />
                      Live Demo
                    </a>
                  )}
                </div>
              </div>

              {hasShowcase && (
                <div className="hidden flex-shrink-0 md:block md:w-[260px] lg:w-[300px]">
                  <PhoneShowcase
                    src={project.showcase!}
                    alt={`${project.title} on iPhone`}
                  />
                </div>
              )}
            </div>
          </motion.div>
        </Container>
      </Section>

      <CrookedDivider variant="scribble" className="my-4" />

      <Section spacing="default">
        <Container size="narrow" className="max-w-[57.6rem]">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 20 }}
          >
            <div className="border-3 border-border bg-background p-5 shadow-tactile paper-grain dark:bg-background-dark sm:p-8">
              <MDXRenderer code={project.body.code} />
            </div>
          </motion.div>
        </Container>
      </Section>
    </>
  );
}
