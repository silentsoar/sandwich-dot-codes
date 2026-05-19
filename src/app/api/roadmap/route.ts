import { NextResponse } from "next/server";
import { z } from "zod";
import { isValidRoadmapAuth } from "@/lib/roadmap-auth";

export const revalidate = 0;

const STORAGE_KEY = "roadmap:board";
const GITHUB_OWNER = "silentsoar";
const GITHUB_REPO = "sandwich-dot-codes";
const FILE_PATH = "content/roadmap.json";

interface KanbanCard {
  id: string;
  title?: string;
  details?: string;
  text?: string;
  lane?: string;
}

interface KanbanColumn {
  id: string;
  title: string;
  cards: KanbanCard[];
}

interface KanbanBoard {
  columns: KanbanColumn[];
}

const cardSchema = z.object({
  id: z.string().min(1).max(128),
  title: z.string().max(200).optional(),
  details: z.string().max(5000).optional(),
  text: z.string().max(200).optional(),
  lane: z.string().max(64).optional(),
});

const boardSchema = z.object({
  columns: z.array(z.object({
    id: z.string().min(1).max(64),
    title: z.string().min(1).max(100),
    cards: z.array(cardSchema).max(200),
  })).max(20),
});

function hasRedis(): boolean {
  return !!(process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL);
}

async function readFromRedis(): Promise<KanbanBoard | null> {
  if (!hasRedis()) return null;
  try {
    const { Redis } = await import("@upstash/redis");
    const redis = new Redis({
      url: process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL ?? "",
      token: process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN ?? "",
    });
    const data = await redis.get<KanbanBoard>(STORAGE_KEY);
    return data?.columns ? data : null;
  } catch {
    return null;
  }
}

async function writeToRedis(board: KanbanBoard): Promise<boolean> {
  if (!hasRedis()) return false;
  try {
    const { Redis } = await import("@upstash/redis");
    const redis = new Redis({
      url: process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL ?? "",
      token: process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN ?? "",
    });
    await redis.set(STORAGE_KEY, board);
    return true;
  } catch {
    return false;
  }
}

const githubHeaders: Record<string, string> = {
  Accept: "application/vnd.github.v3+json",
  ...(process.env.GITHUB_TOKEN && {
    Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
  }),
};

async function readFromFile(): Promise<KanbanBoard> {
  try {
    const fs = await import("fs");
    const path = await import("path");
    const filePath = path.join(process.cwd(), FILE_PATH);
    const raw = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(raw);
  } catch {
    return { columns: [] };
  }
}

async function readFromGitHub(): Promise<KanbanBoard | null> {
  if (!process.env.GITHUB_TOKEN) return null;
  try {
    const res = await fetch(
      `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${FILE_PATH}`,
      { headers: githubHeaders, next: { revalidate: 0 } },
    );
    if (!res.ok) return null;
    const data = await res.json();
    const content = Buffer.from(data.content, "base64").toString("utf-8");
    return JSON.parse(content);
  } catch {
    return null;
  }
}

async function writeToGitHub(board: KanbanBoard): Promise<{ success: boolean; error?: string }> {
  if (!process.env.GITHUB_TOKEN) {
    return { success: false, error: "No GITHUB_TOKEN configured" };
  }

  try {
    const res = await fetch(
      `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${FILE_PATH}`,
      { headers: githubHeaders, next: { revalidate: 0 } },
    );
    if (!res.ok) return { success: false, error: `GitHub read failed (${res.status})` };
    const fileData = await res.json();

    const content = Buffer.from(JSON.stringify(board, null, 2) + "\n").toString("base64");

    const updateRes = await fetch(
      `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${FILE_PATH}`,
      {
        method: "PUT",
        headers: { ...githubHeaders, "Content-Type": "application/json" },
        body: JSON.stringify({
          message: "Update roadmap board",
          content,
          sha: fileData.sha,
        }),
      },
    );

    if (!updateRes.ok) {
      const err = await updateRes.json().catch(() => ({}));
      return { success: false, error: err.message || `GitHub write failed (${updateRes.status})` };
    }

    return { success: true };
  } catch {
    return { success: false, error: "Failed to reach GitHub API" };
  }
}

async function readBoard(): Promise<KanbanBoard> {
  const redisBoard = await readFromRedis();
  if (redisBoard) return redisBoard;

  const githubBoard = await readFromGitHub();
  if (githubBoard) return githubBoard;

  return readFromFile();
}

async function writeBoard(board: KanbanBoard): Promise<{ success: boolean; error?: string }> {
  const redisOk = await writeToRedis(board);
  if (redisOk) return { success: true };

  return writeToGitHub(board);
}

export async function GET() {
  const board = await readBoard();
  return NextResponse.json(board, {
    headers: { "Cache-Control": "no-store" },
  });
}

export async function POST(request: Request) {
  if (!isValidRoadmapAuth()) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const parsed = boardSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid roadmap board" }, { status: 400 });
  }

  const board: KanbanBoard = parsed.data;
  const result = await writeBoard(board);

  return NextResponse.json(result, {
    status: result.success ? 200 : 500,
    headers: { "Cache-Control": "no-store" },
  });
}
