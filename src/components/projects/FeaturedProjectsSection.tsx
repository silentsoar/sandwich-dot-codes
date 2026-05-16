"use client";

import { motion } from "framer-motion";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { DoodleAccent } from "@/components/decorative/DoodleAccent";
import { ProjectCard } from "@/components/projects/ProjectCard";
import type { Project } from "contentlayer/generated";

interface FeaturedProjectsSectionProps {
  projects: Project[];
}

export function FeaturedProjectsSection({ projects }: FeaturedProjectsSectionProps) {
  return (
    <Section className="relative overflow-hidden" spacing="default">
      <Container>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="mb-12 rotate-[-0.3deg]"
        >
          <h2 className="font-heading text-headline font-black">Featured Projects</h2>
          <p className="mt-2 text-muted">
            Weird stuff I made with code and questionable judgment.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {projects.map((project, i) => (
            <ProjectCard
              key={project.slug}
              project={project}
              index={i}
              variant={i === 0 ? "featured" : "default"}
            />
          ))}
        </div>
      </Container>

      <div className="absolute -top-12 -left-20 rotate-[-8deg] opacity-[0.05] pointer-events-none hidden lg:block">
        <DoodleAccent variant="dot-cluster" color="#D98B73" size={400} />
      </div>
      <div className="absolute -bottom-16 -right-24 rotate-[10deg] opacity-[0.06] pointer-events-none hidden lg:block">
        <DoodleAccent variant="star" color="#9FB06F" size={420} />
      </div>
    </Section>
  );
}
