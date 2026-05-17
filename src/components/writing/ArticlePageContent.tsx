"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, Clock, Share2 } from "lucide-react";
import type { Article } from "contentlayer/generated";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { MDXRenderer } from "@/components/writing/MDXRenderer";
import { StickerTag } from "@/components/decorative/StickerTag";
import { CrookedDivider } from "@/components/decorative/CrookedDivider";
import { siteConfig } from "@/lib/config";

interface ArticlePageContentProps {
  article: Article;
}

export function ArticlePageContent({ article }: ArticlePageContentProps) {
  return (
    <>
      <Section spacing="default">
        <Container size="narrow">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
          >
            <Link
              href="/writing"
              className="mb-8 inline-flex items-center gap-2 font-heading text-sm font-bold uppercase tracking-widest text-muted transition-colors hover:text-foreground"
            >
              <ArrowLeft size={16} />
              All Writing
            </Link>

            <div className="mb-4 flex flex-wrap gap-2">
              {article.tags.map((tag) => (
                <StickerTag key={tag} variant="teal" rotation={Math.random() * 4 - 2}>
                  #{tag}
                </StickerTag>
              ))}
            </div>

            <h1 className="font-heading text-display font-black leading-[0.95] tracking-tighter rotate-[-0.2deg]">
              {article.title}
            </h1>

            <p className="mt-4 max-w-2xl text-lg text-muted rotate-[0.1deg]">
              {article.description}
            </p>

            <div className="mt-6 flex items-center gap-4 text-sm text-muted">
              <span className="font-heading font-bold">{siteConfig.author}</span>
              <span>·</span>
              <time dateTime={article.date}>
                {new Date(article.date).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </time>
              {article.readingTime && (
                <span className="flex items-center gap-1">
                  <Clock size={14} />
                  {article.readingTime}
                </span>
              )}
              <button
                onClick={() => {
                  if (typeof navigator !== "undefined" && navigator.share) {
                    navigator.share({
                      title: article.title,
                      url: window.location.href,
                    });
                  }
                }}
                className="flex items-center gap-1 transition-colors hover:text-foreground"
                aria-label="Share article"
              >
                <Share2 size={14} />
                Share
              </button>
            </div>
          </motion.div>
        </Container>
      </Section>

      <CrookedDivider variant="wavy" color="#6F9D9A" className="my-4" />

      <Section spacing="default">
        <Container size="narrow">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 20 }}
          >
            <MDXRenderer code={article.body.code} />
          </motion.div>
        </Container>
      </Section>
    </>
  );
}
