import { NextResponse } from "next/server";
import {
  ROADMAP_COOKIE_NAME,
  createRoadmapAuthToken,
  isValidRoadmapAuth,
  isValidRoadmapPassword,
  roadmapCookieOptions,
} from "@/lib/roadmap-auth";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const password = typeof body === "object" && body !== null && "password" in body
    ? (body as { password?: unknown }).password
    : undefined;

  if (!isValidRoadmapPassword(password)) {
    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  }

  const response = NextResponse.json({ success: true });

  response.cookies.set(ROADMAP_COOKIE_NAME, createRoadmapAuthToken(), roadmapCookieOptions());

  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.delete(ROADMAP_COOKIE_NAME);
  return response;
}
