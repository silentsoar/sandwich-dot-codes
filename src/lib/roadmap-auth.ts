import { createHash, createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

export const ROADMAP_COOKIE_NAME = "roadmap_auth";

const COOKIE_MAX_AGE = 60 * 60 * 24 * 7;
const DEFAULT_SECRET = "sandwich-codes-roadmap-dev-secret";

export function getRoadmapPassword(): string {
  const password = process.env.ROADMAP_PASSWORD;

  if (process.env.NODE_ENV === "production" && !password) {
    throw new Error("ROADMAP_PASSWORD must be configured in production");
  }

  return password ?? "sandwich";
}

function getAuthSecret(): string {
  return process.env.ROADMAP_AUTH_SECRET
    ?? process.env.NEXTAUTH_SECRET
    ?? process.env.ROADMAP_PASSWORD
    ?? DEFAULT_SECRET;
}

function sign(value: string): string {
  return createHmac("sha256", getAuthSecret()).update(value).digest("base64url");
}

function safeEqual(a: string, b: string): boolean {
  const aBuffer = createHash("sha256").update(a).digest();
  const bBuffer = createHash("sha256").update(b).digest();

  return timingSafeEqual(aBuffer, bBuffer);
}

export function isValidRoadmapPassword(password: unknown): boolean {
  return typeof password === "string" && safeEqual(password, getRoadmapPassword());
}

export function createRoadmapAuthToken(): string {
  const issuedAt = Date.now().toString();
  return `${issuedAt}.${sign(issuedAt)}`;
}

export function isValidRoadmapAuth(): boolean {
  const authCookie = cookies().get(ROADMAP_COOKIE_NAME);
  if (!authCookie) return false;

  const [issuedAt, signature] = authCookie.value.split(".");
  if (!issuedAt || !signature || !safeEqual(signature, sign(issuedAt))) return false;

  const issuedAtMs = Number(issuedAt);
  if (!Number.isFinite(issuedAtMs)) return false;

  return Date.now() - issuedAtMs <= COOKIE_MAX_AGE * 1000;
}

export function roadmapCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict" as const,
    path: "/",
    maxAge: COOKIE_MAX_AGE,
  };
}
