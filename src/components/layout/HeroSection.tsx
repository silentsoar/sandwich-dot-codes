"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { StickerTag } from "@/components/decorative/StickerTag";
import { DoodleAccent } from "@/components/decorative/DoodleAccent";
import { ScribbleArrow } from "@/components/decorative/ScribbleArrow";
import { HealthStarRating } from "@/components/decorative/HealthStarRating";
import { cn } from "@/lib/utils";

interface ShowcaseItem {
  title: string;
  showcase: string;
  url: string;
}

interface HeroTag {
  label: string;
  href: string;
  source: "project" | "article";
}

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.15,
      type: "spring",
      stiffness: 200,
      damping: 20,
    },
  }),
};

const phonePositions = [
  { rotate: -6, x: 0, y: 0, z: 3 },
  { rotate: 4, x: 40, y: -20, z: 2 },
  { rotate: -2, x: 80, y: 10, z: 1 },
];

const tagVariants = ["teal", "salmon", "slime", "lavender", "mustard"] as const;
const tagRotations = [-1, 1, -2, 0, 2, -0.5, 1.5, -1.5, 0.5, -2.5];

function PhoneMockup({ src, alt, style }: { src: string; alt: string; style: React.CSSProperties }) {
  return (
    <div className="absolute top-0 right-0" style={{ ...style, zIndex: style.zIndex as number }}>
      <div className="relative w-[180px] lg:w-[220px]">
        <div className="relative rounded-[32px] border-[3px] border-border bg-foreground p-[5px] shadow-tactile-lg">
          <div className="relative rounded-[28px] border border-border/40 bg-[#1a1716] p-[3px]">
            <div className="relative overflow-hidden rounded-[26px] bg-background dark:bg-background-dark">
              <div className="absolute left-1/2 top-[6px] z-20 h-[20px] w-[56px] -translate-x-1/2 rounded-full border border-border/30 bg-foreground" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt={alt} className="block w-full" loading="lazy" />
              <div className="absolute bottom-[5px] left-1/2 h-[3px] w-[60px] -translate-x-1/2 rounded-full bg-foreground/40" />
            </div>
          </div>
          <div className="absolute -right-[3px] top-[100px] h-[40px] w-[3px] rounded-r-sm bg-border" aria-hidden="true" />
          <div className="absolute -left-[3px] top-[90px] h-[24px] w-[3px] rounded-l-sm bg-border" aria-hidden="true" />
          <div className="absolute -left-[3px] top-[120px] h-[24px] w-[3px] rounded-l-sm bg-border" aria-hidden="true" />
        </div>
        <div
          className="absolute -top-2.5 left-1/2 z-30 h-5 w-16 -translate-x-1/2 -rotate-2 rounded-sm border border-black/10"
          style={{ backgroundColor: "rgba(214, 179, 71, 0.35)" }}
          aria-hidden="true"
        />
      </div>
    </div>
  );
}

interface HeroSectionProps {
  showcases?: ShowcaseItem[];
  tags?: HeroTag[];
}

