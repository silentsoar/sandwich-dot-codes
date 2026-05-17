import { defineDocumentType, makeSource } from "contentlayer2/source-files";
import readingTime from "reading-time";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeHighlight from "rehype-highlight";
import remarkGfm from "remark-gfm";

export const Project = defineDocumentType(() => ({
  name: "Project",
  filePathPattern: "projects/**/*.mdx",
  contentType: "mdx",
  fields: {
    title: { type: "string", required: true },
    description: { type: "string", required: true },
    date: { type: "string", required: true },
    tags: { type: "list", of: { type: "string" }, required: true },
    featured: { type: "boolean", default: false },
    github: { type: "string", required: true },
    demo: { type: "string" },
    status: {
      type: "enum",
      options: ["active", "experimental", "archived"],
      required: true,
    },
    cover: { type: "string", required: true },
    showcase: { type: "string" },
    tech: { type: "list", of: { type: "string" }, required: true },
  },
  computedFields: {
    slug: {
      type: "string",
      resolve: (doc) => doc._raw.sourceFileName.replace(/\.mdx$/, ""),
    },
    readingTime: {
      type: "string",
      resolve: (doc) => readingTime(doc.body.raw).text,
    },
    url: {
      type: "string",
      resolve: (doc) => `/projects/${doc._raw.sourceFileName.replace(/\.mdx$/, "")}`,
    },
  },
}));

export const Article = defineDocumentType(() => ({
  name: "Article",
  filePathPattern: "writing/**/*.mdx",
  contentType: "mdx",
  fields: {
    title: { type: "string", required: true },
    description: { type: "string", required: true },
    date: { type: "string", required: true },
    tags: { type: "list", of: { type: "string" }, required: true },
    cover: { type: "string" },
    featured: { type: "boolean", default: false },
  },
  computedFields: {
    slug: {
      type: "string",
      resolve: (doc) => doc._raw.sourceFileName.replace(/\.mdx$/, ""),
    },
    readingTime: {
      type: "string",
      resolve: (doc) => readingTime(doc.body.raw).text,
    },
    url: {
      type: "string",
      resolve: (doc) => `/writing/${doc._raw.sourceFileName.replace(/\.mdx$/, "")}`,
    },
  },
}));

export const Experiment = defineDocumentType(() => ({
  name: "Experiment",
  filePathPattern: "experiments/**/*.mdx",
  contentType: "mdx",
  fields: {
    title: { type: "string", required: true },
    description: { type: "string", required: true },
    date: { type: "string", required: true },
    tags: { type: "list", of: { type: "string" }, required: true },
    demo: { type: "string" },
    github: { type: "string" },
  },
  computedFields: {
    slug: {
      type: "string",
      resolve: (doc) => doc._raw.sourceFileName.replace(/\.mdx$/, ""),
    },
    readingTime: {
      type: "string",
      resolve: (doc) => readingTime(doc.body.raw).text,
    },
    url: {
      type: "string",
      resolve: (doc) => `/experiments/${doc._raw.sourceFileName.replace(/\.mdx$/, "")}`,
    },
  },
}));

export default makeSource({
  contentDirPath: "content",
  documentTypes: [Project, Article, Experiment],
  mdx: {
    remarkPlugins: [remarkGfm],
    rehypePlugins: [
      rehypeSlug,
      [rehypeAutolinkHeadings, { behavior: "wrap" }],
      rehypeHighlight,
    ],
  },
});
