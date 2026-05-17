import type { NavItem, SiteConfig } from "@/types";

export const siteConfig: SiteConfig = {
  name: "Sandwich Codes",
  author: "Dylan Gibbs",
  description: "AI project portfolio and editorial website showcasing web experiments and GitHub-hosted applications.",
  url: "https://sandwich.codes",
  ogImage: "/og.png",
  links: {
    github: "https://github.com/sandwich-codes",
    twitter: undefined,
  },
};

export const navItems: NavItem[] = [
  { label: "Projects", href: "/projects" },
  { label: "Writing", href: "/writing" },
  { label: "Experiments", href: "/experiments" },
  { label: "About", href: "/about" },
  { label: "Uses", href: "/uses" },
  { label: "Contact", href: "/contact" },
];
