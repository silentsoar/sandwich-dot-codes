import Link from "next/link";
import { siteConfig, navItems } from "@/lib/config";
import { Container } from "@/components/layout/Container";
import { DoodleAccent } from "@/components/decorative/DoodleAccent";

export function Footer() {
  return (
    <footer className="border-t-3 border-border bg-foreground py-12 text-background">
      <Container>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div className="rotate-[-0.5deg]">
            <h3 className="font-heading text-2xl font-black">{siteConfig.name}</h3>
            <p className="mt-2 max-w-xs text-sm text-background/70">
              {siteConfig.description}
            </p>
            <p className="mt-2 text-xs text-background/50">
              By {siteConfig.author}
            </p>
          </div>

          <div className="rotate-[0.3deg]">
            <h4 className="mb-3 font-heading text-sm font-bold uppercase tracking-widest text-mustard">
              Navigate
            </h4>
            <ul className="space-y-2">
              {navItems.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-background/70 transition-colors hover:text-mustard"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="rotate-[-0.3deg]">
            <h4 className="mb-3 font-heading text-sm font-bold uppercase tracking-widest text-teal">
              Connect
            </h4>
            <ul className="space-y-2">
              <li>
                <a
                  href={siteConfig.links.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-background/70 transition-colors hover:text-teal"
                >
                  GitHub
                </a>
              </li>
              {siteConfig.links.twitter && (
                <li>
                  <a
                    href={siteConfig.links.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-background/70 transition-colors hover:text-teal"
                  >
                    Twitter
                  </a>
                </li>
              )}
            </ul>
          </div>
        </div>

        <div className="mt-12 flex items-center justify-between border-t border-background/20 pt-6">
          <p className="text-xs text-background/50">
            &copy; {new Date().getFullYear()} {siteConfig.name}. All rights (and lefts) reserved.
          </p>
          <DoodleAccent variant="squiggle" color="#D6B347" size={20} />
        </div>
      </Container>
    </footer>
  );
}
