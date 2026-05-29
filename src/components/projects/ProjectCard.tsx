"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ExternalLink, Github } from "lucide-react";
import type { Project } from "contentlayer/generated";
import { StickerTag } from "@/components/decorative/StickerTag";
import { DoodleAccent } from "@/components/decorative/DoodleAccent";
import { cn } from "@/lib/utils";

interface ProjectCardProps {
  project: Project;
  index?: number;
  variant?: "default" | "featured" | "compact";
}

const statusColors: Record<string, "slime" | "mustard" | "muted"> = {
  active: "slime",
  experimental: "mustard",
  archived: "muted",
};

export function ProjectCard({ project, index = 0, variant = "default" }: ProjectCardProps) {
  const rotation = index % 2 === 0 ? -0.6 : 0.5;
  const fallbackImage = project.cover;
  const [imgSrc, setImgSrc] = useState(project.showcase || project.cover);
  const isCompact = variant === "compact";

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{
        delay: index * 0.1,
        type: "spring",
        stiffness: 200,
        damping: 20,
      }}
    >
      <Link href={project.url} className="group block">
        <div
          className={cn(
            "relative border-3 border-border bg-background shadow-tactile",
            "transition-all duration-300",
            "hover:shadow-tactile-lg hover:scale-[1.02] hover:rotate-0",
            "paper-grain",
            variant === "featured" ? "min-h-[320px]" : isCompact ? "min-h-[130px]" : "min-h-[260px]",
          )}
          style={{ transform: `rotate(${rotation}deg)` }}
        >
          {imgSrc && (
            <div className={cn("relative overflow-hidden border-b-3 border-border", isCompact ? "h-24" : "h-48")}>
              <Image
                src={imgSrc}
                alt={project.title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                onError={() => {
                  if (fallbackImage && imgSrc !== fallbackImage) {
                    setImgSrc(fallbackImage);
                  }
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent dark:from-background-dark/60" />
            </div>
          )}

          <div className={cn(isCompact ? "p-3" : "p-5")}>
            {!isCompact && (
              <div className="mb-3 flex items-center gap-2">
                <StickerTag
                  variant={statusColors[project.status]}
                  rotation={index % 2 === 0 ? -3 : 2}
                >
                  {project.status}
                </StickerTag>
                <DoodleAccent
                  variant={index % 3 === 0 ? "star" : index % 3 === 1 ? "circle" : "squiggle"}
                  size={14}
                />
              </div>
            )}

            <h3 className={cn("font-heading font-black transition-colors group-hover:text-mustard", isCompact ? "text-sm" : "text-xl")}>
              {project.title}
            </h3>

            {!isCompact && (
              <p className="mt-2 line-clamp-2 text-sm text-muted">
                {project.description}
              </p>
            )}

            {!isCompact && (
              <div className="mt-4 flex flex-wrap gap-1.5">
                {project.tech.slice(0, 4).map((t) => (
                  <span
                    key={t}
                    className="border-2 border-border px-2 py-0.5 font-heading text-xs font-bold uppercase tracking-wider"
                  >
                    {t}
                  </span>
                ))}
                {project.tech.length > 4 && (
                  <span className="px-2 py-0.5 font-heading text-xs font-bold text-muted">
                    +{project.tech.length - 4}
                  </span>
                )}
              </div>
            )}

            {!isCompact && (
              <div className="mt-4 flex items-center gap-3">
                {project.github && (
                  <span className="flex items-center gap-1 text-xs text-muted transition-colors hover:text-foreground">
                    <Github size={14} />
                    <span>Code</span>
                  </span>
                )}
                {project.demo && (
                  <span className="flex items-center gap-1 text-xs text-muted transition-colors hover:text-foreground">
                    <ExternalLink size={14} />
                    <span>Demo</span>
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
