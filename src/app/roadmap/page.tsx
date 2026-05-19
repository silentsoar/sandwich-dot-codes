import type { Metadata } from "next";
import { readFileSync } from "fs";
import { join } from "path";
import { RoadmapPageContent } from "@/components/roadmap/RoadmapPageContent";
import { isValidRoadmapAuth } from "@/lib/roadmap-auth";

export const metadata: Metadata = {
  title: "Roadmap",
  description: "The big board of things to build, fix, and dream up.",
};

export const dynamic = "force-dynamic";

function readBoard() {
  try {
    const filePath = join(process.cwd(), "content", "roadmap.json");
    const raw = readFileSync(filePath, "utf-8");
    return JSON.parse(raw);
  } catch {
    return { columns: [] };
  }
}

export default function RoadmapPage() {
  const board = readBoard();
  const auth = isValidRoadmapAuth();

  return <RoadmapPageContent initialBoard={board} initialAuth={auth} />;
}
