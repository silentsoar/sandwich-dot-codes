"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Clock, ArrowRight } from "lucide-react";
import type { Article } from "contentlayer/generated";
import { TapeFrame } from "@/components/decorative/TapeFrame";
import { cn } from "@/lib/utils";

interface ArticleCardProps {
  article: Article;
  index?: number;
  variant?: "default" | "compact";
}

export function ArticleCard({ article, index = 0, variant = "default" }: ArticleCardProps) {
  const rotation = index % 2 === 0 ? -0.5 : 0.4;
  const tapePosition = index % 3 === 0 ? "top-left" : index % 3 === 1 ? "top-right" : "top";
  const cardImage = article.cover || article.firstBodyImage;
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
      <Link href={article.url} className="group block">
        {isCompact ? (
          <div
            className={cn(
              "border-3 border-border bg-background",
              "transition-all duration-300",
              "hover:shadow-tactile-lg hover:scale-[1.02] hover:rotate-0",
              "paper-grain",
              "min-h-[130px]",
            )}
            style={{ transform: `rotate(${rotation}deg)` }}
          >
            {cardImage && (
              <div className="relative h-24 overflow-hidden border-b-3 border-border">
                <Image
                  src={cardImage}
                  alt={article.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent dark:from-background-dark/60" />
              </div>
            )}

            <div className="p-3">
              <h3 className="font-heading text-sm font-black transition-colors group-hover:text-mustard">
                {article.title}
              </h3>
            </div>
          </div>
        ) : (
          <TapeFrame tapePosition={tapePosition}>
            <div
              className={cn(
                "border-3 border-border bg-background",
                "transition-all duration-300",
                "hover:shadow-tactile hover:scale-[1.02] hover:rotate-0",
                "paper-grain",
              )}
              style={{ transform: `rotate(${rotation}deg)` }}
            >
              {cardImage && (
                <div className="relative h-48 overflow-hidden border-b-3 border-border">
                  <Image
                    src={cardImage}
                    alt={article.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent dark:from-background-dark/60" />
                </div>
              )}

              <div className="p-6">
                <div className="flex items-center gap-3 text-xs text-muted">
                  <time dateTime={article.date} suppressHydrationWarning>
                    {new Date(article.date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </time>
                  {article.readingTime && (
                    <span className="flex items-center gap-1">
                      <Clock size={12} />
                      {article.readingTime}
                    </span>
                  )}
                </div>

                <h3 className="mt-3 font-heading text-xl font-black transition-colors group-hover:text-mustard">
                  {article.title}
                </h3>

                <p className="mt-2 line-clamp-2 text-sm text-muted">
                  {article.description}
                </p>

                <div className="mt-4 flex flex-wrap gap-2">
                  {article.tags.map((tag) => (
                    <span
                      key={tag}
                      className="font-heading text-xs font-bold text-teal"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>

                <div className="mt-4 flex items-center gap-1 text-sm font-bold text-foreground opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:gap-2">
                  <span>Read more</span>
                  <ArrowRight size={14} />
                </div>
              </div>
            </div>
          </TapeFrame>
        )}
      </Link>
    </motion.div>
  );
}
