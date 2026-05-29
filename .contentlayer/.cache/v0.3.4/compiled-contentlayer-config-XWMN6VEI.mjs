// contentlayer.config.ts
import { defineDocumentType, makeSource } from "contentlayer2/source-files";
import readingTime from "reading-time";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeHighlight from "rehype-highlight";
import remarkGfm from "remark-gfm";
var glsl = () => ({
  name: "GLSL",
  case_insensitive: false,
  keywords: {
    keyword: "attribute const uniform varying buffer shared coherent volatile restrict readonly writeonly atomic_uint layout centroid flat smooth noperspective patch sample break continue do for while switch case default if else subroutine in out inout float double int void bool true false invariant discard return mat2 mat3 mat4 vec2 vec3 vec4 ivec2 ivec3 ivec4 bvec2 bvec3 bvec4 sampler2D samplerCube struct",
    built_in: "radians degrees sin cos tan asin acos atan pow exp log exp2 log2 sqrt inversesqrt abs sign floor trunc round ceil fract mod min max clamp mix step smoothstep length distance dot cross normalize faceforward reflect refract texture texture2D textureCube gl_Position gl_FragCoord gl_FragColor"
  },
  contains: [
    { scope: "comment", begin: /\/\*/, end: /\*\// },
    { scope: "comment", begin: /\/\//, end: /$/ },
    { scope: "string", begin: /"/, end: /"/ },
    { scope: "number", begin: /\b\d+(\.\d+)?/ },
    { scope: "meta", begin: /#\s*[a-z]+\b/, end: /$/ }
  ]
});
var Project = defineDocumentType(() => ({
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
      required: true
    },
    cover: { type: "string", required: true },
    showcase: { type: "string" },
    tech: { type: "list", of: { type: "string" }, required: true }
  },
  computedFields: {
    slug: {
      type: "string",
      resolve: (doc) => doc._raw.sourceFileName.replace(/\.mdx$/, "")
    },
    readingTime: {
      type: "string",
      resolve: (doc) => readingTime(doc.body.raw).text
    },
    url: {
      type: "string",
      resolve: (doc) => `/projects/${doc._raw.sourceFileName.replace(/\.mdx$/, "")}`
    }
  }
}));
var Article = defineDocumentType(() => ({
  name: "Article",
  filePathPattern: "writing/**/*.mdx",
  contentType: "mdx",
  fields: {
    title: { type: "string", required: true },
    description: { type: "string", required: true },
    date: { type: "string", required: true },
    tags: { type: "list", of: { type: "string" }, required: true },
    cover: { type: "string" },
    featured: { type: "boolean", default: false }
  },
  computedFields: {
    slug: {
      type: "string",
      resolve: (doc) => doc._raw.sourceFileName.replace(/\.mdx$/, "")
    },
    readingTime: {
      type: "string",
      resolve: (doc) => readingTime(doc.body.raw).text
    },
    url: {
      type: "string",
      resolve: (doc) => `/writing/${doc._raw.sourceFileName.replace(/\.mdx$/, "")}`
    },
    firstBodyImage: {
      type: "string",
      resolve: (doc) => {
        const mdMatch = doc.body.raw.match(/!\[.*?\]\(([^)]+)\)/);
        if (mdMatch)
          return mdMatch[1];
        const imgMatch = doc.body.raw.match(/<img[^>]+src=["']([^"']+)["']/);
        if (imgMatch)
          return imgMatch[1];
        return void 0;
      }
    }
  }
}));
var Experiment = defineDocumentType(() => ({
  name: "Experiment",
  filePathPattern: "experiments/**/*.mdx",
  contentType: "mdx",
  fields: {
    title: { type: "string", required: true },
    description: { type: "string", required: true },
    date: { type: "string", required: true },
    tags: { type: "list", of: { type: "string" }, required: true },
    demo: { type: "string" },
    github: { type: "string" }
  },
  computedFields: {
    slug: {
      type: "string",
      resolve: (doc) => doc._raw.sourceFileName.replace(/\.mdx$/, "")
    },
    readingTime: {
      type: "string",
      resolve: (doc) => readingTime(doc.body.raw).text
    },
    url: {
      type: "string",
      resolve: (doc) => `/experiments/${doc._raw.sourceFileName.replace(/\.mdx$/, "")}`
    }
  }
}));
var contentlayer_config_default = makeSource({
  contentDirPath: "content",
  documentTypes: [Project, Article, Experiment],
  mdx: {
    remarkPlugins: [remarkGfm],
    rehypePlugins: [
      rehypeSlug,
      [rehypeAutolinkHeadings, { behavior: "wrap" }],
      [rehypeHighlight, { languages: { glsl } }]
    ]
  }
});
export {
  Article,
  Experiment,
  Project,
  contentlayer_config_default as default
};
//# sourceMappingURL=compiled-contentlayer-config-XWMN6VEI.mjs.map
