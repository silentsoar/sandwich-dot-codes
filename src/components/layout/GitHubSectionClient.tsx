"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  GitCommit,
  GitPullRequest,
  Tag,
  RefreshCw,
  ExternalLink,
} from "lucide-react";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { DoodleAccent } from "@/components/decorative/DoodleAccent";
import { StickerTag } from "@/components/decorative/StickerTag";
import type { TimelineEvent } from "@/lib/github";
import { formatDistanceToNow } from "date-fns";

interface GitHubSectionClientProps {
  initialTimeline: TimelineEvent[];
}

const POLL_INTERVAL_MS = 90_000;

const eventConfig: Record<
  TimelineEvent["type"],
  {
    icon: typeof GitCommit;
    color: string;
    borderColor: string;
    dotBg: string;
    label: string;
  }
> = {
  commit: {
    icon: GitCommit,
    color: "text-teal",
    borderColor: "border-l-teal/40 hover:border-l-teal",
    dotBg: "bg-teal/10",
    label: "Commit",
  },
  pull_request: {
    icon: GitPullRequest,
    color: "text-mustard",
    borderColor: "border-l-mustard/40 hover:border-l-mustard",
    dotBg: "bg-mustard/10",
    label: "Pull Request",
  },
  release: {
    icon: Tag,
    color: "text-salmon",
    borderColor: "border-l-salmon/40 hover:border-l-salmon",
    dotBg: "bg-salmon/10",
    label: "Release",
  },
};

function getEventDescription(event: TimelineEvent): string {
  switch (event.type) {
    case "commit": {
      const count = event.meta?.commitCount ?? 1;
      return count > 1 ? `${count} commits` : event.meta?.commitSha ?? "";
    }
    case "pull_request": {
      const action = event.meta?.prAction ?? "updated";
      const num = event.meta?.prNumber ? ` #${event.meta.prNumber}` : "";
      return `${action.charAt(0).toUpperCase() + action.slice(1)} PR${num}`;
    }
    case "release": {
      return event.meta?.releaseTag ? `Published ${event.meta.releaseTag}` : "Published";
    }
  }
}

function TimelineItem({ event, index }: { event: TimelineEvent; index: number }) {
  const config = eventConfig[event.type];
  const Icon = config.icon;
  const timeAgo = formatDistanceToNow(new Date(event.date), { addSuffix: true });

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay: Math.min(index * 0.04, 0.5),
        type: "spring",
        stiffness: 200,
        damping: 20,
      }}
    >
      <a
        href={event.url}
        target="_blank"
        rel="noopener noreferrer"
        className={`group flex items-start gap-3 border-l-4 ${config.borderColor} py-2.5 pl-4 transition-all hover:pl-5`}
      >
        <div
          className={`mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${config.dotBg}`}
        >
          <Icon size={14} className={config.color} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <p className="line-clamp-1 font-mono text-sm transition-colors group-hover:text-mustard">
              {event.title}
            </p>
            <ExternalLink
              size={12}
              className="mt-0.5 shrink-0 text-muted opacity-0 transition-opacity group-hover:opacity-100"
            />
          </div>
          <div className="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs text-muted">
            <span className="font-heading font-bold">{event.repo}</span>
            <span>·</span>
            <span>{getEventDescription(event)}</span>
            <span>·</span>
            <time dateTime={event.date}>{timeAgo}</time>
          </div>
        </div>
      </a>
    </motion.div>
  );
}

export function GitHubSectionClient({ initialTimeline }: GitHubSectionClientProps) {
  const [timeline, setTimeline] = useState<TimelineEvent[]>(initialTimeline);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const refresh = useCallback(async () => {
    try {
      setIsRefreshing(true);
      const res = await fetch("/api/github-timeline");
      if (res.ok) {
        const data: TimelineEvent[] = await res.json();
        setTimeline(data);
      }
    } catch {
      // keep existing data
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    intervalRef.current = setInterval(refresh, POLL_INTERVAL_MS);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [refresh]);

  const hasData = timeline.length > 0;

  return (
    <Section spacing="default">
      <Container>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="mb-8 rotate-[-0.2deg]"
        >
          <div className="flex items-start justify-between">
            <div>
              <DoodleAccent variant="circle" color="#6F9D9A" size={32} className="mb-2" />
              <h2 className="font-heading text-headline font-black">GitHub Activity</h2>
              <p className="mt-2 text-muted">
                Pull requests, releases, and commits across all repositories.
              </p>
            </div>
            {hasData && (
              <button
                onClick={refresh}
                disabled={isRefreshing}
                className="mt-2 shrink-0 rounded-lg border-2 border-border bg-background p-2 shadow-tactile-sm transition-all hover:scale-105 disabled:opacity-50"
                aria-label="Refresh timeline"
              >
                <RefreshCw
                  size={16}
                  className={`text-muted ${isRefreshing ? "animate-spin" : ""}`}
                />
              </button>
            )}
          </div>
        </motion.div>

        {!hasData ? (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="py-12 text-center"
          >
            <StickerTag variant="teal" rotation={-2}>
              Set GITHUB_TOKEN for live data
            </StickerTag>
          </motion.div>
        ) : (
          <div className="relative">
            <div className="timeline-scroll max-h-[1024px] space-y-1 overflow-y-auto pr-2">
              <AnimatePresence mode="popLayout">
                {timeline.map((event, i) => (
                  <TimelineItem key={event.id} event={event} index={i} />
                ))}
              </AnimatePresence>
            </div>
            <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-background to-transparent" />
          </div>
        )}
      </Container>
    </Section>
  );
}
