export type Project = {
  title: string;
  description: string;
  date: string;
  tags: string[];
  featured: boolean;
  github: string;
  demo?: string;
  status: "active" | "experimental" | "archived";
  cover: string;
  tech: string[];
  slug: string;
};

export type Article = {
  title: string;
  description: string;
  date: string;
  tags: string[];
  cover?: string;
  featured?: boolean;
  slug: string;
  readingTime?: string;
};

export type Experiment = {
  title: string;
  description: string;
  date: string;
  tags: string[];
  demo?: string;
  github?: string;
  slug: string;
};

export type NavItem = {
  label: string;
  href: string;
};

export type SiteConfig = {
  name: string;
  author: string;
  description: string;
  url: string;
  ogImage: string;
  links: {
    github: string;
    twitter?: string;
  };
};
