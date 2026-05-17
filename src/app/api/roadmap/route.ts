import { NextResponse } from "next/server";
import { isValidAuth } from "../auth/route";
import { Redis } from "@upstash/redis";

export const revalidate = 0;

const STORAGE_KEY = "roadmap:board";

interface KanbanCard {
  id: string;
  text: string;
}

interface KanbanColumn {
  id: string;
  title: string;
  cards: KanbanCard[];
}

interface KanbanBoard {
  columns: KanbanColumn[];
}

function getRedis(): Redis | null {
  try {
    return new Redis({
      url: process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL ?? "",
      token: process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN ?? "",
    });
  } catch {
    return null;
  }
}

async function readBoard(): Promise<KanbanBoard> {
  const redis = getRedis();
  if (redis) {
    try {
      const data = await redis.get<KanbanBoard>(STORAGE_KEY);
      if (data?.columns) return data;
    } catch {
      // fall through to file
    }
  }

  try {
    const fs = await import("fs");
    const path = await import("path");
    const filePath = path.join(process.cwd(), "content", "roadmap.json");
    const raw = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(raw);
  } catch {
    return { columns: [] };
  }
}

async function writeBoard(board: KanbanBoard): Promise<{ success: boolean; error?: string }> {
  const redis = getRedis();
  if (!redis) {
    return { success: false, error: "No Redis configured — set KV_REST_API_URL and KV_REST_API_TOKEN" };
  }

  try {
    await redis.set(STORAGE_KEY, board);
    return { success: true };
  } catch {
    return { success: false, error: "Failed to write to Redis" };
  }
}

export async function GET() {
  const board = await readBoard();
  return NextResponse.json(board, {
    headers: { "Cache-Control": "no-store" },
  });
}

export async function POST(request: Request) {
  if (!isValidAuth()) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const board: KanbanBoard = await request.json();
  const result = await writeBoard(board);

  return NextResponse.json(result, {
    status: result.success ? 200 : 500,
    headers: { "Cache-Control": "no-store" },
  });
}
