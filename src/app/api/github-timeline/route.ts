import { NextResponse } from "next/server";
import { fetchGitHubTimeline } from "@/lib/github";

export const revalidate = 60;

export async function GET() {
  const events = await fetchGitHubTimeline();
  return NextResponse.json(events, {
    headers: {
      "Cache-Control": "public, s-maxage=60, stale-while-revalidate=30",
    },
  });
}
