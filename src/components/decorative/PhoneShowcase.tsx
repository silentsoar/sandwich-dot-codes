"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface PhoneShowcaseProps {
  src: string;
  alt?: string;
  className?: string;
}

export function PhoneShowcase({ src, alt = "App screenshot", className }: PhoneShowcaseProps) {
  return (
    <motion.div
      className={cn("flex justify-center", className)}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, type: "spring", stiffness: 150, damping: 20 }}
    >
      <div className="relative w-full max-w-[300px]">
        {/* Phone outer body */}
        <div className="relative rounded-[40px] border-[3px] border-border bg-foreground p-[6px] shadow-tactile-lg">
          {/* Phone inner bezel */}
          <div className="relative rounded-[35px] border border-border/40 bg-[#1a1716] p-[4px]">
            {/* Screen */}
            <div className="relative overflow-hidden rounded-[32px] bg-background">
              {/* Dynamic Island */}
              <div className="absolute left-1/2 top-[8px] z-20 h-[26px] w-[76px] -translate-x-1/2 rounded-full border border-border/30 bg-foreground" />

              {/* Screenshot */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt={alt}
                className="block w-full"
                loading="lazy"
              />

              {/* Home indicator */}
              <div className="absolute bottom-[6px] left-1/2 h-[4px] w-[80px] -translate-x-1/2 rounded-full bg-foreground/40" />
            </div>
          </div>

          {/* Side buttons */}
          <div className="absolute -right-[3px] top-[140px] h-[50px] w-[3px] rounded-r-sm bg-border" aria-hidden="true" />
          <div className="absolute -left-[3px] top-[130px] h-[30px] w-[3px] rounded-l-sm bg-border" aria-hidden="true" />
          <div className="absolute -left-[3px] top-[170px] h-[30px] w-[3px] rounded-l-sm bg-border" aria-hidden="true" />
        </div>

        {/* Decorative tape */}
        <div
          className="absolute -top-3 left-1/2 z-30 h-6 w-20 -translate-x-1/2 -rotate-2 rounded-sm border border-black/10"
          style={{ backgroundColor: "rgba(214, 179, 71, 0.35)" }}
          aria-hidden="true"
        />
      </div>
    </motion.div>
  );
}
