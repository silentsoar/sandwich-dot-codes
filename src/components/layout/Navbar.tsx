"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { allProjects, allArticles, allExperiments } from "contentlayer/generated";
import { navItems, siteConfig } from "@/lib/config";
import { Container } from "@/components/layout/Container";
import { SearchModal } from "@/components/ui/SearchModal";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { cn } from "@/lib/utils";

const searchItems = [
  ...allProjects.map((p) => ({
    title: p.title,
    description: p.description,
    url: p.url,
    type: "project" as const,
    tags: [...p.tags, ...p.tech],
  })),
  ...allArticles.map((a) => ({
    title: a.title,
    description: a.description,
    url: a.url,
    type: "article" as const,
    tags: a.tags,
  })),
  ...allExperiments.map((e) => ({
    title: e.title,
    description: e.description,
    url: e.url,
    type: "experiment" as const,
    tags: e.tags,
  })),
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b-3 border-border bg-background/95 backdrop-blur-sm dark:bg-[#1a1816]/95">
      <Container>
        <nav className="flex h-16 items-center justify-between gap-4">
          <Link
            href="/"
            className="shrink-0 transition-transform hover:rotate-[-1deg] hover:scale-105"
          >
            <span className="font-heading text-xl font-black tracking-tight">
              {siteConfig.name}
            </span>
            <span className="ml-2 font-heading text-xs text-muted">
              by {siteConfig.author}
            </span>
          </Link>

          <ul className="hidden items-center gap-1 md:flex">
            {navItems.map((item, i) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "relative px-3 py-2 font-heading text-sm font-bold uppercase tracking-wider",
                    "transition-all duration-200",
                    "hover:bg-mustard/20 hover:rotate-[-1deg]",
                    i % 2 === 0 ? "rotate-[-0.5deg]" : "rotate-[0.5deg]",
                  )}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-2">
            <SearchModal items={searchItems} />
            <ThemeToggle />
            <button
              className="flex h-9 w-9 items-center justify-center border-2 border-border/50 md:hidden"
              onClick={() => setIsOpen(!isOpen)}
              aria-label={isOpen ? "Close menu" : "Open menu"}
            >
              {isOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </nav>
      </Container>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="overflow-hidden border-t-3 border-border bg-background dark:bg-[#1a1816] md:hidden"
          >
            <Container>
              <ul className="flex flex-col gap-1 py-4">
                {navItems.map((item, i) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className={cn(
                        "block px-3 py-3 font-heading text-lg font-bold uppercase tracking-wider",
                        "border-b border-border/30",
                        "transition-all duration-200",
                        "hover:bg-mustard/20 hover:pl-5",
                        i % 2 === 0 ? "rotate-[-0.3deg]" : "rotate-[0.3deg]",
                      )}
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </Container>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