export function HeroSection({ showcases = [], tags = [] }: HeroSectionProps) {
  const hasShowcases = showcases.length > 0;

  return (
    <Section className="relative isolate overflow-hidden" spacing="loose">
      <Container className="relative z-10">
        <div className={cn("relative", hasShowcases && "flex items-start gap-8 lg:gap-12")}>
          <div className={cn(hasShowcases && "min-w-0 flex-1")}>
            <motion.div
              custom={0}
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              className="rotate-[-1deg]"
            >
              <StickerTag variant="mustard" rotation={3} className="mb-6">
                AI Experiments
              </StickerTag>
            </motion.div>

            <motion.h1
              custom={1}
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              className="font-heading text-display font-black leading-[0.9] tracking-tighter"
            >
              <span className="block rotate-[-0.5deg]">Sandwich</span>
              <span className="ml-4 block rotate-[0.3deg] text-mustard sm:ml-8 md:ml-16">
                Codes
              </span>
            </motion.h1>

            <motion.div
              custom={2}
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              className="mt-8 max-w-lg rotate-[0.5deg]"
            >
              <p className="text-lg text-muted sm:text-xl">
                AI experiments, web toys, and strange digital artifacts from the
                intersection of code and chaos.
              </p>
            </motion.div>

            <motion.div
              custom={3}
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              className="mt-6 flex items-center gap-4"
            >
              <ScribbleArrow direction="right" />
              <span className="font-heading text-sm font-bold uppercase tracking-widest text-muted">
                Explore the weirdness
              </span>
            </motion.div>

            <motion.div
              custom={4}
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              className="mt-8 flex flex-wrap gap-2"
            >
              {tags.map((tag, i) => (
                <Link
                  key={`${tag.source}-${tag.label}`}
                  href={tag.href}
                  className="inline-block transition-transform hover:-translate-y-0.5"
                  aria-label={`View ${tag.label} ${
                    tag.source === "project" ? "projects" : "articles"
                  }`}
                >
                  <StickerTag
                    variant={tagVariants[i % tagVariants.length]}
                    rotation={tagRotations[i % tagRotations.length]}
                  >
                    {tag.label}
                  </StickerTag>
                </Link>
              ))}
            </motion.div>
          </div>

          {hasShowcases && (
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: -30 }}
              transition={{ delay: 0.4, type: "spring", stiffness: 150, damping: 20 }}
              className="hidden flex-shrink-0 md:block md:w-[260px] lg:w-[340px]"
            >
              <div className="relative h-[360px] lg:h-[420px]">
                {showcases.map((item, i) => {
                  const pos = phonePositions[i] ?? phonePositions[0];
                  return (
                    <Link key={item.url} href={item.url} className="group">
                      <PhoneMockup
                        src={item.showcase}
                        alt={`${item.title} screenshot`}
                        style={{
                          transform: `rotate(${pos.rotate}deg) translate(${pos.x}px, ${pos.y}px)`,
                          zIndex: pos.z,
                        }}
                      />
                    </Link>
                  );
                })}
                <div className="absolute bottom-0 left-0 z-10">
                  <HealthStarRating />
                </div>
              </div>
            </motion.div>
          )}

          <div className="absolute -right-4 top-8 z-10 rotate-12 sm:right-8 md:right-16">
            <DoodleAccent variant="star" color="#D6B347" size={48} />
          </div>
          <div className="absolute -left-2 bottom-0 z-10 sm:left-4">
            <DoodleAccent variant="dot-cluster" color="#6F9D9A" size={40} />
          </div>
          <div className="absolute left-1/3 top-4 z-10 rotate-[-8deg] hidden sm:block">
            <DoodleAccent variant="squiggle" color="#6F9D9A" size={64} />
          </div>
          <div className="absolute right-12 bottom-12 z-10 rotate-6 hidden sm:block">
            <DoodleAccent variant="arrow" color="#D98B73" size={40} />
          </div>
          <div className="absolute right-1/3 top-1/2 z-10 rotate-[-4deg] hidden md:block">
            <DoodleAccent variant="circle" color="#B8A7CC" size={36} />
          </div>
        </div>
      </Container>

      <div
        className="absolute -top-28 -right-32 animate-float opacity-[0.08] pointer-events-none hidden lg:block"
        style={{ animationDuration: "12s", animationDelay: "-2s" }}
      >
        <div className="rotate-12">
          <DoodleAccent variant="star" color="#D6B347" size={560} />
        </div>
      </div>
      <div
        className="absolute -bottom-32 -left-28 animate-float opacity-[0.07] pointer-events-none hidden lg:block"
        style={{ animationDuration: "14s", animationDelay: "-5s" }}
      >
        <div className="rotate-[-15deg]">
          <DoodleAccent variant="circle" color="#6F9D9A" size={540} />
        </div>
      </div>
      <div
        className="absolute top-1/4 right-1/4 animate-float opacity-[0.06] pointer-events-none hidden xl:block"
        style={{ animationDuration: "10s", animationDelay: "-7s" }}
      >
        <div className="rotate-6">
          <DoodleAccent variant="squiggle" color="#B8A7CC" size={500} />
        </div>
      </div>
      <div
        className="absolute -top-10 left-[14%] animate-float opacity-[0.07] pointer-events-none hidden lg:block"
        style={{ animationDuration: "11s", animationDelay: "-4s" }}
      >
        <div className="rotate-[-8deg]">
          <DoodleAccent variant="dot-cluster" color="#D98B73" size={300} />
        </div>
      </div>
      <div
        className="absolute bottom-8 right-[8%] animate-float opacity-[0.07] pointer-events-none hidden lg:block"
        style={{ animationDuration: "13s", animationDelay: "-8s" }}
      >
        <div className="rotate-12">
          <DoodleAccent variant="x" color="#9FAF6F" size={260} />
        </div>
      </div>
      <div
        className="absolute bottom-1/3 left-[44%] animate-float opacity-[0.06] pointer-events-none hidden xl:block"
        style={{ animationDuration: "15s", animationDelay: "-10s" }}
      >
        <div className="rotate-[-18deg]">
          <DoodleAccent variant="arrow" color="#D6B347" size={320} />
        </div>
      </div>
      <div
        className="absolute top-20 left-[2%] animate-float opacity-[0.06] pointer-events-none hidden xl:block"
        style={{ animationDuration: "16s", animationDelay: "-3s" }}
      >
        <div className="rotate-12">
          <DoodleAccent variant="circle" color="#D98B73" size={360} />
        </div>
      </div>
      <div
        className="absolute top-[42%] -right-20 animate-float opacity-[0.07] pointer-events-none hidden lg:block"
        style={{ animationDuration: "12s", animationDelay: "-6s" }}
      >
        <div className="rotate-[-10deg]">
          <DoodleAccent variant="dot-cluster" color="#B8A7CC" size={280} />
        </div>
      </div>
      <div
        className="absolute bottom-0 left-[22%] animate-float opacity-[0.06] pointer-events-none hidden xl:block"
        style={{ animationDuration: "18s", animationDelay: "-11s" }}
      >
        <div className="rotate-6">
          <DoodleAccent variant="squiggle" color="#9FAF6F" size={420} />
        </div>
      </div>
    </Section>
  );
}
