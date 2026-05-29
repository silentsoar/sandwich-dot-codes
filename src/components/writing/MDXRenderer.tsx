import { getMDXComponent } from "mdx-bundler/client";
import Link from "next/link";
import { cn } from "@/lib/utils";
import React, { useRef, useEffect, useState } from "react";

const mdxComponents = {
  h1: ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h1
      className={cn(
        "mt-12 mb-4 font-heading text-headline font-black leading-[0.95] tracking-tighter first:mt-0",
        className,
      )}
      {...props}
    />
  ),
  h2: ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h2
      className={cn(
        "mt-10 mb-3 font-heading text-subhead font-black leading-tight tracking-tight",
        className,
      )}
      {...props}
    />
  ),
  h3: ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h3
      className={cn(
        "mt-8 mb-2 font-heading text-xl font-black leading-snug",
        className,
      )}
      {...props}
    />
  ),
  p: ({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
    <p
      className={cn("my-4 leading-relaxed text-foreground/90", className)}
      {...props}
    />
  ),
  a: ({ className, href, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => {
    const isExternal = href?.startsWith("http");
    return isExternal ? (
      <a
        className={cn(
          "font-bold text-teal underline decoration-teal/40 decoration-2 underline-offset-4",
          "transition-colors hover:decoration-teal",
          className,
        )}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        {...props}
      />
    ) : (
      <Link
        className={cn(
          "font-bold text-teal underline decoration-teal/40 decoration-2 underline-offset-4",
          "transition-colors hover:decoration-teal",
          className,
        )}
        href={href || "#"}
        {...props}
      />
    );
  },
  ul: ({ className, ...props }: React.HTMLAttributes<HTMLUListElement>) => (
    <ul
      className={cn("my-4 ml-6 list-disc space-y-2 marker:text-mustard", className)}
      {...props}
    />
  ),
  ol: ({ className, ...props }: React.HTMLAttributes<HTMLOListElement>) => (
    <ol
      className={cn("my-4 ml-6 list-decimal space-y-2 marker:text-mustard marker:font-bold", className)}
      {...props}
    />
  ),
  li: ({ className, ...props }: React.HTMLAttributes<HTMLLIElement>) => (
    <li
      className={cn("leading-relaxed text-foreground/90", className)}
      {...props}
    />
  ),
  blockquote: ({ className, ...props }: React.HTMLAttributes<HTMLQuoteElement>) => (
    <blockquote
      className={cn(
        "my-6 border-l-4 border-mustard bg-mustard/10 py-3 pl-6 pr-4",
        "font-heading text-lg italic rotate-[-0.5deg]",
        className,
      )}
      {...props}
    />
  ),
  code: ({ className, ...props }: React.HTMLAttributes<HTMLElement>) => (
    <code
      className={cn(
        "rounded border-2 border-border/30 bg-foreground/5 px-1.5 py-0.5",
        "font-mono text-sm font-bold text-salmon",
        className,
      )}
      {...props}
    />
  ),
  pre: ({ className, ...props }: React.HTMLAttributes<HTMLPreElement>) => (
    <div className="my-6 rotate-[-0.3deg]">
      <pre
        className={cn(
          "overflow-x-auto border-3 border-border bg-foreground p-6",
          "font-mono text-sm text-background shadow-tactile",
          "paper-grain",
          className,
        )}
        {...props}
      />
    </div>
  ),
  hr: () => (
    <div className="my-8 flex items-center justify-center gap-3" aria-hidden="true">
      <span className="h-2 w-2 rotate-45 bg-mustard" />
      <span className="h-2 w-2 rotate-45 bg-teal" />
      <span className="h-2 w-2 rotate-45 bg-salmon" />
    </div>
  ),
  img: ({ src, alt, ...props }: React.ImgHTMLAttributes<HTMLImageElement>) => {
    if (!src) return null;
    const imgRef = useRef<HTMLImageElement>(null);
    const [isSmall, setIsSmall] = useState(false);

    useEffect(() => {
      const img = imgRef.current;
      if (!img) return;
      if (img.complete) {
        setIsSmall(img.naturalWidth < img.parentElement!.parentElement!.clientWidth * 0.5);
      } else {
        img.onload = () => {
          setIsSmall(img.naturalWidth < img.parentElement!.parentElement!.clientWidth * 0.5);
        };
      }
    }, [src]);

    return (
      <figure
        className={cn(
          "my-8 rotate-[-0.3deg]",
          isSmall && "float-right ml-6 mb-4 max-w-[50%]"
        )}
      >
        <div className="w-fit overflow-hidden border-3 border-border shadow-tactile">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            ref={imgRef}
            src={src}
            alt={alt || ""}
            className="max-w-full h-auto"
            loading="lazy"
            {...props}
          />
        </div>
        {alt && (
          <figcaption className="mt-2 text-center text-sm italic text-muted">
            {alt}
          </figcaption>
        )}
      </figure>
    );
  },
  strong: ({ className, ...props }: React.HTMLAttributes<HTMLElement>) => (
    <strong className={cn("font-bold text-foreground", className)} {...props} />
  ),
  em: ({ className, ...props }: React.HTMLAttributes<HTMLElement>) => (
    <em className={cn("italic text-foreground/80", className)} {...props} />
  ),
  table: ({ className, ...props }: React.HTMLAttributes<HTMLTableElement>) => (
    <div className="my-6 overflow-x-auto border-3 border-border">
      <table className={cn("w-full", className)} {...props} />
    </div>
  ),
  th: ({ className, ...props }: React.HTMLAttributes<HTMLTableCellElement>) => (
    <th
      className={cn(
        "border-b-3 border-border bg-foreground px-4 py-3 text-left font-heading text-sm font-bold uppercase tracking-wider text-background",
        className,
      )}
      {...props}
    />
  ),
  td: ({ className, ...props }: React.HTMLAttributes<HTMLTableCellElement>) => (
    <td
      className={cn("border-b border-border/30 px-4 py-3", className)}
      {...props}
    />
  ),
};

interface MDXRendererProps {
  code: string;
  className?: string;
}

export function MDXRenderer({ code, className }: MDXRendererProps) {
  const MDXContent = React.useMemo(() => getMDXComponent(code), [code]);

  return (
    <article className={cn("prose-sandwich", className)}>
      <MDXContent components={mdxComponents} />
    </article>
  );
}
