import { NextResponse } from "next/server";
import { fetchWeeklyCommitCount } from "@/lib/github";

export const revalidate = 3600;

export async function GET() {
  const count = await fetchWeeklyCommitCount();
  return NextResponse.json({ count }, {
    headers: {
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=600",
    },
  });
}
